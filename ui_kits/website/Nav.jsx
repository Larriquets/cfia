import React, { useState } from 'react';

function Nav({ route, onNav, lang, onLang }) {
  const [open, setOpen] = useState(false);
  const links = [
    { k: 'home', es: 'INICIO', en: 'HOME' },
    { k: 'catalog', es: 'CATÁLOGO', en: 'CATALOG' },
    { k: 'create', es: 'CREAR', en: 'CREATE' },
    { k: 'about', es: 'ACERCA DE', en: 'ABOUT' }
  ];
  const go = (k) => { setOpen(false); onNav(k); };
  return (
    <nav className="cfia-nav" style={navStyles.nav}>
      <div style={navStyles.brand} onClick={() => go('home')}>
        <div style={navStyles.termmark}>
          <span style={navStyles.gt}>&gt;</span>
          <span style={navStyles.termTxt}>cfia</span>
          <span style={navStyles.cursor} />
        </div>
        <div className="cfia-nav-divider" style={navStyles.divider} />
        <div className="cfia-nav-brandtext" style={navStyles.brandText}>Cuentos de Ficción de IA</div>
      </div>
      <div className={`cfia-nav-links${open ? ' cfia-open' : ''}`} style={navStyles.links}>
        {links.map(l => (
          <a key={l.k}
             onClick={() => go(l.k)}
             style={{ ...navStyles.link, ...(route === l.k ? navStyles.linkOn : {}) }}>
            {route === l.k && <span style={{ color: '#e8b84a', marginRight: 6 }}>◼</span>}
            {l[lang]}
          </a>
        ))}
      </div>
      <div style={navStyles.rightBox}>
        <div style={navStyles.langBox}>
          <span onClick={() => onLang('es')} style={{ ...navStyles.langBtn, ...(lang === 'es' ? navStyles.langOn : {}) }}>ES</span>
          <span style={navStyles.langDot}>·</span>
          <span onClick={() => onLang('en')} style={{ ...navStyles.langBtn, ...(lang === 'en' ? navStyles.langOn : {}) }}>EN</span>
        </div>
        <button
          type="button"
          className="cfia-nav-burger"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}>
          {open ? '✕' : '≡'}
        </button>
      </div>
    </nav>
  );
}

const navStyles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 40px', borderBottom: '2px solid #f5f3ee',
    background: '#0a0a0f', position: 'sticky', top: 0, zIndex: 10,
    gap: 12
  },
  brand: { display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', minWidth: 0 },
  termmark: { display: 'inline-flex', alignItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: '#f5f3ee' },
  gt: { color: '#e8b84a', marginRight: 5 },
  termTxt: { color: '#f5f3ee' },
  cursor: { display: 'inline-block', width: 10, height: 17, background: '#f5f3ee', marginLeft: 4, animation: 'cfia-blink 1.1s steps(1) infinite' },
  divider: { width: 1, height: 28, background: '#2a2a35' },
  brandText: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, color: '#f5f3ee', letterSpacing: '-0.01em' },
  links: { display: 'flex', gap: 32 },
  link: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#6b6860', cursor: 'pointer', border: 'none', textDecoration: 'none' },
  linkOn: { color: '#f5f3ee' },
  rightBox: { display: 'flex', alignItems: 'center', gap: 14 },
  langBox: { display: 'flex', gap: 6, alignItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em' },
  langBtn: { color: '#6b6860', cursor: 'pointer' },
  langOn: { color: '#f5f3ee' },
  langDot: { color: '#3a3832' }
};

window.Nav = Nav;
