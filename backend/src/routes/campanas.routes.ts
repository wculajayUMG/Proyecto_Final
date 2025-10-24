import { Router } from 'express';
import { upload } from '../config/multer.config';
import { 
    crearCampana, 
    obtenerCampanas, 
    obtenerCampana, 
    actualizarEstadoCampana, 
    agregarCandidato,
    emitirVoto,
    actualizarCampana 
} from '../controllers/campana.controller';

const router = Router();

// Rutas de campañas
router.post('/', crearCampana);
router.get('/', obtenerCampanas);
router.get('/:id', obtenerCampana);
router.put('/:id', actualizarCampana);
router.patch('/:id/estado', actualizarEstadoCampana);

// Ruta para agregar candidato
router.post('/:id/candidatos', agregarCandidato);

// Ruta para votar
router.post('/:campanaId/candidatos/:candidatoId/votar', emitirVoto);

export default router;