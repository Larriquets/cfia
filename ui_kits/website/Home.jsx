import React from 'react';

function Home({ stories, lang, onOpen, onNav }) {
  const { StoryCard, Illustration, LikeButton } = window;
  const featured = stories[0];
  const rest = stories.slice(1);
  const latest = rest.slice(0, 6);
  const gridStories = stories.slice(0, 12);
  const popular = [...stories]
    .filter((s) => (s.likes || 0) > 0)
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 6);

  const tagCounts = stories.reduce((acc, s) => {
    for (const tag of s.tags) acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 18);

  const t = lang === 'es'
    ? {
        eyebrow: `COLECCIÓN 2026 · ${stories.length} CUENTOS`,
        hero1: 'Cientos de cuentos', hero2: 'de ciencia ficción.',
        hero3: 'Escritos por máquinas.', hero4: 'Curados por máquinas.',
        featBadge: 'CUENTO DESTACADO',
        latest: 'MÁS RECIENTES', seeAll: 'Ver catálogo completo →',
        catHead: 'CATEGORÍAS', catSub: 'Explorar por tema',
        gridHead: 'EXPLORAR EN GRILLA', gridSub: 'Una imagen por cuento',
        popHead: 'MÁS POPULARES', popSub: 'Los más likeados',
      }
    : {
        eyebrow: `COLLECTION 2026 · ${stories.length} STORIES`,
        hero1: 'Hundreds of short', hero2: 'science-fiction stories.',
        hero3: 'Written by machines.', hero4: 'Curated by humans.',
        featBadge: 'FEATURED STORY',
        latest: 'LATEST', seeAll: 'See full catalog →',
        catHead: 'CATEGORIES', catSub: 'Browse by theme',
        gridHead: 'BROWSE AS GRID', gridSub: 'One image per story',
        popHead: 'MOST LIKED', popSub: 'Reader favorites',
      };

  return (
    <div className="cfia-container" style={homeStyles.root}>
      <section className="cfia-hero" style={homeStyles.hero}>
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

      {featured && (
        <>
          <section className="cfia-featured" style={homeStyles.featuredSec}>
            <div style={homeStyles.featBadge}>{t.featBadge}</div>
            <StoryCard story={featured} lang={lang} onOpen={onOpen} featured={true} />
          </section>
          <hr style={homeStyles.rule} />
        </>
      )}
      {!featured && (
        <section className="cfia-featured" style={homeStyles.featuredSec}>
          <div style={homeStyles.featBadge}>{t.featBadge}</div>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", color: '#6b6860', fontSize: 13, letterSpacing: '0.1em' }}>
            {lang === 'es' ? 'Aún no hay cuentos. Generá el primero desde CREAR.' : 'No stories yet. Generate the first one from CREATE.'}
          </p>
        </section>
      )}
      {!featured && <hr style={homeStyles.rule} />}

      <section className="cfia-sec" style={homeStyles.secWrap}>
        <div style={homeStyles.secHead}>
          <div>
            <div style={homeStyles.eyebrow}>{t.latest}</div>
            <div style={homeStyles.secSub}>{t.latest === 'LATEST' ? 'Recently generated' : 'Generados recientemente'}</div>
          </div>
          <a style={homeStyles.seeAll} onClick={() => onNav('catalog')}>{t.seeAll}</a>
        </div>
        <div className="cfia-latest" style={homeStyles.latestInner}>
          {latest.map(s => <StoryCard key={s.slug} story={s} lang={lang} onOpen={onOpen} />)}
        </div>
      </section>

      <hr style={homeStyles.ruleHair} />

      <section className="cfia-sec" style={homeStyles.secWrap}>
        <div style={homeStyles.secHead}>
          <div>
            <div style={homeStyles.eyebrow}>{t.catHead}</div>
            <div style={homeStyles.secSub}>{t.catSub}</div>
          </div>
          <a style={homeStyles.seeAll} onClick={() => onNav('catalog')}>{t.seeAll}</a>
        </div>
        <div style={homeStyles.chipRow}>
          {topTags.map(([tag, n]) => (
            <span
              key={tag}
              style={homeStyles.chip}
              onClick={() => onNav('catalog')}
            >
              <span style={homeStyles.chipDot}>◻</span> {tag}
              <span style={homeStyles.chipCount}>{String(n).padStart(2, '0')}</span>
            </span>
          ))}
        </div>
      </section>

      {popular.length ? (
        <>
          <hr style={homeStyles.ruleHair} />
          <section className="cfia-sec" style={homeStyles.secWrap}>
            <div style={homeStyles.secHead}>
              <div>
                <div style={homeStyles.eyebrow}>{t.popHead}</div>
                <div style={homeStyles.secSub}>{t.popSub}</div>
              </div>
              <a style={homeStyles.seeAll} onClick={() => onNav('catalog')}>{t.seeAll}</a>
            </div>
            <div className="cfia-latest" style={homeStyles.latestInner}>
              {popular.map(s => <StoryCard key={s.slug} story={s} lang={lang} onOpen={onOpen} />)}
            </div>
          </section>
        </>
      ) : null}

      <hr style={homeStyles.ruleHair} />

      <section className="cfia-sec" style={homeStyles.secWrap}>
        <div style={homeStyles.secHead}>
          <div>
            <div style={homeStyles.eyebrow}>{t.gridHead}</div>
            <div style={homeStyles.secSub}>{t.gridSub}</div>
          </div>
          <a style={homeStyles.seeAll} onClick={() => onNav('catalog')}>{t.seeAll}</a>
        </div>
        <div className="cfia-grid-auto" style={homeStyles.grid}>
          {gridStories.map(s => (
            <div key={s.slug} style={homeStyles.tile} onClick={() => onOpen(s.slug)}>
              <div style={homeStyles.tileImg}>
                <Illustration kind={s.illus} seed={s.num} size={280} data={s.illusData} />
              </div>
              <div style={homeStyles.tileMetaTop}>
                <span>{String(s.num).padStart(3, '0')}</span>
                <span>{s.minutes} MIN</span>
              </div>
              <div style={homeStyles.tileTitle}>{s.title[lang]}</div>
              <div style={homeStyles.tileFoot}>
                <span style={homeStyles.tileTags}>{s.tags.slice(0, 3).join(' · ')}</span>
                {LikeButton ? (
                  <LikeButton
                    slug={s.slug}
                    initialLikes={s.likes || 0}
                    variant="compact"
                    onChange={(n) => window.CFIA_onLikeChange?.(s.slug, n)}
                  />
                ) : null}
              </div>
            </div>
          ))}
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
  ruleHair: { border: 0, borderTop: '1px solid #2a2a35', margin: '0' },
  featuredSec: { padding: '48px 0', display: 'flex', flexDirection: 'column', gap: 18 },
  featBadge: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#e8b84a' },
  secWrap: { padding: '56px 0' },
  secHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, gap: 20, flexWrap: 'wrap' },
  secSub: { fontFamily: "'Instrument Serif', serif", fontSize: 18, color: '#6b6860', marginTop: 6 },
  seeAll: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: '#f5f3ee', borderBottom: '1px solid #6b6860', cursor: 'pointer' },
  latestInner: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: 10 },
  chip: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#f5f3ee', border: '1px solid #2a2a35', padding: '10px 14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0f0f16' },
  chipDot: { color: '#6b6860' },
  chipCount: { marginLeft: 6, color: '#e8b84a', fontSize: 10, letterSpacing: '0.08em' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 },
  tile: { background: '#111118', border: '1px solid #2a2a35', padding: 18, display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer', transition: 'border-color 120ms' },
  tileImg: { width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', display: 'flex', alignItems: 'stretch', justifyContent: 'stretch', background: '#0a0a0f' },
  tileMetaTop: { display: 'flex', justifyContent: 'space-between', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: '#6b6860', textTransform: 'uppercase' },
  tileTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: '#f5f3ee', letterSpacing: '-0.01em', lineHeight: 1.15, fontWeight: 500, margin: 0 },
  tileTags: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.12em', color: '#b8b5ad' },
  tileFoot: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
};

window.Home = Home;
