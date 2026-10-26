# Enlaces del TP7

## Packages públicos en GHCR

- Backend: <https://github.com/2320413/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-backend>
- Frontend: <https://github.com/2320413/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-frontend>

### QA

- Frontend: <https://los-santos-front-qa.onrender.com>
- API: <https://los-santos-api-qa.onrender.com>

### PROD

- Frontend: <https://los-santos-front-prod.onrender.com>
- API: <https://los-santos-api-prod.onrender.com>

### Evidencia del gate en rojo

- Corrida: <https://github.com/2320413/ingsoft3-tp01/actions/runs/39892631696>
- Commit: `a257da9b095f8864f24ddbb4ac7fbde683b8ffa2`
- Resultado de integración: verde.
- Resultado E2E: rojo.
- `deploy-prod`: skipped, por lo que producción no se ejecutó.
- Artifact de integración `playwright-report-integracion`: <https://github.com/2320413/ingsoft3-tp01/actions/runs/39892631696/artifacts/12475188711>
- Artifact E2E `playwright-report-e2e`: <https://github.com/2320413/ingsoft3-tp01/actions/runs/39892631696/artifacts/12476055505>

### Corrida verde final

- Corrida: <https://github.com/2320413/ingsoft3-tp01/actions/runs/39894368868>
- Commit desplegado en PROD: `238775fb2aa8f3b6b503db2d685b77b37fb5492a`
- Resultado: build backend, build frontend, deploy QA, integración, E2E y deploy PROD en verde.

### Release

- v7.0.0: <https://github.com/2320413/ingsoft3-tp01/releases/tag/v7.0.0>
- Commit de la release: `238775fb2aa8f3b6b503db2d685b77b37fb5492a`

## Decisiones — TP1

## 1. Por qué Git no pudo resolver el conflicto solo — y qué habría tenido que pasar para que nunca apareciera

Git no pudo resolver el conflicto automáticamente porque dos ramas distintas modificaban la misma línea del archivo `README.md` de forma diferente. El conflicto no habría aparecido si ambas ramas hubieran modificado líneas distintas, o si una de las ramas hubiera incorporado previamente los cambios de la otra antes de modificar esa misma línea.

## 2. Qué problemas encontraste y cómo los solucionaste. Los tropiezos bien contados valen más que un camino perfecto: son los que demuestran que entendiste

Uno de los problemas que encontré fue que GitHub rechazaba mis primeros intentos de `push` porque los commits estaban usando mi correo privado de la universidad. GitHub tenía habilitada la opción de bloquear pushes que expusieran ese correo.

Lo solucioné configurando Git para utilizar la dirección privada `noreply` proporcionada por GitHub y modificando el autor del commit antes de volver a realizar el push.

## 3. Declaración de uso de IA: qué partes hiciste con ayuda de inteligencia artificial y cómo verificaste lo que te devolvió (§ Uso de IA del enunciado)

Utilicé ChatGPT como asistencia durante la realización del TP, principalmente para seguir la guía paso a paso, entender los comandos de Git, interpretar los errores que aparecieron y verificar cómo configurar correctamente el repositorio y las protecciones.

Verifiqué las indicaciones comparándolas con la guía oficial del TP y comprobando en GitHub y en la terminal que cada paso tuviera el resultado esperado.

## TP2 — Contenedores

### Elección de la aplicación

Para el trabajo práctico se utilizó la aplicación **Los Santos Auto Market**, desarrollada durante la cursada.

Se eligió esta aplicación porque cumple con los criterios definidos para la app del semestre:

1. **Buildea y corre localmente:** la aplicación puede ejecutarse en la máquina de desarrollo con frontend, backend y base de datos funcionando.

2. **Permite incorporar tests:** el backend y el frontend tienen lógica suficiente para agregar pruebas automáticas en los próximos trabajos prácticos.

3. **El código es comprensible y modificable:** conozco la estructura de la aplicación y puedo realizar cambios tanto en el frontend como en el backend y la configuración de la base de datos.

4. **Tiene un tamaño adecuado:** la aplicación tiene una complejidad suficiente para trabajar durante la materia sin ser innecesariamente grande. Incluye catálogo de vehículos, búsquedas, filtros, detalles y comunicación con el backend y la base de datos.

Además, cumple con el requisito mínimo de tener **frontend, backend y base de datos**, utilizando React + Vite, ASP.NET Core 8 y PostgreSQL.
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

## TP5 — Calidad automatizada: tests, coverage y quality gates

### Lógica elegida para los tests

En el backend se eligió testear la lógica de filtrado del catálogo de vehículos, ya que un error en esta parte afecta directamente los resultados que recibe el usuario al buscar vehículos.

Se extrajo esta lógica a `VehiculoService` y se probaron reglas distintas: filtrado por categoría, filtrado por concesionaria, búsqueda por nombre, búsqueda por marca, precio mínimo, precio máximo y ordenamiento por precio.

Los tests del backend se implementaron con xUnit. Se incluyó un test parametrizado mediante `[Theory]` y `[InlineData]`, casos de borde para los límites de precio y un test con mock del repositorio.

