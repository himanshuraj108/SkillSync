import { Router } from 'express';
import { discoverMatches, sendMatchRequest, getMyMatches, getMatch, respondToMatch, cancelMatch } from '../controllers/match.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { sendMatchRequestValidator } from '../validators/match.validator.js';

const router = Router();

router.use(protectRoute);

router.get('/discover', discoverMatches);
router.post('/request', sendMatchRequestValidator, validate, sendMatchRequest);
router.get('/my-matches', getMyMatches);
router.get('/:id', getMatch);
router.post('/:id/respond', respondToMatch);
router.post('/:id/cancel', cancelMatch);

export default router;
