-- Script para verificar la estructura real de la base de datos
-- Ejecutar este script en SQL Server Management Studio

USE PasswordManager;
GO

-- Verificar estructura de la tabla users
PRINT '=== ESTRUCTURA DE LA TABLA USERS ===';
SELECT 
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'Tipo',
    IS_NULLABLE as 'Permite NULL',
    COLUMN_DEFAULT as 'Valor por Defecto'
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;
GO

-- Verificar estructura de la tabla passwords
PRINT '=== ESTRUCTURA DE LA TABLA PASSWORDS ===';
SELECT 
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'Tipo',
    IS_NULLABLE as 'Permite NULL',
    COLUMN_DEFAULT as 'Valor por Defecto'
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'passwords'
ORDER BY ORDINAL_POSITION;
GO

-- Verificar datos existentes en users
PRINT '=== USUARIOS EXISTENTES ===';
SELECT TOP 10 * FROM users;
GO

-- Verificar datos existentes en passwords
PRINT '=== CREDENCIALES EXISTENTES ===';
SELECT TOP 10 * FROM passwords;
GO

-- Buscar el usuario ositopanda
PRINT '=== BUSCANDO USUARIO OSITOPANDA ===';
SELECT * FROM users WHERE email LIKE '%ositopanda%' OR username LIKE '%ositopanda%';
GO
