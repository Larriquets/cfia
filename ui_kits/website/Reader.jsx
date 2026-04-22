import React, { useState, useEffect, useRef, useMemo } from 'react';

function Reader({ story, lang, onBack, onOpen, onCreated }) {
  const { LikeButton } = window;
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
    ? { back: '← Volver al catálogo', by: 'ESCRITO POR', universe: 'UNIVERSO', engine: 'MOTOR', curated: 'CURADO POR', chap: 'CUENTO',
        audio: 'AUDIO', listen: 'ESCUCHAR', pause: 'PAUSAR', resume: 'REANUDAR', stop: 'DETENER',
        voice: 'VOZ', speed: 'VELOCIDAD', unsupported: 'Tu navegador no soporta síntesis de voz',
        para: 'PÁRRAFO', playing: 'REPRODUCIENDO',
        engineLabel: 'MOTOR DE VOZ',
        engineBrowser: 'NAVEGADOR',
        engineEleven: 'ALTA CALIDAD',
        engineBrowserHint: 'Voz del sistema. Gratis, instantáneo, calidad variable.',
        engineElevenHint: 'Voz sintetizada con ElevenLabs. Mejor calidad, tarda unos segundos la primera vez.',
        audioLoadingFirst: 'Generando audio la primera vez puede tardar unos segundos…',
        thread: 'HILO', expandsFrom: 'CONTINÚA DE', expandsTo: 'EXPANDIDO EN',
        relatedTitle: 'SEGUIR LEYENDO',
        reason: { parent: 'CONTINÚA DE', child: 'EXPANDIDO EN', sibling: 'HERMANO', tag: 'TAGS AFINES', recent: 'RECIENTE' },
        expandTitle: 'EXPANDIR ESTE CUENTO',
        expandHint: 'Pedile al modelo que escriba otro cuento que continúe, preceda o eche luz sobre este.',
        angleLabel: 'ÁNGULO',
        angles: { auto: 'AUTO', secuela: 'SECUELA', precuela: 'PRECUELA', lateral: 'LATERAL', eco: 'ECO' },
        providerLabel: 'MOTOR',
        providers: { anthropic: 'CLAUDE', google: 'GEMINI' },
        formLabel: 'FORMA NARRATIVA',
        formHintExpand: 'HEREDAR usa la misma forma del padre. Elegí otra para contrastar.',
        inheritOpt: 'HEREDAR DEL PADRE',
        parentFormTag: 'FORMA DEL PADRE',
        parentFormUnknown: 'desconocida',
        promptLabel: 'INDICACIÓN (OPCIONAL)',
        promptPh: 'Guiá la expansión: qué personaje seguir, qué pregunta abrir, qué tono, qué imagen…',
        lengthLabel: 'DURACIÓN',
        lengthOpts: { short: 'BREVE · ~3 MIN', medium: 'MEDIO · ~6 MIN', long: 'LARGO · ~10 MIN' },
        ctxToggleShow: '▸ VER CONTEXTO QUE RECIBE EL MODELO',
        ctxToggleHide: '▾ OCULTAR CONTEXTO',
        ctxLoading: 'CARGANDO CONTEXTO · ',
        ctxAncestors: 'CADENA DE ANCESTROS',
        ctxAncestorsEmpty: 'Este cuento no tiene ancestros — es raíz.',
        ctxParent: 'CUERPO DEL PADRE (entra completo)',
        ctxUniverse: 'MEMORIA DEL UNIVERSO',
        ctxEntities: 'ENTIDADES RECURRENTES',
        ctxAuthor: 'AUTOR',
        ctxStats: 'TOTAL',
        ctxChars: 'caracteres',
        ctxWarn: 'La memoria del universo creció mucho. Compactarla condensa el resumen y las entidades sin perder lo esencial (usa Gemini Flash Lite, ~1 call).',
        ctxCompactBtn: '◼ COMPACTAR MEMORIA',
        ctxCompacting: 'COMPACTANDO · ',
        ctxCompactDone: (r) => `COMPACTADO: ${r.beforeChars} → ${r.afterChars} CHARS (${r.ratio}%)`,
        ctxCompactAuth: 'Ingresá por CREAR para poder compactar.',
        coParentsLabel: 'CUENTOS CO-PADRES (OPCIONAL)',
        coParentsHint: 'Elegí hasta 6 cuentos del mismo universo. El nuevo cuento también heredará de ellos — se dibujarán como ramas extra en el diagrama.',
        coParentsNone: 'No hay otros cuentos en este universo.',
        coParentsNoUniverse: 'Este cuento no pertenece a un universo — los co-padres solo se permiten dentro del mismo universo.',
        coParentsSelected: (n) => `${n} seleccionado${n === 1 ? '' : 's'}`,
        coParentsClear: 'LIMPIAR',
        expandBtn: '▸ EXPANDIR',
        expanding: 'GENERANDO · ',
        lockedHint: 'Acceso restringido. Entrá por CREAR.',
        err: '◼ ERROR:' }
    : { back: '← Back to catalog', by: 'WRITTEN BY', universe: 'UNIVERSE', engine: 'ENGINE', curated: 'CURATED BY', chap: 'STORY',
        audio: 'AUDIO', listen: 'LISTEN', pause: 'PAUSE', resume: 'RESUME', stop: 'STOP',
        voice: 'VOICE', speed: 'SPEED', unsupported: 'Your browser does not support speech synthesis',
        para: 'PARAGRAPH', playing: 'PLAYING',
        engineLabel: 'VOICE ENGINE',
        engineBrowser: 'BROWSER',
        engineEleven: 'HIGH QUALITY',
        engineBrowserHint: 'System voice. Free, instant, variable quality.',
        engineElevenHint: 'ElevenLabs synthesis. Better quality, takes a few seconds the first time.',
        audioLoadingFirst: 'Generating audio the first time can take a few seconds…',
        thread: 'THREAD', expandsFrom: 'CONTINUES FROM', expandsTo: 'EXPANDED IN',
        relatedTitle: 'KEEP READING',
        reason: { parent: 'CONTINUES FROM', child: 'EXPANDED IN', sibling: 'SIBLING', tag: 'RELATED TAGS', recent: 'RECENT' },
        expandTitle: 'EXPAND THIS STORY',
        expandHint: 'Ask the model to write another story that continues, precedes or sheds light on this one.',
        angleLabel: 'ANGLE',
        angles: { auto: 'AUTO', secuela: 'SEQUEL', precuela: 'PREQUEL', lateral: 'LATERAL', eco: 'ECHO' },
        providerLabel: 'ENGINE',
        providers: { anthropic: 'CLAUDE', google: 'GEMINI' },
        formLabel: 'NARRATIVE FORM',
        formHintExpand: 'INHERIT reuses the parent form. Pick another to contrast.',
        inheritOpt: 'INHERIT FROM PARENT',
        parentFormTag: 'PARENT FORM',
        parentFormUnknown: 'unknown',
        promptLabel: 'PROMPT (OPTIONAL)',
        promptPh: 'Guide the expansion: which character to follow, what question to open, what tone, what image…',
        lengthLabel: 'LENGTH',
        lengthOpts: { short: 'SHORT · ~3 MIN', medium: 'MEDIUM · ~6 MIN', long: 'LONG · ~10 MIN' },
        ctxToggleShow: '▸ SHOW CONTEXT SENT TO THE MODEL',
        ctxToggleHide: '▾ HIDE CONTEXT',
        ctxLoading: 'LOADING CONTEXT · ',
        ctxAncestors: 'ANCESTOR CHAIN',
        ctxAncestorsEmpty: 'This story has no ancestors — it is a root.',
        ctxParent: 'PARENT BODY (sent in full)',
        ctxUniverse: 'UNIVERSE MEMORY',
        ctxEntities: 'RECURRING ENTITIES',
        ctxAuthor: 'AUTHOR',
        ctxStats: 'TOTAL',
        ctxChars: 'characters',
        ctxWarn: 'Universe memory has grown large. Compacting condenses summary and entities while keeping the essentials (uses Gemini Flash Lite, ~1 call).',
        ctxCompactBtn: '◼ COMPACT MEMORY',
        ctxCompacting: 'COMPACTING · ',
        ctxCompactDone: (r) => `COMPACTED: ${r.beforeChars} → ${r.afterChars} CHARS (${r.ratio}%)`,
        ctxCompactAuth: 'Enter through CREATE to compact.',
        coParentsLabel: 'CO-PARENT STORIES (OPTIONAL)',
        coParentsHint: 'Pick up to 6 stories from the same universe. The new story will also inherit from them — drawn as extra branches in the map.',
        coParentsNone: 'No other stories in this universe.',
        coParentsNoUniverse: 'This story has no universe — co-parents are only allowed within the same universe.',
        coParentsSelected: (n) => `${n} selected`,
        coParentsClear: 'CLEAR',
        expandBtn: '▸ EXPAND',
        expanding: 'GENERATING · ',
        lockedHint: 'Restricted. Enter through CREATE.',
        err: '◼ ERROR:' };

  return (
    <div style={rdStyles.root}>
      <div style={rdStyles.progress}><div style={{ ...rdStyles.progressFill, width: `${progress * 100}%` }} /></div>

      <div className="cfia-rd-top" style={rdStyles.top}>
        <a style={rdStyles.back} onClick={onBack}>{t.back}</a>
        <div style={rdStyles.mono}>{t.chap} {String(story.num).padStart(3, '0')} · {story.minutes} MIN</div>
      </div>

      <article className="cfia-rd-article" style={rdStyles.article}>
        <header style={rdStyles.header}>
          <div style={rdStyles.illusWrap}>
            <Illustration kind={story.illus} seed={story.num} size={240} data={story.illusData} />
          </div>
          <h1 className="cfia-rd-title" style={rdStyles.title}>{story.title[lang]}</h1>
          <div style={rdStyles.bylineStack}>
            <div className="cfia-rd-byline-row" style={rdStyles.bylineRow}>
              <span style={rdStyles.bylineLbl}>{t.by}</span>
              <span style={rdStyles.bylineVal}>{story.author?.name || 'ECHO-8'}</span>
            </div>
            {story.universe ? (
              <div className="cfia-rd-byline-row" style={rdStyles.bylineRow}>
                <span style={rdStyles.bylineLbl}>{t.universe}</span>
                <span style={rdStyles.bylineVal}>{story.universe.name?.[lang] || story.universe.name?.es}</span>
              </div>
            ) : null}
            <div className="cfia-rd-byline-row" style={rdStyles.bylineRow}>
              <span style={rdStyles.bylineLbl}>{t.engine}</span>
              <span style={{ ...rdStyles.bylineVal, color: '#b8b5ad' }}>{story.model} · TEMP {story.temp}</span>
            </div>
            <div className="cfia-rd-byline-row" style={rdStyles.bylineRow}>
              <span style={rdStyles.bylineLbl}>{t.curated}</span>
              <span style={rdStyles.bylineVal}>Redacción CFIA · {story.date}</span>
            </div>
          </div>

          {LikeButton ? (
            <div style={rdStyles.likeRow}>
              <LikeButton
                slug={story.slug}
                initialLikes={story.likes || 0}
                variant="large"
                onChange={(n) => window.CFIA_onLikeChange?.(story.slug, n)}
              />
            </div>
          ) : null}

          <AudioPlayer
            slug={story.slug}
            lang={lang}
            labels={t}
            title={story.title[lang]}
            paragraphs={body}
          />
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

        <StoryUniverseMap story={story} lang={lang} onOpen={onOpen} />

        <RelatedStories story={story} lang={lang} t={t} onOpen={onOpen} />

        <ExpandPanel story={story} lang={lang} t={t} onCreated={onCreated} />
      </article>
    </div>
  );
}

