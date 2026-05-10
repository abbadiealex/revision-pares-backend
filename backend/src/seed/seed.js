import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { createCriteriosRubrica } from '../repositories/criterioRubrica.repository.js';
import { createRubrica, countRubricas } from '../repositories/rubrica.repository.js';
import { createUser, findUserByEmail } from '../repositories/user.repository.js';

async function ensureUser(data) {
  const existing = await findUserByEmail(data.correo);

  if (existing) {
    return existing;
  }

  return createUser(data);
}

async function seed() {
  await connectDb();

  const profesor = await ensureUser({
    nombre: 'Profesor DASW',
    correo: 'profesor@iteso.mx',
    passwordHash: 'Profesor123',
    rol: 'profesor'
  });

  await ensureUser({
    nombre: 'Alejandro Ortega',
    correo: 'alex@iteso.mx',
    passwordHash: 'Alumno123',
    rol: 'alumno'
  });

  await ensureUser({
    nombre: 'Evaluador Demo',
    correo: 'evaluador@iteso.mx',
    passwordHash: 'Evaluador123',
    rol: 'evaluador'
  });

  await ensureUser({
    nombre: 'Alumno Revisor',
    correo: 'revisor@iteso.mx',
    passwordHash: 'Revisor123',
    rol: 'alumno'
  });

  const totalRubricas = await countRubricas({});

  if (totalRubricas === 0) {
    const rubrica = await createRubrica({
      titulo: 'Rubrica tarea API REST',
      descripcion: 'Criterios base para evaluar una entrega de API REST.',
      materia: 'Desarrollo de Aplicaciones y Servicios Web',
      createdBy: profesor._id
    });

    await createCriteriosRubrica([
      {
        rubrica_id: rubrica._id,
        nombre: 'Claridad',
        descripcion: 'La solucion se entiende y esta organizada.',
        puntaje_maximo: 40,
        orden: 1
      },
      {
        rubrica_id: rubrica._id,
        nombre: 'Contenido',
        descripcion: 'Cumple los requisitos tecnicos solicitados.',
        puntaje_maximo: 40,
        orden: 2
      },
      {
        rubrica_id: rubrica._id,
        nombre: 'Formato',
        descripcion: 'Entrega en PDF y respeta formato esperado.',
        puntaje_maximo: 20,
        orden: 3
      }
    ]);
  }

  await mongoose.disconnect();
  console.log('Precarga minima completada');
}

seed().catch(async (error) => {
  console.error('Error en precarga:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
