import type Database from 'better-sqlite3';

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface NewVehicleInput {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity?: number;
}

export interface VehicleUpdateInput {
  make?: string;
  model?: string;
  category?: string;
  price?: number;
  quantity?: number;
}

export interface VehicleSearchParams {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export function createVehicle(db: Database.Database, input: NewVehicleInput): Vehicle {
  const quantity = input.quantity ?? 0;
  const result = db
    .prepare(
      'INSERT INTO vehicles (make, model, category, price, quantity) VALUES (?, ?, ?, ?, ?)'
    )
    .run(input.make, input.model, input.category, input.price, quantity);

  return getVehicleById(db, Number(result.lastInsertRowid)) as Vehicle;
}

export function listVehicles(db: Database.Database): Vehicle[] {
  return db.prepare('SELECT * FROM vehicles ORDER BY id').all() as Vehicle[];
}

export function getVehicleById(db: Database.Database, id: number): Vehicle | undefined {
  return db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id) as Vehicle | undefined;
}

export function searchVehicles(db: Database.Database, params: VehicleSearchParams): Vehicle[] {
  const clauses: string[] = [];
  const values: (string | number)[] = [];

  if (params.make) {
    clauses.push('make LIKE ?');
    values.push(`%${params.make}%`);
  }
  if (params.model) {
    clauses.push('model LIKE ?');
    values.push(`%${params.model}%`);
  }
  if (params.category) {
    clauses.push('category LIKE ?');
    values.push(`%${params.category}%`);
  }
  if (params.minPrice !== undefined) {
    clauses.push('price >= ?');
    values.push(params.minPrice);
  }
  if (params.maxPrice !== undefined) {
    clauses.push('price <= ?');
    values.push(params.maxPrice);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return db.prepare(`SELECT * FROM vehicles ${where} ORDER BY id`).all(...values) as Vehicle[];
}

function assertExists(db: Database.Database, id: number): Vehicle {
  const vehicle = getVehicleById(db, id);
  if (!vehicle) {
    throw new Error(`Vehicle ${id} not found`);
  }
  return vehicle;
}

export function updateVehicle(db: Database.Database, id: number, updates: VehicleUpdateInput): Vehicle {
  const existing = assertExists(db, id);
  const merged = { ...existing, ...updates };

  db.prepare(
    `UPDATE vehicles
     SET make = ?, model = ?, category = ?, price = ?, quantity = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(merged.make, merged.model, merged.category, merged.price, merged.quantity, id);

  return getVehicleById(db, id) as Vehicle;
}

export function deleteVehicle(db: Database.Database, id: number): void {
  assertExists(db, id);
  db.prepare('DELETE FROM vehicles WHERE id = ?').run(id);
}

export function purchaseVehicle(db: Database.Database, id: number, amount = 1): Vehicle {
  const vehicle = assertExists(db, id);
  if (vehicle.quantity < amount) {
    throw new Error('Vehicle is out of stock or has insufficient quantity');
  }
  return updateVehicle(db, id, { quantity: vehicle.quantity - amount });
}

export function restockVehicle(db: Database.Database, id: number, amount: number): Vehicle {
  const vehicle = assertExists(db, id);
  if (amount <= 0) {
    throw new Error('Restock amount must be positive');
  }
  return updateVehicle(db, id, { quantity: vehicle.quantity + amount });
}
