import { Router } from 'express';
import { getVotacionesReport, getEstadisticasEnTiempoReal } from '../controllers/reports.controller';
import { verificarVotosDisponibles, getTiempoRestante } from '../controllers/votacion.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Rutas para reportes (solo accesibles por admin)
router.get('/reportes/votaciones', verifyToken, isAdmin, getVotacionesReport);
router.get('/estadisticas/:campanaId', verifyToken, getEstadisticasEnTiempoReal);

// Rutas para verificación de votos y tiempo
router.get('/votacion/:campanaId/votos-disponibles', verifyToken, verificarVotosDisponibles);
router.get('/votacion/:campanaId/tiempo-restante', verifyToken, getTiempoRestante);

export default router;