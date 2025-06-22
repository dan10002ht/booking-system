import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';
import grpcClients from '../grpc/clients.js';
import { sendSuccessResponse, createHandler, createSimpleHandler } from '../utils/responseHandler.js';

// Custom error mappings for payment service
const paymentErrorMapping = {
  3: { status: 400, message: 'Invalid payment data' }, // INVALID_ARGUMENT
  5: { status: 404, message: 'Payment not found' },    // NOT_FOUND
  9: { status: 400, message: 'Payment cannot be refunded' }, // FAILED_PRECONDITION
  10: { status: 402, message: 'Payment failed' }       // ABORTED
};

/**
 * Process payment
 */
const processUserPayment = async (req, res) => {
  const result = await grpcClients.paymentService.processPayment({
    userId: req.user.id,
    ...req.body
  });
  sendSuccessResponse(res, 200, result, req.correlationId);
};

/**
 * Get payment history
 */
const getUserPaymentHistory = async (req, res) => {
  const result = await grpcClients.paymentService.getPaymentHistory({
    userId: req.user.id,
    limit: req.query.limit,
    offset: req.query.offset
  });
  sendSuccessResponse(res, 200, result, req.correlationId);
};

/**
 * Get payment by ID
 */
const getPaymentById = async (req, res) => {
  const result = await grpcClients.paymentService.getPayment({
    paymentId: req.params.paymentId,
    userId: req.user.id
  });
  sendSuccessResponse(res, 200, result, req.correlationId);
};

/**
 * Refund payment
 */
const refundUserPayment = async (req, res) => {
  const result = await grpcClients.paymentService.refundPayment({
    paymentId: req.params.paymentId,
    userId: req.user.id,
    reason: req.body.reason
  });
  sendSuccessResponse(res, 200, result, req.correlationId);
};

// Export wrapped handlers
export const processPaymentHandler = createHandler(processUserPayment, 'Payment', 'processPayment', paymentErrorMapping);
export const getPaymentHistoryHandler = createSimpleHandler(getUserPaymentHistory, 'Payment', 'getPaymentHistory');
export const getPaymentHandler = createSimpleHandler(getPaymentById, 'Payment', 'getPayment', paymentErrorMapping);
export const refundPaymentHandler = createHandler(refundUserPayment, 'Payment', 'refundPayment', paymentErrorMapping); 