import { Types } from 'mongoose';
import { movePdfToTaskId } from '../middleware/uploadTarea.js';
import {
  countTareas,
  createTarea,
  deleteTareaById,
  findTareaById,
  findTareaByIdPlain,
  listTareas,
  updateTareaById
} from '../repositories/tarea.repository.js';
import { findRubricaById } from '../repositories/rubrica.repository.js';
import { findUserById } from '../repositories/user.repository.js';
import { asignarEvaluadores } from './asignacionService.js';
import { HttpError } from '../utils/httpError.js';
import {
  ESTADOS_TAREA,
  escapeRegex,
  optionalEnum,
  optionalNumber,
  optionalString,
  parsePagination,
  requireNumber,
  requireString,
  validateObjectId
} from '../utils/validation.js';

function buildTareaFilters(query, user) {
  const filters = {};
  const estado = optionalEnum(query.estado, 'estado', ESTADOS_TAREA);
  const materia = optionalString(query.materia, 'materia', { max: 120 });
  const titulo = optionalString(query.q, 'q', { max: 80 });

  if (estado) {
    filters.estado = estado;
  }

  if (materia) {
    filters.materia = materia;
  }

  if (titulo) {
    filters.titulo = new RegExp(escapeRegex(titulo), 'i');
  }

  if (query.alumno_id) {
    validateObjectId(query.alumno_id, 'alumno_id');
    filters.alumno_id = query.alumno_id;
  }

  if (query.rubrica_id) {
    validateObjectId(query.rubrica_id, 'rubrica_id');
    filters.rubrica_id = query.rubrica_id;
  }

  if (user.rol !== 'profesor') {
    filters.alumno_id = user.id;
  }

  return filters;
}

function normalizeTareaPayload(body, { partial = false, allowEstado = false } = {}) {
  const payload = {};

  if (!partial || body.titulo !== undefined) {
    payload.titulo = requireString(body.titulo, 'titulo', { max: 160 });
  }

  if (!partial || body.materia !== undefined) {
    payload.materia = requireString(body.materia, 'materia', { max: 120 });
  }

  if (!partial || body.rubrica_id !== undefined) {
    payload.rubrica_id = validateObjectId(body.rubrica_id, 'rubrica_id');
  }

  if (allowEstado && body.estado !== undefined) {
    payload.estado = optionalEnum(body.estado, 'estado', ESTADOS_TAREA);
  }

  return payload;
}

async function assertRubricaExists(rubricaId) {
  const rubrica = await findRubricaById(rubricaId);

  if (!rubrica || !rubrica.activa) {
    throw new HttpError(404, 'Rubrica no encontrada o inactiva', 'NOT_FOUND');
  }

  return rubrica;
}

async function resolveAlumnoId(body, user) {
  if (user.rol === 'profesor') {
    if (!body.alumno_id) {
      throw new HttpError(400, 'alumno_id es obligatorio para profesor', 'VALIDATION_ERROR');
    }

    validateObjectId(body.alumno_id, 'alumno_id');
    const alumno = await findUserById(body.alumno_id);

    if (!alumno || !alumno.activo || !['alumno', 'evaluador'].includes(alumno.rol)) {
      throw new HttpError(404, 'Alumno no encontrado o inactivo', 'NOT_FOUND');
    }

    return body.alumno_id;
  }

  return user.id;
}

function hideFinalGradeIfNeeded(tarea) {
  const plain = typeof tarea.toObject === 'function' ? tarea.toObject() : tarea;

  if (plain.estado === 'cerrada') {
    return plain;
  }

  return {
    ...plain,
    calificacion_final: null,
    comentario_final: null
  };
}

export async function getTareas(query, user) {
  const pagination = parsePagination(query);
  const filters = buildTareaFilters(query, user);
  const [items, total] = await Promise.all([
    listTareas({ filters, skip: pagination.skip, limit: pagination.limit }),
    countTareas(filters)
  ]);

  return {
    items: user.rol === 'profesor' ? items : items.map(hideFinalGradeIfNeeded),
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit)
    }
  };
}

