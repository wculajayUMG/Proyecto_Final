import express, { Request, Response } from 'express';
import { registerUser, loginUser, getUsers } from '../controllers/user.controller';
import { verifyToken as auth, isAdmin } from '../middlewares/auth.middleware';
import { validateUserData } from '../middlewares/validation.middleware';
import User from '../models/user.model';

const router = express.Router();

// Rutas públicas
router.post('/register', validateUserData, registerUser);
router.post('/login', loginUser);

// Rutas protegidas
router.get('/profile', auth, async (req: Request, res: Response) => {
    try {
        // El middleware auth ya adjuntó el usuario a req.user
        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Excluimos la contraseña de la respuesta
        const userWithoutPassword = {
            ...user.toObject(),
            password: undefined
        };

        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ message: 'Error al obtener el perfil' });
    }
});

// Rutas protegidas (requieren autenticación y ser administrador)
router.get('/', auth, isAdmin, getUsers);

export default router;