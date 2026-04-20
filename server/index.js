import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { generateStory } from './generate.js';
import { generateStoryGemini } from './generateGemini.js';
import { findOverusedWords } from './titleGuard.js';
import { pickCreativityKnobs } from './creativityKnobs.js';
import { loadDefaultContext, buildContextBlock } from './universeContext.js';
import { updateUniverseMemory } from './universeMemory.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');

const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

function requireCreatePassword(req, res, next) {
  const expected = process.env.CREATE_PASSWORD;
  if (!expected) {
    return res.status(500).json({ error: 'CREATE_PASSWORD no está seteada en el server' });
  }
  const got = req.get('x-create-auth') || '';
  if (got !== expected) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

app.post('/api/auth/check', (req, res) => {
  const expected = process.env.CREATE_PASSWORD;
  if (!expected) return res.status(500).json({ error: 'CREATE_PASSWORD no está seteada' });
  const { password } = req.body || {};
  if (password !== expected) return res.status(401).json({ error: 'bad password' });
  res.json({ ok: true });
});

function serialize(story) {
  return {
    slug: story.slug,
    title: { es: story.titleEs, en: story.titleEn },
    excerpt: { es: story.excerptEs, en: story.excerptEn },
    body:
      story.bodyEs || story.bodyEn
        ? {
            es: story.bodyEs ? story.bodyEs.split('\n\n') : null,
            en: story.bodyEn ? story.bodyEn.split('\n\n') : null,
          }
        : undefined,
    model: story.model,
    temp: story.temp,
    date: story.date.toISOString().slice(0, 10),
    minutes: story.minutes,
    num: story.num,
    illus: story.illus,
    illusData: story.illusData ? JSON.parse(story.illusData) : null,
    likes: story.likes ?? 0,
    tags: story.tags.map((t) => t.name),
    form: story.form || null,
    author: story.author ? { slug: story.author.slug, name: story.author.name } : null,
    universe: story.universe ? { slug: story.universe.slug, name: { es: story.universe.nameEs, en: story.universe.nameEn } } : null,
    parentSlug: story.parent ? story.parent.slug : null,
    parent: story.parent
      ? { slug: story.parent.slug, title: { es: story.parent.titleEs, en: story.parent.titleEn }, num: story.parent.num }
      : null,
    children: Array.isArray(story.children)
      ? story.children.map((c) => ({ slug: c.slug, title: { es: c.titleEs, en: c.titleEn }, num: c.num }))
      : [],
  };
}

app.get('/api/stories', async (_req, res) => {
  const stories = await prisma.story.findMany({
    orderBy: { date: 'desc' },
    include: { tags: true, author: true, universe: true, parent: true, children: true },
  });
  res.json(stories.map(serialize));
});

app.post('/api/stories/:slug/like', async (req, res) => {
  try {
    const story = await prisma.story.update({
      where: { slug: req.params.slug },
      data: { likes: { increment: 1 } },
      include: { tags: true, author: true, universe: true, parent: true, children: true },
    });
    res.json({ slug: story.slug, likes: story.likes });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'not found' });
    console.error('like error:', e);
    res.status(500).json({ error: e.message || 'like failed' });
  }
});

app.delete('/api/stories/:slug/like', async (req, res) => {
  try {
    const current = await prisma.story.findUnique({ where: { slug: req.params.slug } });
    if (!current) return res.status(404).json({ error: 'not found' });
    const next = Math.max(0, (current.likes ?? 0) - 1);
    const story = await prisma.story.update({
      where: { slug: req.params.slug },
      data: { likes: next },
    });
    res.json({ slug: story.slug, likes: story.likes });
  } catch (e) {
    console.error('unlike error:', e);
    res.status(500).json({ error: e.message || 'unlike failed' });
  }
});

app.get('/api/stories/:slug', async (req, res) => {
  const story = await prisma.story.findUnique({
    where: { slug: req.params.slug },
    include: { tags: true, author: true, universe: true, parent: true, children: true },
  });
  if (!story) return res.status(404).json({ error: 'not found' });
  res.json(serialize(story));
});

