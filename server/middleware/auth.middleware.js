import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protectRoute = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            req.user = await User.findById(decoded.userId);
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'User not found' });
            }
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, code: 'TOKEN_EXPIRED', message: 'Token expired' });
            }
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
    } catch (error) {
        next(error);
    }
};

export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        next();
    };
};