En el frontend se extrajo lógica que antes estaba dentro de `App.jsx` a funciones independientes en `src/lib`. Se probaron la construcción de la URL de consulta de vehículos, el filtrado de favoritos, la comunicación con la API y posteriormente la generación de mensajes y URLs de WhatsApp.

Los tests del frontend se implementaron con Vitest sin utilizar DOM, incluyendo `it.each`, casos de error y mocks mediante `vi.fn()`.

### Refactor realizado para poder utilizar mocks

En el backend la consulta a Entity Framework estaba realizada directamente desde el endpoint de `Program.cs`, lo que dificultaba probar la lógica de forma aislada.

Se creó la interfaz `IVehiculoRepository`, su implementación `VehiculoRepository` y el servicio `VehiculoService`. El repositorio se inyecta mediante constructor y se registra con el contenedor de inyección de dependencias de ASP.NET Core.

Esto permitió reemplazar el repositorio real por un `Mock<IVehiculoRepository>` durante los tests. En uno de los tests se verifica además que `ObtenerVehiculos()` sea invocado exactamente una vez.

En el frontend se modificó `cargarVehiculos` para recibir el cliente HTTP desde afuera, utilizando `fetch` como valor por defecto. Durante los tests se reemplaza esta dependencia por `vi.fn()`, evitando realizar solicitudes reales y permitiendo verificar la URL con la que se invoca al cliente.

### Coverage del backend

Luego de medir inicialmente todo el proyecto, el backend mostraba aproximadamente 17.1% de line coverage. Ese número estaba fuertemente afectado por código de arranque, migraciones y clases de infraestructura que no corresponden a las reglas de negocio elegidas para los unit tests.

Se excluyeron de la métrica:

- `Program`: contiene principalmente arranque, configuración, endpoints y seed inicial.
- `Data`: contiene el `AppDbContext`.
- `Models`: contiene las clases de datos.
- `Migrations`: código generado por Entity Framework Core.

No se excluyó `VehiculoRepository`, ya que es código propio del proyecto.

Con estas exclusiones el backend obtuvo:

- **Line coverage: 83.33%**
- **Branch coverage: 100%**

Se definió un umbral obligatorio de **80% sobre line coverage**. Se eligió porque la cobertura real se encontraba en 83.33%, por lo que permite detectar una disminución relevante sin establecer un valor artificialmente superior al estado real del proyecto.

Aunque el threshold del backend se aplica sobre líneas, también se publica y controla visualmente el branch coverage.

### Coverage del frontend

El frontend obtuvo, con la suite completa:

- **Line coverage: 100%**
- **Branch coverage: 100%**
- **Function coverage: 100%**

Se definieron thresholds de:

- **80% line coverage**
- **80% branch coverage**

La medición incluye explícitamente `src/lib/**/*.js`. Esta decisión es importante porque hace que un archivo nuevo dentro de la carpeta de lógica entre en la medición incluso si todavía ningún test lo importa.

No se incluyen `App.jsx`, `main.jsx`, CSS ni código puramente de presentación porque en este TP se decidió medir con unit tests la lógica extraída a `src/lib`. La interfaz completa se encuentra fuera del alcance de estos unit tests sin DOM.

### Por qué un coverage alto no garantiza calidad

Un porcentaje alto solamente indica qué código fue ejecutado durante los tests, no que los tests verifiquen correctamente su comportamiento.

Por ejemplo, un test podría ejecutar `crearUrlWhatsApp("Hola")` y no realizar ningún `expect` sobre el resultado. Ese test recorrería las líneas de la función y aumentaría el coverage, pero una URL incorrecta podría seguir pasando inadvertida.

Por eso se utilizaron asserts sobre resultados, casos de borde, errores y verificaciones de interacción con mocks, en lugar de buscar solamente aumentar el porcentaje.

### Demostración del quality gate

Para demostrar el funcionamiento del gate se creó el Pull Request #21.

En el primer commit se agregó `contacto.js` con nueva lógica de contacto por WhatsApp sin agregar sus tests.

La aplicación continuaba compilando correctamente y los **8 tests existentes seguían pasando**, pero el frontend quedó con:

- **Line coverage: 65.21%**
- **Branch coverage: 61.11%**

Ambos valores quedaron por debajo del threshold de 80%, por lo que el required check `CI / build-frontend` quedó en rojo y GitHub bloqueó el merge.

Corrida roja por threshold:

https://github.com/2320413/ingsoft3-tp01/actions/runs/39373132248

Pull Request con la secuencia rojo → tests → verde → merge:

https://github.com/2320413/ingsoft3-tp01/pull/21

Para corregirlo se agregó `contacto.test.js`, cubriendo la generación de mensajes de venta y compra, validación de vehículo inexistente, generación de URL, número alternativo y mensajes vacíos.

Después de agregar esos tests, la suite del frontend pasó de 8 a 15 ejecuciones y volvió a obtener 100% de line y branch coverage. Los dos required checks quedaron verdes y el Pull Request pudo mergearse.

