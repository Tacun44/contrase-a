// Script para verificar todas las tablas de la base de datos
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

async function checkAllTables() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    const pool = await sql.connect(sqlConfig);
    console.log('✅ Conexión exitosa a la base de datos');

    // Listar todas las tablas
    console.log('\n📋 Listando todas las tablas...');
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME as 'Tabla'
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    
    console.log('🏗️ Tablas encontradas:');
    tablesResult.recordset.forEach(table => {
      console.log(`  - ${table.Tabla}`);
    });

    // Verificar si hay tablas de relación
    console.log('\n🔍 Verificando tablas de relación...');
    const relationTables = tablesResult.recordset.filter(table => 
      table.Tabla.toLowerCase().includes('user') || 
      table.Tabla.toLowerCase().includes('relation') ||
      table.Tabla.toLowerCase().includes('link')
    );

    if (relationTables.length > 0) {
      console.log('🔗 Tablas de relación encontradas:');
      relationTables.forEach(table => {
        console.log(`  - ${table.Tabla}`);
      });
    } else {
      console.log('❌ No se encontraron tablas de relación específicas');
    }

    // Verificar estructura de la tabla passwords más detalladamente
    console.log('\n🔐 Verificando tabla passwords...');
    const passwordsResult = await pool.request().query(`
      SELECT TOP 3 *
      FROM passwords
      ORDER BY id
    `);
    
    if (passwordsResult.recordset.length > 0) {
      console.log('📊 Columnas disponibles en passwords:');
      const firstPassword = passwordsResult.recordset[0];
      Object.keys(firstPassword).forEach(key => {
        console.log(`  - ${key}: ${typeof firstPassword[key]} = ${firstPassword[key]}`);
      });
    }

    await pool.close();
    console.log('\n✅ Verificación completada');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkAllTables();
