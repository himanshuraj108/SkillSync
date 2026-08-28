import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const matchSchema = new mongoose.Schema({
    user_a: {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        teaches_skill: String,
        teaches_level: String,
        learns_skill: String
    },
    user_b: {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        teaches_skill: String,
        teaches_level: String,
        learns_skill: String
    },
    compatibility_score: { type: Number, min: 0, max: 100 },
    score_breakdown: {
        skill_overlap: Number,
        level_compat: Number,
        availability_overlap: Number,
        reputation_factor: Number
    },
    ai_explanation: String,
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'expired', 'completed'],
        default: 'pending'
    },
    initiated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    intro_message: String,
    initiated_at: { type: Date, default: Date.now },
    responded_at: { type: Date },
    expires_at: { type: Date }
});

matchSchema.index({ status: 1 });
matchSchema.index({ 'user_a.user': 1 });
matchSchema.index({ 'user_b.user': 1 });

matchSchema.pre('save', function (next) {
    if (!this.expires_at) {
        const d = new Date(this.initiated_at || Date.now());
        d.setDate(d.getDate() + 7);
        this.expires_at = d;
    }
    next();
});

matchSchema.plugin(mongoosePaginate);

export default mongoose.model('Match', matchSchema);
