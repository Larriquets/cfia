import React, { useState } from 'react';

function Nav({ route, onNav, lang, onLang }) {
  const links = [
    { k: 'home', es: 'INICIO', en: 'HOME' },
    { k: 'catalog', es: 'CATÁLOGO', en: 'CATALOG' },
    { k: 'create', es: 'CREAR', en: 'CREATE' },
    { k: 'about', es: 'ACERCA DE', en: 'ABOUT' }
  ];
  return (
    <nav style={navStyles.nav}>
      <div style={navStyles.brand} onClick={() => onNav('home')}>
        <div style={navStyles.termmark}>
          <span style={navStyles.gt}>&gt;</span>
          <span style={navStyles.termTxt}>cfia</span>
          <span style={navStyles.cursor} />
        </div>
        <div style={navStyles.divider} />
        <div style={navStyles.brandText}>Cuentos de Ficción de IA</div>
      </div>
      <div style={navStyles.links}>
        {links.map(l => (
          <a key={l.k}
             onClick={() => onNav(l.k)}
             style={{ ...navStyles.link, ...(route === l.k ? navStyles.linkOn : {}) }}>
            {route === l.k && <span style={{ color: '#e8b84a', marginRight: 6 }}>◼</span>}
            {l[lang]}
          </a>
        ))}
      </div>
      <div style={navStyles.langBox}>
        <span onClick={() => onLang('es')} style={{ ...navStyles.langBtn, ...(lang === 'es' ? navStyles.langOn : {}) }}>ES</span>
        <span style={navStyles.langDot}>·</span>
        <span onClick={() => onLang('en')} style={{ ...navStyles.langBtn, ...(lang === 'en' ? navStyles.langOn : {}) }}>EN</span>
      </div>
    </nav>
  );
}

const navStyles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 40px', borderBottom: '2px solid #f5f3ee',
    background: '#0a0a0f', position: 'sticky', top: 0, zIndex: 10
  },
  brand: { display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' },
  termmark: { display: 'inline-flex', alignItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: '#f5f3ee' },
  gt: { color: '#e8b84a', marginRight: 5 },
  termTxt: { color: '#f5f3ee' },
  cursor: { display: 'inline-block', width: 10, height: 17, background: '#f5f3ee', marginLeft: 4, animation: 'cfia-blink 1.1s steps(1) infinite' },
  divider: { width: 1, height: 28, background: '#2a2a35' },
  brandText: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, color: '#f5f3ee', letterSpacing: '-0.01em' },
  links: { display: 'flex', gap: 32 },
  link: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#6b6860', cursor: 'pointer', border: 'none', textDecoration: 'none' },
  linkOn: { color: '#f5f3ee' },
  langBox: { display: 'flex', gap: 6, alignItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em' },
  langBtn: { color: '#6b6860', cursor: 'pointer' },
  langOn: { color: '#f5f3ee' },
  langDot: { color: '#3a3832' }
};

window.Nav = Nav;
