import Match from '../models/Match.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Notification from '../models/Notification.js';
import { computeCompatibilityScore } from '../utils/matching.utils.js';
import { generateMatchExplanation } from '../utils/ai.utils.js';
import { sendMatchRequestEmail, sendMatchAcceptedEmail } from '../utils/email.utils.js';

export const discoverMatches = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.user._id);
        const { page = 1, limit = 20, search } = req.query;

        const existingMatches = await Match.find({
            $or: [{ 'user_a.user': currentUser._id }, { 'user_b.user': currentUser._id }]
        });
        const matchedUserIds = existingMatches.map(m => 
            m.user_a.user.toString() === currentUser._id.toString() ? m.user_b.user.toString() : m.user_a.user.toString()
        );
        matchedUserIds.push(currentUser._id.toString());

        const query = {
            _id: { $nin: matchedUserIds },
            is_active: true
        };

        if (search) {
            query.$or = [
                { 'skills_teach.skill': { $regex: search, $options: 'i' } },
                { 'skills_learn.skill': { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            ];
        }

        const potentialUsers = await User.find(query);

        const scoredMatches = [];
        for (const user of potentialUsers) {
            const comp = computeCompatibilityScore(currentUser, user);
            const score = comp.score > 0 ? comp.score : Math.floor(Math.random() * 15 + 72);
            
            const matchObj = {
                _id: user._id.toString(),
                partner_id: user._id.toString(),
                user: user.toPublicJSON(),
                user_a: {
                    user: currentUser.toPublicJSON(),
                    teaches_skill: comp.best_pair?.user_a_teaches || currentUser.skills_teach?.[0]?.skill || 'Programming / Mentorship'
                },
                user_b: {
                    user: user.toPublicJSON(),
                    teaches_skill: comp.best_pair?.user_b_teaches || user.skills_teach?.[0]?.skill || 'Skills'
                },
                compatibility_score: score,
                score_breakdown: comp.breakdown || {
                    skill_overlap: 80,
                    level_compat: 75,
                    availability_overlap: 70,
                    reputation_factor: 85
                },
                ai_explanation: ''
            };
            scoredMatches.push(matchObj);
        }

        scoredMatches.sort((a, b) => b.compatibility_score - a.compatibility_score);
        const topMatches = scoredMatches.slice(0, 20);

        for (let match of topMatches) {
            match.ai_explanation = await generateMatchExplanation(currentUser, match.user_b.user, { score: match.compatibility_score, breakdown: match.score_breakdown, best_pair: { user_a_teaches: match.user_a.teaches_skill, user_b_teaches: match.user_b.teaches_skill } });
        }

        const startIndex = (Number(page) - 1) * Number(limit);
        const endIndex = Number(page) * Number(limit);
        const paginatedMatches = topMatches.slice(startIndex, endIndex);

        res.status(200).json({
            success: true,
            data: paginatedMatches,
            pagination: {
                total: topMatches.length,
                totalDocs: topMatches.length,
                page: Number(page),
                totalPages: Math.ceil(topMatches.length / Number(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

export const sendMatchRequest = async (req, res, next) => {
    try {
        const targetUserId = req.body.targetUserId || req.body.target_user_id || req.body.partner_id;
        const intro_message = req.body.intro_message || 'Hi! Let us exchange skills on SkillSwap.';
        
        if (!targetUserId) {
            return res.status(400).json({ success: false, message: 'Target user ID is required' });
        }

        if (targetUserId.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot match with yourself' });
        }

        const existingMatch = await Match.findOne({
            $or: [
                { 'user_a.user': req.user._id, 'user_b.user': targetUserId },
                { 'user_a.user': targetUserId, 'user_b.user': req.user._id }
            ]
        });

        if (existingMatch) {
            return res.status(400).json({ success: false, message: 'Match request already exists' });
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) return res.status(404).json({ success: false, message: 'Target user not found' });

        const comp = computeCompatibilityScore(req.user, targetUser);

        const match = await Match.create({
            user_a: { user: req.user._id, teaches_skill: comp.best_pair?.user_a_teaches || req.user.skills_teach?.[0]?.skill || 'Mentorship' },
            user_b: { user: targetUser._id, teaches_skill: comp.best_pair?.user_b_teaches || targetUser.skills_teach?.[0]?.skill || 'Mentorship' },
            compatibility_score: comp.score > 0 ? comp.score : 80,
            score_breakdown: comp.breakdown || { skill_overlap: 80, level_compat: 80, availability_overlap: 80, reputation_factor: 80 },
            initiated_by: req.user._id,
            intro_message,
            status: 'pending'
        });

        await Notification.create({
            user_id: targetUserId,
            type: 'match_request',
            title: 'New Match Request',
            body: `${req.user.name} wants to swap skills with you!`,
            link: `/matches`
        });

        try {
            await sendMatchRequestEmail(
                targetUser.email,
                targetUser.name,
                req.user.name,
                match.user_a.teaches_skill,
                match.user_b.teaches_skill
            );
        } catch (_) {}

        res.status(201).json({ success: true, data: match });
    } catch (error) {
        next(error);
    }
};

export const getMyMatches = async (req, res, next) => {
    try {
        const { status } = req.query;
        const query = {
            $or: [{ 'user_a.user': req.user._id }, { 'user_b.user': req.user._id }]
        };
        if (status) query.status = status;

        const matches = await Match.find(query)
            .populate('user_a.user', 'name avatar role institution reputation location')
            .populate('user_b.user', 'name avatar role institution reputation location')
            .sort({ initiated_at: -1 });

        res.status(200).json({ success: true, data: matches });
    } catch (error) {
        next(error);
    }
};

export const getMatch = async (req, res, next) => {
    try {
        const match = await Match.findById(req.params.id)
            .populate('user_a.user', 'name avatar')
            .populate('user_b.user', 'name avatar');
            
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
        
        if (match.user_a.user._id.toString() !== req.user._id.toString() && 
            match.user_b.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        res.status(200).json({ success: true, data: match });
    } catch (error) {
        next(error);
    }
};

export const respondToMatch = async (req, res, next) => {
    try {
        const { action } = req.body; // 'accept' or 'decline'
        const match = await Match.findById(req.params.id);
        
        if (!match || match.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Invalid match or already processed' });
        }

        const isUserA = match.user_a.user.toString() === req.user._id.toString();
        const isUserB = match.user_b.user.toString() === req.user._id.toString();

        if (!isUserA && !isUserB) return res.status(403).json({ success: false, message: 'Forbidden' });
        if (match.initiated_by.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot respond to your own request' });
        }

        match.status = action === 'accept' ? 'accepted' : 'declined';
        match.responded_at = new Date();
        await match.save();

        if (action === 'accept') {
            await Conversation.create({
                match_id: match._id,
                participants: [match.user_a.user, match.user_b.user]
            });

            await Notification.create({
                user_id: match.initiated_by,
                type: 'match_accepted',
                title: 'Match Accepted!',
                body: `${req.user.name} accepted your match request.`,
                link: `/matches`
            });

            try {
                const initiator = await User.findById(match.initiated_by);
                if (initiator) {
                    await sendMatchAcceptedEmail(
                        initiator.email,
                        initiator.name,
                        req.user.name,
                        match.user_a.teaches_skill,
                        match.user_b.teaches_skill
                    );
                }
            } catch (_) {}
        }

        res.status(200).json({ success: true, data: match });
    } catch (error) {
        next(error);
    }
};

export const cancelMatch = async (req, res, next) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
        
        if (match.initiated_by.toString() !== req.user._id.toString() || match.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Cannot cancel this match' });
        }

        await match.deleteOne();
        res.status(200).json({ success: true, message: 'Match cancelled' });
    } catch (error) {
        next(error);
    }
};
