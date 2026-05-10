import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/httpError.js';

export function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new HttpError(401, 'Token no enviado', 'UNAUTHORIZED'));
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return next(new HttpError(401, 'Token invalido o expirado', 'UNAUTHORIZED'));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return next(new HttpError(403, 'No tienes permisos para esta operacion', 'FORBIDDEN'));
    }

    return next();
  };
}
