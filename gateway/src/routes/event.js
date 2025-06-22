import express from 'express';

// Import handlers
import {
  getEventsHandler,
  getEventHandler,
  searchEventsHandler
} from '../handlers/index.js';

const router = express.Router();

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events
 *     description: Retrieve all available events with optional filtering
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Events retrieved successfully
 */
router.get('/', getEventsHandler);

/**
 * @swagger
 * /events/search:
 *   get:
 *     summary: Search events
 *     description: Search events by query string and filters
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */
router.get('/search', searchEventsHandler);

/**
 * @swagger
 * /events/{eventId}:
 *   get:
 *     summary: Get event by ID
 *     description: Retrieve a specific event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event retrieved successfully
 *       404:
 *         description: Event not found
 */
router.get('/:eventId', getEventHandler);

export default router; 