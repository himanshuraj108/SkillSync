import User from '../models/User.js';

export const updateReputationAfterReview = async (userId, reviewData) => {
    const user = await User.findById(userId);
    if (!user) return;

    const currentScore = user.reputation.score;
    const currentTotal = user.reputation.total_reviews;
    
    const newTotal = currentTotal + 1;
    const newScore = ((currentScore * currentTotal) + reviewData.overall) / newTotal;

    user.reputation.score = Math.round(newScore * 10) / 10;
    user.reputation.total_reviews = newTotal;
    
    await user.save();
};

export const penalizeNoShow = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return;

    user.reputation.no_shows += 1;
    user.reputation.score = Math.max(0, user.reputation.score - 5);
    
    await user.save();
};

export const rewardSessionCompletion = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return;

    user.reputation.sessions_completed += 1;
    user.reputation.score = Math.min(100, user.reputation.score + 0.1); // Small boost
    
    await user.save();
};
