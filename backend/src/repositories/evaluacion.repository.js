import { Evaluacion } from '../models/Evaluacion.js';

export function createEvaluacionDocument(data) {
  return new Evaluacion(data);
}

export function findEvaluacionById(id) {
  return Evaluacion.findById(id);
}

export function findEvaluacionByAsignacion(asignacionId) {
  return Evaluacion.findOne({ asignacion_id: asignacionId });
}

export function listEvaluacionesByTarea(tareaId) {
  return Evaluacion.find({ tarea_id: tareaId, estado: 'enviada' })
    .populate('evaluador_id', 'nombre correo rol')
    .populate('criterios.criterio_id', 'nombre puntaje_maximo orden')
    .sort({ fecha_envio: -1 });
}

export function countEvaluacionesByUser(userId) {
  return Evaluacion.countDocuments({ evaluador_id: userId });
}
