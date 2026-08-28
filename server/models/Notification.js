import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const notificationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['match_request', 'match_accepted', 'session_scheduled', 'session_reminder', 'session_completed', 'message', 'review_received', 'system'],
        required: true
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    link: String,
    is_read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

notificationSchema.index({ user_id: 1, is_read: 1 });
notificationSchema.index({ user_id: 1, created_at: 1 });

notificationSchema.plugin(mongoosePaginate);

export default mongoose.model('Notification', notificationSchema);
