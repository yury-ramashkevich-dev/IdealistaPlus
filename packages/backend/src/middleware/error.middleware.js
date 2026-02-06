import logger from '../utils/logger.js';

export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  logger.error(`${req.method} ${req.path} - ${statusCode}: ${message}`);

  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'Internal server error' : message
  });
}
