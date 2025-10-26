// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// ===============================
// ✅ Allowed Frontend Origins
// ===============================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL // example: https://your-frontend.onrender.com
];

// Warn if FRONTEND_URL is not set
if (!process.env.FRONTEND_URL) {
  console.warn('⚠️  FRONTEND_URL not set in environment variables');
}

// ===============================
// ✅ Middleware
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS setup (flexible for multiple environments)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow non-browser clients (like Postman)

      const allowed = allowedOrigins.some((o) =>
        origin.toLowerCase().startsWith(o?.toLowerCase() || '')
      );

      if (allowed) {
        callback(null, true);
      } else {
        console.error(`❌ CORS blocked request from: ${origin}`);
        callback(new Error('CORS policy: Origin not allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ===============================
// ✅ MongoDB Connection
// ===============================
const mongoURI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/wellness-tracker';

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err.message));

// ===============================
// ✅ Routes Import
// ===============================
try {
  const authRoutes = require('./routes/auth');
  const habitRoutes = require('./routes/habits');
  const streakRoutes = require('./routes/streaks');
  const progressRoutes = require('./routes/progress');
  const socialRoutes = require('./routes/social');
  const aiRoutes = require('./routes/ai');

  // Use Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/habits', habitRoutes);
  app.use('/api/streaks', streakRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/social', socialRoutes);
  app.use('/api/ai', aiRoutes);
} catch (err) {
  console.error('❌ Error importing routes:', err.message);
}

// ===============================
// ✅ Health & Root Routes
// ===============================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Wellness Tracker API is active 🚀',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Wellness Tracker API is running',
    timestamp: new Date().toISOString(),
  });
});

// ===============================
// ✅ 404 Handler
// ===============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ===============================
// ✅ Global Error Handler
// ===============================
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ===============================
// ✅ Start Server
// ===============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Export for testing or serverless environments
module.exports = app;
