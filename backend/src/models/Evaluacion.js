import { Schema, model } from 'mongoose';

const EvaluacionCriterioSchema = new Schema(
  {
    criterio_id: {
      type: Schema.Types.ObjectId,
      ref: 'CriterioRubrica',
      required: true
    },
    puntaje_otorgado: {
      type: Number,
      required: true,
      min: 0
    },
    comentario: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    _id: false
  }
);

const EvaluacionSchema = new Schema(
  {
    tarea_id: {
      type: Schema.Types.ObjectId,
      ref: 'Tarea',
      required: true
    },
    asignacion_id: {
      type: Schema.Types.ObjectId,
      ref: 'Asignacion',
      required: true
    },
    evaluador_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    estado: {
      type: String,
      enum: ['borrador', 'enviada'],
      default: 'borrador'
    },
    criterios: {
      type: [EvaluacionCriterioSchema],
      default: []
    },
    comentario_general: {
      type: String,
      trim: true,
      default: ''
    },
    puntaje_total: {
      type: Number,
      min: 0,
      default: 0
    },
    fecha_envio: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'evaluaciones'
  }
);

EvaluacionSchema.index({ asignacion_id: 1 }, { unique: true });
EvaluacionSchema.index({ tarea_id: 1 });
EvaluacionSchema.index({ evaluador_id: 1, estado: 1 });

EvaluacionSchema.pre('validate', function calcularPuntajeTotal(next) {
  this.puntaje_total = this.criterios.reduce(
    (sum, criterio) => sum + Number(criterio.puntaje_otorgado || 0),
    0
  );
  next();
});

export const Evaluacion = model('Evaluacion', EvaluacionSchema);
