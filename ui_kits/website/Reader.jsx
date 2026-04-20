import React, { useState, useEffect, useRef } from 'react';

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
        thread: 'HILO', expandsFrom: 'CONTINÚA DE', expandsTo: 'EXPANDIDO EN',
        relatedTitle: 'SEGUIR LEYENDO',
        reason: { parent: 'CONTINÚA DE', child: 'EXPANDIDO EN', sibling: 'HERMANO', tag: 'TAGS AFINES', recent: 'RECIENTE' },
        expandTitle: 'EXPANDIR ESTE CUENTO',
        expandHint: 'Pedile a ECHO-7 que escriba otro cuento que continúe, preceda o eche luz sobre este.',
        angleLabel: 'ÁNGULO',
        angles: { auto: 'AUTO', secuela: 'SECUELA', precuela: 'PRECUELA', lateral: 'LATERAL', eco: 'ECO' },
        formLabel: 'FORMA NARRATIVA',
        formHintExpand: 'HEREDAR usa la misma forma del padre. Elegí otra para contrastar.',
        inheritOpt: 'HEREDAR DEL PADRE',
        parentFormTag: 'FORMA DEL PADRE',
        parentFormUnknown: 'desconocida',
        promptLabel: 'INDICACIÓN (OPCIONAL)',
        promptPh: 'Guiá la expansión: qué personaje seguir, qué pregunta abrir, qué tono, qué imagen…',
        lengthLabel: 'DURACIÓN',
        lengthOpts: { short: 'BREVE · ~3 MIN', medium: 'MEDIO · ~6 MIN', long: 'LARGO · ~10 MIN' },
        ctxToggleShow: '▸ VER CONTEXTO QUE RECIBE ECHO-7',
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
        expandBtn: '▸ EXPANDIR',
        expanding: 'GENERANDO · ',
        lockedHint: 'Acceso restringido. Entrá por CREAR.',
        err: '◼ ERROR:' }
    : { back: '← Back to catalog', by: 'WRITTEN BY', universe: 'UNIVERSE', engine: 'ENGINE', curated: 'CURATED BY', chap: 'STORY',
        audio: 'AUDIO', listen: 'LISTEN', pause: 'PAUSE', resume: 'RESUME', stop: 'STOP',
        voice: 'VOICE', speed: 'SPEED', unsupported: 'Your browser does not support speech synthesis',
        para: 'PARAGRAPH', playing: 'PLAYING',
        thread: 'THREAD', expandsFrom: 'CONTINUES FROM', expandsTo: 'EXPANDED IN',
        relatedTitle: 'KEEP READING',
        reason: { parent: 'CONTINUES FROM', child: 'EXPANDED IN', sibling: 'SIBLING', tag: 'RELATED TAGS', recent: 'RECENT' },
        expandTitle: 'EXPAND THIS STORY',
        expandHint: 'Ask ECHO-7 to write another story that continues, precedes or sheds light on this one.',
        angleLabel: 'ANGLE',
        angles: { auto: 'AUTO', secuela: 'SEQUEL', precuela: 'PREQUEL', lateral: 'LATERAL', eco: 'ECHO' },
        formLabel: 'NARRATIVE FORM',
        formHintExpand: 'INHERIT reuses the parent form. Pick another to contrast.',
        inheritOpt: 'INHERIT FROM PARENT',
        parentFormTag: 'PARENT FORM',
        parentFormUnknown: 'unknown',
        promptLabel: 'PROMPT (OPTIONAL)',
        promptPh: 'Guide the expansion: which character to follow, what question to open, what tone, what image…',
        lengthLabel: 'LENGTH',
        lengthOpts: { short: 'SHORT · ~3 MIN', medium: 'MEDIUM · ~6 MIN', long: 'LONG · ~10 MIN' },
        ctxToggleShow: '▸ SHOW CONTEXT SENT TO ECHO-7',
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
              <span style={rdStyles.bylineVal}>{story.author?.name || 'ECHO-7'}</span>
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
            title={story.title[lang]}
            paragraphs={body}
            lang={lang}
            labels={t}
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

        <RelatedStories story={story} lang={lang} t={t} onOpen={onOpen} />

        <ExpandPanel story={story} lang={lang} t={t} onCreated={onCreated} />
      </article>
    </div>
  );
}

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
  const [form, setForm] = useState('inherit');
  const [length, setLength] = useState('medium');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        body: JSON.stringify({ angle, form, prompt, length, provider: 'anthropic', temp: 0.9 }),
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

function ContextViewer({ slug, lang, t }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggle = async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (data || loading) return;
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

function AudioPlayer({ title, paragraphs, lang, labels }) {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const supported = !!synth;
  const [open, setOpen] = useState(false);
  const [voices, setVoices] = useState([]);
  const [voiceURI, setVoiceURI] = useState('');
  const [rate, setRate] = useState(1);
  const [state, setState] = useState('idle');
  const [current, setCurrent] = useState(0);
  const utterRef = useRef(null);
  const indexRef = useRef(0);
  const stoppedRef = useRef(false);

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
  useEffect(() => { stop(); }, [paragraphs, lang]); // eslint-disable-line

  function speakFrom(i) {
    if (!supported) return;
    if (i >= paragraphs.length) { setState('idle'); setCurrent(0); indexRef.current = 0; return; }
    const u = new SpeechSynthesisUtterance(paragraphs[i]);
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
    utterRef.current = u;
    synth.speak(u);
  }

  function play() {
    if (!supported) return;
    stoppedRef.current = false;
    if (state === 'paused') { synth.resume(); setState('playing'); return; }
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
    setCurrent(0);
    indexRef.current = 0;
  }

  if (!supported) {
    return <div style={audioStyles.unsupported}>{labels.unsupported}</div>;
  }

  const isPlaying = state === 'playing';
  const isPaused = state === 'paused';
  const active = isPlaying || isPaused;

  return (
    <div style={audioStyles.wrap}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={audioStyles.toggle}
        aria-expanded={open}
      >
        <span style={audioStyles.toggleLeft}>
          <span style={audioStyles.toggleIcon}>{active ? '◉' : '♪'}</span>
          <span style={audioStyles.toggleLbl}>{labels.audio}</span>
          {active ? (
            <span style={audioStyles.toggleStatus}>
              · {isPlaying ? labels.playing : labels.pause} · {labels.para} {current + 1}/{paragraphs.length}
            </span>
          ) : null}
        </span>
        <span style={audioStyles.toggleChev}>{open ? '▲' : '▼'}</span>
      </button>

      {open ? (
      <div style={audioStyles.panel}>
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
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </label>
          <label style={audioStyles.field}>
            <span style={audioStyles.fieldLbl}>{labels.speed} · {rate.toFixed(2)}×</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.05"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              style={audioStyles.range}
            />
          </label>
        </div>
      </div>

      </div>
      ) : null}
    </div>
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

window.Reader = Reader;
window.ExpandContextViewer = ContextViewer;
