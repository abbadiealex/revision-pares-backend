import {
  createEvaluacionDocument,
  findEvaluacionByAsignacion,
  findEvaluacionById
} from '../repositories/evaluacion.repository.js';
import { findAsignacionById, updateAsignacionById } from '../repositories/asignacion.repository.js';
import { HttpError } from '../utils/httpError.js';
import {
  optionalString,
  requireNumber,
  validateObjectId
} from '../utils/validation.js';

function calcularPuntajeTotal(criterios = []) {
  return criterios.reduce((sum, criterio) => sum + Number(criterio.puntaje_otorgado || 0), 0);
}

function validarCriterios(criterios) {
  if (!Array.isArray(criterios) || criterios.length === 0) {
    throw new HttpError(400, 'La evaluacion requiere al menos un criterio', 'VALIDATION_ERROR');
  }

  return criterios.map((criterio, index) => ({
    criterio_id: validateObjectId(criterio.criterio_id, `criterios[${index}].criterio_id`),
    puntaje_otorgado: requireNumber(
      criterio.puntaje_otorgado,
      `criterios[${index}].puntaje_otorgado`,
      { min: 0, max: 100 }
    ),
    comentario: optionalString(criterio.comentario, `criterios[${index}].comentario`, {
      max: 500
    }) || ''
  }));
}

function validarCriteriosBorrador(criterios) {
  if (criterios === undefined) {
    return [];
  }

  if (!Array.isArray(criterios)) {
    throw new HttpError(400, 'criterios debe ser un arreglo', 'VALIDATION_ERROR');
  }

  return criterios.map((criterio, index) => ({
    criterio_id: validateObjectId(criterio.criterio_id, `criterios[${index}].criterio_id`),
    puntaje_otorgado: requireNumber(
      criterio.puntaje_otorgado,
      `criterios[${index}].puntaje_otorgado`,
      { min: 0, max: 100 }
    ),
    comentario: optionalString(criterio.comentario, `criterios[${index}].comentario`, {
      max: 500
    }) || ''
  }));
}

async function getAsignacionAutorizada(asignacionId, userId) {
  validateObjectId(asignacionId, 'asignacion_id');
  const asignacion = await findAsignacionById(asignacionId);

  if (!asignacion) {
    throw new HttpError(404, 'Asignacion no encontrada', 'NOT_FOUND');
  }

  if (asignacion.evaluador_id.toString() !== userId) {
    throw new HttpError(403, 'La asignacion no pertenece al usuario autenticado', 'FORBIDDEN');
  }

  return asignacion;
}

export async function enviarEvaluacion(body, user) {
  const asignacion = await getAsignacionAutorizada(body.asignacion_id, user.id);
  const criterios = validarCriterios(body.criterios);
  const comentarioGeneral = optionalString(body.comentario_general, 'comentario_general', {
    max: 1000
  }) || '';

  if (['vencida', 'completada'].includes(asignacion.estado)) {
    throw new HttpError(409, 'La asignacion ya no acepta evaluaciones', 'CONFLICT');
  }

  let evaluacion = await findEvaluacionByAsignacion(asignacion._id);

  if (!evaluacion) {
    evaluacion = createEvaluacionDocument({
      tarea_id: asignacion.tarea_id,
      asignacion_id: asignacion._id,
      evaluador_id: user.id
    });
  }

  evaluacion.criterios = criterios;
  evaluacion.comentario_general = comentarioGeneral;
  evaluacion.puntaje_total = calcularPuntajeTotal(criterios);
  evaluacion.estado = 'enviada';
  evaluacion.fecha_envio = new Date();

  await evaluacion.save();
  await updateAsignacionById(asignacion._id, { estado: 'completada' });

  return evaluacion;
}

export async function guardarBorrador(id, body, user) {
  validateObjectId(id);
  const criterios = validarCriteriosBorrador(body.criterios);
  const comentarioGeneral = optionalString(body.comentario_general, 'comentario_general', {
    max: 1000
  }) || '';
  let evaluacion = await findEvaluacionById(id);

  if (!evaluacion) {
    evaluacion = await findEvaluacionByAsignacion(id);
  }

  let asignacion;

  if (evaluacion) {
    if (evaluacion.evaluador_id.toString() !== user.id) {
      throw new HttpError(403, 'La evaluacion no pertenece al usuario autenticado', 'FORBIDDEN');
    }

    asignacion = await findAsignacionById(evaluacion.asignacion_id);
  } else {
    asignacion = await getAsignacionAutorizada(id, user.id);
    evaluacion = createEvaluacionDocument({
      tarea_id: asignacion.tarea_id,
      asignacion_id: asignacion._id,
      evaluador_id: user.id
    });
  }

  if (!asignacion) {
    throw new HttpError(404, 'Asignacion no encontrada', 'NOT_FOUND');
  }

  if (evaluacion.estado === 'enviada' || asignacion.estado === 'completada') {
    throw new HttpError(409, 'Una evaluacion enviada no puede volver a borrador', 'CONFLICT');
  }

  if (asignacion.estado === 'vencida') {
    throw new HttpError(409, 'La asignacion esta vencida', 'CONFLICT');
  }

  evaluacion.criterios = criterios;
  evaluacion.comentario_general = comentarioGeneral;
  evaluacion.puntaje_total = calcularPuntajeTotal(criterios);
  evaluacion.estado = 'borrador';
  evaluacion.fecha_envio = null;

  await evaluacion.save();
  await updateAsignacionById(asignacion._id, { estado: 'en_proceso' });

  return evaluacion;
}
