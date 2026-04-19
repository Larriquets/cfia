import React from 'react';

function Footer({ lang }) {
  const txt = lang === 'es'
    ? {
        manifest: 'Una colección viva. Actualizada cada semana.',
        nav: ['Inicio', 'Catálogo', 'Acerca de', 'RSS'],
        colophon: 'CFIA · 2026 · Publicado desde la Tierra',
        license: 'Los cuentos se publican bajo licencia CC-BY 4.0.'
      }
    : {
        manifest: 'A living collection. Updated every week.',
        nav: ['Home', 'Catalog', 'About', 'RSS'],
        colophon: 'CFIA · 2026 · Published from Earth',
        license: 'Stories are released under CC-BY 4.0.'
      };
  return (
    <footer style={footerStyles.root}>
      <div style={footerStyles.topRule} />
      <div style={footerStyles.inner}>
        <div style={footerStyles.col}>
          <div style={footerStyles.eyebrow}>◼ CFIA</div>
          <div style={footerStyles.manifest}>{txt.manifest}</div>
        </div>
        <div style={footerStyles.col}>
          <div style={footerStyles.eyebrow}>{lang === 'es' ? 'NAVEGACIÓN' : 'NAVIGATION'}</div>
          <div style={footerStyles.linkCol}>
            {txt.nav.map(n => <a key={n} style={footerStyles.link}>{n} →</a>)}
          </div>
        </div>
        <div style={footerStyles.col}>
          <div style={footerStyles.eyebrow}>{lang === 'es' ? 'COLOFÓN' : 'COLOPHON'}</div>
          <div style={footerStyles.mono}>{txt.colophon}</div>
          <div style={{ ...footerStyles.mono, color: '#6b6860', marginTop: 10 }}>{txt.license}</div>
        </div>
      </div>
    </footer>
  );
}

const footerStyles = {
  root: { marginTop: 96, background: '#0a0a0f' },
  topRule: { borderTop: '2px solid #f5f3ee' },
  inner: { display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: 48, padding: '48px 40px 64px' },
  col: { display: 'flex', flexDirection: 'column', gap: 14 },
  eyebrow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#b8b5ad' },
  manifest: { fontFamily: "'Instrument Serif', serif", fontSize: 22, lineHeight: 1.4, color: '#f5f3ee', maxWidth: 340 },
  linkCol: { display: 'flex', flexDirection: 'column', gap: 8 },
  link: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: '#f5f3ee', cursor: 'pointer', textDecoration: 'none', borderBottom: 'none' },
  mono: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.12em', color: '#b8b5ad', lineHeight: 1.6 }
};

window.Footer = Footer;
