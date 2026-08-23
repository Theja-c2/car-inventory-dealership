process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';

import request from 'supertest';
import { createDatabase } from '../src/db/database';
import { createApp } from '../src/app';

describe('Auth routes', () => {
  let db: ReturnType<typeof createDatabase>;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    db = createDatabase(':memory:');
    app = createApp(db);
  });

  afterEach(() => {
    db.close();
  });

  it('POST /api/auth/register creates a user and returns 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'jane@example.com', password: 'sup3rSecret!' });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('jane@example.com');
    expect(res.body.password_hash).toBeUndefined();
  });

  it('POST /api/auth/register returns 400 on missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'jane@example.com' });
    expect(res.status).toBe(400);
  });

  it('POST /api/auth/register returns 409 on duplicate email', async () => {
    await request(app).post('/api/auth/register').send({ email: 'jane@example.com', password: 'sup3rSecret!' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'jane@example.com', password: 'anotherPass1' });
    expect(res.status).toBe(409);
  });

  it('POST /api/auth/login returns a token for valid credentials', async () => {
    await request(app).post('/api/auth/register').send({ email: 'jane@example.com', password: 'sup3rSecret!' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: 'sup3rSecret!' });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });

  it('POST /api/auth/login returns 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'whatever1' });
    expect(res.status).toBe(401);
  });
});
