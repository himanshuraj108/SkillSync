import { body } from 'express-validator';

export const sendMatchRequestValidator = [
    body('targetUserId').isMongoId().withMessage('Valid target user ID is required'),
    body('intro_message').optional().isString().trim().isLength({ max: 500 }).withMessage('Message too long')
];
