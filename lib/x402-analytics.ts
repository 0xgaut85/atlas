export type FeeCategory = 'access' | 'registration' | 'other';

export function categorizeFee(amountMicro: number): FeeCategory {
  if (amountMicro === 1_000_000) return 'access';
  if (amountMicro === 50_000_000) return 'registration';
  return 'other';
}

export function bucketToDay(tsMs: number): string {
  const d = new Date(tsMs);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function sum(arr: number[]): number { return arr.reduce((a, b) => a + b, 0); }


