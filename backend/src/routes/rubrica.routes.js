import { Router } from 'express';
import {
  actualizarRubrica,
  crearRubrica,
  eliminarRubrica,
  listarRubricas,
  obtenerRubrica
} from '../controllers/rubrica.controller.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get(
  '/',
  authRequired,
  requireRole('alumno', 'evaluador', 'profesor'),
  asyncHandler(listarRubricas)
);
router.get(
  '/:id',
  authRequired,
  requireRole('alumno', 'evaluador', 'profesor'),
  asyncHandler(obtenerRubrica)
);
router.post('/', authRequired, requireRole('profesor'), asyncHandler(crearRubrica));
router.patch('/:id', authRequired, requireRole('profesor'), asyncHandler(actualizarRubrica));
router.put('/:id', authRequired, requireRole('profesor'), asyncHandler(actualizarRubrica));
router.delete('/:id', authRequired, requireRole('profesor'), asyncHandler(eliminarRubrica));

export default router;
