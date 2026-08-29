import User from '../models/User.js';
import Review from '../models/Review.js';
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
        await User.findByIdAndUpdate(userId, { 
            is_active: false,
            refresh_token: undefined,
            email_verification_token: undefined
        });
        
        res.clearCookie('refreshToken');
        res.status(200).json({ success: true, message: 'Your account has been deleted successfully' });
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
