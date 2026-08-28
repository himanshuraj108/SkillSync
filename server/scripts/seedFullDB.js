import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Match from '../models/Match.js';
import Session from '../models/Session.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const usersData = [
  {
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@iitd.ac.in',
    password: 'Password123!',
    role: 'professor',
    institution: 'IIT Delhi',
    bio: 'Associate Professor in CS. 10+ years teaching Data Structures, Algorithms, and System Design. Looking to master Figma & UI Design.',
    location: 'New Delhi, India',
    timezone: 'Asia/Kolkata',
    skills_teach: [
      { skill: 'Java', level: 'expert', verified: true },
      { skill: 'Data Structures', level: 'expert', verified: true },
      { skill: 'Algorithms', level: 'expert', verified: true },
      { skill: 'System Design', level: 'advanced', verified: true }
    ],
    skills_learn: [
      { skill: 'Figma', priority: 'high' },
      { skill: 'UI/UX', priority: 'high' },
      { skill: 'Photoshop', priority: 'medium' }
    ],
    availability: [
      { day: 'Mon', start: '16:00', end: '20:00' },
      { day: 'Wed', start: '16:00', end: '20:00' },
      { day: 'Sat', start: '10:00', end: '18:00' }
    ],
    reputation: { score: 96, total_reviews: 24, sessions_completed: 28, no_shows: 0 },
    is_active: true,
    is_email_verified: true
  },
  {
    name: 'Aarav Patel',
    email: 'aarav.patel@bits-pilani.ac.in',
    password: 'Password123!',
    role: 'student',
    institution: 'BITS Pilani',
    bio: 'Product Designer & UI engineer. Built designs for 3 startups. Keen to level up in Python backend and Machine Learning.',
    location: 'Goa, India',
    timezone: 'Asia/Kolkata',
    skills_teach: [
      { skill: 'Figma', level: 'expert', verified: true },
      { skill: 'UI/UX', level: 'advanced', verified: true },
      { skill: 'Photoshop', level: 'intermediate', verified: false }
    ],
    skills_learn: [
      { skill: 'Python', priority: 'high' },
      { skill: 'Java', priority: 'high' },
      { skill: 'SQL', priority: 'medium' }
    ],
    availability: [
      { day: 'Tue', start: '18:00', end: '22:00' },
      { day: 'Thu', start: '18:00', end: '22:00' },
      { day: 'Sat', start: '14:00', end: '20:00' },
      { day: 'Sun', start: '10:00', end: '18:00' }
    ],
    reputation: { score: 92, total_reviews: 18, sessions_completed: 20, no_shows: 0 },
    is_active: true,
    is_email_verified: true
  },
  {
    name: 'Dr. Rajesh Verma',
    email: 'r.verma@iitb.ac.in',
    password: 'Password123!',
    role: 'professor',
    institution: 'IIT Bombay',
    bio: 'Research scientist in AI & Computer Vision. Passionate about mentoring students and eager to learn Full-Stack React & Next.js.',
    location: 'Mumbai, India',
    timezone: 'Asia/Kolkata',
    skills_teach: [
      { skill: 'Python', level: 'expert', verified: true },
      { skill: 'Machine Learning', level: 'expert', verified: true },
      { skill: 'Deep Learning', level: 'advanced', verified: true }
    ],
    skills_learn: [
      { skill: 'React', priority: 'high' },
      { skill: 'JavaScript', priority: 'high' },
      { skill: 'Docker', priority: 'medium' }
    ],
    availability: [
      { day: 'Mon', start: '17:00', end: '21:00' },
      { day: 'Fri', start: '17:00', end: '21:00' },
      { day: 'Sun', start: '11:00', end: '17:00' }
    ],
    reputation: { score: 98, total_reviews: 32, sessions_completed: 35, no_shows: 0 },
    is_active: true,
    is_email_verified: true
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@iiit.ac.in',
    password: 'Password123!',
    role: 'student',
    institution: 'IIIT Hyderabad',
    bio: 'Frontend dev specializing in React, Tailwind, and Web animation. Excited to learn SQL query optimization and PostgreSQL.',
    location: 'Hyderabad, India',
    timezone: 'Asia/Kolkata',
    skills_teach: [
      { skill: 'React', level: 'expert', verified: true },
      { skill: 'JavaScript', level: 'advanced', verified: true },
      { skill: 'TypeScript', level: 'intermediate', verified: false }
    ],
    skills_learn: [
      { skill: 'SQL', priority: 'high' },
      { skill: 'PostgreSQL', priority: 'high' },
      { skill: 'Java', priority: 'medium' }
    ],
    availability: [
      { day: 'Wed', start: '18:00', end: '22:00' },
      { day: 'Fri', start: '18:00', end: '22:00' },
      { day: 'Sat', start: '11:00', end: '19:00' }
    ],
    reputation: { score: 88, total_reviews: 14, sessions_completed: 16, no_shows: 0 },
    is_active: true,
    is_email_verified: true
  },
  {
    name: 'Karan Mehra',
    email: 'karan.m@dtu.ac.in',
    password: 'Password123!',
    role: 'student',
    institution: 'Delhi Technological University',
    bio: 'Database geek and backend developer. I can teach SQL, MongoDB, and Redis. Looking for someone to guide me in Figma & UX.',
    location: 'Delhi, India',
    timezone: 'Asia/Kolkata',
    skills_teach: [
      { skill: 'SQL', level: 'expert', verified: true },
      { skill: 'MongoDB', level: 'advanced', verified: true },
      { skill: 'Node.js', level: 'advanced', verified: true }
    ],
    skills_learn: [
      { skill: 'Figma', priority: 'high' },
      { skill: 'UI/UX', priority: 'high' },
      { skill: 'Public Speaking', priority: 'medium' }
    ],
    availability: [
      { day: 'Mon', start: '19:00', end: '22:00' },
      { day: 'Tue', start: '19:00', end: '22:00' },
      { day: 'Sun', start: '10:00', end: '16:00' }
    ],
    reputation: { score: 90, total_reviews: 16, sessions_completed: 19, no_shows: 0 },
    is_active: true,
    is_email_verified: true
  },
  {
    name: 'Ananya Gupta',
    email: 'ananya.g@iitm.ac.in',
    password: 'Password123!',
    role: 'student',
    institution: 'IIT Madras',
    bio: 'Graphic designer & 3D animator. Love teaching Photoshop & Blender. Want to master Python for automation & scripting.',
    location: 'Chennai, India',
    timezone: 'Asia/Kolkata',
    skills_teach: [
      { skill: 'Photoshop', level: 'expert', verified: true },
      { skill: 'Blender', level: 'advanced', verified: true },
      { skill: 'Illustrator', level: 'advanced', verified: true }
    ],
    skills_learn: [
      { skill: 'Python', priority: 'high' },
      { skill: 'Java', priority: 'medium' },
      { skill: 'Git', priority: 'medium' }
    ],
    availability: [
      { day: 'Thu', start: '17:00', end: '21:00' },
      { day: 'Sat', start: '12:00', end: '18:00' },
      { day: 'Sun', start: '12:00', end: '18:00' }
    ],
    reputation: { score: 94, total_reviews: 21, sessions_completed: 23, no_shows: 0 },
    is_active: true,
    is_email_verified: true
  }
];

