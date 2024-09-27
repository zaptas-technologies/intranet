const connect = require('./config/db');
const express = require('express');
const config = require('./config/connect');
const announcementRoutes = require('./routes/announcementRoutes');

const app = express();

// Middleware to parse JSON
app.use(express.json());

app.use('/v1/announcements', announcementRoutes); 


const PORT = config.server.port   

app.listen(PORT, async () => {
    await connect()
  console.log(`Server is running on port ${PORT}`)
});