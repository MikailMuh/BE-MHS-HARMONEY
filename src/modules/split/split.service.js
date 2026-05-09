

const axios = require('axios');
const FormData = require('form-data');
const config = require('../../config/env');
const sessionStore = require('../../utils/sessionstore.util');


function recalculateTotalAmount(session) {
  session.totalAmount = session.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
}


function recalculateFriendTotals(session) {
  // Reset semua friend total ke 0
  session.friends.forEach((f) => {
    f.total = 0;
  });

  // Iterate items, distribute harga ke shared friends
  for (const item of session.items) {
    if (!item.sharedWith || item.sharedWith.length === 0) continue;

    const itemTotal = item.price * item.quantity;
    const portionPerFriend = itemTotal / item.sharedWith.length;

    for (const friendName of item.sharedWith) {
      const friend = session.friends.find((f) => f.name === friendName);
      if (friend) {
        friend.total += portionPerFriend;
      }
    }
  }
}


function getSession(sessionId) {
  let session = sessionStore.getSession(sessionId);
  if (!session) {
    // Kalo session belum ada, auto-create (sesuai behavior NestJS)
    session = sessionStore.createSession(sessionId);
  }
  return session;
}

/**
 * POST /api/split/scan/:sessionId
 * Forward image ke Python OCR, sync result ke session.
 *
 * @param {string} sessionId
 * @param {Buffer} imageBuffer - dari multer (req.file.buffer)
 * @param {string} originalFilename
 * @param {string} mimetype
 */
async function scanReceipt(sessionId, imageBuffer, originalFilename, mimetype) {
  // 1. Build FormData buat dikirim ke Python
  const formData = new FormData();
  formData.append('image', imageBuffer, {
    filename: originalFilename,
    contentType: mimetype,
  });

  // 2. Call Python service
  let pythonResponse;
  try {
    pythonResponse = await axios.post(
      `${config.pythonOcr.serviceUrl}/scan-receipt`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 60000, // 60 sec - PaddleOCR + Groq bisa lambat
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      throw new ServiceError(
        'Python OCR service is not running. Start it on port 5000.',
        503
      );
    }
    if (err.code === 'ECONNABORTED') {
      throw new ServiceError('OCR service timeout. Image too complex.', 504);
    }
    // Python service returned 4xx/5xx
    if (err.response) {
      const pythonError =
        err.response.data?.error || 'Unknown OCR service error';
      throw new ServiceError(
        `OCR failed: ${pythonError}`,
        err.response.status === 400 ? 400 : 502
      );
    }
    throw new ServiceError(`OCR service error: ${err.message}`, 502);
  }

  // 3. Validate Python response shape
  const { success, data, error } = pythonResponse.data;
  if (!success || !data) {
    throw new ServiceError(
      `OCR service returned failure: ${error || 'unknown'}`,
      502
    );
  }

  // 4. Sync result ke session
  let session = sessionStore.getSession(sessionId);
  if (!session) {
    session = sessionStore.createSession(sessionId);
  }

  // Set transaction date dari OCR (kalo ada)
  if (data.date) {
    session.transactionDate = data.date;
  }

  // Convert OCR items ke format session.items
  // OCR returns: { name, quantity, unit_price, total_price }
  // Session item:  { itemId, name, price, quantity, sharedWith }
  if (Array.isArray(data.items)) {
    for (const ocrItem of data.items) {
      const newItem = {
        itemId: sessionStore.generateItemId(),
        name: ocrItem.name || 'Unknown Item',
        price: Number(ocrItem.unit_price) || 0,
        quantity: Number(ocrItem.quantity) || 1,
        sharedWith: [], // belum di-assign
      };
      session.items.push(newItem);
    }
  }

  // 5. Recalculate totals
  recalculateTotalAmount(session);
  recalculateFriendTotals(session);

  return session;
}

/**
 * POST /api/split/friend/:sessionId
 * Add friend ke session.
 */
function addFriend(sessionId, friendName) {
  if (!friendName || friendName.trim() === '') {
    throw new ServiceError('Friend name cannot be empty', 400);
  }

  const trimmedName = friendName.trim();
  const session = getSession(sessionId);

  // Cek duplicate
  const exists = session.friends.find(
    (f) => f.name.toLowerCase() === trimmedName.toLowerCase()
  );
  if (exists) {
    throw new ServiceError('Friend with this name already exists', 409);
  }

  session.friends.push({ name: trimmedName, total: 0 });
  return session;
}

/**
 * PATCH /api/split/friend/:sessionId/:oldName
 * Rename friend.
 */
function editFriend(sessionId, oldName, newName) {
  if (!newName || newName.trim() === '') {
    throw new ServiceError('New friend name cannot be empty', 400);
  }

  const trimmedNewName = newName.trim();
  const session = getSession(sessionId);

  // "Me" gak boleh di-rename (sesuai NestJS PM)
  if (oldName === 'Me') {
    throw new ServiceError('Cannot rename "Me"', 400);
  }

  const friend = session.friends.find((f) => f.name === oldName);
  if (!friend) {
    throw new ServiceError(`Friend "${oldName}" not found`, 404);
  }

  // Cek duplicate dengan nama baru
  const duplicate = session.friends.find(
    (f) =>
      f.name.toLowerCase() === trimmedNewName.toLowerCase() && f.name !== oldName
  );
  if (duplicate) {
    throw new ServiceError('Another friend with this name already exists', 409);
  }

  // Rename di friend list
  friend.name = trimmedNewName;

  // Update juga di item.sharedWith (kalo ke-assign)
  for (const item of session.items) {
    if (item.sharedWith && item.sharedWith.includes(oldName)) {
      item.sharedWith = item.sharedWith.map((n) =>
        n === oldName ? trimmedNewName : n
      );
    }
  }

  recalculateFriendTotals(session);
  return session;
}

