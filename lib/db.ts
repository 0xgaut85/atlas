import { sql } from '@vercel/postgres';
import fs from 'fs/promises';
import path from 'path';

let initialized = false;

async function runSchemaInit() {
  const postgresUrl = process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL_PRISMA;
  
  if (!postgresUrl) {
    console.warn('[atlas-db] POSTGRES_URL not set – skipping schema init. Tracking analytics will be disabled.');
    console.warn('[atlas-db] Checked: POSTGRES_URL, POSTGRES_URL_NON_POOLING, POSTGRES_URL_PRISMA');
    initialized = true;
    return;
  }
  
  console.log('[atlas-db] ✅ POSTGRES_URL found, initializing database schema...');
  
  try {
    const schemaFile = path.join(process.cwd(), 'lib', 'sql', 'create-atlas-tracking.sql');
    const schema = await fs.readFile(schemaFile, 'utf8');
    // Multiple statements separated by semicolons – use unsafe execution.
    await sql.unsafe(schema);
    console.log('[atlas-db] ✅ Database schema initialized successfully');
  } catch (error: any) {
    console.error('[atlas-db] ❌ Failed to initialize schema:', error.message);
    console.error('[atlas-db] Stack:', error.stack);
    // Don't throw - allow app to continue even if schema init fails
  }
}

export async function ensureDb() {
  if (initialized) return;
  await runSchemaInit();
  initialized = true;
}

export { sql };

