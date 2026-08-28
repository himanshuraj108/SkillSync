import LearningProgress from '../models/LearningProgress.js';
import Session from '../models/Session.js';
import { generateLearningRoadmap } from '../utils/ai.utils.js';

export const getLearningOverview = async (req, res, next) => {
    try {
        const progress = await LearningProgress.find({ user_id: req.user._id });
        res.status(200).json({ success: true, data: progress });
    } catch (error) {
        next(error);
    }
};

export const getSkillProgress = async (req, res, next) => {
    try {
        const { skillId } = req.params;
        const progress = await LearningProgress.findOne({ user_id: req.user._id, skill_id: skillId });
        
        if (!progress) return res.status(404).json({ success: false, message: 'Progress not found for this skill' });
        res.status(200).json({ success: true, data: progress });
    } catch (error) {
        next(error);
    }
};

export const generateRoadmap = async (req, res, next) => {
    try {
        const { skill_id } = req.body;
        let progress = await LearningProgress.findOne({ user_id: req.user._id, skill_id });
        
        if (!progress) {
            progress = await LearningProgress.create({ user_id: req.user._id, skill_id });
        }

        const roadmapData = await generateLearningRoadmap(
            req.user._id,
            skill_id,
            progress.current_level,
            5,
            progress.sessions_completed,
            progress.weak_topics
        );

        progress.roadmap = roadmapData.steps || [];
        progress.ai_last_generated_at = new Date();
        await progress.save();

        res.status(200).json({ success: true, data: progress.roadmap });
    } catch (error) {
        next(error);
    }
};

export const updateMilestone = async (req, res, next) => {
    try {
        const { skillId, milestoneId } = req.params;
        const progress = await LearningProgress.findOne({ user_id: req.user._id, skill_id: skillId });
        
        if (!progress) return res.status(404).json({ success: false, message: 'Progress not found' });
        
        const milestone = progress.milestones.id(milestoneId);
        if (milestone) {
            milestone.status = 'completed';
            milestone.completed_at = new Date();
            await progress.save();
        }
        
        res.status(200).json({ success: true, data: progress });
    } catch (error) {
        next(error);
    }
};

export const addWeakTopic = async (req, res, next) => {
    try {
        const { skill_id, topic } = req.body;
        let progress = await LearningProgress.findOne({ user_id: req.user._id, skill_id });
        
        if (!progress) {
            progress = await LearningProgress.create({ user_id: req.user._id, skill_id });
        }

        const existing = progress.weak_topics.find(w => w.topic.toLowerCase() === topic.toLowerCase());
        if (existing) {
            existing.detection_count += 1;
            existing.last_flagged = new Date();
        } else {
            progress.weak_topics.push({ topic, last_flagged: new Date() });
        }

        await progress.save();
        res.status(200).json({ success: true, data: progress.weak_topics });
    } catch (error) {
        next(error);
    }
};

export const getRecommendations = async (req, res, next) => {
    try {
        const { skillId } = req.params;
        const progress = await LearningProgress.findOne({ user_id: req.user._id, skill_id: skillId });
        
        let recs = [];
        if (progress && progress.weak_topics.length > 0) {
            recs = progress.weak_topics
                .sort((a, b) => b.detection_count - a.detection_count)
                .slice(0, 3)
                .map(w => w.topic);
        } else {
            recs = ['Review basics', 'Practice recent concepts'];
        }

        res.status(200).json({ success: true, data: recs });
    } catch (error) {
        next(error);
    }
};
