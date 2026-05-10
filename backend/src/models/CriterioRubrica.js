import { Schema, model } from 'mongoose';

const CriterioRubricaSchema = new Schema(
  {
    rubrica_id: {
      type: Schema.Types.ObjectId,
      ref: 'Rubrica',
      required: true
    },
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    descripcion: {
      type: String,
      trim: true,
      default: ''
    },
    puntaje_maximo: {
      type: Number,
      required: true,
      min: 0
    },
    orden: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    collection: 'criterios_rubrica'
  }
);

CriterioRubricaSchema.index({ rubrica_id: 1 });

export const CriterioRubrica = model('CriterioRubrica', CriterioRubricaSchema);
