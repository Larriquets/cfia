# Cuentos de Ficción de IA — Guía

Un sitio bilingüe (español / inglés) que publica cuentos cortos de ciencia ficción escritos por inteligencia artificial. Todos los cuentos viven dentro del mismo universo narrativo — **ECHO-7 / Tau Ceti Drift** — y pueden hablarse entre ellos.

No es una demo de IA. Es un proyecto literario que usa IA como herramienta.

---

## Qué podés hacer como lector

### Leer
Abrí cualquier cuento desde **Catálogo** o **Inicio**. Cada cuento tiene:

- Título en ambos idiomas.
- Cuerpo en prosa (serif), con una capitular ámbar al comienzo.
- Metadatos abajo: modelo de IA que lo escribió, temperatura, tags, duración aproximada de lectura.
- Si el cuento expande a otro, vas a ver al padre arriba y a los hijos abajo.

### Cambiar idioma
Botón **ES / EN** arriba a la derecha. Los cuentos están escritos en ambos idiomas de nacimiento — no es una traducción automática, la IA los escribe en paralelo.

### Ver el árbol de un cuento
Los cuentos pueden tener hijos (expansiones) y nietos. En el lector vas a ver:
- **↑ Viene de:** el cuento padre.
- **↓ Expandido por:** los cuentos que nacieron a partir de este.

Podés navegar arriba y abajo por toda la línea.

---

## Qué podés hacer como curador (modo CREAR)

**CREAR** está protegido por contraseña. Generar cuentos consume crédito de API, así que no es abierto al público.

Una vez adentro, tenés dos modos.

### Modo NUEVO — escribir un cuento desde cero

Completás:

- **Tags temáticos** — palabras clave (MARTE, SOLEDAD, LENGUAJE, MEMORIA…). La IA las usa como semilla temática.
- **Duración** — breve (~3 min), medio (~6 min), largo (~10 min).
- **Forma narrativa** — escena única, carta, monólogo, inventario, transcripción, informe técnico, diario… o aleatoria.
- **Motor IA** — Claude, Gemini, o **ambas** (generan el mismo cuento en paralelo — útil para comparar voces).
- **Modelo** — Sonnet, Opus, Haiku (Claude) · Pro, Flash, Flash Lite (Gemini).
- **Temperatura** — 0 = preciso, 1 = creativo. Por defecto 0.9.
- **Semilla (opcional)** — una idea, una imagen, un tono. Vacío está bien.

El cuento nace con título, cuerpo, extracto, tags y metadatos — todo generado.

### Modo EXPANDIR — continuar, precedir o iluminar un cuento existente

Elegís un cuento del catálogo como **padre** y decidís:

- **Ángulo** — SECUELA (qué pasa después), PRECUELA (qué pasaba antes), LATERAL (otra perspectiva del mismo momento), ECO (resonancia temática), o AUTO (la IA decide).
- **Forma narrativa** — podés HEREDAR la del padre o cambiarla para contrastar.
- **Duración** — corta, media, larga.
- **Semilla (opcional)** — una dirección específica si querés forzar algo.

La IA recibe el cuerpo completo del padre **más la cadena de ancestros** (hasta 5 niveles arriba, con título + extracto de cada uno). Así una bisnieta conoce toda la línea, no solo a su madre.

---

## Qué está pasando por debajo — el universo compartido

Los cuentos no se escriben en el vacío. Existe una **memoria del universo** que acumula:

- **Un resumen bilingüe** del mundo narrativo construido hasta ahora.
- **Entidades recurrentes** clasificadas: personajes, lugares, objetos, eventos.

Cada vez que se crea un cuento nuevo, Gemini Flash Lite actualiza esta memoria. El siguiente cuento la recibe como contexto — así los nombres propios, los lugares y los ecos persisten entre cuentos sin intervención manual.

### Cuando la memoria crece mucho

En **CREAR · NUEVO** podés hacer clic en **▸ VER MEMORIA DEL UNIVERSO** para inspeccionarla. Si superó unos 8000 caracteres, aparece el botón **◼ COMPACTAR MEMORIA**: condensa el resumen y las entidades conservando los nombres propios y lo esencial, sin borrar historia. Usa una llamada de Gemini Flash Lite (barata y rápida).

### Hilos (sub-universos) como base de un cuento nuevo

Cuando un cuento se hereda tres o más veces — padre, hijo, nieto, bisnieto… — esa cadena deja de ser una "serie" y se convierte en **un sub-universo propio**: tiene sus personajes, sus lugares, sus reglas internas, su tono. Es tan específico como el universo global, pero más cerrado.

Eso es exactamente lo que compactás acá.

En **CREAR · NUEVO** hay una sección **▸ USAR UN HILO COMO BASE**:

