import { Request, Response } from 'express';
import Campana from '../models/campana.model';
import { IUser } from '../models/user.model';

interface AuthRequest extends Request {
    user?: IUser;
}

export const verificarVotosDisponibles = async (req: AuthRequest, res: Response) => {
    try {
        const { campanaId } = req.params;
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }
        
        const userId = req.user._id;

        const campana = await Campana.findById(campanaId);
        if (!campana) {
            return res.status(404).json({
                success: false,
                message: 'Campaña no encontrada'
            });
        }

        // Verificar si el usuario ya ha votado
        const votosEmitidos = campana.votantes.filter(v => v === userId.toString()).length;
        const votosDisponibles = campana.cantidadVotosPorCampana - votosEmitidos;

        res.json({
            success: true,
            data: {
                votosDisponibles,
                votosEmitidos,
                totalPermitidos: campana.cantidadVotosPorCampana
            }
        });
    } catch (error) {
        console.error('Error al verificar votos disponibles:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar votos disponibles'
        });
    }
};

export const getTiempoRestante = async (req: Request, res: Response) => {
    try {
        const { campanaId } = req.params;
        
        const campana = await Campana.findById(campanaId);
        if (!campana) {
            return res.status(404).json({
                success: false,
                message: 'Campaña no encontrada'
            });
        }

        const ahora = new Date();
        const tiempoRestante = campana.fechaFin.getTime() - ahora.getTime();
        
        // Si el tiempo ha expirado y la campaña sigue habilitada, la deshabilitamos
        if (tiempoRestante <= 0 && campana.estado === 'habilitada') {
            campana.estado = 'deshabilitada';
            await campana.save();
        }

        // Calcular la duración total en milisegundos
        const duracionTotal = campana.fechaFin.getTime() - campana.fechaInicio.getTime();
        const duracionRestante = Math.max(0, tiempoRestante);
        const porcentajeCompletado = ((duracionTotal - duracionRestante) / duracionTotal) * 100;

        res.json({
            success: true,
            data: {
                tiempoRestante: duracionRestante,
                duracionTotal,
                porcentajeCompletado: Math.min(100, Math.max(0, porcentajeCompletado)), // Asegurar que esté entre 0 y 100
                estado: campana.estado,
                fechaInicio: campana.fechaInicio,
                fechaFin: campana.fechaFin,
                // Formatear las duraciones para visualización
                duracionFormateada: {
                    dias: Math.floor(duracionTotal / (1000 * 60 * 60 * 24)),
                    horas: Math.floor((duracionTotal % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutos: Math.floor((duracionTotal % (1000 * 60 * 60)) / (1000 * 60))
                },
                tiempoRestanteFormateado: {
                    dias: Math.floor(duracionRestante / (1000 * 60 * 60 * 24)),
                    horas: Math.floor((duracionRestante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutos: Math.floor((duracionRestante % (1000 * 60 * 60)) / (1000 * 60))
                }
            }
        });
    } catch (error) {
        console.error('Error al obtener tiempo restante:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener tiempo restante de la campaña'
        });
    }
};

export const emitirVoto = async (req: AuthRequest, res: Response) => {
    try {
        const { campanaId, candidatoId } = req.params;
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const userId = req.user._id;

        // Buscar la campaña
        const campana = await Campana.findById(campanaId);
        if (!campana) {
            return res.status(404).json({
                success: false,
                message: 'Campaña no encontrada'
            });
        }

        // Verificar si la campaña está habilitada
        if (campana.estado !== 'habilitada') {
            return res.status(400).json({
                success: false,
                message: 'La campaña no está habilitada para votar'
            });
        }

        // Verificar si la campaña está dentro del período de votación
        const ahora = new Date();
        if (ahora < campana.fechaInicio || ahora > campana.fechaFin) {
            return res.status(400).json({
                success: false,
                message: 'La campaña está fuera del período de votación'
            });
        }

        // Verificar si el usuario aún tiene votos disponibles
        const votosEmitidos = campana.votantes.filter(v => v === userId.toString()).length;
        if (votosEmitidos >= campana.cantidadVotosPorCampana) {
            return res.status(400).json({
                success: false,
                message: 'Ya ha utilizado todos sus votos disponibles para esta campaña'
            });
        }

        // Verificar si el candidato existe en la campaña
        const candidato = campana.candidatos.find(c => c._id.toString() === candidatoId);
        if (!candidato) {
            return res.status(404).json({
                success: false,
                message: 'Candidato no encontrado en esta campaña'
            });
        }

        // Incrementar los votos del candidato y registrar al votante
        candidato.votos += 1;
        campana.votantes.push(userId.toString()); // Convertimos el ObjectId a string

        await campana.save();

        res.json({
            success: true,
            message: 'Voto emitido correctamente',
            data: {
                votosRestantes: campana.cantidadVotosPorCampana - (votosEmitidos + 1)
            }
        });
    } catch (error) {
        console.error('Error al emitir voto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar el voto'
        });
    }
};