import express from 'express';
import { 
    crearCampana,
    obtenerCampanas,
    obtenerCampana,
    actualizarEstadoCampana,
    agregarCandidato,
    emitirVoto,
    eliminarCampana,
    eliminarCandidato,
    actualizarCampana
} from '../controllers/campana.controller';
import { verifyToken as auth, isAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

// Rutas protegidas que requieren autenticación
router.use(auth);

// Rutas accesibles para usuarios autenticados
router.get('/', obtenerCampanas);
router.get('/:id', obtenerCampana);

// Rutas que requieren ser administrador
router.post('/', isAdmin, crearCampana);
router.put('/:id', isAdmin, actualizarCampana);
router.patch('/:id/estado', isAdmin, actualizarEstadoCampana);
router.post('/:id/candidatos', isAdmin, agregarCandidato);
router.delete('/:id', isAdmin, eliminarCampana);
router.delete('/:id/candidatos/:candidatoId', isAdmin, eliminarCandidato);

// Rutas para votantes autenticados
router.post('/:campanaId/votar/:candidatoId', emitirVoto);

export default router;