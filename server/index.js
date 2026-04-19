import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`api listening on http://localhost:${PORT}`);
});
