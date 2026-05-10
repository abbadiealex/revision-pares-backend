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

export function countEvaluacionesByUser(userId) {
  return Evaluacion.countDocuments({ evaluador_id: userId });
}
