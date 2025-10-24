import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model';

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('Headers recibidos:', req.headers);
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log('Token extraído:', token);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No se proporcionó token de autenticación'
            });
        }

        interface JwtPayload {
            id: string;
        }

        const secret = Buffer.from(process.env.JWT_SECRET || 'tu_secret_key', 'utf-8');
        const decoded = jwt.verify(token, secret) as JwtPayload;
        if (typeof decoded === 'string') {
            throw new Error('Token inválido');
        }

        console.log('ID decodificado:', decoded.id);
        const user = await User.findById(decoded.id);
        console.log('Usuario encontrado:', user);
        
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error de autenticación:', error);
        res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new Error('Usuario no autenticado');
        }

        if (req.user.rol !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado - Se requieren privilegios de administrador'
            });
        }

        next();
    } catch (error) {
        console.error('Error de autorización:', error);
        res.status(403).json({
            success: false,
            message: 'Error de autorización'
        });
    }
};