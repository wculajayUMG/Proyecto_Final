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

// Ruta temporal para inicializar la base de datos en producción
app.get('/api/init-db', async (req, res) => {
    try {
        // Solo permitir esto en producción con una clave secreta
        const { secret } = req.query;
        if (secret !== process.env.JWT_SECRET) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        const User = require('./models/user.model').default;
        const Campana = require('./models/campana.model').default;

        // Verificar si ya hay datos
        const existingAdmin = await User.findOne({ numeroColegiado: 'ADMIN001' });
        if (existingAdmin) {
            return res.json({ message: 'Base de datos ya inicializada' });
        }

        // Crear usuario administrador
        const admin = new User({
            numeroColegiado: 'ADMIN001',
            nombreCompleto: 'Administrador del Sistema',
            correoElectronico: 'admin@cig.org.gt',
            dpi: '1234567890101',
            fechaNacimiento: new Date('1990-01-01'),
            password: 'Admin@2025',
            rol: 'admin'
        });

        await admin.save();

        // Crear usuarios de prueba
        const usuario1 = new User({
            numeroColegiado: 'ING001',
            nombreCompleto: 'Juan Pérez',
            correoElectronico: 'juan.perez@email.com',
            dpi: '1234567890102',
            fechaNacimiento: new Date('1985-05-15'),
            password: 'Votante@2025',
            rol: 'votante'
        });

        const usuario2 = new User({
            numeroColegiado: 'ING002',
            nombreCompleto: 'María García',
            correoElectronico: 'maria.garcia@email.com',
            dpi: '1234567890103',
            fechaNacimiento: new Date('1988-08-20'),
            password: 'Votante@2025',
            rol: 'votante'
        });

        await Promise.all([usuario1.save(), usuario2.save()]);

        // Crear campaña de prueba
        const campana = new Campana({
            titulo: 'Elección de Junta Directiva 2025',
            descripcion: 'Elección de la nueva Junta Directiva del Colegio de Ingenieros para el período 2025-2027',
            cantidadVotosPorCampana: 1,
            estado: 'deshabilitada',
            fechaInicio: new Date('2025-11-01'),
            fechaFin: new Date('2025-11-30'),
            candidatos: [
                {
                    nombreCompleto: 'Carlos Rodríguez',
                    descripcion: 'Ingeniero Civil con 15 años de experiencia',
                    votos: 0
                },
                {
                    nombreCompleto: 'Ana Martínez',
                    descripcion: 'Ingeniera Industrial, expresidenta del Colegio',
                    votos: 0
                }
            ],
            votantes: []
        });

        await campana.save();

        res.json({ message: 'Base de datos inicializada correctamente' });
    } catch (error) {
        console.error('Error al inicializar DB:', error);
        res.status(500).json({ message: 'Error al inicializar la base de datos' });
    }
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