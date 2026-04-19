import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../prisma/stories-export.json');

const stories = await prisma.story.findMany({
  orderBy: { num: 'asc' },
  include: { tags: true },
});

const payload = stories.map((s) => ({
  slug: s.slug,
  titleEs: s.titleEs,
  titleEn: s.titleEn,
  excerptEs: s.excerptEs,
  excerptEn: s.excerptEn,
  bodyEs: s.bodyEs,
  bodyEn: s.bodyEn,
  model: s.model,
  temp: s.temp,
  date: s.date.toISOString(),
  minutes: s.minutes,
  num: s.num,
  illus: s.illus,
  illusData: s.illusData,
  likes: s.likes,
  tags: s.tags.map((t) => t.name),
}));

writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8');
console.log(`exported ${payload.length} stories → ${OUT}`);
await prisma.$disconnect();
