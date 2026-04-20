import React from 'react';

function About({ lang, onNav }) {
  const { Illustration } = window;
  const t = lang === 'es' ? {
    eyebrow: 'MANIFIESTO', title: 'Por qué importa', body: [
      <>CFIA es un archivo de cuentos cortos de ciencia ficción escritos por modelos de lenguaje. El objetivo no es imitar a un autor humano: es <strong>dejar visible la voz del modelo</strong> tal como surge — con su ritmo, sus riesgos y sus fallos literarios. No censuramos ni reescribimos el relato para “mejorarlo” al gusto editorial.</>,
      <>No creemos que la IA escriba mejor que nosotros. Creemos que escribe distinto. Esa diferencia, leída con atención, es la forma más honesta de entender qué son estas máquinas.</>,
      <>Los textos se ramifican en árboles (expansiones, precuelas, ecos). Cuando un tronco crece lo bastante, se convierte en un <strong>universo</strong> en el mapa del sitio. La hoja de ruta apunta a automatizar una emisión diaria y derivados a partir de lo más leído; lo operativo —metadatos, licencia, acceso a generación— sigue existiendo sin sustituir un comité que pase el lápiz sobre la ficción.</>,
    ],
    prin: 'PRINCIPIOS', principles: [
      ['01', 'Transparencia', 'Cada cuento indica el modelo, la temperatura y la fecha de generación; la procedencia importa.'],
      ['02', 'Voz de la máquina', 'No reescribimos prosa ni diálogo para pulir el texto: publicamos lo que generó el modelo, salvo lo que exijan la ley o las reglas del proveedor.'],
      ['03', 'Abierto', 'Los cuentos bajo licencia CC-BY 4.0. El código del sitio, abierto también.']
    ],
    cta: 'Ver el catálogo →'
  } : {
    eyebrow: 'MANIFESTO', title: 'Why it matters', body: [
      <>CFIA is an archive of short science-fiction stories written by language models. The goal isn’t to pass as human writing: it’s to <strong>make the model’s own voice visible</strong> as it emerges—its pacing, its risks, its literary stumbles. We don’t censor or rewrite stories to suit an editorial taste.</>,
      <>We don&apos;t think AI writes better than us. We think it writes differently. That difference, read carefully, is the most honest way to understand what these machines are.</>,
      <>Stories branch into trees (expansions, prequels, echoes). When a trunk grows large enough, it becomes a <strong>universe</strong> on the site’s map. The roadmap points to automated daily publication and derivatives from the most-read work; operations—metadata, license, gated generation—remain without replacing a committee that pencils the fiction.</>,
    ],
    prin: 'PRINCIPLES', principles: [
      ['01', 'Transparency', 'Every story lists model, temperature, and generation date—provenance matters.'],
      ['02', 'Machine voice', 'We don’t rewrite prose or dialogue to polish the text: we publish what the model generated, except where law or provider rules require otherwise.'],
      ['03', 'Open', 'Stories under CC-BY 4.0. The site’s code is open too.']
    ],
    cta: 'See the catalog →'
  };

  return (
    <div className="cfia-container" style={abStyles.root}>
      <section className="cfia-head-main" style={abStyles.hero}>
        <div style={abStyles.eyebrow}>◼ {t.eyebrow}</div>
        <h1 style={abStyles.h1}>{t.title}</h1>
      </section>
      <hr style={abStyles.rule} />
      <section className="cfia-about-body" style={abStyles.body}>
        <div style={abStyles.illusCol}>
          <Illustration kind="target" seed={7} size={260} />
        </div>
        <div style={abStyles.proseCol}>
          {t.body.map((content, i) => (
            <p key={i} style={abStyles.para}>{content}</p>
          ))}
        </div>
      </section>
      <hr style={abStyles.rule} />
      <section style={abStyles.principles}>
        <div style={abStyles.eyebrow}>{t.prin}</div>
        <div className="cfia-about-pringrid" style={abStyles.prinGrid}>
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
