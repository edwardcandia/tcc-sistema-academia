// backend/src/config/database.ts
import { Pool, PoolClient, QueryResult } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'academia',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  // SSL configuration for production environments
  ...(process.env.NODE_ENV === 'production' && {
    ssl: {
      rejectUnauthorized: false // For Heroku or similar platforms
    }
  })
});

// Listen for connection events
pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to log queries in development
const logQuery = (text: string, params: any[]): void => {
  if (process.env.NODE_ENV !== 'production') {
    const queryString = text.replace(/\s+/g, ' ').trim();
    console.log('EXECUTING QUERY:', queryString);
    console.log('PARAMETERS:', params);
  }
};

// Custom query function with logging
const query = async <T = any>(text: string, params: any[] = []): Promise<QueryResult<T>> => {
  logQuery(text, params);
  return await pool.query(text, params);
};

// Get a client from the pool
const getClient = async (): Promise<PoolClient> => {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  
  // Monkey patch the query method to add logging
  client.query = async (...args: any[]) => {
    const text = args[0];
    const params = args[1];
    const actualText = typeof text === 'string' ? text : (text && text.text) || '';
    const actualParams = params || (text && text.values) || [];
    logQuery(actualText, actualParams);
    return await originalQuery(...args);
  };
  
  return client;
};

// Export the database connection
export default {
  query,
  getClient,
  pool,
  transaction: async <T>(fn: (client: any) => Promise<T>): Promise<T> => {
    const client = await getClient();
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
  }
};