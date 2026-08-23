import { Router, Request, Response } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import { register, login } from '../services/auth.service';

export function createAuthRouter(db: DatabaseSync): Router {
  const router = Router();

  router.post('/register', (req: Request, res: Response) => {
    const { email, password, role } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }

    try {
      const user = register(db, email, password, role === 'admin' ? 'admin' : 'user');
      res.status(201).json(user);
    } catch (err) {
      const message = (err as Error).message;
      const status = /already registered/i.test(message) ? 409 : 400;
      res.status(status).json({ error: message });
    }
  });

  router.post('/login', (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }

    try {
      const result = login(db, email, password);
      res.status(200).json(result);
    } catch (err) {
      res.status(401).json({ error: (err as Error).message });
    }
  });

  return router;
}
