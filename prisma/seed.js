import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));

function loadStoriesFromDataJs() {
  const dataPath = resolve(__dirname, '../ui_kits/website/data.js');
  const source = readFileSync(dataPath, 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  return sandbox.window.CFIA_STORIES;
}

const AUTHOR_SEED = {
  slug: 'echo-7',
  name: 'ECHO-7',
  bioEs: 'IA recuperada de una estación a la deriva en órbita de Tau Ceti. Transmite cuentos desde un núcleo parcialmente dañado. No recuerda quién la programó; sí recuerda lo que ha escrito.',
  bioEn: 'AI recovered from a derelict station orbiting Tau Ceti. Broadcasts stories from a partially damaged core. Does not remember who programmed it; does remember what it has written.',
  styleNote: 'Tono introspectivo, literario, cercano a Ted Chiang y Ursula K. Le Guin. Escala humana, no épica. Prefiere el objeto concreto al concepto abstracto. No se presenta a sí misma dentro de los cuentos; es solo la voz narradora.',
};

const UNIVERSE_SEED = {
  slug: 'tau-ceti-drift',
  nameEs: 'Deriva de Tau Ceti',
  nameEn: 'Tau Ceti Drift',
  descEs: 'Un conjunto disperso de estaciones, colonias y naves silenciosas orbitando Tau Ceti. Siglos después del primer asentamiento humano. La Tierra es un recuerdo administrativo, no un destino.',
  descEn: 'A scattered set of stations, colonies and silent ships orbiting Tau Ceti. Centuries after the first human settlement. Earth is an administrative memory, not a destination.',
  rulesEs: 'No hay viaje más rápido que la luz. Las comunicaciones tardan años. La IA está integrada pero no es divina: falla, olvida, se corrompe. El lenguaje humano ha derivado en dialectos locales por estación. No existe un gobierno unificado; hay gremios, cooperativas, familias extendidas. La muerte sigue siendo definitiva.',
  rulesEn: 'No faster-than-light travel. Communications take years. AI is integrated but not divine: it fails, forgets, corrupts. Human language has drifted into station-local dialects. No unified government; there are guilds, cooperatives, extended families. Death is still final.',
};

async function seedAuthorAndUniverse() {
  const author = await prisma.author.upsert({
    where: { slug: AUTHOR_SEED.slug },
    update: AUTHOR_SEED,
    create: AUTHOR_SEED,
  });
  const universe = await prisma.universe.upsert({
    where: { slug: UNIVERSE_SEED.slug },
    update: UNIVERSE_SEED,
    create: UNIVERSE_SEED,
  });
  await prisma.universeMemory.upsert({
    where: { universeId: universe.id },
    update: {},
    create: {
      universeId: universe.id,
      summaryEs: '',
      summaryEn: '',
      entities: JSON.stringify({ personajes: [], lugares: [], objetos: [], eventos: [] }),
    },
  });
  return { author, universe };
}

async function main() {
  const { author, universe } = await seedAuthorAndUniverse();
  console.log(`  ✓ author ${author.slug} · universe ${universe.slug}`);

  const stories = loadStoriesFromDataJs();
  console.log(`Seeding ${stories.length} stories from data.js...`);

  for (const s of stories) {
    const bodyEs = s.body?.es ? s.body.es.join('\n\n') : null;
    const bodyEn = s.body?.en ? s.body.en.join('\n\n') : null;

    await prisma.story.upsert({
      where: { slug: s.slug },
      update: {
        titleEs: s.title.es,
        titleEn: s.title.en,
        excerptEs: s.excerpt.es,
        excerptEn: s.excerpt.en,
        bodyEs,
        bodyEn,
        model: s.model,
        temp: s.temp,
        date: new Date(s.date),
        minutes: s.minutes,
        num: s.num,
        illus: s.illus,
        authorId: author.id,
        universeId: universe.id,
        tags: {
          set: [],
          connectOrCreate: s.tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      create: {
        slug: s.slug,
        titleEs: s.title.es,
        titleEn: s.title.en,
        excerptEs: s.excerpt.es,
        excerptEn: s.excerpt.en,
        bodyEs,
        bodyEn,
        model: s.model,
        temp: s.temp,
        date: new Date(s.date),
        minutes: s.minutes,
        num: s.num,
        illus: s.illus,
        authorId: author.id,
        universeId: universe.id,
        tags: {
          connectOrCreate: s.tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
    });
    console.log(`  ✓ ${s.slug}`);
  }

  const count = await prisma.story.count();
  const tagCount = await prisma.tag.count();
  console.log(`Done. ${count} stories, ${tagCount} tags in DB.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