function findUniverseTree(universes, slug) {
  const containsSlug = (node) => {
    if (node.slug === slug) return true;
    return (node.children || []).some(containsSlug);
  };
  for (const u of universes) {
    if (containsSlug(u.root)) return u;
  }
  return null;
}

function StoryUniverseMap({ story, lang, onOpen }) {
  const [tree, setTree] = useState(null);
  const UniverseCosmos = window.UniverseCosmos;

  useEffect(() => {
    let alive = true;
    setTree(null);
    fetch('/api/universes')
      .then((r) => r.ok ? r.json() : { universes: [] })
      .then((data) => {
        if (!alive) return;
        const match = findUniverseTree(data.universes || [], story.slug);
        setTree(match);
      })
      .catch(() => { if (alive) setTree(null); });
    return () => { alive = false; };
  }, [story.slug]);

  if (!tree || !UniverseCosmos) return null;

  const universeName = story.universe?.name?.[lang] || story.universe?.name?.es
    || tree.root.title?.[lang] || tree.root.title?.es;
  const label = lang === 'es' ? 'UNIVERSO' : 'UNIVERSE';
  const hint = lang === 'es'
    ? 'Cuentos del mismo hilo. Clic para seguir leyendo.'
    : 'Stories from the same thread. Click to keep reading.';
  const totalLbl = lang === 'es' ? `${tree.total} NODOS` : `${tree.total} NODES`;
  const openLbl = lang === 'es' ? 'ABRIR UNIVERSO →' : 'OPEN UNIVERSE →';
  const openUniverse = window.CFIA_onOpenUniverse;

  return (
    <>
      <hr style={rdStyles.sepHair} />
      <section style={universeMapStyles.wrap}>
        <div style={universeMapStyles.head}>
          <span style={universeMapStyles.label}>◼ {label}</span>
          <span style={universeMapStyles.name}>{universeName}</span>
          <span style={universeMapStyles.total}>{totalLbl}</span>
          {openUniverse ? (
            <a style={universeMapStyles.openLink} onClick={() => openUniverse(tree.root.slug)}>
              {openLbl}
            </a>
          ) : null}
        </div>
        <div style={universeMapStyles.hint}>{hint}</div>
        <div style={universeMapStyles.canvas}>
          <UniverseCosmos root={tree.root} lang={lang} onOpen={onOpen} currentSlug={story.slug} coParents={tree.coParents || []} />
        </div>
      </section>
    </>
  );
}

