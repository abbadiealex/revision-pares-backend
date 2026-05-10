import {
  findCandidatasVencidas,
  updateAsignacionById
} from '../repositories/asignacion.repository.js';
import { asignarEvaluadores } from './asignacionService.js';

export async function reasignarAsignacionVencida(asignacion) {
  await updateAsignacionById(asignacion._id, { estado: 'vencida' });

  const [nuevaAsignacion] = await asignarEvaluadores(asignacion.tarea_id, {
    cantidad: 1,
    excluirEvaluadores: [asignacion.evaluador_id],
    origenAsignacion: asignacion._id
  });

  return nuevaAsignacion;
}

export async function procesarVencidas() {
  const vencidas = await findCandidatasVencidas(50);

  const resultado = {
    revisadas: vencidas.length,
    reasignadas: 0,
    errores: []
  };

  for (const asignacion of vencidas) {
    try {
      await reasignarAsignacionVencida(asignacion);
      resultado.reasignadas += 1;
    } catch (error) {
      resultado.errores.push({
        asignacion_id: asignacion._id.toString(),
        error: error.message
      });
    }
  }

  return resultado;
}
