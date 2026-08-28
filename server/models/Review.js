import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const reviewSchema = new mongoose.Schema({
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true, unique: true },
    match_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ratings: {
        teaching_quality: { type: Number, min: 1, max: 5 },
        punctuality: { type: Number, min: 1, max: 5 },
        communication: { type: Number, min: 1, max: 5 },
        preparation: { type: Number, min: 1, max: 5 }
    },
    overall: { type: Number, min: 1, max: 5, required: true },
    written_feedback: { type: String, maxlength: 1000 },
    is_public: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

reviewSchema.index({ reviewee: 1 });
reviewSchema.plugin(mongoosePaginate);

export default mongoose.model('Review', reviewSchema);
