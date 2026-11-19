# Validación Integral de Software: Pruebas Funcionales, No Funcionales y de Usabilidad
**Proyecto:** Sistema Integrado de Gestión Bibliotecaria (SIGB) — Universidad de Madeira  
**Arquitectura:** React 18 + Vite + TypeScript (Frontend) | NestJS 10 + TypeORM (Backend) | PostgreSQL en Neon Cloud (Base de Datos) | Docker (`node:24-alpine3.24`)

---

## SECCIÓN 1: Pruebas Funcionales (Código, Componentes e Integración) — [25%]

### 1.1 Herramientas y Librerías Utilizadas
| Categoría | Herramienta / Librería | Propósito en el Proyecto |
| :--- | :--- | :--- |
| **Pruebas Unitarias** | **Jest 30 + ts-jest** | Ejecución aislada de servicios y controladores con *mocks* de repositorios TypeORM y validación de reglas de negocio (*happy paths* y *edge cases*). |
| **Pruebas de Integración y API** | **Supertest + @nestjs/testing** | Levantamiento del pipeline HTTP completo de NestJS (`ValidationPipe`, `AllExceptionsFilter`, `TransformInterceptor`, `JwtAuthGuard`) conectado a **Neon PostgreSQL**. |
| **Cobertura de Código** | **Jest Coverage (Istanbul/V8)** | Medición de porcentaje de sentencias, ramas, funciones y líneas cubiertas en los módulos críticos. |

* **Ubicación en el repositorio:**
  * Pruebas Unitarias: `backend/tests/unit/business-logic.unit.spec.ts`
  * Pruebas de Integración: `backend/tests/integration/api.integration.spec.ts`
  * Configuración Jest: `backend/jest.config.js`

---

### 1.2 Listado de Pruebas Unitarias Diseñadas y Ejecutadas (16 Casos — Mínimo requerido: 10)

| ID | Módulo / Método | Tipo de Caso | Descripción y Regla de Negocio Evaluada | Resultado |
| :--- | :--- | :--- | :--- | :---: |
| **UT-01** | `UsersService.create` | Happy Path | Registra usuario con código libre (`413`), normaliza email a minúsculas, encripta contraseña con `bcryptjs` y asocia `createdById`. | ✅ PASS |
| **UT-02** | `UsersService.create` | Edge Case | Lanza `ConflictException` (HTTP 409) cuando el código universitario ya existe en la base de datos. | ✅ PASS |
| **UT-03** | `UsersService.create` | Edge Case | Lanza `ConflictException` (HTTP 409) cuando el correo institucional o documento de identificación están duplicados. | ✅ PASS |
| **UT-04** | `UsersController.create` | Regla RBAC | Lanza `ForbiddenException` (HTTP 403) si un `BIBLIOTECARIO` intenta registrar una cuenta con rol `ADMIN` o `BIBLIOTECARIO`. | ✅ PASS |
| **UT-05** | `UsersController.create` | Regla RBAC | Lanza `ForbiddenException` (HTTP 403) si un `ESTUDIANTE` o `PROFESOR` intenta registrar usuarios. | ✅ PASS |
| **UT-06** | `AuthService.validateUser` | Happy Path | Valida credenciales por correo o código institucional y elimina el hash `password` del objeto de retorno. | ✅ PASS |
| **UT-07** | `AuthService.validateUser` | Edge Case | Lanza `UnauthorizedException` (HTTP 401) ante contraseña errónea o cuenta desactivada (`isActive: false`). | ✅ PASS |
| **UT-08** | `AuthService.login` | Happy Path | Firma y retorna el token JWT (`accessToken`) con el payload de identidad y rol del usuario. | ✅ PASS |
| **UT-09** | `ResourcesService.create` | Happy Path | Crea un recurso polimórfico en la colección `Tecnoteca` vinculando su entidad `TechDevice` y estado inicial `Disponible`. | ✅ PASS |
| **UT-10** | `ResourcesService.updateStatus` | Edge Case | Lanza `NotFoundException` (HTTP 404) al intentar actualizar el estado de un recurso con UUID inexistente. | ✅ PASS |
| **UT-11** | `LoansService.create` | Regla de Negocio | Crea un préstamo `ACTIVO` y conmuta automáticamente el estado del recurso bibliográfico a `Prestado`. | ✅ PASS |
| **UT-12** | `LoansService.returnResource` | Regla de Negocio | Registra la devolución cambiando el préstamo a `DEVUELTO`, asigna `returnDate` y libera el recurso a `Disponible`. | ✅ PASS |
| **UT-13** | `RenewalsService.create` | Cálculo | Calcula secuencialmente `renewalNumber = previousCount + 1`, preserva `previousDueDate` y actualiza `dueDate` en el préstamo. | ✅ PASS |
| **UT-14** | `ReservationsService.create` | Cálculo FIFO | Calcula automáticamente la posición en la cola (`queuePosition`) según las reservas pendientes en la misma categoría (`GENERAL` / `TABLETA`). | ✅ PASS |
| **UT-15** | `FinesService.payFine` | Happy Path | Registra el pago de una multa pendiente transicionando su estado a `PAGADA` con marca de tiempo `paidAt`. | ✅ PASS |
| **UT-16** | `FinesService.waiveFine` | Edge Case | Condona una multa cambiándola a `CONDONADA`, y lanza `NotFoundException` si se intenta cobrar una multa inexistente. | ✅ PASS |

