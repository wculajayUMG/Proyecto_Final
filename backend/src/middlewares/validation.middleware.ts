import { Request, Response, NextFunction } from 'express';

export const validateDPI = (dpi: string): boolean => {
    // El DPI guatemalteco tiene 13 dígitos
    const dpiRegex = /^\d{13}$/;
    return dpiRegex.test(dpi);
};

export const validateColegiadoFormat = (numeroColegiado: string): boolean => {
    // Formato: ING seguido de 3 o más dígitos
    const colegiadoRegex = /^ING\d{3,}$/;
    return colegiadoRegex.test(numeroColegiado);
};

export const validatePassword = (password: string): { isValid: boolean; requirements?: string[] } => {
    const requirements = [];
    
    if (password.length < 8) {
        requirements.push('Al menos 8 caracteres de longitud');
    }
    if (!/[A-Z]/.test(password)) {
        requirements.push('Al menos una letra mayúscula');
    }
    if (!/[a-z]/.test(password)) {
        requirements.push('Al menos una letra minúscula');
    }
    if (!/[0-9]/.test(password)) {
        requirements.push('Al menos un número');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) {
        requirements.push('Al menos un carácter especial (!@#$%^&*()_+-=[]{};\'"\\|,.<>/?)');
    }
    
    return {
        isValid: requirements.length === 0,
        requirements: requirements.length > 0 ? requirements : undefined
    };
};

export const validateUserData = (req: Request, res: Response, next: NextFunction) => {
    const { numeroColegiado, dpi, password } = req.body;

    if (!validateDPI(dpi)) {
        return res.status(400).json({
            success: false,
            message: 'El formato del DPI no es válido. Debe contener exactamente 13 dígitos.'
        });
    }

    if (!validateColegiadoFormat(numeroColegiado)) {
        return res.status(400).json({
            success: false,
            message: 'El formato del número de colegiado no es válido. Debe comenzar con ING seguido de al menos 3 dígitos.'
        });
    }

    const validationResult = validatePassword(password);
    if (!validationResult.isValid) {
        return res.status(400).json({
            success: false,
            message: 'Error en la validación de la contraseña',
            details: {
                password: {
                    message: 'La contraseña debe cumplir con los siguientes requisitos:',
                    requirements: validationResult.requirements
                }
            }
        });
    }

    next();
};