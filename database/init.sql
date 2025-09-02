-- Crear la base de datos si no existe
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'PasswordManager')
BEGIN
    CREATE DATABASE PasswordManager;
END
GO

USE PasswordManager;
GO

-- Tabla de Usuarios
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Usuarios')
BEGIN
    CREATE TABLE Usuarios (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL,
        correo NVARCHAR(100) NOT NULL UNIQUE,
        contraseña_hash NVARCHAR(255) NOT NULL,
        rol NVARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'invitado')),
        fecha_creacion DATETIME DEFAULT GETDATE(),
        fecha_actualizacion DATETIME DEFAULT GETDATE()
    );
END
GO

-- Tabla de Credenciales
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Credenciales')
BEGIN
    CREATE TABLE Credenciales (
        id INT IDENTITY(1,1) PRIMARY KEY,
        servicio NVARCHAR(100) NOT NULL,
        usuario NVARCHAR(100) NOT NULL,
        contraseña_encriptada NVARCHAR(255) NOT NULL,
        notas NVARCHAR(MAX),
        fecha_creacion DATETIME DEFAULT GETDATE(),
        fecha_actualizacion DATETIME DEFAULT GETDATE()
    );
END
GO

-- Tabla de Accesos
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Accesos')
BEGIN
    CREATE TABLE Accesos (
        id_usuario INT NOT NULL,
        id_credencial INT NOT NULL,
        fecha_asignacion DATETIME DEFAULT GETDATE(),
        PRIMARY KEY (id_usuario, id_credencial),
        FOREIGN KEY (id_usuario) REFERENCES Usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (id_credencial) REFERENCES Credenciales(id) ON DELETE CASCADE
    );
END
GO

-- Tabla de Logs
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Logs')
BEGIN
    CREATE TABLE Logs (
        id INT IDENTITY(1,1) PRIMARY KEY,
        id_usuario INT,
        accion NVARCHAR(100) NOT NULL,
        detalles NVARCHAR(MAX),
        fecha DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (id_usuario) REFERENCES Usuarios(id) ON DELETE SET NULL
    );
END
GO

-- Procedimiento almacenado para crear un usuario
CREATE OR ALTER PROCEDURE sp_CrearUsuario
    @nombre NVARCHAR(100),
    @correo NVARCHAR(100),
    @contraseña_hash NVARCHAR(255),
    @rol NVARCHAR(20)
AS
BEGIN
    BEGIN TRY
        INSERT INTO Usuarios (nombre, correo, contraseña_hash, rol)
        VALUES (@nombre, @correo, @contraseña_hash, @rol);
        
        SELECT SCOPE_IDENTITY() AS id;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- Procedimiento almacenado para autenticar usuario
CREATE OR ALTER PROCEDURE sp_AutenticarUsuario
    @usuario_o_correo NVARCHAR(100)
AS
BEGIN
    SELECT id, nombre, correo, contraseña_hash, rol
    FROM Usuarios
    WHERE correo = @usuario_o_correo OR nombre = @usuario_o_correo;
END
GO

-- Procedimiento almacenado para crear credencial
CREATE OR ALTER PROCEDURE sp_CrearCredencial
    @servicio NVARCHAR(100),
    @usuario NVARCHAR(100),
    @contraseña_encriptada NVARCHAR(255),
    @notas NVARCHAR(MAX)
AS
BEGIN
    BEGIN TRY
        INSERT INTO Credenciales (servicio, usuario, contraseña_encriptada, notas)
        VALUES (@servicio, @usuario, @contraseña_encriptada, @notas);
        
        SELECT SCOPE_IDENTITY() AS id;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- Procedimiento almacenado para asignar acceso
CREATE OR ALTER PROCEDURE sp_AsignarAcceso
    @id_usuario INT,
    @id_credencial INT
AS
BEGIN
    BEGIN TRY
        INSERT INTO Accesos (id_usuario, id_credencial)
        VALUES (@id_usuario, @id_credencial);
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- Procedimiento almacenado para obtener credenciales por usuario
CREATE OR ALTER PROCEDURE sp_ObtenerCredencialesPorUsuario
    @id_usuario INT
AS
BEGIN
    SELECT c.*
    FROM Credenciales c
    INNER JOIN Accesos a ON c.id = a.id_credencial
    WHERE a.id_usuario = @id_usuario;
END
GO

-- Procedimiento almacenado para registrar log
CREATE OR ALTER PROCEDURE sp_RegistrarLog
    @id_usuario INT,
    @accion NVARCHAR(100),
    @detalles NVARCHAR(MAX) = NULL
AS
BEGIN
    INSERT INTO Logs (id_usuario, accion, detalles)
    VALUES (@id_usuario, @accion, @detalles);
END
GO

-- Crear usuarios iniciales
-- Nota: En producción, esto debería hacerse de forma más segura

-- Usuario Administrador (contraseña: admin123)
INSERT INTO Usuarios (nombre, correo, contraseña_hash, rol)
SELECT 'Administrador', 'admin@empresa.com', 
       '$2b$10$Wa/CKS2txdJEjwpxZxL2u.rufh7eduKgzQD1lo4u5f3LUiCh7.o9O', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM Usuarios WHERE correo = 'admin@empresa.com');

-- Usuario Emmanuel (contraseña: emmanuel123)
INSERT INTO Usuarios (nombre, correo, contraseña_hash, rol)
SELECT 'emmanuel', 'emmanuel@empresa.com', 
       '$2b$10$SYfleCfwxm2T7qo5uzRJKuSVfRiMFRsCc8ORMLFRs56gfBjt9v1x2', 'invitado'
WHERE NOT EXISTS (SELECT 1 FROM Usuarios WHERE nombre = 'emmanuel');
GO 