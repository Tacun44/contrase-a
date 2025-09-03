-- Script para crear la base de datos y tablas del Password Manager
-- Ejecutar este script en SQL Server Management Studio

-- Crear la base de datos
CREATE DATABASE PasswordManager;
GO

-- Usar la base de datos
USE PasswordManager;
GO

-- Crear tabla de usuarios
CREATE TABLE Usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(50) NOT NULL,
    nombre_completo NVARCHAR(100),
    correo NVARCHAR(100) NOT NULL UNIQUE,
    contraseña NVARCHAR(255) NOT NULL,
    rol NVARCHAR(20) DEFAULT 'user',
    fecha_creacion DATETIME DEFAULT GETDATE(),
    fecha_actualizacion DATETIME DEFAULT GETDATE()
);
GO

-- Crear tabla de credenciales
CREATE TABLE Credenciales (
    id INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT NOT NULL,
    servicio NVARCHAR(100) NOT NULL,
    usuario NVARCHAR(100) NOT NULL,
    contraseña NVARCHAR(500) NOT NULL,
    fecha_creacion DATETIME DEFAULT GETDATE(),
    fecha_actualizacion DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id) ON DELETE CASCADE
);
GO

-- Crear stored procedure para autenticar usuario
CREATE PROCEDURE sp_AutenticarUsuario
    @usuario_o_correo NVARCHAR(100)
AS
BEGIN
    SELECT id, nombre, nombre_completo, correo, contraseña, rol
    FROM Usuarios 
    WHERE nombre = @usuario_o_correo 
       OR correo = @usuario_o_correo 
       OR nombre_completo = @usuario_o_correo;
END
GO

-- Crear stored procedure para crear credencial
CREATE PROCEDURE sp_CrearCredencial
    @id_usuario INT,
    @servicio NVARCHAR(100),
    @usuario NVARCHAR(100),
    @contraseña NVARCHAR(500)
AS
BEGIN
    INSERT INTO Credenciales (id_usuario, servicio, usuario, contraseña)
    VALUES (@id_usuario, @servicio, @usuario, @contraseña);
END
GO

-- Crear stored procedure para obtener credenciales por usuario
CREATE PROCEDURE sp_ObtenerCredencialesPorUsuario
    @id_usuario INT
AS
BEGIN
    SELECT id, servicio, usuario, contraseña, fecha_creacion
    FROM Credenciales 
    WHERE id_usuario = @id_usuario
    ORDER BY fecha_creacion DESC;
END
GO

-- Crear stored procedure para eliminar credencial
CREATE PROCEDURE sp_EliminarCredencial
    @id_credencial INT,
    @id_usuario INT
AS
BEGIN
    DELETE FROM Credenciales 
    WHERE id = @id_credencial AND id_usuario = @id_usuario;
END
GO

-- Insertar usuarios de prueba (las contraseñas están hasheadas con bcrypt)
-- Contraseña: 1033096191
INSERT INTO Usuarios (nombre, nombre_completo, correo, contraseña, rol) VALUES 
('emmanuel', 'Emmanuel', 'emmanuel@empresa.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Contraseña: 1003249588  
INSERT INTO Usuarios (nombre, nombre_completo, correo, contraseña, rol) VALUES 
('victor', 'Victor Ding', 'victor@empresa.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insertar algunas credenciales de prueba
INSERT INTO Credenciales (id_usuario, servicio, usuario, contraseña) VALUES 
(1, 'Gmail', 'emmanuel@gmail.com', 'mi_contraseña_gmail'),
(1, 'Facebook', 'emmanuel_fb', 'mi_contraseña_facebook'),
(1, 'GitHub', 'emmanuel_dev', 'mi_contraseña_github'),
(2, 'LinkedIn', 'victor.ding@empresa.com', 'victor_linkedin_2024'),
(2, 'Slack', 'victor.ding', 'victor_slack_work'),
(2, 'GitHub', 'victor.ding.dev', 'victor_github_2024');

PRINT 'Base de datos creada exitosamente con usuarios y credenciales de prueba';
GO
