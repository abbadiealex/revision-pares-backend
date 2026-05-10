import { CriterioRubrica } from '../models/CriterioRubrica.js';

export function createCriteriosRubrica(criterios) {
  return CriterioRubrica.insertMany(criterios, { ordered: true });
}

export function listCriteriosByRubrica(rubricaId) {
  return CriterioRubrica.find({ rubrica_id: rubricaId }).sort({ orden: 1, createdAt: 1 });
}

export function deleteCriteriosByRubrica(rubricaId) {
  return CriterioRubrica.deleteMany({ rubrica_id: rubricaId });
}
