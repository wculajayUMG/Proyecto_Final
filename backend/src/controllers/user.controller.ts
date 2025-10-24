import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User, { IUser } from '../models/user.model';

// Función para obtener todos los usuarios
export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find().select('-password'); // Excluimos el campo password
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
};

const createToken = (userId: mongoose.Types.ObjectId): string => {
    const payload = { id: userId.toString() };
    const secret = Buffer.from(process.env.JWT_SECRET || 'tu_secret_key', 'utf-8');
    return jwt.sign(payload, secret);
};

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { numeroColegiado, nombreCompleto, correoElectronico, dpi, fechaNacimiento, password } = req.body;

        // Verificar si el usuario ya existe
        const usuarioExistente = await User.findOne({
            $or: [
                { numeroColegiado },
                { correoElectronico },
                { dpi }
            ]
        });

        if (usuarioExistente) {
            return res.status(400).json({
                error: 'Usuario ya registrado con ese número de colegiado, correo o DPI'
            });
        }

        const user = new User({
            numeroColegiado,
            nombreCompleto,
            correoElectronico,
            dpi,
            fechaNacimiento: new Date(fechaNacimiento),
            password
        });

        await user.save();
        const token = createToken(user._id);
        res.status(201).json({ user, token });
    } catch (error: any) {
        // Si es un error de validación
        if (error.name === 'ValidationError' || error.message.includes('validation')) {
            return res.status(400).json({ 
                success: false,
                message: 'Error de validación',
                details: {
                    password: 'La contraseña debe cumplir con los siguientes requisitos:\n' +
                        '- Al menos 8 caracteres de longitud\n' +
                        '- Al menos una letra mayúscula\n' +
                        '- Al menos una letra minúscula\n' +
                        '- Al menos un número\n' +
                        '- Al menos un carácter especial (!@#$%^&*()_+-=[]{};\'"\\|,.<>/?)'
                }
            });
        }
        res.status(400).json({ 
            success: false,
            message: 'Error al registrar el usuario',
            error: error.message 
        });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { numeroColegiado, dpi, fechaNacimiento, password } = req.body;
        
        console.log('Intentando login con:', { numeroColegiado, dpi, fechaNacimiento });
        
        const user = await User.findOne({ numeroColegiado }).exec();

        if (!user) {
            console.log('Usuario no encontrado');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        console.log('Usuario encontrado:', {
            numeroColegiado: user.numeroColegiado,
            dpi: user.dpi,
            fechaBD: user.fechaNacimiento.toISOString().split('T')[0],
            fechaInput: new Date(fechaNacimiento).toISOString().split('T')[0]
        });

        // Verificar DPI y fecha de nacimiento
        const fechaInputISO = new Date(fechaNacimiento).toISOString().split('T')[0];
        const fechaBDISO = user.fechaNacimiento.toISOString().split('T')[0];
        
        if (user.dpi !== dpi || fechaBDISO !== fechaInputISO) {
            console.log('DPI o fecha no coinciden:', {
                dpiCoincide: user.dpi === dpi,
                fechaCoincide: fechaBDISO === fechaInputISO
            });
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const isMatch = await user.comparePassword(password);
        console.log('Resultado de comparación de contraseña:', isMatch);

        if (!isMatch) {
            console.log('Contraseña incorrecta');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = createToken(user._id);
        res.json({ user, token });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
};