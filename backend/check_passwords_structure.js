// Script para verificar la estructura real de la tabla passwords
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

async function checkPasswordsStructure() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    const pool = await sql.connect(sqlConfig);
    console.log('✅ Conexión exitosa a la base de datos');

    // Verificar estructura de la tabla passwords
    console.log('\n📋 Verificando estructura de la tabla passwords...');
    const structureResult = await pool.request().query(`
      SELECT 
        COLUMN_NAME as 'Columna',
        DATA_TYPE as 'Tipo',
        IS_NULLABLE as 'Permite_NULL'
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'passwords'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('🏗️ Estructura de la tabla passwords:');
    structureResult.recordset.forEach(col => {
      console.log(`  - ${col.Columna}: ${col.Tipo} (${col.Permite_NULL === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // Contar total de credenciales
    console.log('\n🔑 Contando credenciales...');
    const countResult = await pool.request().query('SELECT COUNT(*) as total FROM passwords');
    const totalPasswords = countResult.recordset[0].total;
    console.log(`📊 Total de credenciales: ${totalPasswords}`);

    // Mostrar algunas credenciales de ejemplo
    if (totalPasswords > 0) {
      console.log('\n🔐 Ejemplos de credenciales:');
      const passwordsResult = await pool.request().query(`
        SELECT TOP 5 *
        FROM passwords
        ORDER BY id
      `);
      
      passwordsResult.recordset.forEach(pwd => {
        console.log(`  ID: ${pwd.id} - ${pwd.title || 'Sin título'} - Usuario: ${pwd.username || 'Sin usuario'}`);
        // Mostrar todas las columnas disponibles
        Object.keys(pwd).forEach(key => {
          console.log(`    ${key}: ${pwd[key]}`);
        });
        console.log('  ---');
      });
    }

    await pool.close();
    console.log('\n✅ Verificación completada');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkPasswordsStructure();