Corrida verde con coverage y reportes:

https://github.com/2320413/ingsoft3-tp01/actions/runs/39374809042

### Segundo Pull Request bloqueado

Se creó además el Pull Request #22, que agrega `financiacion.js` sin tests.

Los **15 tests existentes pasan**, pero el nuevo archivo queda en 0% de cobertura. El resultado total es:

- **Line coverage: 62.16%**
- **Branch coverage: 60%**

Por ese motivo `CI / build-frontend` permanece en rojo y el merge continúa bloqueado.

Este Pull Request se deja intencionalmente abierto y sin corregir hasta la defensa para demostrar que el quality gate sigue vigente.

https://github.com/2320413/ingsoft3-tp01/pull/22

### Ejercicio del camino sin cubrir

Al observar el primer reporte sin exclusiones se detectó una rama sin cubrir en `Program.cs`, en la línea que contiene:

```csharp
if (!await db.Vehiculos.AnyAsync())
```

Esta condición decide si se deben insertar los vehículos iniciales.

Un caso concreto que recorrería el camino `false` sería iniciar la aplicación con una base de datos que ya contenga al menos un vehículo. En ese caso `AnyAsync()` devolvería `true`, la negación sería `false` y no se ejecutaría el seed.

Se decidió no agregar un unit test para esta rama porque pertenece al código de inicialización y seed de `Program.cs`, que fue excluido de la métrica de unit tests. Su comportamiento corresponde más a una prueba de integración que a las reglas de negocio aisladas que se eligieron para este TP.

### Problemas encontrados y soluciones

Uno de los primeros problemas fue que el coverage bruto del backend era solamente 17.1%, aunque `VehiculoService` tenía 100% de cobertura. El motivo era que el reporte incluía `Program`, migraciones, DbContext y otras clases sin unit tests. Se solucionó definiendo exclusiones explícitas y utilizando las mismas exclusiones para el reporte y para el quality gate.

También fue necesario separar la lógica que estaba directamente en `Program.cs` para poder probarla y mockear el acceso a datos. Esto se resolvió introduciendo `VehiculoService`, `IVehiculoRepository` y `VehiculoRepository`.

En el frontend se extrajo lógica de `App.jsx` a `src/lib` para poder realizar unit tests sin DOM.

Otro problema fue que al ejecutar inicialmente `npm test -- --run --coverage` en Windows Vitest continuaba en modo watch. Para realizar la medición local se utilizó directamente `npx vitest run --coverage`.

También se comprobó que los paquetes `vitest` y `@vitest/coverage-v8` tuvieran exactamente la misma versión, `5.0.5`, para evitar incompatibilidades.

Finalmente se extendieron los Dockerfiles con una etapa `test`, manteniendo las etapas finales de producción separadas, y se modificó el workflow existente para ejecutar los tests, publicar los reportes y aplicar los thresholds dentro de los mismos required checks utilizados desde el TP4.

### Uso de Inteligencia Artificial

Se utilizó ChatGPT como herramienta de apoyo durante el TP5 para interpretar la guía, organizar la implementación paso a paso, proponer la separación de lógica testeable, preparar ejemplos de unit tests, analizar los resultados de coverage, configurar Docker y GitHub Actions y redactar la documentación.

### TP6

**GHCR**
- Backend: https://github.com/2320413/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-backend
- Frontend: https://github.com/2320413/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-frontend

**Evidencia de CI/CD**
- PR con login al registry omitido: https://github.com/2320413/ingsoft3-tp01/actions/runs/39529162136
- `main` con publicación de imágenes: https://github.com/2320413/ingsoft3-tp01/actions/runs/39535121622

**QA**
- Frontend: https://los-santos-front-qa.onrender.com
- API: https://los-santos-api-qa.onrender.com

**PROD**
- Frontend: https://los-santos-front-prod.onrender.com
- API: https://los-santos-api-prod.onrender.com

**Release**
- v6.0.0: https://github.com/2320413/ingsoft3-tp01/releases/tag/v6.0.0

# TP6 - CD, environments y deployment

## Publicación de imágenes

Se configuró GitHub Actions para publicar imágenes de backend y frontend en GHCR usando tags asociados al SHA del commit.

La publicación ocurre solamente en `push` a `main` y después de que tests, cobertura y builds hayan pasado correctamente. En Pull Requests se ejecutan las verificaciones, pero no se hace login ni push al registry.

También se comprobó que ambos paquetes son públicos mediante `docker pull` sin autenticación.

---

## Ambientes QA y PROD

Se configuraron dos ambientes separados:

- QA: `los-santos-api-qa`, `los-santos-front-qa` y base Neon `app_qa`.
- PROD: `los-santos-api-prod`, `los-santos-front-prod` y base Neon `app_prod`.

Los cuatro servicios de Render tienen Auto-Deploy desactivado. Los deploys se realizan mediante Deploy Hooks desde GitHub Actions.

---

## Configuración externa

La configuración específica de cada ambiente quedó fuera de las imágenes.

El backend obtiene la conexión mediante:

`ConnectionStrings__Default`

