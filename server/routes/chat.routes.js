import { Router } from 'express';
import { getConversations, getConversation, getMessages, sendMessage, markRead } from '../controllers/chat.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protectRoute);

router.get('/', getConversations);
router.get('/:id', getConversation);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);
router.post('/:id/read', markRead);
router.patch('/:id/read', markRead);

export default router;
