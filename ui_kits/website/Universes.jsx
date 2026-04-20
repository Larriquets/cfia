import React, { useEffect, useState, useMemo } from 'react';

function Universes({ lang, onOpen }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState('map');

  useEffect(() => {
    fetch('/api/universes')
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((j) => setData(j.universes || []))
      .catch((e) => setError(e.message));
  }, []);

  const t = lang === 'es'
    ? { eyebrow: 'UNIVERSOS · SUB-MUNDOS DEL CANON', h1: 'Mapa de universos.', subtitle: 'Cuando un cuento se hereda tres o más veces, su árbol deja de ser una serie y se vuelve un universo propio — con sus personajes, lugares y reglas. Cada uno es un mapa navegable.', loading: 'CARGANDO UNIVERSOS · ', err: '◼ ERROR:', empty: 'Todavía no hay universos. Un cuento se vuelve universo cuando tiene al menos dos niveles de descendencia.', rootLabel: 'RAÍZ', totalLabel: (n) => `${n} NODOS`, viewMap: 'MAPA', viewList: 'LISTA' }
    : { eyebrow: 'UNIVERSES · SUB-WORLDS OF THE CANON', h1: 'Universe map.', subtitle: 'When a story is inherited three or more times, its tree stops being a series and becomes its own universe — with its characters, places and rules. Each one is a navigable map.', loading: 'LOADING UNIVERSES · ', err: '◼ ERROR:', empty: 'No universes yet. A story becomes a universe when it has at least two levels of descendants.', rootLabel: 'ROOT', totalLabel: (n) => `${n} NODES`, viewMap: 'MAP', viewList: 'LIST' };

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
        <div style={styles.viewToggle}>
          <button type="button" onClick={() => setView('map')} style={{ ...styles.viewBtn, ...(view === 'map' ? styles.viewBtnOn : {}) }}>◼ {t.viewMap}</button>
          <button type="button" onClick={() => setView('list')} style={{ ...styles.viewBtn, ...(view === 'list' ? styles.viewBtnOn : {}) }}>◻ {t.viewList}</button>
        </div>
      </section>

      <hr style={styles.rule} />

      {data.length === 0 ? (
        <div style={styles.empty}>{t.empty}</div>
      ) : (
        <section style={styles.list}>
          {data.map((u, i) => (
            <UniverseBlock key={u.root.slug} universe={u} lang={lang} onOpen={onOpen} t={t} index={i + 1} view={view} />
          ))}
        </section>
      )}
    </div>
  );
}

function UniverseBlock({ universe, lang, onOpen, t, index, view }) {
  return (
    <div style={styles.universe}>
      <div style={styles.universeHead}>
        <span style={styles.universeIndex}>{String(index).padStart(2, '0')}</span>
        <span style={styles.universeRoot}>{t.rootLabel} · {universe.root.title?.[lang] || universe.root.title?.es}</span>
        <span style={styles.universeTotal}>◼ {t.totalLabel(universe.total)}</span>
      </div>
      {view === 'map' ? (
        <UniverseGraph root={universe.root} lang={lang} onOpen={onOpen} />
      ) : (
        <UniverseList root={universe.root} lang={lang} onOpen={onOpen} />
      )}
    </div>
  );
}

function layoutTree(root) {
  const H_GAP = 180;
  const V_GAP = 70;

  const nodes = [];
  const edges = [];

  const assignX = (node, depth, cursor) => {
    let start = cursor.x;
    const children = node.children || [];
    if (children.length === 0) {
      node._x = cursor.x;
      cursor.x += 1;
    } else {
      for (const c of children) {
        assignX(c, depth + 1, cursor);
      }
      const firstX = children[0]._x;
      const lastX = children[children.length - 1]._x;
      node._x = (firstX + lastX) / 2;
    }
    node._depth = depth;
  };

  assignX(root, 0, { x: 0 });

  const collect = (node, parent) => {
    const x = node._x * H_GAP + H_GAP / 2;
    const y = node._depth * V_GAP + V_GAP / 2;
    const entry = { slug: node.slug, num: node.num, title: node.title, x, y, depth: node._depth, parentSlug: parent ? parent.slug : null };
    nodes.push(entry);
    if (parent) {
      const px = parent._x * H_GAP + H_GAP / 2;
      const py = parent._depth * V_GAP + V_GAP / 2;
      edges.push({ from: parent.slug, to: node.slug, x1: px, y1: py, x2: x, y2: y });
    }
    for (const c of node.children || []) collect(c, node);
  };
  collect(root, null);

  const maxX = Math.max(...nodes.map((n) => n.x));
  const maxY = Math.max(...nodes.map((n) => n.y));
  return { nodes, edges, width: maxX + H_GAP / 2, height: maxY + V_GAP };
}

