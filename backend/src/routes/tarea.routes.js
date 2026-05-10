import { Router } from 'express';
import {
  actualizarTarea,
  asignarCalificacionFinal,
  crearTarea,
  eliminarTarea,
  getMisTareas,
  listarTareas,
  obtenerTarea
} from '../controllers/tarea.controller.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { uploadTareaPdf } from '../middleware/uploadTarea.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post(
  '/',
  authRequired,
  requireRole('alumno', 'profesor'),
  uploadTareaPdf.single('archivo'),
  asyncHandler(crearTarea)
);

router.get('/mias', authRequired, requireRole('alumno'), asyncHandler(getMisTareas));
router.get('/', authRequired, requireRole('alumno', 'evaluador', 'profesor'), asyncHandler(listarTareas));
router.get('/:id', authRequired, requireRole('alumno', 'evaluador', 'profesor'), asyncHandler(obtenerTarea));

router.patch(
  '/:id',
  authRequired,
  requireRole('alumno', 'profesor'),
  uploadTareaPdf.single('archivo'),
  asyncHandler(actualizarTarea)
);

router.put(
  '/:id',
  authRequired,
  requireRole('alumno', 'profesor'),
  uploadTareaPdf.single('archivo'),
  asyncHandler(actualizarTarea)
);

router.patch(
  '/:id/calificacion',
  authRequired,
  requireRole('profesor'),
  asyncHandler(asignarCalificacionFinal)
);

router.delete(
  '/:id',
  authRequired,
  requireRole('alumno', 'profesor'),
  asyncHandler(eliminarTarea)
);

export default router;
