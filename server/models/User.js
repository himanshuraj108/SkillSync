import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import mongoosePaginate from 'mongoose-paginate-v2';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    avatar: {
        url: { type: String, default: '' },
        publicId: { type: String, default: '' }
    },
    bio: { type: String, maxlength: 500 },
    location: { type: String },
    timezone: { type: String, default: 'Asia/Kolkata' },
    role: { type: String, enum: ['student', 'professor', 'admin'], default: 'student' },
    institution: { type: String },
    skills_teach: [{
        skill: { type: String, required: true },
        level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
        verified: { type: Boolean, default: false }
    }],
    skills_learn: [{
        skill: { type: String, required: true },
        priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
    }],
    availability: [{
        day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
        start: { type: String },
        end: { type: String }
    }],
    reputation: {
        score: { type: Number, default: 0 },
        total_reviews: { type: Number, default: 0 },
        sessions_completed: { type: Number, default: 0 },
        no_shows: { type: Number, default: 0 }
    },
    is_email_verified: { type: Boolean, default: true },
    email_verification_token: { type: String, select: false },
    password_reset_token: { type: String, select: false },
    password_reset_expires: { type: Date, select: false },
    refresh_token: { type: String, select: false },
    is_active: { type: Boolean, default: true },
    last_seen: { type: Date },
    created_at: { type: Date, default: Date.now }
});

userSchema.index({ role: 1 });
userSchema.index({ institution: 1 });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.email_verification_token;
    delete obj.password_reset_token;
    delete obj.password_reset_expires;
    delete obj.refresh_token;
    return obj;
};

userSchema.plugin(mongoosePaginate);

export default mongoose.model('User', userSchema);
