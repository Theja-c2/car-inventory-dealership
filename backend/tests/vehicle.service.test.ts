import { createDatabase } from '../src/db/database';
import {
  createVehicle,
  listVehicles,
  getVehicleById,
  searchVehicles,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle
} from '../src/services/vehicle.service';

describe('Vehicle service', () => {
  let db: ReturnType<typeof createDatabase>;

  beforeEach(() => {
    db = createDatabase(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  function seed() {
    createVehicle(db, { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 5 });
    createVehicle(db, { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 28000, quantity: 0 });
    createVehicle(db, { make: 'Honda', model: 'Civic', category: 'Sedan', price: 21000, quantity: 3 });
  }

  it('creates a vehicle with a unique id', () => {
    const v = createVehicle(db, { make: 'Ford', model: 'Mustang', category: 'Coupe', price: 35000, quantity: 2 });
    expect(v.id).toEqual(expect.any(Number));
    expect(v.make).toBe('Ford');
    expect(v.quantity).toBe(2);
  });

  it('lists all vehicles', () => {
    seed();
    expect(listVehicles(db)).toHaveLength(3);
  });

  it('gets a vehicle by id', () => {
    const v = createVehicle(db, { make: 'Ford', model: 'Mustang', category: 'Coupe', price: 35000, quantity: 2 });
    expect(getVehicleById(db, v.id)?.model).toBe('Mustang');
    expect(getVehicleById(db, 9999)).toBeUndefined();
  });

  it('searches vehicles by make', () => {
    seed();
    const results = searchVehicles(db, { make: 'Toyota' });
    expect(results).toHaveLength(2);
  });

  it('searches vehicles by category and price range', () => {
    seed();
    const results = searchVehicles(db, { category: 'Sedan', minPrice: 21500, maxPrice: 30000 });
    expect(results).toHaveLength(1);
    expect(results[0].model).toBe('Corolla');
  });

  it('updates a vehicle', () => {
    const v = createVehicle(db, { make: 'Ford', model: 'Mustang', category: 'Coupe', price: 35000, quantity: 2 });
    const updated = updateVehicle(db, v.id, { price: 33000 });
    expect(updated.price).toBe(33000);
    expect(updated.model).toBe('Mustang');
  });

  it('throws when updating a non-existent vehicle', () => {
    expect(() => updateVehicle(db, 12345, { price: 1 })).toThrow(/not found/i);
  });

  it('deletes a vehicle', () => {
    const v = createVehicle(db, { make: 'Ford', model: 'Mustang', category: 'Coupe', price: 35000, quantity: 2 });
    deleteVehicle(db, v.id);
    expect(getVehicleById(db, v.id)).toBeUndefined();
  });

  it('decreases quantity on purchase', () => {
    const v = createVehicle(db, { make: 'Ford', model: 'Mustang', category: 'Coupe', price: 35000, quantity: 2 });
    const purchased = purchaseVehicle(db, v.id, 1);
    expect(purchased.quantity).toBe(1);
  });

  it('rejects purchase when out of stock', () => {
    const v = createVehicle(db, { make: 'Ford', model: 'Mustang', category: 'Coupe', price: 35000, quantity: 0 });
    expect(() => purchaseVehicle(db, v.id, 1)).toThrow(/out of stock|insufficient/i);
  });

  it('increases quantity on restock', () => {
    const v = createVehicle(db, { make: 'Ford', model: 'Mustang', category: 'Coupe', price: 35000, quantity: 2 });
    const restocked = restockVehicle(db, v.id, 5);
    expect(restocked.quantity).toBe(7);
  });
});
