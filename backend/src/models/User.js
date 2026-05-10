import bcrypt from 'bcryptjs';
import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    correo: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    rol: {
      type: String,
      enum: ['alumno', 'evaluador', 'profesor'],
      required: true
    },
    activo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'usuarios'
  }
);

UserSchema.pre('save', async function encriptarPassword() {
  if (!this.isModified('passwordHash')) {
    return;
  }

  if (typeof this.passwordHash === 'string' && this.passwordHash.startsWith('$2')) {
    return;
  }

  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

UserSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  }
});

export const User = model('User', UserSchema);
