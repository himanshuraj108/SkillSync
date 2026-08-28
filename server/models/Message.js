import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const messageSchema = new mongoose.Schema({
    conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['text', 'file', 'image', 'code', 'system'],
        default: 'text'
    },
    content: String,
    file_url: String,
    file_name: String,
    file_size: Number,
    code_language: String,
    is_edited: { type: Boolean, default: false },
    edited_at: Date,
    is_deleted: { type: Boolean, default: false },
    read_by: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        read_at: Date
    }],
    timestamp: { type: Date, default: Date.now }
});

messageSchema.index({ conversation_id: 1, timestamp: 1 });
messageSchema.plugin(mongoosePaginate);

export default mongoose.model('Message', messageSchema);
