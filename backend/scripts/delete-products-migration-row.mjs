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
        console.log('Deleting migration row for CreateProductsTable1685020000002...');
        const [result] = await conn.query("DELETE FROM migrations WHERE name = 'CreateProductsTable1685020000002'");
        console.log('Deleted:', result);
    } catch (err) {
        console.error('Error deleting migration row:', err);
        process.exitCode = 2;
    } finally {
        await conn.end();
    }
}

main();
