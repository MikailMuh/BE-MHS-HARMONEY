const { verifyToken } = require('../utils/jwt.util');
const { unauthorized } = require('../utils/response.util');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, 'Authorization token is missing or malformed');
  }

  const token = authHeader.substring(7).trim();

  if (!token) {
    return unauthorized(res, 'Authorization token is empty');
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      user_id: payload.user_id,
      email: payload.email,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token has expired, please login again');
    }
    return unauthorized(res, 'Invalid token');
  }
}

module.exports = { authenticate };