const universeMapStyles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12, padding: '24px 0' },
  head: { display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' },
  label: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#e8b84a', textTransform: 'uppercase' },
  name: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: '#f5f3ee', letterSpacing: '-0.01em', flex: 1, minWidth: 160 },
  total: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: '#6b6860', textTransform: 'uppercase' },
  openLink: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#f5f3ee', cursor: 'pointer', borderBottom: '1px solid #6b6860', paddingBottom: 2 },
  hint: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: '#b8b5ad' },
  canvas: { border: '1px solid #1a1a22', background: '#050508' },
};

function RelatedStories({ story, lang, t, onOpen }) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let alive = true;
    setItems(null);
    fetch(`/api/stories/${story.slug}/related`)
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((data) => { if (alive) setItems(data.items || []); })
      .catch(() => { if (alive) setItems([]); });
    return () => { alive = false; };
  }, [story.slug]);

  if (!items || !items.length) return null;

  return (
    <>
      <hr style={rdStyles.sepHair} />
      <section style={relatedStyles.wrap}>
        <div style={relatedStyles.label}>◼ {t.relatedTitle}</div>
        <ul style={relatedStyles.list}>
          {items.map((it) => (
            <li key={it.slug} style={relatedStyles.item}>
              <a style={relatedStyles.link} onClick={() => onOpen?.(it.slug)}>
                <span style={relatedStyles.badge}>{t.reason[it.reason] || it.reason}</span>
                <span style={relatedStyles.num}>{String(it.num).padStart(3, '0')}</span>
                <span style={relatedStyles.title}>
                  {it.title?.[lang] || it.title?.es || it.slug}
                </span>
                <span style={relatedStyles.arrow}>→</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

const AUTH_KEY_EXPAND = 'cfia_create_auth_v1';
const ANGLES = ['auto', 'secuela', 'precuela', 'lateral', 'eco'];
const FORMS = [
  { id: 'escena',         es: 'ESCENA ÚNICA',         en: 'SINGLE SCENE' },
  { id: 'segunda-persona',es: 'SEGUNDA PERSONA',      en: 'SECOND PERSON' },
  { id: 'epistolar',      es: 'CARTA / EPISTOLAR',    en: 'LETTER / EPISTOLARY' },
  { id: 'inventario',     es: 'INVENTARIO',           en: 'INVENTORY' },
  { id: 'transcripcion',  es: 'TRANSCRIPCIÓN',        en: 'TRANSCRIPT' },
  { id: 'informe',        es: 'INFORME TÉCNICO',      en: 'TECHNICAL REPORT' },
  { id: 'viñetas',        es: 'VIÑETAS',              en: 'VIGNETTES' },
  { id: 'monologo',       es: 'MONÓLOGO HABLADO',     en: 'SPOKEN MONOLOGUE' },
  { id: 'diario',         es: 'DIARIO',               en: 'DIARY' },
  { id: 'presente',       es: 'TIEMPO PRESENTE',      en: 'PRESENT TENSE' },
  { id: 'futuro-anterior',es: 'MIRADA DESDE EL FUTURO', en: 'FROM THE FUTURE' },
  { id: 'plural',         es: 'PRIMERA PERSONA PLURAL', en: 'FIRST-PERSON PLURAL' },
  { id: 'filosofia',      es: 'FILOSÓFICO / ENSAYO',  en: 'PHILOSOPHICAL / ESSAY' },
];

function ExpandPanel({ story, lang, t, onCreated }) {
  const [auth, setAuth] = useState(() => {
    try { return localStorage.getItem(AUTH_KEY_EXPAND) || ''; } catch { return ''; }
  });
  const [angle, setAngle] = useState('auto');
  const [provider, setProvider] = useState('anthropic');
  const [form, setForm] = useState('inherit');
  const [length, setLength] = useState('medium');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [extraParentSlugs, setExtraParentSlugs] = useState([]);

  const parentForm = story.form;
  const parentFormDef = parentForm ? FORMS.find((f) => f.id === parentForm) : null;
  const parentFormLabel = parentFormDef ? (lang === 'es' ? parentFormDef.es : parentFormDef.en) : t.parentFormUnknown;

  if (!auth) {
    return (
      <>
        <hr style={rdStyles.sepHair} />
        <section style={expandStyles.wrap}>
          <div style={expandStyles.title}>◼ {t.expandTitle}</div>
          <div style={expandStyles.hint}>{t.lockedHint}</div>
        </section>
      </>
    );
  }

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const r = await fetch(`/api/stories/${story.slug}/expand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-create-auth': auth },
        body: JSON.stringify({ angle, form, prompt, length, provider, temp: 0.9, extraParentSlugs }),
      });
      if (r.status === 401) {
        try { localStorage.removeItem(AUTH_KEY_EXPAND); } catch {}
        setAuth('');
        throw new Error(lang === 'es' ? 'Sesión expirada.' : 'Session expired.');
      }
      if (!r.ok) {
        const j = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
        throw new Error(j.error || `HTTP ${r.status}`);
      }
      const data = await r.json();
      onCreated?.(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <hr style={rdStyles.sepHair} />
      <section style={expandStyles.wrap}>
        <div style={expandStyles.title}>◼ {t.expandTitle}</div>
        <div style={expandStyles.hint}>{t.expandHint}</div>

        <div style={expandStyles.field}>
          <label style={expandStyles.label}>{t.angleLabel}</label>
          <div style={expandStyles.segBox}>
            {ANGLES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAngle(a)}
                style={{ ...expandStyles.segBtn, ...(angle === a ? expandStyles.segBtnOn : {}) }}
              >
                {t.angles[a]}
              </button>
            ))}
          </div>
        </div>

        <div style={expandStyles.field}>
          <label style={expandStyles.label}>{t.providerLabel}</label>
          <div style={expandStyles.segBox}>
            {['anthropic', 'google'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p)}
                style={{ ...expandStyles.segBtn, ...(provider === p ? expandStyles.segBtnOn : {}) }}
              >
                {t.providers[p]}
              </button>
            ))}
          </div>
        </div>

        <div style={expandStyles.field}>
          <label style={expandStyles.label}>
            {t.formLabel}
            {parentForm ? <span style={expandStyles.parentTag}> · {t.parentFormTag}: {parentFormLabel}</span> : null}
          </label>
          <select style={expandStyles.select} value={form} onChange={(e) => setForm(e.target.value)}>
            <option value="inherit">{t.inheritOpt}</option>
            {FORMS.map((f) => (
              <option key={f.id} value={f.id}>{lang === 'es' ? f.es : f.en}</option>
            ))}
          </select>
          <div style={expandStyles.hintSmall}>{t.formHintExpand}</div>
        </div>

        <div style={expandStyles.field}>
          <label style={expandStyles.label}>{t.lengthLabel}</label>
          <div style={expandStyles.segBox}>
            {['short', 'medium', 'long'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setLength(k)}
                style={{ ...expandStyles.segBtn, ...(length === k ? expandStyles.segBtnOn : {}) }}
              >
                {t.lengthOpts[k]}
              </button>
            ))}
          </div>
        </div>

        <CoParentPicker story={story} lang={lang} t={t} selected={extraParentSlugs} onChange={setExtraParentSlugs} />

        <div style={expandStyles.field}>
          <label style={expandStyles.label}>{t.promptLabel}</label>
          <textarea
            style={expandStyles.textarea}
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t.promptPh}
          />
        </div>

        <ContextViewer slug={story.slug} lang={lang} t={t} />

        {error ? <div style={expandStyles.error}>{t.err} {error}</div> : null}

        <button
          type="button"
          onClick={submit}
          disabled={loading}
          style={{ ...expandStyles.submit, ...(loading ? expandStyles.submitDisabled : {}) }}
        >
          {loading ? <>{t.expanding}<span style={expandStyles.blink}>◼</span></> : t.expandBtn}
        </button>
      </section>
    </>
  );
}

function collectDescendants(allStories, rootSlug) {
  const childrenBy = new Map();
  for (const s of allStories) {
    const ps = s.parentSlug;
    if (!ps) continue;
    if (!childrenBy.has(ps)) childrenBy.set(ps, []);
    childrenBy.get(ps).push(s.slug);
  }
  const out = new Set([rootSlug]);
  const stack = [rootSlug];
  while (stack.length) {
    const cur = stack.pop();
    const kids = childrenBy.get(cur) || [];
    for (const k of kids) if (!out.has(k)) { out.add(k); stack.push(k); }
  }
  return out;
}

function collectTreeSlugs(node, set) {
  if (!node) return set;
  set.add(node.slug);
  for (const c of node.children || []) collectTreeSlugs(c, set);
  return set;
}

function CoParentPicker({ story, lang, t, selected, onChange }) {
  const all = window.CFIA_STORIES || [];
  const [tree, setTree] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoaded(false);
    setTree(null);
    fetch('/api/universes')
      .then((r) => r.ok ? r.json() : { universes: [] })
      .then((data) => {
        if (!alive) return;
        setTree(findUniverseTree(data.universes || [], story.slug));
        setLoaded(true);
      })
      .catch(() => { if (alive) { setTree(null); setLoaded(true); } });
    return () => { alive = false; };
  }, [story.slug]);

  const candidates = useMemo(() => {
    if (!tree) return [];
    const inTree = collectTreeSlugs(tree.root, new Set());
    const excluded = collectDescendants(all, story.slug);
    return all
      .filter((s) => inTree.has(s.slug) && !excluded.has(s.slug))
      .sort((a, b) => (a.num || 0) - (b.num || 0));
  }, [all, story.slug, tree]);

  const toggle = (slug) => {
    if (selected.includes(slug)) {
      onChange(selected.filter((s) => s !== slug));
    } else {
      if (selected.length >= 6) return;
      onChange([...selected, slug]);
    }
  };

  if (!loaded) return null;

  if (!tree) {
    return (
      <div style={expandStyles.field}>
        <label style={expandStyles.label}>{t.coParentsLabel}</label>
        <div style={expandStyles.hintSmall}>{t.coParentsNoUniverse}</div>
      </div>
    );
  }

  return (
    <div style={expandStyles.field}>
      <label style={expandStyles.label}>
        {t.coParentsLabel}
        {selected.length ? <span style={expandStyles.parentTag}> · {t.coParentsSelected(selected.length)}</span> : null}
      </label>
      <div style={expandStyles.hintSmall}>{t.coParentsHint}</div>
      {candidates.length === 0 ? (
        <div style={coParentStyles.empty}>{t.coParentsNone}</div>
      ) : (
        <>
          <div style={coParentStyles.list}>
            {candidates.map((s) => {
              const on = selected.includes(s.slug);
              const title = s.title?.[lang] || s.title?.es || s.slug;
              const excerpt = s.excerpt?.[lang] || s.excerpt?.es || '';
              const disabled = !on && selected.length >= 6;
              return (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => toggle(s.slug)}
                  disabled={disabled}
                  style={{
                    ...coParentStyles.item,
                    ...(on ? coParentStyles.itemOn : {}),
                    ...(disabled ? coParentStyles.itemDisabled : {}),
                  }}
                >
                  <span style={coParentStyles.check}>{on ? '◼' : '◻'}</span>
                  <span style={coParentStyles.num}>{String(s.num).padStart(3, '0')}</span>
                  <span style={coParentStyles.titleCol}>
                    <span style={coParentStyles.title}>{title}</span>
                    {excerpt ? <span style={coParentStyles.excerpt}>{excerpt.length > 120 ? excerpt.slice(0, 119) + '…' : excerpt}</span> : null}
                  </span>
                </button>
              );
            })}
          </div>
          {selected.length ? (
            <button type="button" onClick={() => onChange([])} style={coParentStyles.clear}>
              × {t.coParentsClear}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

const coParentStyles = {
  list: { display: 'flex', flexDirection: 'column', border: '1px solid #2a2a35', maxHeight: 260, overflow: 'auto', background: '#0a0a0f' },
  item: { display: 'grid', gridTemplateColumns: '24px 48px 1fr', gap: 10, alignItems: 'baseline', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: '1px solid #1a1a22', color: '#f5f3ee', padding: '10px 12px', cursor: 'pointer' },
  itemOn: { background: 'rgba(232,184,74,0.1)', borderLeftColor: '#e8b84a', boxShadow: 'inset 2px 0 0 #e8b84a' },
  itemDisabled: { opacity: 0.35, cursor: 'not-allowed' },
  check: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#e8b84a' },
  num: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', color: '#6b6860' },
  titleCol: { display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 },
  title: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: '#f5f3ee', lineHeight: 1.25 },
  excerpt: { fontFamily: "'Instrument Serif', serif", fontSize: 12, color: '#b8b5ad', lineHeight: 1.4 },
  empty: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', color: '#6b6860', padding: 10 },
  clear: { alignSelf: 'flex-start', background: 'transparent', border: '1px solid #3a3832', color: '#b8b5ad', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', padding: '8px 12px', cursor: 'pointer', textTransform: 'uppercase' },
};

const CTX_WARN_THRESHOLD = 8000;

function ContextViewer({ slug, lang, t }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [compacting, setCompacting] = useState(false);
  const [compactResult, setCompactResult] = useState(null);
  const [compactError, setCompactError] = useState(null);

  const fetchCtx = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/stories/${slug}/expand-context`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setData(await r.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggle = async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (data || loading) return;
    await fetchCtx();
  };

  const compact = async () => {
    const auth = (() => { try { return localStorage.getItem('cfia_create_auth_v1') || ''; } catch { return ''; } })();
    if (!auth) { setCompactError(t.ctxCompactAuth); return; }
    setCompactError(null);
    setCompactResult(null);
    setCompacting(true);
    try {
      const r = await fetch('/api/universe/compact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-create-auth': auth },
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
        throw new Error(j.error || `HTTP ${r.status}`);
      }
      const result = await r.json();
      setCompactResult(result);
      await fetchCtx();
    } catch (e) {
      setCompactError(e.message);
    } finally {
      setCompacting(false);
    }
  };

  const entities = data?.universe?.memory?.entities;

  return (
    <div style={ctxStyles.wrap}>
      <button type="button" onClick={toggle} style={ctxStyles.toggle}>
        {open ? t.ctxToggleHide : t.ctxToggleShow}
      </button>
      {open ? (
        <div style={ctxStyles.panel}>
          {loading ? (
            <div style={ctxStyles.loading}>{t.ctxLoading}<span style={expandStyles.blink}>◼</span></div>
          ) : error ? (
            <div style={expandStyles.error}>{t.err} {error}</div>
          ) : data ? (
            <>
              <div style={ctxStyles.section}>
                <div style={ctxStyles.sectionLbl}>◼ {t.ctxAncestors} ({data.ancestors.length})</div>
                {data.ancestors.length ? (
                  <ol style={ctxStyles.list}>
                    {data.ancestors.map((a) => (
                      <li key={a.slug} style={ctxStyles.ancItem}>
                        <span style={ctxStyles.ancNum}>[{String(a.num).padStart(3, '0')}]</span>
                        <span style={ctxStyles.ancTitle}>{a.titleEs}</span>
                        <div style={ctxStyles.ancExcerpt}>{a.excerptEs}</div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div style={ctxStyles.empty}>{t.ctxAncestorsEmpty}</div>
                )}
              </div>

              <div style={ctxStyles.section}>
                <div style={ctxStyles.sectionLbl}>◼ {t.ctxParent} · {data.parent.bodyChars} {t.ctxChars}</div>
                <div style={ctxStyles.bodyPreview}>{data.parent.bodyPreview}</div>
              </div>

              {data.universe ? (
                <div style={ctxStyles.section}>
                  <div style={ctxStyles.sectionLbl}>
                    ◼ {t.ctxUniverse} · {data.universe.name?.[lang] || data.universe.name?.es}
                  </div>
                  {data.universe.memory?.summaryEs ? (
                    <div style={ctxStyles.memSummary}>{data.universe.memory.summaryEs}</div>
                  ) : <div style={ctxStyles.empty}>—</div>}
                  {entities && Object.keys(entities).length ? (
                    <div style={ctxStyles.entBlock}>
                      <div style={ctxStyles.sectionLbl}>◻ {t.ctxEntities}</div>
                      {Object.entries(entities).map(([k, v]) => (
                        Array.isArray(v) && v.length ? (
                          <div key={k} style={ctxStyles.entRow}>
                            <span style={ctxStyles.entKey}>{k}:</span> <span style={ctxStyles.entVal}>{v.join(' · ')}</span>
                          </div>
                        ) : null
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {data.author ? (
                <div style={ctxStyles.section}>
                  <div style={ctxStyles.sectionLbl}>◼ {t.ctxAuthor} · {data.author.name}</div>
                  <div style={ctxStyles.authorNote}>{data.author.styleNote}</div>
                </div>
              ) : null}

              <div style={ctxStyles.stats}>
                {t.ctxStats}: {data.stats.totalChars.toLocaleString()} {t.ctxChars}
              </div>

              {data.universe ? (
                <div style={ctxStyles.compactWrap}>
                  {data.stats.totalChars > CTX_WARN_THRESHOLD ? (
                    <div style={ctxStyles.warn}>◼ {t.ctxWarn}</div>
                  ) : null}
                  <button
                    type="button"
                    onClick={compact}
                    disabled={compacting}
                    style={{
                      ...ctxStyles.compactBtn,
                      ...(data.stats.totalChars > CTX_WARN_THRESHOLD ? ctxStyles.compactBtnUrgent : {}),
                      ...(compacting ? ctxStyles.compactBtnDisabled : {}),
                    }}
                  >
                    {compacting ? <>{t.ctxCompacting}<span style={expandStyles.blink}>◼</span></> : t.ctxCompactBtn}
                  </button>
                  {compactResult ? (
                    <div style={ctxStyles.compactDone}>✓ {t.ctxCompactDone(compactResult)}</div>
                  ) : null}
                  {compactError ? (
                    <div style={expandStyles.error}>{t.err} {compactError}</div>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const ctxStyles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 8 },
  toggle: { alignSelf: 'flex-start', background: 'transparent', border: '1px solid #3a3832', color: '#b8b5ad', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', padding: '8px 14px', cursor: 'pointer', textTransform: 'uppercase' },
  panel: { border: '1px solid #2a2a35', padding: '16px 18px', background: '#0f0f16', display: 'flex', flexDirection: 'column', gap: 20 },
  loading: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#6b6860', letterSpacing: '0.16em' },
  section: { display: 'flex', flexDirection: 'column', gap: 8 },
  sectionLbl: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: '#e8b84a', textTransform: 'uppercase' },
  list: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 },
  ancItem: { display: 'flex', flexDirection: 'column', gap: 4, borderLeft: '1px solid #3a3832', paddingLeft: 10 },
  ancNum: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.12em', color: '#6b6860', marginRight: 6 },
  ancTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: '#f5f3ee' },
  ancExcerpt: { fontFamily: "'Instrument Serif', serif", fontSize: 13, lineHeight: 1.5, color: '#b8b5ad' },
  empty: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#6b6860', letterSpacing: '0.12em' },
  bodyPreview: { fontFamily: "'Instrument Serif', serif", fontSize: 13, lineHeight: 1.55, color: '#b8b5ad', maxHeight: 220, overflow: 'auto', border: '1px solid #2a2a35', padding: 10, whiteSpace: 'pre-wrap' },
  memSummary: { fontFamily: "'Instrument Serif', serif", fontSize: 13, lineHeight: 1.55, color: '#b8b5ad', border: '1px solid #2a2a35', padding: 10 },
  entBlock: { display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 },
  entRow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.08em', color: '#b8b5ad' },
  entKey: { color: '#6b6860', textTransform: 'uppercase', letterSpacing: '0.14em' },
  entVal: { color: '#f5f3ee' },
  authorNote: { fontFamily: "'Instrument Serif', serif", fontSize: 13, lineHeight: 1.5, color: '#b8b5ad' },
  stats: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', color: '#e8b84a', textTransform: 'uppercase', borderTop: '1px solid #2a2a35', paddingTop: 10 },
  compactWrap: { display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid #2a2a35', paddingTop: 12 },
  warn: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, lineHeight: 1.5, letterSpacing: '0.08em', color: '#e8b84a', border: '1px solid #e8b84a', padding: 10, background: 'rgba(232,184,74,0.06)' },
  compactBtn: { alignSelf: 'flex-start', background: 'transparent', border: '1px solid #3a3832', color: '#b8b5ad', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', padding: '10px 16px', cursor: 'pointer', textTransform: 'uppercase' },
  compactBtnUrgent: { background: '#e8b84a', borderColor: '#e8b84a', color: '#0a0a0f' },
  compactBtnDisabled: { opacity: 0.5, cursor: 'wait' },
  compactDone: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.12em', color: '#9ac17a', textTransform: 'uppercase' },
};

const relatedStyles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 16, padding: '24px 0' },
  label: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#e8b84a', textTransform: 'uppercase' },
  list: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' },
  item: { borderTop: '1px solid #2a2a35' },
  link: { display: 'grid', gridTemplateColumns: '150px 48px 1fr auto', alignItems: 'baseline', gap: 16, padding: '16px 4px', cursor: 'pointer', color: '#f5f3ee', textDecoration: 'none' },
  badge: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: '#e8b84a', textTransform: 'uppercase' },
  num: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.12em', color: '#6b6860' },
  title: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, lineHeight: 1.25, color: '#f5f3ee' },
  arrow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#6b6860' },
};

const expandStyles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 16, padding: '24px 0 48px' },
  title: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#e8b84a', textTransform: 'uppercase' },
  hint: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: '#b8b5ad', maxWidth: 520 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: '#6b6860', textTransform: 'uppercase' },
  segBox: { display: 'flex', border: '1px solid #3a3832', flexWrap: 'wrap' },
  segBtn: { flex: 1, minWidth: 80, background: '#0a0a0f', border: 'none', borderRight: '1px solid #3a3832', color: '#b8b5ad', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', padding: '12px 8px', cursor: 'pointer' },
  segBtnOn: { background: '#e8b84a', color: '#0a0a0f' },
  select: { background: '#0a0a0f', border: '1px solid #3a3832', color: '#f5f3ee', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.1em', padding: '10px 12px', outline: 'none' },
  textarea: { background: '#0a0a0f', border: '1px solid #3a3832', color: '#f5f3ee', fontFamily: "'Instrument Serif', serif", fontSize: 16, lineHeight: 1.5, padding: '12px 14px', outline: 'none', resize: 'vertical', minHeight: 80 },
  parentTag: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.14em', color: '#6b6860', marginLeft: 4 },
  hintSmall: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.12em', color: '#6b6860', textTransform: 'uppercase' },
  submit: { alignSelf: 'flex-start', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.18em', background: '#e8b84a', color: '#0a0a0f', border: 'none', padding: '14px 24px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10 },
  submitDisabled: { background: '#3a3832', color: '#6b6860', cursor: 'wait' },
  blink: { animation: 'cfia-blink 1.1s steps(1) infinite' },
  error: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.08em', color: '#e8b84a', border: '1px solid #e8b84a', padding: 12, background: 'rgba(232,184,74,0.05)' },
};

const AUDIO_ENGINE_KEY = 'cfia_audio_engine_v1';

function AudioPlayer({ slug, lang, labels, title, paragraphs }) {
  const [open, setOpen] = useState(false);
  const [engine, setEngine] = useState(() => {
    try {
      const saved = localStorage.getItem(AUDIO_ENGINE_KEY);
      if (saved === 'browser' || saved === 'eleven') return saved;
    } catch {}
    return 'browser';
  });

  useEffect(() => {
    try { localStorage.setItem(AUDIO_ENGINE_KEY, engine); } catch {}
  }, [engine]);

  return (
    <div style={audioStyles.wrap}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={audioStyles.toggle}
        aria-expanded={open}
      >
        <span style={audioStyles.toggleLeft}>
          <span style={audioStyles.toggleIcon}>♪</span>
          <span style={audioStyles.toggleLbl}>{labels.audio}</span>
          <span style={audioStyles.toggleStatus}>· {engine === 'browser' ? labels.engineBrowser : labels.engineEleven}</span>
        </span>
        <span style={audioStyles.toggleChev}>{open ? '▲' : '▼'}</span>
      </button>

      {open ? (
        <div style={audioStyles.panel}>
          <div style={audioStyles.engineRow}>
            <span style={audioStyles.fieldLbl}>{labels.engineLabel}</span>
            <div style={audioStyles.engineToggle}>
              <button
                type="button"
                onClick={() => setEngine('browser')}
                style={{ ...audioStyles.engineBtn, ...(engine === 'browser' ? audioStyles.engineBtnActive : {}) }}
              >
                {labels.engineBrowser}
              </button>
              <button
                type="button"
                onClick={() => setEngine('eleven')}
                style={{ ...audioStyles.engineBtn, ...(engine === 'eleven' ? audioStyles.engineBtnActive : {}) }}
              >
                {labels.engineEleven}
              </button>
            </div>
          </div>
          <div style={audioStyles.hint}>
            {engine === 'browser' ? labels.engineBrowserHint : labels.engineElevenHint}
          </div>

          {engine === 'browser'
            ? <BrowserEngine key={`${slug}:${lang}`} title={title} paragraphs={paragraphs} lang={lang} labels={labels} />
            : <ElevenEngine key={`${slug}:${lang}`} slug={slug} lang={lang} labels={labels} />}
        </div>
      ) : null}
    </div>
  );
}

function ElevenEngine({ slug, lang, labels }) {
  const [rate, setRate] = useState(1);
  const [state, setState] = useState('idle'); // idle | loading | playing | paused | error
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const audioRef = useRef(null);

  const src = useMemo(() => `/api/audio/${encodeURIComponent(slug)}/${lang}`, [slug, lang]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate]);

  useEffect(() => () => {
    const a = audioRef.current;
    if (a) { a.pause(); a.src = ''; }
  }, []);

  function getAudio() {
    if (audioRef.current) return audioRef.current;
    const a = new Audio(src);
    a.preload = 'none';
    a.playbackRate = rate;
    a.addEventListener('playing', () => setState('playing'));
    a.addEventListener('pause', () => setState((s) => (s === 'playing' ? 'paused' : s)));
    a.addEventListener('ended', () => { setState('idle'); setProgress(0); });
    a.addEventListener('loadedmetadata', () => setDuration(a.duration || 0));
    a.addEventListener('timeupdate', () => {
      if (a.duration > 0) setProgress(a.currentTime / a.duration);
    });
    a.addEventListener('error', () => {
      setState('error');
      setErrorMsg(lang === 'es' ? 'No se pudo cargar el audio' : 'Audio failed to load');
    });
    audioRef.current = a;
    return a;
  }

  async function play() {
    setErrorMsg('');
    const a = getAudio();
    if (state === 'paused') {
      try { await a.play(); } catch (e) { setState('error'); setErrorMsg(e.message); }
      return;
    }
    setState('loading');
    try {
      a.currentTime = 0;
      await a.play();
    } catch (e) {
      setState('error');
      setErrorMsg(e.message || 'play failed');
    }
  }

  function pause() {
    audioRef.current?.pause();
  }

  function stop() {
    const a = audioRef.current;
    if (a) { a.pause(); try { a.currentTime = 0; } catch {} }
    setState('idle');
    setProgress(0);
  }

  function seek(e) {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    a.currentTime = ratio * a.duration;
    setProgress(ratio);
  }

  const isPlaying = state === 'playing';
  const isPaused = state === 'paused';
  const isLoading = state === 'loading';

  const fmt = (s) => {
    if (!s || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${r.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div style={audioStyles.row}>
        <div style={audioStyles.controls}>
          {!isPlaying ? (
            <button
              type="button"
              onClick={play}
              disabled={isLoading}
              style={{ ...audioStyles.btn, ...audioStyles.btnPrimary, ...(isLoading ? audioStyles.btnOff : {}) }}
            >
              {isLoading ? '…' : isPaused ? `▶ ${labels.resume}` : `▶ ${labels.listen}`}
            </button>
          ) : (
            <button type="button" onClick={pause} style={audioStyles.btn}>
              ❚❚ {labels.pause}
            </button>
          )}
          <button
            type="button"
            onClick={stop}
            disabled={state === 'idle'}
            style={{ ...audioStyles.btn, ...(state === 'idle' ? audioStyles.btnOff : {}) }}
          >
            ■ {labels.stop}
          </button>
        </div>
        <div style={audioStyles.selectors}>
          <label style={audioStyles.field}>
            <span style={audioStyles.fieldLbl}>{labels.speed} · {rate.toFixed(2)}×</span>
            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.05"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              style={audioStyles.range}
            />
          </label>
        </div>
      </div>

      <div
        style={audioStyles.seekOuter}
        onClick={seek}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={progress}
      >
        <div style={{ ...audioStyles.seekInner, width: `${Math.round(progress * 100)}%` }} />
      </div>

      {duration ? (
        <div style={audioStyles.hint}>
          {fmt((audioRef.current?.currentTime) || 0)} / {fmt(duration)}
        </div>
      ) : null}

      {errorMsg ? <div style={audioStyles.err}>{errorMsg}</div> : null}
      {isLoading ? <div style={audioStyles.hint}>{labels.audioLoadingFirst}</div> : null}
    </>
  );
}

function BrowserEngine({ title, paragraphs, lang, labels }) {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const supported = !!synth;
  const [voices, setVoices] = useState([]);
  const [voiceURI, setVoiceURI] = useState('');
  const [rate, setRate] = useState(1);
  const [state, setState] = useState('idle'); // idle | playing | paused
  const [current, setCurrent] = useState(0);
  const indexRef = useRef(0);
  const stoppedRef = useRef(false);

  const chunks = useMemo(() => {
    const parts = [];
    if (title) parts.push(title);
    for (const p of paragraphs || []) if (p) parts.push(p);
    return parts;
  }, [title, paragraphs]);

  useEffect(() => {
    if (!supported) return;
    const load = () => {
      const all = synth.getVoices();
      const want = lang === 'es' ? 'es' : 'en';
      const matched = all.filter((v) => v.lang && v.lang.toLowerCase().startsWith(want));
      const list = matched.length ? matched : all;
      setVoices(list);
      setVoiceURI((prev) => {
        if (prev && list.some((v) => v.voiceURI === prev)) return prev;
        const def = list.find((v) => v.default) || list[0];
        return def ? def.voiceURI : '';
      });
    };
    load();
    synth.addEventListener('voiceschanged', load);
    return () => synth.removeEventListener('voiceschanged', load);
  }, [lang, supported, synth]);

  useEffect(() => () => { if (synth) synth.cancel(); }, [synth]);

  function speakFrom(i) {
    if (!supported) return;
    if (i >= chunks.length) { setState('idle'); setCurrent(0); indexRef.current = 0; return; }
    const u = new SpeechSynthesisUtterance(chunks[i]);
    const voice = voices.find((v) => v.voiceURI === voiceURI);
    if (voice) u.voice = voice;
    u.lang = voice?.lang || (lang === 'es' ? 'es-ES' : 'en-US');
    u.rate = rate;
    u.pitch = 1;
    u.onend = () => {
      if (stoppedRef.current) return;
      const next = indexRef.current + 1;
      indexRef.current = next;
      setCurrent(next);
      speakFrom(next);
    };
    u.onerror = () => setState('idle');
    synth.speak(u);
  }

  function play() {
    if (!supported) return;
    if (state === 'paused') { synth.resume(); setState('playing'); return; }
    stoppedRef.current = false;
    synth.cancel();
    indexRef.current = 0;
    setCurrent(0);
    setState('playing');
    speakFrom(0);
  }

  function pause() {
    if (!supported || state !== 'playing') return;
    synth.pause();
    setState('paused');
  }

  function stop() {
    if (!supported) return;
    stoppedRef.current = true;
    synth.cancel();
    setState('idle');
    indexRef.current = 0;
    setCurrent(0);
  }

  if (!supported) {
    return <div style={audioStyles.unsupported}>{labels.unsupported}</div>;
  }

  const isPlaying = state === 'playing';
  const isPaused = state === 'paused';
  const progress = chunks.length ? current / chunks.length : 0;

  return (
    <>
      <div style={audioStyles.row}>
        <div style={audioStyles.controls}>
          {!isPlaying ? (
            <button
              type="button"
              onClick={play}
              style={{ ...audioStyles.btn, ...audioStyles.btnPrimary }}
            >
              {isPaused ? `▶ ${labels.resume}` : `▶ ${labels.listen}`}
            </button>
          ) : (
            <button type="button" onClick={pause} style={audioStyles.btn}>
              ❚❚ {labels.pause}
            </button>
          )}
          <button
            type="button"
            onClick={stop}
            disabled={state === 'idle'}
            style={{ ...audioStyles.btn, ...(state === 'idle' ? audioStyles.btnOff : {}) }}
          >
            ■ {labels.stop}
          </button>
        </div>
        <div style={audioStyles.selectors}>
          <label style={audioStyles.field}>
            <span style={audioStyles.fieldLbl}>{labels.voice}</span>
            <select
              value={voiceURI}
              onChange={(e) => setVoiceURI(e.target.value)}
              style={audioStyles.select}
            >
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} — {v.lang}
                </option>
              ))}
            </select>
          </label>
          <label style={audioStyles.field}>
            <span style={audioStyles.fieldLbl}>{labels.speed} · {rate.toFixed(2)}×</span>
            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.05"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              style={audioStyles.range}
            />
          </label>
        </div>
      </div>

      <div style={audioStyles.seekOuter}>
        <div style={{ ...audioStyles.seekInner, width: `${Math.round(progress * 100)}%` }} />
      </div>

      {state !== 'idle' ? (
        <div style={audioStyles.status}>
          {isPlaying ? labels.playing : labels.pause} · {labels.para} {Math.min(current + 1, chunks.length)} / {chunks.length}
        </div>
      ) : null}
    </>
  );
}


const audioStyles = {
  wrap: { display: 'flex', flexDirection: 'column' },
  toggle: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, background: 'transparent', border: '1px solid #2a2a35', padding: '10px 14px', cursor: 'pointer', color: '#b8b5ad', width: '100%', textAlign: 'left' },
  toggleLeft: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  toggleIcon: { color: '#e8b84a', fontSize: 12 },
  toggleLbl: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#f5f3ee', textTransform: 'uppercase' },
  toggleStatus: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', color: '#6b6860', textTransform: 'uppercase' },
  toggleChev: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#6b6860' },
  panel: { border: '1px solid #2a2a35', borderTop: 0, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12, background: '#0f0f16' },
  engineRow: { display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  engineToggle: { display: 'flex', border: '1px solid #2a2a35' },
  engineBtn: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b8b5ad', background: 'transparent', border: 0, padding: '8px 14px', cursor: 'pointer' },
  engineBtnActive: { background: '#e8b84a', color: '#0a0a0f' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' },
  controls: { display: 'flex', gap: 8 },
  btn: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#f5f3ee', background: 'transparent', border: '1px solid #3a3832', padding: '10px 14px', cursor: 'pointer' },
  btnPrimary: { background: '#e8b84a', color: '#0a0a0f', borderColor: '#e8b84a' },
  btnOff: { opacity: 0.4, cursor: 'not-allowed' },
  selectors: { display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' },
  field: { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 },
  fieldLbl: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', color: '#6b6860', textTransform: 'uppercase' },
  select: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.08em', color: '#f5f3ee', background: '#0a0a0f', border: '1px solid #2a2a35', padding: '6px 8px', cursor: 'pointer' },
  range: { accentColor: '#e8b84a', width: '100%' },
  status: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: '#e8b84a', textTransform: 'uppercase' },
  unsupported: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.12em', color: '#6b6860', border: '1px dashed #2a2a35', padding: 14 },
  seekOuter: { height: 6, background: '#1a1a22', border: '1px solid #2a2a35', cursor: 'pointer', position: 'relative' },
  seekInner: { height: '100%', background: '#e8b84a', transition: 'width 120ms linear' },
  err: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.12em', color: '#e8b84a', textTransform: 'uppercase' },
  hint: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.12em', color: '#6b6860', textTransform: 'uppercase' },
};

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
  likeRow: { display: 'flex', justifyContent: 'flex-start' },
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

function UniverseMemoryViewer({ lang, t }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [compacting, setCompacting] = useState(false);
  const [compactResult, setCompactResult] = useState(null);
  const [compactError, setCompactError] = useState(null);

  const fetchMem = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/universe');
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setData(await r.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggle = async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (data || loading) return;
    await fetchMem();
  };

  const compact = async () => {
    const auth = (() => { try { return localStorage.getItem('cfia_create_auth_v1') || ''; } catch { return ''; } })();
    if (!auth) { setCompactError(t.ctxCompactAuth); return; }
    setCompactError(null);
    setCompactResult(null);
    setCompacting(true);
    try {
      const r = await fetch('/api/universe/compact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-create-auth': auth },
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
        throw new Error(j.error || `HTTP ${r.status}`);
      }
      setCompactResult(await r.json());
      await fetchMem();
    } catch (e) {
      setCompactError(e.message);
    } finally {
      setCompacting(false);
    }
  };

  const summary = data?.memory?.summary?.[lang] || data?.memory?.summary?.es || '';
  const entities = data?.memory?.entities;
  const totalChars = (summary?.length || 0) + (entities ? JSON.stringify(entities).length : 0);

  return (
    <div style={ctxStyles.wrap}>
      <button type="button" onClick={toggle} style={ctxStyles.toggle}>
        {open ? t.umToggleHide : t.umToggleShow}
      </button>
      {open ? (
        <div style={ctxStyles.panel}>
          {loading ? (
            <div style={ctxStyles.loading}>{t.ctxLoading}<span style={expandStyles.blink}>◼</span></div>
          ) : error ? (
            <div style={expandStyles.error}>{t.err} {error}</div>
          ) : data ? (
            <>
              <div style={ctxStyles.section}>
                <div style={ctxStyles.sectionLbl}>
                  ◼ {t.ctxUniverse} · {data.universe?.name?.[lang] || data.universe?.name?.es}
                </div>
                {summary ? (
                  <div style={ctxStyles.memSummary}>{summary}</div>
                ) : <div style={ctxStyles.empty}>—</div>}
                {entities && Object.keys(entities).length ? (
                  <div style={ctxStyles.entBlock}>
                    <div style={ctxStyles.sectionLbl}>◻ {t.ctxEntities}</div>
                    {Object.entries(entities).map(([k, v]) => (
                      Array.isArray(v) && v.length ? (
                        <div key={k} style={ctxStyles.entRow}>
                          <span style={ctxStyles.entKey}>{k}:</span> <span style={ctxStyles.entVal}>{v.join(' · ')}</span>
                        </div>
                      ) : null
                    ))}
                  </div>
                ) : null}
              </div>

              <div style={ctxStyles.stats}>{t.ctxStats}: {totalChars.toLocaleString()} {t.ctxChars}</div>

              <div style={ctxStyles.compactWrap}>
                {totalChars > CTX_WARN_THRESHOLD ? (
                  <div style={ctxStyles.warn}>◼ {t.ctxWarn}</div>
                ) : null}
                <button
                  type="button"
                  onClick={compact}
                  disabled={compacting}
                  style={{
                    ...ctxStyles.compactBtn,
                    ...(totalChars > CTX_WARN_THRESHOLD ? ctxStyles.compactBtnUrgent : {}),
                    ...(compacting ? ctxStyles.compactBtnDisabled : {}),
                  }}
                >
                  {compacting ? <>{t.ctxCompacting}<span style={expandStyles.blink}>◼</span></> : t.ctxCompactBtn}
                </button>
                {compactResult ? <div style={ctxStyles.compactDone}>✓ {t.ctxCompactDone(compactResult)}</div> : null}
                {compactError ? <div style={expandStyles.error}>{t.err} {compactError}</div> : null}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

window.Reader = Reader;
window.ExpandContextViewer = ContextViewer;
window.UniverseMemoryViewer = UniverseMemoryViewer;
