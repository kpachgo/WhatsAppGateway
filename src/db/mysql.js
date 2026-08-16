const mysql = require('mysql2/promise');
const env = require('../config/env');
const pool = mysql.createPool({ ...env.mysql, waitForConnections: true, connectionLimit: 10, timezone: 'Z' });
module.exports = { pool, query: (sql, params) => pool.execute(sql, params) };
