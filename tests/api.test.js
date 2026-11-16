const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'assignment-six-test-secret';

const app = require('../app');

// Test 1: Health endpoint
test('GET /health returns healthy status', async () => {
  const response = await request(app).get('/health');

  assert.equal(response.status, 200);
  //assert.equal(response.status, 201);
  assert.equal(response.body.status, 'healthy');
  assert.equal(response.body.application, 'ShopCart API');
});

// Test 2: Profile endpoint rejects missing authentication
test('GET /api/profile rejects requests without a token', async () => {
  const response = await request(app).get('/api/profile');

  assert.equal(response.status, 401);
  assert.equal(response.body.message, 'Authentication required');
});

// Test 3: Profile endpoint accepts a valid JWT
test('GET /api/profile accepts a valid token', async () => {
  const token = jwt.sign(
    { id: 1, username: 'testuser' },
    process.env.JWT_SECRET
  );

  const response = await request(app)
    .get('/api/profile')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.message, 'Access granted');
  assert.equal(response.body.user.username, 'testuser');
});
