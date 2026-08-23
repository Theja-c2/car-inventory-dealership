import { Router, Request, Response } from 'express';
import type Database from 'better-sqlite3';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  createVehicle,
  listVehicles,
  getVehicleById,
  searchVehicles,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle
} from '../services/vehicle.service';

export function createVehiclesRouter(db: Database.Database): Router {
  const router = Router();

  router.use(authenticate);

  router.post('/', (req: Request, res: Response) => {
    const { make, model, category, price, quantity } = req.body ?? {};
    if (!make || !model || !category || price === undefined) {
      res.status(400).json({ error: 'make, model, category, and price are required' });
      return;
    }

    try {
      const vehicle = createVehicle(db, { make, model, category, price: Number(price), quantity: quantity !== undefined ? Number(quantity) : undefined });
      res.status(201).json(vehicle);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.get('/', (_req: Request, res: Response) => {
    res.status(200).json(listVehicles(db));
  });

  // Must be registered before the `/:id` route so "search" isn't parsed as an id.
  router.get('/search', (req: Request, res: Response) => {
    const { make, model, category, minPrice, maxPrice } = req.query;
    const results = searchVehicles(db, {
      make: typeof make === 'string' ? make : undefined,
      model: typeof model === 'string' ? model : undefined,
      category: typeof category === 'string' ? category : undefined,
      minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined
    });
    res.status(200).json(results);
  });

  router.get('/:id', (req: Request, res: Response) => {
    const vehicle = getVehicleById(db, Number(req.params.id));
    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }
    res.status(200).json(vehicle);
  });

  router.put('/:id', (req: Request, res: Response) => {
    try {
      const vehicle = updateVehicle(db, Number(req.params.id), req.body ?? {});
      res.status(200).json(vehicle);
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  });

  router.delete('/:id', requireAdmin, (req: Request, res: Response) => {
    try {
      deleteVehicle(db, Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  });

  router.post('/:id/purchase', (req: Request, res: Response) => {
    const amount = req.body?.amount !== undefined ? Number(req.body.amount) : 1;
    try {
      const vehicle = purchaseVehicle(db, Number(req.params.id), amount);
      res.status(200).json(vehicle);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.post('/:id/restock', requireAdmin, (req: Request, res: Response) => {
    const amount = req.body?.amount !== undefined ? Number(req.body.amount) : 0;
    try {
      const vehicle = restockVehicle(db, Number(req.params.id), amount);
      res.status(200).json(vehicle);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  return router;
}
