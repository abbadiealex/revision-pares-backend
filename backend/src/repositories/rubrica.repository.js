import { Rubrica } from '../models/Rubrica.js';

export function createRubrica(data) {
  return Rubrica.create(data);
}

export function findRubricaById(id) {
  return Rubrica.findById(id);
}

export function listRubricas({ filters, skip, limit }) {
  return Rubrica.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit);
}

export function countRubricas(filters) {
  return Rubrica.countDocuments(filters);
}

export function updateRubricaById(id, data) {
  return Rubrica.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
}

export function deleteRubricaById(id) {
  return Rubrica.findByIdAndDelete(id);
}
