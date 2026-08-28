import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';

dotenv.config();

const skillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    description: String
});

const Skill = mongoose.models.Skill || mongoose.model('Skill', skillSchema);

const skillsData = [
    { name: 'Java', slug: 'java', category: 'Technology', description: 'Object-oriented programming language' },
    { name: 'Python', slug: 'python', category: 'Technology', description: 'High-level programming language' },
    { name: 'JavaScript', slug: 'javascript', category: 'Technology', description: 'Web development language' },
    { name: 'TypeScript', slug: 'typescript', category: 'Technology', description: 'Typed JavaScript at scale' },
    { name: 'React', slug: 'react', category: 'Technology', description: 'Frontend library for UI' },
    { name: 'Node.js', slug: 'node-js', category: 'Technology', description: 'JavaScript runtime built on Chrome V8' },
    { name: 'SQL', slug: 'sql', category: 'Technology', description: 'Relational database language' },
    { name: 'MongoDB', slug: 'mongodb', category: 'Technology', description: 'NoSQL database' },
    { name: 'PostgreSQL', slug: 'postgresql', category: 'Technology', description: 'Advanced open source relational database' },
    { name: 'Docker', slug: 'docker', category: 'Technology', description: 'Containerization platform' },
    { name: 'Kubernetes', slug: 'kubernetes', category: 'Technology', description: 'Container orchestration' },
    { name: 'AWS', slug: 'aws', category: 'Technology', description: 'Amazon Web Services cloud computing' },
    { name: 'Git', slug: 'git', category: 'Technology', description: 'Version control system' },
    { name: 'Data Structures', slug: 'data-structures', category: 'Technology', description: 'Fundamentals of computing' },
    { name: 'Algorithms', slug: 'algorithms', category: 'Technology', description: 'Problem-solving steps' },
    { name: 'Machine Learning', slug: 'machine-learning', category: 'Technology', description: 'AI subset' },
    { name: 'Deep Learning', slug: 'deep-learning', category: 'Technology', description: 'Neural networks' },
    { name: 'Computer Vision', slug: 'computer-vision', category: 'Technology', description: 'Image processing AI' },
    { name: 'NLP', slug: 'nlp', category: 'Technology', description: 'Natural language processing' },
    { name: 'Cybersecurity', slug: 'cybersecurity', category: 'Technology', description: 'Information security' },
    { name: 'Linux', slug: 'linux', category: 'Technology', description: 'Open-source OS' },
    { name: 'C++', slug: 'cpp', category: 'Technology', description: 'General-purpose programming language' },
    { name: 'Rust', slug: 'rust', category: 'Technology', description: 'Systems programming language' },
    { name: 'Go', slug: 'go', category: 'Technology', description: 'Google developed programming language' },
    { name: 'Figma', slug: 'figma', category: 'Design', description: 'Collaborative interface design tool' },
    { name: 'Adobe XD', slug: 'adobe-xd', category: 'Design', description: 'UI/UX design tool' },
    { name: 'Photoshop', slug: 'photoshop', category: 'Design', description: 'Image editing software' },
    { name: 'Illustrator', slug: 'illustrator', category: 'Design', description: 'Vector graphics software' },
    { name: 'After Effects', slug: 'after-effects', category: 'Design', description: 'Motion graphics software' },
    { name: 'UI/UX', slug: 'ui-ux', category: 'Design', description: 'User interface and experience design' },
    { name: 'Sketch', slug: 'sketch', category: 'Design', description: 'Digital design toolkit' },
    { name: 'Blender', slug: 'blender', category: 'Design', description: '3D creation suite' },
    { name: '3D Modeling', slug: '3d-modeling', category: 'Design', description: 'Creating 3D objects' },
    { name: 'Motion Design', slug: 'motion-design', category: 'Design', description: 'Animation and visual effects' },
    { name: 'Hindi', slug: 'hindi', category: 'Languages', description: 'Indo-Aryan language' },
    { name: 'English', slug: 'english', category: 'Languages', description: 'West Germanic language' },
    { name: 'Spanish', slug: 'spanish', category: 'Languages', description: 'Romance language' },
    { name: 'French', slug: 'french', category: 'Languages', description: 'Romance language' },
    { name: 'German', slug: 'german', category: 'Languages', description: 'West Germanic language' },
    { name: 'Japanese', slug: 'japanese', category: 'Languages', description: 'East Asian language' },
    { name: 'Mandarin', slug: 'mandarin', category: 'Languages', description: 'Sino-Tibetan language' },
    { name: 'Product Management', slug: 'product-management', category: 'Business', description: 'Managing product lifecycle' },
    { name: 'Project Management', slug: 'project-management', category: 'Business', description: 'Leading teams to achieve goals' },
    { name: 'Agile', slug: 'agile', category: 'Business', description: 'Iterative project management' },
    { name: 'Marketing', slug: 'marketing', category: 'Business', description: 'Promoting products or services' },
    { name: 'Sales', slug: 'sales', category: 'Business', description: 'Selling products or services' },
    { name: 'Financial Modeling', slug: 'financial-modeling', category: 'Business', description: 'Building financial representations' },
    { name: 'Excel', slug: 'excel', category: 'Business', description: 'Spreadsheet software' },
    { name: 'PowerPoint', slug: 'powerpoint', category: 'Business', description: 'Presentation software' },
    { name: 'Public Speaking', slug: 'public-speaking', category: 'Business', description: 'Communicating to an audience' },
    { name: 'Physics', slug: 'physics', category: 'Science', description: 'Study of matter and energy' },
    { name: 'Mathematics', slug: 'mathematics', category: 'Science', description: 'Study of numbers, quantities, and shapes' },
    { name: 'Statistics', slug: 'statistics', category: 'Science', description: 'Collection, analysis, and interpretation of data' },
    { name: 'Chemistry', slug: 'chemistry', category: 'Science', description: 'Study of substances and their interactions' },
    { name: 'Biology', slug: 'biology', category: 'Science', description: 'Study of living organisms' }
];

const seedDB = async () => {
    try {
        await connectDB();
        console.log('Connected to DB. Seeding skills...');
        
        await Skill.deleteMany({});
        await Skill.insertMany(skillsData);
        
        console.log('Skills seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding skills:', error);
        process.exit(1);
    }
};

seedDB();
