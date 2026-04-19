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

async function main() {
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