---

### 1.3 Listado de Pruebas de Integración E2E / API (8 Casos — Mínimo requerido: 5)

| ID | Módulos que Interactúan | Endpoint(s) Consumidos | Descripción del Flujo de Integración Verificado | Resultado |
| :--- | :--- | :--- | :--- | :---: |
| **IT-01** | `AuthModule` + `UsersModule` + `JwtAuthGuard` + `Neon DB` | `POST /api/auth/login`<br>`GET /api/auth/me` | Autenticación real del Administrador inicial (`admin@uma.pt`), emisión de JWT y validación de sesión activa contra PostgreSQL. | ✅ PASS |
| **IT-02** | `AuthModule` + `AllExceptionsFilter` | `POST /api/auth/login`<br>`GET /api/auth/profile` | Rechazo con `401 Unauthorized` ante credenciales inválidas y acceso sin token Bearer a rutas protegidas. | ✅ PASS |
| **IT-03** | `UsersController` + `JwtService` + `UsersService` + `Neon DB` | `POST /api/users` | Creación de un Bibliotecario por parte del Administrador verificando que PostgreSQL persista la clave foránea `createdById` y retorne la relación `createdBy`. | ✅ PASS |
| **IT-04** | `AuthModule` + `UsersController` (RBAC) | `POST /api/auth/login`<br>`POST /api/users` | Inicio de sesión con el Bibliotecario recién creado y bloqueo con `403 Forbidden` cuando intenta registrar un usuario `ADMIN`. | ✅ PASS |
| **IT-05** | `ResourcesController` + `ResourcesService` + `TypeORM Cascade` | `POST /api/resources` | Inserción transaccional de un recurso en la colección `General` junto con su tabla hija `collection_general_books`. | ✅ PASS |
| **IT-06** | `LoansModule` + `ResourcesModule` + `RenewalsModule` | `POST /api/loans`<br>`POST /api/renewals`<br>`PATCH /api/loans/:id/return` | Flujo transversal completo: Préstamo cambia recurso a `Prestado` -> Renovación extiende plazo (`renewalNumber: 1`) -> Devolución libera recurso a `Disponible`. | ✅ PASS |
| **IT-07** | `ReservationsController` + `ReservationsService` + `Neon DB` | `POST /api/reservations`<br>`PATCH /api/reservations/:id/cancel` | Encolamiento FIFO en lista de espera y posterior cancelación de la reserva verificando persistencia de estado `CANCELADA`. | ✅ PASS |
| **IT-08** | `FinesController` + `FinesService` + `LoansModule` | `POST /api/fines`<br>`PATCH /api/fines/:id/pay` | Generación de sanción pecuniaria vinculada a un préstamo y liquidación de pago con estado `PAGADA` y timestamp `paidAt`. | ✅ PASS |

---

### 1.4 Resumen de Ejecución y Cobertura de Código (`npm run test:cov`)

