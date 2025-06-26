import express from 'express';
import {
  registerWithEmailHandler,
  registerWithOAuthHandler,
  loginHandler,
  refreshTokenHandler,
  logoutHandler,
} from '../handlers/index.js';
import {
  validateRegistration,
  validateLogin,
  validateRefreshToken,
  validateOAuthRegistration,
} from '../middlewares/index.js';

const router = express.Router();

// Registration endpoints
router.post('/register/email', validateRegistration, registerWithEmailHandler);
router.post('/register/oauth', validateOAuthRegistration, registerWithOAuthHandler);

// Login endpoints
router.post('/login', validateLogin, loginHandler);

// Token management
router.post('/refresh', validateRefreshToken, refreshTokenHandler);
router.post('/logout', logoutHandler);

// Health check
router.get('/hello', (req, res) => {
  res.send('Hello World');
});

export default router;
