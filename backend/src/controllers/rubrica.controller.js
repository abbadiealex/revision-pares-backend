import {
  createRubricaWithCriterios,
  deleteRubrica,
  getRubrica,
  getRubricas,
  updateRubrica
} from '../services/rubrica.service.js';
import { sendSuccess } from '../utils/responses.js';

export async function listarRubricas(req, res) {
  const data = await getRubricas(req.query);
  return sendSuccess(res, { data });
}

export async function obtenerRubrica(req, res) {
  const rubrica = await getRubrica(req.params.id);
  return sendSuccess(res, { data: { rubrica } });
}

export async function crearRubrica(req, res) {
  const rubrica = await createRubricaWithCriterios(req.body, req.user.id);
  return sendSuccess(res, {
    status: 201,
    code: 'CREATED',
    data: { rubrica }
  });
}

export async function actualizarRubrica(req, res) {
  const rubrica = await updateRubrica(req.params.id, req.body);
  return sendSuccess(res, { data: { rubrica } });
}

export async function eliminarRubrica(req, res) {
  const rubrica = await deleteRubrica(req.params.id);
  return sendSuccess(res, { data: { rubrica } });
}
