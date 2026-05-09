
const splitService = require('./split.service');
const { success, created } = require('../../utils/response.util');


async function getSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    const session = splitService.getSession(sessionId);
    return success(res, 'Session retrieved successfully', session);
  } catch (err) {
    next(err);
  }
}


async function scanReceipt(req, res, next) {
  try {
    const { sessionId } = req.params;
    // req.file sudah ke-validate sama upload middleware
    const { buffer, originalname, mimetype } = req.file;

    const session = await splitService.scanReceipt(
      sessionId,
      buffer,
      originalname,
      mimetype
    );

    return success(res, 'Receipt scanned and items synced to session', session);
  } catch (err) {
    next(err);
  }
}


async function addFriend(req, res, next) {
  try {
    const { sessionId } = req.params;
    const { name } = req.body;

    const session = splitService.addFriend(sessionId, name);
    return created(res, 'Friend added successfully', session);
  } catch (err) {
    next(err);
  }
}


async function editFriend(req, res, next) {
  try {
    const { sessionId, oldName } = req.params;
    const { name: newName } = req.body;

    const session = splitService.editFriend(sessionId, oldName, newName);
    return success(res, 'Friend renamed successfully', session);
  } catch (err) {
    next(err);
  }
}


async function deleteFriend(req, res, next) {
  try {
    const { sessionId, name } = req.params;

    const session = splitService.deleteFriend(sessionId, name);
    return success(res, 'Friend deleted successfully', session);
  } catch (err) {
    next(err);
  }
}


async function addItem(req, res, next) {
  try {
    const { sessionId } = req.params;
    const itemData = req.body;

    const session = splitService.addItem(sessionId, itemData);
    return created(res, 'Item added successfully', session);
  } catch (err) {
    next(err);
  }
}


async function editItem(req, res, next) {
  try {
    const { sessionId, itemId } = req.params;
    const updates = req.body;

    const session = splitService.editItem(sessionId, itemId, updates);
    return success(res, 'Item updated successfully', session);
  } catch (err) {
    next(err);
  }
}


async function deleteItem(req, res, next) {
  try {
    const { sessionId, itemId } = req.params;

    const session = splitService.deleteItem(sessionId, itemId);
    return success(res, 'Item deleted successfully', session);
  } catch (err) {
    next(err);
  }
}


async function assignFriendsToItem(req, res, next) {
  try {
    const { sessionId, itemId } = req.params;
    const { sharedWith } = req.body;

    const session = splitService.assignFriendsToItem(
      sessionId,
      itemId,
      sharedWith
    );
    return success(res, 'Friends assigned to item', session);
  } catch (err) {
    next(err);
  }
}


async function getSummary(req, res, next) {
  try {
    const { sessionId } = req.params;
    const summary = splitService.getSummary(sessionId);
    return success(res, 'Summary calculated', summary);
  } catch (err) {
    next(err);
  }
}

module.exports = {
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
};