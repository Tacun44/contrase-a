// Script para verificar la estructura de la tabla user_passwords
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

async function checkUserPasswords() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    const pool = await sql.connect(sqlConfig);
    console.log('✅ Conexión exitosa a la base de datos');

    // Verificar estructura de la tabla user_passwords
    console.log('\n📋 Verificando estructura de la tabla user_passwords...');
    const structureResult = await pool.request().query(`
      SELECT 
        COLUMN_NAME as 'Columna',
        DATA_TYPE as 'Tipo',
        IS_NULLABLE as 'Permite_NULL'
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'user_passwords'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('🏗️ Estructura de la tabla user_passwords:');
    if (structureResult.recordset.length > 0) {
      structureResult.recordset.forEach(col => {
        console.log(`  - ${col.Columna}: ${col.Tipo} (${col.Permite_NULL === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
    } else {
      console.log('  ❌ La tabla user_passwords no tiene columnas o no existe');
    }

    // Verificar datos en user_passwords
    console.log('\n🔍 Verificando datos en user_passwords...');
    const dataResult = await pool.request().query(`
      SELECT TOP 10 *
      FROM user_passwords
      ORDER BY userId
    `);
    
    if (dataResult.recordset.length > 0) {
      console.log(`📊 Encontrados ${dataResult.recordset.length} registros en user_passwords:`);
      dataResult.recordset.forEach(record => {
        console.log(`  - ID: ${record.id}`);
        Object.keys(record).forEach(key => {
          console.log(`    ${key}: ${record[key]}`);
        });
        console.log('  ---');
      });
    } else {
      console.log('❌ No hay datos en user_passwords');
    }

    // Verificar si hay alguna relación directa en passwords
    console.log('\n🔐 Verificando si passwords tiene relación con usuarios...');
    const passwordsResult = await pool.request().query(`
      SELECT TOP 5 id, title, username, website, category
      FROM passwords
      ORDER BY id
    `);
    
    console.log('📋 Credenciales disponibles:');
    passwordsResult.recordset.forEach(pwd => {
      console.log(`  - ID: ${pwd.id} - ${pwd.title} - ${pwd.username} - ${pwd.website} - ${pwd.category}`);
    });

    await pool.close();
    console.log('\n✅ Verificación completada');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkUserPasswords();
