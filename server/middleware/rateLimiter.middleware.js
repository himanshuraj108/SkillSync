import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 10000 : 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' }
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 1000 : 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many authentication attempts, please try again later.' }
});

export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: isDev ? 500 : 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many uploads, please try again in an hour.' }
});
