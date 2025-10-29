import { BrowserProvider, parseEther } from 'ethers';

export interface AgentTransaction {
  to: string;
  data?: string;
  value?: string;
  description: string;
  network?: string;
}

export interface TransactionHistoryItem {
  txHash: string;
  description: string;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
  network: string;
}

const HISTORY_KEY = 'agent_transaction_history';

/**
 * Execute a blockchain transaction via the agent
 */
export async function executeAgentTransaction(
  walletProvider: any,
  transaction: AgentTransaction
): Promise<string> {
  try {
    console.log('Executing agent transaction:', transaction);

    // Request transaction from wallet
    const txHash = await walletProvider.request({
      method: 'eth_sendTransaction',
      params: [{
        to: transaction.to,
        data: transaction.data || '0x',
        value: transaction.value || '0x0',
      }],
    });

    console.log('Transaction sent:', txHash);

    // Store in history
    storeTransactionHistory(txHash, transaction.description, 'pending', transaction.network || 'base');

    return txHash;
  } catch (error: any) {
    console.error('Transaction execution failed:', error);
    throw new Error(`Transaction failed: ${error.message}`);
  }
}

/**
 * Store transaction in history
 */
export function storeTransactionHistory(
  txHash: string,
  description: string,
  status: 'pending' | 'success' | 'failed' = 'pending',
  network: string = 'base'
): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getTransactionHistory();
    
    const newItem: TransactionHistoryItem = {
      txHash,
      description,
      timestamp: Date.now(),
      status,
      network,
    };

    history.unshift(newItem); // Add to beginning
    
    // Keep only last 50 transactions
    const trimmed = history.slice(0, 50);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error storing transaction history:', error);
  }
}

/**
 * Get transaction history
 */
export function getTransactionHistory(): TransactionHistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading transaction history:', error);
    return [];
  }
}

/**
 * Update transaction status
 */
export function updateTransactionStatus(
  txHash: string,
  status: 'success' | 'failed'
): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getTransactionHistory();
    const index = history.findIndex(item => item.txHash === txHash);
    
    if (index !== -1) {
      history[index].status = status;
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  } catch (error) {
    console.error('Error updating transaction status:', error);
  }
}

/**
 * Clear all transaction history
 */
export function clearTransactionHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
}

/**
 * Parse agent response to extract transaction details
 */
export function parseAgentTransaction(message: string): AgentTransaction | null {
  // Check if message contains transaction intent
  const hasTransaction = message.toLowerCase().includes('transaction') ||
                        message.toLowerCase().includes('swap') ||
                        message.toLowerCase().includes('send') ||
                        message.toLowerCase().includes('transfer');

  if (!hasTransaction) return null;

  // This is a simplified parser - in reality, the agent API should return structured data
  // For now, return null and rely on API to provide transaction details
  return null;
}

/**
 * Format transaction for display
 */
export function formatTransaction(tx: AgentTransaction): string {
  return `
To: ${tx.to}
Value: ${tx.value || '0'} ETH
Description: ${tx.description}
Network: ${tx.network || 'base'}
  `.trim();
}

