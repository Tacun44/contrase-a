// Script para agregar el usuario ositopanda a la base de datos
const sql = require('mssql');
const bcrypt = require('bcrypt');
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

async function addOsitopandaUser() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    const pool = await sql.connect(sqlConfig);
    console.log('✅ Conexión exitosa a la base de datos');

    // Verificar si el usuario ya existe
    console.log('\n🔍 Verificando si el usuario ya existe...');
    const existingUser = await pool.request()
      .input('username', 'ositopanda.private@gmail.com')
      .query('SELECT id FROM users WHERE username = @username');

    if (existingUser.recordset.length > 0) {
      console.log('⚠️ El usuario ositopanda.private@gmail.com ya existe en la base de datos');
      await pool.close();
      return;
    }

    // Hash de la contraseña
    console.log('\n🔐 Generando hash de la contraseña...');
    const hashedPassword = await bcrypt.hash('1033096191', 10);
    console.log('✅ Hash generado exitosamente');

    // Insertar el nuevo usuario
    console.log('\n👤 Insertando nuevo usuario...');
    const result = await pool.request()
      .input('username', 'ositopanda.private@gmail.com')
      .input('password', hashedPassword)
      .input('role', 'admin')
      .query(`
        INSERT INTO users (username, password, role, createdAt)
        OUTPUT INSERTED.id, INSERTED.username, INSERTED.role
        VALUES (@username, @password, @role, GETDATE())
      `);

    const newUser = result.recordset[0];
    console.log('✅ Usuario creado exitosamente:');
    console.log(`  - ID: ${newUser.id}`);
    console.log(`  - Username: ${newUser.username}`);
    console.log(`  - Role: ${newUser.role}`);
    console.log(`  - Contraseña: 1033096191`);

    await pool.close();
    console.log('\n🎉 Usuario ositopanda agregado exitosamente a la base de datos');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

addOsitopandaUser();
