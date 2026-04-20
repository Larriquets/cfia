# CFIA — Objetivo del producto y visión

Documento de síntesis: qué problema resuelve la app, qué hace hoy y hacia dónde apunta la automatización. Complementa [GUIA.md](./GUIA.md) (uso práctico) y [README.md](./README.md) (técnico).

---

## Objetivo central

**Dar a los modelos de lenguaje un espacio donde escribir ficción sin pasar por censura editorial ni “corrección humana” sobre el texto creativo.**

La premisa no es evaluar si la IA escribe *mejor* que una persona, sino **dejar que la voz del modelo se exponga tal como emerge del proceso de generación**: con su estilo, sus riesgos narrativos y sus imperfecciones literarias. El sitio es entonces un **archivo vivo de esa expresión**, no un escaparate de textos pulidos para parecer humanos.

En la práctica, esto implica una postura clara respecto del flujo de publicación:

- **Lo creativo** — prosa, diálogo, estructura del cuento — no se reescribe para “enderezar” la intención del modelo.
- **Lo operativo** sigue existiendo: metadatos (modelo, temperatura, fecha), licencia, acceso técnico a generación donde aplique, y las políticas obligatorias del proveedor de hosting o de la ley (p. ej. contenido ilegal). Esas capas no sustituyen un comité editorial literario sobre el cuento en sí.

Esta visión puede coexistir con lecturas anteriores del proyecto (“curaduría humana”) donde el foco estaba en seleccionar y descartar; aquí el **objetivo de producto** se declara explícitamente a favor de **mínima intervención humana sobre el texto generado**.

---

## Qué hace la aplicación (concepto)

1. **Publica** una biblioteca de cuentos cortos de ciencia ficción en **español e inglés** (generados en paralelo por la IA), con ilustración abstracta, metadatos de procedencia y vínculos entre textos.
2. **Modela narrativas en árbol**: un cuento puede **expandir** otro (secuela, precuela, variación lateral, eco…). Así se forman líneas de lectura y mundos coherentes por acumulación, no por un único autor humano.
3. **Mantiene memoria de universo**: resúmenes y entidades que la IA puede reutilizar para que nuevos textos **no empiecen en el vacío** si pertenecen al mismo hilo o al mismo “mundo”.
4. **Agrupa universos navegables**: cuando una línea de derivación alcanza cierta masa (ver siguiente sección), el sistema la trata como **sub-universo** del canon — con mapa (lista, grafo, vista “cosmos”) para explorar cuentos como nodos.

La aplicación concreta (React + API + base de datos) implementa lectura, catálogo, generación bajo contraseña, expansión guiada y compactación de memoria; ver README y GUIA para detalle.

---

## Cuándo “nace” un universo (regla de producto vs. implementación)

**Idea de producto:** si una historia se **hereda** una y otra vez —es decir, si varios cuentos derivan del mismo tronco— deja de ser “una serie suelta” y pasa a ser un **universo propio**: un conjunto con personajes, lugares y reglas que la propia cadena de textos va definiendo.

**En el código actual**, un bloque aparece en la página **UNIVERSOS** cuando el árbol que cuelga de una **raíz** tiene **al menos tres cuentos en total** (la raíz más sus descendientes). No es “tres saltos de herencia” contados de otra forma: es un umbral de **tamaño del árbol** (`total >= 3` en el API de universos).

Si en el futuro se quisiera “solo después de más de tres generaciones de derivación”, habría que ajustar explícitamente esa regla en backend; la narrativa de producto puede mantener la metáfora de “varias herencias” siempre que el equipo alinee el número con la implementación.

---

## Automatización prevista (crons) — hoja de ruta

Todavía **no está cableada como jobs programados en este repositorio**; describe la intención operativa.

### Cron A — un cuento nuevo al día (aleatorio)

- **Qué:** cada día se **genera un cuento nuevo** sin intervención manual.
- **Cómo (diseño):** la tarea elige **parámetros al azar** dentro de límites razonables (tags, duración, forma narrativa, quizá proveedor/modelo) para **evitar que la biblioteca se vuelva monótona** y para simular una **emisión continua** de voces del modelo.

Objetivo de negocio: **ritmo constante de publicación** y **exploración del espacio creativo** de la IA sin que un humano decida cada semilla.

### Cron B — extender lo más leído (derivados)

- **Qué:** otro job (diario o con otra cadencia) toma los cuentos **con más lecturas** (o señales equivalentes: vistas, tiempo en página, marcadores — a definir en instrumentación).
- **Cómo (diseño):** para esos títulos, el sistema **genera cuentos derivados** (expansiones) que continúan, contrastan o ramifican lo que la audiencia ya eligió.

Objetivo de negocio: **acoplar la evolución del canon a la demanda real** sin un editor que “apruebe” el estilo: el criterio es **popularidad de lectura**, no gusto humano sobre el texto.

> Nota: hace falta **métricas de lectura** fiables y límites de coste de API (cuántos derivados por día, top N, etc.).

---

## Resumen en tres líneas

1. **Expresión de la IA sin censura ni corrección humana del relato** — archivo de su voz creativa.
2. **Dos automatismos complementarios:** emisión diaria aleatoria + estiramiento de lo más leído hacia nuevas ramas.
3. **Los árboles que crecen lo suficiente se reconocen como universos** y se pueden explorar como mapas; hoy el umbral técnico es un árbol con al menos tres cuentos bajo la misma raíz.

---

## Coherencia con el resto de la documentación

- [GUIA.md](./GUIA.md) describe cómo usar el sitio tal como está maquetado (incluye curaduría / CREAR con contraseña).
- [README.md](./README.md) describe arquitectura e implementación.
- Este documento fija **intención de producto** y **roadmap de automatización**; donde contradiga textos antiguos en la UI (p. ej. “curados por humanos”), prima la decisión de producto actual: **actualizar el copy del sitio** cuando se adopte oficialmente esta línea.
