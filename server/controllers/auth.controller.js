import crypto from 'crypto';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils.js';
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email.utils.js';

export const register = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            role,
            institution,
            location,
            bio,
            skills_teach,
            skills_learn,
            availability
        } = req.body;
        
        const normalizedEmail = (email || '').trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            if (existingUser.is_active === false) {
                // If previous account was deleted, remove the ghost record so user can register fresh
                await User.findByIdAndDelete(existingUser._id);
            } else {
                return res.status(400).json({ 
                    success: false, 
                    message: 'This email is already registered. Please log in instead or use another email.' 
                });
            }
        }

        const user = await User.create({
            name,
            email: normalizedEmail,
            password,
            role: role || 'student',
            institution: institution || '',
            location: location || '',
            bio: bio || '',
            skills_teach: Array.isArray(skills_teach) ? skills_teach : [],
            skills_learn: Array.isArray(skills_learn) ? skills_learn : [],
            availability: Array.isArray(availability) ? availability : [],
            is_email_verified: true
        });

        // Send welcome email in background (non-blocking)
        sendWelcomeEmail(email, name).catch(() => {});

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refresh_token = refreshToken;
        await user.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            success: true,
            data: user.toPublicJSON(),
            accessToken
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = (email || '').trim().toLowerCase();
        
        const user = await User.findOne({ email: normalizedEmail }).select('+password');
        if (!user || user.is_active === false) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        user.last_seen = new Date();
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refresh_token = refreshToken;
        await user.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            data: user.toPublicJSON(),
            accessToken
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const user = await User.findOne({ refresh_token: refreshToken });
            if (user) {
                user.refresh_token = undefined;
                await user.save();
            }
        }
        
        res.clearCookie('refreshToken');
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.status(401).json({ success: false, message: 'No refresh token provided' });
        }

        const decoded = verifyRefreshToken(token);
        const user = await User.findById(decoded.userId).select('+refresh_token');
        
        if (!user || user.refresh_token !== token || user.is_active === false) {
            return res.status(401).json({ success: false, message: 'Invalid or deactivated account session' });
        }

        const accessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        user.refresh_token = newRefreshToken;
        await user.save();

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ success: true, accessToken });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const normalizedEmail = (email || '').trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail, is_active: true });
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'No account exists with this email address.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.password_reset_token = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.password_reset_expires = Date.now() + 60 * 60 * 1000; // 1 hour

        await user.save();
        
        sendPasswordResetEmail(user.email, user.name, resetToken).catch(err => {
            console.error('Password reset email error:', err.message);
        });

        res.status(200).json({ success: true, message: 'Password reset email sent' });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            password_reset_token: hashedToken,
            password_reset_expires: { $gt: Date.now() },
            is_active: true
        }).select('+password_reset_token +password_reset_expires');

        if (!user) {
            return res.status(400).json({ success: false, message: 'Password reset link is invalid, expired, or the account has been deleted.' });
        }

        user.password = newPassword;
        user.password_reset_token = undefined;
        user.password_reset_expires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        next(error);
    }
};

export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ success: false, message: 'No verification token provided.' });
        }

        const user = await User.findOne({ email_verification_token: token }).select('+email_verification_token');

        if (!user) {
            // Token already consumed — check if user clicked a second time after being verified
            return res.status(400).json({ success: false, message: 'This verification link has already been used or has expired. If your email is verified, you can continue normally.' });
        }

        user.is_email_verified = true;
        user.email_verification_token = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Your email address has been successfully verified.',
            data: user.toPublicJSON()
        });
    } catch (error) {
        next(error);
    }
};

export const resendVerification = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.is_email_verified) {
            return res.status(400).json({ success: false, message: 'Your email is already verified.' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.email_verification_token = verificationToken;
        await user.save();

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const verifyUrl = `${clientUrl}/verify-email?token=${verificationToken}`;
        console.log(`[VERIFICATION EMAIL SENT] Recipient: ${user.email} | Link: ${verifyUrl}`);

        sendVerificationEmail(user.email, user.name, verificationToken).catch(err => {
            console.error('Resend verification email error:', err.message);
        });

        res.status(200).json({
            success: true,
            message: 'A new verification link has been sent to your email address.'
        });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, data: req.user.toPublicJSON() });
    } catch (error) {
        next(error);
    }
};

export const checkEmail = async (req, res, next) => {
    try {
        const rawEmail = req.query.email || req.body.email || '';
        const email = rawEmail.trim().toLowerCase();
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        const user = await User.findOne({ email });
        return res.status(200).json({
            success: true,
            available: !user,
            is_email_verified: user ? user.is_email_verified : null,
            message: user ? 'This email is already registered.' : 'Email is available'
        });
    } catch (error) {
        next(error);
    }
};
