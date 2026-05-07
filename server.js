const express = require('express');
const config = require('./src/config/env');
const prisma = require('./src/config/prisma');

const app = express();
const PORT = 3000;

app.use(express.json());

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
    });
  } catch (error) {
    res.status(500).json({
      msg: 'Health check failed',
      error: error.message,
    });
  }
});
// buat ngestart server 
app.listen(PORT, ()=> {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Environment: ${config.nodeEnv}`);
});