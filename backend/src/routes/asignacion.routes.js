import { Router } from 'express';
import {
  getAsignacionesVencidas,
  getMisAsignaciones
} from '../controllers/asignacion.controller.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get(
  '/mias',
  authRequired,
  requireRole('evaluador', 'alumno'),
  asyncHandler(getMisAsignaciones)
);

router.get(
  '/vencidas',
  authRequired,
  requireRole('profesor'),
  asyncHandler(getAsignacionesVencidas)
);

export default router;
