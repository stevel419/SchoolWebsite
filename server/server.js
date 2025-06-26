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
  try {
    await Attendance.deleteMany({});
    console.log('Daily attendance reset at midnight.');
  } catch (error) {
    console.error('Error resetting attendance:', error);
  }
});

app.listen(port, () => {
    console.log("Server running on port " + port);
});