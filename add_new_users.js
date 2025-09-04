const bcrypt = require('bcrypt');
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

async function addNewUsers() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    const pool = await sql.connect(sqlConfig);
    console.log('✅ Conexión exitosa a la base de datos');

    // Definir los nuevos usuarios
    const newUsers = [
      {
        username: 'luisfernando',
        email: 'luis.fernando@empresa.com',
        full_name: 'Luis Fernando',
        password: 'luis123',
        role: 'user'
      },
      {
        username: 'jhon',
        email: 'jhon@empresa.com',
        full_name: 'Jhon',
        password: 'jhon123',
        role: 'user'
      },
      {
        username: 'jose',
        email: 'jose@empresa.com',
        full_name: 'Jose',
        password: 'jose123',
        role: 'user'
      }
    ];

    for (const user of newUsers) {
      console.log(`\n🔍 Verificando si el usuario ${user.username} ya existe...`);
      
      // Verificar si el usuario ya existe
      const existingUser = await pool.request()
        .input('username', user.username)
        .query('SELECT id FROM users WHERE username = @username');

      if (existingUser.recordset.length > 0) {
        console.log(`⚠️ El usuario ${user.username} ya existe en la base de datos`);
        continue;
      }

      // Hash de la contraseña
      console.log(`🔐 Generando hash de la contraseña para ${user.username}...`);
      const hashedPassword = await bcrypt.hash(user.password, 10);
      console.log('✅ Hash generado exitosamente');

      // Insertar el nuevo usuario
      console.log(`👤 Insertando nuevo usuario ${user.username}...`);
      const result = await pool.request()
        .input('username', user.username)
        .input('email', user.email)
        .input('password', hashedPassword)
        .input('full_name', user.full_name)
        .input('role', user.role)
        .query(`
          INSERT INTO users (username, email, password, full_name, role, created_at, updated_at)
          OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.full_name, INSERTED.role
          VALUES (@username, @email, @password, @full_name, @role, GETDATE(), GETDATE())
        `);

      const newUser = result.recordset[0];
      console.log('✅ Usuario creado exitosamente:');
      console.log(`  - ID: ${newUser.id}`);
      console.log(`  - Username: ${newUser.username}`);
      console.log(`  - Email: ${newUser.email}`);
      console.log(`  - Full Name: ${newUser.full_name}`);
      console.log(`  - Role: ${newUser.role}`);
      console.log(`  - Contraseña: ${user.password}`);
    }

    await pool.close();
    console.log('\n🎉 Proceso completado exitosamente');
    console.log('\n📋 Resumen de usuarios agregados:');
    console.log('- luisfernando / luis123');
    console.log('- jhon / jhon123');
    console.log('- jose / jose123');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addNewUsers();