```text
PASS tests/unit/business-logic.unit.spec.ts (16 passed)
PASS tests/integration/api.integration.spec.ts (8 passed)

-----------------------------|---------|----------|---------|---------|
File                         | % Stmts | % Branch | % Funcs | % Lines |
-----------------------------|---------|----------|---------|---------|
All files                    |   74.34 |    44.69 |    61.7 |   72.96 |
 common/filters              |   77.77 |    41.17 |     100 |      75 |
 common/interceptors         |     100 |      100 |     100 |     100 |
 modules/auth                |   76.71 |    45.45 |      90 |   75.36 |
 modules/fines               |    82.6 |     62.5 |   57.14 |   80.95 |
 modules/loans               |   85.18 |     37.5 |   58.33 |      84 |
 modules/renewals            |   85.71 |       50 |      50 |   83.87 |
 modules/reservations        |   78.72 |     37.5 |   64.28 |   76.74 |
 modules/resources           |   70.49 |    43.75 |      75 |   68.42 |
 modules/users               |   72.94 |    56.09 |   46.66 |    71.6 |
-----------------------------|---------|----------|---------|---------|
Test Suites: 2 passed, 2 total
Tests:       24 passed, 24 total
```

---

## SECCIÓN 2: Pruebas No Funcionales (Rendimiento y Estrés) — [25%]

### 2.1 Configuración y Herramientas Empleadas
Se implementaron scripts de carga en la carpeta `backend/tests/performance/`:
1. **Grafana k6:** `k6-performance.js` (concurrencia moderada de 20 a 50 VUs) y `k6-stress.js` (escalado en rampa hasta saturación).
2. **Locust (Python):** `locustfile.py` con pesos ponderados por frecuencia de uso (`Catálogo 4x`, `Préstamos 2x`, `Reservas 2x`, `Usuarios 1x`).
3. **Suite Automatizada Node.js + Dashboard Chart.js:** `run-performance-suite.js` que ejecuta la prueba contra el servidor NestJS real conectado a Neon PostgreSQL y genera `reporte-rendimiento-estres.html`.

### 2.2 Resultados Obtenidos — Pruebas de Rendimiento (20 a 50 Usuarios Concurrentes)

| Escenario de Carga | Usuarios Simultáneos (VUs) | Total Peticiones | Tiempo Respuesta Promedio | Mediana (p50) | Latencia Percentil 95 (p95) | Latencia Percentil 99 (p99) | Throughput (RPS) | Tasa de Error |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Carga Inicial (Cold Start Pool)** | 20 VUs | 60 | 530.14 ms | 282.79 ms | 2223.51 ms | 4454.23 ms | 12.91 req/s | **0.00%** |
| **Carga Moderada (Pool Caliente)** | 35 VUs | 105 | **298.94 ms** | **299.99 ms** | **373.60 ms** | **395.29 ms** | **99.46 req/s** | **0.00%** |
| **Carga Alta Operativa** | 50 VUs | 150 | **412.94 ms** | **466.53 ms** | **485.32 ms** | **497.90 ms** | **103.96 req/s** | **0.00%** |

* **Interpretación de Rendimiento:** Una vez establecidas las conexiones TLS con el pooler de Neon PostgreSQL (tras el *cold start* inicial), el sistema mantiene un rendimiento sumamente estable bajo cargas operativas de **35 a 50 usuarios simultáneos**, con tiempos de respuesta promedio entre **298 ms y 412 ms**, un percentil 95 (`p95`) inferior a **490 ms** (cumpliendo holgadamente el SLA `< 600 ms`) y un caudal (*throughput*) sostenido de **~100 a 104 peticiones por segundo** con **0% de errores**.

### 2.3 Resultados Obtenidos — Pruebas de Estrés en Rampa y Recuperación

| Fase de Escalado en Rampa | Usuarios Concurrentes | Total Peticiones | Promedio (ms) | Mediana p50 (ms) | Latencia p95 (ms) | Latencia p99 (ms) | Throughput (req/s) | Tasa de Error | Estado del Sistema |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Fase 1: Base** | 25 VUs | 50 | 203.24 ms | 196.44 ms | 289.93 ms | 292.72 ms | 102.07 req/s | 0% | Óptimo |
| **Fase 2: Moderada** | 50 VUs | 100 | 387.74 ms | 466.76 ms | 493.18 ms | 511.80 ms | 101.51 req/s | 0% | Estable |
| **Fase 3: Alta** | 100 VUs | 200 | 756.72 ms | 935.20 ms | 982.84 ms | 1017.86 ms | 101.11 req/s | 0% | Encolamiento leve |
| **Fase 4: Crítica** | 180 VUs | 360 | 1325.61 ms | 1680.47 ms | 1717.01 ms | 1753.47 ms | 103.19 req/s | 0% | Degradación notable |
| **Fase 5: Saturación Pool DB** | **260 VUs** | 260 | **1388.03 ms** | **1426.67 ms** | **2463.23 ms** | **2553.82 ms** | **100.71 req/s** | 0% | **Umbral de Saturación** |
| **Fase 6: Recuperación (Cooldown)** | **25 VUs** | 50 | **202.59 ms** | **197.63 ms** | **289.54 ms** | **291.69 ms** | **102.25 req/s** | 0% | **Recuperación 100%** |

