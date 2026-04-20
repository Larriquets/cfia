import React, { useEffect, useState } from 'react';

function Universes({ lang, onOpen }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/universes')
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((j) => setData(j.universes || []))
      .catch((e) => setError(e.message));
  }, []);

  const t = lang === 'es'
    ? { eyebrow: 'UNIVERSOS · SUB-MUNDOS DEL CANON', h1: 'Árboles de cuentos.', subtitle: 'Cuando un cuento se hereda tres o más veces, su árbol deja de ser una serie y se vuelve un sub-universo propio — con sus personajes, lugares y reglas. Cada uno está listado acá.', loading: 'CARGANDO UNIVERSOS · ', err: '◼ ERROR:', empty: 'Todavía no hay universos. Un cuento se vuelve universo cuando tiene al menos dos niveles de descendencia.', rootLabel: 'RAÍZ', totalLabel: (n) => `${n} CUENTOS` }
    : { eyebrow: 'UNIVERSES · SUB-WORLDS OF THE CANON', h1: 'Story trees.', subtitle: 'When a story is inherited three or more times, its tree stops being a series and becomes its own sub-universe — with its characters, places and rules. Each one is listed here.', loading: 'LOADING UNIVERSES · ', err: '◼ ERROR:', empty: 'No universes yet. A story becomes a universe when it has at least two levels of descendants.', rootLabel: 'ROOT', totalLabel: (n) => `${n} STORIES` };

  if (error) {
    return (
      <div className="cfia-container" style={styles.root}>
        <section className="cfia-head-main" style={styles.head}>
          <div style={styles.eyebrow}>◼ {t.eyebrow}</div>
          <h1 style={styles.h1}>{t.h1}</h1>
        </section>
        <hr style={styles.rule} />
        <div style={styles.error}>{t.err} {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="cfia-container" style={styles.root}>
        <section className="cfia-head-main" style={styles.head}>
          <div style={styles.eyebrow}>◼ {t.eyebrow}</div>
          <h1 style={styles.h1}>{t.h1}</h1>
        </section>
        <hr style={styles.rule} />
        <div style={styles.loading}>{t.loading}<span style={styles.blink}>◼</span></div>
      </div>
    );
  }

  return (
    <div className="cfia-container" style={styles.root}>
      <section className="cfia-head-main" style={styles.head}>
        <div style={styles.eyebrow}>◼ {t.eyebrow}</div>
        <h1 style={styles.h1}>{t.h1}</h1>
        <p style={styles.subtitle}>{t.subtitle}</p>
      </section>

      <hr style={styles.rule} />

      {data.length === 0 ? (
        <div style={styles.empty}>{t.empty}</div>
      ) : (
        <section style={styles.list}>
          {data.map((u, i) => (
            <UniverseBlock key={u.root.slug} universe={u} lang={lang} onOpen={onOpen} t={t} index={i + 1} />
          ))}
        </section>
      )}
    </div>
  );
}

function UniverseBlock({ universe, lang, onOpen, t, index }) {
  return (
    <div style={styles.universe}>
      <div style={styles.universeHead}>
        <span style={styles.universeIndex}>{String(index).padStart(2, '0')}</span>
        <span style={styles.universeRoot}>{t.rootLabel} · {universe.root.title?.[lang] || universe.root.title?.es}</span>
        <span style={styles.universeTotal}>◼ {t.totalLabel(universe.total)}</span>
      </div>
      <div style={styles.tree}>
        <TreeNode node={universe.root} lang={lang} onOpen={onOpen} isRoot={true} prefix="" isLast={true} />
      </div>
    </div>
  );
}

function TreeNode({ node, lang, onOpen, isRoot, prefix, isLast }) {
  const connector = isRoot ? '' : (isLast ? '└─ ' : '├─ ');
  const childPrefix = isRoot ? '' : (prefix + (isLast ? '   ' : '│  '));
  const title = node.title?.[lang] || node.title?.es;

  return (
    <>
      <div style={styles.treeLine} onClick={() => onOpen(node.slug)}>
        <span style={styles.treeGlyph}>{prefix}{connector}</span>
        <span style={styles.treeNum}>{String(node.num).padStart(3, '0')}</span>
        <span style={styles.treeDot}>·</span>
        <span style={styles.treeTitle}>{title}</span>
      </div>
      {node.children && node.children.length > 0 && node.children.map((c, i) => (
        <TreeNode
          key={c.slug}
          node={c}
          lang={lang}
          onOpen={onOpen}
          isRoot={false}
          prefix={childPrefix}
          isLast={i === node.children.length - 1}
        />
      ))}
    </>
  );
}

const styles = {
  root: { maxWidth: 1120, margin: '0 auto', padding: '0 40px' },
  head: { padding: '96px 0 48px', display: 'flex', flexDirection: 'column', gap: 20 },
  eyebrow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#b8b5ad', textTransform: 'uppercase' },
  h1: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(40px, 6vw, 84px)', lineHeight: 1, letterSpacing: '-0.03em', fontWeight: 500, color: '#f5f3ee', margin: 0 },
  subtitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: '#b8b5ad', margin: 0, maxWidth: 680 },
  rule: { border: 0, borderTop: '2px solid #f5f3ee', margin: 0 },
  loading: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#6b6860', padding: '48px 0' },
  blink: { animation: 'cfia-blink 1.1s steps(1) infinite', marginLeft: 6 },
  error: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.08em', color: '#e8b84a', border: '1px solid #e8b84a', padding: 14, background: 'rgba(232,184,74,0.05)', margin: '48px 0' },
  empty: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, color: '#6b6860', padding: '96px 0', maxWidth: 600 },
  list: { padding: '48px 0 96px', display: 'flex', flexDirection: 'column', gap: 56 },
  universe: { display: 'flex', flexDirection: 'column', gap: 16, border: '1px solid #3a3832', padding: 28, background: 'rgba(232,184,74,0.03)' },
  universeHead: { display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap', borderBottom: '1px dashed #3a3832', paddingBottom: 14 },
  universeIndex: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#6b6860' },
  universeRoot: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, color: '#f5f3ee', letterSpacing: '-0.01em', flex: 1, minWidth: 200 },
  universeTotal: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#e8b84a' },
  tree: { fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#f5f3ee', lineHeight: 1.9, overflowX: 'auto' },
  treeLine: { display: 'flex', alignItems: 'baseline', gap: 8, cursor: 'pointer', padding: '2px 0', whiteSpace: 'nowrap' },
  treeGlyph: { color: '#6b6860', whiteSpace: 'pre' },
  treeNum: { color: '#e8b84a', letterSpacing: '0.12em' },
  treeDot: { color: '#3a3832' },
  treeTitle: { color: '#f5f3ee', fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, letterSpacing: '-0.01em' },
};

window.Universes = Universes;
