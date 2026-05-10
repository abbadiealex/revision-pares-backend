# Plataforma de Revision por Pares - Backend Completo REST API

Autor: Alejandro Ortega Abbadie  
Materia: Desarrollo de Aplicaciones y Servicios Web  
Stack: Node.js, Express, MongoDB, Mongoose

Este backend implementa una API REST coherente con una plataforma de revision por pares: alumnos suben tareas en PDF, el sistema asigna evaluadores, evaluadores guardan borradores o envian evaluaciones y el profesor cierra tareas con calificacion final.

## Checklist De La Actividad

| Requisito | Estado | Evidencia |
| --- | --- | --- |
| Carpeta `repositories/` | Completo | `src/repositories/*.repository.js` separa acceso a datos. |
| `POST /api/auth/register` | Completo | `src/routes/auth.routes.js`. |
| CRUD usuarios | Completo | `GET/POST/PATCH/PUT/DELETE /api/usuarios`. |
| CRUD tareas | Completo | `GET/POST/PATCH/PUT/DELETE /api/tareas`. |
| CRUD rubricas | Completo | `GET/POST/PATCH/PUT/DELETE /api/rubricas`. |
| Validaciones antes de BD | Completo | `src/utils/validation.js` y services. |
| Filtros y paginacion | Completo | `page`, `limit`, filtros con `skip()` y `limit()` en repositories. |
| Hook `pre('save')` bcrypt | Completo | `src/models/User.js`. |
| Precarga programatica | Completo | `npm run seed`, `src/seed/seed.js`. |
| `.env.template` | Completo | Archivo incluido en raiz. |
| Postman JSON | Completo | `postman_collection.json`. |
| Swagger YAML | Completo | `swagger.yaml`. |

## Estructura

```txt
backend/
  .env.example
  .env.template
  package.json
  postman_collection.json
  swagger.yaml
  uploads/tareas/
  src/
    app.js
    config/db.js
    controllers/
    jobs/
    middleware/
    models/
    repositories/
    routes/
    seed/
    services/
    utils/
```

La separacion queda asi:

| Capa | Responsabilidad |
| --- | --- |
| `routes/` | Define rutas y middleware. |
| `controllers/` | Recibe request, llama services y responde. No accede a Mongoose. |
| `services/` | Reglas de negocio, validaciones y coordinacion entre repositorios. |
| `repositories/` | Unica capa que consulta o modifica MongoDB/Mongoose. |
| `models/` | Schemas Mongoose, indices y hooks. |

## Ejecucion Local

```bash
npm install
cp .env.template .env
npm run seed
npm run dev
```

Requisitos:

| Variable | Ejemplo |
| --- | --- |
| `PORT` | `3000` |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/revision_pares` |
| `JWT_SECRET` | `cambia_este_secreto_en_desarrollo` |
| `FRONTEND_ORIGIN` | `http://localhost:5500` |
| `EVALUACION_DIAS_LIMITE` | `7` |
| `CRON_VENCIMIENTOS` | `0 * * * *` |

Scripts:

| Script | Uso |
| --- | --- |
| `npm run dev` | Levanta API con nodemon. |
| `npm start` | Levanta API con Node. |
| `npm run check` | Revisa sintaxis de `src/app.js`. |
| `npm run seed` | Crea usuarios demo y rubrica minima. |

Usuarios demo del seed:

| Rol | Correo | Password |
| --- | --- | --- |
| profesor | `profesor@iteso.mx` | `Profesor123` |
| alumno | `alex@iteso.mx` | `Alumno123` |
| evaluador | `evaluador@iteso.mx` | `Evaluador123` |
| alumno revisor | `revisor@iteso.mx` | `Revisor123` |

## Contrato HTTP