El frontend usa un template dinámico de Nginx con:

- `BACKEND_URL`
- `DNS_RESOLVER`

Esto permite usar la misma aplicación en QA y PROD cambiando solamente variables de entorno.

Inicialmente Render falló porque Nginx apuntaba al hostname `backend`, válido en Docker Compose pero no en Render. Se resolvió utilizando configuración dinámica.

---

## Deploy automático a QA

El job `deploy-qa` depende de `build-backend` y `build-frontend`, se ejecuta solo en `main` y utiliza el GitHub Environment `qa`.

Los hooks reciben:

`ref=$GITHUB_SHA`

Después se ejecutan smoke tests sobre:

- `/health`
- `/api/vehiculos`
- `/`

Se agregaron reintentos porque los servicios gratuitos de Render pueden tardar en iniciar.

---

## Producción con aprobación manual

Se creó el GitHub Environment `production` con reviewer obligatorio.

El job `deploy-prod` depende de `deploy-qa`, por lo que producción solo puede continuar después de que QA esté verde y una persona apruebe el deployment.

Por esto la solución implementa **Continuous Delivery** y no Continuous Deployment: QA se despliega automáticamente, pero PROD requiere aprobación humana.

También se probó un rechazo real, comprobando que el cambio llegaba a QA pero PROD permanecía en la versión anterior. Luego se realizó una aprobación correcta y el cambio llegó a producción.

Se agregó además:

```yaml
concurrency:
  group: deploy-prod
  cancel-in-progress: false
```

para evitar deploys simultáneos de producción.

---

### Rechazo real de producción

Se realizó un rechazo real del deployment de producción en la corrida:

https://github.com/2320413/ingsoft3-tp01/actions/runs/39551271322

El cambio `Trending - QA Gate Test` había llegado correctamente a QA, pero se rechazó la promoción a producción con el siguiente motivo:

> Verifiqué que el cambio "Trending - QA Gate Test" llegó correctamente a QA. Rechazo esta promoción para comprobar que el gate humano mantiene PROD en la versión anterior mientras reviso el cambio antes de liberarlo.

Como resultado, QA quedó actualizado pero PROD permaneció en la versión anterior. Esto permitió comprobar que el gate humano puede detener una promoción aunque las verificaciones automáticas anteriores hayan terminado correctamente.

## Limitación del smoke test

Los Deploy Hooks de Render responden antes de que el nuevo build haya terminado. Por eso un smoke test podría responder contra la versión anterior.

Durante el TP se verificó manualmente en Render el `Source` del deploy y se usaron cambios visibles antes de aprobar PROD.

Una mejora futura sería exponer el SHA desplegado en un endpoint y compararlo con `$GITHUB_SHA`.

---

## Release y rollback

Se creó el tag y release:

`v6.0.0`

apuntando al commit:

`f8e147e2aaff213b8cd79f2a82645e2a0dcf21a9`

Después se desplegó una versión posterior con el texto:

`Featured Vehicles - New Version`

y luego se realizó un rollback real a `v6.0.0` mediante los Deploy Hooks de PROD.

Render volvió a mostrar `f8e147e` como `Live` en backend y frontend, y el frontend volvió a mostrar:

`Featured Vehicles`

El rollback completo tardó aproximadamente **38 segundos**. Render informó aproximadamente **27.4 s** para backend y **36.3 s** para frontend.

El rollback de código no revierte automáticamente cambios destructivos de base de datos, por lo que en un sistema real las migraciones deberían ser compatibles entre versiones o tener un procedimiento específico de recuperación.

---

## Limitaciones y mejora futura

Actualmente CI publica imágenes verificadas en GHCR, pero Render reconstruye el servicio desde el SHA indicado en el Deploy Hook. Esto mantiene el commit correcto, pero no garantiza que PROD use exactamente la misma imagen inmutable publicada por CI.

Una mejora futura sería desplegar directamente la imagen verificada por digest.

Para un sistema real con mayores requisitos elegiría un esquema **Blue/Green**, ya que permite validar una versión nueva y volver rápidamente a la anterior. A cambio, requiere más infraestructura, control de tráfico y observabilidad.

---

## Uso de inteligencia artificial

Se utilizó ChatGPT como asistencia para interpretar la guía, revisar comandos, analizar errores de Docker, Nginx, GitHub Actions y Render, y documentar las decisiones tomadas.

Todos los cambios fueron ejecutados y verificados en el proyecto antes de considerarlos válidos.

Todas las propuestas fueron verificadas mediante ejecuciones reales de los tests, builds locales, contenedores Docker y corridas de GitHub Actions. También se comprobó manualmente el bloqueo y desbloqueo de los Pull Requests mediante los required checks.

## TP7 — Integración, E2E y build once deploy many

## Build once, deploy many

En el TP7 se modificó el mecanismo de despliegue para que QA y PROD utilicen las mismas imágenes construidas y verificadas por GitHub Actions.

Para cada `push` a `main`, CI publica dos imágenes en GHCR:

