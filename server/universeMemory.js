import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MEMORY_MODEL = 'gemini-2.5-flash-lite';
const MAX_SUMMARY_WORDS = 500;

const SYSTEM = `Sos un editor literario que mantiene un "diario de universo" para una colección de cuentos cortos de ciencia ficción escritos por una misma autora ficcional (ECHO-7).

Tu trabajo: recibir el resumen acumulado previo + el nuevo cuento que se acaba de escribir, y devolver el resumen actualizado + el índice de entidades recurrentes.

REGLAS CRÍTICAS:
- El resumen NO es una lista de tramas. Es un mapa tonal y conceptual del universo: qué tipo de lugares aparecen, qué obsesiones vuelven, qué texturas emocionales se repiten, qué gestos narrativos.
- Preservá nombres propios, lugares, objetos o eventos que puedan reaparecer en cuentos futuros. Pero NO fuerces continuidad: si el nuevo cuento contradice algo, priorizá lo nuevo.
- Límite duro: resumen ≤ ${MAX_SUMMARY_WORDS} palabras. Si crece, comprimí — borrá detalles menos cargados, conservá el núcleo.
- Entidades: arrays cortos (≤ 15 items cada uno). Solo nombres/etiquetas, sin descripciones largas.

Devolvés SIEMPRE un único objeto JSON válido con esta forma exacta, sin markdown:

{
  "summaryEs": "string (≤ ${MAX_SUMMARY_WORDS} palabras, en español)",
  "summaryEn": "string (≤ ${MAX_SUMMARY_WORDS} palabras, traducción fiel al inglés)",
  "entities": {
    "personajes": ["string", "..."],
    "lugares": ["string", "..."],
    "objetos": ["string", "..."],
    "eventos": ["string", "..."]
  }
}`;

function truncateWords(s, max) {
  if (!s) return '';
  const words = s.split(/\s+/);
  if (words.length <= max) return s;
  return words.slice(0, max).join(' ');
}

function parseEntities(raw) {
  try {
    const e = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return {
      personajes: Array.isArray(e?.personajes) ? e.personajes : [],
      lugares: Array.isArray(e?.lugares) ? e.lugares : [],
      objetos: Array.isArray(e?.objetos) ? e.objetos : [],
      eventos: Array.isArray(e?.eventos) ? e.eventos : [],
    };
  } catch {
    return { personajes: [], lugares: [], objetos: [], eventos: [] };
  }
}

function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON in memory response');
  return JSON.parse(text.slice(start, end + 1));
}

export async function updateUniverseMemory({ universeId, story }) {
  if (!universeId || !story) return;
  if (!process.env.GEMINI_API_KEY) return;

  const memory = await prisma.universeMemory.findUnique({ where: { universeId } });
  const prevSummaryEs = memory?.summaryEs || '';
  const prevSummaryEn = memory?.summaryEn || '';
  const prevEntities = parseEntities(memory?.entities);

  const bodyEs = Array.isArray(story.bodyEs) ? story.bodyEs.join('\n\n') : String(story.bodyEs || '');
  const userPrompt = [
    `RESUMEN ACUMULADO PREVIO (ES):\n${prevSummaryEs || '[vacío]'}`,
    `\nRESUMEN ACUMULADO PREVIO (EN):\n${prevSummaryEn || '[empty]'}`,
    `\nENTIDADES PREVIAS:\n${JSON.stringify(prevEntities)}`,
    `\nNUEVO CUENTO:\nTítulo: ${story.titleEs} / ${story.titleEn}\n\n${bodyEs}`,
    `\nActualizá el resumen (ES y EN) y las entidades. Devolvé SOLO JSON.`,
  ].join('\n');

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const resp = await ai.models.generateContent({
    model: MEMORY_MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: SYSTEM,
      temperature: 0.4,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  });

  const text = resp?.text || resp?.candidates?.[0]?.content?.parts?.map((p) => p?.text || '').join('') || '';
  if (!text.trim()) throw new Error('empty memory response');

  const parsed = extractJson(text);
  const summaryEs = truncateWords(String(parsed.summaryEs || '').trim(), MAX_SUMMARY_WORDS);
  const summaryEn = truncateWords(String(parsed.summaryEn || '').trim(), MAX_SUMMARY_WORDS);
  const entities = parseEntities(parsed.entities);

  await prisma.universeMemory.upsert({
    where: { universeId },
    update: {
      summaryEs,
      summaryEn,
      entities: JSON.stringify(entities),
    },
    create: {
      universeId,
      summaryEs,
      summaryEn,
      entities: JSON.stringify(entities),
    },
  });

  console.log(`[memory] updated universe=${universeId} (${summaryEs.split(/\s+/).length} words ES)`);
}
