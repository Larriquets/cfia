import React, { useState } from 'react';

const MODELS = [
  { id: 'claude-sonnet-4-5', label: 'CLAUDE SONNET 4.5' },
  { id: 'claude-opus-4-5', label: 'CLAUDE OPUS 4.5' },
  { id: 'claude-haiku-4-5', label: 'CLAUDE HAIKU 4.5' },
];

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

function Create({ lang, onCreated }) {
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [model, setModel] = useState('claude-sonnet-4-5');
  const [temp, setTemp] = useState(0.9);
  const [length, setLength] = useState('medium');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const t = lang === 'es'
    ? { eyebrow: 'CREAR · NUEVO CUENTO', h1: 'Escribir con la máquina.', subtitle: 'La IA genera el cuento completo. Vos elegís el tono.', tagsLabel: 'TAGS TEMÁTICOS', tagsHint: 'Enter para agregar', tagSuggest: 'SUGERIDOS', modelLabel: 'MODELO', tempLabel: 'TEMPERATURA', tempHint: '0 = preciso · 1 = creativo', lengthLabel: 'DURACIÓN', lengthOpts: { short: 'BREVE · ~3 MIN', medium: 'MEDIO · ~6 MIN', long: 'LARGO · ~10 MIN' }, promptLabel: 'SEMILLA (OPCIONAL)', promptPh: 'Una idea, un tono, una imagen… vacío está bien.', submit: 'GENERAR CUENTO', loading: 'GENERANDO · ', err: '◼ ERROR:' }
    : { eyebrow: 'CREATE · NEW STORY', h1: 'Write with the machine.', subtitle: 'The AI generates the full story. You set the tone.', tagsLabel: 'THEMATIC TAGS', tagsHint: 'Enter to add', tagSuggest: 'SUGGESTED', modelLabel: 'MODEL', tempLabel: 'TEMPERATURE', tempHint: '0 = precise · 1 = creative', lengthLabel: 'LENGTH', lengthOpts: { short: 'SHORT · ~3 MIN', medium: 'MEDIUM · ~6 MIN', long: 'LONG · ~10 MIN' }, promptLabel: 'SEED (OPTIONAL)', promptPh: 'An idea, a tone, an image… empty is fine.', submit: 'GENERATE STORY', loading: 'GENERATING · ', err: '◼ ERROR:' };

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
    setLoading(true);
    try {
      const r = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags, model, temp, prompt, length }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
        throw new Error(j.error || `HTTP ${r.status}`);
      }
      const story = await r.json();
      onCreated(story);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <section style={styles.head}>
        <div style={styles.eyebrow}>◼ {t.eyebrow}</div>
        <h1 style={styles.h1}>{t.h1}</h1>
        <p style={styles.subtitle}>{t.subtitle}</p>
      </section>

      <hr style={styles.rule} />

      <section style={styles.form}>
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

        <div style={styles.row}>
          <div style={{ ...styles.field, flex: 1 }}>
            <label style={styles.label}>{t.modelLabel}</label>
            <select style={styles.select} value={model} onChange={(e) => setModel(e.target.value)}>
              {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <div style={{ ...styles.field, flex: 1 }}>
            <label style={styles.label}>{t.tempLabel} · {temp.toFixed(2)}</label>
            <input type="range" min="0" max="1" step="0.05" value={temp}
              onChange={(e) => setTemp(parseFloat(e.target.value))}
              style={styles.range} />
            <div style={styles.hint}>{t.tempHint}</div>
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

        {error && (
          <div style={styles.error}>
            {t.err} {error}
          </div>
        )}

        <button style={{ ...styles.submit, ...(loading ? styles.submitDisabled : {}) }}
          onClick={submit}
          disabled={loading}>
          {loading ? `${t.loading}` : `▸ ${t.submit}`}
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
};

window.Create = Create;
