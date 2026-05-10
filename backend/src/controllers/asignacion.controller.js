import {
  getAsignacionesVencidas as getAsignacionesVencidasService,
  getMisAsignaciones as getMisAsignacionesService
} from '../services/asignacionService.js';
import { sendSuccess } from '../utils/responses.js';

export async function getMisAsignaciones(req, res) {
  const asignaciones = await getMisAsignacionesService(req.user.id);
  return sendSuccess(res, { data: asignaciones });
}

export async function getAsignacionesVencidas(req, res) {
  const asignaciones = await getAsignacionesVencidasService();
  return sendSuccess(res, { data: asignaciones });
}