app.get('/api/stories/:slug/related', async (req, res) => {
  const LIMIT = 4;
  try {
    const story = await prisma.story.findUnique({
      where: { slug: req.params.slug },
      include: { tags: true, parent: true, children: true },
    });
    if (!story) return res.status(404).json({ error: 'not found' });

    const picked = new Map();
    const tagNames = story.tags.map((t) => t.name);

    const add = (s, reason) => {
      if (!s || s.slug === story.slug || picked.has(s.slug)) return;
      picked.set(s.slug, { slug: s.slug, title: { es: s.titleEs, en: s.titleEn }, num: s.num, reason });
    };

    if (story.parent) add(story.parent, 'parent');
    for (const c of story.children || []) add(c, 'child');

    if (story.parentId && picked.size < LIMIT) {
      const siblings = await prisma.story.findMany({
        where: { parentId: story.parentId, id: { not: story.id } },
        select: { slug: true, titleEs: true, titleEn: true, num: true },
        orderBy: { date: 'desc' },
      });
      for (const s of siblings) {
        if (picked.size >= LIMIT) break;
        add(s, 'sibling');
      }
    }

    if (picked.size < LIMIT && tagNames.length) {
      const sameTag = await prisma.story.findMany({
        where: {
          id: { not: story.id },
          universeId: story.universeId ?? undefined,
          tags: { some: { name: { in: tagNames } } },
        },
        select: { slug: true, titleEs: true, titleEn: true, num: true },
        orderBy: { date: 'desc' },
        take: 12,
      });
      for (const s of sameTag) {
        if (picked.size >= LIMIT) break;
        add(s, 'tag');
      }
    }

    if (picked.size < LIMIT) {
      const recent = await prisma.story.findMany({
        where: {
          id: { not: story.id },
          universeId: story.universeId ?? undefined,
        },
        select: { slug: true, titleEs: true, titleEn: true, num: true },
        orderBy: { date: 'desc' },
        take: 12,
      });
      for (const s of recent) {
        if (picked.size >= LIMIT) break;
        add(s, 'recent');
      }
    }

    res.json({ items: Array.from(picked.values()) });
  } catch (e) {
    console.error('related error:', e);
    res.status(500).json({ error: e.message || 'related failed' });
  }
});

app.get('/api/universe', async (_req, res) => {
  const universe = await prisma.universe.findUnique({
    where: { slug: 'tau-ceti-drift' },
    include: { memory: true },
  });
  if (!universe) return res.status(404).json({ error: 'not found' });
  const author = await prisma.author.findUnique({ where: { slug: 'echo-7' } });
  res.json({
    author: author ? { slug: author.slug, name: author.name, bio: { es: author.bioEs, en: author.bioEn } } : null,
    universe: {
      slug: universe.slug,
      name: { es: universe.nameEs, en: universe.nameEn },
      desc: { es: universe.descEs, en: universe.descEn },
      rules: { es: universe.rulesEs, en: universe.rulesEn },
    },
    memory: universe.memory ? {
      summary: { es: universe.memory.summaryEs, en: universe.memory.summaryEn },
      entities: (() => { try { return JSON.parse(universe.memory.entities); } catch { return null; } })(),
      updatedAt: universe.memory.updatedAt,
    } : null,
  });
});

async function uniqueSlug(base, num) {
  let slug = base || `cuento-${num}`;
  let i = 1;
  while (await prisma.story.findUnique({ where: { slug } })) {
    slug = `${base}-${++i}`;
  }
  return slug;
}

async function persistStory({ gen, modelLabel, temp, tags, authorId = null, universeId = null, parentId = null, form = null }) {
  const last = await prisma.story.findFirst({ orderBy: { num: 'desc' } });
  const num = (last?.num ?? 0) + 1;
  const slug = await uniqueSlug(gen.slugBase, num);

  return prisma.story.create({
    data: {
      slug,
      titleEs: gen.titleEs,
      titleEn: gen.titleEn,
      excerptEs: gen.excerptEs,
      excerptEn: gen.excerptEn,
      bodyEs: gen.bodyEs.join('\n\n'),
      bodyEn: gen.bodyEn.join('\n\n'),
      model: modelLabel.toUpperCase(),
      temp,
      date: new Date(),
      minutes: gen.minutes,
      num,
      illus: gen.illus,
      illusData: gen.illusData ? JSON.stringify(gen.illusData) : null,
      authorId,
      universeId,
      parentId,
      form,
      tags: {
        connectOrCreate: tags.map((name) => ({
          where: { name: name.toUpperCase() },
          create: { name: name.toUpperCase() },
        })),
      },
    },
    include: { tags: true, author: true, universe: true, parent: true, children: true },
  });
}

