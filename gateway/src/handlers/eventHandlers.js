import grpcClients from '../grpc/clients.js';
import { sendSuccessResponse, createSimpleHandler } from '../utils/responseHandler.js';

// Custom error mappings for event service
const eventErrorMapping = {
  5: { status: 404, message: 'Event not found' } // NOT_FOUND
};

/**
 * Get all events
 */
const getAllEvents = async (req, res) => {
  const result = await grpcClients.eventService.getEvents({
    category: req.query.category,
    location: req.query.location,
    date: req.query.date
  });
  sendSuccessResponse(res, 200, result, req.correlationId);
};

/**
 * Get event by ID
 */
const getEventById = async (req, res) => {
  const result = await grpcClients.eventService.getEvent({
    eventId: req.params.eventId
  });
  sendSuccessResponse(res, 200, result, req.correlationId);
};

/**
 * Search events
 */
const searchAllEvents = async (req, res) => {
  const result = await grpcClients.eventService.searchEvents({
    query: req.query.q,
    category: req.query.category,
    location: req.query.location,
    date: req.query.date
  });
  sendSuccessResponse(res, 200, result, req.correlationId);
};

// Export wrapped handlers
export const getEventsHandler = createSimpleHandler(getAllEvents, 'Event', 'getEvents');
export const getEventHandler = createSimpleHandler(getEventById, 'Event', 'getEvent', eventErrorMapping);
export const searchEventsHandler = createSimpleHandler(searchAllEvents, 'Event', 'searchEvents'); 