import {
  createAsignacion,
  distinctEvaluadoresByTarea,
  listAsignacionesByEvaluador,
  listAsignacionesVencidas
} from '../repositories/asignacion.repository.js';
import { findTareaByIdPlain, updateTareaById } from '../repositories/tarea.repository.js';
import { listCandidateEvaluadores } from '../repositories/user.repository.js';
import { HttpError } from '../utils/httpError.js';
import { validateObjectId } from '../utils/validation.js';

function getFechaLimite() {
  const dias = Number(process.env.EVALUACION_DIAS_LIMITE || 7);
  return new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
}

function addId(set, id) {
  if (id) {
    set.add(id.toString());
  }
}

export async function asignarEvaluadores(
  tareaId,
  { cantidad = 2, excluirEvaluadores = [], origenAsignacion = null } = {}
) {
  validateObjectId(tareaId, 'tarea_id');
  const tarea = await findTareaByIdPlain(tareaId);

  if (!tarea) {
    throw new HttpError(404, 'Tarea no encontrada', 'NOT_FOUND');
  }

  const evaluadoresPrevios = await distinctEvaluadoresByTarea(tarea._id);

  const excluidos = new Set();
  addId(excluidos, tarea.alumno_id);
  evaluadoresPrevios.forEach((id) => addId(excluidos, id));
  excluirEvaluadores.forEach((id) => addId(excluidos, id));

  const candidatos = await listCandidateEvaluadores([...excluidos], cantidad * 3);

  if (candidatos.length < cantidad) {
    throw new HttpError(
      409,
      'No hay suficientes evaluadores disponibles para esta tarea',
      'CONFLICT'
    );
  }

  const fechaLimite = getFechaLimite();
  const asignaciones = [];

  for (const candidato of candidatos) {
    if (asignaciones.length === cantidad) {
      break;
    }

    try {
      const asignacion = await createAsignacion({
        tarea_id: tarea._id,
        evaluador_id: candidato._id,
        estado: 'pendiente',
        fecha_limite: fechaLimite,
        origen_asignacion: origenAsignacion
      });
      asignaciones.push(asignacion);
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }
    }
  }

  if (asignaciones.length < cantidad) {
    throw new HttpError(
      409,
      'No fue posible completar la asignacion sin duplicados',
      'CONFLICT'
    );
  }

  await updateTareaById(tarea._id, { estado: 'en_revision' });
  return asignaciones;
}

export function getMisAsignaciones(userId) {
  validateObjectId(userId, 'user_id');
  return listAsignacionesByEvaluador(userId);
}

export function getAsignacionesVencidas() {
  return listAsignacionesVencidas();
}
