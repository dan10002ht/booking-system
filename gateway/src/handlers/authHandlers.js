import grpcClients from '../grpc/clients.js';
import { sendSuccessResponse, createHandler, createSimpleHandler } from '../utils/responseHandler.js';

// Custom error mappings for auth service
const authErrorMapping = {
  3: { status: 401, message: 'Invalid credentials' }, // INVALID_ARGUMENT -> 401 for auth
  6: { status: 409, message: 'User already exists' }, // ALREADY_EXISTS
  16: { status: 401, message: 'Invalid refresh token' } // UNAUTHENTICATED
};

/**
 * Register a new user
 */
const registerUser = async (req, res) => {
  const result = await grpcClients.authService.register(req.body);
  sendSuccessResponse(res, 201, result, req.correlationId);
};

/**
 * User login
 */
const loginUser = async (req, res) => {
  const result = await grpcClients.authService.login(req.body);
  sendSuccessResponse(res, 200, result, req.correlationId);
};

/**
 * Refresh access token
 */
const refreshUserToken = async (req, res) => {
  const result = await grpcClients.authService.refreshToken(req.body);
  sendSuccessResponse(res, 200, result, req.correlationId);
};

/**
 * User logout
 */
const logoutUser = async (req, res) => {
  await grpcClients.authService.logout({
    refreshToken: req.body.refreshToken
  });
  sendSuccessResponse(res, 200, { message: 'Logged out successfully' }, req.correlationId);
};

// Export wrapped handlers
export const registerHandler = createHandler(registerUser, 'Auth', 'register', authErrorMapping);
export const loginHandler = createHandler(loginUser, 'Auth', 'login', authErrorMapping);
export const refreshTokenHandler = createHandler(refreshUserToken, 'Auth', 'refreshToken', authErrorMapping);
export const logoutHandler = createSimpleHandler(logoutUser, 'Auth', 'logout'); 