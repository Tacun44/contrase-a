// Script para verificar usuarios en la base de datos desde Node.js
const sql = require('mssql');
require('dotenv').config();

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function checkUsers() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    console.log('📊 Configuración:', {
      server: sqlConfig.server,
      database: sqlConfig.database,
      port: sqlConfig.port,
      user: sqlConfig.user
    });

    const pool = await sql.connect(sqlConfig);
    console.log('✅ Conexión exitosa a la base de datos');

    // Verificar estructura de la tabla users
    console.log('\n📋 Verificando estructura de la tabla users...');
    const structureResult = await pool.request().query(`
      SELECT 
        COLUMN_NAME as 'Columna',
        DATA_TYPE as 'Tipo',
        IS_NULLABLE as 'Permite_NULL'
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('🏗️ Estructura de la tabla users:');
    structureResult.recordset.forEach(col => {
      console.log(`  - ${col.Columna}: ${col.Tipo} (${col.Permite_NULL === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // Contar usuarios
    console.log('\n👥 Contando usuarios...');
    const countResult = await pool.request().query('SELECT COUNT(*) as total FROM users');
    const totalUsers = countResult.recordset[0].total;
    console.log(`📊 Total de usuarios: ${totalUsers}`);

          // Mostrar todos los usuarios
      if (totalUsers > 0) {
        console.log('\n👤 Lista de usuarios:');
        const usersResult = await pool.request().query(`
          SELECT 
            id,
            username,
            role,
            createdAt,
            CASE 
              WHEN LEN(password) > 0 THEN 'Contraseña configurada'
              ELSE 'Sin contraseña'
            END as password_status
          FROM users
          ORDER BY id
        `);
        
        usersResult.recordset.forEach(user => {
          console.log(`  ${user.id}. ${user.username} - ${user.role} - ${user.password_status} - Creado: ${user.createdAt}`);
        });

        // Buscar específicamente el usuario ositopanda
        console.log('\n🔍 Buscando usuario ositopanda...');
        const ositopandaResult = await pool.request().query(`
          SELECT 
            id,
            username,
            role,
            createdAt
          FROM users 
          WHERE username LIKE '%ositopanda%' 
             OR username LIKE '%osito%'
        `);
        
        if (ositopandaResult.recordset.length > 0) {
          console.log('✅ Usuario ositopanda encontrado:');
          ositopandaResult.recordset.forEach(user => {
            console.log(`  - ID: ${user.id}, Username: ${user.username}, Role: ${user.role}, Creado: ${user.createdAt}`);
          });
        } else {
          console.log('❌ Usuario ositopanda NO encontrado');
        }
      }

    await pool.close();
    console.log('\n✅ Verificación completada');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkUsers();
