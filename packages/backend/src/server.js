import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import scraperRoutes from './routes/scraper.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { closeBrowser } from './services/puppeteer.service.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Rate limiting: 50 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.'
  }
});
app.use('/api/', apiLimiter);

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'IdealistaPlus Backend API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/scraper', scraperRoutes);

// Error handling (must be after routes)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Backend server running on http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('Ready to accept requests');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down...');
  await closeBrowser();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down...');
  await closeBrowser();
  process.exit(0);
});
