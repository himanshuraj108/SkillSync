import { Router } from 'express';
import { createSession, getSessions, getUpcomingSessions, getSession, updateSession, startSession, completeSession, cancelSession } from '../controllers/session.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createSessionValidator } from '../validators/session.validator.js';

const router = Router();

router.use(protectRoute);

router.post('/', createSessionValidator, validate, createSession);
router.get('/', getSessions);
router.get('/upcoming', getUpcomingSessions);
router.get('/:id', getSession);
router.put('/:id', updateSession);
router.post('/:id/start', startSession);
router.post('/:id/complete', completeSession);
router.post('/:id/cancel', cancelSession);

export default router;
