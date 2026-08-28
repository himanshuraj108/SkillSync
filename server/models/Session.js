import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const sessionSchema = new mongoose.Schema({
    match_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skill: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    scheduled_at: { type: Date, required: true },
    duration_minutes: { type: Number, default: 60 },
    status: {
        type: String,
        enum: ['scheduled', 'live', 'completed', 'cancelled', 'no_show'],
        default: 'scheduled'
    },
    agenda: String,
    meeting_notes: String,
    recording_url: String,
    recording: {
        url: { type: String, default: '' },
        file_size: { type: Number, default: 0 },
        duration_seconds: { type: Number, default: 0 },
        created_at: { type: Date },
        expires_at: { type: Date },
        saved_by_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        consent: { type: Map, of: Boolean, default: {} }
    },
    transcript: String,
    ai_summary: String,
    teacher_post_notes: String,
    learner_confidence_after: { type: Number, min: 1, max: 5 },
    reminder_24h_sent: { type: Boolean, default: false },
    reminder_30m_sent: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

sessionSchema.index({ teacher: 1 });
sessionSchema.index({ learner: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ scheduled_at: 1 });

sessionSchema.pre('save', function (next) {
    this.updated_at = new Date();
    next();
});

sessionSchema.plugin(mongoosePaginate);

export default mongoose.model('Session', sessionSchema);
