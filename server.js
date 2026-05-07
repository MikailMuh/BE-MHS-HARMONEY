const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        msg: 'Hello Harmoney! Backend Express is running',
        timestamp: new Date().toISOString(),
    });
});

// buat ngestart server 
app.listen(PORT, ()=> {
    console.log(`Server is running on http://localhost:${PORT}`);
});