import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));
const IN = resolve(__dirname, '../prisma/stories-export.json');

const data = JSON.parse(readFileSync(IN, 'utf8'));

let created = 0;
let skipped = 0;

for (const s of data) {
  const existing = await prisma.story.findUnique({ where: { slug: s.slug } });
  if (existing) {
    skipped++;
    continue;
  }
  await prisma.story.create({
    data: {
      slug: s.slug,
      titleEs: s.titleEs,
      titleEn: s.titleEn,
      excerptEs: s.excerptEs,
      excerptEn: s.excerptEn,
      bodyEs: s.bodyEs,
      bodyEn: s.bodyEn,
      model: s.model,
      temp: s.temp,
      date: new Date(s.date),
      minutes: s.minutes,
      num: s.num,
      illus: s.illus,
      illusData: s.illusData,
      likes: s.likes ?? 0,
      tags: {
        connectOrCreate: (s.tags || []).map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
  });
  created++;
}

console.log(`import done: ${created} created, ${skipped} skipped (already present)`);
await prisma.$disconnect();
