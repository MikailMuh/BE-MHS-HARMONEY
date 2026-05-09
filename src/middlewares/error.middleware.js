

const { Prisma } = require('@prisma/client');
const config = require('../config/env');


function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.name, '-', err.message);
  if (!config.isProduction) {
    console.error(err.stack);
  }


  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'field';
      return res.status(409).json({
        msg: `${field} already exists`,
      });
    }

    if (err.code === 'P2003') {
      return res.status(400).json({
        msg: 'Invalid reference to related resource',
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({
        msg: 'Resource not found',
      });
    }
  }


  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ msg: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ msg: 'Token has expired, please login again' });
  }


  if (err.statusCode) {
    return res.status(err.statusCode).json({
      msg: err.message || 'An error occurred',
    });
  }


  return res.status(500).json({
    msg: config.isProduction
      ? 'Internal server error'
      : err.message || 'Internal server error',
  });
}


function notFoundHandler(req, res) {
  return res.status(404).json({
    msg: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

module.exports = { errorHandler, notFoundHandler };