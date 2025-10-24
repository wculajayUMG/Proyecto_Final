import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { 
    verificarVotosDisponibles,
    getTiempoRestante,
    emitirVoto
} from '../controllers/votacion.controller';

const router = Router();

// Rutas protegidas que requieren autenticación
router.get('/campanas/:campanaId/votos-disponibles', verifyToken, verificarVotosDisponibles);
router.get('/campanas/:campanaId/tiempo-restante', getTiempoRestante);
router.post('/campanas/:campanaId/votar/:candidatoId', verifyToken, emitirVoto);

export default router;