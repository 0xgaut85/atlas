export interface ValidationError {
  field: string;
  message: string;
}

export function validateTokenParams(params: any): {
  valid: boolean;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  if (!params.name || params.name.length < 1) {
    errors.push({ field: 'name', message: 'Token name is required' });
  }

  if (!params.symbol || params.symbol.length < 2 || params.symbol.length > 10) {
    errors.push({ field: 'symbol', message: 'Token symbol must be between 2 and 10 characters' });
  }

  if (!params.supply || parseFloat(params.supply) <= 0) {
    errors.push({ field: 'supply', message: 'Supply must be greater than 0' });
  }

  if (!params.network || !['base', 'solana-mainnet'].includes(params.network)) {
    errors.push({ field: 'network', message: 'Network must be base or solana-mainnet' });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function calculateDeploymentFee(
  price: string,
  network: 'base' | 'solana-mainnet'
): number {
  const baseFee = 10.0;
  const priceValue = parseFloat(price) || 0;
  return baseFee + priceValue;
}

