// src/lib/db.js
import mysql from 'mysql2/promise';

let pool;

/**
 * Lazily creates and returns the database connection pool.
 * This function ensures the pool is only created once.
 */
function getPool() {
  if (pool) {
    return pool;
  }

  // Create the pool now. By this point, the environment variables are loaded.
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  return pool;
}

// This is now our main export. It's an object with a query method.
// When query is called, it calls getPool() to ensure the pool exists.
export const db = {
  query: (...args) => getPool().query(...args),
  getConnection: () => getPool().getConnection()
};