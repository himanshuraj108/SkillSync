import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    match_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true, unique: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    last_message: {
        content: String,
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: Date
    },
    unread_counts: { type: Map, of: Number, default: {} },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

conversationSchema.index({ participants: 1 });

export default mongoose.model('Conversation', conversationSchema);
