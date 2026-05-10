import { Tarea } from '../models/Tarea.js';

export function createTarea(data) {
  return Tarea.create(data);
}

export function findTareaById(id) {
  return Tarea.findById(id).populate('alumno_id', 'nombre correo rol').populate('rubrica_id');
}

export function findTareaByIdPlain(id) {
  return Tarea.findById(id);
}

export function listTareas({ filters, skip, limit }) {
  return Tarea.find(filters)
    .populate('alumno_id', 'nombre correo rol')
    .populate('rubrica_id')
    .sort({ fecha_entrega: -1 })
    .skip(skip)
    .limit(limit);
}

export function countTareas(filters) {
  return Tarea.countDocuments(filters);
}

export function updateTareaById(id, data) {
  return Tarea.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
}

export function deleteTareaById(id) {
  return Tarea.findByIdAndDelete(id);
}
