const SESSION_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const STORAGE_KEY = 'x402_payment_sessions';

export interface PaymentSession {
  page: string;
  txHash: string;
  timestamp: number;
  expiresAt: number;
}

/**
 * Check if user has a valid payment session for a page
 */
export function hasValidSession(page: string): boolean {
  clearExpiredSessions();
  
  const sessions = getSessions();
  const session = sessions.find(s => s.page === page);
  
  if (!session) return false;
  
  // Check if session is still valid
  return Date.now() < session.expiresAt;
}

/**
 * Store a new payment session
 */
export function storeSession(page: string, txHash: string): void {
  const sessions = getSessions();
  
  const newSession: PaymentSession = {
    page,
    txHash,
    timestamp: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION,
  };
  
  // Remove existing session for this page
  const filteredSessions = sessions.filter(s => s.page !== page);
  
  // Add new session
  filteredSessions.push(newSession);
  
  saveSessions(filteredSessions);
}

/**
 * Get remaining time for a session in milliseconds
 */
export function getSessionTimeRemaining(page: string): number {
  const sessions = getSessions();
  const session = sessions.find(s => s.page === page);
  
  if (!session) return 0;
  
  const remaining = session.expiresAt - Date.now();
  return Math.max(0, remaining);
}

/**
 * Clear expired sessions from localStorage
 */
export function clearExpiredSessions(): void {
  const sessions = getSessions();
  const now = Date.now();
  
  const validSessions = sessions.filter(s => s.expiresAt > now);
  
  saveSessions(validSessions);
}

/**
 * Clear all sessions (useful for logout)
 */
export function clearAllSessions(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Get session for a specific page
 */
export function getSession(page: string): PaymentSession | null {
  clearExpiredSessions();
  const sessions = getSessions();
  return sessions.find(s => s.page === page) || null;
}

// Helper functions
function getSessions(): PaymentSession[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading sessions:', error);
    return [];
  }
}

function saveSessions(sessions: PaymentSession[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving sessions:', error);
  }
}

