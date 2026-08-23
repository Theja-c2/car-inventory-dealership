import dotenv from 'dotenv';
dotenv.config();

import { getDb } from './db/database';
import { createApp } from './app';

const PORT = Number(process.env.PORT) || 4000;

const db = getDb();
const app = createApp(db);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Car Dealership API listening on http://localhost:${PORT}`);
});
