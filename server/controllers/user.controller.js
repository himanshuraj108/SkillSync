import User from '../models/User.js';
import Review from '../models/Review.js';
import Match from '../models/Match.js';
import Session from '../models/Session.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import LearningProgress from '../models/LearningProgress.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import cloudinary from '../config/cloudinary.js';

export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        res.status(200).json({ success: true, data: user.toPublicJSON() });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { name, bio, location, timezone, institution } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, bio, location, timezone, institution },
            { new: true, runValidators: true }
        );
        res.status(200).json({ success: true, data: user.toPublicJSON() });
    } catch (error) {
        next(error);
    }
};

export const updateAvatar = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const user = await User.findById(req.user._id);

        // Delete old avatar from Cloudinary if it was stored there
        if (user.avatar && user.avatar.publicId && !user.avatar.publicId.startsWith('local/')) {
            try { await cloudinary.uploader.destroy(user.avatar.publicId); } catch (_) {}
        }

        const result = await uploadToCloudinary(req.file.buffer, 'skillswap/avatars', {}, req.file.mimetype);
        user.avatar = { url: result.url, publicId: result.public_id };
        await user.save();

        const publicUser = user.toPublicJSON();
        console.log(`[Avatar] Uploaded via ${result.storage}: ${result.url}`);
        res.status(200).json({ success: true, data: publicUser, avatar: publicUser.avatar });
    } catch (error) {
        console.error('[updateAvatar ERROR]', error.http_code, error.message);
        next(error);
    }
};

export const updateSkills = async (req, res, next) => {
    try {
        const { skills_teach, skills_learn } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { skills_teach, skills_learn },
            { new: true, runValidators: true }
        );
        res.status(200).json({ success: true, data: user.toPublicJSON() });
    } catch (error) {
        next(error);
    }
};

export const updateAvailability = async (req, res, next) => {
    try {
        const { availability } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { availability },
            { new: true, runValidators: true }
        );
        res.status(200).json({ success: true, data: user.toPublicJSON() });
    } catch (error) {
        next(error);
    }
};

export const getUserReviews = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const reviews = await Review.paginate(
            { reviewee: req.params.id, is_public: true },
            { page, limit, populate: { path: 'reviewer', select: 'name avatar' }, sort: { created_at: -1 } }
        );
        res.status(200).json({ success: true, pagination: reviews });
    } catch (error) {
        next(error);
    }
};

export const deleteAccount = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 1. Delete user's avatar from Cloudinary (if stored there)
        if (user.avatar?.publicId && !user.avatar.publicId.startsWith('local/')) {
            try { await cloudinary.uploader.destroy(user.avatar.publicId); } catch (_) {}
        }

        // 2. Find and delete all conversations and messages involving this user
        const conversations = await Conversation.find({ participants: userId });
        const convIds = conversations.map(c => c._id);
        if (convIds.length > 0) {
            await Message.deleteMany({ conversation_id: { $in: convIds } });
            await Conversation.deleteMany({ _id: { $in: convIds } });
        }
        await Message.deleteMany({ sender: userId });

        // 3. Delete all matches where this user is user_a, user_b, or initiated_by
        await Match.deleteMany({
            $or: [
                { 'user_a.user': userId },
                { 'user_b.user': userId },
                { initiated_by: userId }
            ]
        });

        // 4. Delete all sessions where this user is teacher or learner
        await Session.deleteMany({
            $or: [
                { teacher: userId },
                { learner: userId }
            ]
        });

        // 5. Delete all reviews given by or received by this user
        await Review.deleteMany({
            $or: [
                { reviewer: userId },
                { reviewee: userId }
            ]
        });

        // 6. Delete all notifications for this user
        await Notification.deleteMany({ user_id: userId });

        // 7. Delete all learning progress/roadmaps for this user
        await LearningProgress.deleteMany({ user_id: userId });

        // 8. Permanently delete the User document from MongoDB
        await User.findByIdAndDelete(userId);

        console.log(`[USER PURGED] All database records permanently deleted for user: ${user.email} (${userId})`);

        res.clearCookie('refreshToken');
        res.status(200).json({ 
            success: true, 
            message: 'Your account and all associated data have been permanently deleted from the database.' 
        });
    } catch (error) {
        next(error);
    }
};

export const searchUsers = async (req, res, next) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;
        const query = { is_active: true };
        
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { 'skills_teach.skill': { $regex: q, $options: 'i' } },
                { 'skills_learn.skill': { $regex: q, $options: 'i' } }
            ];
        }

        const users = await User.paginate(query, { page, limit, select: '-password -email_verification_token -password_reset_token -refresh_token' });
        res.status(200).json({ success: true, pagination: users });
    } catch (error) {
        next(error);
    }
};
