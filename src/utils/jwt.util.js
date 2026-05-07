/**
 * JWT Helpers.
 *
 * Flow:
 *   1. User login berhasil → signToken({ user_id, email }) → return token ke user
 *   2. User hit protected endpoint dengan header `Authorization: Bearer <token>`
 *   3. Auth middleware → verifyToken(token) → kalo valid, attach payload ke req.user
 *
 * Payload yang gua simpen di JWT MINIMAL — cuma user_id & email.
 * JANGAN simpan password atau data sensitif di JWT (token bisa di-decode siapa aja).
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Sign JWT untuk user.
 * @param {{ user_id: number, email: string }} payload
 * @returns {string} - JWT token string
 */
function signToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

/**
 * Verify JWT dan return decoded payload.
 * Throws error kalo token invalid/expired.
 * @param {string} token
 * @returns {{ user_id: number, email: string, iat: number, exp: number }}
 */
function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

module.exports = { signToken, verifyToken };