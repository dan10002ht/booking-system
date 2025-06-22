import express from 'express';
import { body } from 'express-validator';

// Import handlers
import {
  processPaymentHandler,
  getPaymentHistoryHandler,
  getPaymentHandler,
  refundPaymentHandler
} from '../handlers/index.js';

const router = express.Router();

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Process payment
 *     description: Process a payment for a booking
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - amount
 *               - paymentMethod
 *             properties:
 *               bookingId:
 *                 type: string
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, debit_card, bank_transfer]
 *               cardNumber:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *               cvv:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       402:
 *         description: Payment failed
 */
router.post('/', [
  body('bookingId').notEmpty().trim(),
  body('amount').isFloat({ min: 0.01 }),
  body('paymentMethod').isIn(['credit_card', 'debit_card', 'bank_transfer']),
  body('cardNumber').optional().isCreditCard(),
  body('expiryDate').optional().matches(/^\d{2}\/\d{2}$/),
  body('cvv').optional().isLength({ min: 3, max: 4 })
], processPaymentHandler);

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get payment history
 *     description: Retrieve payment history for the current user
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', getPaymentHistoryHandler);

/**
 * @swagger
 * /payments/{paymentId}:
 *   get:
 *     summary: Get payment by ID
 *     description: Retrieve a specific payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.get('/:paymentId', getPaymentHandler);

/**
 * @swagger
 * /payments/{paymentId}/refund:
 *   post:
 *     summary: Refund payment
 *     description: Refund a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment refunded successfully
 *       400:
 *         description: Payment cannot be refunded
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.post('/:paymentId/refund', [
  body('reason').notEmpty().trim()
], refundPaymentHandler);

export default router; 