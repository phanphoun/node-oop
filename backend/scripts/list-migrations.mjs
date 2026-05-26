import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || undefined,
    });

    try {
        const [rows] = await conn.query('SELECT * FROM migrations ORDER BY id DESC');
        console.log(rows);
    } catch (err) {
        console.error('Error querying migrations:', err);
        process.exitCode = 2;
    } finally {
        await conn.end();
    }
}

main();
