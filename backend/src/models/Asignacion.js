import { Schema, model } from 'mongoose';

const AsignacionSchema = new Schema(
  {
    tarea_id: {
      type: Schema.Types.ObjectId,
      ref: 'Tarea',
      required: true
    },
    evaluador_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    estado: {
      type: String,
      enum: ['pendiente', 'en_proceso', 'vencida', 'completada', 'reasignada'],
      default: 'pendiente'
    },
    fecha_asignacion: {
      type: Date,
      default: Date.now
    },
    fecha_limite: {
      type: Date,
      required: true
    },
    origen_asignacion: {
      type: Schema.Types.ObjectId,
      ref: 'Asignacion',
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'asignaciones'
  }
);

AsignacionSchema.index({ tarea_id: 1, evaluador_id: 1 }, { unique: true });
AsignacionSchema.index({ evaluador_id: 1, estado: 1 });
AsignacionSchema.index({ fecha_limite: 1, estado: 1 });

export const Asignacion = model('Asignacion', AsignacionSchema);