export async function getTarea(id, user) {
  validateObjectId(id);
  const tarea = await findTareaById(id);

  if (!tarea) {
    throw new HttpError(404, 'Tarea no encontrada', 'NOT_FOUND');
  }

  if (user.rol !== 'profesor' && tarea.alumno_id._id.toString() !== user.id) {
    throw new HttpError(403, 'No puedes consultar esta tarea', 'FORBIDDEN');
  }

  return user.rol === 'profesor' ? tarea : hideFinalGradeIfNeeded(tarea);
}

export async function createTareaWithAssignment(body, file, user) {
  const payload = normalizeTareaPayload(body);
  const alumnoId = await resolveAlumnoId(body, user);
  await assertRubricaExists(payload.rubrica_id);

  if (!file) {
    throw new HttpError(400, 'El archivo PDF es obligatorio', 'VALIDATION_ERROR');
  }

  const tareaId = new Types.ObjectId();
  const archivoUrl = movePdfToTaskId(tareaId, file);
  const tarea = await createTarea({
    _id: tareaId,
    alumno_id: alumnoId,
    ...payload,
    archivo_url: archivoUrl
  });
  const asignaciones = await asignarEvaluadores(tarea._id);

  return {
    tarea: await findTareaById(tarea._id),
    asignaciones
  };
}

export async function updateTarea(id, body, file, user) {
  validateObjectId(id);
  const payload = normalizeTareaPayload(body, {
    partial: true,
    allowEstado: user.rol === 'profesor'
  });

  if (body.calificacion_final !== undefined) {
    if (user.rol !== 'profesor') {
      throw new HttpError(403, 'Solo profesor puede editar calificacion_final', 'FORBIDDEN');
    }

    payload.calificacion_final = optionalNumber(body.calificacion_final, 'calificacion_final', {
      min: 0,
      max: 10
    });
  }

  if (body.comentario_final !== undefined) {
    if (user.rol !== 'profesor') {
      throw new HttpError(403, 'Solo profesor puede editar comentario_final', 'FORBIDDEN');
    }

    payload.comentario_final = optionalString(body.comentario_final, 'comentario_final', {
      max: 800
    });
  }

  if (Object.keys(payload).length === 0 && !file) {
    throw new HttpError(400, 'No hay campos validos para actualizar', 'VALIDATION_ERROR');
  }

  const tarea = await findTareaByIdPlain(id);

  if (!tarea) {
    throw new HttpError(404, 'Tarea no encontrada', 'NOT_FOUND');
  }

  if (user.rol !== 'profesor' && tarea.alumno_id.toString() !== user.id) {
    throw new HttpError(403, 'No puedes modificar esta tarea', 'FORBIDDEN');
  }

  if (payload.rubrica_id) {
    await assertRubricaExists(payload.rubrica_id);
  }

  if (file) {
    payload.archivo_url = movePdfToTaskId(id, file);
  }

  const updated = await updateTareaById(id, payload);
  return findTareaById(updated._id);
}

export async function deleteTarea(id, user) {
  validateObjectId(id);
  const tarea = await findTareaByIdPlain(id);

  if (!tarea) {
    throw new HttpError(404, 'Tarea no encontrada', 'NOT_FOUND');
  }

  if (user.rol !== 'profesor' && tarea.alumno_id.toString() !== user.id) {
    throw new HttpError(403, 'No puedes eliminar esta tarea', 'FORBIDDEN');
  }

  if (user.rol !== 'profesor' && tarea.estado !== 'entregada') {
    throw new HttpError(
      409,
      'Solo se puede eliminar una tarea propia antes de iniciar revision',
      'CONFLICT'
    );
  }

  await deleteTareaById(id);
  return tarea;
}

export async function setCalificacionFinal(id, body) {
  validateObjectId(id);
  const calificacion = requireNumber(body.calificacion, 'calificacion', { min: 0, max: 10 });
  const comentario = requireString(body.comentario, 'comentario', { max: 800 });

  const tarea = await updateTareaById(id, {
    calificacion_final: calificacion,
    comentario_final: comentario,
    estado: 'cerrada'
  });

  if (!tarea) {
    throw new HttpError(404, 'Tarea no encontrada', 'NOT_FOUND');
  }

  return tarea;
}
