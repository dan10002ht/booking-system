import express from 'express';
import {
  registerHandler,
  loginHandler,
  refreshTokenHandler,
  logoutHandler
} from '../handlers/index.js';
import {
  validateRegistration,
  validateLogin,
  validateRefreshToken
} from '../middlewares/index.js';

const router = express.Router();

router.post('/register', validateRegistration, registerHandler);
router.post('/login', validateLogin, loginHandler);
router.post('/refresh', validateRefreshToken, refreshTokenHandler);
router.post('/logout', logoutHandler);

export default router; 