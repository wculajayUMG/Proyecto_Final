import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sistema-votacion';

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB conectado exitosamente');
    } catch (error) {
        console.error('❌ Error al conectar con MongoDB:', error);
        process.exit(1);
    }
};