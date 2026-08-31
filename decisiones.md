# Decisiones — TP1

## 1. Por qué Git no pudo resolver el conflicto solo — y qué habría tenido que pasar para que nunca apareciera

Git no pudo resolver el conflicto automáticamente porque dos ramas distintas modificaban la misma línea del archivo `README.md` de forma diferente.

## 2. Qué problemas encontraste y cómo los solucionaste. Los tropiezos bien contados valen más que un camino perfecto: son los que demuestran que entendiste

Uno de los problemas que encontré fue que GitHub rechazaba mis primeros intentos de `push` porque los commits estaban usando mi correo privado de la universidad. GitHub tenía habilitada la opción de bloquear pushes que expusieran ese correo.

Lo solucioné configurando Git para utilizar la dirección privada `noreply` proporcionada por GitHub y modificando el autor del commit antes de volver a realizar el push.

## 3. Declaración de uso de IA: qué partes hiciste con ayuda de inteligencia artificial y cómo verificaste lo que te devolvió (§ Uso de IA del enunciado)

Utilicé ChatGPT como asistencia durante la realización del TP, principalmente para seguir la guía paso a paso, entender los comandos de Git, interpretar los errores que aparecieron y verificar cómo configurar correctamente el repositorio y las protecciones.

Verifiqué las indicaciones comparándolas con la guía oficial del TP y comprobando en GitHub y en la terminal que cada paso tuviera el resultado esperado.

# Decisiones - TP1 

## TP2 — Contenedores

### Elección de la aplicación

Para el trabajo práctico se utilizó la aplicación **Los Santos Auto Market**, desarrollada durante la cursada.

La aplicación funciona como un catálogo de vehículos, permitiendo consultar autos disponibles en distintas concesionarias, realizar búsquedas, aplicar filtros, visualizar detalles de cada vehículo y contactar al vendedor.

Se eligió esta aplicación porque permite trabajar durante el resto de la materia con una arquitectura completa compuesta por frontend, backend y base de datos.

---

### Arquitectura utilizada

La aplicación está compuesta por tres servicios principales:

- **Frontend:** React + Vite
- **Backend:** ASP.NET Core 8
- **Base de datos:** PostgreSQL 16

El frontend se sirve mediante **Nginx**, que también actúa como reverse proxy para redirigir las solicitudes realizadas a `/api` hacia el backend.

La comunicación dentro de Docker Compose se realiza utilizando los nombres de los servicios:

```text
frontend → backend:8080 → db:5432
```

---

### Uso de Docker Compose

Se decidió utilizar un único archivo `docker-compose.yml` en la raíz del repositorio para administrar todos los servicios de la aplicación.

Los servicios definidos son:

- `frontend`
- `backend`
- `db`

Esto permite iniciar todo el sistema mediante un único comando:

```bash
docker compose up --build
```

---

### Dockerfile del backend

El backend utiliza un Dockerfile multi-stage.

La etapa de compilación utiliza:

```text
mcr.microsoft.com/dotnet/sdk:8.0
```

Esta imagen contiene las herramientas necesarias para restaurar dependencias y compilar el proyecto.

La etapa final utiliza:

```text
mcr.microsoft.com/dotnet/aspnet:8.0
```

La decisión de utilizar una imagen de runtime separada permite evitar incluir el SDK completo en la imagen final.

Como resultado, la imagen final del backend ocupa aproximadamente 334 MB frente a aproximadamente 1.2 GB de la imagen utilizada para compilar.

---

### Dockerfile del frontend

El frontend también utiliza un Dockerfile multi-stage.

La etapa de compilación utiliza:

```text
node:22-alpine
```

para instalar las dependencias y ejecutar el build de Vite.

La etapa final utiliza:

```text
nginx:alpine
```

Nginx sirve los archivos estáticos generados por Vite y redirige las solicitudes `/api` hacia el backend.

Esta separación permite que Node.js y las herramientas de compilación no estén presentes en la imagen final.

La imagen final del frontend ocupa aproximadamente 97.9 MB frente a aproximadamente 232 MB de la imagen utilizada para compilar.

---

### Persistencia de PostgreSQL

Para PostgreSQL se configuró un volumen Docker:

```text
postgres_data
```

