import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Must contain uppercase').regex(/[0-9]/, 'Must contain number'),
  role: z.enum(['student', 'professor']),
  institution: z.string().optional(),
})

export const profileSchema = z.object({
  name: z.string().min(2).max(50),
  bio: z.string().max(500).optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  institution: z.string().optional(),
})

export const skillTeachSchema = z.object({
  skill: z.string().min(2, 'Skill name too short'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
})

export const skillLearnSchema = z.object({
  skill: z.string().min(2, 'Skill name too short'),
  priority: z.enum(['low', 'medium', 'high']),
})

export const sessionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  skill: z.string().min(1, 'Skill is required'),
  match_id: z.string().min(1, 'Match ID is required'),
  scheduled_at: z.string().refine((val) => new Date(val) > new Date(), 'Date must be in the future'),
  duration_minutes: z.enum(['30', '45', '60', '90', '120']),
  description: z.string().optional(),
  agenda: z.string().optional(),
})

export const matchRequestSchema = z.object({
  target_user_id: z.string().min(1, 'Target user is required'),
  intro_message: z.string().max(300).optional(),
  teaches_skill: z.string().min(1, 'Skill is required'),
  learns_skill: z.string().min(1, 'Skill is required'),
})

export const reviewSchema = z.object({
  overall: z.number().min(1).max(5),
  teaching_quality: z.number().min(1).max(5),
  punctuality: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  preparation: z.number().min(1).max(5),
  written_feedback: z.string().max(1000).optional(),
})

export const passwordChangeSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'Must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})
