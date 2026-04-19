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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');

const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

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
  };
}

app.get('/api/stories', async (_req, res) => {
  const stories = await prisma.story.findMany({
    orderBy: { date: 'desc' },
    include: { tags: true },
  });
  res.json(stories.map(serialize));
});

app.post('/api/stories/:slug/like', async (req, res) => {
  try {
    const story = await prisma.story.update({
      where: { slug: req.params.slug },
      data: { likes: { increment: 1 } },
      include: { tags: true },
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
    include: { tags: true },
  });
  if (!story) return res.status(404).json({ error: 'not found' });
  res.json(serialize(story));
});

async function uniqueSlug(base, num) {
  let slug = base || `cuento-${num}`;
  let i = 1;
  while (await prisma.story.findUnique({ where: { slug } })) {
    slug = `${base}-${++i}`;
  }
  return slug;
}

async function persistStory({ gen, modelLabel, temp, tags }) {
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
      tags: {
        connectOrCreate: tags.map((name) => ({
          where: { name: name.toUpperCase() },
          create: { name: name.toUpperCase() },
        })),
      },
    },
    include: { tags: true },
  });
}

app.post('/api/stories/generate', async (req, res) => {
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

    const formId = form && form !== 'random' ? form : null;
    const claudeKnobs = wantClaude ? pickCreativityKnobs({ formId }) : null;
    let geminiKnobs = wantGemini ? pickCreativityKnobs({ formId }) : null;
    if (!formId && claudeKnobs && geminiKnobs && claudeKnobs.form.id === geminiKnobs.form.id) {
      geminiKnobs = pickCreativityKnobs({ seed: geminiKnobs.seed + 7 });
    }
    if (claudeKnobs) console.log(`[knobs claude] form=${claudeKnobs.form.id} object="${claudeKnobs.object}"`);
    if (geminiKnobs) console.log(`[knobs gemini] form=${geminiKnobs.form.id} object="${geminiKnobs.object}"`);

    const tasks = [];
    if (wantClaude) {
      tasks.push({
        provider: 'claude',
        promise: generateStory({ tags, model: claudeModel, temp, prompt, length, recentTitles, overusedWords, knobs: claudeKnobs })
          .then((gen) => ({ gen, modelLabel: claudeModel })),
      });
    }
    if (wantGemini) {
      tasks.push({
        provider: 'gemini',
        promise: generateStoryGemini({ tags, model: geminiModel, temp, prompt, length, recentTitles, overusedWords, knobs: geminiKnobs })
          .then((gen) => ({ gen, modelLabel: geminiModel })),
      });
    }

    const results = await Promise.allSettled(tasks.map((t) => t.promise));
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
      const story = await persistStory({ gen, modelLabel, temp, tags });
      stories.push(serialize(story));
    }

    if (provider === 'both') {
      return res.json({ stories, errors: errs });
    }
    res.json(stories[0]);
  } catch (e) {
    console.error('generate error:', e);
    res.status(500).json({ error: e.message || 'generation failed' });
  }
});

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use('/assets', express.static(path.join(ROOT, 'assets')));
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`api listening on http://localhost:${PORT}`);
});