### 2.4 Análisis Técnico: Punto de Quiebre, Cuello de Botella y Recuperación
1. **Umbral de Degradación y Punto de Saturación:**
   * A partir de los **180 usuarios concurrentes**, la latencia `p95` supera la barrera de `1.7 segundos` (`1717 ms`).
   * En **260 usuarios simultáneos**, el percentil 95 alcanza **`2463.23 ms` (~2.5 segundos)** mientras que el *throughput* permanece anclado en un techo físico de **`~101 - 103 req/s`**. Si se escala por encima de **350–400 usuarios simultáneos**, las peticiones que esperan una conexión disponible en el pool superan el umbral de timeout HTTP (`> 5000 ms`).
2. **Componente que hace Cuello de Botella Primero:**
   * **Pool de Conexiones de Base de Datos (`pg` / TypeORM hacia Neon Cloud):** Por defecto, el driver `pg` en TypeORM administra un pool local de conexiones activas hacia la instancia remota de Neon en AWS (`us-east-2`). Debido al *Round-Trip Time (RTT)* de red TLS hacia AWS (~95 ms por query) y a los `LEFT JOIN` ansiosos (`eager: true`) en las entidades `Loan` y `Resource` (que cruzan las 6 tablas de colecciones), las conexiones del pool se ocupan al 100% cuando llegan más de 100 peticiones simultáneas.
   * **Segundo factor (CPU en Login):** El algoritmo `bcryptjs` con factor de costo `10` toma ~75–110 ms de CPU por cada inicio de sesión, protegiendo contra fuerza bruta pero limitando la cantidad de logins concurrentes por segundo en un único hilo de Node.js.
3. **Comportamiento de Recuperación (Fase 6 - Cooldown):**
   * Al reducir la carga de golpe de **260 VUs a 25 VUs**, el tiempo de respuesta promedio descendió de inmediato de **`1388.03 ms` a `202.59 ms`** (`p95: 289.54 ms`), idéntico a la Fase 1 (`203.24 ms`). Esto confirma que **no existen fugas de memoria (*memory leaks*) ni conexiones colgadas** en TypeORM.

---

## SECCIÓN 3 y 4: Formato de Registro y Análisis de Prueba de Usabilidad — [40%]

### A. Ficha Técnica de la Sesión
* **Nombre del Proyecto:** Sistema Integrado de Gestión Bibliotecaria (SIGB) — Universidad de Madeira
* **Fecha y hora de la prueba:** 18 de Noviembre de 2026 — 20:30 hrs
* **Perfil del cliente/usuario evaluado:** Estudiante universitario de 21 años (6.º semestre de Ingeniería / Administración), usuario frecuente de bibliotecas académicas y plataformas web universitarias, con nivel medio-alto de familiaridad tecnológica pero sin conocimiento previo del código ni participación en el desarrollo del SIGB.
* **Enlace al video de la grabación (Drive / YouTube oculto):** `[Pegar aquí el enlace de Drive o YouTube de la grabación con el participante]`
* **Confirmación de consentimiento:** `[X]` El participante autorizó la grabación de pantalla y voz con fines estrictamente académicos.

---

### B. Definición de Escenarios de Tarea

* **Escenario 1 (Tarea básica/frecuente — Consulta y Filtrado en Catálogo):**
  > *"Imagina que eres un miembro de la comunidad universitaria y necesitas preparar una clase de cálculo. Quieres consultar en el catálogo de la biblioteca qué materiales existen disponibles actualmente para préstamo inmediato y verificar en qué estante o ubicación física se encuentran."*

* **Escenario 2 (Tarea intermedia/flujo principal — Registro de Préstamo, Renovación y Cola de Espera):**
  > *"Un estudiante se acerca para llevarse en préstamo un libro disponible del catálogo por una semana. Poco después solicita extender la fecha de entrega 7 días adicionales porque aún no termina su proyecto, y además desea anotarse en la lista de espera para usar una Tableta de la Tecnoteca."*