function UniverseGraph({ root, lang, onOpen }) {
  const [hover, setHover] = useState(null);
  const layout = useMemo(() => layoutTree(root), [root]);

  const ancestorPath = useMemo(() => {
    if (!hover) return new Set();
    const path = new Set();
    const byId = new Map(layout.nodes.map((n) => [n.slug, n]));
    let cur = byId.get(hover);
    while (cur) {
      path.add(cur.slug);
      cur = cur.parentSlug ? byId.get(cur.parentSlug) : null;
    }
    return path;
  }, [hover, layout.nodes]);

  const edgeHighlighted = (e) => ancestorPath.has(e.from) && ancestorPath.has(e.to);

  const viewBox = `0 0 ${layout.width} ${layout.height}`;

  return (
    <div style={graphStyles.wrap}>
      <svg viewBox={viewBox} style={graphStyles.svg} preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1a1a22" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={layout.width} height={layout.height} fill="url(#grid)" />

        {layout.edges.map((e, i) => {
          const mid = (e.y1 + e.y2) / 2;
          const d = `M ${e.x1} ${e.y1} C ${e.x1} ${mid}, ${e.x2} ${mid}, ${e.x2} ${e.y2}`;
          const hi = edgeHighlighted(e);
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={hi ? '#e8b84a' : '#3a3832'}
              strokeWidth={hi ? 1.6 : 1}
              opacity={hover && !hi ? 0.3 : 1}
            />
          );
        })}

        {layout.nodes.map((n) => {
          const isHovered = hover === n.slug;
          const onPath = ancestorPath.has(n.slug);
          const color = onPath ? '#e8b84a' : '#b8b5ad';
          const size = n.depth === 0 ? 10 : 7;
          const title = n.title?.[lang] || n.title?.es;
          return (
            <g
              key={n.slug}
              transform={`translate(${n.x}, ${n.y})`}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHover(n.slug)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onOpen(n.slug)}
            >
              {isHovered && (
                <rect x={-size * 1.8} y={-size * 1.8} width={size * 3.6} height={size * 3.6} fill="none" stroke="#e8b84a" strokeWidth="1" opacity="0.4" />
              )}
              <rect
                x={-size / 2}
                y={-size / 2}
                width={size}
                height={size}
                fill={color}
                opacity={hover && !onPath ? 0.3 : 1}
              >
                {n.depth === 0 && (
                  <animate attributeName="opacity" values="1;0.55;1" dur="2.4s" repeatCount="indefinite" />
                )}
              </rect>
              <text
                x={size + 6}
                y={3}
                fontFamily="'JetBrains Mono', monospace"
                fontSize="9"
                fill={color}
                opacity={hover && !onPath ? 0.3 : 1}
                style={{ letterSpacing: '0.12em' }}
              >
                {String(n.num).padStart(3, '0')}
              </text>
              <text
                x={size + 6}
                y={16}
                fontFamily="'Space Grotesk', sans-serif"
                fontSize="11"
                fill={onPath ? '#f5f3ee' : '#b8b5ad'}
                opacity={hover && !onPath ? 0.3 : 1}
              >
                {truncate(title, 28)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function truncate(s, max) {
  if (!s) return '';
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

function UniverseList({ root, lang, onOpen }) {
  const lines = [];
  const render = (node, prefix, isLast, isRoot) => {
    const connector = isRoot ? '' : (isLast ? '└─ ' : '├─ ');
    const title = node.title?.[lang] || node.title?.es;
    lines.push(
      <div key={node.slug} style={styles.treeLine} onClick={() => onOpen(node.slug)}>
        <span style={styles.treeGlyph}>{prefix}{connector}</span>
        <span style={styles.treeNum}>{String(node.num).padStart(3, '0')}</span>
        <span style={styles.treeDot}>·</span>
        <span style={styles.treeTitle}>{title}</span>
      </div>
    );
    const childPrefix = isRoot ? '' : (prefix + (isLast ? '   ' : '│  '));
    (node.children || []).forEach((c, i) => {
      render(c, childPrefix, i === (node.children.length - 1), false);
    });
  };
  render(root, '', true, true);
  return <div style={styles.tree}>{lines}</div>;
}

const graphStyles = {
  wrap: { width: '100%', overflowX: 'auto', border: '1px solid #1a1a22', background: '#050508' },
  svg: { width: '100%', minHeight: 180, display: 'block' },
};

const styles = {
  root: { maxWidth: 1200, margin: '0 auto', padding: '0 40px' },
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
  viewToggle: { display: 'flex', gap: 0, border: '1px solid #3a3832', alignSelf: 'flex-start', marginTop: 8 },
  viewBtn: { background: '#0a0a0f', border: 'none', borderRight: '1px solid #3a3832', color: '#6b6860', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', padding: '10px 16px', cursor: 'pointer' },
  viewBtnOn: { background: '#e8b84a', color: '#0a0a0f' },
};

window.Universes = Universes;
