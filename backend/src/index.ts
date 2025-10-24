import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { connectDB } from './config/database';

import userRoutes from './routes/user.routes';
import campanaRoutes from './routes/campana.routes';
import votacionRoutes from './routes/votacion.routes';

dotenv.config();

const app = express();

// Configuración de seguridad
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", 'http://localhost:3000', 'http://localhost:5000'],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            fontSrc: ["'self'", 'https:', 'data:']
        }
    }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
connectDB();

// Ruta de prueba para verificar que el servidor está funcionando
app.get('/', (req, res) => {
    res.json({ message: 'API del Sistema de Votación está funcionando correctamente' });
});

// Rutas API
app.use('/api/users', userRoutes);
app.use('/api/campanas', campanaRoutes);
app.use('/api', votacionRoutes); // Las rutas de votación ya incluyen /campanas en sus paths

// Manejo de errores
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send('¡Algo salió mal!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});