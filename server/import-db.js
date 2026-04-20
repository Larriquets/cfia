import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));
const IN = resolve(__dirname, '../prisma/stories-export.json');

const raw = JSON.parse(readFileSync(IN, 'utf8'));

const isV2 = raw && typeof raw === 'object' && raw.version === 2 && Array.isArray(raw.stories);
const data = isV2 ? raw : {
  version: 1,
  authors: [],
  universes: [],
  universeMemory: [],
  stories: Array.isArray(raw) ? raw : [],
};

const stats = {
  authors: { created: 0, updated: 0 },
  universes: { created: 0, updated: 0 },
  memories: { upserted: 0 },
  stories: { created: 0, updated: 0, linkedParent: 0 },
  tags: { created: 0 },
};

const authorIdBySlug = new Map();
for (const a of data.authors || []) {
  const existing = await prisma.author.findUnique({ where: { slug: a.slug } });
  if (existing) {
    const up = await prisma.author.update({
      where: { id: existing.id },
      data: { name: a.name, bioEs: a.bioEs, bioEn: a.bioEn, styleNote: a.styleNote },
    });
    authorIdBySlug.set(a.slug, up.id);
    stats.authors.updated++;
  } else {
    const created = await prisma.author.create({
      data: { slug: a.slug, name: a.name, bioEs: a.bioEs, bioEn: a.bioEn, styleNote: a.styleNote },
    });
    authorIdBySlug.set(a.slug, created.id);
    stats.authors.created++;
  }
}

const universeIdBySlug = new Map();
for (const u of data.universes || []) {
  const existing = await prisma.universe.findUnique({ where: { slug: u.slug } });
  if (existing) {
    const up = await prisma.universe.update({
      where: { id: existing.id },
      data: {
        nameEs: u.nameEs, nameEn: u.nameEn,
        descEs: u.descEs, descEn: u.descEn,
        rulesEs: u.rulesEs, rulesEn: u.rulesEn,
      },
    });
    universeIdBySlug.set(u.slug, up.id);
    stats.universes.updated++;
  } else {
    const created = await prisma.universe.create({
      data: {
        slug: u.slug,
        nameEs: u.nameEs, nameEn: u.nameEn,
        descEs: u.descEs, descEn: u.descEn,
        rulesEs: u.rulesEs, rulesEn: u.rulesEn,
      },
    });
    universeIdBySlug.set(u.slug, created.id);
    stats.universes.created++;
  }
}

for (const m of data.universeMemory || []) {
  const universeId = universeIdBySlug.get(m.universeSlug);
  if (!universeId) continue;
  await prisma.universeMemory.upsert({
    where: { universeId },
    update: { summaryEs: m.summaryEs, summaryEn: m.summaryEn, entities: m.entities },
    create: { universeId, summaryEs: m.summaryEs, summaryEn: m.summaryEn, entities: m.entities },
  });
  stats.memories.upserted++;
}

const storyIdBySlug = new Map();
const pendingParentLinks = [];

for (const s of data.stories || []) {
  const authorId = s.authorSlug ? authorIdBySlug.get(s.authorSlug) ?? null : null;
  const universeId = s.universeSlug ? universeIdBySlug.get(s.universeSlug) ?? null : null;

  const base = {
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
    form: s.form ?? null,
    likes: s.likes ?? 0,
    authorId,
    universeId,
  };

  const existing = await prisma.story.findUnique({ where: { slug: s.slug } });
  let row;
  if (existing) {
    row = await prisma.story.update({
      where: { id: existing.id },
      data: {
        ...base,
        tags: {
          set: [],
          connectOrCreate: (s.tags || []).map((name) => ({ where: { name }, create: { name } })),
        },
      },
    });
    stats.stories.updated++;
  } else {
    row = await prisma.story.create({
      data: {
        ...base,
        tags: {
          connectOrCreate: (s.tags || []).map((name) => ({ where: { name }, create: { name } })),
        },
      },
    });
    stats.stories.created++;
  }
  storyIdBySlug.set(s.slug, row.id);
  if (s.parentSlug) pendingParentLinks.push({ childSlug: s.slug, parentSlug: s.parentSlug });
}

for (const { childSlug, parentSlug } of pendingParentLinks) {
  const childId = storyIdBySlug.get(childSlug);
  const parentId = storyIdBySlug.get(parentSlug);
  if (!childId || !parentId) continue;
  await prisma.story.update({ where: { id: childId }, data: { parentId } });
  stats.stories.linkedParent++;
}

console.log('import done:');
console.log(`  authors    → created ${stats.authors.created}, updated ${stats.authors.updated}`);
console.log(`  universes  → created ${stats.universes.created}, updated ${stats.universes.updated}`);
console.log(`  memories   → upserted ${stats.memories.upserted}`);
console.log(`  stories    → created ${stats.stories.created}, updated ${stats.stories.updated}, parent links ${stats.stories.linkedParent}`);
await prisma.$disconnect();
