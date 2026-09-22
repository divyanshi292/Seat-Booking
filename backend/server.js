const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');
const models = require('./models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const apiRoutes = require('./routes/api');

// Basic Route
app.get('/', (req, res) => {
  res.send('Seat Booking API is running...');
});

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  // Sync database models (Use { force: false } in production to avoid losing data)
  await sequelize.sync({ alter: true });
  console.log('✅ Database models synced.');

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
