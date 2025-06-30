require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes');
const path = require('path'); 
const cron = require('node-cron');

const app = express();
const port = process.env.PORT || 3000;

connectDB();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json());

app.use('/', routes);

cron.schedule('0 0 * * *', async () => {
  const start = Date.now();
  console.log('[CRON] Starting midnight job at', new Date());

  try {
    await yourMidnightTask(); // e.g., reset finalize flags, etc.
  } catch (err) {
    console.error('[CRON ERROR]', err);
  }

  console.log('[CRON] Finished in', Date.now() - start, 'ms');
});

app.listen(port, () => {
    console.log("Server running on port " + port);
});