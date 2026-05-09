const express = require('express');
const cors = require('cors');
const config = require('./src/config/env');
const prisma = require('./src/config/prisma');
const apiRoutes = require('./src/routes');
const {
  errorHandler,
  notFoundHandler,
} = require('./src/middlewares/error.middleware');

const app = express();

// === GLOBAL MIDDLEWARES ===
app.use(cors({ origin: config.cors.origins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === ROOT & HEALTH ===
app.get('/', (req, res) => {
  res.json({
    msg: 'Hello Harmoney! Backend Express is running 🚀',
    env: config.nodeEnv,
    port: config.port,
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const userCount = await prisma.user.count();
    res.json({
      msg: 'Health check passed',
      database: 'connected',
      stats: { users: userCount },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// === API ROUTES (mounted at /api) ===
app.use('/api', apiRoutes);

// === ERROR HANDLERS (HARUS PALING AKHIR) ===
app.use(notFoundHandler);
app.use(errorHandler);

// === START SERVER ===
app.listen(config.port, () => {
  console.log(`✅ Server running on http://localhost:${config.port}`);
  console.log(`📦 Environment: ${config.nodeEnv}`);
  console.log(`🩺 Health check: http://localhost:${config.port}/health`);
  console.log(`🧾 Split Bill API: http://localhost:${config.port}/api/split`);
});