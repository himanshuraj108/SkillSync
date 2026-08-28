import Session from '../models/Session.js';
import Match from '../models/Match.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import LearningProgress from '../models/LearningProgress.js';
import { generateSessionSummary, detectWeakTopics } from '../utils/ai.utils.js';
import { penalizeNoShow, rewardSessionCompletion } from '../utils/reputation.utils.js';
import { sendSessionScheduledEmail, sendSessionCompletedEmail } from '../utils/email.utils.js';

export const createSession = async (req, res, next) => {
    try {
        if (!req.user.is_email_verified) {
            return res.status(403).json({
                success: false,
                message: 'Email verification required. Please verify your email before creating or scheduling sessions.'
            });
        }

        const { match_id, teacher_id, learner_id, skill, title, description, scheduled_at, duration_minutes } = req.body;

        const match = await Match.findById(match_id);
        if (!match || match.status !== 'accepted') {
            return res.status(400).json({ success: false, message: 'Match must be accepted first' });
        }

        const scheduledDate = new Date(scheduled_at);
        if (scheduledDate < new Date()) {
            return res.status(400).json({ success: false, message: 'Scheduled time must be in the future' });
        }

        const conflict = await Session.findOne({
            $or: [{ teacher: req.user._id }, { learner: req.user._id }],
            status: 'scheduled',
            scheduled_at: {
                $gte: new Date(scheduledDate.getTime() - duration_minutes * 60000),
                $lte: new Date(scheduledDate.getTime() + duration_minutes * 60000)
            }
        });

        if (conflict) {
            return res.status(400).json({ success: false, message: 'Time slot conflict' });
        }

        const session = await Session.create({
            match_id, teacher: teacher_id, learner: learner_id, skill, title, description, scheduled_at, duration_minutes
        });

        const otherUserId = teacher_id.toString() === req.user._id.toString() ? learner_id : teacher_id;
        await Notification.create({
            user_id: otherUserId,
            type: 'session_scheduled',
            title: 'New Session Scheduled',
            body: `${req.user.name} scheduled a session for ${skill}.`,
            link: `/sessions/${session._id}`
        });

        try {
            const teacherUser = await User.findById(teacher_id);
            const learnerUser = await User.findById(learner_id);
            if (teacherUser && learnerUser) {
                await sendSessionScheduledEmail(teacherUser.email, teacherUser.name, learnerUser.name, session);
                await sendSessionScheduledEmail(learnerUser.email, learnerUser.name, teacherUser.name, session);
            }
        } catch (_) {}

        res.status(201).json({ success: true, data: session });
    } catch (error) {
        next(error);
    }
};

export const getSessions = async (req, res, next) => {
    try {
        const { status, skill, page = 1, limit = 10 } = req.query;
        const query = { $or: [{ teacher: req.user._id }, { learner: req.user._id }] };
        if (status) query.status = status;
        if (skill) query.skill = skill;

        const sessions = await Session.paginate(query, {
            page, limit,
            populate: [
                { path: 'teacher', select: 'name avatar' },
                { path: 'learner', select: 'name avatar' }
            ],
            sort: { scheduled_at: -1 }
        });

        res.status(200).json({ success: true, pagination: sessions });
    } catch (error) {
        next(error);
    }
};

export const getUpcomingSessions = async (req, res, next) => {
    try {
        const sessions = await Session.find({
            $or: [{ teacher: req.user._id }, { learner: req.user._id }],
            status: 'scheduled',
            scheduled_at: { $gt: new Date() }
        })
        .populate('teacher learner', 'name avatar')
        .sort({ scheduled_at: 1 })
        .limit(5);

        res.status(200).json({ success: true, data: sessions });
    } catch (error) {
        next(error);
    }
};

