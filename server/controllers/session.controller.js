import Session from '../models/Session.js';
import Match from '../models/Match.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import LearningProgress from '../models/LearningProgress.js';
import { generateSessionSummary, detectWeakTopics } from '../utils/ai.utils.js';
import { penalizeNoShow, rewardSessionCompletion } from '../utils/reputation.utils.js';
import { sendSessionScheduledEmail, sendSessionCompletedEmail } from '../utils/email.utils.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

export const createSession = async (req, res, next) => {
    try {
        const { match_id, teacher_id, learner_id, skill, title, description, scheduled_at, duration_minutes } = req.body;

        const match = await Match.findById(match_id);
        if (!match || match.status !== 'accepted') {
            return res.status(400).json({ success: false, message: 'Match must be accepted first' });
        }

        const scheduledDate = new Date(scheduled_at);
        const now = new Date();
        // Allow up to a 5-minute clock skew buffer so users can book immediately
        if (scheduledDate.getTime() < now.getTime() - 5 * 60 * 1000) {
            return res.status(400).json({ success: false, message: 'Scheduled time must not be in the past' });
        }

        const newStart = scheduledDate.getTime();
        const newEnd = newStart + (parseInt(duration_minutes, 10) || 60) * 60000;

        // Check for genuine time overlap only with upcoming/future scheduled sessions
        const existingActiveSessions = await Session.find({
            $or: [{ teacher: req.user._id }, { learner: req.user._id }],
            status: { $in: ['scheduled', 'live'] }
        });

        const conflict = existingActiveSessions.find(s => {
            const sStart = new Date(s.scheduled_at).getTime();
            const sEnd = sStart + (s.duration_minutes || 60) * 60000;
            // Overlap condition: (StartA < EndB) and (EndA > StartB)
            return newStart < sEnd && newEnd > sStart;
        });

        if (conflict) {
            const conflictTime = new Date(conflict.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return res.status(400).json({ 
                success: false, 
                message: `Time slot conflict with "${conflict.title}" scheduled around ${conflictTime}. Please pick another time or view your existing session.` 
            });
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

        User.find({ _id: { $in: [teacher_id, learner_id] } }).then(([user1, user2]) => {
            const teacherUser = user1?._id.toString() === teacher_id.toString() ? user1 : user2;
            const learnerUser = user1?._id.toString() === learner_id.toString() ? user1 : user2;
            if (teacherUser && learnerUser) {
                sendSessionScheduledEmail(teacherUser.email, teacherUser.name, learnerUser.name, session).catch(err => {
                    console.error('Session email error (teacher):', err.message);
                });
                sendSessionScheduledEmail(learnerUser.email, learnerUser.name, teacherUser.name, session).catch(err => {
                    console.error('Session email error (learner):', err.message);
                });
            }
        }).catch(() => {});

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

        const sessionObj = session.toObject();
        const userIdStr = req.user._id.toString();

        // 7-Day Recording Visibility & Privacy Logic
        if (sessionObj.recording && sessionObj.recording.url) {
            const isExpired = sessionObj.recording.expires_at && new Date(sessionObj.recording.expires_at) < new Date();
            const isSavedByMe = (sessionObj.recording.saved_by_users || []).some(
                u => u.toString() === userIdStr
            );

            if (isExpired || !isSavedByMe) {
                // Hide recording URL if expired or if current user opted out
                sessionObj.recording.url = '';
                sessionObj.recording.is_visible_to_me = false;
                sessionObj.recording.is_expired = isExpired;
                sessionObj.recording_url = '';
            } else {
                sessionObj.recording.is_visible_to_me = true;
                sessionObj.recording.is_expired = false;
            }
        }

        res.status(200).json({ success: true, data: sessionObj });
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

        User.find({ _id: { $in: [session.teacher, session.learner] } }).then(([user1, user2]) => {
            const teacherUser = user1?._id.toString() === session.teacher.toString() ? user1 : user2;
            const learnerUser = user1?._id.toString() === session.learner.toString() ? user1 : user2;
            if (teacherUser && learnerUser) {
                sendSessionCompletedEmail(teacherUser.email, teacherUser.name, learnerUser.name, session).catch(err => {
                    console.error('Session complete email error (teacher):', err.message);
                });
                sendSessionCompletedEmail(learnerUser.email, learnerUser.name, teacherUser.name, session).catch(err => {
                    console.error('Session complete email error (learner):', err.message);
                });
            }
        }).catch(() => {});

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

export const setRecordingConsent = async (req, res, next) => {
    try {
        const { consent } = req.body; // boolean: true = save to my account, false = do not save
        const session = await Session.findById(req.params.id);

        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        const userIdStr = req.user._id.toString();
        const isParticipant = session.teacher.toString() === userIdStr || session.learner.toString() === userIdStr;
        if (!isParticipant) return res.status(403).json({ success: false, message: 'Forbidden' });

        if (!session.recording) {
            session.recording = { saved_by_users: [], consent: new Map() };
        }

        if (!session.recording.consent) {
            session.recording.consent = new Map();
        }

        session.recording.consent.set(userIdStr, Boolean(consent));

        // Update saved_by_users array
        if (consent) {
            const alreadySaved = (session.recording.saved_by_users || []).some(u => u.toString() === userIdStr);
            if (!alreadySaved) {
                session.recording.saved_by_users.push(req.user._id);
            }
        } else {
            session.recording.saved_by_users = (session.recording.saved_by_users || []).filter(
                u => u.toString() !== userIdStr
            );
        }

        await session.save();

        res.status(200).json({
            success: true,
            data: {
                consent: Boolean(consent),
                saved_by_users: session.recording.saved_by_users,
                total_consented: session.recording.saved_by_users.length
            }
        });
    } catch (error) {
        next(error);
    }
};

export const uploadSessionRecording = async (req, res, next) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        const userIdStr = req.user._id.toString();
        const isParticipant = session.teacher.toString() === userIdStr || session.learner.toString() === userIdStr;
        if (!isParticipant) return res.status(403).json({ success: false, message: 'Forbidden' });

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No video file uploaded' });
        }

        // If neither user consented to save, reject upload
        if (!session.recording?.saved_by_users?.length) {
            return res.status(400).json({
                success: false,
                message: 'Neither participant opted to save the recording. No recording stored.'
            });
        }

        const durationSeconds = parseInt(req.body.duration_seconds, 10) || 0;
        const uploadResult = await uploadToCloudinary(
            req.file.buffer,
            'skillswap/recordings',
            { resource_type: 'video' },
            req.file.mimetype || 'video/webm'
        );

        const now = new Date();
        const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Exactly 7 Days TTL

        session.recording.url = uploadResult.url;
        session.recording.file_size = req.file.size;
        session.recording.duration_seconds = durationSeconds;
        session.recording.created_at = now;
        session.recording.expires_at = sevenDaysLater;
        session.recording_url = uploadResult.url;

        await session.save();

        res.status(200).json({
            success: true,
            data: {
                url: uploadResult.url,
                duration_seconds: durationSeconds,
                expires_at: sevenDaysLater,
                saved_by_users: session.recording.saved_by_users
            }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteRecording = async (req, res, next) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        const userIdStr = req.user._id.toString();
        const isParticipant = session.teacher.toString() === userIdStr || session.learner.toString() === userIdStr;
        if (!isParticipant) return res.status(403).json({ success: false, message: 'Forbidden' });

        if (session.recording) {
            // Remove requesting user from saved_by_users
            session.recording.saved_by_users = (session.recording.saved_by_users || []).filter(
                u => u.toString() !== userIdStr
            );

            // If no user has this recording saved anymore, clean up URL
            if (session.recording.saved_by_users.length === 0) {
                session.recording.url = '';
                session.recording_url = '';
            }

            await session.save();
        }

        res.status(200).json({ success: true, message: 'Recording removed from your account.' });
    } catch (error) {
        next(error);
    }
};