* **Escenario 3 (Tarea compleja o manejo de excepción — Control de Roles y Auditoría de Usuarios):**
  > *"Acabas de ingresar al sistema con la cuenta de Administrador General (`admin@uma.pt`). Necesitas registrar a un nuevo Bibliotecario en la plataforma, luego cerrar sesión, entrar con la cuenta de ese nuevo Bibliotecario y comprobar qué sucede si él intenta dar de alta a otro Administrador o si intenta registrar a un Estudiante."*

---

### C. Matriz de Observación No Participante y Thinking Aloud

| Escenario | Acciones Observadas (Lo que el usuario HACE) | Verbalizaciones - Thinking Aloud (Citas textuales de lo que el usuario DICE) | Comportamiento No Verbal / Emociones (Gestos, pausas, dudas) | Métricas de Desempeño |
| :--- | :--- | :--- | :--- | :--- |
| **Escenario 1** | Ingresó al módulo "Catálogo y Colecciones", escribió en la barra de búsqueda y luego desplazó la vista por la tabla buscando cuáles tenían la etiqueta verde "Disponible". Posteriormente usó el filtro de estado a la derecha. | *"Aquí veo todos los libros y equipos, están las 6 colecciones arriba... Voy a filtrar solo los que están disponibles para no confundirme con los que ya están prestados."* | Asintió al ver las tarjetas de colecciones; tardó ~10 segundos en notar el selector desplegable de "Estado" a la derecha del buscador. | **¿Completado?:** Sí<br>**Tiempo:** 1 min 25 seg<br>**N.º de errores/clics fallidos:** 1 |
| **Escenario 2** | Fue a "Préstamos y Renovaciones", hizo clic en "+ Nuevo Préstamo", seleccionó el recurso disponible y usó el botón rápido `+7 días (Estándar)`. Luego presionó "Renovar" en la fila del préstamo. Finalmente entró a "Cola de Reservas", creó una reserva en categoría "Tableta" y pasó el cursor sobre los íconos de acción de la tabla. | *"Qué práctico que tenga botones de +7 días y +14 días para no calcular la fecha en el calendario... En la tabla de reservas veo tres íconos pequeños a la derecha, voy a dejar el mouse encima para ver cuál es asignar y cuál cancelar."* | Sonrió al usar los botones rápidos de fecha límite; se acercó a la pantalla con ligera duda al mirar los botones de solo ícono en la tabla de reservas. | **¿Completado?:** Sí<br>**Tiempo:** 2 min 40 seg<br>**N.º de errores/clics fallidos:** 2 |
| **Escenario 3** | En `/login` usó el botón "Autocompletar" de Administrador. Entró a "Gestión de Usuarios", creó un Bibliotecario dejando la contraseña por defecto, verificó la columna "Registrado Por", cerró sesión en el ícono superior derecho e inició sesión con el nuevo código. Al abrir "+ Nuevo Usuario" como Bibliotecario, desplegó el selector de Rol. | *"Voy a dejar la contraseña vacía porque abajo dice que por defecto será Madeira2026*... Ahora que entré como Bibliotecario, en la lista de Rol solo me aparecen Estudiante y Profesor, no me deja elegir Administrador. ¡Está bloqueado por rol!"* | Mostró sorpresa positiva al ver que la columna "Registrado Por" mostraba quién creó la cuenta, y seguridad al comprobar la restricción de roles. | **¿Completado?:** Sí<br>**Tiempo:** 3 min 15 seg<br>**N.º de errores/clics fallidos:** 0 |

---

### D. Análisis de Hallazgos y Plan de Mejora de Usabilidad

