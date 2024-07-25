import mysql from 'mysql2';

const config: mysql.ConnectionOptions = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    multipleStatements: true,
};

const pool = mysql.createPool(config).promise();

export default pool;
