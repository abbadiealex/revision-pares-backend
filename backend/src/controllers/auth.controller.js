import { loginUser, registerUser } from '../services/auth.service.js';
import { sendSuccess } from '../utils/responses.js';

export async function login(req, res) {
  const data = await loginUser(req.body);

  return sendSuccess(res, {
    data
  });
}

export async function register(req, res) {
  const data = await registerUser(req.body);

  return sendSuccess(res, {
    status: 201,
    code: 'CREATED',
    data
  });
}
