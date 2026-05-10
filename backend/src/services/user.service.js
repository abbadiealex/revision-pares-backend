import {
  countUsers,
  createUser,
  deactivateUserById,
  deleteUserById,
  findUserByEmail,
  findUserById,
  listUsers,
  updateUserById
} from '../repositories/user.repository.js';
import { countTareas } from '../repositories/tarea.repository.js';
import { countAsignacionesByUser } from '../repositories/asignacion.repository.js';
import { countEvaluacionesByUser } from '../repositories/evaluacion.repository.js';
import { HttpError } from '../utils/httpError.js';
import {
  ROLES,
  escapeRegex,
  optionalBoolean,
  optionalEnum,
  optionalString,
  parsePagination,
  requireEmail,
  requireEnum,
  requirePassword,
  requireString,
  validateObjectId
} from '../utils/validation.js';

function buildUserFilters(query) {
  const filters = {};
  const rol = optionalEnum(query.rol, 'rol', ROLES);
  const activo = optionalBoolean(query.activo, 'activo');
  const q = optionalString(query.q, 'q', { max: 80 });

  if (rol) {
    filters.rol = rol;
  }

  if (activo !== undefined) {
    filters.activo = activo;
  }

  if (q) {
    const regex = new RegExp(escapeRegex(q), 'i');
    filters.$or = [{ nombre: regex }, { correo: regex }];
  }

  return filters;
}

function normalizeUserPayload(body, { partial = false } = {}) {
  const payload = {};

  if (!partial || body.nombre !== undefined) {
    payload.nombre = requireString(body.nombre, 'nombre', { max: 120 });
  }

  if (!partial || body.correo !== undefined) {
    payload.correo = requireEmail(body.correo);
  }

  if (!partial || body.rol !== undefined) {
    payload.rol = requireEnum(body.rol || 'alumno', 'rol', ROLES);
  }

  if (body.activo !== undefined) {
    payload.activo = optionalBoolean(body.activo, 'activo');
  }

  if (!partial || body.password !== undefined) {
    payload.passwordHash = requirePassword(body.password);
  }

  return payload;
}

export async function registerUser(body) {
  if (body.rol && body.rol !== 'alumno') {
    throw new HttpError(
      403,
      'El registro publico solo permite crear alumnos; profesor administra otros roles',
      'FORBIDDEN'
    );
  }

  const payload = normalizeUserPayload({ ...body, rol: body.rol || 'alumno' });
  const existing = await findUserByEmail(payload.correo);

  if (existing) {
    throw new HttpError(409, 'Ya existe un usuario con ese correo', 'CONFLICT');
  }

  return createUser(payload);
}

export async function createUserFromAdmin(body) {
  const payload = normalizeUserPayload(body);
  const existing = await findUserByEmail(payload.correo);

  if (existing) {
    throw new HttpError(409, 'Ya existe un usuario con ese correo', 'CONFLICT');
  }

  return createUser(payload);
}

export async function getUsers(query) {
  const pagination = parsePagination(query);
  const filters = buildUserFilters(query);
  const [items, total] = await Promise.all([
    listUsers({ filters, skip: pagination.skip, limit: pagination.limit }),
    countUsers(filters)
  ]);

  return {
    items,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit)
    }
  };
}

export async function getUser(id) {
  validateObjectId(id);
  const user = await findUserById(id);

  if (!user) {
    throw new HttpError(404, 'Usuario no encontrado', 'NOT_FOUND');
  }

  return user;
}

export async function updateUser(id, body) {
  validateObjectId(id);
  const payload = normalizeUserPayload(body, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new HttpError(400, 'No hay campos validos para actualizar', 'VALIDATION_ERROR');
  }

  if (payload.correo) {
    const existing = await findUserByEmail(payload.correo);

    if (existing && existing._id.toString() !== id) {
      throw new HttpError(409, 'Ya existe un usuario con ese correo', 'CONFLICT');
    }
  }

  const user = await updateUserById(id, payload);

  if (!user) {
    throw new HttpError(404, 'Usuario no encontrado', 'NOT_FOUND');
  }

  return user;
}

export async function deleteUser(id) {
  validateObjectId(id);

  const user = await findUserById(id);

  if (!user) {
    throw new HttpError(404, 'Usuario no encontrado', 'NOT_FOUND');
  }

  const [tareas, asignaciones, evaluaciones] = await Promise.all([
    countTareas({ alumno_id: id }),
    countAsignacionesByUser(id),
    countEvaluacionesByUser(id)
  ]);

  if (tareas + asignaciones + evaluaciones > 0) {
    return {
      deleted: false,
      user: await deactivateUserById(id),
      reason: 'Usuario desactivado para conservar historial academico'
    };
  }

  await deleteUserById(id);
  return { deleted: true, user };
}
