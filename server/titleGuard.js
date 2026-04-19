const STOPWORDS = new Set([
  'the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for', 'and', 'or', 'but',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'with', 'from', 'as',
  'that', 'this', 'these', 'those', 'it', 'its', 'into', 'by', 'about',
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al',
  'en', 'con', 'sin', 'por', 'para', 'sobre', 'entre', 'hacia', 'hasta',
  'y', 'o', 'u', 'ni', 'pero', 'mas', 'sino', 'que', 'qué', 'como', 'cómo',
  'es', 'son', 'era', 'eran', 'ser', 'estar', 'está', 'están', 'este',
  'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas', 'aquel', 'aquella',
  'mi', 'tu', 'su', 'mis', 'tus', 'sus', 'me', 'te', 'se', 'lo', 'le', 'les',
]);

const TITLE_BANS = /\b(último|última|últimos|últimas|last)\b/i;

function tokenize(title) {
  if (!title) return [];
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
}

export function titleHasBannedWord(obj) {
  return TITLE_BANS.test(obj.titleEs || '') || TITLE_BANS.test(obj.titleEn || '');
}

export function findOverusedWords(recentTitles, threshold = 2) {
  const counts = new Map();
  for (const tit of recentTitles) {
    const unique = new Set(tokenize(tit));
    for (const w of unique) counts.set(w, (counts.get(w) || 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= threshold)
    .map(([w]) => w);
}

export function titleRepeatsOverused(obj, overused) {
  if (!overused.length) return null;
  const tokens = new Set([...tokenize(obj.titleEs), ...tokenize(obj.titleEn)]);
  const set = new Set(overused);
  for (const w of tokens) if (set.has(w)) return w;
  return null;
}

export function buildTitleGuardNote({ recentTitles, overused }) {
  const parts = [];
  if (recentTitles.length) {
    parts.push(
      `\n\nTÍTULOS RECIENTES ya publicados (NO los repitas ni les hagas variaciones obvias):\n- ${recentTitles
        .slice(0, 20)
        .join('\n- ')}`
    );
  }
  if (overused.length) {
    parts.push(
      `\n\nPALABRAS SOBREUSADAS en títulos recientes — PROHIBIDAS en titleEs y titleEn esta vez: ${overused
        .map((w) => `"${w}"`)
        .join(', ')}. Buscá otro vocabulario. Si tu primer impulso usa una de estas, forzate a cambiarla.`
    );
  }
  return parts.join('');
}

export function buildRetryNote({ repeatedWord, bannedWord }) {
  if (bannedWord) {
    return `\n\nIMPORTANTE: En el intento anterior el título contenía "${bannedWord}" — palabra PROHIBIDA. Generá un título totalmente distinto, con otro ángulo (objeto concreto, gesto, número, lugar, nombre propio inventado). NO uses superlativos.`;
  }
  if (repeatedWord) {
    return `\n\nIMPORTANTE: En el intento anterior el título contenía "${repeatedWord}", una palabra SOBREUSADA en títulos recientes. Generá un título nuevo con vocabulario distinto. Cambiá el núcleo: si pensabas en "${repeatedWord}", elegí otro sustantivo.`;
  }
  return '';
}
