require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes');
const path = require('path');
const cron = require('node-cron');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const yourMidnightTask = require('./utils/midnightTask');


const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(helmet()); // Sets secure headers
app.use(compression()); // Gzip compression for faster response
app.use(morgan('combined')); // Logs HTTP requests
app.use(express.json({ limit: '10mb' })); // Adjust payload limit if needed

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // In production, use your domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Serve static files (e.g. for public reports or images)
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/', routes);

// Scheduled Cron Job
cron.schedule('0 0 * * *', async () => {
  const start = Date.now();
  console.log('[CRON] Midnight job started at', new Date());

  try {
    await yourMidnightTask(); // Define this function elsewhere
  } catch (err) {
    console.error('[CRON ERROR]', err);
  }

  console.log('[CRON] Finished in', Date.now() - start, 'ms');
});

// Global 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
