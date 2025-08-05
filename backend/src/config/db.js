import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';

// ✅ Create a MySQL connection pool
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DB || '',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 25,
    queueLimit: 0,
    multipleStatements: true,
    timezone: '+05:30'
});

// ✅ Check initial connection
pool.getConnection()
    .then(conn => {
        console.log('✅ MySQL pool connected successfully!');
        conn.release();
    })
    .catch(err => {
        console.error('❌ MySQL pool connection failed:');
        console.error(err);
        process.exit(1);
    });

// ✅ Graceful shutdown handler
const closePool = () => {
    console.log('\n🔁 Closing MySQL pool...');
    pool.end()
        .then(() => {
            console.log('✅ MySQL pool closed.');
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ Error closing MySQL pool:');
            console.error(err);
            process.exit(1);
        });
};

// ⏹ Handle shutdown signals
process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);
process.on('exit', closePool);

// ✅ Export the pool
export default pool;
