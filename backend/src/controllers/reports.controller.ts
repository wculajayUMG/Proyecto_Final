import { Request, Response } from 'express';
import Campana from '../models/campana.model';
import User from '../models/user.model';

export const getVotacionesReport = async (req: Request, res: Response) => {
    try {
        const campanas = await Campana.find()
            .select('titulo descripcion estado fechaInicio fechaFin candidatos votantes')
            .lean();

        const reporteCampanas = await Promise.all(campanas.map(async (campana) => {
            const totalVotantes = campana.votantes.length;
            const totalVotos = campana.candidatos.reduce((sum, candidato) => sum + candidato.votos, 0);
            const participacion = totalVotantes > 0 ? (totalVotos / totalVotantes) * 100 : 0;

            return {
                titulo: campana.titulo,
                descripcion: campana.descripcion,
                estado: campana.estado,
                fechaInicio: campana.fechaInicio,
                fechaFin: campana.fechaFin,
                totalVotantes,
                totalVotos,
                participacion: `${participacion.toFixed(2)}%`,
                resultados: campana.candidatos.map(candidato => ({
                    nombre: candidato.nombreCompleto,
                    votos: candidato.votos,
                    porcentaje: totalVotos > 0 ? 
                        `${((candidato.votos / totalVotos) * 100).toFixed(2)}%` : '0%'
                }))
            };
        }));

        res.json({
            success: true,
            data: reporteCampanas
        });
    } catch (error) {
        console.error('Error al generar reporte:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte de votaciones'
        });
    }
};

export const getEstadisticasEnTiempoReal = async (req: Request, res: Response) => {
    try {
        const campanaId = req.params.campanaId;
        const campana = await Campana.findById(campanaId)
            .select('titulo candidatos votantes fechaInicio fechaFin estado')
            .lean();

        if (!campana) {
            return res.status(404).json({
                success: false,
                message: 'Campaña no encontrada'
            });
        }

        const tiempoRestante = campana.fechaFin.getTime() - new Date().getTime();
        const estaActiva = campana.estado === 'habilitada' && tiempoRestante > 0;

        const estadisticas = {
            titulo: campana.titulo,
            totalVotantes: campana.votantes.length,
            totalVotos: campana.candidatos.reduce((sum, c) => sum + c.votos, 0),
            tiempoRestante: estaActiva ? tiempoRestante : 0,
            estaActiva,
            resultadosActuales: campana.candidatos.map(candidato => ({
                nombre: candidato.nombreCompleto,
                votos: candidato.votos,
                porcentaje: campana.votantes.length > 0 ?
                    ((candidato.votos / campana.votantes.length) * 100).toFixed(2) : 0
            }))
        };

        res.json({
            success: true,
            data: estadisticas
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas en tiempo real'
        });
    }
};