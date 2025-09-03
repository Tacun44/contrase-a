-- Script para contar usuarios en la base de datos
-- Ejecutar este script en SQL Server Management Studio

USE PasswordManager;
GO

-- Contar total de usuarios
PRINT '=== TOTAL DE USUARIOS ===';
SELECT COUNT(*) as 'Total_Usuarios' FROM users;
GO

-- Mostrar todos los usuarios
PRINT '=== LISTA DE USUARIOS ===';
SELECT 
    id,
    username,
    email,
    role,
    CASE 
        WHEN LEN(password) > 0 THEN 'Contraseña configurada'
        ELSE 'Sin contraseña'
    END as 'Estado_Contraseña'
FROM users
ORDER BY id;
GO

-- Buscar específicamente el usuario ositopanda
PRINT '=== BUSCANDO USUARIO OSITOPANDA ===';
SELECT 
    id,
    username,
    email,
    role
FROM users 
WHERE email LIKE '%ositopanda%' 
   OR username LIKE '%ositopanda%'
   OR email LIKE '%osito%';
GO

-- Verificar estructura de la tabla users
PRINT '=== ESTRUCTURA DE LA TABLA USERS ===';
SELECT 
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'Tipo',
    IS_NULLABLE as 'Permite_NULL'
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;
GO
