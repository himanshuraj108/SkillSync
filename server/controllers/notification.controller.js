import Notification from '../models/Notification.js';

export const getNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const notifications = await Notification.paginate(
            { user_id: req.user._id },
            { page, limit, sort: { created_at: -1 } }
        );
        res.status(200).json({ success: true, pagination: notifications });
    } catch (error) {
        next(error);
    }
};

export const markRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user._id },
            { is_read: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        next(error);
    }
};

export const markAllRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { user_id: req.user._id, is_read: false },
            { is_read: true }
        );
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
};

export const getUnreadCount = async (req, res, next) => {
    try {
        const count = await Notification.countDocuments({ user_id: req.user._id, is_read: false });
        res.status(200).json({ success: true, data: { count } });
    } catch (error) {
        next(error);
    }
};
