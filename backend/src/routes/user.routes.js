import { Router } from 'express';
import {
  actualizarUsuario,
  crearUsuario,
  eliminarUsuario,
  listarUsuarios,
  obtenerUsuario
} from '../controllers/user.controller.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authRequired, requireRole('profesor'));

router.get('/', asyncHandler(listarUsuarios));
router.get('/:id', asyncHandler(obtenerUsuario));
router.post('/', asyncHandler(crearUsuario));
router.patch('/:id', asyncHandler(actualizarUsuario));
router.put('/:id', asyncHandler(actualizarUsuario));
router.delete('/:id', asyncHandler(eliminarUsuario));

export default router;
