import 'dotenv/config';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { generateStory } from './generate.js';

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

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

app.get('/api/stories/:slug', async (req, res) => {
  const story = await prisma.story.findUnique({
    where: { slug: req.params.slug },
    include: { tags: true },
  });
  if (!story) return res.status(404).json({ error: 'not found' });
  res.json(serialize(story));
});

app.post('/api/stories/generate', async (req, res) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY no está seteada en .env' });
    }

    const { tags = [], model = 'claude-sonnet-4-5', temp = 0.9, prompt = '', length = 'medium' } = req.body || {};

    const gen = await generateStory({ tags, model, temp, prompt, length });

    const last = await prisma.story.findFirst({ orderBy: { num: 'desc' } });
    const num = (last?.num ?? 0) + 1;

    let slug = gen.slugBase || `cuento-${num}`;
    let i = 1;
    while (await prisma.story.findUnique({ where: { slug } })) {
      slug = `${gen.slugBase}-${++i}`;
    }

    const story = await prisma.story.create({
      data: {
        slug,
        titleEs: gen.titleEs,
        titleEn: gen.titleEn,
        excerptEs: gen.excerptEs,
        excerptEn: gen.excerptEn,
        bodyEs: gen.bodyEs.join('\n\n'),
        bodyEn: gen.bodyEn.join('\n\n'),
        model: model.toUpperCase(),
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

    res.json(serialize(story));
  } catch (e) {
    console.error('generate error:', e);
    res.status(500).json({ error: e.message || 'generation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`api listening on http://localhost:${PORT}`);
});
