const express = require('express');
const config = require('./src/config/env');
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

// buat ngestart server 
app.listen(PORT, ()=> {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Environment: ${config.nodeEnv}`);
});