import { sql, ensureDb } from './db';

type Network = 'base' | 'solana-mainnet' | string;

export type PaymentCategory = 'access' | 'registration' | 'mint' | 'service' | 'other';

export interface PaymentInput {
  txHash: string;
  userAddress?: string | null;
  merchantAddress?: string | null;
  network: Network;
  amountMicro: number;
  currency?: string;
  category: PaymentCategory | string;
  service?: string | null;
  metadata?: Record<string, any> | null;
  createdAt?: Date;
}

export interface AtlasPaymentRecord extends PaymentInput {
  createdAt: Date;
}

export interface UserEventInput {
  userAddress: string;
  eventType: string;
  network?: Network;
  referenceId?: string | null;
  amountMicro?: number | null;
  metadata?: Record<string, any> | null;
  createdAt?: Date;
}

export interface AtlasUserEvent extends UserEventInput {
  id: string;
  createdAt: Date;
}

export interface ServiceRecord {
  id: string;
  name: string;
  description?: string | null;
  endpoint?: string | null;
  merchantAddress?: string | null;
  category?: string | null;
  network?: Network;
  priceAmount?: string | null;
  priceCurrency?: string | null;
  metadata?: Record<string, any> | null;
  createdAt?: Date;
}

export interface ListPaymentsOptions {
  limit?: number;
  offset?: number;
  userAddress?: string;
  network?: Network;
  category?: string;
  since?: Date;
}

export interface ListUserEventsOptions {
  limit?: number;
  offset?: number;
  userAddress?: string;
  eventType?: string;
}

const DB_ENABLED = Boolean(process.env.POSTGRES_URL);

const fallbackStore = {
  payments: new Map<string, AtlasPaymentRecord>(),
  events: [] as AtlasUserEvent[],
  services: new Map<string, ServiceRecord>(),
};

function now() {
  return new Date();
}

export function isTrackingEnabled() {
  return DB_ENABLED;
}

export async function recordPayment(input: PaymentInput): Promise<AtlasPaymentRecord> {
  const createdAt = input.createdAt ?? now();
  const currency = input.currency ?? 'USDC';
  const normalizedUser = input.userAddress ? input.userAddress.toLowerCase() : null;
  const normalizedMerchant = input.merchantAddress ? input.merchantAddress.toLowerCase() : null;
  const record: AtlasPaymentRecord = {
    ...input,
    currency,
    userAddress: normalizedUser ?? undefined,
    merchantAddress: normalizedMerchant ?? undefined,
    createdAt,
  };

  if (DB_ENABLED) {
    await ensureDb();
    await sql`
      INSERT INTO atlas_payments
        (tx_hash, user_address, merchant_address, network, amount_micro, currency, category, service, metadata, created_at)
      VALUES
        (${record.txHash}, ${normalizedUser}, ${normalizedMerchant}, ${record.network}, ${record.amountMicro}, ${record.currency}, ${record.category}, ${record.service ?? null}, ${record.metadata ?? null}, ${record.createdAt.toISOString()})
      ON CONFLICT (tx_hash) DO UPDATE SET
        user_address = EXCLUDED.user_address,
        merchant_address = EXCLUDED.merchant_address,
        network = EXCLUDED.network,
        amount_micro = EXCLUDED.amount_micro,
        currency = EXCLUDED.currency,
        category = EXCLUDED.category,
        service = EXCLUDED.service,
        metadata = COALESCE(EXCLUDED.metadata, atlas_payments.metadata),
        created_at = atlas_payments.created_at
    `;
  } else {
    fallbackStore.payments.set(record.txHash, record);
  }

  return record;
}

