import {
  createUserFromAdmin,
  deleteUser,
  getUser,
  getUsers,
  updateUser
} from '../services/user.service.js';
import { sendSuccess } from '../utils/responses.js';

export async function listarUsuarios(req, res) {
  const data = await getUsers(req.query);
  return sendSuccess(res, { data });
}

export async function obtenerUsuario(req, res) {
  const user = await getUser(req.params.id);
  return sendSuccess(res, { data: { user } });
}

export async function crearUsuario(req, res) {
  const user = await createUserFromAdmin(req.body);
  return sendSuccess(res, {
    status: 201,
    code: 'CREATED',
    data: { user }
  });
}

export async function actualizarUsuario(req, res) {
  const user = await updateUser(req.params.id, req.body);
  return sendSuccess(res, { data: { user } });
}

export async function eliminarUsuario(req, res) {
  const result = await deleteUser(req.params.id);
  return sendSuccess(res, { data: result });
}
