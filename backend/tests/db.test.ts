import { createDatabase } from '../src/db/database';

describe('Database', () => {
  it('creates users and vehicles tables', () => {
    const db = createDatabase(':memory:');

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((row: any) => row.name);

    expect(tables).toEqual(expect.arrayContaining(['users', 'vehicles']));
    db.close();
  });

  it('enforces unique email on users', () => {
    const db = createDatabase(':memory:');
    db.prepare(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)'
    ).run('a@a.com', 'hash', 'user');

    expect(() => {
      db.prepare(
        'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)'
      ).run('a@a.com', 'hash2', 'user');
    }).toThrow();

    db.close();
  });

  it('defaults vehicle quantity to 0 when not provided', () => {
    const db = createDatabase(':memory:');
    db.prepare(
      'INSERT INTO vehicles (make, model, category, price) VALUES (?, ?, ?, ?)'
    ).run('Toyota', 'Corolla', 'Sedan', 20000);

    const vehicle: any = db.prepare('SELECT * FROM vehicles WHERE make = ?').get('Toyota');
    expect(vehicle.quantity).toBe(0);
    db.close();
  });
});
