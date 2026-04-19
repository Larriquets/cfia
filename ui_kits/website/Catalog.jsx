import React, { useState } from 'react';

function Catalog({ stories, lang, onOpen }) {
  const [activeTag, setActiveTag] = useState(null);
  const allTags = [...new Set(stories.flatMap(s => s.tags))];
  const filtered = activeTag ? stories.filter(s => s.tags.includes(activeTag)) : stories;
  const t = lang === 'es'
    ? { eyebrow: 'CATÁLOGO', title: 'Todos los cuentos', count: 'CUENTOS', filter: 'FILTRAR POR TEMA', all: 'TODOS' }
    : { eyebrow: 'CATALOG', title: 'All stories', count: 'STORIES', filter: 'FILTER BY THEME', all: 'ALL' };
  return (
    <div style={catStyles.root}>
      <section style={catStyles.head}>
        <div style={catStyles.eyebrow}>◼ {t.eyebrow} · {filtered.length} {t.count}</div>
        <h1 style={catStyles.h1}>{t.title}</h1>
      </section>
      <hr style={catStyles.rule} />
      <section style={catStyles.filterSec}>
        <div style={catStyles.filterLbl}>{t.filter}</div>
        <div style={catStyles.chipRow}>
          <span onClick={() => setActiveTag(null)}
                style={{ ...catStyles.chip, ...(activeTag === null ? catStyles.chipOn : {}) }}>
            {activeTag === null ? '◼' : '◻'} {t.all}
          </span>
          {allTags.map(tag => (
            <span key={tag}
                  onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                  style={{ ...catStyles.chip, ...(tag === activeTag ? catStyles.chipOn : {}) }}>
              {tag === activeTag ? '◼' : '◻'} {tag}
            </span>
          ))}
        </div>
      </section>
      <section style={catStyles.list}>
        {filtered.map(s => (
          <div key={s.slug} style={catStyles.row} onClick={() => onOpen(s.slug)}>
            <div style={catStyles.num}>{String(s.num).padStart(3, '0')}</div>
            <div style={catStyles.mid}>
              <div style={catStyles.rowTitle}>{s.title[lang]}</div>
              <div style={catStyles.rowMeta}>{s.tags.join(' · ')} · {s.model} · TEMP {s.temp}</div>
            </div>
            <div style={catStyles.rowRight}>
              <div style={catStyles.rowDate}>{s.date}</div>
              <div style={catStyles.rowMin}>{s.minutes} MIN →</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

const catStyles = {
  root: { maxWidth: 1440, margin: '0 auto', padding: '0 40px' },
  head: { padding: '96px 0 48px', display: 'flex', flexDirection: 'column', gap: 20 },
  eyebrow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#b8b5ad', textTransform: 'uppercase' },
  h1: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(56px, 8vw, 120px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 500, color: '#f5f3ee', margin: 0 },
  rule: { border: 0, borderTop: '2px solid #f5f3ee', margin: 0 },
  filterSec: { padding: '32px 0', display: 'flex', flexDirection: 'column', gap: 14 },
  filterLbl: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#6b6860' },
  chipRow: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  chip: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b8b5ad', border: '1px solid #2a2a35', padding: '8px 14px', cursor: 'pointer' },
  chipOn: { background: '#e8b84a', color: '#0a0a0f', borderColor: '#e8b84a' },
  list: { display: 'flex', flexDirection: 'column', borderTop: '1px solid #2a2a35' },
  row: { display: 'grid', gridTemplateColumns: '80px 1fr 160px', gap: 24, padding: '24px 8px', borderBottom: '1px solid #2a2a35', alignItems: 'center', cursor: 'pointer' },
  num: { fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#6b6860', letterSpacing: '0.08em' },
  mid: { display: 'flex', flexDirection: 'column', gap: 6 },
  rowTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, color: '#f5f3ee', letterSpacing: '-0.01em', fontWeight: 500 },
  rowMeta: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#6b6860', letterSpacing: '0.12em', textTransform: 'uppercase' },
  rowRight: { textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 4 },
  rowDate: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#b8b5ad', letterSpacing: '0.08em' },
  rowMin: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: '#e8b84a', letterSpacing: '0.08em' }
};

window.Catalog = Catalog;
