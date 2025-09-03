-- Script para insertar usuarios de prueba en la tabla users
-- Ejecutar este script en SQL Server Management Studio

USE PasswordManager;
GO

-- Verificar si la tabla users existe, si no, crearla
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) NOT NULL UNIQUE,
        email NVARCHAR(100) NOT NULL UNIQUE,
        password NVARCHAR(255) NOT NULL,
        full_name NVARCHAR(100),
        role NVARCHAR(20) DEFAULT 'user',
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
    );
    PRINT 'Tabla users creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla users ya existe';
END
GO

-- Verificar si la tabla passwords existe, si no, crearla
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='passwords' AND xtype='U')
BEGIN
    CREATE TABLE passwords (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        title NVARCHAR(100) NOT NULL,
        username NVARCHAR(100) NOT NULL,
        password NVARCHAR(500) NOT NULL,
        website NVARCHAR(200),
        notes NVARCHAR(500),
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    PRINT 'Tabla passwords creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla passwords ya existe';
END
GO

-- Insertar usuarios de prueba (las contraseñas están hasheadas con bcrypt)
-- Contraseña: 1033096191
IF NOT EXISTS (SELECT * FROM users WHERE username = 'emmanuel')
BEGIN
    INSERT INTO users (username, email, password, full_name, role) VALUES 
    ('emmanuel', 'emmanuel@empresa.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Emmanuel', 'admin');
    PRINT 'Usuario emmanuel insertado';
END
ELSE
BEGIN
    PRINT 'Usuario emmanuel ya existe';
END
GO

-- Contraseña: 1003249588  
IF NOT EXISTS (SELECT * FROM users WHERE username = 'victor')
BEGIN
    INSERT INTO users (username, email, password, full_name, role) VALUES 
    ('victor', 'victor@empresa.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Victor Ding', 'admin');
    PRINT 'Usuario victor insertado';
END
ELSE
BEGIN
    PRINT 'Usuario victor ya existe';
END
GO

-- Insertar algunas credenciales de prueba para emmanuel (user_id = 1)
IF NOT EXISTS (SELECT * FROM passwords WHERE user_id = 1 AND title = 'Gmail')
BEGIN
    INSERT INTO passwords (user_id, title, username, password, website, notes) VALUES 
    (1, 'Gmail', 'emmanuel@gmail.com', 'mi_contraseña_gmail', 'https://mail.google.com', 'Cuenta personal de Gmail');
    PRINT 'Credencial Gmail para emmanuel insertada';
END
GO

IF NOT EXISTS (SELECT * FROM passwords WHERE user_id = 1 AND title = 'Facebook')
BEGIN
    INSERT INTO passwords (user_id, title, username, password, website, notes) VALUES 
    (1, 'Facebook', 'emmanuel_fb', 'mi_contraseña_facebook', 'https://facebook.com', 'Cuenta de Facebook personal');
    PRINT 'Credencial Facebook para emmanuel insertada';
END
GO

IF NOT EXISTS (SELECT * FROM passwords WHERE user_id = 1 AND title = 'GitHub')
BEGIN
    INSERT INTO passwords (user_id, title, username, password, website, notes) VALUES 
    (1, 'GitHub', 'emmanuel_dev', 'mi_contraseña_github', 'https://github.com', 'Cuenta de desarrollo');
    PRINT 'Credencial GitHub para emmanuel insertada';
END
GO

-- Insertar algunas credenciales de prueba para victor (user_id = 2)
IF NOT EXISTS (SELECT * FROM passwords WHERE user_id = 2 AND title = 'LinkedIn')
BEGIN
    INSERT INTO passwords (user_id, title, username, password, website, notes) VALUES 
    (2, 'LinkedIn', 'victor.ding@empresa.com', 'victor_linkedin_2024', 'https://linkedin.com', 'Perfil profesional de Victor');
    PRINT 'Credencial LinkedIn para victor insertada';
END
GO

IF NOT EXISTS (SELECT * FROM passwords WHERE user_id = 2 AND title = 'Slack')
BEGIN
    INSERT INTO passwords (user_id, title, username, password, website, notes) VALUES 
    (2, 'Slack', 'victor.ding', 'victor_slack_work', 'https://slack.com', 'Cuenta de trabajo en Slack');
    PRINT 'Credencial Slack para victor insertada';
END
GO

IF NOT EXISTS (SELECT * FROM passwords WHERE user_id = 2 AND title = 'GitHub')
BEGIN
    INSERT INTO passwords (user_id, title, username, password, website, notes) VALUES 
    (2, 'GitHub', 'victor.ding.dev', 'victor_github_2024', 'https://github.com', 'Cuenta de desarrollo de Victor');
    PRINT 'Credencial GitHub para victor insertada';
END
GO

PRINT 'Script completado exitosamente';
PRINT 'Usuarios disponibles:';
PRINT '- emmanuel / 1033096191';
PRINT '- victor / 1003249588';
GO
