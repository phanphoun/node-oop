import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import path from 'path';

// load backend .env (use CWD since script runs in backend)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || undefined,
        multipleStatements: false,
    });

    try {
        console.log('Dropping products table if exists...');
        await conn.query('DROP TABLE IF EXISTS `products`;');
        console.log('Dropped (or did not exist).');
    } catch (err) {
        console.error('Error dropping table:', err);
        process.exitCode = 2;
    } finally {
        await conn.end();
    }
}

main();