export const getSession = async (req, res, next) => {
    try {
        const session = await Session.findById(req.params.id)
            .populate('teacher learner', 'name avatar');
            
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
        
        if (session.teacher._id.toString() !== req.user._id.toString() && 
            session.learner._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        res.status(200).json({ success: true, data: session });
    } catch (error) {
        next(error);
    }
};

export const updateSession = async (req, res, next) => {
    try {
        const { agenda, title, description } = req.body;
        const session = await Session.findById(req.params.id);
        
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
        if (session.status !== 'scheduled') {
            return res.status(400).json({ success: false, message: 'Can only update scheduled sessions' });
        }
        
        if (session.teacher.toString() !== req.user._id.toString() && 
            session.learner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        if (agenda) session.agenda = agenda;
        if (title) session.title = title;
        if (description) session.description = description;
        
        await session.save();
        res.status(200).json({ success: true, data: session });
    } catch (error) {
        next(error);
    }
};

export const startSession = async (req, res, next) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
        if (session.status === 'completed') return res.status(400).json({ success: false, message: 'Session already completed' });
        if (session.status === 'cancelled') return res.status(400).json({ success: false, message: 'Session was cancelled' });

        const isParticipant = session.teacher.toString() === req.user._id.toString() ||
                              session.learner.toString() === req.user._id.toString();
        if (!isParticipant) return res.status(403).json({ success: false, message: 'Forbidden' });

        session.status = 'live';
        await session.save();

        res.status(200).json({ success: true, data: session });
    } catch (error) {
        next(error);
    }
};

export const completeSession = async (req, res, next) => {
    try {
        const { teacher_post_notes, learner_confidence_after } = req.body;
        const session = await Session.findById(req.params.id);
        
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
        if (session.status === 'completed') return res.status(400).json({ success: false, message: 'Already completed' });
        
        const isTeacher = session.teacher.toString() === req.user._id.toString();
        const isLearner = session.learner.toString() === req.user._id.toString();
        
        if (!isTeacher && !isLearner) return res.status(403).json({ success: false, message: 'Forbidden' });

        if (isTeacher && teacher_post_notes) session.teacher_post_notes = teacher_post_notes;
        if (isLearner && learner_confidence_after) session.learner_confidence_after = learner_confidence_after;

        session.status = 'completed';

        if (session.teacher_post_notes && session.learner_confidence_after) {
             const summaryData = {
                 skill: session.skill,
                 agenda: session.agenda,
                 teacherNotes: session.teacher_post_notes,
                 learnerConfidence: session.learner_confidence_after
             };
             session.ai_summary = await generateSessionSummary(summaryData);
        }

        await session.save();
        await rewardSessionCompletion(session.teacher);
        await rewardSessionCompletion(session.learner);

        if (isTeacher && teacher_post_notes) {
            const allSessions = await Session.find({ learner: session.learner, skill: session.skill, status: 'completed' });
            if (allSessions.length >= 3) {
                const weakTopics = await detectWeakTopics(allSessions);
                let progress = await LearningProgress.findOne({ user_id: session.learner, skill_id: session.skill });
                if (!progress) {
                    progress = new LearningProgress({ user_id: session.learner, skill_id: session.skill });
                }
                progress.sessions_completed += 1;
                progress.total_hours += session.duration_minutes / 60;
                
                weakTopics.forEach(wt => {
                    const existing = progress.weak_topics.find(w => w.topic.toLowerCase() === wt.topic.toLowerCase());
                    if (existing) {
                        existing.detection_count += 1;
                        existing.last_flagged = new Date();
                    } else {
                        progress.weak_topics.push({ topic: wt.topic, last_flagged: new Date() });
                    }
                });
                await progress.save();
            }
        }

        try {
            const teacherUser = await User.findById(session.teacher);
            const learnerUser = await User.findById(session.learner);
            if (teacherUser && learnerUser) {
                await sendSessionCompletedEmail(teacherUser.email, teacherUser.name, learnerUser.name, session);
                await sendSessionCompletedEmail(learnerUser.email, learnerUser.name, teacherUser.name, session);
            }
        } catch (_) {}

        res.status(200).json({ success: true, data: session });
    } catch (error) {
        next(error);
    }
};

export const cancelSession = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const session = await Session.findById(req.params.id);
        
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
        
        const isParticipant = session.teacher.toString() === req.user._id.toString() || 
                              session.learner.toString() === req.user._id.toString();
        if (!isParticipant) return res.status(403).json({ success: false, message: 'Forbidden' });
        if (session.status !== 'scheduled') return res.status(400).json({ success: false, message: 'Only scheduled sessions can be cancelled' });

        session.status = 'cancelled';
        await session.save();
        
        const scheduledTime = new Date(session.scheduled_at).getTime();
        const now = Date.now();
        if (scheduledTime - now < 2 * 60 * 60 * 1000) { // < 2 hours notice
            await penalizeNoShow(req.user._id);
        }

        res.status(200).json({ success: true, data: session });
    } catch (error) {
        next(error);
    }
};