Respuesta exitosa:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "code": "OK"
}
```

Respuesta con error:

```json
{
  "success": false,
  "data": null,
  "error": "Mensaje legible",
  "code": "VALIDATION_ERROR"
}
```

Codigos usados: `OK`, `CREATED`, `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`.

## Roles

| Rol | Permisos principales |
| --- | --- |
| `alumno` | Registrarse, subir tarea, ver sus tareas, evaluar si fue asignado. |
| `evaluador` | Ver asignaciones y enviar evaluaciones. |
| `profesor` | Administrar usuarios, rubricas, tareas, vencimientos y calificacion final. |
| `sistema` | Ejecuta asignacion automatica y job de vencimientos. |

## Auth

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Registra alumno y devuelve JWT. |
| `POST` | `/api/auth/login` | Inicia sesion y devuelve JWT. |

Body register:

```json
{
  "nombre": "Alumno Nuevo",
  "correo": "nuevo@iteso.mx",
  "password": "Alumno123",
  "rol": "alumno"
}
```

El registro publico solo permite `rol: "alumno"`. Los roles `evaluador` y `profesor` se crean desde `POST /api/usuarios` por un profesor.

La contrasena se guarda en `passwordHash`. El schema `User` tiene hook:

```js
UserSchema.pre('save', async function encriptarPassword() {
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});
```

## CRUD Usuarios

Rutas protegidas para `profesor`.

| Metodo | Ruta | Query/body |
| --- | --- | --- |
| `GET` | `/api/usuarios` | `page`, `limit`, `rol`, `activo`, `q` |
| `GET` | `/api/usuarios/:id` | ObjectId |
| `POST` | `/api/usuarios` | `nombre`, `correo`, `password`, `rol`, `activo?` |
| `PATCH` | `/api/usuarios/:id` | Campos parciales |
| `PUT` | `/api/usuarios/:id` | Campos parciales o completos |
| `DELETE` | `/api/usuarios/:id` | Elimina si no tiene historial; si tiene historial, desactiva. |

## CRUD Rubricas

Lectura para usuarios autenticados. Escritura solo profesor.

| Metodo | Ruta | Query/body |
| --- | --- | --- |
| `GET` | `/api/rubricas` | `page`, `limit`, `materia`, `activa`, `q` |
| `GET` | `/api/rubricas/:id` | ObjectId |
| `POST` | `/api/rubricas` | Rubrica con `criterios[]` |
| `PATCH` | `/api/rubricas/:id` | Campos parciales; si manda `criterios`, reemplaza criterios |
| `PUT` | `/api/rubricas/:id` | Igual que PATCH |
| `DELETE` | `/api/rubricas/:id` | Solo si no esta usada por tareas |

Body:

```json
{
  "titulo": "Rubrica API REST",
  "descripcion": "Criterios para revisar una API.",
  "materia": "Desarrollo de Aplicaciones y Servicios Web",
  "criterios": [
    { "nombre": "Modelo", "puntaje_maximo": 30, "orden": 1 },
    { "nombre": "Endpoints", "puntaje_maximo": 40, "orden": 2 },
    { "nombre": "Validaciones", "puntaje_maximo": 30, "orden": 3 }
  ]
}
```

## CRUD Tareas

| Metodo | Ruta | Query/body |
| --- | --- | --- |
| `GET` | `/api/tareas` | `page`, `limit`, `estado`, `materia`, `alumno_id`, `rubrica_id`, `q` |
| `GET` | `/api/tareas/mias` | Tareas del alumno autenticado |
| `GET` | `/api/tareas/:id` | ObjectId |
| `POST` | `/api/tareas` | `multipart/form-data` con PDF |
| `PATCH` | `/api/tareas/:id` | Actualizacion parcial; PDF opcional |
| `PUT` | `/api/tareas/:id` | Igual que PATCH |
| `DELETE` | `/api/tareas/:id` | Profesor o alumno propietario si aun no inicia revision |
| `PATCH` | `/api/tareas/:id/calificacion` | Profesor asigna calificacion final y cierra tarea |

Subida PDF:

| Regla | Valor |
| --- | --- |
| Campo | `archivo` |
| MIME | `application/pdf` |
| Tamano maximo | 10 MB |
| Carpeta | `uploads/tareas/` |
| Nombre final | `<tareaId>.pdf` |

La asignacion automatica se dispara en `POST /api/tareas` y crea exactamente 2 asignaciones si hay evaluadores suficientes.

La calificacion y el comentario final solo son visibles para el alumno cuando `tarea.estado === 'cerrada'`.

## Asignaciones Y Evaluaciones

| Metodo | Ruta | Rol | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/api/asignaciones/mias` | alumno/evaluador | Ver tareas asignadas para evaluar. |
| `GET` | `/api/asignaciones/vencidas` | profesor | Ver asignaciones vencidas. |
| `POST` | `/api/evaluaciones` | alumno/evaluador | Enviar evaluacion completa. |
| `PATCH` | `/api/evaluaciones/:id/borrador` | alumno/evaluador | Guardar borrador. `:id` puede ser evaluacion o asignacion. |

