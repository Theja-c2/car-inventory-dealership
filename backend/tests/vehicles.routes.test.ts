process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';

import request from 'supertest';
import { createDatabase } from '../src/db/database';
import { createApp } from '../src/app';

describe('Vehicle routes', () => {
  let db: ReturnType<typeof createDatabase>;
  let app: ReturnType<typeof createApp>;
  let userToken: string;
  let adminToken: string;

  beforeEach(async () => {
    db = createDatabase(':memory:');
    app = createApp(db);

    await request(app).post('/api/auth/register').send({ email: 'user@example.com', password: 'sup3rSecret!' });
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'sup3rSecret!' });
    userToken = userLogin.body.token;

    // Seed an admin directly (no public admin-registration endpoint by design).
    const { register } = require('../src/services/auth.service');
    register(db, 'admin@example.com', 'sup3rSecret!', 'admin');
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'sup3rSecret!' });
    adminToken = adminLogin.body.token;
  });

  afterEach(() => {
    db.close();
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(401);
  });

  it('allows an authenticated user to create and list vehicles', async () => {
    const create = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 5 });
    expect(create.status).toBe(201);

    const list = await request(app).get('/api/vehicles').set('Authorization', `Bearer ${userToken}`);
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
  });

  it('searches vehicles by query params', async () => {
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 5 });
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Honda', model: 'Civic', category: 'Sedan', price: 21000, quantity: 3 });

    const res = await request(app)
      .get('/api/vehicles/search?make=Toyota')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].make).toBe('Toyota');
  });

  it('allows updating a vehicle', async () => {
    const create = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 5 });

    const res = await request(app)
      .put(`/api/vehicles/${create.body.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ price: 20000 });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(20000);
  });

  it('rejects vehicle deletion by non-admin users', async () => {
    const create = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 5 });

    const res = await request(app)
      .delete(`/api/vehicles/${create.body.id}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('allows vehicle deletion by admin users', async () => {
    const create = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 5 });

    const res = await request(app)
      .delete(`/api/vehicles/${create.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });

  it('purchases a vehicle and decrements quantity', async () => {
    const create = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 2 });

    const res = await request(app)
      .post(`/api/vehicles/${create.body.id}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 1 });
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(1);
  });

  it('rejects restock by non-admin users', async () => {
    const create = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 2 });

    const res = await request(app)
      .post(`/api/vehicles/${create.body.id}/restock`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 5 });
    expect(res.status).toBe(403);
  });

  it('allows restock by admin users', async () => {
    const create = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 2 });

    const res = await request(app)
      .post(`/api/vehicles/${create.body.id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 5 });
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(7);
  });
});
