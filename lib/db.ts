import { sql } from '@vercel/postgres';
import fs from 'fs/promises';
import path from 'path';

let initialized = false;

async function runSchemaInit() {
  if (!process.env.POSTGRES_URL) {
    console.warn('[atlas-db] POSTGRES_URL not set – skipping schema init. Tracking analytics will be disabled.');
    initialized = true;
    return;
  }
  const schemaFile = path.join(process.cwd(), 'lib', 'sql', 'create-atlas-tracking.sql');
  const schema = await fs.readFile(schemaFile, 'utf8');
  // Multiple statements separated by semicolons – use unsafe execution.
  await sql.unsafe(schema);
}

export async function ensureDb() {
  if (initialized) return;
  await runSchemaInit();
  initialized = true;
}

export { sql };