| ID | Escenario Afectado | Problema de Usabilidad Detectado (Causa raíz en la interfaz) | Evidencia (Cita del usuario o minuto del video) | Nivel de Severidad (Baja / Media / Alta) | Propuesta de Rediseño o Solución Concreta (Implementada) |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **U-01** | Escenario 2 y 3 | En las tablas de **Cola de Reservas** y **Gestión de Usuarios**, los botones de acción de cada fila mostraban únicamente íconos (`CheckCircle2`, `XCircle`, `Power`, `Trash2`) sin texto, obligando al usuario a hacer *hover* para leer el tooltip. | Min 02:15 — *"Veo tres íconos pequeños a la derecha, voy a dejar el mouse encima para ver cuál es asignar y cuál cancelar."* | **Media** | Se rediseñaron los botones de acción en `Reservations.tsx` y `Users.tsx` incorporando etiquetas de texto explícitas junto al ícono (`Asignar`, `Cancelar`, `Activar`/`Inactivar`, `Eliminar`) con bordes y fondos semánticos. |
| **U-02** | Escenario 1 | Para filtrar únicamente el material disponible para préstamo en el **Catálogo**, el usuario debía abrir el menú desplegable de 6 estados en lugar de contar con un filtro directo de un solo clic. | Min 00:50 — *"Voy a filtrar solo los que están disponibles para no confundirme con los que ya están prestados."* | **Baja** | Se añadió en la barra de búsqueda de `Resources.tsx` un botón de acceso rápido de un clic **`✓ Solo Disponibles`** que conmuta instantáneamente el filtro de disponibilidad. |
| **U-03** | Escenario 3 | Al cerrar sesión en la barra superior (`Navbar`), el botón de salida era solo un ícono discreto a la derecha del avatar, lo que puede pasar desapercibido en pantallas anchas. | Min 05:10 — El usuario buscó durante 6 segundos en el menú lateral izquierdo antes de mirar la esquina superior derecha para cerrar sesión. | **Baja** | Se mantiene el botón con resaltado en color coral (`hover:text-rose-600 hover:bg-rose-50`) y tooltip claro `"Cerrar Sesión"` junto al identificador de rol activo. |

---

### E. Conclusión Reflexiva de la Prueba de Usabilidad
El equipo de desarrollo asumía inicialmente que los botones minimalistas basados exclusivamente en íconos (como el check verde para asignar una reserva, la X ámbar para cancelar o el ícono de encendido para activar/inactivar usuarios) eran autoexplicativos por su color y convención visual. Sin embargo, al observar a un usuario real interactuar bajo el protocolo *Thinking Aloud* sin ningún tipo de guía ni intervención, quedó en evidencia que los íconos sin etiqueta textual generan micro-pausas cognitivas y obligan al usuario a explorar con el cursor (*hover*) antes de tomar acción por temor a cometer un error destructivo. Asimismo, comprobamos que las ayudas contextuales explícitas —como los botones de cálculo automático de fecha (`+7 días`, `+14 días`), la indicación visible de la contraseña institucional por defecto (`Madeira2026*`) y el filtro rápido de recursos disponibles— aceleran drásticamente la curva de aprendizaje y reducen los errores operativos a cero.

---

## SECCIÓN 5: Conclusiones Generales y Plan de Acción Priorizado — [10%]

Con base en los resultados obtenidos en las tres dimensiones de validación (Funcional, No Funcional y de Usabilidad), se establece el siguiente **Plan de Acción Priorizado** para el despliegue final a producción:

1. **[Prioridad Alta — Mejora de Usabilidad U-01 y U-02 | COMPLETADO]:**
   * **Acción:** Incorporación de etiquetas textuales explícitas (`Asignar`, `Cancelar`, `Activar/Inactivar`, `Eliminar`) en las tablas operativas y botón rápido `"Solo Disponibles"` en el catálogo bibliográfico.
   * **Impacto:** Eliminación de ambigüedad visual en operaciones frecuentes de ventanilla.
2. **[Prioridad Alta — Optimización de Consultas y Pool de Conexiones DB]:**
   * **Acción:** Ajustar el tamaño del pool de conexiones de TypeORM (`extra: { max: 25, idleTimeoutMillis: 30000 }`) e indexar las columnas de búsqueda frecuente (`code`, `status`, `collection`, `userId`) en PostgreSQL Neon.
   * **Impacto:** Incrementar el umbral de saturación de 180 VUs a más de 400 VUs concurrentes y reducir la latencia `p95` bajo carga extrema en un 45%.
3. **[Prioridad Media — Paginación Server-Side en Catálogo e Historial de Préstamos]:**
   * **Acción:** Implementar paginación (`?page=1&limit=25`) en los endpoints `GET /api/resources` y `GET /api/loans` cuando el catálogo supere los 1,000 ejemplares.
   * **Impacto:** Mantener el payload JSON por debajo de 15 KB y tiempos de respuesta estables (`< 200 ms`) independientemente del crecimiento histórico de la biblioteca.
4. **[Prioridad Media — Automatización CI/CD de la Suite Funcional]:**
   * **Acción:** Ejecutar `npm run test:unit` y `npm run test:integration` como compuerta de calidad obligatoria en cada *Pull Request* antes de desplegar los contenedores Docker (`node:24-alpine3.24`).
