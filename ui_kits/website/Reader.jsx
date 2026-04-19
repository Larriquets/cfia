import React, { useState, useEffect } from 'react';

function Reader({ story, lang, onBack }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const body = (story.body && story.body[lang]) || [story.excerpt[lang]];
  const t = lang === 'es'
    ? { back: '← Volver al catálogo', by: 'ESCRITO POR', curated: 'CURADO POR', chap: 'CUENTO' }
    : { back: '← Back to catalog', by: 'WRITTEN BY', curated: 'CURATED BY', chap: 'STORY' };

  return (
    <div style={rdStyles.root}>
      <div style={rdStyles.progress}><div style={{ ...rdStyles.progressFill, width: `${progress * 100}%` }} /></div>

      <div style={rdStyles.top}>
        <a style={rdStyles.back} onClick={onBack}>{t.back}</a>
        <div style={rdStyles.mono}>{t.chap} {String(story.num).padStart(3, '0')} · {story.minutes} MIN</div>
      </div>

      <article style={rdStyles.article}>
        <header style={rdStyles.header}>
          <div style={rdStyles.illusWrap}>
            <Illustration kind={story.illus} seed={story.num} size={240} data={story.illusData} />
          </div>
          <h1 style={rdStyles.title}>{story.title[lang]}</h1>
          <div style={rdStyles.bylineStack}>
            <div style={rdStyles.bylineRow}>
              <span style={rdStyles.bylineLbl}>{t.by}</span>
              <span style={rdStyles.bylineVal}>{story.model} · TEMP {story.temp}</span>
            </div>
            <div style={rdStyles.bylineRow}>
              <span style={rdStyles.bylineLbl}>{t.curated}</span>
              <span style={rdStyles.bylineVal}>Redacción CFIA · {story.date}</span>
            </div>
          </div>
        </header>

        <hr style={rdStyles.sepHair} />

        <div style={rdStyles.prose}>
          {body.map((p, i) => (
            <p key={i} style={i === 0 ? rdStyles.firstPara : rdStyles.para}>
              {i === 0 ? <span style={rdStyles.dropcap}>{p[0]}</span> : null}
              {i === 0 ? p.slice(1) : p}
            </p>
          ))}
        </div>

        <hr style={rdStyles.sepHair} />

        <div style={rdStyles.colophon}>
          <div style={rdStyles.colophonRow}>§ {lang === 'es' ? 'FIN DEL CUENTO' : 'END OF STORY'}</div>
          <div style={rdStyles.colophonMono}>
            GENERATED {story.date} · MODEL {story.model} · TEMP {story.temp} · {story.tags.join(' · ')}
          </div>
        </div>
      </article>
    </div>
  );
}

const rdStyles = {
  root: { background: '#0a0a0f' },
  progress: { position: 'sticky', top: 73, height: 3, background: '#1a1a24', zIndex: 5 },
  progressFill: { height: '100%', background: '#e8b84a' },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid #2a2a35', maxWidth: 1440, margin: '0 auto' },
  back: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: '#f5f3ee', cursor: 'pointer', borderBottom: '1px solid #6b6860' },
  mono: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.14em', color: '#b8b5ad', textTransform: 'uppercase' },
  article: { maxWidth: 680, margin: '0 auto', padding: '64px 40px' },
  header: { display: 'flex', flexDirection: 'column', gap: 32, marginBottom: 48 },
  illusWrap: { alignSelf: 'flex-start' },
  title: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 56, lineHeight: 0.98, letterSpacing: '-0.03em', fontWeight: 500, color: '#f5f3ee', margin: 0 },
  bylineStack: { display: 'flex', flexDirection: 'column', gap: 8 },
  bylineRow: { display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16 },
  bylineLbl: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: '#6b6860' },
  bylineVal: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.08em', color: '#f5f3ee' },
  sepHair: { border: 0, borderTop: '1px solid #2a2a35', margin: '32px 0' },
  prose: { fontFamily: "'Instrument Serif', serif", fontSize: 22, lineHeight: 1.7, color: '#f5f3ee' },
  firstPara: { margin: '0 0 1.2em 0', textWrap: 'pretty' },
  para: { margin: '0 0 1.2em 0', textWrap: 'pretty' },
  dropcap: { fontFamily: "'Instrument Serif', serif", fontSize: '4em', float: 'left', lineHeight: 0.85, padding: '4px 10px 0 0', color: '#e8b84a' },
  colophon: { display: 'flex', flexDirection: 'column', gap: 12 },
  colophonRow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#e8b84a' },
  colophonMono: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.12em', color: '#6b6860', lineHeight: 1.8 }
};

window.Reader = Reader;
