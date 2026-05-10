import { sendError } from '../utils/responses.js';

export function notFound(req, res) {
  return sendError(res, {
    status: 404,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    code: 'NOT_FOUND'
  });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.name === 'ValidationError') {
    return sendError(res, {
      status: 400,
      error: err.message,
      code: 'VALIDATION_ERROR'
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, {
      status: 400,
      error: 'El archivo PDF no puede superar 10 MB',
      code: 'VALIDATION_ERROR'
    });
  }

  if (err.code === 11000) {
    return sendError(res, {
      status: 409,
      error: 'El registro ya existe o viola una restriccion unica',
      code: 'CONFLICT'
    });
  }

  return sendError(res, {
    status: err.status || 500,
    error: err.message || 'Error interno',
    code: err.code || 'INTERNAL_ERROR'
  });
}