export async function listPayments(options: ListPaymentsOptions = {}): Promise<AtlasPaymentRecord[]> {
  const {
    limit = 100,
    offset = 0,
    userAddress,
    network,
    category,
    since,
  } = options;

  if (DB_ENABLED) {
    await ensureDb();
    
    try {
      // Build query parts dynamically
      const parts: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (userAddress) {
        parts.push(`user_address = $${paramIndex}`);
        params.push(userAddress.toLowerCase());
        paramIndex++;
      }
      if (network) {
        parts.push(`network = $${paramIndex}`);
        params.push(network);
        paramIndex++;
      }
      if (category) {
        parts.push(`category = $${paramIndex}`);
        params.push(category);
        paramIndex++;
      }
      if (since) {
        parts.push(`created_at >= $${paramIndex}`);
        params.push(since.toISOString());
        paramIndex++;
      }

      const whereClause = parts.length ? `WHERE ${parts.join(' AND ')}` : '';
      const query = `
        SELECT tx_hash, user_address, merchant_address, network, amount_micro, currency, category, service, metadata, created_at
        FROM atlas_payments
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex}
        OFFSET $${paramIndex + 1}
      `;
      params.push(limit, offset);

      console.log('🔍 Executing query:', query);
      console.log('📋 Parameters:', params);

      // Use sql.unsafe for dynamic queries with parameters
      const rows = await sql.unsafe(query, params);
      
      console.log(`✅ Query returned ${rows.length} rows`);
      
      return rows.map((row: any) => ({
        txHash: row.tx_hash,
        userAddress: row.user_address ?? undefined,
        merchantAddress: row.merchant_address ?? undefined,
        network: row.network,
        amountMicro: Number(row.amount_micro) || 0,
        currency: row.currency,
        category: row.category,
        service: row.service ?? undefined,
        metadata: row.metadata ?? undefined,
        createdAt: new Date(row.created_at),
      }));
    } catch (dbError: any) {
      console.error('❌ Database query error:', dbError.message);
      console.error('❌ Stack:', dbError.stack);
      throw dbError;
    }
  }

  const records = Array.from(fallbackStore.payments.values());
  return records
    .filter((record) => {
      if (userAddress && record.userAddress?.toLowerCase() !== userAddress.toLowerCase()) return false;
      if (network && record.network !== network) return false;
      if (category && record.category !== category) return false;
      if (since && record.createdAt < since) return false;
      return true;
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(offset, offset + limit);
}

export async function recordUserEvent(input: UserEventInput): Promise<AtlasUserEvent> {
  const createdAt = input.createdAt ?? now();
  const normalizedUser = input.userAddress.toLowerCase();

  if (DB_ENABLED) {
    await ensureDb();
    const result = await sql`
      INSERT INTO atlas_user_events
        (user_address, event_type, network, reference_id, amount_micro, metadata, created_at)
      VALUES
        (${normalizedUser}, ${input.eventType}, ${input.network ?? null}, ${input.referenceId ?? null}, ${input.amountMicro ?? null}, ${input.metadata ?? null}, ${createdAt.toISOString()})
      RETURNING id, user_address, event_type, network, reference_id, amount_micro, metadata, created_at
    `;

    const row = result.rows[0];
    return {
      id: row.id,
      userAddress: row.user_address,
      eventType: row.event_type,
      network: row.network ?? undefined,
      referenceId: row.reference_id ?? undefined,
      amountMicro: row.amount_micro ?? undefined,
      metadata: row.metadata ?? undefined,
      createdAt: new Date(row.created_at),
    };
  }

  const event: AtlasUserEvent = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    userAddress: normalizedUser,
    eventType: input.eventType,
    network: input.network,
    referenceId: input.referenceId,
    amountMicro: input.amountMicro,
    metadata: input.metadata,
    createdAt,
  };
  fallbackStore.events.push(event);
  return event;
}

export async function listUserEvents(options: ListUserEventsOptions = {}): Promise<AtlasUserEvent[]> {
  const { limit = 100, offset = 0, userAddress, eventType } = options;

  if (DB_ENABLED) {
    await ensureDb();
    
    try {
      const parts: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (userAddress) {
        parts.push(`user_address = $${paramIndex}`);
        params.push(userAddress.toLowerCase());
        paramIndex++;
      }
      if (eventType) {
        parts.push(`event_type = $${paramIndex}`);
        params.push(eventType);
        paramIndex++;
      }

      const whereClause = parts.length ? `WHERE ${parts.join(' AND ')}` : '';
      const query = `
        SELECT id, user_address, event_type, network, reference_id, amount_micro, metadata, created_at
        FROM atlas_user_events
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex}
        OFFSET $${paramIndex + 1}
      `;
      params.push(limit, offset);

      // Use sql.unsafe for dynamic queries
      const rows = await sql.unsafe(query, params);
      
      return rows.map((row: any) => ({
        id: row.id,
        userAddress: row.user_address,
        eventType: row.event_type,
        network: row.network ?? undefined,
        referenceId: row.reference_id ?? undefined,
        amountMicro: row.amount_micro ?? undefined,
        metadata: row.metadata ?? undefined,
        createdAt: new Date(row.created_at),
      }));
    } catch (dbError: any) {
      console.error('❌ Database query error for events:', dbError.message);
      throw dbError;
    }
  }

  return fallbackStore.events
    .filter((event) => {
      if (userAddress && event.userAddress !== userAddress.toLowerCase()) return false;
      if (eventType && event.eventType !== eventType) return false;
      return true;
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(offset, offset + limit);
}

export async function upsertService(record: ServiceRecord): Promise<ServiceRecord> {
  const createdAt = record.createdAt ?? now();
  const payload = {
    ...record,
    createdAt,
  };

  if (DB_ENABLED) {
    await ensureDb();
    await sql`
      INSERT INTO atlas_services
        (id, name, description, endpoint, merchant_address, category, network, price_amount, price_currency, metadata, created_at)
      VALUES
        (${payload.id}, ${payload.name}, ${payload.description ?? null}, ${payload.endpoint ?? null}, ${payload.merchantAddress ?? null}, ${payload.category ?? null}, ${payload.network ?? null}, ${payload.priceAmount ?? null}, ${payload.priceCurrency ?? null}, ${payload.metadata ?? null}, ${payload.createdAt.toISOString()})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        endpoint = EXCLUDED.endpoint,
        merchant_address = EXCLUDED.merchant_address,
        category = EXCLUDED.category,
        network = EXCLUDED.network,
        price_amount = EXCLUDED.price_amount,
        price_currency = EXCLUDED.price_currency,
        metadata = COALESCE(EXCLUDED.metadata, atlas_services.metadata)
    `;
  } else {
    fallbackStore.services.set(payload.id, payload);
  }

  return payload;
}

export async function listServices(): Promise<ServiceRecord[]> {
  if (DB_ENABLED) {
    await ensureDb();
    const rows = await sql`
      SELECT id, name, description, endpoint, merchant_address, category, network, price_amount, price_currency, metadata, created_at
      FROM atlas_services
      ORDER BY created_at DESC
    `;

    return rows.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      endpoint: row.endpoint ?? undefined,
      merchantAddress: row.merchant_address ?? undefined,
      category: row.category ?? undefined,
      network: row.network ?? undefined,
      priceAmount: row.price_amount ?? undefined,
      priceCurrency: row.price_currency ?? undefined,
      metadata: row.metadata ?? undefined,
      createdAt: new Date(row.created_at),
    }));
  }

  return Array.from(fallbackStore.services.values()).sort((a, b) => {
    const dateA = a.createdAt?.getTime() ?? 0;
    const dateB = b.createdAt?.getTime() ?? 0;
    return dateB - dateA;
  });
}

