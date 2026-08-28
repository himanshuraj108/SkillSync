import { Router } from 'express';
import { getLearningOverview, getSkillProgress, generateRoadmap, updateMilestone, addWeakTopic, getRecommendations } from '../controllers/learning.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protectRoute);

router.get('/', getLearningOverview);
router.get('/skill/:skillId', getSkillProgress);
router.post('/roadmap', generateRoadmap);
router.put('/skill/:skillId/milestone/:milestoneId', updateMilestone);
router.post('/weak-topic', addWeakTopic);
router.get('/skill/:skillId/recommendations', getRecommendations);

export default router;
