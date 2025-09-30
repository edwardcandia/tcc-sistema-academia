// backend/src/config/database.js
const { Client } = require('pg');
require('dotenv').config();

const connectionConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

const db = {
  query: async (text, params) => {
    const client = new Client(connectionConfig);
    try {
      await client.connect();
      const res = await client.query(text, params);
      return res;
    } finally {
      await client.end();
    }
  },
};

module.exports = db;