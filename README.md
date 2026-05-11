# Plataforma de Revision por Pares

Proyecto full stack para gestionar entregas academicas, asignacion de revisores y evaluaciones por pares.

## Enlaces

| Recurso | URL |
| --- | --- |
| Backend en produccion | https://revision-pares-backend.onrender.com |
| Health check | https://revision-pares-backend.onrender.com/health |
| API base en produccion | https://revision-pares-backend.onrender.com/api |
| Repositorio | https://github.com/abbadiealex/revision-pares-backend |

## Credenciales de prueba

| Rol | Usuario | Password |
| --- | --- | --- |
| Profesor | `profesor@iteso.mx` | `Profesor123` |
| Alumno | `alex@iteso.mx` | `Alumno123` |
| Evaluador | `evaluador@iteso.mx` | `Evaluador123` |
| Alumno revisor | `revisor@iteso.mx` | `Revisor123` |

## Estado real del proyecto

Backend: operativo en Render. El 11/05/2026 se verifico `/health`, login de profesor/alumno/evaluador y rutas protegidas de usuarios, rubricas, tareas y asignaciones vencidas.

Frontend: las pantallas HTML tienen navegacion clara desde `index.html` y `login.html`. El login consume Render con `POST /api/auth/login`, guarda token y usuario en `sessionStorage`, redirige por rol y protege las pantallas principales. El flujo principal ya consume API desde frontend: alumno sube tarea PDF, evaluador consulta asignaciones y envia evaluacion, profesor cierra con calificacion final y alumno consulta sus entregas. Usuarios y gestion completa de rubricas siguen como prototipo visual.

## Ejecutar localmente

Backend:

```bash
cd backend
npm install
cp .env.template .env
npm run seed
npm run dev
```

Frontend:

Abrir `index.html` o `login.html` en el navegador. Para probar el login real contra Render, se recomienda usar Live Server u otro servidor estatico local. El backend permite estos dos origenes locales: `http://localhost:5500` y `http://127.0.0.1:5500`. Si se usa otro dominio, agregarlo en Render a `FRONTEND_ORIGIN` separado por coma.

URLs locales recomendadas para probar:

- `http://localhost:5500/proyecto/ui-prototipo/login.html`
- `http://127.0.0.1:5500/proyecto/ui-prototipo/login.html`

Si Render ya estaba desplegado antes del ajuste de CORS y del hook de evaluaciones, hacer redeploy del backend para que acepte ambos origenes y permita enviar evaluaciones desde frontend.

Variables necesarias en `backend/.env`:

| Variable | Uso |
| --- | --- |
| `NODE_ENV` | Entorno de ejecucion (`development` o `production`). |
| `PORT` | Puerto local o el asignado por Render. |
| `MONGODB_URI` | Conexion de MongoDB/MongoDB Atlas. |
| `JWT_SECRET` | Secreto privado para firmar JWT. |
| `FRONTEND_ORIGIN` | Origenes permitidos por CORS, separados por coma. |
| `EVALUACION_DIAS_LIMITE` | Dias limite para evaluaciones. |
| `CRON_VENCIMIENTOS` | Expresion cron para revisar vencimientos. |

## Entrega ZIP

El ZIP debe incluir este proyecto completo, pero excluir:

- `backend/node_modules/`
- `backend/.env`
- `.git/`
- archivos subidos en `backend/uploads/`, excepto `.gitkeep`

Se incluye `backend/.env.template` sin credenciales reales.

## Tabla final de endpoints reales