export async function getPaymentTotals(days = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  if (DB_ENABLED) {
    await ensureDb();
    const revenueRows = await sql`
      SELECT network, category, SUM(amount_micro) as total_micro
      FROM atlas_payments
      WHERE created_at >= ${since.toISOString()}
      GROUP BY network, category
    `;

    const userRow = await sql`
      SELECT COUNT(DISTINCT user_address) AS users
      FROM atlas_payments
      WHERE user_address IS NOT NULL AND created_at >= ${since.toISOString()}
    `;

    const servicesRow = await sql`
      SELECT COUNT(*) AS services
      FROM atlas_services
      WHERE created_at >= ${since.toISOString()}
    `;

    return {
      byNetworkAndCategory: revenueRows.rows.map((row) => ({
        network: row.network,
        category: row.category,
        totalMicro: Number(row.total_micro) || 0,
      })),
      uniqueUsers: Number(userRow.rows[0]?.users ?? 0),
      servicesAdded: Number(servicesRow.rows[0]?.services ?? 0),
      since,
    };
  }

  const payments = Array.from(fallbackStore.payments.values()).filter((p) => p.createdAt >= since);
  const byNetworkAndCategory = payments.reduce((acc, payment) => {
    const key = `${payment.network}-${payment.category}`;
    acc[key] = (acc[key] || 0) + payment.amountMicro;
    return acc;
  }, {} as Record<string, number>);

  const transformed = Object.entries(byNetworkAndCategory).map(([key, totalMicro]) => {
    const [network, category] = key.split('-');
    return { network, category, totalMicro };
  });

  const uniqueUsers = new Set(payments.map((p) => p.userAddress).filter(Boolean)).size;
  const servicesAdded = Array.from(fallbackStore.services.values()).filter((s) => (s.createdAt ?? now()) >= since).length;

  return {
    byNetworkAndCategory: transformed,
    uniqueUsers,
    servicesAdded,
    since,
  };
}

