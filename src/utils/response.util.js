/**
 * Standardized API Response Helpers.
 *
 * Format yang dipake di seluruh app (sesuai API doc Harmoney):
 *   Success: { msg: string, data?: any, ...extra }
 *   Failure: { msg: string | object }
 *
 * Pake helper ini di SEMUA controller biar response-nya konsisten.
 */

/**
 * Success response (200 OK by default).
 * @param {import('express').Response} res
 * @param {string} msg - pesan untuk user
 * @param {*} [data] - data payload (optional)
 * @param {number} [status=200] - HTTP status code
 * @param {object} [extra] - field tambahan di top-level (e.g., summary, categories)
 */
function success(res, msg, data = undefined, status = 200, extra = {}) {
  const body = { msg, ...extra };
  if (data !== undefined) body.data = data;
  return res.status(status).json(body);
}

/**
 * Created response (201) - dipake buat POST yang bikin resource baru.
 */
function created(res, msg, data = undefined) {
  return success(res, msg, data, 201);
}

/**
 * Generic failure response.
 * @param {import('express').Response} res
 * @param {string|object} msg - pesan error (bisa object kalo dari Zod validation)
 * @param {number} [status=400]
 */
function fail(res, msg, status = 400) {
  return res.status(status).json({ msg });
}

/**
 * 401 Unauthorized - token gak ada / expired.
 */
function unauthorized(res, msg = 'Unauthorized access or invalid session') {
  return fail(res, msg, 401);
}

/**
 * 403 Forbidden - user authenticated tapi gak punya akses.
 */
function forbidden(res, msg = 'You do not have permission to access this resource') {
  return fail(res, msg, 403);
}

/**
 * 404 Not Found.
 */
function notFound(res, msg = 'Resource not found') {
  return fail(res, msg, 404);
}

/**
 * 500 Internal Server Error.
 */
function serverError(res, msg = 'Internal server error') {
  return fail(res, msg, 500);
}

module.exports = {
  success,
  created,
  fail,
  unauthorized,
  forbidden,
  notFound,
  serverError,
};