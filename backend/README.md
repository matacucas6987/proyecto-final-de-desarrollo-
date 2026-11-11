# Sistema de Gestión Bibliotecaria - Universidad de Madeira

Arquitectura base, esqueleto funcional y boilerplate modular para el Sistema de Gestión Bibliotecaria de la Universidad de Madeira.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS + Lucide Icons
- **Backend:** NestJS 10 + TypeScript (Arquitectura modular por capas)
- **ORM / Base de Datos:** TypeORM con driver `pg` conectado a **PostgreSQL en Neon** con SSL (`rejectUnauthorized: false`)
- **Contenedores:** Docker & Docker Compose basados en `node:24-alpine3.24`

---

## 📁 Estructura del Proyecto

```text
desarrollo/
├── .gitignore                     # Exclusiones de control de versiones
│
├── backend/                       # API REST NestJS
│   ├── .env                        # Configuración activa del entorno
│   ├── .env.example                # Plantilla de variables de entorno
│   ├── docker-compose.yml          # Orquestación de backend (:3000) y frontend (:5173)
│   ├── README.md                   # Documentación del proyecto
│   ├── Dockerfile                 # Contenedor backend (node:24-alpine3.24)
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── src/
│       ├── config/
│       │   └── database.config.ts # Conexión a Neon PostgreSQL con SSL
│       ├── common/                # Capa transversal
│       │   ├── filters/           # AllExceptionsFilter
│       │   ├── guards/            # RolesGuard
│       │   ├── interceptors/      # TransformInterceptor
│       │   └── decorators/        # @Roles decorator
│       ├── modules/
│       │   ├── users/             # Gestión de Estudiantes, Profesores, Bibliotecarios
│       │   ├── resources/         # 6 Colecciones (General, Reserva, Referencia, Hemeroteca, Mapoteca, Tecnoteca)
│       │   ├── loans/             # Gestión de préstamos
│       │   ├── reservations/      # Cola de espera (General y Tabletas)
│       │   ├── renewals/          # Renovaciones de recursos
│       │   └── fines/             # Control de multas y moras
│       ├── app.module.ts          # Módulo raíz
│       └── main.ts                # Bootstrap con CORS y ValidationPipe
│
└── frontend/                      # Single Page Application (React + Vite)
    ├── Dockerfile                 # Contenedor frontend (node:24-alpine3.24 con --host)
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── api/                   # Cliente Axios base (http://localhost:3000/api)
        ├── services/              # Métodos tipados para cada módulo
        ├── types/                 # Interfaces TypeScript espejo del backend
        ├── components/
        │   ├── common/            # Badge, Card, Button
        │   └── layout/            # Navbar, Sidebar, MainLayout
        ├── pages/
        │   ├── Dashboard.tsx      # Resumen general y estado de conexión
        │   ├── Resources.tsx      # Catálogo de las 6 colecciones y estados
        │   ├── Loans.tsx          # Préstamos y renovaciones
        │   ├── Reservations.tsx   # Cola de espera (general y tecnoteca)
        │   ├── Fines.tsx          # Control de multas y estados
        │   └── Users.tsx          # Directorio institucional
        ├── App.tsx                # Enrutador principal
        ├── main.tsx               # Punto de entrada
        └── index.css              # Directivas de estilos
```

---

## 🚀 Despliegue con Docker Compose

Para compilar e iniciar los servicios con recarga en caliente:

```bash
cd backend
docker compose up --build
```

### Servicios expuestos:
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3000/api](http://localhost:3000/api)

---

## 🗄️ Base de Datos Neon (PostgreSQL)

La conexión está configurada en `src/config/database.config.ts`:

- **SSL:** Activado con `{ rejectUnauthorized: false }`.
- **Sincronización:** `synchronize: true` para generar automáticamente el esquema de tablas en el entorno de desarrollo.
- **Colecciones soportadas:**
  1. `General` (Libros)
  2. `Reserva` (Libros académicos y asignaturas)
  3. `Referencia` (Diccionarios y enciclopedias)
  4. `Hemeroteca` (Revistas e impresos periódicos)
  5. `Mapoteca` (Mapas y material cartográfico)
  6. `Tecnoteca` (Laptops y tabletas)

---

## 🔑 Estados del Sistema

### Recursos:
- `Disponible`
- `Prestado`
- `Reservado`
- `Perdido`
- `Dado de baja`

### Préstamos:
- `ACTIVO`
- `DEVUELTO`
- `VENCIDO`

### Multas:
- `PENDIENTE`
- `PAGADA`
- `CONDONADA`
