import express from 'express';
import { body } from 'express-validator';

// Import handlers
import {
  getProfileHandler,
  updateProfileHandler,
  getAddressesHandler,
  addAddressHandler,
  updateAddressHandler,
  deleteAddressHandler
} from '../handlers/index.js';

const router = express.Router();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the current user's profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', getProfileHandler);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the current user's profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               address:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', [
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('phone').optional().trim(),
  body('dateOfBirth').optional().isISO8601(),
  body('address').optional().isObject()
], updateProfileHandler);

/**
 * @swagger
 * /users/addresses:
 *   get:
 *     summary: Get user addresses
 *     description: Retrieve all addresses for the current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/addresses', getAddressesHandler);

/**
 * @swagger
 * /users/addresses:
 *   post:
 *     summary: Add user address
 *     description: Add a new address for the current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - street
 *               - city
 *               - state
 *               - zipCode
 *               - country
 *             properties:
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       201:
 *         description: Address added successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/addresses', [
  body('street').notEmpty().trim(),
  body('city').notEmpty().trim(),
  body('state').notEmpty().trim(),
  body('zipCode').notEmpty().trim(),
  body('country').notEmpty().trim()
], addAddressHandler);

/**
 * @swagger
 * /users/addresses/{addressId}:
 *   put:
 *     summary: Update user address
 *     description: Update an existing address for the current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
router.put('/addresses/:addressId', [
  body('street').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('zipCode').optional().trim(),
  body('country').optional().trim()
], updateAddressHandler);

/**
 * @swagger
 * /users/addresses/{addressId}:
 *   delete:
 *     summary: Delete user address
 *     description: Delete an address for the current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Address deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
router.delete('/addresses/:addressId', deleteAddressHandler);

export default router; 