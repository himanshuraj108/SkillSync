import mongoose from 'mongoose';

export const connectDB = async () => {
    let retries = 5;
    while (retries) {
        try {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('MongoDB connected successfully');
            break;
        } catch (error) {
            console.error(`MongoDB connection failed. Retries left: ${retries - 1}`);
            retries -= 1;
            if (retries === 0) throw error;
            await new Promise(res => setTimeout(res, 5000));
        }
    }
};
