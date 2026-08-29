import { Router } from 'express';
import { register, login, logout, refreshToken, forgotPassword, resetPassword, verifyEmail, resendVerification, getMe, checkEmail } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';
import { registerValidator, loginValidator } from '../validators/auth.validator.js';

const router = Router();

router.get('/check-email', checkEmail);
router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', protectRoute, resendVerification);
router.get('/me', protectRoute, getMe);

export default router;
