import express from 'express';
import { body } from 'express-validator';

// Import handlers
import {
  createBookingHandler,
  getUserBookingsHandler,
  getBookingHandler,
  cancelBookingHandler
} from '../handlers/index.js';

const router = express.Router();

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     description: Create a new booking for an event
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - ticketQuantity
 *             properties:
 *               eventId:
 *                 type: string
 *               ticketQuantity:
 *                 type: integer
 *                 minimum: 1
 *               specialRequests:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', [
  body('eventId').notEmpty().trim(),
  body('ticketQuantity').isInt({ min: 1 }),
  body('specialRequests').optional().trim()
], createBookingHandler);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get user bookings
 *     description: Retrieve all bookings for the current user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', getUserBookingsHandler);

/**
 * @swagger
 * /bookings/{bookingId}:
 *   get:
 *     summary: Get booking by ID
 *     description: Retrieve a specific booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */
router.get('/:bookingId', getBookingHandler);

/**
 * @swagger
 * /bookings/{bookingId}/cancel:
 *   post:
 *     summary: Cancel booking
 *     description: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       400:
 *         description: Booking cannot be cancelled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */
router.post('/:bookingId/cancel', cancelBookingHandler);

export default router; 