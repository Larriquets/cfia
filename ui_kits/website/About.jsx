import React from 'react';

function About({ lang, onNav }) {
  const { Illustration } = window;
  const t = lang === 'es' ? {
    eyebrow: 'MANIFIESTO', title: 'Por qué importa', body: [
      'CFIA es una colección de cuentos cortos de ciencia ficción escritos por modelos de lenguaje grandes y curados por un pequeño equipo humano.',
      'No creemos que la IA escriba mejor que nosotros. Creemos que escribe distinto. Y esa diferencia, leída con atención, es la forma más honesta de entender qué son estas máquinas.',
      'Publicamos lo que nos sorprende. Desechamos lo que es cliché, violento sin razón, o meramente competente. Un cuento bueno es raro. Por eso hay solo un puñado a la semana.'
    ],
    prin: 'PRINCIPIOS', principles: [
      ['01', 'Transparencia', 'Cada cuento indica el modelo, la temperatura y la fecha de generación.'],
      ['02', 'Humanismo', 'La IA escribe; los humanos eligen, editan, y firman lo publicado.'],
      ['03', 'Abierto', 'Todos los cuentos bajo licencia CC-BY 4.0. El código del sitio, abierto también.']
    ],
    cta: 'Ver el catálogo →'
  } : {
    eyebrow: 'MANIFESTO', title: 'Why it matters', body: [
      'CFIA is a collection of short science-fiction stories written by large language models and curated by a small human team.',
      'We don\'t think AI writes better than us. We think it writes differently. And that difference, read carefully, is the most honest way to understand what these machines are.',
      'We publish what surprises us. We discard what is cliché, pointlessly violent, or merely competent. A good story is rare. That\'s why there are only a handful a week.'
    ],
    prin: 'PRINCIPLES', principles: [
      ['01', 'Transparency', 'Every story lists its model, temperature, and generation date.'],
      ['02', 'Humanism', 'AI writes; humans choose, edit, and sign off on what is published.'],
      ['03', 'Open', 'All stories under CC-BY 4.0. The site\'s code, also open.']
    ],
    cta: 'See the catalog →'
  };

  return (
    <div style={abStyles.root}>
      <section style={abStyles.hero}>
        <div style={abStyles.eyebrow}>◼ {t.eyebrow}</div>
        <h1 style={abStyles.h1}>{t.title}</h1>
      </section>
      <hr style={abStyles.rule} />
      <section style={abStyles.body}>
        <div style={abStyles.illusCol}>
          <Illustration kind="target" seed={7} size={260} />
        </div>
        <div style={abStyles.proseCol}>
          {t.body.map((p, i) => <p key={i} style={abStyles.para}>{p}</p>)}
        </div>
      </section>
      <hr style={abStyles.rule} />
      <section style={abStyles.principles}>
        <div style={abStyles.eyebrow}>{t.prin}</div>
        <div style={abStyles.prinGrid}>
          {t.principles.map(([n, h, b]) => (
            <div key={n} style={abStyles.prinCell}>
              <div style={abStyles.prinNum}>{n}</div>
              <div style={abStyles.prinHead}>{h}</div>
              <div style={abStyles.prinBody}>{b}</div>
            </div>
          ))}
        </div>
      </section>
      <section style={abStyles.ctaSec}>
        <a style={abStyles.cta} onClick={() => onNav('catalog')}>{t.cta}</a>
      </section>
    </div>
  );
}

const abStyles = {
  root: { maxWidth: 1440, margin: '0 auto', padding: '0 40px' },
  hero: { padding: '96px 0 48px', display: 'flex', flexDirection: 'column', gap: 20 },
  eyebrow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#b8b5ad', textTransform: 'uppercase' },
  h1: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(56px, 8vw, 120px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 500, color: '#f5f3ee', margin: 0 },
  rule: { border: 0, borderTop: '2px solid #f5f3ee', margin: 0 },
  body: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: 60, padding: '64px 0' },
  illusCol: { alignSelf: 'flex-start' },
  proseCol: { fontFamily: "'Instrument Serif', serif", fontSize: 24, lineHeight: 1.55, color: '#f5f3ee', maxWidth: 640 },
  para: { margin: '0 0 1em 0', textWrap: 'pretty' },
  principles: { padding: '48px 0' },
  prinGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28, marginTop: 28 },
  prinCell: { border: '1px solid #2a2a35', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 12 },
  prinNum: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#e8b84a' },
  prinHead: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, color: '#f5f3ee', letterSpacing: '-0.01em', fontWeight: 500 },
  prinBody: { fontFamily: "'Instrument Serif', serif", fontSize: 18, lineHeight: 1.5, color: '#b8b5ad' },
  ctaSec: { padding: '64px 0' },
  cta: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, color: '#f5f3ee', borderBottom: '1px solid #f5f3ee', cursor: 'pointer', display: 'inline-block', paddingBottom: 4 }
};

window.About = About;
