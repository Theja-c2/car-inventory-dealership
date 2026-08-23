import express, { Express } from 'express';
import cors from 'cors';
import type Database from 'better-sqlite3';
import { createAuthRouter } from './routes/auth.routes';
import { createVehiclesRouter } from './routes/vehicles.routes';

/**
 * Builds an Express app wired to the given database. Kept as a factory
 * (rather than a module-level singleton) so tests can inject a fresh
 * in-memory database per test file/suite.
 */
export function createApp(db: Database.Database): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/auth', createAuthRouter(db));
  app.use('/api/vehicles', createVehiclesRouter(db));

  // Fallback error handler for anything that slips past route-level try/catch.
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