```text
ghcr.io/2320413/ingsoft3-tp01-backend:sha-<commit>
ghcr.io/2320413/ingsoft3-tp01-frontend:sha-<commit>
```

Los cuatro servicios de Render —API QA, frontend QA, API PROD y frontend PROD— fueron configurados como servicios basados en imágenes.

Los Deploy Hooks reciben el parámetro `imgURL` con el tag correspondiente al SHA del commit. De esta forma Render no vuelve a construir el código fuente, sino que despliega la imagen previamente creada por CI.

El flujo cumple así el principio **build once, deploy many**: una misma imagen se construye una sola vez y luego se promueve por los distintos ambientes.

---

## Tags de imagen

Se eligió utilizar tags de la forma:

```text
sha-<commit>
```

en lugar de `latest`.

Un SHA identifica de forma inequívoca el código que generó la imagen. En cambio, `latest` es mutable y puede terminar apuntando a una imagen distinta con el tiempo, lo que dificulta demostrar qué versión fue desplegada o realizar un rollback reproducible.

La release `v7.0.0` apunta al commit:

```text
238775fb2aa8f3b6b503db2d685b77b37fb5492a
```

El mismo SHA identifica las imágenes publicadas en GHCR y desplegadas en producción.

---

## Imagen configurada y versión desplegada en Render

La imagen configurada inicialmente en un servicio de Render no necesariamente representa la última versión desplegada.

Los Deploy Hooks permiten enviar un nuevo `imgURL`, por lo que el servicio puede pasar a ejecutar otra imagen sin modificar manualmente su configuración base.

Para verificar los despliegues se revisaron los Events de Render. Allí se observó que los despliegues fueron disparados mediante `Deploy Hook` y que backend y frontend utilizaron los tags `sha-<commit>` correspondientes.

Los packages de GHCR se configuraron como públicos y también se comprobó que las imágenes podían obtenerse sin autenticación.

---

## Limitación de los smoke tests

Un smoke test demuestra que un servicio está respondiendo, pero por sí solo no garantiza que esa respuesta corresponda exactamente a la nueva imagen que acaba de solicitarse.

Los Deploy Hooks de Render son asíncronos: el hook puede responder mientras Render todavía está realizando el deployment.

Por ese motivo el pipeline utiliza reintentos y espera a que QA esté disponible antes de comenzar las pruebas posteriores.

Además, la identificación de la versión desplegada se verificó mediante el SHA de la imagen y los Events de Render.

Esta diferencia es importante: comprobar que `/health` responde demuestra disponibilidad, mientras que comprobar el tag `sha-<commit>` permite relacionar el servicio desplegado con la imagen producida por CI.

---

## Tests de integración

Se agregó Playwright como herramienta para las pruebas de integración y E2E.

Los tests de integración se encuentran en:

```text
frontend/e2e/api.spec.js
```

Estos tests utilizan directamente el fixture `request` de Playwright y no abren un navegador.

En CI se ejecutan contra:

```text
https://los-santos-api-qa.onrender.com
```

Por lo tanto prueban la API pública desplegada y la base de datos real de QA.

Se implementaron tres casos.

### Crear, consultar y eliminar un vehículo

El test crea un vehículo con un nombre único basado en el tiempo, consulta nuevamente la API para verificar que realmente fue persistido, lo elimina y vuelve a consultar para comprobar que dejó de existir.

### Validación de nombre obligatorio

Se intenta crear un vehículo con `nombre` vacío.

La API debe responder:

```text
400 Bad Request
```

y se verifica además que la cantidad de registros no haya aumentado.

### Búsqueda de un vehículo creado

El test crea un vehículo único, utiliza el parámetro `buscar` de la API y comprueba que el vehículo sea recuperado correctamente desde la base de datos.

Luego elimina el registro y verifica que la misma búsqueda ya no lo devuelva.

Los tests utilizan datos únicos y limpian los registros creados. También se agregó limpieza mediante `finally` para reducir la posibilidad de dejar datos residuales si ocurre un fallo durante una prueba.

---

## Tests E2E

Los tests de navegador se encuentran en:

```text
frontend/e2e/vehiculos.spec.js
```

Se ejecutan con Chromium contra:

```text
https://los-santos-front-qa.onrender.com
```

Se eligieron tres flujos críticos de usuario.

### Publicar y eliminar un vehículo

El test crea una cuenta temporal, inicia sesión, publica un vehículo y comprueba que aparezca en el catálogo.

Después solicita eliminarlo, verifica el modal de confirmación y confirma la eliminación.

Finalmente comprueba que el vehículo desaparezca.

### Validación al publicar sin nombre

El test inicia sesión e intenta enviar el formulario sin completar el nombre.

Se verifica el mensaje:

```text
El nombre es obligatorio.
```

y que no aparezca una publicación nueva.

### Buscar una publicación propia

El test publica un vehículo con nombre único, utiliza el buscador del catálogo y verifica que aparezca el vehículo correcto.

Finalmente elimina la publicación para limpiar los datos utilizados durante la prueba.

---

## Diferencia entre integración y E2E

