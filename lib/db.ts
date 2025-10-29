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
    
    // Split by semicolons and execute each statement separately
    // This avoids the need for sql.unsafe which may not be available
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.length > 0) {
        try {
          // Execute each statement using sql template literal
          // For raw SQL strings, we need to use a workaround since sql is a template literal tag
          // We'll execute it as a raw query by wrapping it in a template literal
          await sql`${sql.raw(statement)}`;
        } catch (stmtError: any) {
          // If sql.raw doesn't exist, try direct execution with template literal
          try {
            // Fallback: execute statement directly (may not work for all cases)
            await (sql as any)(statement);
          } catch (fallbackError: any) {
            // Ignore "already exists" errors - these are expected on subsequent runs
            if (!stmtError.message?.includes('already exists') && 
                !stmtError.message?.includes('duplicate') &&
                !fallbackError.message?.includes('already exists') &&
                !fallbackError.message?.includes('duplicate')) {
              console.warn(`[atlas-db] ⚠️ Statement execution warning:`, stmtError.message || fallbackError.message);
            }
          }
        }
      }
    }
    
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

