// Script para asignar credenciales a Emmanuel
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

async function assignCredentialsToEmmanuel() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    const pool = await sql.connect(sqlConfig);
    console.log('✅ Conexión exitosa a la base de datos');

    const emmanuelId = 9; // ID de Emmanuel en la base de datos

    // Verificar credenciales disponibles
    console.log('\n🔍 Verificando credenciales disponibles...');
    const passwordsResult = await pool.request().query(`
      SELECT id, title, username, website, category
      FROM passwords
      ORDER BY id
    `);
    
    console.log('📋 Credenciales disponibles:');
    passwordsResult.recordset.forEach(pwd => {
      console.log(`  - ID: ${pwd.id} - ${pwd.title} - ${pwd.username} - ${pwd.website} - ${pwd.category}`);
    });

    // Verificar qué credenciales ya tiene Emmanuel
    console.log('\n👤 Verificando credenciales actuales de Emmanuel...');
    const emmanuelCredentials = await pool.request()
      .input('user_id', emmanuelId)
      .query(`
        SELECT up.passwordId, p.title, p.username
        FROM user_passwords up
        INNER JOIN passwords p ON up.passwordId = p.id
        WHERE up.userId = @user_id
      `);
    
    if (emmanuelCredentials.recordset.length > 0) {
      console.log('🔑 Credenciales actuales de Emmanuel:');
      emmanuelCredentials.recordset.forEach(cred => {
        console.log(`  - ${cred.title} (${cred.username})`);
      });
    } else {
      console.log('❌ Emmanuel no tiene credenciales asignadas');
    }

    // Asignar algunas credenciales a Emmanuel
    console.log('\n➕ Asignando credenciales a Emmanuel...');
    
    // Asignar credencial de GitHub (Ositopanda)
    try {
      await pool.request()
        .input('user_id', emmanuelId)
        .input('password_id', 19) // ID de Ositopanda
        .query(`
          INSERT INTO user_passwords (userId, passwordId, assignedAt)
          VALUES (@user_id, @password_id, GETDATE())
        `);
      console.log('✅ Credencial "Ositopanda" asignada a Emmanuel');
    } catch (err) {
      if (err.message.includes('duplicate')) {
        console.log('⚠️ La credencial "Ositopanda" ya está asignada a Emmanuel');
      } else {
        console.log('❌ Error al asignar "Ositopanda":', err.message);
      }
    }

    // Asignar credencial de Agente IA
    try {
      await pool.request()
        .input('user_id', emmanuelId)
        .input('password_id', 20) // ID de Agente_IA_Mobilsoft
        .query(`
          INSERT INTO user_passwords (userId, passwordId, assignedAt)
          VALUES (@user_id, @password_id, GETDATE())
        `);
      console.log('✅ Credencial "Agente_IA_Mobilsoft" asignada a Emmanuel');
    } catch (err) {
      if (err.message.includes('duplicate')) {
        console.log('⚠️ La credencial "Agente_IA_Mobilsoft" ya está asignada a Emmanuel');
      } else {
        console.log('❌ Error al asignar "Agente_IA_Mobilsoft":', err.message);
      }
    }

    // Verificar credenciales finales de Emmanuel
    console.log('\n🔍 Verificando credenciales finales de Emmanuel...');
    const finalCredentials = await pool.request()
      .input('user_id', emmanuelId)
      .query(`
        SELECT up.passwordId, p.title, p.username, p.website, p.category
        FROM user_passwords up
        INNER JOIN passwords p ON up.passwordId = p.id
        WHERE up.userId = @user_id
        ORDER BY p.id
      `);
    
    if (finalCredentials.recordset.length > 0) {
      console.log('🎉 Credenciales finales de Emmanuel:');
      finalCredentials.recordset.forEach(cred => {
        console.log(`  - ${cred.title} (${cred.username}) - ${cred.website} - ${cred.category}`);
      });
    } else {
      console.log('❌ Emmanuel sigue sin credenciales');
    }

    await pool.close();
    console.log('\n✅ Proceso completado');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

assignCredentialsToEmmanuel();
