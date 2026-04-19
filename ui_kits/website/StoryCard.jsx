import React from 'react';

function StoryCard({ story, lang, onOpen, featured = false }) {
  const { Illustration } = window;
  const [hover, setHover] = React.useState(false);
  const s = featured ? cardStyles.featured : cardStyles.card;
  const shadow = featured ? (hover ? '6px 6px 0 #e8b84a' : '4px 4px 0 #f5f3ee') : 'none';
  const border = featured ? '2px solid #f5f3ee' : '1px solid #2a2a35';
  const borderHover = hover ? (featured ? '2px solid #e8b84a' : '1px solid #f5f3ee') : border;

  return (
    <div
      onClick={() => onOpen(story.slug)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...s, border: borderHover, boxShadow: shadow, cursor: 'pointer', transition: 'all 120ms cubic-bezier(0.2,0.7,0.2,1)' }}>
      <div style={cardStyles.metaRow}>
        <div style={cardStyles.eyebrow}>
          <span style={cardStyles.amberSq} />
          {lang === 'es' ? 'CUENTO' : 'STORY'} {String(story.num).padStart(3, '0')} · {story.date.slice(0, 7)}
        </div>
        <div style={cardStyles.eyebrow}>{story.minutes} MIN</div>
      </div>
      {featured && (
        <div style={{ marginBottom: 16 }}>
          <Illustration kind={story.illus} seed={story.num} size={featured ? 280 : 160} data={story.illusData} />
        </div>
      )}
      <h3 style={featured ? cardStyles.titleFeat : cardStyles.title}>{story.title[lang]}</h3>
      <div style={cardStyles.byline}>{story.model} · TEMP {story.temp} · {lang.toUpperCase()}</div>
      <p style={cardStyles.excerpt}>{story.excerpt[lang]}</p>
      <div style={cardStyles.tagRow}>
        {story.tags.map(t => <span key={t} style={cardStyles.tag}>◻ {t}</span>)}
      </div>
    </div>
  );
}

const cardStyles = {
  card: { background: '#111118', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 12 },
  featured: { background: '#111118', padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 14 },
  metaRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: '#b8b5ad', textTransform: 'uppercase', display: 'flex', alignItems: 'center' },
  amberSq: { display: 'inline-block', width: 8, height: 8, background: '#e8b84a', marginRight: 8 },
  title: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, color: '#f5f3ee', letterSpacing: '-0.02em', lineHeight: 1.1, fontWeight: 500, margin: 0 },
  titleFeat: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 44, color: '#f5f3ee', letterSpacing: '-0.02em', lineHeight: 1.05, fontWeight: 500, margin: 0 },
  byline: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.08em', color: '#b8b5ad' },
  excerpt: { fontFamily: "'Instrument Serif', serif", fontSize: 18, lineHeight: 1.5, color: '#b8b5ad', margin: 0 },
  tagRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 },
  tag: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', color: '#6b6860', border: '1px solid #2a2a35', padding: '4px 8px' }
};

window.StoryCard = StoryCard;
