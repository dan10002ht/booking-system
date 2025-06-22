import grpcClients from '../grpc/clients.js';
import { sendSuccessResponse, createHandler, createSimpleHandler } from '../utils/responseHandler.js';

// Custom error mappings for user service
const userErrorMapping = {
  5: { status: 404, message: 'User not found' }, // NOT_FOUND
  3: { status: 400, message: 'Invalid user data' } // INVALID_ARGUMENT
};

/**
 * Get user profile
 */
const getUserProfile = async (req, res) => {
  const result = await grpcClients.userService.getProfile({
    userId: req.user.id
  });
  sendSuccessResponse(res, 200, result, req.correlationId);
};

/**
 * Update user profile
 */
const updateUserProfile = async (req, res) => {
  const result = await grpcClients.userService.updateProfile({
    userId: req.user.id,
    ...req.body
  });
  sendSuccessResponse(res, 200, result, req.correlationId);
};

/**
 * Get user addresses
 */
const getUserAddresses = async (req, res) => {
  const result = await grpcClients.userService.getAddresses({
    userId: req.user.id
  });
  sendSuccessResponse(res, 200, result, req.correlationId);
};

/**
 * Add user address
 */
const addUserAddress = async (req, res) => {
  const result = await grpcClients.userService.addAddress({
    userId: req.user.id,
    ...req.body
  });
  sendSuccessResponse(res, 201, result, req.correlationId);
};

/**
 * Update user address
 */
const updateUserAddress = async (req, res) => {
  const result = await grpcClients.userService.updateAddress({
    userId: req.user.id,
    addressId: req.params.addressId,
    ...req.body
  });
  sendSuccessResponse(res, 200, result, req.correlationId);
};

/**
 * Delete user address
 */
const deleteUserAddress = async (req, res) => {
  await grpcClients.userService.deleteAddress({
    userId: req.user.id,
    addressId: req.params.addressId
  });
  res.status(204).send();
};

// Export wrapped handlers
export const getProfileHandler = createSimpleHandler(getUserProfile, 'User', 'getProfile', userErrorMapping);
export const updateProfileHandler = createHandler(updateUserProfile, 'User', 'updateProfile', userErrorMapping);
export const getAddressesHandler = createSimpleHandler(getUserAddresses, 'User', 'getAddresses');
export const addAddressHandler = createHandler(addUserAddress, 'User', 'addAddress', userErrorMapping);
export const updateAddressHandler = createHandler(updateUserAddress, 'User', 'updateAddress', userErrorMapping);
export const deleteAddressHandler = createSimpleHandler(deleteUserAddress, 'User', 'deleteAddress', userErrorMapping); 