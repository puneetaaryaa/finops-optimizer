import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cloud_optimizer',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Verify connection on startup
export const verifyDatabaseConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully.');
    connection.release();
    return true;
  } catch (error: any) {
    console.error('❌ Database Connection Error:');
    console.error(`Please check if your MySQL server is running and database configuration in backend/.env is correct.`);
    console.error(`Details: ${error.message}`);
    return false;
  }
};

export default pool;
