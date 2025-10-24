import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Campana from '../models/campana.model';
import { IUser } from '../models/user.model';

// Extender la interfaz Request para incluir el usuario
interface RequestWithUser extends Request {
    user?: IUser;
}

export const crearCampana = async (req: Request, res: Response) => {
    try {
        const { titulo, descripcion, cantidadVotosPorCampana, fechaInicio, fechaFin } = req.body;

        const campana = new Campana({
            titulo,
            descripcion,
            cantidadVotosPorCampana,
            fechaInicio,
            fechaFin
        });

        await campana.save();
        res.status(201).json(campana);
    } catch (error) {
        res.status(400).json({ error: 'Error al crear la campaña' });
    }
};

export const obtenerCampana = async (req: Request, res: Response) => {
    try {
        const campana = await Campana.findById(req.params.id);
        if (!campana) {
            return res.status(404).json({ message: 'Campaña no encontrada' });
        }
        res.json(campana);
    } catch (error) {
        console.error('Error al obtener campaña:', error);
        res.status(500).json({ message: 'Error al obtener la campaña' });
    }
};

export const obtenerCampanas = async (req: Request, res: Response) => {
    try {
        const campanas = await Campana.find();
        res.json(campanas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las campañas' });
    }
};

export const actualizarCampana = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, cantidadVotosPorCampana, fechaInicio, fechaFin } = req.body;

        const campanaActualizada = await Campana.findByIdAndUpdate(
            id,
            {
                titulo,
                descripcion,
                cantidadVotosPorCampana,
                fechaInicio,
                fechaFin
            },
            { new: true }
        );

        if (!campanaActualizada) {
            return res.status(404).json({ message: 'Campaña no encontrada' });
        }

        res.json(campanaActualizada);
    } catch (error) {
        console.error('Error al actualizar la campaña:', error);
        res.status(500).json({ message: 'Error al actualizar la campaña' });
    }
};

export const actualizarEstadoCampana = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const campana = await Campana.findByIdAndUpdate(
            id,
            { estado },
            { new: true }
        );

        if (!campana) {
            return res.status(404).json({ error: 'Campaña no encontrada' });
        }

        res.json(campana);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el estado de la campaña' });
    }
};

export const agregarCandidato = async (req: Request, res: Response) => {
    try {
        console.log('Request completo:', {
            params: req.params,
            body: req.body,
            headers: req.headers
        });

        const { id } = req.params;
        const { nombreCompleto, descripcion } = req.body;

        console.log('Recibida solicitud para agregar candidato:', {
            campanaId: id,
            datos: { nombreCompleto, descripcion }
        });

        // Validar el ID de la campaña
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                error: 'ID de campaña inválido',
                details: { id }
            });
        }

        // Validaciones de campos requeridos
        if (!nombreCompleto || !descripcion) {
            return res.status(400).json({
                error: 'Datos incompletos',
                details: {
                    nombreCompleto: !nombreCompleto ? 'El nombre completo es requerido' : null,
                    descripcion: !descripcion ? 'La descripción es requerida' : null
                }
            });
        }

        const campana = await Campana.findById(id);

        if (!campana) {
            return res.status(404).json({ 
                error: 'Campaña no encontrada',
                details: { campanaId: id }
            });
        }

        const nuevoCandidato = {
            _id: new mongoose.Types.ObjectId(),
            nombreCompleto: nombreCompleto.trim(),
            descripcion: descripcion.trim(),
            votos: 0
        };

        console.log('Intentando agregar candidato:', nuevoCandidato);
        
        // Verificar si ya existe un candidato con el mismo nombre
        const candidatoExistente = campana.candidatos.find(
            c => c.nombreCompleto.toLowerCase() === nombreCompleto.toLowerCase()
        );

        if (candidatoExistente) {
            return res.status(400).json({
                error: 'Ya existe un candidato con ese nombre',
                details: { nombreCompleto }
            });
        }

        // Agregar el candidato y guardar
        campana.candidatos.push(nuevoCandidato);
        
        try {
            const campanaActualizada = await campana.save();
            console.log('Candidato guardado exitosamente:', {
                campanaId: campanaActualizada._id,
                candidatoId: nuevoCandidato._id
            });
            
            // Devolver solo el candidato agregado
            res.status(201).json({
                message: 'Candidato agregado exitosamente',
                candidato: nuevoCandidato,
                campana: campanaActualizada
            });
        } catch (saveError: any) {
            console.error('Error al guardar en la base de datos:', {
                error: saveError.message,
                stack: saveError.stack,
                validationErrors: saveError.errors
            });
            
            return res.status(500).json({ 
                error: 'Error al guardar el candidato', 
                details: saveError.message,
                validationErrors: saveError.errors
            });
        }
    } catch (error: any) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json({ 
            error: 'Error al agregar el candidato',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const emitirVoto = async (req: RequestWithUser, res: Response) => {
    try {
        const { campanaId, candidatoId } = req.params;
        const userId = req.user?._id;

        const campana = await Campana.findById(campanaId);

        if (!campana) {
            return res.status(404).json({
                success: false,
                message: 'Campaña no encontrada'
            });
        }

        if (campana.estado !== 'habilitada') {
            return res.status(400).json({
                success: false,
                message: 'La campaña no está habilitada para votar'
            });
        }

        if (campana.votantes.includes(userId!.toString())) {
            return res.status(400).json({
                success: false,
                message: 'Ya ha utilizado todos sus votos disponibles para esta campaña'
            });
        }

        // Encontrar y actualizar el candidato
        const candidato = campana.candidatos.find(c => c._id.toString() === candidatoId);
        if (!candidato) {
            return res.status(404).json({
                success: false,
                message: 'Candidato no encontrado en esta campaña'
            });
        }

        candidato.votos += 1;
        campana.votantes.push(userId!.toString());
        await campana.save();

        res.json(campana);
    } catch (error) {
        res.status(500).json({ error: 'Error al emitir el voto' });
    }
};

export const eliminarCandidato = async (req: Request, res: Response) => {
    try {
        const { id: campanaId, candidatoId } = req.params;

        // Verificar si la campaña existe
        const campana = await Campana.findById(campanaId);
        if (!campana) {
            return res.status(404).json({ error: 'Campaña no encontrada' });
        }

        // Encontrar el índice del candidato
        const candidatoIndex = campana.candidatos.findIndex(
            c => c._id.toString() === candidatoId
        );

        if (candidatoIndex === -1) {
            return res.status(404).json({ error: 'Candidato no encontrado' });
        }

        // Eliminar el candidato del array
        campana.candidatos.splice(candidatoIndex, 1);
        await campana.save();

        res.json({ message: 'Candidato eliminado exitosamente', campana });
    } catch (error) {
        console.error('Error al eliminar candidato:', error);
        res.status(500).json({ error: 'Error al eliminar el candidato' });
    }
};

export const eliminarCampana = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Verificar si la campaña existe
        const campana = await Campana.findById(id);
        if (!campana) {
            return res.status(404).json({ error: 'Campaña no encontrada' });
        }

        // Eliminar la campaña
        await Campana.findByIdAndDelete(id);

        res.json({ message: 'Campaña eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar campaña:', error);
        res.status(500).json({ error: 'Error al eliminar la campaña' });
    }
};