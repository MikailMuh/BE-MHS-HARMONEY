/**
 * Split Bill Routes.
 *
 * Base path: /api/split (akan di-mount di src/routes.js)
 *
 * Mapping endpoints (port dari NestJS controller PM):
 *   GET    /:sessionId                        → getSession
 *   POST   /scan/:sessionId                   → scanReceipt (multipart, field "image")
 *   POST   /friend/:sessionId                 → addFriend
 *   PATCH  /friend/:sessionId/:oldName        → editFriend
 *   DELETE /friend/:sessionId/:name           → deleteFriend
 *   POST   /item/:sessionId                   → addItem
 *   PATCH  /item/:sessionId/:itemId           → editItem
 *   DELETE /item/:sessionId/:itemId           → deleteItem
 *   PUT    /assign/:sessionId/:itemId         → assignFriendsToItem
 *   GET    /summary/:sessionId                → getSummary
 *
 * Note: NO auth middleware (sesuai NestJS PM yang juga skip auth).
 */

const express = require('express');
const controller = require('./split.controller');
const { uploadImage } = require('../../middlewares/upload.middleware');

const router = express.Router();


router.get('/', (req, res) => {
  const sessionStore = require('../../utils/sessionstore.util');
  const sessions = sessionStore.getAllSessions();
  res.json({
    msg: `${sessions.length} active session(s)`,
    data: sessions,
  });
});

router.post('/scan/:sessionId', uploadImage, controller.scanReceipt);

// === FRIEND ===
router.post('/friend/:sessionId', controller.addFriend);
router.patch('/friend/:sessionId/:oldName', controller.editFriend);
router.delete('/friend/:sessionId/:name', controller.deleteFriend);

// === ITEM ===
router.post('/item/:sessionId', controller.addItem);
router.patch('/item/:sessionId/:itemId', controller.editItem);
router.delete('/item/:sessionId/:itemId', controller.deleteItem);

// === ASSIGN ===
router.put('/assign/:sessionId/:itemId', controller.assignFriendsToItem);

// === SUMMARY ===
router.get('/summary/:sessionId', controller.getSummary);

// === GET SESSION (catch-all, MUST be last among GET routes) ===
router.get('/:sessionId', controller.getSession);

module.exports = router;