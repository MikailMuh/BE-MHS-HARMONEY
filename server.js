const express = require('express');
const cors = require('cors');
const config = require('./src/config/env');
const prisma = require('./src/config/prisma');
const {errorHandler, notFoundHandler} = require('./src/middlewares/error.middleware');

const app = express();
const PORT = 3000;

app.use(cors({origin: config.cors.origins}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({
        msg: 'Hello Harmoney! Backend Express is running',
        env: config.nodeEnv,
        port: config.port,
        timestamp: new Date().toISOString(),
    });
});

// health check 
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const userCount = await prisma.user.count();

    res.json({
      msg: 'Health check passed',
      database: 'connected',
      stats: {
        users: userCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

app.get('/test-error', (req, res, next) => {
    const err = new Error('This is a test error');
    err.statusCode = 418;
    throw err;
});

app.use(notFoundHandler);
app.use(errorHandler);

// buat ngestart server 
app.listen(PORT, ()=> {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});