Los tests de integración verifican principalmente la comunicación entre la API, su lógica y la base de datos real de QA.

No necesitan navegador, por lo que son más rápidos y permiten diagnosticar problemas de backend o persistencia con mayor precisión.

Los tests E2E atraviesan la aplicación desde la interfaz del usuario. Verifican frontend, navegación, formularios, comunicación con la API y comportamiento observable.

Esto permite interpretar mejor un fallo.

Por ejemplo, durante la demostración del gate:

```text
integración → verde
E2E → rojo
```

La API y la base de datos seguían funcionando, pero existía un problema en el flujo de interfaz.

---

## Alcance de los tests

La suite de integración cubre varios comportamientos de la API porque estas pruebas son relativamente rápidas y estables.

La suite E2E se mantuvo más pequeña y enfocada en tres recorridos críticos.

Agregar E2E para cada variante de comportamiento produciría una suite más lenta y más sensible a cambios visuales o de infraestructura. Por eso se prefirió utilizar integración para una cobertura más amplia de la API y E2E para pocos recorridos representativos del usuario.

---

## Gate de despliegue

El pipeline final quedó encadenado de la siguiente manera:

```text
build-backend ─┐
               ├─> deploy-qa
build-frontend ┘
                     |
                     v
                integracion
                     |
                     v
                    e2e
                     |
                     v
                deploy-prod
```

Las dependencias relevantes son:

```text
integracion needs deploy-qa
e2e needs integracion
deploy-prod needs e2e
```

No se utilizaron mecanismos para ocultar fallos como:

```text
continue-on-error
|| true
exit 0
```

Por lo tanto cualquier fallo de integración o E2E corta naturalmente la cadena.

El environment `production` mantiene además un reviewer obligatorio, por lo que incluso con todo el gate en verde el despliegue final requiere aprobación manual.

---

## Demostración del gate en rojo

Para probar el gate se modificó intencionalmente código real de la aplicación, sin modificar los tests.

El texto del botón:

```text
Sell With Us
```

se cambió por:

```text
Sell Your Car
```

El backend continuó funcionando normalmente.

En la corrida:

<https://github.com/2320413/ingsoft3-tp01/actions/runs/39892631696>

se obtuvo:

```text
build-backend  OK
build-frontend OK
deploy-qa      OK
integracion    OK
e2e            FAIL
deploy-prod    SKIPPED
```

El commit utilizado para la demostración fue:

```text
a257da9b095f8864f24ddbb4ac7fbde683b8ffa2
```

La integración quedó verde porque los endpoints y la base de datos continuaban funcionando.

El E2E quedó rojo porque el recorrido del usuario esperaba encontrar `Sell With Us` y la aplicación desplegada ya mostraba `Sell Your Car`.

Como consecuencia del fallo, `deploy-prod` no se ejecutó.

La corrida publicó igualmente los dos artifacts:

```text
playwright-report-integracion
playwright-report-e2e
```

Esto permitió conservar tanto la evidencia verde de integración como el reporte y trace del fallo E2E.

---

## Corrección y corrida verde

Luego se restauró el texto correcto del botón en el código de la aplicación, sin modificar el test.

La corrida final fue:

<https://github.com/2320413/ingsoft3-tp01/actions/runs/39894368868>

El resultado fue:

```text
build-backend  OK
build-frontend OK
deploy-qa      OK
integracion    OK
e2e            OK
deploy-prod    OK
```

Antes de ejecutar producción, GitHub Actions quedó esperando la aprobación manual configurada en el environment `production`.

Luego de aprobar el deployment, PROD terminó correctamente.

El commit desplegado fue:

```text
238775fb2aa8f3b6b503db2d685b77b37fb5492a
```

---

## Release v7.0.0

El tag:

```text
v7.0.0
```

se creó específicamente sobre el commit que llegó a PROD.

Se verificó con:

```text
git rev-list -n 1 v7.0.0
```

obteniendo:

```text
238775fb2aa8f3b6b503db2d685b77b37fb5492a
```

La release pública se encuentra en:

<https://github.com/2320413/ingsoft3-tp01/releases/tag/v7.0.0>

Esto evita etiquetar accidentalmente un commit posterior de `main` que todavía no hubiera sido promovido a producción.

---

## Misma imagen de frontend en QA y PROD

El frontend no necesita construirse nuevamente para cada ambiente.

La misma imagen se utiliza en QA y PROD y obtiene la configuración externa mediante variables de entorno de Nginx.

Entre ellas:

```text
BACKEND_URL
DNS_RESOLVER
```

De esta manera la imagen del frontend permanece igual y solamente cambia el backend al que apunta según el ambiente.

Esto es una aplicación del principio de separar el artefacto desplegable de la configuración específica del ambiente.

---

## Render Free Tier y flakiness

Los servicios gratuitos de Render pueden entrar en suspensión y tardar algunos segundos en volver a responder.

Esto puede generar fallos intermitentes si los tests comienzan inmediatamente después de solicitar un deployment.

Para reducir este problema se agregaron reintentos a los smoke tests de QA y se espera que los servicios estén disponibles antes de continuar con las suites.

