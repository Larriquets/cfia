import React, { useEffect, useMemo, useState } from 'react';

function UniversePage({ rootSlug, lang, onOpen, onNav, onOpenUniverse }) {
  const { UniverseCosmos, StoryCard } = window;
  const [universes, setUniverses] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/universes')
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((j) => setUniverses(j.universes || []))
      .catch((e) => setError(e.message));
  }, []);

  const t = lang === 'es'
    ? {
        backAll: '← Todos los universos',
        eyebrow: 'UNIVERSO',
        loading: 'CARGANDO UNIVERSO · ',
        notFound: 'UNIVERSO NO ENCONTRADO',
        notFoundHint: (slug) => `No hay un árbol que arranque en "${slug}". Es posible que la raíz haya cambiado.`,
        rootLabel: 'RAÍZ',
        nodes: (n) => `${n} CUENTOS`,
        descLabel: 'DESCRIPCIÓN',
        rulesLabel: 'REGLAS DEL MUNDO',
        mapLabel: 'MAPA NAVEGABLE',
        mapHint: 'Cada nodo es un cuento. Hover para ver excerpt; clic para leer.',
        storiesLabel: 'CUENTOS DEL UNIVERSO',
        storiesHint: 'En orden de lectura — desde la raíz hasta las ramas.',
        otherUnivLbl: 'OTROS UNIVERSOS',
        err: '◼ ERROR:',
      }
    : {
        backAll: '← All universes',
        eyebrow: 'UNIVERSE',
        loading: 'LOADING UNIVERSE · ',
        notFound: 'UNIVERSE NOT FOUND',
        notFoundHint: (slug) => `No tree rooted at "${slug}". The root may have changed.`,
        rootLabel: 'ROOT',
        nodes: (n) => `${n} STORIES`,
        descLabel: 'DESCRIPTION',
        rulesLabel: 'WORLD RULES',
        mapLabel: 'NAVIGABLE MAP',
        mapHint: 'Each node is a story. Hover for excerpt; click to read.',
        storiesLabel: 'STORIES IN THIS UNIVERSE',
        storiesHint: 'In reading order — from the root out into the branches.',
        otherUnivLbl: 'OTHER UNIVERSES',
        err: '◼ ERROR:',
      };

  if (error) {
    return (
      <div style={styles.root}>
        <div style={styles.error}>{t.err} {error}</div>
      </div>
    );
  }

  if (!universes) {
    return (
      <div style={styles.root}>
        <div style={styles.loading}>{t.loading}<span style={styles.blink}>◼</span></div>
      </div>
    );
  }

  const universe = universes.find((u) => u.root.slug === rootSlug);
  if (!universe) {
    return (
      <div style={styles.root}>
        <div style={styles.headWrap}>
          <a style={styles.back} onClick={() => onNav('universes')}>{t.backAll}</a>
        </div>
        <hr style={styles.rule} />
        <div style={styles.notFound}>
          <div style={styles.notFoundTitle}>◼ {t.notFound}</div>
          <div style={styles.notFoundHint}>{t.notFoundHint(rootSlug)}</div>
        </div>
      </div>
    );
  }

  return (
    <UniverseView
      universe={universe}
      universes={universes}
      lang={lang}
      onOpen={onOpen}
      onNav={onNav}
      onOpenUniverse={onOpenUniverse}
      t={t}
      UniverseCosmos={UniverseCosmos}
      StoryCard={StoryCard}
    />
  );
}

