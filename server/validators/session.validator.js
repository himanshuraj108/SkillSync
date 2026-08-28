import { body } from 'express-validator';

export const createSessionValidator = [
    body('match_id').isMongoId().withMessage('Valid match ID is required'),
    body('teacher_id').isMongoId().withMessage('Valid teacher ID is required'),
    body('learner_id').isMongoId().withMessage('Valid learner ID is required'),
    body('skill').notEmpty().withMessage('Skill is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('scheduled_at').isISO8601().toDate().withMessage('Valid scheduled date is required')
];
