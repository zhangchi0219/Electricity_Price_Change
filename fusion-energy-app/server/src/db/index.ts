import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import path from 'path';
import fs from 'fs';
import * as schema from './schema';

const DB_PATH = path.join(__dirname, '../../data/fusion.db');

// Ensure data directory exists before creating the client
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const client = createClient({
  url: `file:${DB_PATH}`,
});

export const db = drizzle(client, { schema });
export { client };
