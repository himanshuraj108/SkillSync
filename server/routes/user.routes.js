import { Router } from 'express';
import { getProfile, updateProfile, updateAvatar, updateSkills, updateAvailability, getUserReviews, deleteAccount, searchUsers } from '../controllers/user.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { uploadAvatar } from '../middleware/upload.middleware.js';

const router = Router();

router.get('/search', protectRoute, searchUsers);
router.get('/:id', getProfile);
router.put('/profile', protectRoute, updateProfile);
router.put('/avatar', protectRoute, uploadAvatar, updateAvatar);
router.put('/skills', protectRoute, updateSkills);
router.put('/availability', protectRoute, updateAvailability);
router.get('/:id/reviews', getUserReviews);
router.delete('/account', protectRoute, deleteAccount);

export default router;