La decisión de utilizar un volumen permite que los datos sobrevivan a la eliminación y recreación de los contenedores.

Se comprobó que:

```bash
docker compose down
docker compose up
```

mantiene los datos.

En cambio:

```bash
docker compose down -v
```

elimina también el volumen.

Al volver a iniciar la aplicación después de eliminar el volumen, Entity Framework Core aplica automáticamente las migraciones y genera nuevamente los datos iniciales.

---

### Healthcheck de PostgreSQL

Se configuró un healthcheck utilizando:

```text
pg_isready
```

El backend utiliza:

```text
depends_on
```

con la condición:

```text
service_healthy
```

Esto permite que el backend espere hasta que PostgreSQL realmente esté disponible antes de intentar conectarse.

---

### Variables de entorno y secretos

Las credenciales utilizadas por PostgreSQL se configuraron mediante variables de entorno.

El archivo:

```text
.env
```

contiene los valores utilizados localmente y no se versiona.

También se agregó:

```text
.env.example
```

para documentar las variables necesarias sin publicar credenciales reales.

---

### GitHub Container Registry

Se eligió **GitHub Container Registry (GHCR)** para publicar las imágenes debido a su integración directa con GitHub.

Las imágenes se publicaron utilizando versionado semántico:

```text
ghcr.io/2320413/los-santos-auto-market-backend:v0.1.0
ghcr.io/2320413/los-santos-auto-market-frontend:v0.1.0
```

Ambos packages fueron configurados como públicos.

También se creó:

```text
docker-compose.registry.yml
```

Este archivo permite iniciar la aplicación directamente desde las imágenes publicadas, sin necesidad de realizar un build local.

---

### Problemas encontrados y soluciones

#### Conexión del backend a PostgreSQL

Inicialmente el backend intentaba conectarse a:

```text
localhost:5432
```

Esto funcionaba al ejecutar el backend directamente desde Windows, pero fallaba al ejecutarlo dentro de Docker.

Dentro de un contenedor, `localhost` representa al propio contenedor y no a PostgreSQL.

Se solucionó utilizando el nombre del servicio de Docker Compose:

```text
Host=db
```

De esta manera el backend puede resolver automáticamente el contenedor de PostgreSQL a través de la red interna de Docker Compose.

#### Inicio del backend antes que PostgreSQL

Otra posibilidad era que el backend intentara conectarse antes de que PostgreSQL terminara de iniciar.

Para evitarlo se agregó un healthcheck a PostgreSQL y se configuró el backend para depender de que el servicio `db` se encuentre healthy.

#### Migraciones al iniciar desde una base vacía

Al ejecutar:

```bash
docker compose down -v
```

la base de datos se eliminaba completamente.

Para permitir que una instalación limpia funcione automáticamente, se agregó:

```csharp
await db.Database.MigrateAsync();
```

al inicio del backend.

De esta forma Entity Framework Core crea o actualiza automáticamente la estructura de la base de datos.

#### Comunicación frontend-backend

Durante el desarrollo el frontend realizaba solicitudes directamente a:

```text
http://localhost:5147/api/vehiculos
```

Esto no resultaba adecuado dentro de Docker.

Se modificó el frontend para utilizar:

```text
/api/vehiculos
```

y Nginx se configuró como reverse proxy hacia:

```text
http://backend:8080
```

Esto evita que el frontend dependa de una URL específica del backend.

#### Publicación en GHCR

Durante el primer intento de publicación, GHCR respondió con:

```text
denied
```

El problema estaba relacionado con la autenticación y los permisos del token utilizado.

Se volvió a iniciar sesión en GHCR utilizando un Personal Access Token con permisos para packages y posteriormente las imágenes pudieron publicarse correctamente.

---

### Uso de Inteligencia Artificial

Se utilizó ChatGPT como herramienta de apoyo durante el desarrollo del trabajo práctico.

Se utilizó principalmente para:

- comprender conceptos de Docker y Docker Compose;
- diseñar los Dockerfiles multi-stage;
- configurar Nginx como reverse proxy;
- analizar errores de conexión entre contenedores;
- configurar persistencia mediante volúmenes;
- configurar GitHub Container Registry;
- documentar los pasos realizados.

Las configuraciones propuestas fueron ejecutadas y verificadas manualmente antes de incorporarlas al proyecto.
