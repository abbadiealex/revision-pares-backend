import { Router } from 'express';
import asignacionRoutes from './asignacion.routes.js';
import authRoutes from './auth.routes.js';
import evaluacionRoutes from './evaluacion.routes.js';
import rubricaRoutes from './rubrica.routes.js';
import tareaRoutes from './tarea.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tareas', tareaRoutes);
router.use('/asignaciones', asignacionRoutes);
router.use('/evaluaciones', evaluacionRoutes);
router.use('/usuarios', userRoutes);
router.use('/rubricas', rubricaRoutes);

export default router;
