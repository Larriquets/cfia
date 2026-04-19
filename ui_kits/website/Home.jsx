import React from 'react';

function Home({ stories, lang, onOpen, onNav }) {
  const { StoryCard, Illustration } = window;
  const featured = stories[0];
  const rest = stories.slice(1);
  const t = lang === 'es'
    ? { eyebrow: 'COLECCIÓN 2026 · 247 CUENTOS', hero1: 'Cientos de cuentos', hero2: 'de ciencia ficción.', hero3: 'Escritos por máquinas.', hero4: 'Curados por humanos.', featBadge: 'CUENTO DESTACADO', read: 'Leer cuento', latest: 'MÁS RECIENTES', seeAll: 'Ver catálogo completo →' }
    : { eyebrow: 'COLLECTION 2026 · 247 STORIES', hero1: 'Hundreds of short', hero2: 'science-fiction stories.', hero3: 'Written by machines.', hero4: 'Curated by humans.', featBadge: 'FEATURED STORY', read: 'Read story', latest: 'LATEST', seeAll: 'See full catalog →' };
  return (
    <div style={homeStyles.root}>
      <section style={homeStyles.hero}>
        <div style={homeStyles.eyebrow}>◼ {t.eyebrow}</div>
        <h1 style={homeStyles.h1}>
          {t.hero1}<br />
          {t.hero2}<br />
          <span style={{ color: '#b8b5ad' }}>{t.hero3}</span><br />
          <span style={{ color: '#e8b84a' }}>{t.hero4}</span>
        </h1>
        <div style={homeStyles.heroMeta}>
          <span>PUB · {new Date().toISOString().slice(0, 10)}</span>
          <span>·</span>
          <span>ES / EN</span>
          <span>·</span>
          <span>CC-BY 4.0</span>
        </div>
      </section>

      <hr style={homeStyles.rule} />

      <section style={homeStyles.featuredSec}>
        <div style={homeStyles.featBadge}>{t.featBadge}</div>
        <StoryCard story={featured} lang={lang} onOpen={onOpen} featured={true} />
      </section>

      <hr style={homeStyles.rule} />

      <section style={homeStyles.grid}>
        <div style={homeStyles.gridHead}>
          <div style={homeStyles.eyebrow}>{t.latest}</div>
          <a style={homeStyles.seeAll} onClick={() => onNav('catalog')}>{t.seeAll}</a>
        </div>
        <div style={homeStyles.gridInner}>
          {rest.map(s => <StoryCard key={s.slug} story={s} lang={lang} onOpen={onOpen} />)}
        </div>
      </section>
    </div>
  );
}

const homeStyles = {
  root: { maxWidth: 1440, margin: '0 auto', padding: '0 40px' },
  hero: { padding: '96px 0 80px', display: 'flex', flexDirection: 'column', gap: 28 },
  eyebrow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#b8b5ad', textTransform: 'uppercase' },
  h1: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(48px, 7vw, 108px)', lineHeight: 1, letterSpacing: '-0.03em', fontWeight: 500, color: '#f5f3ee', margin: 0 },
  heroMeta: { display: 'flex', gap: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.14em', color: '#6b6860', textTransform: 'uppercase', marginTop: 12 },
  rule: { border: 0, borderTop: '2px solid #f5f3ee', margin: 0 },
  featuredSec: { padding: '48px 0', display: 'flex', flexDirection: 'column', gap: 18 },
  featBadge: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#e8b84a' },
  grid: { padding: '48px 0 0' },
  gridHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 },
  seeAll: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: '#f5f3ee', borderBottom: '1px solid #6b6860', cursor: 'pointer' },
  gridInner: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }
};

window.Home = Home;
