import React, { useState } from 'react';

const AUTH_KEY = 'cfia_create_auth_v1';

const PROVIDERS = [
  { id: 'anthropic', label: 'CLAUDE' },
  { id: 'google', label: 'GEMINI' },
  { id: 'both', label: 'AMBAS' },
];

const FORMS = [
  { id: 'random', es: 'ALEATORIA',         en: 'RANDOM' },
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

const MODELS_BY_PROVIDER = {
  anthropic: [
    { id: 'claude-sonnet-4-5', label: 'CLAUDE SONNET 4.5' },
    { id: 'claude-opus-4-5', label: 'CLAUDE OPUS 4.5' },
    { id: 'claude-haiku-4-5', label: 'CLAUDE HAIKU 4.5' },
  ],
  google: [
    { id: 'gemini-2.5-pro', label: 'GEMINI 2.5 PRO' },
    { id: 'gemini-2.5-flash', label: 'GEMINI 2.5 FLASH' },
    { id: 'gemini-2.5-flash-lite', label: 'GEMINI 2.5 FLASH LITE' },
  ],
};

const SUGGESTED_TAGS = [
  'MARTE', 'LUNA', 'VENUS', 'EXOPLANETAS', 'COLONIAS', 'ESTACIONES',
  'ASTEROIDES', 'ÓRBITA', 'CINTURÓN', 'ECLIPSE', 'GRAVEDAD', 'VACÍO',
  'IA', 'ROBÓTICA', 'ANDROIDES', 'CONCIENCIA', 'MENTE', 'ALGORITMO',
  'LENGUAJE', 'TRADUCCIÓN', 'SEÑAL', 'CONTACTO', 'SILENCIO', 'RUIDO',
  'MEMORIA', 'OLVIDO', 'ARCHIVO', 'DATOS', 'COPIA', 'BACKUP',
  'TIEMPO', 'RELOJ', 'DILATACIÓN', 'FUTURO', 'PASADO', 'LOOP',
  'FAMILIA', 'MADRE', 'PADRE', 'HIJO', 'ABUELA', 'HERMANOS',
  'SOLEDAD', 'DUELO', 'PÉRDIDA', 'NOSTALGIA', 'DESEO', 'CULPA',
  'CUERPO', 'GENÉTICA', 'CLON', 'PROSTÉTICO', 'ENFERMEDAD', 'VEJEZ',
  'BIOLOGÍA', 'ECOLOGÍA', 'EXTINCIÓN', 'JARDÍN', 'ANIMALES', 'SEMILLAS',
  'TRABAJO', 'OFICIO', 'BUROCRACIA', 'MINERÍA', 'COMERCIO', 'RITUAL',
  'RELIGIÓN', 'FE', 'DIOSES', 'PROFECÍA', 'SUEÑO', 'VISIÓN',
];

function Create({ lang, onCreated, stories = [] }) {
  const [mode, setMode] = useState('new');
  const [parentSlug, setParentSlug] = useState('');
  const [angle, setAngle] = useState('auto');
  const [expandForm, setExpandForm] = useState('inherit');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [provider, setProvider] = useState('anthropic');
  const [model, setModel] = useState('claude-sonnet-4-5');
  const [temp, setTemp] = useState(0.9);
  const [length, setLength] = useState('medium');
  const [form, setForm] = useState('random');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [universeList, setUniverseList] = useState(null);
  const [universeListError, setUniverseListError] = useState(null);
  const [universeSlug, setUniverseSlug] = useState('');
  const [universeSummary, setUniverseSummary] = useState(null);
  const [universeCompacting, setUniverseCompacting] = useState(false);
  const [universeError, setUniverseError] = useState(null);
  const [universeOpen, setUniverseOpen] = useState(false);

  React.useEffect(() => {
    if (!universeOpen || universeList !== null) return;
    fetch('/api/universes')
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((j) => setUniverseList(j.universes || []))
      .catch((e) => setUniverseListError(e.message));
  }, [universeOpen, universeList]);

  const [auth, setAuth] = useState(() => {
    try { return localStorage.getItem(AUTH_KEY) || ''; } catch { return ''; }
  });
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(null);
  const [pwLoading, setPwLoading] = useState(false);

  const logout = () => {
    try { localStorage.removeItem(AUTH_KEY); } catch {}
    setAuth('');
  };

  const tryLogin = async () => {
    setPwError(null);
    setPwLoading(true);
    try {
      const r = await fetch('/api/auth/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwInput }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error === 'bad password' ? (lang === 'es' ? 'Contraseña incorrecta' : 'Wrong password') : (j.error || `HTTP ${r.status}`));
      }
      try { localStorage.setItem(AUTH_KEY, pwInput); } catch {}
      setAuth(pwInput);
      setPwInput('');
    } catch (e) {
      setPwError(e.message);
    } finally {
      setPwLoading(false);
    }
  };

  const t = lang === 'es'
    ? { eyebrow: 'CREAR · NUEVO CUENTO', eyebrowExpand: 'CREAR · EXPANDIR', h1: 'Escribir con la máquina.', h1Expand: 'Expandir un cuento.', subtitle: 'La IA genera el cuento completo. Vos elegís el tono.', subtitleExpand: 'ECHO-7 escribe un nuevo cuento que continúa, precede o echa luz sobre uno existente. Hereda tags, forma y duración del padre.', modeLabel: 'MODO', modeNew: 'NUEVO', modeExpand: 'EXPANDIR', parentLabel: 'CUENTO A EXPANDIR', parentPh: '— Elegí un cuento —', angleLabel: 'ÁNGULO', angleHint: 'Qué tipo de expansión querés', angles: { auto: 'AUTO', secuela: 'SECUELA', precuela: 'PRECUELA', lateral: 'LATERAL', eco: 'ECO' }, expandFormLabel: 'FORMA NARRATIVA', expandFormHint: 'HEREDAR usa la misma forma del padre. Elegí otra para contrastar.', inheritOpt: 'HEREDAR DEL PADRE', parentFormTag: 'FORMA DEL PADRE', parentFormUnknown: 'desconocida', tagsLabel: 'TAGS TEMÁTICOS', tagsHint: 'Enter para agregar', tagSuggest: 'SUGERIDOS', providerLabel: 'MOTOR IA', modelLabel: 'MODELO', tempLabel: 'TEMPERATURA', tempHint: '0 = preciso · 1 = creativo', lengthLabel: 'DURACIÓN', lengthOpts: { short: 'BREVE · ~3 MIN', medium: 'MEDIO · ~6 MIN', long: 'LARGO · ~10 MIN' }, formLabel: 'FORMA NARRATIVA', formHint: 'Define la estructura del cuento', promptLabel: 'SEMILLA (OPCIONAL)', promptPh: 'Una idea, un tono, una imagen… vacío está bien.', submit: 'GENERAR CUENTO', submitExpand: 'EXPANDIR CUENTO', loading: 'GENERANDO · ', err: '◼ ERROR:', ctxToggleShow: '▸ VER CONTEXTO QUE RECIBE ECHO-7', ctxToggleHide: '▾ OCULTAR CONTEXTO', ctxLoading: 'CARGANDO CONTEXTO · ', ctxAncestors: 'CADENA DE ANCESTROS', ctxAncestorsEmpty: 'Este cuento no tiene ancestros — es raíz.', ctxParent: 'CUERPO DEL PADRE (entra completo)', ctxUniverse: 'MEMORIA DEL UNIVERSO', ctxEntities: 'ENTIDADES RECURRENTES', ctxAuthor: 'AUTOR', ctxStats: 'TOTAL', ctxChars: 'caracteres', ctxWarn: 'La memoria del universo creció mucho. Compactarla condensa el resumen y las entidades sin perder lo esencial (usa Gemini Flash Lite, ~1 call).', ctxCompactBtn: '◼ COMPACTAR MEMORIA', ctxCompacting: 'COMPACTANDO · ', ctxCompactDone: (r) => `COMPACTADO: ${r.beforeChars} → ${r.afterChars} CHARS (${r.ratio}%)`, ctxCompactAuth: 'Ingresá por CREAR para poder compactar.', umToggleShow: '▸ VER MEMORIA DEL UNIVERSO', umToggleHide: '▾ OCULTAR MEMORIA', universeToggleShow: '▸ USAR UN UNIVERSO COMO BASE', universeToggleHide: '▾ OCULTAR UNIVERSO BASE', universePickLabel: 'ELEGIR UNIVERSO', universePickPh: '— Elegí un universo —', universeListLoading: 'CARGANDO UNIVERSOS · ', universeEmpty: 'Todavía no hay universos (ningún árbol con 3+ cuentos).', universeHint: 'Un universo es un árbol de 3+ cuentos. Compactarlo condensa todo el árbol (raíz + ramas) en un resumen único para que ECHO-7 nazca como rama nueva del universo.', universeTreeTitle: (n) => `ÁRBOL DE ${n} CUENTOS`, universeCompactBtn: '◼ COMPACTAR ESTE UNIVERSO', universeCompacting: 'COMPACTANDO UNIVERSO · ', universeCompactDone: (r) => `UNIVERSO CONDENSADO: ${r.beforeChars} → ${r.afterChars} CHARS (${r.ratio}%) · ${r.nodeCount} cuentos`, universeInUse: 'RESUMEN DE UNIVERSO EN USO — el cuento nuevo continuará el hilo de este universo.', universeClear: 'LIMPIAR UNIVERSO BASE', universeEntitiesLabel: 'ENTIDADES DEL UNIVERSO', expanding: 'GENERANDO · ', lockEyebrow: 'CREAR · ACCESO', lockH1: 'Área privada.', lockSubtitle: 'Generar cuentos consume crédito. Ingresá la contraseña para continuar.', lockPwLabel: 'CONTRASEÑA', lockPwPh: '••••••••', lockSubmit: 'ENTRAR', lockLoading: 'VERIFICANDO · ', logout: 'SALIR' }
    : { eyebrow: 'CREATE · NEW STORY', eyebrowExpand: 'CREATE · EXPAND', h1: 'Write with the machine.', h1Expand: 'Expand a story.', subtitle: 'The AI generates the full story. You set the tone.', subtitleExpand: 'ECHO-7 writes a new story that continues, precedes or sheds light on an existing one. Inherits tags, form and length from the parent.', modeLabel: 'MODE', modeNew: 'NEW', modeExpand: 'EXPAND', parentLabel: 'STORY TO EXPAND', parentPh: '— Choose a story —', angleLabel: 'ANGLE', angleHint: 'What kind of expansion', angles: { auto: 'AUTO', secuela: 'SEQUEL', precuela: 'PREQUEL', lateral: 'LATERAL', eco: 'ECHO' }, expandFormLabel: 'NARRATIVE FORM', expandFormHint: 'INHERIT reuses the parent form. Pick another to contrast.', inheritOpt: 'INHERIT FROM PARENT', parentFormTag: 'PARENT FORM', parentFormUnknown: 'unknown', tagsLabel: 'THEMATIC TAGS', tagsHint: 'Enter to add', tagSuggest: 'SUGGESTED', providerLabel: 'AI ENGINE', modelLabel: 'MODEL', tempLabel: 'TEMPERATURE', tempHint: '0 = precise · 1 = creative', lengthLabel: 'LENGTH', lengthOpts: { short: 'SHORT · ~3 MIN', medium: 'MEDIUM · ~6 MIN', long: 'LONG · ~10 MIN' }, formLabel: 'NARRATIVE FORM', formHint: 'Sets the story structure', promptLabel: 'SEED (OPTIONAL)', promptPh: 'An idea, a tone, an image… empty is fine.', submit: 'GENERATE STORY', submitExpand: 'EXPAND STORY', loading: 'GENERATING · ', err: '◼ ERROR:', ctxToggleShow: '▸ SHOW CONTEXT SENT TO ECHO-7', ctxToggleHide: '▾ HIDE CONTEXT', ctxLoading: 'LOADING CONTEXT · ', ctxAncestors: 'ANCESTOR CHAIN', ctxAncestorsEmpty: 'This story has no ancestors — it is a root.', ctxParent: 'PARENT BODY (sent in full)', ctxUniverse: 'UNIVERSE MEMORY', ctxEntities: 'RECURRING ENTITIES', ctxAuthor: 'AUTHOR', ctxStats: 'TOTAL', ctxChars: 'characters', ctxWarn: 'Universe memory has grown large. Compacting condenses summary and entities while keeping the essentials (uses Gemini Flash Lite, ~1 call).', ctxCompactBtn: '◼ COMPACT MEMORY', ctxCompacting: 'COMPACTING · ', ctxCompactDone: (r) => `COMPACTED: ${r.beforeChars} → ${r.afterChars} CHARS (${r.ratio}%)`, ctxCompactAuth: 'Enter through CREATE to compact.', umToggleShow: '▸ SHOW UNIVERSE MEMORY', umToggleHide: '▾ HIDE MEMORY', universeToggleShow: '▸ USE A UNIVERSE AS BASE', universeToggleHide: '▾ HIDE UNIVERSE BASE', universePickLabel: 'PICK UNIVERSE', universePickPh: '— Choose a universe —', universeListLoading: 'LOADING UNIVERSES · ', universeEmpty: 'No universes yet (no tree with 3+ stories).', universeHint: 'A universe is a tree of 3+ stories. Compacting condenses the whole tree (root + branches) into one summary so ECHO-7 can be born as a new branch.', universeTreeTitle: (n) => `TREE OF ${n} STORIES`, universeCompactBtn: '◼ COMPACT THIS UNIVERSE', universeCompacting: 'COMPACTING UNIVERSE · ', universeCompactDone: (r) => `UNIVERSE CONDENSED: ${r.beforeChars} → ${r.afterChars} CHARS (${r.ratio}%) · ${r.nodeCount} stories`, universeInUse: "UNIVERSE SUMMARY IN USE — the new story will continue this universe's thread.", universeClear: 'CLEAR UNIVERSE BASE', universeEntitiesLabel: 'UNIVERSE ENTITIES', expanding: 'GENERATING · ', lockEyebrow: 'CREATE · ACCESS', lockH1: 'Private area.', lockSubtitle: 'Generating stories spends credit. Enter the password to continue.', lockPwLabel: 'PASSWORD', lockPwPh: '••••••••', lockSubmit: 'ENTER', lockLoading: 'CHECKING · ', logout: 'LOG OUT' };

  const modelsForProvider = MODELS_BY_PROVIDER[provider] || [];
  const isBoth = provider === 'both';

  const selectProvider = (p) => {
    if (p === provider) return;
    setProvider(p);
    if (p !== 'both') setModel(MODELS_BY_PROVIDER[p][0].id);
  };

  const addTag = (v) => {
    const clean = v.trim().toUpperCase();
    if (!clean) return;
    if (tags.includes(clean)) return;
    setTags([...tags, clean]);
    setTagInput('');
  };
  const removeTag = (v) => setTags(tags.filter((x) => x !== v));

  const onTagKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const submit = async () => {
    setError(null);
    if (mode === 'expand' && !parentSlug) {
      setError(lang === 'es' ? 'Elegí un cuento a expandir.' : 'Choose a story to expand.');
      return;
    }
    setLoading(true);
    try {
      const url = mode === 'expand' ? `/api/stories/${parentSlug}/expand` : '/api/stories/generate';
      const body = mode === 'expand'
        ? { provider: provider === 'both' ? 'anthropic' : provider, model: provider === 'both' ? undefined : model, temp, angle, form: expandForm, prompt, length }
        : {
            tags, provider, model, temp, prompt, length, form,
            ...(universeSummary ? { threadBase: { summaryEs: universeSummary.summaryEs, summaryEn: universeSummary.summaryEn, entities: universeSummary.entities, rootSlug: universeSummary.rootSlug } } : {}),
          };
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-create-auth': auth },
        body: JSON.stringify(body),
      });
      if (r.status === 401) {
        logout();
        throw new Error(lang === 'es' ? 'Sesión expirada. Ingresá la contraseña de nuevo.' : 'Session expired. Enter the password again.');
      }
      if (!r.ok) {
        const j = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
        throw new Error(j.error || `HTTP ${r.status}`);
      }
      const data = await r.json();
      if (Array.isArray(data.stories)) {
        if (data.errors && data.errors.length) setError(data.errors.join(' · '));
        onCreated(data.stories);
      } else {
        onCreated(data);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!auth) {
    return (
      <div className="cfia-container" style={styles.root}>
        <section className="cfia-head-main" style={styles.head}>
          <div style={styles.eyebrow}>◼ {t.lockEyebrow}</div>
          <h1 style={styles.h1}>{t.lockH1}</h1>
          <p style={styles.subtitle}>{t.lockSubtitle}</p>
        </section>
        <hr style={styles.rule} />
        <section style={{ ...styles.form, maxWidth: 480 }}>
          <div style={styles.field}>
            <label style={styles.label}>{t.lockPwLabel}</label>
            <input
              type="password"
              style={styles.textarea}
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && pwInput && !pwLoading) tryLogin(); }}
              placeholder={t.lockPwPh}
              autoFocus
            />
          </div>
          {pwError && <div style={styles.error}>{t.err} {pwError}</div>}
          <button
            type="button"
            onClick={tryLogin}
            disabled={pwLoading || !pwInput}
            style={{ ...styles.submit, ...((pwLoading || !pwInput) ? styles.submitDisabled : {}) }}>
            {pwLoading ? <>{t.lockLoading}<span style={styles.blink}>◼</span></> : t.lockSubmit}
          </button>
        </section>
      </div>
    );
  }

  const isExpand = mode === 'expand';
  const sortedStories = [...stories].sort((a, b) => (b.num || 0) - (a.num || 0));

  return (
    <div className="cfia-container" style={styles.root}>
      <section className="cfia-head-main" style={styles.head}>
        <div style={styles.eyebrow}>◼ {isExpand ? t.eyebrowExpand : t.eyebrow}</div>
        <h1 style={styles.h1}>{isExpand ? t.h1Expand : t.h1}</h1>
        <p style={styles.subtitle}>{isExpand ? t.subtitleExpand : t.subtitle}</p>
        <button type="button" onClick={logout} style={styles.logoutBtn}>{t.logout}</button>
      </section>

      <hr style={styles.rule} />

      <section style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>{t.modeLabel}</label>
          <div style={styles.segBox}>
            <button type="button" onClick={() => setMode('new')} style={{ ...styles.segBtn, ...(mode === 'new' ? styles.segBtnOn : {}) }}>
              {t.modeNew}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('expand');
                if (provider === 'both') {
                  setProvider('anthropic');
                  setModel(MODELS_BY_PROVIDER.anthropic[0].id);
                }
              }}
              style={{ ...styles.segBtn, ...(mode === 'expand' ? styles.segBtnOn : {}) }}
            >
              {t.modeExpand}
            </button>
          </div>
        </div>

        {isExpand ? (
          <>
            <div style={styles.field}>
              <label style={styles.label}>{t.parentLabel}</label>
              <select style={styles.select} value={parentSlug} onChange={(e) => setParentSlug(e.target.value)}>
                <option value="">{t.parentPh}</option>
                {sortedStories.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {String(s.num).padStart(3, '0')} · {s.title?.[lang] || s.title?.es}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>{t.angleLabel}</label>
              <div style={styles.segBox}>
                {['auto', 'secuela', 'precuela', 'lateral', 'eco'].map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAngle(a)}
                    style={{ ...styles.segBtn, ...(angle === a ? styles.segBtnOn : {}) }}
                  >
                    {t.angles[a]}
                  </button>
                ))}
              </div>
              <div style={styles.hint}>{t.angleHint}</div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                {t.expandFormLabel}
                {parentSlug ? (() => {
                  const parent = stories.find((s) => s.slug === parentSlug);
                  const pForm = parent?.form;
                  const formDef = pForm ? FORMS.find((f) => f.id === pForm) : null;
                  const formLabel = formDef ? (lang === 'es' ? formDef.es : formDef.en) : t.parentFormUnknown;
                  return <span style={styles.parentFormTag}> · {t.parentFormTag}: {formLabel}</span>;
                })() : null}
              </label>
              <select style={styles.select} value={expandForm} onChange={(e) => setExpandForm(e.target.value)}>
                <option value="inherit">{t.inheritOpt}</option>
                {FORMS.filter((f) => f.id !== 'random').map((f) => (
                  <option key={f.id} value={f.id}>{lang === 'es' ? f.es : f.en}</option>
                ))}
              </select>
              <div style={styles.hint}>{t.expandFormHint}</div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>{t.lengthLabel}</label>
              <div style={styles.segBox}>
                {['short', 'medium', 'long'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setLength(k)}
                    style={{ ...styles.segBtn, ...(length === k ? styles.segBtnOn : {}) }}>
                    {t.lengthOpts[k]}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>{t.promptLabel}</label>
              <textarea
                style={styles.textarea}
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t.promptPh}
              />
            </div>

            {parentSlug && window.ExpandContextViewer ? (
              <window.ExpandContextViewer slug={parentSlug} lang={lang} t={t} />
            ) : null}
          </>
        ) : (
          <>
            <div style={styles.field}>
              <label style={styles.label}>{t.tagsLabel}</label>
              <div style={styles.tagBox}>
                {tags.map((tg) => (
                  <span key={tg} style={styles.tagChip} onClick={() => removeTag(tg)}>
                    {tg} <span style={styles.tagX}>×</span>
                  </span>
                ))}
                <input
                  style={styles.tagInput}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={onTagKey}
                  placeholder={t.tagsHint}
                />
              </div>
              <div style={styles.suggestWrap}>
                <span style={styles.suggestLabel}>{t.tagSuggest} ·</span>
                {SUGGESTED_TAGS.filter((s) => !tags.includes(s)).map((s) => (
                  <span key={s} style={styles.suggest} onClick={() => addTag(s)}>{s}</span>
                ))}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>{t.lengthLabel}</label>
              <div style={styles.segBox}>
                {['short', 'medium', 'long'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setLength(k)}
                    style={{ ...styles.segBtn, ...(length === k ? styles.segBtnOn : {}) }}>
                    {t.lengthOpts[k]}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>{t.formLabel}</label>
              <select style={styles.select} value={form} onChange={(e) => setForm(e.target.value)}>
                {FORMS.map((f) => (
                  <option key={f.id} value={f.id}>{lang === 'es' ? f.es : f.en}</option>
                ))}
              </select>
              <div style={styles.hint}>{t.formHint}</div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>{t.promptLabel}</label>
              <textarea
                style={styles.textarea}
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t.promptPh}
              />
            </div>

            {window.UniverseMemoryViewer ? (
              <window.UniverseMemoryViewer lang={lang} t={t} />
            ) : null}

            <div style={styles.field}>
              <button type="button" onClick={() => setUniverseOpen((v) => !v)} style={styles.threadToggle}>
                {universeOpen ? t.universeToggleHide : t.universeToggleShow}
              </button>
              {universeOpen ? (
                <div style={styles.threadBox}>
                  <label style={styles.label}>{t.universePickLabel}</label>
                  {universeListError && <div style={styles.error}>{t.err} {universeListError}</div>}
                  {!universeList && !universeListError && (
                    <div style={styles.hint}>{t.universeListLoading}<span style={styles.blink}>◼</span></div>
                  )}
                  {universeList && universeList.length === 0 && (
                    <div style={styles.hint}>{t.universeEmpty}</div>
                  )}
                  {universeList && universeList.length > 0 && (
                    <select
                      style={styles.select}
                      value={universeSlug}
                      onChange={(e) => {
                        setUniverseSlug(e.target.value);
                        setUniverseSummary(null);
                        setUniverseError(null);
                      }}
                    >
                      <option value="">{t.universePickPh}</option>
                      {universeList.map((u) => (
                        <option key={u.root.slug} value={u.root.slug}>
                          {u.root.title?.[lang] || u.root.title?.es} · {u.total} {lang === 'es' ? 'cuentos' : 'stories'}
                        </option>
                      ))}
                    </select>
                  )}

                  <div style={styles.hint}>{t.universeHint}</div>

                  {universeError && <div style={styles.error}>{t.err} {universeError}</div>}

                  {universeSlug && !universeSummary && (() => {
                    const picked = universeList?.find((u) => u.root.slug === universeSlug);
                    if (!picked) return null;
                    return (
                      <div style={styles.threadChain}>
                        <div style={styles.label}>{t.universeTreeTitle(picked.total)}</div>
                        <UniverseTreePreview root={picked.root} lang={lang} />
                        <button
                          type="button"
                          disabled={universeCompacting}
                          onClick={async () => {
                            setUniverseError(null);
                            setUniverseCompacting(true);
                            try {
                              const r = await fetch(`/api/universes/${universeSlug}/compact`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'x-create-auth': auth },
                              });
                              if (r.status === 401) {
                                logout();
                                throw new Error(lang === 'es' ? 'Sesión expirada.' : 'Session expired.');
                              }
                              if (!r.ok) {
                                const j = await r.json().catch(() => ({}));
                                throw new Error(j.error || `HTTP ${r.status}`);
                              }
                              const data = await r.json();
                              setUniverseSummary(data);
                            } catch (err) {
                              setUniverseError(err.message);
                            } finally {
                              setUniverseCompacting(false);
                            }
                          }}
                          style={{ ...styles.submit, alignSelf: 'flex-start', ...(universeCompacting ? styles.submitDisabled : {}) }}
                        >
                          {universeCompacting ? <>{t.universeCompacting}<span style={styles.blink}>◼</span></> : t.universeCompactBtn}
                        </button>
                      </div>
                    );
                  })()}

                  {universeSummary && (
                    <div style={styles.threadSummaryBox}>
                      <div style={styles.threadDoneLine}>{t.universeCompactDone(universeSummary)}</div>
                      <div style={styles.threadInUse}>{t.universeInUse}</div>
                      <div style={styles.threadSummaryText}>
                        {lang === 'es' ? universeSummary.summaryEs : universeSummary.summaryEn}
                      </div>
                      {universeSummary.entities ? (
                        <div style={styles.threadEntities}>
                          <div style={styles.label}>{t.universeEntitiesLabel}</div>
                          {['personajes', 'lugares', 'objetos', 'eventos'].map((k) => {
                            const arr = universeSummary.entities[k];
                            if (!Array.isArray(arr) || !arr.length) return null;
                            return (
                              <div key={k} style={styles.threadEntityLine}>
                                <span style={styles.threadEntityKey}>{k.toUpperCase()}:</span> {arr.join(', ')}
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => { setUniverseSummary(null); setUniverseSlug(''); }}
                        style={styles.threadClearBtn}
                      >
                        {t.universeClear}
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </>
        )}

        <div style={styles.field}>
          <label style={styles.label}>{t.providerLabel}</label>
          <div style={styles.segBox}>
            {(isExpand ? PROVIDERS.filter((p) => p.id !== 'both') : PROVIDERS).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => selectProvider(p.id)}
                style={{ ...styles.segBtn, ...(provider === p.id ? styles.segBtnOn : {}) }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="cfia-create-row" style={styles.row}>
          {!isBoth ? (
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>{t.modelLabel}</label>
              <select style={styles.select} value={model} onChange={(e) => setModel(e.target.value)}>
                {modelsForProvider.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
          ) : null}
          <div style={{ ...styles.field, flex: 1 }}>
            <label style={styles.label}>{t.tempLabel} · {temp.toFixed(2)}</label>
            <input type="range" min="0" max="1" step="0.05" value={temp}
              onChange={(e) => setTemp(parseFloat(e.target.value))}
              style={styles.range} />
            <div style={styles.hint}>{t.tempHint}</div>
          </div>
        </div>

        {error && (
          <div style={styles.error}>
            {t.err} {error}
          </div>
        )}

        <button style={{ ...styles.submit, ...(loading ? styles.submitDisabled : {}) }}
          onClick={submit}
          disabled={loading || (isExpand && !parentSlug)}>
          {loading ? `${t.loading}` : `▸ ${isExpand ? t.submitExpand : t.submit}`}
          {loading && <span style={styles.blink}>◼</span>}
        </button>
      </section>
    </div>
  );
}

const styles = {
  root: { maxWidth: 960, margin: '0 auto', padding: '0 40px' },
  head: { padding: '96px 0 48px', display: 'flex', flexDirection: 'column', gap: 20 },
  eyebrow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#b8b5ad', textTransform: 'uppercase' },
  h1: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(40px, 6vw, 84px)', lineHeight: 1, letterSpacing: '-0.03em', fontWeight: 500, color: '#f5f3ee', margin: 0 },
  subtitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: '#b8b5ad', margin: 0, maxWidth: 600 },
  rule: { border: 0, borderTop: '2px solid #f5f3ee', margin: 0 },
  form: { padding: '48px 0 96px', display: 'flex', flexDirection: 'column', gap: 36 },
  field: { display: 'flex', flexDirection: 'column', gap: 10 },
  row: { display: 'flex', gap: 32, flexWrap: 'wrap' },
  label: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#e8b84a', textTransform: 'uppercase' },
  hint: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', color: '#6b6860', textTransform: 'uppercase' },
  parentFormTag: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', color: '#6b6860', textTransform: 'uppercase', marginLeft: 4 },
  tagBox: { display: 'flex', flexWrap: 'wrap', gap: 8, padding: 12, border: '1px solid #3a3832', background: '#0a0a0f', minHeight: 52, alignItems: 'center' },
  tagChip: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.14em', color: '#0a0a0f', background: '#e8b84a', padding: '6px 10px', cursor: 'pointer', userSelect: 'none' },
  tagX: { marginLeft: 4, opacity: 0.7 },
  tagInput: { flex: 1, minWidth: 140, background: 'transparent', border: 'none', outline: 'none', color: '#f5f3ee', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.1em', padding: '4px 6px' },
  suggestWrap: { display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginTop: 4 },
  suggestLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: '#6b6860' },
  suggest: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', color: '#b8b5ad', border: '1px solid #3a3832', padding: '4px 8px', cursor: 'pointer' },
  select: { background: '#0a0a0f', border: '1px solid #3a3832', color: '#f5f3ee', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.1em', padding: '12px 14px', outline: 'none' },
  segBox: { display: 'flex', gap: 0, border: '1px solid #3a3832' },
  segBtn: { flex: 1, background: '#0a0a0f', border: 'none', borderRight: '1px solid #3a3832', color: '#b8b5ad', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.14em', padding: '14px 10px', cursor: 'pointer' },
  segBtnOn: { background: '#e8b84a', color: '#0a0a0f' },
  range: { accentColor: '#e8b84a', width: '100%' },
  textarea: { background: '#0a0a0f', border: '1px solid #3a3832', color: '#f5f3ee', fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, lineHeight: 1.5, padding: 14, outline: 'none', resize: 'vertical' },
  submit: { alignSelf: 'flex-start', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.18em', background: '#e8b84a', color: '#0a0a0f', border: 'none', padding: '16px 28px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10 },
  submitDisabled: { background: '#3a3832', color: '#6b6860', cursor: 'wait' },
  blink: { animation: 'cfia-blink 1.1s steps(1) infinite' },
  error: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.08em', color: '#e8b84a', border: '1px solid #e8b84a', padding: 14, background: 'rgba(232,184,74,0.05)' },
  logoutBtn: { alignSelf: 'flex-start', marginTop: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: '#6b6860', background: 'transparent', border: '1px solid #3a3832', padding: '6px 12px', cursor: 'pointer' },
  threadToggle: { alignSelf: 'flex-start', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#e8b84a', background: 'transparent', border: '1px solid #3a3832', padding: '10px 14px', cursor: 'pointer' },
  threadBox: { display: 'flex', flexDirection: 'column', gap: 14, border: '1px solid #3a3832', padding: 18, background: 'rgba(232,184,74,0.03)' },
  threadChain: { display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px dashed #3a3832', paddingTop: 14 },
  threadItem: { borderLeft: '2px solid #3a3832', paddingLeft: 10 },
  threadItemHead: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.14em', color: '#e8b84a' },
  threadItemBody: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: '#b8b5ad', marginTop: 4, lineHeight: 1.5 },
  threadSummaryBox: { display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px dashed #3a3832', paddingTop: 14 },
  threadDoneLine: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.14em', color: '#e8b84a' },
  threadInUse: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', color: '#6b6860', textTransform: 'uppercase' },
  threadSummaryText: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: '#f5f3ee', lineHeight: 1.55, whiteSpace: 'pre-wrap' },
  threadEntities: { display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px dashed #3a3832', paddingTop: 10 },
  threadEntityLine: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.08em', color: '#b8b5ad' },
  threadEntityKey: { color: '#6b6860', marginRight: 6 },
  threadClearBtn: { alignSelf: 'flex-start', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: '#6b6860', background: 'transparent', border: '1px solid #3a3832', padding: '6px 12px', cursor: 'pointer' },
  universePreview: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#f5f3ee', lineHeight: 1.8, overflowX: 'auto', padding: '8px 0' },
  universePreviewLine: { display: 'flex', alignItems: 'baseline', gap: 8, whiteSpace: 'nowrap' },
  universePreviewGlyph: { color: '#6b6860', whiteSpace: 'pre' },
  universePreviewNum: { color: '#e8b84a', letterSpacing: '0.12em' },
  universePreviewDot: { color: '#3a3832' },
  universePreviewTitle: { color: '#f5f3ee', fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, letterSpacing: '-0.01em' },
};

function UniverseTreePreview({ root, lang }) {
  const renderNode = (node, prefix, isLast, isRoot) => {
    const connector = isRoot ? '' : (isLast ? '└─ ' : '├─ ');
    const childPrefix = isRoot ? '' : (prefix + (isLast ? '   ' : '│  '));
    const title = node.title?.[lang] || node.title?.es;
    const lines = [(
      <div key={node.slug} style={styles.universePreviewLine}>
        <span style={styles.universePreviewGlyph}>{prefix}{connector}</span>
        <span style={styles.universePreviewNum}>{String(node.num).padStart(3, '0')}</span>
        <span style={styles.universePreviewDot}>·</span>
        <span style={styles.universePreviewTitle}>{title}</span>
      </div>
    )];
    if (node.children && node.children.length) {
      node.children.forEach((c, i) => {
        lines.push(...renderNode(c, childPrefix, i === node.children.length - 1, false));
      });
    }
    return lines;
  };
  return <div style={styles.universePreview}>{renderNode(root, '', true, true)}</div>;
}

window.Create = Create;
