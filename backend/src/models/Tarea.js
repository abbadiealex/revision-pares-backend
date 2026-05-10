import { Schema, model } from 'mongoose';

const TareaSchema = new Schema(
  {
    alumno_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rubrica_id: {
      type: Schema.Types.ObjectId,
      ref: 'Rubrica',
      required: true
    },
    titulo: {
      type: String,
      required: true,
      trim: true
    },
    materia: {
      type: String,
      required: true,
      trim: true
    },
    archivo_url: {
      type: String,
      required: true
    },
    estado: {
      type: String,
      enum: ['entregada', 'en_revision', 'cerrada'],
      default: 'entregada'
    },
    calificacion_final: {
      type: Number,
      min: 0,
      max: 10,
      default: null
    },
    comentario_final: {
      type: String,
      trim: true,
      default: null
    },
    fecha_entrega: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'tareas'
  }
);

TareaSchema.index({ alumno_id: 1 });
TareaSchema.index({ estado: 1 });

export const Tarea = model('Tarea', TareaSchema);
