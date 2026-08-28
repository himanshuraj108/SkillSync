import { Router } from 'express';
import { getNotifications, markRead, markAllRead, getUnreadCount } from '../controllers/notification.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protectRoute);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.post('/mark-all-read', markAllRead);
router.post('/:id/read', markRead);

export default router;