app.post('/api/stories/generate', requireCreatePassword, async (req, res) => {
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Keep-Alive', 'timeout=120');
  try {
    const {
      tags = [],
      provider = 'anthropic',
      model,
      temp = 0.9,
      prompt = '',
      length = 'medium',
      form = null,
    } = req.body || {};

    const wantClaude = provider === 'anthropic' || provider === 'both';
    const wantGemini = provider === 'google' || provider === 'both';

    if (wantClaude && !process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY no está seteada en .env' });
    }
    if (wantGemini && !process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY no está seteada en .env' });
    }

    const claudeModel = (!model || provider === 'both' || provider === 'google') ? 'claude-sonnet-4-5' : model;
    const geminiModel = (!model || provider === 'both' || provider === 'anthropic') ? 'gemini-2.5-flash' : model;

    const recentRows = await prisma.story.findMany({
      orderBy: { date: 'desc' },
      take: 30,
      select: { titleEs: true, titleEn: true },
    });
    const recentTitles = recentRows.flatMap((r) => [r.titleEs, r.titleEn].filter(Boolean));
    const overusedWords = findOverusedWords(recentTitles, 2);

    const ctx = await loadDefaultContext();
    const contextBlock = buildContextBlock({ author: ctx.author, universe: ctx.universe, lang: 'es' });

    const formId = form && form !== 'random' ? form : null;
    const claudeKnobs = wantClaude ? pickCreativityKnobs({ formId }) : null;
    let geminiKnobs = wantGemini ? pickCreativityKnobs({ formId }) : null;
    if (!formId && claudeKnobs && geminiKnobs && claudeKnobs.form.id === geminiKnobs.form.id) {
      geminiKnobs = pickCreativityKnobs({ seed: geminiKnobs.seed + 7 });
    }
    if (claudeKnobs) console.log(`[knobs claude] form=${claudeKnobs.form.id} object="${claudeKnobs.object}"`);
    if (geminiKnobs) console.log(`[knobs gemini] form=${geminiKnobs.form.id} object="${geminiKnobs.object}"`);

    const t0 = Date.now();
    const withTimeout = (p, ms, label) =>
      Promise.race([
        p,
        new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timeout after ${ms / 1000}s`)), ms)),
      ]);

    const GEN_TIMEOUT_MS = length === 'long' ? 180000 : length === 'short' ? 60000 : 100000;
    const tasks = [];
    if (wantClaude) {
      tasks.push({
        provider: 'claude',
        promise: withTimeout(
          generateStory({ tags, model: claudeModel, temp, prompt, length, recentTitles, overusedWords, knobs: claudeKnobs, contextBlock }),
          GEN_TIMEOUT_MS, 'claude'
        ).then((gen) => {
          console.log(`[generate] claude done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
          return { gen, modelLabel: claudeModel };
        }),
      });
    }
    if (wantGemini) {
      tasks.push({
        provider: 'gemini',
        promise: withTimeout(
          generateStoryGemini({ tags, model: geminiModel, temp, prompt, length, recentTitles, overusedWords, knobs: geminiKnobs, contextBlock }),
          GEN_TIMEOUT_MS, 'gemini'
        ).then((gen) => {
          console.log(`[generate] gemini done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
          return { gen, modelLabel: geminiModel };
        }),
      });
    }

    req.setTimeout(300000);
    res.setTimeout(300000);
    const results = await Promise.allSettled(tasks.map((t) => t.promise));
    console.log(`[generate] all settled in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    const ok = [];
    const errs = [];
    results.forEach((r, i) => {
      const prov = tasks[i].provider;
      if (r.status === 'fulfilled') {
        ok.push(r.value);
      } else {
        const msg = r.reason?.message || String(r.reason);
        console.error(`[generate] ${prov} failed:`, r.reason);
        errs.push(`${prov}: ${msg}`);
      }
    });

    if (!ok.length) {
      return res.status(500).json({ error: errs.join(' · ') || 'generation failed' });
    }

    const stories = [];
    for (const { gen, modelLabel } of ok) {
      const story = await persistStory({
        gen, modelLabel, temp, tags,
        authorId: ctx.author?.id ?? null,
        universeId: ctx.universe?.id ?? null,
        form: gen.knobs?.form?.id ?? null,
      });
      stories.push(serialize(story));
    }

    if (provider === 'both') {
      res.json({ stories, errors: errs });
    } else {
      res.json(stories[0]);
    }

    if (ctx.universe?.id) {
      for (const { gen } of ok) {
        updateUniverseMemory({ universeId: ctx.universe.id, story: gen })
          .catch((e) => console.error('[memory] update failed:', e?.message || e));
      }
    }
    return;
  } catch (e) {
    console.error('generate error:', e);
    res.status(500).json({ error: e.message || 'generation failed' });
  }
});

app.get('/api/stories/:slug/expand-context', async (req, res) => {
  try {
    const parent = await prisma.story.findUnique({
      where: { slug: req.params.slug },
      include: { tags: true, author: true, universe: true },
    });
    if (!parent) return res.status(404).json({ error: 'not found' });

    const ancestors = [];
    let cursor = parent.parentId ? await prisma.story.findUnique({ where: { id: parent.parentId }, select: { id: true, slug: true, num: true, titleEs: true, titleEn: true, excerptEs: true, parentId: true } }) : null;
    let depth = 0;
    while (cursor && depth < 5) {
      ancestors.push(cursor);
      cursor = cursor.parentId ? await prisma.story.findUnique({ where: { id: cursor.parentId }, select: { id: true, slug: true, num: true, titleEs: true, titleEn: true, excerptEs: true, parentId: true } }) : null;
      depth += 1;
    }

    const ctx = await loadDefaultContext();
    const contextBlock = buildContextBlock({ author: ctx.author, universe: ctx.universe, lang: 'es' });

    const parentBody = parent.bodyEs || parent.excerptEs;
    const ancestorsBlock = ancestors.length
      ? ancestors.map((a, i) => `${i + 1}. [${String(a.num).padStart(3, '0')}] ${a.titleEs} — ${a.excerptEs}`).join('\n')
      : '';

    res.json({
      parent: {
        slug: parent.slug,
        num: parent.num,
        titleEs: parent.titleEs,
        titleEn: parent.titleEn,
        tags: parent.tags.map((t) => t.name),
        form: parent.form,
        bodyPreview: parentBody,
        bodyChars: parentBody.length,
      },
      ancestors: ancestors.map((a) => ({
        slug: a.slug,
        num: a.num,
        titleEs: a.titleEs,
        titleEn: a.titleEn,
        excerptEs: a.excerptEs,
      })),
      author: ctx.author ? { name: ctx.author.name, styleNote: ctx.author.styleNote } : null,
      universe: ctx.universe ? {
        name: { es: ctx.universe.nameEs, en: ctx.universe.nameEn },
        rulesEs: ctx.universe.rulesEs,
        memory: ctx.universe.memory ? {
          summaryEs: ctx.universe.memory.summaryEs,
          entities: (() => { try { return JSON.parse(ctx.universe.memory.entities); } catch { return null; } })(),
          updatedAt: ctx.universe.memory.updatedAt,
        } : null,
      } : null,
      blocks: {
        contextBlock,
        ancestorsBlock,
      },
      stats: {
        contextBlockChars: contextBlock.length,
        ancestorsCount: ancestors.length,
        parentBodyChars: parentBody.length,
        totalChars: contextBlock.length + parentBody.length + ancestorsBlock.length,
      },
    });
  } catch (e) {
    console.error('expand-context error:', e);
    res.status(500).json({ error: e.message || 'context failed' });
  }
});

app.post('/api/stories/:slug/expand', requireCreatePassword, async (req, res) => {
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Keep-Alive', 'timeout=120');
  try {
    const parent = await prisma.story.findUnique({
      where: { slug: req.params.slug },
      include: { tags: true, author: true, universe: true },
    });
    if (!parent) return res.status(404).json({ error: 'not found' });

    const { provider = 'anthropic', model, temp = 0.9, angle = 'auto', length = 'medium', form = null, prompt = '' } = req.body || {};
    const curatorPrompt = typeof prompt === 'string' ? prompt.trim() : '';
    const wantClaude = provider === 'anthropic';
    const wantGemini = provider === 'google';
    if (wantClaude && !process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY no está seteada' });
    if (wantGemini && !process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY no está seteada' });

    const claudeModel = model || 'claude-sonnet-4-5';
    const geminiModel = model || 'gemini-2.5-flash';

    const recentRows = await prisma.story.findMany({
      orderBy: { date: 'desc' }, take: 30,
      select: { titleEs: true, titleEn: true },
    });
    const recentTitles = recentRows.flatMap((r) => [r.titleEs, r.titleEn].filter(Boolean));
    const overusedWords = findOverusedWords(recentTitles, 2);

    const ctx = await loadDefaultContext();
    const contextBlock = buildContextBlock({ author: ctx.author, universe: ctx.universe, lang: 'es' });

    const angleLabels = {
      auto: 'Elegí vos el ángulo más potente (secuela, precuela, lateral o eco).',
      secuela: 'Continuación directa: mismos personajes, después de los hechos del cuento padre.',
      precuela: 'Precuela: cómo se llegó a la situación del cuento padre.',
      lateral: 'Lateral: otro personaje viviendo el mismo evento desde otro ángulo.',
      eco: 'Eco: mismo lugar u objeto, otro tiempo o generación.',
    };
    const angleNote = angleLabels[angle] || angleLabels.auto;

    const parentBody = parent.bodyEs || parent.excerptEs;

    const ancestors = [];
    let cursor = parent.parentId ? await prisma.story.findUnique({ where: { id: parent.parentId }, select: { id: true, slug: true, num: true, titleEs: true, titleEn: true, excerptEs: true, parentId: true } }) : null;
    let depth = 0;
    while (cursor && depth < 5) {
      ancestors.push(cursor);
      cursor = cursor.parentId ? await prisma.story.findUnique({ where: { id: cursor.parentId }, select: { id: true, slug: true, num: true, titleEs: true, titleEn: true, excerptEs: true, parentId: true } }) : null;
      depth += 1;
    }
    const ancestorsBlock = ancestors.length
      ? `

CADENA DE ANCESTROS (del más cercano al más lejano, NO son el padre directo — son contexto previo del hilo):
${ancestors.map((a, i) => `${i + 1}. [${String(a.num).padStart(3, '0')}] ${a.titleEs} — ${a.excerptEs}`).join('\n')}`
      : '';

    const curatorBlock = curatorPrompt
      ? `

INDICACIÓN DEL CURADOR (priorizar sobre lo demás si hay conflicto, salvo las reglas del universo):
${curatorPrompt}`
      : '';
    const extraUser = `
EXPANDIR CUENTO PADRE
=====================
Título padre: ${parent.titleEs} / ${parent.titleEn}
Slug padre: ${parent.slug}
Tags del padre: ${parent.tags.map((t) => t.name).join(', ')}

Cuerpo del cuento padre:
${parentBody}${ancestorsBlock}

=====================
Escribí un NUEVO cuento que expanda este. Ángulo: ${angleNote}
Elegí UN ángulo, no mezcles. El cuento debe poder leerse solo, pero gana leído después del padre. No repitas la trama del padre ni de los ancestros; extendela. Respetá la continuidad del hilo.${curatorBlock}`;

    const parentTags = parent.tags.map((t) => t.name);
    const inheritedForm = parent.form || null;
    const overrideForm = form && form !== 'inherit' && form !== 'random' ? form : null;
    const effectiveFormId = overrideForm || inheritedForm;
    const knobs = pickCreativityKnobs({ formId: effectiveFormId });
    const formSource = overrideForm ? 'override' : (inheritedForm ? 'inherited' : 'random');
    console.log(`[expand] parent=${parent.slug} ancestors=${ancestors.length} angle=${angle} provider=${provider} form=${knobs.form.id} (${formSource}) prompt=${curatorPrompt ? curatorPrompt.slice(0, 60) : '∅'}`);

    const withTimeout = (p, ms, label) =>
      Promise.race([
        p,
        new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timeout after ${ms / 1000}s`)), ms)),
      ]);
    const GEN_TIMEOUT_MS = length === 'long' ? 180000 : length === 'short' ? 60000 : 100000;

    let gen, modelLabel;
    if (wantGemini) {
      modelLabel = geminiModel;
      gen = await withTimeout(
        generateStoryGemini({ tags: parentTags, model: geminiModel, temp, prompt: '', length, recentTitles, overusedWords, knobs, contextBlock, extraUser }),
        GEN_TIMEOUT_MS, 'gemini',
      );
    } else {
      modelLabel = claudeModel;
      gen = await withTimeout(
        generateStory({ tags: parentTags, model: claudeModel, temp, prompt: '', length, recentTitles, overusedWords, knobs, contextBlock, extraUser }),
        GEN_TIMEOUT_MS, 'claude',
      );
    }

    req.setTimeout(300000);
    res.setTimeout(300000);

    const story = await persistStory({
      gen, modelLabel, temp, tags: parentTags,
      authorId: ctx.author?.id ?? null,
      universeId: ctx.universe?.id ?? null,
      parentId: parent.id,
      form: gen.knobs?.form?.id ?? inheritedForm,
    });

    const full = await prisma.story.findUnique({
      where: { id: story.id },
      include: { tags: true, author: true, universe: true, parent: true, children: true },
    });
    res.json(serialize(full));

    if (ctx.universe?.id) {
      updateUniverseMemory({ universeId: ctx.universe.id, story: gen })
        .catch((e) => console.error('[memory] update failed:', e?.message || e));
    }
  } catch (e) {
    console.error('expand error:', e);
    res.status(500).json({ error: e.message || 'expand failed' });
  }
});

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use('/assets', express.static(path.join(ROOT, 'assets')));
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

const server = app.listen(PORT, () => {
  console.log(`api listening on http://localhost:${PORT}`);
});
server.keepAliveTimeout = 75000;
server.headersTimeout = 76000;
server.requestTimeout = 0;
