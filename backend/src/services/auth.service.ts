import bcrypt from 'bcryptjs';
import type { DatabaseSync } from 'node:sqlite';
import { signToken } from '../utils/jwt';

export interface PublicUser {
  id: number;
  email: string;
  role: 'user' | 'admin';
}

const MIN_PASSWORD_LENGTH = 8;

/**
 * Registers a new user. Passwords are hashed with bcrypt before storage.
 * Throws a descriptive Error on duplicate email or weak password so
 * callers (route handlers) can map it to the right HTTP status.
 */
export function register(
  db: DatabaseSync,
  email: string,
  password: string,
  role: 'user' | 'admin' = 'user'
): PublicUser {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    throw new Error('Email is already registered');
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)')
    .run(email, passwordHash, role);

  return { id: Number(result.lastInsertRowid), email, role };
}

/**
 * Verifies credentials and returns a signed JWT plus the public user record.
 * Uses a generic "Invalid credentials" message for both unknown-email and
 * wrong-password cases to avoid leaking which emails are registered.
 */
export function login(
  db: DatabaseSync,
  email: string,
  password: string
): { token: string; user: PublicUser } {
  const row: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    throw new Error('Invalid credentials');
  }

  const user: PublicUser = { id: row.id, email: row.email, role: row.role };
  const token = signToken({ userId: user.id, role: user.role });
  return { token, user };
}
