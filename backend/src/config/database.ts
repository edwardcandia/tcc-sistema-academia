import { Pool, PoolClient, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'academia',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
    ...(process.env.NODE_ENV === 'production' && {
        ssl: { rejectUnauthorized: false }
    })
});

pool.on('connect', (client) => {
    client.query("SET client_encoding TO 'UTF8'");
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
    process.exit(-1);
});

const isDev = process.env.NODE_ENV !== 'production';

const logQuery = (text: string, params: any[]): void => {
    if (isDev) {
        console.log('QUERY:', text.replace(/\s+/g, ' ').trim());
        if (params.length) console.log('PARAMS:', params);
    }
};

const query = async <T = any>(text: string, params: any[] = []): Promise<QueryResult<T>> => {
    logQuery(text, params);
    return pool.query(text, params);
};

const getClient = (): Promise<PoolClient> => pool.connect();

const transaction = async <T>(fn: (client: PoolClient) => Promise<T>): Promise<T> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

export default { query, getClient, pool, transaction };