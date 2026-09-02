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

## TP3 — Planificación y trazabilidad

### Duración del sprint
Se definió un sprint de 1 semana porque el ritmo de trabajo de la materia está organizado en entregas semanales. Esto permite mantener un alcance acotado y revisar el avance con frecuencia.

### Límite de trabajo en progreso
Se configuró un límite WIP de 2 en la columna In Progress. Como el proyecto es individual, se utilizó la regla de cantidad de personas + 1. Esto permite trabajar sobre una tarea y disponer de un margen para avanzar en otra si la primera queda bloqueada.

### Diagnóstico de una historia mal escrita
La historia "Como desarrollador quiero crear la tabla usuarios para guardar los datos" está mal planteada porque describe una tarea técnica y no un incremento de valor observable por un usuario.

Una mejor versión sería: "Como usuario quiero poder registrarme para acceder a funcionalidades personalizadas de la aplicación".

### Problemas encontrados y soluciones
Durante la configuración se detectó que GitHub CLI no estaba instalado, por lo que el práctico se realizó mediante la interfaz web de GitHub.

También se tuvo cuidado al crear la jerarquía de issues para que la historia quedara como sub-issue de la épica y las tareas como sub-issues de la historia.

Finalmente, se verificó la trazabilidad utilizando `Closes #8` en la descripción del Pull Request. Al mergear el PR, GitHub cerró automáticamente la tarea y el workflow del Project la movió a Done.

## TP4 — CI: Pipelines as Code

### Estructura del pipeline

El pipeline se dividió en dos jobs independientes: `build-backend` y `build-frontend`.

Se eligió esta estructura porque la aplicación tiene dos imágenes Docker diferentes, una para el backend y otra para el frontend. Los jobs pueden ejecutarse en paralelo porque ninguno depende del resultado del otro, lo que permite verificar ambas imágenes al mismo tiempo.

### Cache de capas

El pipeline utiliza el cache de GitHub Actions para reutilizar capas de Docker entre ejecuciones.

Se configuraron scopes separados:

- `scope=backend`
- `scope=frontend`

Esto evita que ambos builds utilicen el mismo espacio de cache y se sobrescriban entre sí.

En una segunda ejecución del mismo Pull Request se comprobó la reutilización de capas mediante la aparición de `CACHED` en los logs.

El cache es solamente una optimización. Si desaparece, el pipeline debe continuar funcionando correctamente, aunque tarde más porque deberá reconstruir las capas desde cero.

### Uso de Dockerfiles

El pipeline construye las imágenes utilizando los mismos Dockerfiles creados en el TP2.

Esto evita mantener dos definiciones diferentes del proceso de compilación. Si el workflow compilara directamente con comandos de .NET y Node, mientras que producción utilizara los Dockerfiles, ambos procesos podrían diferir con el tiempo.

De esta manera, el pipeline verifica exactamente el mismo proceso de construcción que se utilizará posteriormente para desplegar la aplicación.

### Problemas encontrados y soluciones

Se realizaron dos ejecuciones del pipeline para comprobar el funcionamiento del cache. En la segunda ejecución se verificó la aparición de `CACHED` tanto en el backend como en el frontend.

También se configuraron `build-backend` y `build-frontend` como status checks obligatorios de la rama `main`.

Para comprobar el funcionamiento del gate se introdujo intencionalmente un error de compilación en el backend mediante `using NoExiste;`. El job `build-backend` falló y GitHub bloqueó el merge del Pull Request. Luego se corrigió el error, el pipeline volvió a ejecutarse y ambos checks quedaron en verde.

Además, se comprobó la opción `Require branches to be up to date before merging` manteniendo un segundo Pull Request abierto. Después de modificar `main`, GitHub exigió actualizar esa rama y volver a ejecutar los checks antes de habilitar el merge.

### Uso de IA

Se utilizó ChatGPT como asistencia para interpretar la consigna, configurar el workflow de GitHub Actions, organizar los pasos de prueba del gate y redactar la documentación del práctico.

Las configuraciones propuestas fueron verificadas mediante ejecuciones reales de GitHub Actions, revisando los logs del cache, los status checks obligatorios y el comportamiento de las protecciones de la rama `main`.

### Uso de IA
Se utilizó ChatGPT como asistencia para interpretar la consigna, organizar los pasos del práctico, redactar descripciones de issues y revisar la configuración de GitHub Projects.

Cada resultado fue verificado manualmente observando el comportamiento real del repositorio, los issues, el tablero, los workflows y el Pull Request.
