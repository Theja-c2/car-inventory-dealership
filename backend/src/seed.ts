/**
 * Seeds the local SQLite database with a demo admin/user account and a
 * handful of vehicles, for local development and screenshots.
 *
 * Usage: npm run seed
 */
import dotenv from 'dotenv';
dotenv.config();

import { getDb } from './db/database';
import { register } from './services/auth.service';
import { createVehicle } from './services/vehicle.service';

const db = getDb();

function seedUser(email: string, password: string, role: 'user' | 'admin') {
  try {
    register(db, email, password, role);
    console.log(`Created ${role}: ${email} / ${password}`);
  } catch (err) {
    console.log(`Skipping ${email}: ${(err as Error).message}`);
  }
}

seedUser('admin@dealership.com', 'AdminPass123', 'admin');
seedUser('customer@dealership.com', 'CustomerPass123', 'user');

const vehicles = [
  { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22500, quantity: 6 },
  { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 29800, quantity: 3 },
  { make: 'Honda', model: 'Civic', category: 'Sedan', price: 23100, quantity: 0 },
  { make: 'Honda', model: 'CR-V', category: 'SUV', price: 31200, quantity: 4 },
  { make: 'Ford', model: 'Mustang', category: 'Coupe', price: 38900, quantity: 2 },
  { make: 'Ford', model: 'F-150', category: 'Truck', price: 42500, quantity: 5 },
  { make: 'Tesla', model: 'Model 3', category: 'Sedan', price: 41990, quantity: 1 },
  { make: 'Chevrolet', model: 'Tahoe', category: 'SUV', price: 54200, quantity: 0 }
];

for (const v of vehicles) {
  try {
    createVehicle(db, v);
    console.log(`Created vehicle: ${v.make} ${v.model}`);
  } catch (err) {
    console.log(`Skipping vehicle ${v.make} ${v.model}: ${(err as Error).message}`);
  }
}

console.log('Seeding complete.');
