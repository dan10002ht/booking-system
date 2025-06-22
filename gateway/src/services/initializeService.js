import express from 'express';

import config from '../config/index.js';
import logger from '../utils/logger.js';

// Import middleware
import {
  securityMiddleware,
  compressionMiddleware,
  bodyParsingMiddleware,
  loggingMiddleware,
  rateLimitMiddleware,
  errorHandlerMiddleware
} from '../middleware/index.js';

// Import services
import { initializeSwagger } from './swaggerService.js';
import { initializeMetrics } from './metricsService.js';
import { initializeRoutes } from './routeService.js';
import { initializeErrorHandling } from './errorHandlingService.js';

/**
 * Initialize all gateway services and middleware
 * @param {express.Application} app - Express app instance
 */
export const initializeGateway = (app) => {
  // Initialize Swagger
  const swaggerSpec = initializeSwagger();

  // Initialize Prometheus metrics
  const metricsMiddleware = initializeMetrics();

  // Initialize rate limiting
  const { limiter, speedLimiter } = rateLimitMiddleware();

  // Apply middleware in order
  securityMiddleware(app);
  compressionMiddleware(app);
  bodyParsingMiddleware(app);
  loggingMiddleware(app);
  
  // Apply rate limiting
  app.use(limiter);
  app.use(speedLimiter);

  // Initialize monitoring
  app.use(metricsMiddleware);

  // Initialize routes
  initializeRoutes(app, swaggerSpec);

  // Initialize error handling (must be last)
  initializeErrorHandling(app);

  logger.info('Gateway initialization completed');
}; 