| Metodo | Ruta | Descripcion | Auth requerida | Estado |
| --- | --- | --- | --- | --- |
| GET | `/health` | Verifica que el backend este vivo. | No | Operativo en Render |
| POST | `/api/auth/register` | Registra un alumno y devuelve JWT. | No | Operativo |
| POST | `/api/auth/login` | Inicia sesion y devuelve JWT. | No | Operativo |
| GET | `/api/usuarios` | Lista usuarios con filtros y paginacion. | Profesor | Operativo |
| POST | `/api/usuarios` | Crea usuario por administracion. | Profesor | Operativo |
| GET | `/api/usuarios/:id` | Obtiene usuario por id. | Profesor | Operativo |
| PATCH | `/api/usuarios/:id` | Actualiza usuario parcialmente. | Profesor | Operativo |
| PUT | `/api/usuarios/:id` | Actualiza usuario. | Profesor | Operativo |
| DELETE | `/api/usuarios/:id` | Elimina o desactiva usuario segun historial. | Profesor | Operativo |
| GET | `/api/rubricas` | Lista rubricas con filtros y paginacion. | Alumno, evaluador o profesor | Operativo |
| POST | `/api/rubricas` | Crea rubrica con criterios. | Profesor | Operativo |
| GET | `/api/rubricas/:id` | Obtiene rubrica por id. | Alumno, evaluador o profesor | Operativo |
| PATCH | `/api/rubricas/:id` | Actualiza rubrica parcialmente. | Profesor | Operativo |
| PUT | `/api/rubricas/:id` | Actualiza rubrica. | Profesor | Operativo |
| DELETE | `/api/rubricas/:id` | Elimina rubrica si no esta usada por tareas. | Profesor | Operativo |
| GET | `/api/tareas` | Lista tareas con filtros y paginacion. | Alumno, evaluador o profesor | Operativo |
| POST | `/api/tareas` | Sube tarea PDF y asigna evaluadores. | Alumno o profesor | Operativo |
| GET | `/api/tareas/mias` | Lista tareas del alumno autenticado. | Alumno | Operativo |
| GET | `/api/tareas/:id` | Obtiene tarea por id. | Alumno, evaluador o profesor | Operativo |
| PATCH | `/api/tareas/:id` | Actualiza tarea parcialmente; PDF opcional. | Alumno propietario o profesor | Operativo |
| PUT | `/api/tareas/:id` | Actualiza tarea; PDF opcional. | Alumno propietario o profesor | Operativo |
| DELETE | `/api/tareas/:id` | Elimina tarea si las reglas lo permiten. | Alumno propietario o profesor | Operativo |
| PATCH | `/api/tareas/:id/calificacion` | Asigna calificacion final y cierra tarea. | Profesor | Operativo |
| GET | `/api/asignaciones/mias` | Lista asignaciones del evaluador autenticado. | Alumno o evaluador | Operativo |
| GET | `/api/asignaciones/vencidas` | Lista asignaciones vencidas. | Profesor | Operativo |
| POST | `/api/evaluaciones` | Envia evaluacion completa. | Alumno o evaluador asignado | Operativo |
| PATCH | `/api/evaluaciones/:id/borrador` | Guarda borrador por id de evaluacion o asignacion. | Alumno o evaluador asignado | Operativo |

## Capturas recomendadas para el reporte

1. `login.html` o `index.html`: entrada y navegacion principal por roles.
2. `dashboard-profesor.html` junto con `usuarios.html`: rol profesor y gestion administrativa.
3. `subir-tarea.html` o `mis-entregas.html`: flujo del alumno.
4. `tareas-asignadas.html` o `evaluar-tarea.html`: flujo del evaluador.

Para evidenciar produccion, agrega tambien una captura de Postman o navegador con `https://revision-pares-backend.onrender.com/health` y una llamada protegida con token, aunque esa captura puede ir en la seccion de estado o video si el reporte solo permite 3 a 4 imagenes.

## Seccion sugerida: estado del proyecto

Funcionalidades completadas y operativas:

- Backend REST desplegado en Render con Express, MongoDB/Mongoose, CORS, JWT y respuestas JSON consistentes.
- Registro e inicio de sesion con JWT.
- CRUD de usuarios protegido para profesor.
- CRUD de rubricas protegido por rol.
- CRUD de tareas con subida PDF, validacion de archivo y asignacion automatica de revisores.
- Consulta de asignaciones, vencimientos y guardado/envio de evaluaciones.
- Cierre de tarea con calificacion final por profesor.
- Documentacion Swagger y coleccion Postman alineadas con las rutas reales.
- Frontend HTML con pantallas principales por rol, login real contra Render, guardado de sesion y proteccion basica por rol.
- Flujo principal conectado desde frontend: subida de tarea PDF, consulta de asignaciones, envio de evaluacion, calificacion final y consulta de entregas.

Pendientes o errores conocidos:

- `usuarios.html` sigue como prototipo visual; no crea ni actualiza usuarios desde frontend.
- `rubricas.html` sigue como prototipo visual para administracion; la subida de tarea si consulta rubricas reales desde la API.
- Los dashboards mantienen contadores hardcodeados; la navegacion, login, proteccion y logout si son funcionales.
- No hay automatizacion de pruebas unitarias/integracion; la verificacion actual fue manual.

## Cumplimiento legal y normativo

Banner de cookies: no es obligatorio si la aplicacion solo usa tokens tecnicos de sesion o almacenamiento local necesario para autenticacion. Si en una version futura se agregan cookies analiticas, publicidad o rastreo de terceros, deberia agregarse banner de consentimiento.

Politica de privacidad: la aplicacion recopila nombre, correo institucional, rol, tareas entregadas, archivos PDF, evaluaciones y calificaciones. Estos datos se usan para administrar entregas academicas, asignar revisores y calcular resultados. Deben almacenarse en MongoDB con acceso restringido por rol y no compartirse fuera del contexto academico.

Terminos y condiciones, clausula ejemplo: "El usuario conserva la autoria de los documentos que entrega, pero autoriza a la plataforma y al profesor responsable a almacenarlos, consultarlos y usarlos exclusivamente para fines de evaluacion academica durante el periodo del curso."
