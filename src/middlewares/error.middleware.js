/**
 * Global Error Handler Middleware.
 *
 * Express ngerti ini sebagai error handler karena dia punya 4 parameter (err, req, res, next).
 * Wajib di-register di app.js PALING AKHIR (setelah semua route).
 *
 * Cara kerja:
 *   - Controller / service throw error / pass next(err)
 *   - Express skip semua middleware lain, langsung ke sini
 *   - Kita format error jadi response yang konsisten
 */

const { Prisma } = require('@prisma/client');
const config = require('../config/env');

/**
 * Express error handler middleware.
 * Order parameter (err, req, res, next) WAJIB — itu yang Express deteksi.
 */
function errorHandler(err, req, res, next) {
  // Log error ke console (di production, lu bisa kirim ke Sentry/Datadog)
  console.error('[ERROR]', err.name, '-', err.message);
  if (!config.isProduction) {
    console.error(err.stack);
  }

  // === Handle Prisma Errors ===
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation (duplicate email, etc.)
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'field';
      return res.status(409).json({
        msg: `${field} already exists`,
      });
    }
    // Foreign key constraint failed
    if (err.code === 'P2003') {
      return res.status(400).json({
        msg: 'Invalid reference to related resource',
      });
    }
    // Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        msg: 'Resource not found',
      });
    }
  }

  // === Handle JWT Errors ===
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ msg: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ msg: 'Token has expired, please login again' });
  }

  // === Handle Custom App Errors ===
  // Kalo lu throw error dengan property `statusCode`, kita pake itu
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      msg: err.message || 'An error occurred',
    });
  }

  // === Default: 500 Internal Server Error ===
  return res.status(500).json({
    msg: config.isProduction
      ? 'Internal server error'
      : err.message || 'Internal server error',
  });
}

/**
 * 404 handler untuk route yang gak match apa-apa.
 * Register sebelum errorHandler di app.js.
 */
function notFoundHandler(req, res) {
  return res.status(404).json({
    msg: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

module.exports = { errorHandler, notFoundHandler };