import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../prisma/stories-export.json');

const [authors, universes, memories, stories, coParents] = await Promise.all([
  prisma.author.findMany({ orderBy: { id: 'asc' } }),
  prisma.universe.findMany({ orderBy: { id: 'asc' } }),
  prisma.universeMemory.findMany({ orderBy: { id: 'asc' } }),
  prisma.story.findMany({
    orderBy: { num: 'asc' },
    include: { tags: true, author: true, universe: true, parent: true },
  }),
  prisma.storyCoParent.findMany({ include: { child: { select: { slug: true } }, parent: { select: { slug: true } } } }),
]);

const payload = {
  version: 2,
  exportedAt: new Date().toISOString(),
  authors: authors.map((a) => ({
    slug: a.slug,
    name: a.name,
    bioEs: a.bioEs,
    bioEn: a.bioEn,
    styleNote: a.styleNote,
  })),
  universes: universes.map((u) => ({
    slug: u.slug,
    nameEs: u.nameEs,
    nameEn: u.nameEn,
    descEs: u.descEs,
    descEn: u.descEn,
    rulesEs: u.rulesEs,
    rulesEn: u.rulesEn,
  })),
  universeMemory: memories.map((m) => {
    const u = universes.find((x) => x.id === m.universeId);
    return {
      universeSlug: u?.slug,
      summaryEs: m.summaryEs,
      summaryEn: m.summaryEn,
      entities: m.entities,
    };
  }).filter((m) => m.universeSlug),
  stories: stories.map((s) => ({
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
    form: s.form,
    likes: s.likes,
    tags: s.tags.map((t) => t.name),
    authorSlug: s.author?.slug ?? null,
    universeSlug: s.universe?.slug ?? null,
    parentSlug: s.parent?.slug ?? null,
  })),
  coParents: coParents
    .filter((cp) => cp.child?.slug && cp.parent?.slug)
    .map((cp) => ({ childSlug: cp.child.slug, parentSlug: cp.parent.slug })),
};

writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8');
console.log(`exported → ${OUT}`);
console.log(`  authors: ${payload.authors.length}`);
console.log(`  universes: ${payload.universes.length}`);
console.log(`  universeMemory: ${payload.universeMemory.length}`);
console.log(`  stories: ${payload.stories.length}`);
console.log(`  coParents: ${payload.coParents.length}`);
await prisma.$disconnect();
