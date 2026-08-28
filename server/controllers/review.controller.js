import Review from '../models/Review.js';
import Session from '../models/Session.js';
import Notification from '../models/Notification.js';
import { updateReputationAfterReview } from '../utils/reputation.utils.js';

export const submitReview = async (req, res, next) => {
    try {
        const { session_id, ratings, overall, written_feedback, is_public } = req.body;

        const session = await Session.findById(session_id);
        if (!session || session.status !== 'completed') {
            return res.status(400).json({ success: false, message: 'Valid completed session required' });
        }

        if (session.teacher.toString() !== req.user._id.toString() && session.learner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Must be a participant to review' });
        }

        const existingReview = await Review.findOne({ session_id, reviewer: req.user._id });
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this session' });
        }

        const reviewee = session.teacher.toString() === req.user._id.toString() ? session.learner : session.teacher;

        const review = await Review.create({
            session_id,
            match_id: session.match_id,
            reviewer: req.user._id,
            reviewee,
            ratings,
            overall,
            written_feedback,
            is_public: is_public !== undefined ? is_public : true
        });

        await updateReputationAfterReview(reviewee, review);

        await Notification.create({
            user_id: reviewee,
            type: 'review_received',
            title: 'New Review',
            body: `${req.user.name} left you a review for your session.`,
            link: `/reviews/${review._id}`
        });

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        next(error);
    }
};

export const getSessionReview = async (req, res, next) => {
    try {
        const review = await Review.findOne({ session_id: req.params.sessionId })
            .populate('reviewer reviewee', 'name avatar');
            
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        res.status(200).json({ success: true, data: review });
    } catch (error) {
        next(error);
    }
};

export const getUserReviews = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const reviews = await Review.paginate(
            { reviewee: req.params.userId, is_public: true },
            { page, limit, populate: { path: 'reviewer', select: 'name avatar' }, sort: { created_at: -1 } }
        );
        res.status(200).json({ success: true, pagination: reviews });
    } catch (error) {
        next(error);
    }
};
