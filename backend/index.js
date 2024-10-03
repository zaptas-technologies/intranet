const connect = require('./config/db');
const express = require('express');
const config = require('./config/connect');
const announcementRoutes = require('./routes/announcementRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const userRoutes = require('./routes/auth');

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Define routes
app.use('/v1', userRoutes);
app.use('/v1/announcements', announcementRoutes);
app.use('/v1/calendar', calendarRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = config.server.port;

app.listen(PORT, async () => {
  await connect();
  console.log(`Server is running on port ${PORT}`);
});