Aun así, una prueba E2E contra infraestructura remota siempre puede ser más sensible a latencia, cold starts o problemas temporales de red que una prueba local.

Por esa razón los E2E tienen reintentos limitados y generan traces y screenshots cuando ocurre un fallo.

---

## Problemas encontrados y soluciones

Durante la implementación se encontraron varios problemas.

### El smoke test puede observar una versión anterior

Los Deploy Hooks de Render son asíncronos. Una respuesta correcta del frontend no implica necesariamente que el nuevo deployment ya haya terminado.

Esto confirmó que un smoke test de disponibilidad no debe confundirse con una comprobación exacta de versión.

### Primera demostración E2E no falló

La aplicación contiene un botón `Sell With Us` tanto en la vista de detalle como en el catálogo.

En el primer intento de la demostración se modificó solamente el botón de la vista de detalle.

Los E2E comenzaban desde el catálogo, donde todavía existía un botón con el nombre original, por lo que la suite permaneció verde.

Se corrigió la demostración modificando el botón utilizado realmente por el recorrido E2E. En la siguiente ejecución, integración quedó verde, E2E falló y producción fue bloqueada correctamente.

### Persistencia de publicaciones propias

Inicialmente los IDs de las publicaciones creadas por un usuario solamente se guardaban en estado de React.

Después de refrescar la página se perdía esa información y desaparecía la opción de eliminar la publicación.

Se solucionó persistiendo los IDs en `localStorage` asociados al email del usuario.

### Imágenes de vehículos publicados

Inicialmente todas las publicaciones nuevas recibían la imagen de Banshee como valor fijo.

Se reemplazó ese comportamiento por dos campos opcionales:

```text
ImagenUrl
ImagenDetalleUrl
```

Si no se especifica una imagen, la aplicación muestra `Sin imagen`.

También se creó una migración de Entity Framework para persistir `ImagenDetalleUrl`.

### Diff excesivo de App.jsx

Durante las modificaciones el archivo `App.jsx` quedó reformateado casi por completo, generando un diff innecesariamente grande.

Se reconstruyó el archivo partiendo de la versión existente en `main` y se reaplicaron solamente los cambios funcionales, dejando un Pull Request más legible.

---

## Uso de Inteligencia Artificial

Se utilizó ChatGPT como asistencia durante el TP7 para interpretar la guía, organizar el trabajo paso a paso, diseñar las pruebas de integración y E2E, analizar errores, revisar el pipeline de GitHub Actions y documentar las decisiones.

Las propuestas no se consideraron válidas únicamente por haber sido generadas por IA.

Cada cambio fue verificado mediante ejecuciones reales:

- tests de integración locales;
- tests E2E locales;
- builds de GitHub Actions;
- deployments reales en QA;
- una demostración intencional en rojo;
- bloqueo real de producción;
- corrección posterior;
- corrida completa en verde;
- aprobación manual y deployment real a PROD;
- comprobación del tag `v7.0.0` contra el commit desplegado.

## TP8 — Infraestructura como Código

### Riel elegido

Se utilizó **Terraform + Neon + Render** para declarar un entorno nuevo `preprod`, sin modificar los ambientes existentes de QA y producción.

Versiones fijadas:

- Terraform: `1.17.0`
- Provider Neon: `kislerdm/neon` `0.18.0`
- Provider Render: `render-oss/render` `1.9.1`

El entorno declarado incluye un proyecto, rol y base de datos en Neon, junto con una API y un frontend en Render ejecutando las imágenes publicadas en el TP7.

El estado de Terraform se mantuvo únicamente en la máquina local y se excluyó del repositorio mediante `.gitignore`. El archivo `.terraform.lock.hcl` sí se versiona.

### Problemas encontrados y soluciones

Al crear inicialmente el proyecto de Neon, el provider devolvió que `org_id` era obligatorio. Se solucionó agregando al recurso `neon_project` el identificador de la organización de Neon.

Al crear los servicios de Render, se utilizó inicialmente un identificador incorrecto como `RENDER_OWNER_ID`. El provider respondió `invalid ownerID`. Se consultó el endpoint `/v1/owners` de la API de Render y se utilizó el `owner.id` correcto como variable de entorno.

También se comprobó:

- idempotencia mediante un segundo `terraform plan` con `No changes`;
- detección y reparación de drift eliminando manualmente la base administrada;
- que un recurso creado manualmente y no declarado no es detectado por Terraform;
- el ciclo completo `destroy → apply`, recreando los cinco recursos de preprod;
- que QA y producción permanecieron intactos;
- el funcionamiento de `prevent_destroy`, que bloqueó correctamente la destrucción de la base.

### Uso de Inteligencia Artificial

Se utilizó ChatGPT como asistencia para interpretar la consigna, preparar y revisar los archivos HCL, analizar errores de los providers de Neon y Render y seguir el ciclo de pruebas del práctico.

Todas las propuestas fueron verificadas ejecutando realmente `terraform validate`, `plan`, `apply` y `destroy`, comprobando los recursos creados en Neon y Render y realizando requests reales contra la API de preprod.

