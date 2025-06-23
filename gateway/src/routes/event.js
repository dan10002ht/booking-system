import express from 'express';

// Import handlers
import {
  getEventsHandler,
  getEventHandler,
  createEventHandler,
  updateEventHandler,
  deleteEventHandler,
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
 * /events:
 *   post:
 *     summary: Create new event
 *     description: Create a new event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Event created successfully
 */
router.post('/', createEventHandler);

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

/**
 * @swagger
 * /events/{eventId}:
 *   put:
 *     summary: Update event
 *     description: Update an existing event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Event updated successfully
 */
router.put('/:eventId', updateEventHandler);

/**
 * @swagger
 * /events/{eventId}:
 *   delete:
 *     summary: Delete event
 *     description: Delete an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 */
router.delete('/:eventId', deleteEventHandler);

export default router;
