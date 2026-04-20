# CLAUDE.md

Guía de contexto para Claude Code al trabajar en este repositorio. Resume la visión del producto y fija principios que deben respetarse en cualquier cambio.

Fuentes autoritativas:
- [OBJETIVO-PRODUCTO.md](./OBJETIVO-PRODUCTO.md) — visión y roadmap (referencia principal).
- [GUIA.md](./GUIA.md) — uso práctico del sitio.
- [README.md](./README.md) — arquitectura e implementación.

Si hay conflicto entre docs, **prima OBJETIVO-PRODUCTO.md**.

---

## Qué es CFIA

Un **archivo vivo de ficción generada por IA** — cuentos cortos de ciencia ficción en español e inglés, publicados sin reescritura humana del texto creativo. La app es React + API + base de datos; expone catálogo, lectura, generación bajo contraseña, expansión de cuentos y memoria de universo.

## Principio rector (no negociable sin permiso explícito)

**Mínima intervención humana sobre el texto generado.**

- Lo **creativo** (prosa, diálogo, estructura) **no se reescribe** para “corregir” al modelo.
- Lo **operativo** sí existe: metadatos (modelo, temperatura, fecha), licencia, políticas legales/hosting obligatorias.
- No propongas “pulir” textos generados, ni añadir filtros de estilo sobre el output creativo. Si una tarea parece empujar hacia curaduría editorial del cuento, **preguntar antes**.

Copy antiguo de la UI puede decir “curados por humanos”; esa línea está **obsoleta**. Al tocar copy, alinearlo con la visión actual.

## Modelo de contenido

- **Cuentos** bilingües (ES/EN generados en paralelo), con ilustración abstracta y metadatos de procedencia.
- **Árbol narrativo**: un cuento puede **expandir** otro (secuela, precuela, variación, eco).
- **Memoria de universo**: resúmenes y entidades reutilizables para que textos del mismo hilo no partan de cero.
- **Universo**: un árbol con raíz que alcanza **`total >= 3` cuentos** (raíz + descendientes) se expone en la página UNIVERSOS. El umbral vive en el API de universos — **no cambiarlo sin actualizar también la narrativa del producto**.

## Automatización prevista (aún no cableada)

Dos crons definidos en el roadmap:

- **Cron A — emisión diaria aleatoria:** un cuento nuevo al día con parámetros (tags, duración, forma, modelo) elegidos al azar dentro de límites razonables. Evita monotonía; simula emisión continua.
- **Cron B — extender lo más leído:** genera derivados de los títulos con más lecturas. El criterio de ramificación es **popularidad**, no gusto editorial humano.

Requisitos abiertos antes de cablear: métricas de lectura fiables y límites de coste de API (top N, derivados/día). Si se trabaja en esto, respetar esos gates.

## Reglas de trabajo en el repo

- Antes de proponer cambios que afecten copy, flujo de publicación, o criterios de derivación, revisar [OBJETIVO-PRODUCTO.md](./OBJETIVO-PRODUCTO.md).
- Si una decisión técnica contradice la visión (p. ej. añadir un paso de revisión humana al texto), señalarlo al usuario en vez de ejecutarla silenciosamente.
- El umbral `total >= 3` y la metáfora de “varias herencias” deben mantenerse alineados: si se ajusta el número en backend, actualizar la prosa de OBJETIVO-PRODUCTO.md en el mismo cambio.
