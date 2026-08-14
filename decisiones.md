# Decisiones — TP1

## 1. Por qué Git no pudo resolver el conflicto solo — y qué habría tenido que pasar para que nunca apareciera

Git no pudo resolver el conflicto automáticamente porque dos ramas distintas modificaban la misma línea del archivo `README.md` de forma diferente.

## 2. Qué problemas encontraste y cómo los solucionaste. Los tropiezos bien contados valen más que un camino perfecto: son los que demuestran que entendiste

Uno de los problemas que encontré fue que GitHub rechazaba mis primeros intentos de `push` porque los commits estaban usando mi correo privado de la universidad. GitHub tenía habilitada la opción de bloquear pushes que expusieran ese correo.

Lo solucioné configurando Git para utilizar la dirección privada `noreply` proporcionada por GitHub y modificando el autor del commit antes de volver a realizar el push.

## 3. Declaración de uso de IA: qué partes hiciste con ayuda de inteligencia artificial y cómo verificaste lo que te devolvió (§ Uso de IA del enunciado)

Utilicé ChatGPT como asistencia durante la realización del TP, principalmente para seguir la guía paso a paso, entender los comandos de Git, interpretar los errores que aparecieron y verificar cómo configurar correctamente el repositorio y las protecciones.

Verifiqué las indicaciones comparándolas con la guía oficial del TP y comprobando en GitHub y en la terminal que cada paso tuviera el resultado esperado.
