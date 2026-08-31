# Ingeniería de Software III

Repositorio utilizado para los trabajos prácticos de Ingeniería de Software III.

---

## TP2 — Contenedores

### Los Santos Auto Market

Los Santos Auto Market es una aplicación web que permite consultar vehículos disponibles en diferentes concesionarias de Los Santos.

La aplicación permite actualmente:

- Visualizar vehículos disponibles.
- Buscar vehículos por nombre o marca.
- Filtrar vehículos por concesionaria.
- Consultar información detallada de cada vehículo.
- Marcar vehículos como favoritos.
- Contactar al vendedor mediante WhatsApp.

### Tecnologías utilizadas

La aplicación está compuesta por:

- **Frontend:** React + Vite
- **Backend:** ASP.NET Core 8
- **Base de datos:** PostgreSQL
- **ORM:** Entity Framework Core
- **Servidor web / Reverse Proxy:** Nginx
- **Contenedores:** Docker
- **Orquestación:** Docker Compose
- **Registry:** GitHub Container Registry (GHCR)

---

## Arquitectura

```text
Navegador
    |
    v
Frontend / Nginx
localhost:3000
    |
    | /api
    v
ASP.NET Core
backend:8080
    |
    v
PostgreSQL
db:5432
```

Los servicios se comunican dentro de la red creada automáticamente por Docker Compose.

Nginx sirve el frontend React y actúa como reverse proxy para las solicitudes realizadas a `/api`.

---

## Requisitos

Para ejecutar la aplicación solamente es necesario tener instalados:

- Docker
- Docker Compose

No es necesario instalar Node.js, .NET ni PostgreSQL localmente.

---

## Configuración de variables de entorno

Crear el archivo `.env` a partir del archivo de ejemplo:

```bash
cp .env.example .env
```

El archivo `.env.example` contiene las variables necesarias para PostgreSQL.

Ejemplo:

```env
POSTGRES_DB=lossantosautomarket
POSTGRES_USER=postgres
POSTGRES_PASSWORD=cambiar_esta_password
```

El archivo `.env` no se versiona en Git.

---

## Ejecutar desde el código fuente

Desde la raíz del repositorio ejecutar:

```bash
docker compose up --build
```

Docker Compose construirá y levantará los siguientes servicios:

- `frontend`
- `backend`
- `db`

Una vez iniciados los contenedores, la aplicación estará disponible en:

```text
http://localhost:3000
```

El backend también puede consultarse directamente mediante:

```text
http://localhost:8080/health
```

y:

```text
http://localhost:8080/api/vehiculos
```

Para detener los servicios:

```bash
docker compose down
```

---

## Persistencia de datos

PostgreSQL utiliza un volumen Docker llamado:

```text
postgres_data
```

Por lo tanto, ejecutar:

```bash
docker compose down
```

y posteriormente:

```bash
docker compose up
```

mantiene los datos almacenados en PostgreSQL.

Para eliminar también el volumen y los datos persistidos:

```bash
docker compose down -v
```

Al iniciar nuevamente la aplicación, Entity Framework Core aplica las migraciones automáticamente y recrea la estructura de la base de datos.

---

## Dockerfiles multi-stage

Tanto el frontend como el backend utilizan builds multi-stage.

### Backend

La primera etapa utiliza:

```text
mcr.microsoft.com/dotnet/sdk:8.0
```

para restaurar dependencias y compilar la aplicación.

La imagen final utiliza:

```text
mcr.microsoft.com/dotnet/aspnet:8.0
```

evitando incluir el SDK completo en producción.

### Frontend

La primera etapa utiliza:

```text
node:22-alpine
```

para instalar dependencias y generar el build de Vite.

La imagen final utiliza:

```text
nginx:alpine
```

para servir únicamente los archivos estáticos generados.

---

## Comparación de tamaños

El uso de builds multi-stage permite reducir el tamaño de las imágenes finales.

### Backend

```text
Imagen de build (.NET SDK 8): aproximadamente 1.2 GB
Imagen final backend:          aproximadamente 334 MB
```

La imagen final es aproximadamente un 72% más pequeña que la imagen utilizada para compilar.

### Frontend

```text
Imagen de build (Node 22 Alpine): aproximadamente 232 MB
Imagen final frontend:            aproximadamente 97.9 MB
```

La imagen final es aproximadamente un 58% más pequeña que la imagen utilizada para compilar.

---

## Imágenes publicadas

Las imágenes de la aplicación se encuentran publicadas en GitHub Container Registry con versionado semántico.

### Backend

```text
ghcr.io/2320413/los-santos-auto-market-backend:v0.1.0
```

### Frontend

```text
ghcr.io/2320413/los-santos-auto-market-frontend:v0.1.0
```

Ambas imágenes son públicas.

---

## Ejecutar utilizando las imágenes del Registry

Existe un segundo archivo de Compose:

```text
docker-compose.registry.yml
```

Este archivo utiliza directamente las imágenes publicadas en GHCR en lugar de construirlas desde el código fuente.

Ejecutar:

```bash
docker compose -f docker-compose.registry.yml up
```

La aplicación estará disponible nuevamente en:

```text
http://localhost:3000
```

Para detenerla:

```bash
docker compose -f docker-compose.registry.yml down
```

Para eliminar también el volumen:

```bash
docker compose -f docker-compose.registry.yml down -v
```

---

## Servicios

| Servicio | Tecnología | Puerto |
|---|---|---:|
| Frontend | React + Vite + Nginx | 3000 |
| Backend | ASP.NET Core 8 | 8080 |
| Base de datos | PostgreSQL 16 | Interno 5432 |

---

## Healthcheck

PostgreSQL posee un `healthcheck` configurado mediante:

```text
pg_isready
```

El backend utiliza `depends_on` con la condición `service_healthy`, por lo que espera a que PostgreSQL esté disponible antes de iniciar.

El backend también expone:

```text
GET /health
```

para comprobar que la aplicación se encuentra funcionando.

---

## Estructura relacionada con Docker

```text
ingsoft3-tp01/
│
├── backend/
│   └── LosSantosAutoMarket.Api/
│       ├── Dockerfile
│       └── .dockerignore
│
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── nginx.conf
│
├── .env.example
├── docker-compose.yml
└── docker-compose.registry.yml
```