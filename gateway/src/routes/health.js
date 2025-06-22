import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the gateway service
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Service uptime in seconds
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 service:
 *                   type: string
 *                   example: "gateway"
 */
router.get('/', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    service: 'gateway',
    correlationId: req.correlationId
  };

  logger.info('Health check requested', {
    correlationId: req.correlationId
  });

  res.status(200).json(healthData);
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check endpoint
 *     description: Returns the readiness status of the gateway service
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ready"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/ready', (req, res) => {
  const readinessData = {
    status: 'ready',
    timestamp: new Date().toISOString(),
    service: 'gateway',
    correlationId: req.correlationId
  };

  logger.info('Readiness check requested', {
    correlationId: req.correlationId
  });

  res.status(200).json(readinessData);
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness check endpoint
 *     description: Returns the liveness status of the gateway service
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "alive"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/live', (req, res) => {
  const livenessData = {
    status: 'alive',
    timestamp: new Date().toISOString(),
    service: 'gateway',
    correlationId: req.correlationId
  };

  logger.info('Liveness check requested', {
    correlationId: req.correlationId
  });

  res.status(200).json(livenessData);
});

export default router; 