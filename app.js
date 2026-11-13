const express = require('express');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();

app.use(helmet());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'shopcart',
  user: process.env.DB_USER || 'shopcart_user',
  password: process.env.DB_PASSWORD
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    application: 'ShopCart API'
  });
});

// Database health check
app.get('/db-health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'database connected' });
  } catch  {
    res.status(503).json({ status: 'database unavailable' });
  }
});

// Protected profile route
app.get('/api/profile', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      message: 'Authentication required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: 'Access granted', user: decoded });
  } catch {
    res.status(401).json({
      message: 'Invalid or expired token'
    });
  }
});

module.exports = app;
