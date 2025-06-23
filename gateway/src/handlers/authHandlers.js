import grpcClients from '../grpc/clients.js';
import { sendSuccessResponse, createHandler, createSimpleHandler } from '../utils/responseHandler.js';

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
    userId: req.user.id,
    refreshToken: req.body.refreshToken
  });
  sendSuccessResponse(res, 200, { message: 'Logout successful' }, req.correlationId);
};

// Export wrapped handlers
export const registerHandler = createHandler(registerUser, 'auth', 'register');
export const loginHandler = createHandler(loginUser, 'auth', 'login');
export const refreshTokenHandler = createHandler(refreshUserToken, 'auth', 'refreshToken');
export const logoutHandler = createSimpleHandler(logoutUser, 'auth', 'logout'); 