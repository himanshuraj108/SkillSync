import { uploadToCloudinary } from '../config/cloudinary.js';

export const uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const result = await uploadToCloudinary(req.file.buffer, 'skillswap/avatars');
        res.status(200).json({ success: true, data: { url: result.url } });
    } catch (error) {
        next(error);
    }
};

export const uploadFile = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const result = await uploadToCloudinary(req.file.buffer, 'skillswap/chat-files', { resource_type: 'auto' });
        res.status(200).json({ 
            success: true, 
            data: { 
                url: result.url,
                name: req.file.originalname,
                size: req.file.size
            } 
        });
    } catch (error) {
        next(error);
    }
};
