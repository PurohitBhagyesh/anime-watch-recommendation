import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { connectDB } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple request logger
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Lightweight Health/Ping Endpoints for Keep-Alive & Monitoring (UptimeRobot, etc.)
app.get(['/ping', '/healthz'], (_req, res) => {
  res.status(200).send('pong');
});

// Root Welcome Endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'AnimeSenpai API (animesenpai.online)',
    version: '1.0.0',
    status: 'online',
    docs: '/api/health',
    endpoints: {
      auth: '/api/auth',
      anime: '/api/anime',
      watchlist: '/api/watchlist',
      recommendations: '/api/recommendations',
      reviews: '/api/reviews',
    },
  });
});

// Mount Main API Router
app.use('/api', apiRoutes);

// 404 Fallback Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    },
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server
async function startServer() {
  await connectDB();

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`
🚀 ===================================================
   Voltaku Backend API Server Running
   URL:     http://localhost:${PORT}
   Health:  http://localhost:${PORT}/api/health
   Mode:    ${process.env.NODE_ENV || 'development'}
=================================================== 🎯
    `);
  });
}

startServer().catch((err) => {
  console.error('Failed to launch Voltaku server:', err);
  process.exit(1);
});

export default app;
