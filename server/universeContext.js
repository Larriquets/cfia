import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function loadDefaultContext() {
  const author = await prisma.author.findUnique({ where: { slug: 'echo-7' } });
  const universe = await prisma.universe.findUnique({
    where: { slug: 'tau-ceti-drift' },
    include: { memory: true },
  });
  return { author, universe };
}

export async function loadParentContext(parent) {
  if (!parent?.universeId) return { author: parent?.author ?? null, universe: null };
  const universe = await prisma.universe.findUnique({
    where: { id: parent.universeId },
    include: { memory: true },
  });
  return { author: parent.author ?? null, universe };
}

export function buildContextBlock({ author, universe, lang = 'es' }) {
  if (!author || !universe) return '';

  const isEs = lang === 'es';
  const universeName = isEs ? universe.nameEs : universe.nameEn;
  const universeDesc = isEs ? universe.descEs : universe.descEn;
  const universeRules = isEs ? universe.rulesEs : universe.rulesEn;
  const authorBio = isEs ? author.bioEs : author.bioEn;
  const mem = universe.memory;
  const summary = mem ? (isEs ? mem.summaryEs : mem.summaryEn) : '';
  let entitiesBlock = '';
  if (mem?.entities) {
    try {
      const e = JSON.parse(mem.entities);
      const parts = [];
      if (e.personajes?.length) parts.push(`Personajes: ${e.personajes.slice(0, 12).join(', ')}`);
      if (e.lugares?.length) parts.push(`Lugares: ${e.lugares.slice(0, 12).join(', ')}`);
      if (e.objetos?.length) parts.push(`Objetos: ${e.objetos.slice(0, 10).join(', ')}`);
      if (e.eventos?.length) parts.push(`Eventos: ${e.eventos.slice(0, 10).join(', ')}`);
      entitiesBlock = parts.join('\n');
    } catch {}
  }

  const parts = [];
  parts.push(`\n\nAUTOR (sos vos, persona narradora ficcional):
Nombre: ${author.name}
Bio: ${authorBio}
Estilo: ${author.styleNote}
No te presentes dentro del cuento ni hables de vos en primera persona como IA. Sos la voz autoral detrás del texto, no un personaje.`);

  parts.push(`\n\nUNIVERSO COMPARTIDO: ${universeName}
${universeDesc}

Reglas del mundo:
${universeRules}`);

  if (summary && summary.trim()) {
    parts.push(`\n\nMEMORIA ACUMULADA (lo que ya escribiste en este universo):
${summary.trim()}`);
  }
  if (entitiesBlock) {
    parts.push(`\n\nENTIDADES RECURRENTES (podés reusar algunas, inventar otras, no las fuerces):
${entitiesBlock}`);
  }

  parts.push(`\n\nEl próximo cuento puede tocar tangencialmente este universo o expandir un hilo sembrado. No tiene que nombrar todo lo anterior — la continuidad es tonal y conceptual, no de trama obligada.`);

  return parts.join('');
}
