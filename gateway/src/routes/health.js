import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

router.get('/', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    service: 'gateway',
    correlationId: req.correlationId,
  };

  logger.info('Health check requested', {
    correlationId: req.correlationId,
  });

  res.status(200).json(healthData);
});

router.get('/ready', (req, res) => {
  const readinessData = {
    status: 'ready',
    timestamp: new Date().toISOString(),
    service: 'gateway',
    correlationId: req.correlationId,
  };

  logger.info('Readiness check requested', {
    correlationId: req.correlationId,
  });

  res.status(200).json(readinessData);
});

router.get('/live', (req, res) => {
  const livenessData = {
    status: 'alive',
    timestamp: new Date().toISOString(),
    service: 'gateway',
    correlationId: req.correlationId,
  };

  logger.info('Liveness check requested', {
    correlationId: req.correlationId,
  });

  res.status(200).json(livenessData);
});

export default router;