/**
 * DELETE /api/split/friend/:sessionId/:name
 * Remove friend.
 */
function deleteFriend(sessionId, name) {
  const session = getSession(sessionId);

  // "Me" gak boleh dihapus
  if (name === 'Me') {
    throw new ServiceError('Cannot delete "Me"', 400);
  }

  const idx = session.friends.findIndex((f) => f.name === name);
  if (idx === -1) {
    throw new ServiceError(`Friend "${name}" not found`, 404);
  }

  session.friends.splice(idx, 1);

  // Hapus dari sharedWith di semua items
  for (const item of session.items) {
    if (item.sharedWith) {
      item.sharedWith = item.sharedWith.filter((n) => n !== name);
    }
  }

  recalculateFriendTotals(session);
  return session;
}

/**
 * POST /api/split/item/:sessionId
 * Add item manual.
 */
function addItem(sessionId, itemData) {
  const { name, price, quantity } = itemData;

  if (!name || name.trim() === '') {
    throw new ServiceError('Item name cannot be empty', 400);
  }
  if (price === undefined || price === null || Number(price) < 0) {
    throw new ServiceError('Price must be a non-negative number', 400);
  }
  if (quantity === undefined || quantity === null || Number(quantity) < 1) {
    throw new ServiceError('Quantity must be at least 1', 400);
  }

  const session = getSession(sessionId);

  const newItem = {
    itemId: sessionStore.generateItemId(),
    name: name.trim(),
    price: Number(price),
    quantity: Number(quantity),
    sharedWith: [],
  };
  session.items.push(newItem);

  recalculateTotalAmount(session);
  return session;
}

/**
 * PATCH /api/split/item/:sessionId/:itemId
 * Edit item (partial update).
 */
function editItem(sessionId, itemId, updates) {
  const session = getSession(sessionId);
  const item = session.items.find((i) => i.itemId === Number(itemId));

  if (!item) {
    throw new ServiceError(`Item with ID ${itemId} not found`, 404);
  }

  // Apply partial updates
  if (updates.name !== undefined) {
    if (!updates.name || updates.name.trim() === '') {
      throw new ServiceError('Item name cannot be empty', 400);
    }
    item.name = updates.name.trim();
  }
  if (updates.price !== undefined) {
    if (Number(updates.price) < 0) {
      throw new ServiceError('Price must be non-negative', 400);
    }
    item.price = Number(updates.price);
  }
  if (updates.quantity !== undefined) {
    if (Number(updates.quantity) < 1) {
      throw new ServiceError('Quantity must be at least 1', 400);
    }
    item.quantity = Number(updates.quantity);
  }

  recalculateTotalAmount(session);
  recalculateFriendTotals(session);
  return session;
}

/**
 * DELETE /api/split/item/:sessionId/:itemId
 */
function deleteItem(sessionId, itemId) {
  const session = getSession(sessionId);
  const idx = session.items.findIndex((i) => i.itemId === Number(itemId));

  if (idx === -1) {
    throw new ServiceError(`Item with ID ${itemId} not found`, 404);
  }

  session.items.splice(idx, 1);

  recalculateTotalAmount(session);
  recalculateFriendTotals(session);
  return session;
}

/**
 * PUT /api/split/assign/:sessionId/:itemId
 * Assign friends ke item (replace, bukan append).
 */
function assignFriendsToItem(sessionId, itemId, friendNames) {
  if (!Array.isArray(friendNames)) {
    throw new ServiceError('sharedWith must be an array of friend names', 400);
  }

  const session = getSession(sessionId);
  const item = session.items.find((i) => i.itemId === Number(itemId));

  if (!item) {
    throw new ServiceError(`Item with ID ${itemId} not found`, 404);
  }

  // Validate semua nama exist di session.friends
  const validFriendNames = new Set(session.friends.map((f) => f.name));
  for (const name of friendNames) {
    if (!validFriendNames.has(name)) {
      throw new ServiceError(`Friend "${name}" not found in this session`, 404);
    }
  }

  // Replace assignment
  item.sharedWith = [...new Set(friendNames)]; // dedupe

  recalculateFriendTotals(session);
  return session;
}

/**
 * GET /api/split/summary/:sessionId
 * Calculate split per friend.
 */
function getSummary(sessionId) {
  const session = getSession(sessionId);

  // Pastiin totals up-to-date
  recalculateTotalAmount(session);
  recalculateFriendTotals(session);

  // Build summary per friend
  const participants = session.friends.map((friend) => {
    const friendItems = session.items
      .filter((item) => item.sharedWith && item.sharedWith.includes(friend.name))
      .map((item) => ({
        name: item.name,
        qty: item.quantity,
        portion: (item.price * item.quantity) / item.sharedWith.length,
      }));

    return {
      name: friend.name,
      total: friend.total,
      items: friendItems,
    };
  });

  return {
    sessionId: session.sessionId,
    merchantName: session.merchantName,
    transactionDate: session.transactionDate,
    totalAmount: session.totalAmount,
    participants,
  };
}

// ============================================================
// CUSTOM ERROR (biar controller bisa map ke status code)
// ============================================================

class ServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'ServiceError';
    this.statusCode = statusCode;
  }
}

module.exports = {
  // Methods
  getSession,
  scanReceipt,
  addFriend,
  editFriend,
  deleteFriend,
  addItem,
  editItem,
  deleteItem,
  assignFriendsToItem,
  getSummary,
  // Error class (dipake controller buat type-check)
  ServiceError,
};