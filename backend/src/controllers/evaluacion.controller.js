import {
  enviarEvaluacion as enviarEvaluacionService,
  guardarBorrador as guardarBorradorService
} from '../services/evaluacion.service.js';
import { sendSuccess } from '../utils/responses.js';

export async function enviarEvaluacion(req, res) {
  const evaluacion = await enviarEvaluacionService(req.body, req.user);

  return sendSuccess(res, {
    status: 201,
    code: 'CREATED',
    data: { evaluacion }
  });
}

export async function guardarBorrador(req, res) {
  const evaluacion = await guardarBorradorService(req.params.id, req.body, req.user);
  return sendSuccess(res, { data: { evaluacion } });
}