## TP9 — DevSecOps + Observabilidad + Continuous Feedback

### Dependabot

Se configuró Dependabot para vigilar tres ecosistemas del proyecto:

- NuGet para el backend.
- npm para el frontend.
- GitHub Actions para el pipeline.

Se analizó y mergeó el PR #47 de Dependabot, que actualizó:

```text
Microsoft.AspNetCore.OpenApi
8.0.30 → 8.0.32
```

Se decidió mergearlo porque era una actualización patch dentro de .NET 8, las notas de versión no indicaban breaking changes y los checks requeridos del pipeline terminaron correctamente.

### CodeQL y seguridad del repositorio

Se activó CodeQL con configuración por defecto.

El primer análisis encontró cuatro findings:

```text
Workflow does not contain permissions
```

Los cuatro correspondían a jobs del workflow de CI.

Se corrigieron aplicando el principio de mínimo privilegio:

```text
deploy-qa    → permissions: {}
integracion  → contents: read
e2e          → contents: read
deploy-prod  → permissions: {}
```

Después de volver a ejecutar CodeQL, el resultado quedó:

```text
0 Open
4 Closed
```

También se verificó que Secret Scanning y Push Protection estuvieran activos.

### Monitoreo externo

Se configuró UptimeRobot para monitorear:

```text
https://los-santos-api-prod.onrender.com/health
```

con un intervalo de 5 minutos.

Inicialmente el endpoint solamente aceptaba GET y una petición HEAD devolvía:

```text
405 Method Not Allowed
```

Se modificó `/health` para aceptar:

```text
GET
HEAD
```

y se desplegó la corrección a producción.

Para comprobar las alertas se suspendió intencionalmente la API de producción.

UptimeRobot detectó la caída aproximadamente 3 minutos después y registró el estado DOWN.

Luego se reanudó el servicio y UptimeRobot registró nuevamente el estado UP.

Al finalizar el ejercicio, el monitor se dejó pausado para evitar mantener despierto permanentemente el servicio gratuito de Render.

### Sentry

Se integró Sentry tanto en el backend ASP.NET Core como en el frontend React.

En el backend el DSN se configuró mediante la variable de entorno:

```text
SENTRY_DSN
```

por lo que no quedó escrito en el código.

En el frontend el DSN se configuró en el código de la aplicación, ya que el DSN de navegador no funciona como una credencial privada y necesariamente queda visible para el cliente.

Se habilitaron Error Monitoring y Tracing.

Para verificar la captura de errores se agregó temporalmente:

```text
GET /api/falla
```

que generaba:

```text
System.InvalidOperationException
Falla de prueba del TP9
```

Sentry registró dos eventos del error.

Luego de verificar la integración, el endpoint `/api/falla` fue eliminado y producción volvió a responder 404 para esa ruta.

### Uso y rendimiento observado

A partir de las transacciones reales registradas en Sentry se observó:

```text
Operación más usada:
GET /api/vehiculos
1.27 TPM
```

La operación más lenta del backend fue:

```text
POST /api/vehiculos
P50: 1.05 s
P95: 1.05 s
```

A partir de este dato se creó en el tablero del TP3 la tarjeta:

```text
Optimizar creación de vehículos
```

para investigar la latencia de escritura en la base de datos.

### Problemas encontrados y soluciones

Durante el TP se encontraron varios problemas:

- `/health` devolvía 405 ante HEAD. Se modificó el endpoint para aceptar GET y HEAD.
- CodeQL detectó cuatro jobs sin permisos explícitos. Se aplicó mínimo privilegio y los cuatro findings quedaron cerrados.
- Una corrida antigua de `deploy-prod` estaba esperando aprobación y bloqueaba mediante `concurrency` un deployment nuevo. Se canceló la corrida vieja para liberar el grupo.
- El backend de Sentry necesitaba mantener el DSN fuera del código. Se configuró mediante `SENTRY_DSN` en Render.
- El endpoint de error utilizado para verificar Sentry se eliminó después de la prueba para no dejar una ruta intencionalmente rota en producción.
- Durante la limpieza del endpoint temporal `/api/falla` se eliminó accidentalmente también la inicialización de Sentry del backend. La revisión final previa a la entrega detectó la regresión y se restauró `UseSentry` manteniendo eliminado únicamente el endpoint de prueba.

### Uso de Inteligencia Artificial

Se utilizó ChatGPT como asistencia para interpretar la guía del TP9, configurar Dependabot, analizar y corregir findings de CodeQL, preparar el monitoreo externo, integrar Sentry y revisar los resultados observados.

Las sugerencias fueron verificadas mediante resultados reales:

- PR de Dependabot mergeado con checks verdes;
- ejecución real de CodeQL y cierre de cuatro findings;
- verificación de Push Protection;
- caída y recuperación reales detectadas por UptimeRobot;
- requests reales contra producción;
- error capturado por Sentry;
- métricas reales de uso y latencia;
- tests de backend y frontend;
- pipeline completo y deployments reales a producción.
