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
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://unpkg.com", "https://calendar.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com", "https://calendar.google.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://calendar.google.com", "https://ssl.gstatic.com"],
      connectSrc: ["'self'", "https://calendar.google.com", "https://accounts.google.com"],
      frameSrc: ["'self'", "https://calendar.google.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'self'"],
      childSrc: ["'self'", "https://calendar.google.com"],
      formAction: ["'self'"]
    },
  },
})); // Sets secure headers
app.use(compression()); // Gzip compression for faster response
//app.use(morgan('combined')); // Logs HTTP requests
app.use(express.json({ limit: '10mb' })); // Adjust payload limit if needed
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use(limiter); // Rate Limit

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  },
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