`puntaje_total` nunca viene del cliente. El servidor lo calcula:

```js
evaluacion.puntaje_total = criterios.reduce(
  (sum, criterio) => sum + criterio.puntaje_otorgado,
  0
);
```

## Filtros Y Paginacion

Todos los endpoints `GET` de colecciones aceptan:

| Param | Regla |
| --- | --- |
| `page` | Entero mayor o igual a 1. Default `1`. |
| `limit` | Entero entre 1 y 100. Default `10`. |

Los repositories aplican:

```js
Model.find(filters)
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
```

Respuesta paginada:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

## Validaciones

Antes de operar sobre BD se valida:

| Campo | Validacion |
| --- | --- |
| ObjectId | Formato valido de MongoDB. |
| Email | Formato de correo. |
| Password | 6 a 72 caracteres, al menos una letra y un numero en registro/creacion. |
| Roles | `alumno`, `evaluador`, `profesor`. |
| Estados tarea | `entregada`, `en_revision`, `cerrada`. |
| Booleanos query | `true` o `false`. |
| PDF | MIME `application/pdf`, extension `.pdf`, maximo 10 MB. |
| Numeros | Rangos definidos por caso: calificacion `0-10`, criterios `0-100`. |

## MongoDB Y Mongoose

Colecciones:

| Coleccion | Modelo | Proposito |
| --- | --- | --- |
| `usuarios` | `User` | Identidad, rol y credenciales. |
| `rubricas` | `Rubrica` | Rubricas por materia. |
| `criterios_rubrica` | `CriterioRubrica` | Criterios de cada rubrica. |
| `tareas` | `Tarea` | Entregas PDF y calificacion final. |
| `asignaciones` | `Asignacion` | Tarea asignada a evaluador. |
| `evaluaciones` | `Evaluacion` | Borradores y evaluaciones enviadas. |

Indices importantes:

```js
TareaSchema.index({ alumno_id: 1 });
TareaSchema.index({ estado: 1 });
AsignacionSchema.index({ tarea_id: 1, evaluador_id: 1 }, { unique: true });
AsignacionSchema.index({ evaluador_id: 1, estado: 1 });
AsignacionSchema.index({ fecha_limite: 1, estado: 1 });
CriterioRubricaSchema.index({ rubrica_id: 1 });
EvaluacionSchema.index({ asignacion_id: 1 }, { unique: true });
```

## Jobs

`src/jobs/vencimientoJob.js` ejecuta `node-cron` con `CRON_VENCIMIENTOS`.

Flujo:

1. Busca asignaciones `pendiente` o `en_proceso` con `fecha_limite < now`.
2. Marca la asignacion como `vencida`.
3. Reasigna a otro evaluador respetando reglas originales.
4. El indice unico evita asignaciones duplicadas.

## Swagger Y Postman

| Archivo | Uso |
| --- | --- |
| `swagger.yaml` | Especificacion OpenAPI 3.0. |
| `postman_collection.json` | Coleccion para importar en Postman. |

La coleccion usa variables: `baseUrl`, `token`, `profesorToken`, `userId`, `rubricaId`, `tareaId`, `asignacionId`, `evaluacionId`.
