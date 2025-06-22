import grpcClients from '../grpc/clients.js';
import { sendSuccessResponse, createHandler, createSimpleHandler } from '../utils/responseHandler.js';

// Custom error mappings for booking service
const bookingErrorMapping = {
  3: { status: 400, message: 'Invalid booking data' }, // INVALID_ARGUMENT
  5: { status: 404, message: 'Booking not found' },    // NOT_FOUND
  9: { status: 400, message: 'Booking cannot be cancelled' } // FAILED_PRECONDITION
};

/**
 * Create a new booking
 */
const createNewBooking = async (req, res) => {
  const result = await grpcClients.bookingService.createBooking({
    userId: req.user.id,
    ...req.body
  });
  sendSuccessResponse(res, 201, result, req.correlationId);
};

/**
 * Get user bookings
 */
const getUserBookings = async (req, res) => {
  const result = await grpcClients.bookingService.getUserBookings({
    userId: req.user.id,
    status: req.query.status
  });
  sendSuccessResponse(res, 200, result, req.correlationId);
};

/**
 * Get booking by ID
 */
const getBookingById = async (req, res) => {
  const result = await grpcClients.bookingService.getBooking({
    bookingId: req.params.bookingId,
    userId: req.user.id
  });
  sendSuccessResponse(res, 200, result, req.correlationId);
};

/**
 * Cancel booking
 */
const cancelUserBooking = async (req, res) => {
  const result = await grpcClients.bookingService.cancelBooking({
    bookingId: req.params.bookingId,
    userId: req.user.id
  });
  sendSuccessResponse(res, 200, result, req.correlationId);
};

// Export wrapped handlers
export const createBookingHandler = createHandler(createNewBooking, 'Booking', 'createBooking', bookingErrorMapping);
export const getUserBookingsHandler = createSimpleHandler(getUserBookings, 'Booking', 'getUserBookings');
export const getBookingHandler = createSimpleHandler(getBookingById, 'Booking', 'getBooking', bookingErrorMapping);
export const cancelBookingHandler = createSimpleHandler(cancelUserBooking, 'Booking', 'cancelBooking', bookingErrorMapping); 