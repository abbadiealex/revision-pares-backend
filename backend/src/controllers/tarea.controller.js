import {
  createTareaWithAssignment,
  deleteTarea,
  getTarea,
  getTareas,
  setCalificacionFinal,
  updateTarea
} from '../services/tarea.service.js';
import { sendSuccess } from '../utils/responses.js';

export async function crearTarea(req, res) {
  const data = await createTareaWithAssignment(req.body, req.file, req.user);

  return sendSuccess(res, {
    status: 201,
    code: 'CREATED',
    data
  });
}

export async function listarTareas(req, res) {
  const data = await getTareas(req.query, req.user);
  return sendSuccess(res, { data });
}

export async function obtenerTarea(req, res) {
  const tarea = await getTarea(req.params.id, req.user);
  return sendSuccess(res, { data: { tarea } });
}

export async function getMisTareas(req, res) {
  const data = await getTareas({ ...req.query, alumno_id: req.user.id }, req.user);
  return sendSuccess(res, { data });
}

export async function actualizarTarea(req, res) {
  const tarea = await updateTarea(req.params.id, req.body, req.file, req.user);
  return sendSuccess(res, { data: { tarea } });
}

export async function eliminarTarea(req, res) {
  const tarea = await deleteTarea(req.params.id, req.user);
  return sendSuccess(res, { data: { tarea } });
}

export async function asignarCalificacionFinal(req, res) {
  const tarea = await setCalificacionFinal(req.params.id, req.body);
  return sendSuccess(res, { data: { tarea } });
}
