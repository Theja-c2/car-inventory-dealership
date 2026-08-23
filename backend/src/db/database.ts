import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

/**
 * Creates (or opens) a SQLite database at the given path and ensures the
 * schema exists. Pass ':memory:' for an ephemeral in-memory database,
 * primarily used in tests.
 *
 * Uses Node's built-in node:sqlite module (stable in Node 22.5+) rather
 * than a native addon like better-sqlite3, so no C++ build toolchain is
 * required to install dependencies on any platform.
 */
export function createDatabase(dbPath: string): DatabaseSync {
  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL CHECK (price >= 0),
      quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  return db;
}

let singleton: DatabaseSync | null = null;

/**
 * Returns a process-wide database singleton, initialized lazily from
 * DB_PATH so it can be overridden per-environment (tests use ':memory:').
 */
export function getDb(): DatabaseSync {
  if (!singleton) {
    const dbPath = process.env.DB_PATH || './data/dealership.sqlite';
    singleton = createDatabase(dbPath);
  }
  return singleton;
}

/** Allows tests to reset the singleton between suites. */
export function resetDb(): void {
  if (singleton) {
    singleton.close();
    singleton = null;
  }
}
