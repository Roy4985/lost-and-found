import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server-core';

// The app signs tokens with this secret. Set it before the app loads.
process.env.JWT_SECRET = 'test-secret';
const { default: app } = await import('../app.js');

let db;

// Before the tests: start an empty MongoDB in memory and connect to it.
// Your real Atlas data is never touched.
before(async () => {
  db = await MongoMemoryServer.create();
  await mongoose.connect(db.getUri());
});

// After the tests: disconnect and throw the database away.
after(async () => {
  await mongoose.disconnect();
  await db.stop();
});

// Creates an account and returns its token.
async function signup(name, email) {
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ name, email, password: 'password123' });
  assert.equal(res.status, 201);
  return res.body.token;
}

test('a user cannot send a second pending claim on the same item', async () => {
  const roy = await signup('Roy', 'roy@test.com');
  const sara = await signup('Sara', 'sara@test.com');

  // Roy posts a found wallet.
  const item = await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${roy}`)
    .send({ type: 'found', title: 'Black wallet', category: 'cards-ids', location: 'Library', date: '2026-11-10' });
  assert.equal(item.status, 201);

  const claimUrl = `/api/items/${item.body._id}/claims`;

  // Sara's first claim is accepted for review.
  const first = await request(app)
    .post(claimUrl)
    .set('Authorization', `Bearer ${sara}`)
    .send({ message: 'It has my student ID inside' });
  assert.equal(first.status, 201);
  assert.equal(first.body.status, 'pending');

  // Her second claim on the same item is refused.
  const second = await request(app)
    .post(claimUrl)
    .set('Authorization', `Bearer ${sara}`)
    .send({ message: 'Please, it is really mine' });
  assert.equal(second.status, 409);
  assert.equal(second.body.error, 'You already have a pending claim on this item');
});
