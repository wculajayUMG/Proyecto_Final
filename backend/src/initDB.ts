import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model';
import Campana from './models/campana.model';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sistema-votacion';

// Función para inicializar la base de datos
async function initializeDatabase() {
    try {
        console.log('Intentando conectar a MongoDB en:', MONGODB_URI);
        
        // Conectar a MongoDB con opciones explícitas
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // Tiempo de espera para la selección del servidor
            socketTimeoutMS: 45000, // Tiempo de espera para las operaciones
        });
        
        console.log('✅ Conectado exitosamente a MongoDB');

        // Limpiar las colecciones existentes
        await User.deleteMany({});
        await Campana.deleteMany({});
        console.log('Colecciones limpiadas');

        // Crear usuario administrador
        const admin = new User({
            numeroColegiado: 'ADMIN001',
            nombreCompleto: 'Administrador del Sistema',
            correoElectronico: 'admin@cig.org.gt',
            dpi: '1234567890101',
            fechaNacimiento: new Date('1990-01-01'),
            password: 'Admin@2025', // La contraseña se hasheará automáticamente
            rol: 'admin'
        });

        await admin.save();
        console.log('Usuario administrador creado');

        // Crear algunos usuarios de prueba
        const usuario1 = new User({
            numeroColegiado: 'ING001',
            nombreCompleto: 'Juan Pérez',
            correoElectronico: 'juan.perez@email.com',
            dpi: '1234567890102',
            fechaNacimiento: new Date('1985-05-15'),
            password: 'Votante@2025', // La contraseña se hasheará automáticamente
            rol: 'votante'
        });

        const usuario2 = new User({
            numeroColegiado: 'ING002',
            nombreCompleto: 'María García',
            correoElectronico: 'maria.garcia@email.com',
            dpi: '1234567890103',
            fechaNacimiento: new Date('1988-08-20'),
            password: 'Votante@2025', // La contraseña se hasheará automáticamente
            rol: 'votante'
        });

        await Promise.all([usuario1.save(), usuario2.save()]);
        console.log('Usuarios de prueba creados');

        // Crear una campaña de prueba
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
        console.log('Campaña de prueba creada');

        console.log('Base de datos inicializada correctamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:');
        if (error instanceof Error) {
            console.error('Mensaje de error:', error.message);
            console.error('Stack trace:', error.stack);
        } else {
            console.error('Error desconocido:', error);
        }
        process.exit(1);
    } finally {
        console.log('🔄 Proceso de inicialización finalizado');
    }
}

// Ejecutar la inicialización
initializeDatabase();