import { Router } from 'express';
import { uploadAvatar, uploadFile } from '../controllers/upload.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { uploadAvatar as uploadAvatarMiddleware, uploadFile as uploadFileMiddleware } from '../middleware/upload.middleware.js';
import { uploadLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

router.use(protectRoute);
router.use(uploadLimiter);

router.post('/avatar', uploadAvatarMiddleware, uploadAvatar);
router.post('/file', uploadFileMiddleware, uploadFile);

export default router;
