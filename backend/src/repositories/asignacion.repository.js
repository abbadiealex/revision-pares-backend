import { Asignacion } from '../models/Asignacion.js';

export function createAsignacion(data) {
  return Asignacion.create(data);
}

export function findAsignacionById(id) {
  return Asignacion.findById(id);
}

export function updateAsignacionById(id, data) {
  return Asignacion.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
}

export function distinctEvaluadoresByTarea(tareaId) {
  return Asignacion.distinct('evaluador_id', { tarea_id: tareaId });
}

export function findCandidatasVencidas(limit = 50) {
  return Asignacion.find({
    fecha_limite: { $lt: new Date() },
    estado: { $in: ['pendiente', 'en_proceso'] }
  }).limit(limit);
}

export function listAsignacionesByEvaluador(evaluadorId) {
  return Asignacion.find({ evaluador_id: evaluadorId })
    .populate('tarea_id')
    .sort({ fecha_limite: 1 });
}

export function listAsignacionesVencidas() {
  return Asignacion.find({ estado: 'vencida' })
    .populate('tarea_id')
    .populate('evaluador_id', 'nombre correo rol')
    .sort({ fecha_limite: 1 });
}

export function countAsignacionesByUser(userId) {
  return Asignacion.countDocuments({ evaluador_id: userId });
}
