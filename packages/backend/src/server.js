import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite frontend
  credentials: true
}));
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'IdealistaPlus Backend API',
    version: '1.0.0',
    status: 'running'
  });
});

// API routes (to be added in next milestone)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Backend server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV}`);
  console.log(`✓ Ready to accept requests`);
});
