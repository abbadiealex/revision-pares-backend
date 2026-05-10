import { Types } from 'mongoose';
import { HttpError } from './httpError.js';

export const ROLES = ['alumno', 'evaluador', 'profesor'];
export const ESTADOS_TAREA = ['entregada', 'en_revision', 'cerrada'];
export const ESTADOS_ASIGNACION = ['pendiente', 'en_proceso', 'vencida', 'completada', 'reasignada'];

export function validateObjectId(value, field = 'id') {
  if (!Types.ObjectId.isValid(value)) {
    throw new HttpError(400, `${field} no es un ObjectId valido`, 'VALIDATION_ERROR');
  }

  return value;
}

export function requireString(value, field, { min = 1, max = 160 } = {}) {
  if (typeof value !== 'string') {
    throw new HttpError(400, `${field} debe ser texto`, 'VALIDATION_ERROR');
  }

  const trimmed = value.trim();

  if (trimmed.length < min) {
    throw new HttpError(400, `${field} es obligatorio`, 'VALIDATION_ERROR');
  }

  if (trimmed.length > max) {
    throw new HttpError(400, `${field} no puede superar ${max} caracteres`, 'VALIDATION_ERROR');
  }

  return trimmed;
}

export function optionalString(value, field, { max = 500 } = {}) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new HttpError(400, `${field} debe ser texto`, 'VALIDATION_ERROR');
  }

  const trimmed = value.trim();

  if (trimmed.length > max) {
    throw new HttpError(400, `${field} no puede superar ${max} caracteres`, 'VALIDATION_ERROR');
  }

  return trimmed;
}

export function requireEnum(value, field, allowedValues) {
  if (!allowedValues.includes(value)) {
    throw new HttpError(
      400,
      `${field} debe ser uno de: ${allowedValues.join(', ')}`,
      'VALIDATION_ERROR'
    );
  }

  return value;
}

export function optionalEnum(value, field, allowedValues) {
  if (value === undefined || value === '') {
    return undefined;
  }

  return requireEnum(value, field, allowedValues);
}

export function optionalBoolean(value, field) {
  if (value === undefined || value === '') {
    return undefined;
  }

  if (value === true || value === 'true') {
    return true;
  }

  if (value === false || value === 'false') {
    return false;
  }

  throw new HttpError(400, `${field} debe ser true o false`, 'VALIDATION_ERROR');
}

export function requireNumber(value, field, { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY } = {}) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new HttpError(400, `${field} debe ser numerico`, 'VALIDATION_ERROR');
  }

  if (parsed < min || parsed > max) {
    throw new HttpError(400, `${field} debe estar entre ${min} y ${max}`, 'VALIDATION_ERROR');
  }

  return parsed;
}

export function optionalNumber(value, field, range) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return requireNumber(value, field, range);
}

export function requireEmail(value) {
  const correo = requireString(value, 'correo', { max: 180 }).toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(correo)) {
    throw new HttpError(400, 'correo debe tener formato de email valido', 'VALIDATION_ERROR');
  }

  return correo;
}

export function requirePassword(value) {
  const password = requireString(value, 'password', { min: 6, max: 72 });

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new HttpError(
      400,
      'password debe tener al menos una letra y un numero',
      'VALIDATION_ERROR'
    );
  }

  return password;
}

export function parsePagination(query) {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);

  if (!Number.isInteger(page) || page < 1) {
    throw new HttpError(400, 'page debe ser un entero mayor o igual a 1', 'VALIDATION_ERROR');
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new HttpError(400, 'limit debe ser un entero entre 1 y 100', 'VALIDATION_ERROR');
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
}

export function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
