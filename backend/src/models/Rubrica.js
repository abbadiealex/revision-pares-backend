import { Schema, model } from 'mongoose';

const RubricaSchema = new Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true
    },
    descripcion: {
      type: String,
      trim: true,
      default: ''
    },
    materia: {
      type: String,
      required: true,
      trim: true
    },
    activa: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    collection: 'rubricas'
  }
);

export const Rubrica = model('Rubrica', RubricaSchema);
