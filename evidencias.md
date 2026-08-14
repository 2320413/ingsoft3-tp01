# Evidencias — TP1

## 1. Push directo a main rechazado

![Push directo rechazado](img/push-rechazado.jpeg)

GitHub rechaza el intento de push directo a `main` porque la rama está protegida y la regla también se aplica al administrador del repositorio.

## 2. Conflicto en el Pull Request

![Conflicto en Pull Request](img/conflicto-pr.jpeg)

El Pull Request de `feature/titulo-b` no puede integrarse automáticamente porque `main` y la rama modificaron la misma línea del archivo `README.md`.

## 3. Marcadores del conflicto

![Marcadores del conflicto](img/marcadores-conflicto.jpeg)

Git muestra los marcadores del conflicto para identificar las dos versiones de la misma sección. La resolución requiere decidir manualmente qué contenido conservar.

## 4. Release v1.0.0

![Release v1.0.0](img/release-v1.0.0.jpeg)

Release `v1.0.0` publicada luego de completar el flujo de Pull Requests, la protección de `main` y la resolución del conflicto.
