import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail } from '../repositories/user.repository.js';
import { HttpError } from '../utils/httpError.js';
import { requireEmail, requireString } from '../utils/validation.js';
import { registerUser as registerUserService } from './user.service.js';

function signToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      correo: user.correo,
      rol: user.rol
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

export async function loginUser(body) {
  const correo = requireEmail(body.correo);
  const password = requireString(body.password, 'password', { min: 1, max: 72 });

  const user = await findUserByEmail(correo, { withPassword: true });

  if (!user || !user.activo) {
    throw new HttpError(401, 'Correo o password incorrectos', 'UNAUTHORIZED');
  }

  const passwordValido = await bcrypt.compare(password, user.passwordHash);

  if (!passwordValido) {
    throw new HttpError(401, 'Correo o password incorrectos', 'UNAUTHORIZED');
  }

  return {
    token: signToken(user),
    user: user.toJSON()
  };
}

export async function registerUser(body) {
  const user = await registerUserService(body);

  return {
    token: signToken(user),
    user: user.toJSON()
  };
}
