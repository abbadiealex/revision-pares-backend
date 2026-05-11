import { Router } from 'express';
import {
  enviarEvaluacion,
  guardarBorrador,
  listarEvaluacionesPorTarea
} from '../controllers/evaluacion.controller.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get(
  '/',
  authRequired,
  requireRole('profesor'),
  asyncHandler(listarEvaluacionesPorTarea)
);

router.post(
  '/',
  authRequired,
  requireRole('evaluador', 'alumno'),
  asyncHandler(enviarEvaluacion)
);

router.patch(
  '/:id/borrador',
  authRequired,
  requireRole('evaluador', 'alumno'),
  asyncHandler(guardarBorrador)
);

export default router;