function UniverseView({ universe, universes, lang, onOpen, onNav, onOpenUniverse, t, UniverseCosmos, StoryCard }) {
  const allStories = window.CFIA_STORIES || [];
  const storyBySlug = useMemo(() => {
    const m = new Map();
    for (const s of allStories) m.set(s.slug, s);
    return m;
  }, [allStories]);

  const treeStories = useMemo(() => {
    const list = [];
    const walk = (node, depth) => {
      const full = storyBySlug.get(node.slug);
      list.push({ node, depth, story: full || null });
      for (const c of node.children || []) walk(c, depth + 1);
    };
    walk(universe.root, 0);
    return list;
  }, [universe.root, storyBySlug]);

  const rootStory = storyBySlug.get(universe.root.slug);
  const universeEntity = rootStory?.universe;
  const universeName = universeEntity?.name?.[lang] || universeEntity?.name?.es
    || universe.root.title?.[lang] || universe.root.title?.es;
  const desc = universeEntity?.desc?.[lang] || universeEntity?.desc?.es;
  const rules = universeEntity?.rules?.[lang] || universeEntity?.rules?.es;
  const rootTitle = universe.root.title?.[lang] || universe.root.title?.es;

  const others = universes.filter((u) => u.root.slug !== universe.root.slug).slice(0, 4);

  return (
    <div style={styles.root}>
      <section style={styles.headWrap}>
        <a style={styles.back} onClick={() => onNav('universes')}>{t.backAll}</a>
        <div style={styles.eyebrow}>◼ {t.eyebrow}</div>
        <h1 style={styles.h1}>{universeName}</h1>
        <div style={styles.metaRow}>
          <span style={styles.metaItem}>
            <span style={styles.metaLbl}>{t.rootLabel}</span>
            <span style={styles.metaVal}>{rootTitle}</span>
          </span>
          <span style={styles.metaSep}>·</span>
          <span style={styles.metaTotal}>◼ {t.nodes(universe.total)}</span>
        </div>
      </section>

      <hr style={styles.rule} />

      {(desc || rules) ? (
        <>
          <section style={styles.descSec}>
            {desc ? (
              <div style={styles.descBlock}>
                <div style={styles.eyebrow}>{t.descLabel}</div>
                <p style={styles.descBody}>{desc}</p>
              </div>
            ) : null}
            {rules ? (
              <div style={styles.descBlock}>
                <div style={styles.eyebrow}>{t.rulesLabel}</div>
                <p style={styles.descBody}>{rules}</p>
              </div>
            ) : null}
          </section>
          <hr style={styles.ruleHair} />
        </>
      ) : null}

      <section style={styles.mapSec}>
        <div style={styles.secHead}>
          <div>
            <div style={styles.eyebrow}>{t.mapLabel}</div>
            <div style={styles.secSub}>{t.mapHint}</div>
          </div>
        </div>
        <div style={styles.mapCanvas}>
          {UniverseCosmos ? (
            <UniverseCosmos
              root={universe.root}
              lang={lang}
              onOpen={onOpen}
              coParents={universe.coParents || []}
            />
          ) : null}
        </div>
      </section>

      <hr style={styles.ruleHair} />

      <section style={styles.storiesSec}>
        <div style={styles.secHead}>
          <div>
            <div style={styles.eyebrow}>{t.storiesLabel}</div>
            <div style={styles.secSub}>{t.storiesHint}</div>
          </div>
        </div>
        <div style={styles.storyList}>
          {treeStories.map(({ node, depth, story }) => (
            <StoryRow
              key={node.slug}
              node={node}
              depth={depth}
              story={story}
              lang={lang}
              onOpen={onOpen}
            />
          ))}
        </div>
      </section>

      {others.length ? (
        <>
          <hr style={styles.ruleHair} />
          <section style={styles.otherSec}>
            <div style={styles.secHead}>
              <div>
                <div style={styles.eyebrow}>{t.otherUnivLbl}</div>
              </div>
            </div>
            <div style={styles.otherGrid}>
              {others.map((u) => (
                <div
                  key={u.root.slug}
                  style={styles.otherTile}
                  onClick={() => onOpenUniverse?.(u.root.slug)}
                >
                  <div style={styles.otherNum}>◼ {t.nodes(u.total)}</div>
                  <div style={styles.otherTitle}>{u.root.title?.[lang] || u.root.title?.es}</div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function StoryRow({ node, depth, story, lang, onOpen }) {
  const title = node.title?.[lang] || node.title?.es;
  const excerpt = story?.excerpt?.[lang] || story?.excerpt?.es || node.excerpt?.[lang] || node.excerpt?.es;
  const minutes = story?.minutes;
  const tags = story?.tags || [];
  const indent = Math.min(depth, 6) * 24;

  return (
    <div
      style={{ ...styles.row, marginLeft: indent }}
      onClick={() => onOpen?.(node.slug)}
    >
      <div style={styles.rowConn}>
        <span style={styles.rowGlyph}>{depth === 0 ? '◼' : '└─'}</span>
        <span style={styles.rowNum}>{String(node.num).padStart(3, '0')}</span>
      </div>
      <div style={styles.rowBody}>
        <div style={styles.rowTitle}>{title}</div>
        {excerpt ? <div style={styles.rowExcerpt}>{excerpt}</div> : null}
        <div style={styles.rowMeta}>
          {minutes ? <span>{minutes} MIN</span> : null}
          {minutes && tags.length ? <span style={styles.rowSep}>·</span> : null}
          {tags.length ? <span style={styles.rowTags}>{tags.slice(0, 4).join(' · ')}</span> : null}
        </div>
      </div>
      <div style={styles.rowArrow}>→</div>
    </div>
  );
}

const styles = {
  root: { maxWidth: 1200, margin: '0 auto', padding: '0 40px' },
  headWrap: { padding: '64px 0 36px', display: 'flex', flexDirection: 'column', gap: 18 },
  back: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: '#f5f3ee', cursor: 'pointer', borderBottom: '1px solid #6b6860', alignSelf: 'flex-start' },
  eyebrow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#b8b5ad', textTransform: 'uppercase' },
  h1: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(48px, 8vw, 108px)', lineHeight: 0.98, letterSpacing: '-0.03em', fontWeight: 500, color: '#f5f3ee', margin: 0 },
  metaRow: { display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap', marginTop: 8 },
  metaItem: { display: 'inline-flex', alignItems: 'baseline', gap: 10 },
  metaLbl: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: '#6b6860', textTransform: 'uppercase' },
  metaVal: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, color: '#f5f3ee', letterSpacing: '-0.01em' },
  metaSep: { color: '#3a3832' },
  metaTotal: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#e8b84a' },
  rule: { border: 0, borderTop: '2px solid #f5f3ee', margin: 0 },
  ruleHair: { border: 0, borderTop: '1px solid #2a2a35', margin: 0 },
  loading: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#6b6860', padding: '96px 0' },
  blink: { animation: 'cfia-blink 1.1s steps(1) infinite', marginLeft: 6 },
  error: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.08em', color: '#e8b84a', border: '1px solid #e8b84a', padding: 14, background: 'rgba(232,184,74,0.05)', margin: '96px 0' },
  notFound: { padding: '96px 0', display: 'flex', flexDirection: 'column', gap: 12 },
  notFoundTitle: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.16em', color: '#e8b84a' },
  notFoundHint: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, color: '#b8b5ad', maxWidth: 600 },

  descSec: { padding: '40px 0 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40 },
  descBlock: { display: 'flex', flexDirection: 'column', gap: 12 },
  descBody: { fontFamily: "'Instrument Serif', serif", fontSize: 18, lineHeight: 1.55, color: '#f5f3ee', margin: 0 },

  mapSec: { padding: '40px 0', display: 'flex', flexDirection: 'column', gap: 20 },
  secHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' },
  secSub: { fontFamily: "'Instrument Serif', serif", fontSize: 16, color: '#6b6860', marginTop: 4 },
  mapCanvas: { width: '100%', maxWidth: 1100, margin: '0 auto', border: '1px solid #1a1a22', background: '#050508' },

  storiesSec: { padding: '40px 0 24px', display: 'flex', flexDirection: 'column', gap: 24 },
  storyList: { display: 'flex', flexDirection: 'column', gap: 6 },
  row: { display: 'grid', gridTemplateColumns: '110px 1fr 24px', gap: 18, alignItems: 'baseline', padding: '18px 16px', border: '1px solid #2a2a35', background: '#0f0f16', cursor: 'pointer', transition: 'border-color 120ms, background 120ms' },
  rowConn: { display: 'flex', alignItems: 'baseline', gap: 8 },
  rowGlyph: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#6b6860', whiteSpace: 'pre' },
  rowNum: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.14em', color: '#e8b84a' },
  rowBody: { display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 },
  rowTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: '#f5f3ee', letterSpacing: '-0.01em', lineHeight: 1.2 },
  rowExcerpt: { fontFamily: "'Instrument Serif', serif", fontSize: 15, color: '#b8b5ad', lineHeight: 1.45 },
  rowMeta: { display: 'flex', alignItems: 'baseline', gap: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', color: '#6b6860', textTransform: 'uppercase' },
  rowSep: { color: '#3a3832' },
  rowTags: { color: '#b8b5ad' },
  rowArrow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: '#6b6860', textAlign: 'right' },

  otherSec: { padding: '40px 0 96px', display: 'flex', flexDirection: 'column', gap: 24 },
  otherGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 },
  otherTile: { display: 'flex', flexDirection: 'column', gap: 8, padding: 18, border: '1px solid #2a2a35', background: '#0f0f16', cursor: 'pointer', transition: 'border-color 120ms' },
  otherNum: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: '#e8b84a' },
  otherTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, color: '#f5f3ee', letterSpacing: '-0.01em', lineHeight: 1.2 },
};

window.UniversePage = UniversePage;
