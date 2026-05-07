/**
 * Auth Middleware.
 *
 * Cara pake:
 *   router.get('/wallets', authenticate, controller.getAll);
 *
 * Setelah middleware ini lewat, controller bisa akses:
 *   - req.user.user_id
 *   - req.user.email
 *
 * Kalo header Authorization gak ada / token invalid / expired,
 * middleware bales 401 langsung — controller gak ke-execute.
 */

const { verifyToken } = require('../utils/jwt.util');
const { unauthorized } = require('../utils/response.util');

/**
 * Verify JWT dari header Authorization.
 * Format header: `Authorization: Bearer <token>`
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  // Cek header ada dan format-nya bener
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, 'Authorization token is missing or malformed');
  }

  // Extract token (skip "Bearer " prefix)
  const token = authHeader.substring(7).trim();

  if (!token) {
    return unauthorized(res, 'Authorization token is empty');
  }

  try {
    const payload = verifyToken(token);
    // Attach ke req biar controller bisa akses
    req.user = {
      user_id: payload.user_id,
      email: payload.email,
    };
    next();
  } catch (err) {
    // Token expired
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token has expired, please login again');
    }
    // Token invalid (signature salah, dll)
    return unauthorized(res, 'Invalid token');
  }
}

module.exports = { authenticate };