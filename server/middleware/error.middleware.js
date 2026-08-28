export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') {
        error.message = `Resource not found with id of ${err.value}`;
        return res.status(404).json({ success: false, message: error.message });
    }

    if (err.code === 11000) {
        error.message = 'Duplicate field value entered';
        return res.status(400).json({ success: false, message: error.message });
    }

    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message).join(', ');
        return res.status(400).json({ success: false, message });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, code: 'TOKEN_EXPIRED', message: 'Token expired' });
    }

    res.status(err.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