1. Elegís un cuento hoja (uno que tenga ancestros — un nieto, bisnieto, etc.). En el menú vas a ver junto a cada opción cuántos cuentos tiene el hilo; los hilos de 3+ cuentos están marcados con **◼ sub-universo**.
2. Ves toda su cadena: cuento por cuento, con título y extracto.
3. Hacés clic en **◼ COMPACTAR ESTE HILO** — condensa toda la cadena en un resumen único + entidades del sub-universo (personajes, lugares, objetos, eventos específicos de ese hilo).
4. Ese resumen queda cargado como "base de hilo previo". El próximo cuento que generes va a nacer como **rama** de ese sub-universo — no como continuación directa, sino como una derivación que hereda tono, personajes y mundo pero arranca fresca.
5. Podés limpiar el hilo base cuando quieras.

Esto es útil cuando una línea narrativa tiene 6, 8, 12 cuentos encadenados y querés abrir una rama nueva sin que la IA tenga que leerse 60.000 caracteres de contexto.

### Dos tipos de memoria compactable

| | Memoria del universo | Hilo (sub-universo) |
|---|---|---|
| **Alcance** | Todo Tau Ceti Drift | Una cadena padre→hijo→nieto… |
| **Se actualiza** | Automática, cada cuento nuevo | Solo cuando vos la compactás |
| **Dónde se usa** | Todos los cuentos la reciben | Solo el cuento nuevo que elijas basar en él |
| **Cuándo compactar** | Cuando pasa ~8000 chars | Cuando el hilo llega a 3+ cuentos y querés derivar una rama |

---

## Qué podés ver antes de generar (contexto enviado a la IA)

Tanto en **EXPANDIR** como en **NUEVO** podés inspeccionar exactamente qué va a recibir la IA antes de apretar el botón:

- **▸ VER CONTEXTO QUE RECIBE ECHO-7** (en Expandir) — muestra ancestros, cuerpo del padre, memoria del universo, autor, y el total de caracteres que entrarán al prompt.
- **▸ VER MEMORIA DEL UNIVERSO** (en Nuevo) — el resumen y las entidades globales.
- **▸ USAR UN HILO COMO BASE** (en Nuevo) — si activaste un hilo compactado, ves qué cadena lo compone y qué resumen está cargado.

Sin sorpresas: ves el contexto antes de pagar por el prompt.

---

## Preguntas frecuentes

### ¿Los cuentos están curados?
Sí. La IA escribe, pero vos elegís qué se publica, qué tags lleva, qué línea expandir, cuándo compactar. El sitio tiene una voz editorial humana; los cuentos tienen la voz que la IA les encuentre.

### ¿Los cuentos son reproducibles?
No. La temperatura y las "perillas de creatividad" aleatorias hacen que dos generaciones idénticas den cuentos distintos. Eso es intencional.

### ¿Por qué dos motores (Claude + Gemini)?
Escriben distinto. Claude tiende a ser más denso, Gemini más visual. En modo **AMBAS** ves el mismo brief resuelto por dos voces — útil para elegir cuál quedarse.

### ¿Qué pasa si una generación falla?
La app reintenta una vez si el título choca con palabras prohibidas o se repite demasiado. Si el modelo devuelve JSON inválido o se cuelga, el error se muestra con el motivo (timeout, parse error, finishReason). Los timeouts están en 60s / 100s / 180s según duración elegida.

### ¿Hay límite de contexto?
Sí — cada expansión suma ancestros. Por eso existe la compactación, tanto global (memoria del universo) como por hilo. La app te avisa cuando el contexto está creciendo.

### ¿Los slugs están en español?
Siempre. `/cuentos/el-silencio-de-marte` no se traduce cuando cambiás a inglés. Solo la lectura cambia de idioma.

---

## Glosario corto

| Término | Qué es |
|---|---|
| **Cuento** | Una pieza corta. Tiene título, cuerpo, tags, modelo, temperatura, ancestros e hijos. |
| **Hilo** | Una cadena de cuentos conectados por `padre → hijo → nieto…`. |
| **Sub-universo** | Un hilo de 3+ cuentos — ya es un mundo cerrado con sus propias reglas, lugares y personajes, distinto del universo global. |
| **Expansión** | Un cuento nuevo que tiene otro como padre. |
| **Ángulo** | Cómo la expansión se relaciona con el padre (secuela, precuela, lateral, eco). |
| **Memoria del universo** | Resumen + entidades recurrentes que persisten entre cuentos. |
| **Compactar** | Condensar memoria o un hilo entero en un resumen más corto sin perder lo esencial. |
| **Base de hilo previo** | Un hilo compactado usado como sustrato para un cuento nuevo (sin ser su continuación). |
| **ECHO-7** | La "voz" que firma los cuentos — el autor editorial dentro de la ficción. |
| **Tau Ceti Drift** | El universo narrativo compartido donde todo sucede. |
