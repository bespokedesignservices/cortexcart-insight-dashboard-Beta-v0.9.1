const mysql = require('mysql2/promise');
const crypto = require('crypto');
const readline = require('readline');

// --- IMPORTANT: Manually add your database credentials here for this one-time script ---
const dbConfig = {
    host: 'localhost',
    user: 'admin_cortexcart',
    password: '{Y/+9qG5?{Z0nfDq',
    database: 'admin_cortexcart'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function addAdmin() {
  rl.question('Enter admin email: ', async (email) => {
    rl.question('Enter admin password: ', async (password) => {
      const hashedPassword = hashPassword(password);
      
      let connection;
      try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute(
          'INSERT INTO admins (email, password, role) VALUES (?, ?, ?)',
          [email, hashedPassword, 'superadmin']
        );
        console.log(`Admin user ${email} created successfully!`);
      } catch (error) {
        console.error('Failed to create admin user:', error);
      } finally {
        if (connection) await connection.end();
        rl.close();
      }
    });
  });
}

addAdmin();
