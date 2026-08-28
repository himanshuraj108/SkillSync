import { Router } from 'express';
import { submitReview, getSessionReview, getUserReviews } from '../controllers/review.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/user/:userId', getUserReviews);
router.get('/session/:sessionId', protectRoute, getSessionReview);
router.post('/', protectRoute, submitReview);

export default router;
