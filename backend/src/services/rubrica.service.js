import {
  countRubricas,
  createRubrica,
  deleteRubricaById,
  findRubricaById,
  listRubricas,
  updateRubricaById
} from '../repositories/rubrica.repository.js';
import {
  createCriteriosRubrica,
  deleteCriteriosByRubrica,
  listCriteriosByRubrica
} from '../repositories/criterioRubrica.repository.js';
import { countTareas } from '../repositories/tarea.repository.js';
import { HttpError } from '../utils/httpError.js';
import {
  escapeRegex,
  optionalBoolean,
  optionalString,
  parsePagination,
  requireNumber,
  requireString,
  validateObjectId
} from '../utils/validation.js';

function buildRubricaFilters(query) {
  const filters = {};
  const materia = optionalString(query.materia, 'materia', { max: 120 });
  const activa = optionalBoolean(query.activa, 'activa');
  const q = optionalString(query.q, 'q', { max: 80 });

  if (materia) {
    filters.materia = materia;
  }

  if (activa !== undefined) {
    filters.activa = activa;
  }

  if (q) {
    const regex = new RegExp(escapeRegex(q), 'i');
    filters.$or = [{ titulo: regex }, { descripcion: regex }];
  }

  return filters;
}

function normalizeRubricaPayload(body, { partial = false } = {}) {
  const payload = {};

  if (!partial || body.titulo !== undefined) {
    payload.titulo = requireString(body.titulo, 'titulo', { max: 140 });
  }

  if (body.descripcion !== undefined) {
    payload.descripcion = optionalString(body.descripcion, 'descripcion', { max: 800 }) || '';
  } else if (!partial) {
    payload.descripcion = '';
  }

  if (!partial || body.materia !== undefined) {
    payload.materia = requireString(body.materia, 'materia', { max: 120 });
  }

  if (body.activa !== undefined) {
    payload.activa = optionalBoolean(body.activa, 'activa');
  }

  return payload;
}

function normalizeCriterios(criterios, { required = false } = {}) {
  if (criterios === undefined) {
    if (required) {
      throw new HttpError(400, 'criterios es obligatorio', 'VALIDATION_ERROR');
    }

    return undefined;
  }

  if (!Array.isArray(criterios) || criterios.length === 0) {
    throw new HttpError(400, 'criterios debe ser un arreglo no vacio', 'VALIDATION_ERROR');
  }

  return criterios.map((criterio, index) => ({
    nombre: requireString(criterio.nombre, `criterios[${index}].nombre`, { max: 120 }),
    descripcion: optionalString(criterio.descripcion, `criterios[${index}].descripcion`, {
      max: 500
    }) || '',
    puntaje_maximo: requireNumber(criterio.puntaje_maximo, `criterios[${index}].puntaje_maximo`, {
      min: 1,
      max: 100
    }),
    orden:
      criterio.orden === undefined
        ? index + 1
        : requireNumber(criterio.orden, `criterios[${index}].orden`, { min: 1, max: 100 })
  }));
}

async function attachCriterios(rubrica) {
  const plain = typeof rubrica.toObject === 'function' ? rubrica.toObject() : rubrica;
  plain.criterios = await listCriteriosByRubrica(plain._id);
  return plain;
}

export async function getRubricas(query) {
  const pagination = parsePagination(query);
  const filters = buildRubricaFilters(query);
  const [items, total] = await Promise.all([
    listRubricas({ filters, skip: pagination.skip, limit: pagination.limit }),
    countRubricas(filters)
  ]);

  return {
    items: await Promise.all(items.map(attachCriterios)),
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit)
    }
  };
}

export async function getRubrica(id) {
  validateObjectId(id);
  const rubrica = await findRubricaById(id);

  if (!rubrica) {
    throw new HttpError(404, 'Rubrica no encontrada', 'NOT_FOUND');
  }

  return attachCriterios(rubrica);
}

export async function createRubricaWithCriterios(body, userId) {
  const payload = normalizeRubricaPayload(body);
  const criterios = normalizeCriterios(body.criterios, { required: true });
  const rubrica = await createRubrica({ ...payload, createdBy: userId });
  await createCriteriosRubrica(criterios.map((criterio) => ({ ...criterio, rubrica_id: rubrica._id })));
  return getRubrica(rubrica._id);
}

export async function updateRubrica(id, body) {
  validateObjectId(id);
  const payload = normalizeRubricaPayload(body, { partial: true });
  const criterios = normalizeCriterios(body.criterios);

  if (Object.keys(payload).length === 0 && criterios === undefined) {
    throw new HttpError(400, 'No hay campos validos para actualizar', 'VALIDATION_ERROR');
  }

  let rubrica = await findRubricaById(id);

  if (!rubrica) {
    throw new HttpError(404, 'Rubrica no encontrada', 'NOT_FOUND');
  }

  if (Object.keys(payload).length > 0) {
    rubrica = await updateRubricaById(id, payload);
  }

  if (criterios) {
    await deleteCriteriosByRubrica(id);
    await createCriteriosRubrica(criterios.map((criterio) => ({ ...criterio, rubrica_id: id })));
  }

  return getRubrica(rubrica._id);
}

export async function deleteRubrica(id) {
  validateObjectId(id);
  const rubrica = await findRubricaById(id);

  if (!rubrica) {
    throw new HttpError(404, 'Rubrica no encontrada', 'NOT_FOUND');
  }

  const tareas = await countTareas({ rubrica_id: id });

  if (tareas > 0) {
    throw new HttpError(
      409,
      'No se puede eliminar una rubrica usada por tareas existentes',
      'CONFLICT'
    );
  }

  await deleteCriteriosByRubrica(id);
  await deleteRubricaById(id);
  return rubrica;
}