const seedFull = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB. Seeding realistic users and demo data...');

    // Also update test@skillswap.dev with skills if it exists
    const demoUser = await User.findOne({ email: 'test@skillswap.dev' });
    if (demoUser) {
      demoUser.skills_teach = [
        { skill: 'Java', level: 'advanced', verified: true },
        { skill: 'SQL', level: 'intermediate', verified: true },
        { skill: 'Data Structures', level: 'advanced', verified: true }
      ];
      demoUser.skills_learn = [
        { skill: 'UI/UX', priority: 'high' },
        { skill: 'Figma', priority: 'high' },
        { skill: 'Python', priority: 'medium' }
      ];
      demoUser.availability = [
        { day: 'Mon', start: '09:00', end: '21:00' },
        { day: 'Tue', start: '09:00', end: '21:00' },
        { day: 'Wed', start: '09:00', end: '21:00' },
        { day: 'Thu', start: '09:00', end: '21:00' },
        { day: 'Fri', start: '09:00', end: '21:00' },
        { day: 'Sat', start: '09:00', end: '21:00' },
        { day: 'Sun', start: '09:00', end: '21:00' }
      ];
      demoUser.bio = 'Full stack developer & student. Eager to swap programming mentorship for design guidance!';
      demoUser.institution = 'IIT Delhi';
      demoUser.location = 'New Delhi, India';
      demoUser.reputation = { score: 85, total_reviews: 12, sessions_completed: 15, no_shows: 0 };
      await demoUser.save();
      console.log('Updated test@skillswap.dev with rich skills & availability!');
    }

    for (const userData of usersData) {
      const existing = await User.findOne({ email: userData.email });
      if (!existing) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        await User.create({
          ...userData,
          password: hashedPassword
        });
        console.log(`Created user: ${userData.name}`);
      } else {
        Object.assign(existing, userData);
        await existing.save();
        console.log(`Updated user: ${userData.name}`);
      }
    }

    console.log('Database seeded successfully with realistic users & matching skills!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedFull();
