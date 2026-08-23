process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';

import { createDatabase } from '../src/db/database';
import { register, login } from '../src/services/auth.service';

describe('Auth service', () => {
  let db: ReturnType<typeof createDatabase>;

  beforeEach(() => {
    db = createDatabase(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  it('registers a new user with a hashed password', () => {
    const user = register(db, 'jane@example.com', 'sup3rSecret!', 'user');
    expect(user.email).toBe('jane@example.com');
    expect(user.role).toBe('user');
    expect((user as any).password_hash).toBeUndefined();

    const row: any = db.prepare('SELECT * FROM users WHERE email = ?').get('jane@example.com');
    expect(row.password_hash).not.toBe('sup3rSecret!');
  });

  it('rejects duplicate registration', () => {
    register(db, 'jane@example.com', 'sup3rSecret!', 'user');
    expect(() => register(db, 'jane@example.com', 'anotherPass1', 'user')).toThrow(
      /already registered/i
    );
  });

  it('rejects registration with a weak password', () => {
    expect(() => register(db, 'weak@example.com', '123', 'user')).toThrow(/password/i);
  });

  it('logs in with correct credentials and returns a token', () => {
    register(db, 'jane@example.com', 'sup3rSecret!', 'user');
    const result = login(db, 'jane@example.com', 'sup3rSecret!');
    expect(result.token).toEqual(expect.any(String));
    expect(result.user.email).toBe('jane@example.com');
  });

  it('rejects login with wrong password', () => {
    register(db, 'jane@example.com', 'sup3rSecret!', 'user');
    expect(() => login(db, 'jane@example.com', 'wrongPassword')).toThrow(/invalid credentials/i);
  });

  it('rejects login for unknown email', () => {
    expect(() => login(db, 'nobody@example.com', 'whatever1')).toThrow(/invalid credentials/i);
  });
});
