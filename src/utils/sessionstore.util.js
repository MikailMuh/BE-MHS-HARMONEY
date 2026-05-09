/**
 * In-Memory Session Store untuk Split Bill.
 *
 * Replicate behavior `private sessions = new Map<>()` di NestJS service PM.
 * Lifecycle: dihapus pas Express restart.
 *
 * Struktur session:
 * {
 *   sessionId: string,
 *   merchantName: string,
 *   transactionDate: string (ISO) | null,
 *   totalAmount: number,
 *   friends: [{ name: string, total: number }],
 *   items: [{
 *     itemId: number,
 *     name: string,
 *     price: number,
 *     quantity: number,
 *     sharedWith: string[]  // array of friend names
 *   }]
 * }
 *
 * Note: "Me" auto-added pas session created. Gak boleh dihapus / di-rename.
 */

const sessions = new Map();

/**
 * Generate session ID format: `temp_{6 digit random}`
 * Match format dari API doc lu: "temp_8821"
 */
function generateSessionId() {
  return `temp_${Math.floor(100000 + Math.random() * 900000)}`;
}

/**
 * Generate item ID format: timestamp + random.
 */
function generateItemId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * Bikin session baru / overwrite kalo udah ada.
 * @param {string} sessionId
 * @returns {object} session data
 */
function createSession(sessionId) {
  const session = {
    sessionId,
    merchantName: '',
    transactionDate: null,
    totalAmount: 0,
    friends: [{ name: 'Me', total: 0 }], // Auto-add "Me"
    items: [],
  };
  sessions.set(sessionId, session);
  return session;
}

/**
 * Get session by ID. Return null kalo gak ada.
 * @param {string} sessionId
 */
function getSession(sessionId) {
  return sessions.get(sessionId) || null;
}

/**
 * Get session, atau bikin baru kalo gak ada (auto-init).
 * Berguna buat endpoint scan / add yang kadang dipanggil duluan sebelum session created.
 * @param {string} sessionId
 */
function getOrCreateSession(sessionId) {
  let session = sessions.get(sessionId);
  if (!session) {
    session = createSession(sessionId);
  }
  return session;
}

/**
 * Hapus session.
 */
function deleteSession(sessionId) {
  return sessions.delete(sessionId);
}

/**
 * Get all sessions (debug only).
 */
function getAllSessions() {
  return Array.from(sessions.values());
}

module.exports = {
  generateSessionId,
  generateItemId,
  createSession,
  getSession,
  getOrCreateSession,
  deleteSession,
  getAllSessions,
};