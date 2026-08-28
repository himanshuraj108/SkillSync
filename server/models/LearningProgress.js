import mongoose from 'mongoose';

const learningProgressSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skill_id: { type: String, required: true },
    sessions_completed: { type: Number, default: 0 },
    total_hours: { type: Number, default: 0 },
    current_level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'beginner'
    },
    milestones: [{
        title: String,
        description: String,
        status: { type: String, enum: ['pending', 'completed'] },
        completed_at: Date
    }],
    weak_topics: [{
        topic: String,
        detection_count: { type: Number, default: 1 },
        last_flagged: Date
    }],
    roadmap: [{
        step: Number,
        title: String,
        description: String,
        resources: [{ title: String, url: String }],
        status: { type: String, enum: ['pending', 'in_progress', 'completed'] },
        completed_at: Date
    }],
    ai_last_generated_at: Date,
    updated_at: { type: Date, default: Date.now }
});

learningProgressSchema.index({ user_id: 1, skill_id: 1 }, { unique: true });

export default mongoose.model('LearningProgress', learningProgressSchema);
