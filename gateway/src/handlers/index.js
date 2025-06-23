// Auth handlers
export {
  registerHandler,
  loginHandler,
  refreshTokenHandler,
  logoutHandler,
} from './authHandlers.js';

// User handlers
export {
  getProfileHandler,
  updateProfileHandler,
  getAddressesHandler,
  addAddressHandler,
  updateAddressHandler,
  deleteAddressHandler,
} from './userHandlers.js';

// Booking handlers
export {
  createBookingHandler,
  getUserBookingsHandler,
  getBookingHandler,
  cancelBookingHandler,
  updateBookingHandler,
} from './bookingHandlers.js';

// Event handlers
export {
  getEventsHandler,
  getEventHandler,
  createEventHandler,
  updateEventHandler,
  deleteEventHandler,
} from './eventHandlers.js';

// Payment handlers
export {
  processPaymentHandler,
  getUserPaymentsHandler,
  getPaymentHandler,
  refundPaymentHandler,
  getPaymentMethodsHandler,
  addPaymentMethodHandler,
} from './paymentHandlers.js';
