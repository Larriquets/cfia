const NARRATIVE_FORMS = [
  { id: 'escena', note: 'Escribilo como una ÚNICA escena continua: un solo espacio, un arco temporal corto (minutos, horas). Sin saltos. Entrá tarde, salí temprano.' },
  { id: 'segunda-persona', note: 'Escribilo en SEGUNDA PERSONA (tú/vos). El lector ES el protagonista. Mantené el tú todo el cuento.' },
  { id: 'epistolar', note: 'Escribilo como una CARTA o mensaje: alguien le escribe a otro alguien. Conservá el tono epistolar (saludo implícito, dirigido a "vos/tú"). Sin descripción omnisciente.' },
  { id: 'inventario', note: 'Escribilo como un INVENTARIO o lista anotada: objetos, ítems, entradas numeradas o con viñeta implícita. Cada párrafo es una entrada. La historia emerge entre las entradas, no explícita.' },
  { id: 'transcripcion', note: 'Escribilo como una TRANSCRIPCIÓN: diálogo fragmentado, interrupciones, [inaudible], marcas de tiempo si ayudan. Dos o tres voces. Sin narrador.' },
  { id: 'informe', note: 'Escribilo como un INFORME técnico/burocrático: lenguaje neutro, clasificado, con jerga administrativa. La emoción se filtra entre los datos. Sin adjetivos literarios.' },
  { id: 'viñetas', note: 'Escribilo en VIÑETAS separadas: cada párrafo es una miniescena autocontenida, con su propio lugar y momento. Saltos bruscos. El lector conecta. Puede haber meses o años entre viñetas.' },
  { id: 'monologo', note: 'Escribilo como un MONÓLOGO hablado: alguien cuenta algo en voz alta, con la cadencia del habla (frases cortas, repeticiones, "y entonces", "mirá"). Oralidad, no prosa literaria.' },
  { id: 'diario', note: 'Escribilo como entradas de DIARIO: cada párrafo una fecha (relativa o absoluta). La voz interior, sin pulir. Detalles domésticos mezclados con lo extraordinario.' },
  { id: 'presente', note: 'Escribilo en PRESENTE, tercera persona cercana. El cuento sucede ahora mismo. Nada en pasado narrativo.' },
  { id: 'futuro-anterior', note: 'Escribilo en FUTURO o con mirada desde adelante ("cuando esto termine", "van a saber que"). El narrador conoce un futuro que el lector no.' },
  { id: 'plural', note: 'Escribilo en PRIMERA PERSONA PLURAL (nosotros/nosotras). Un colectivo que habla. Nunca salgas del "nosotros".' },
  { id: 'filosofia', note: 'Escribilo como un CUENTO-ENSAYO FILOSÓFICO: la narración se entrelaza con reflexión conceptual explícita. El narrador piensa mientras cuenta, interrumpe la escena para interrogar una idea (identidad, tiempo, conciencia, otredad, lenguaje, memoria, libre albedrío), y la trama es apenas el soporte de la pregunta. Tono de Borges, Calvino, Lem, Chiang en modo contemplativo. Permití una o dos frases aforísticas, pero sin solemnidad. El final NO resuelve la idea: la deja abierta y más nítida.' },
];

const CONCRETE_OBJECTS = [
  'un termo abollado', 'una foto rota por la mitad', 'un diente de leche en una caja',
  'una huella en el barro seco', 'una radio sin antena', 'un reloj parado en las 3:47',
  'una llave que no abre nada', 'un ovillo de lana azul', 'una cicatriz en forma de anzuelo',
  'un cuaderno con las páginas arrancadas', 'un vaso con agua que no se evapora',
  'una grabación de 14 segundos', 'un zapato izquierdo sin par', 'un anillo demasiado pequeño',
  'una carta nunca enviada', 'un espejo que tarda en reflejar', 'una moneda de un país que no existe',
  'un sobre con arena adentro', 'una cuerda atada a nada', 'una puerta pintada en una pared',
  'un paraguas abierto en un pasillo', 'una botella con un mensaje ilegible',
  'un pájaro disecado con el pico abierto', 'una mesa con tres patas', 'un ventilador que gira solo',
  'una lista de nombres tachados', 'una piedra caliente al tacto', 'una canción silbada a medias',
  'un frasco con algo que brilla', 'una silla vacía con marca del cuerpo', 'un guante dado vuelta',
  'una maceta con tierra pero sin planta', 'un retrato cuyos ojos se mueven', 'un hilo suelto de un suéter',
  'una pluma que no es de ningún pájaro conocido', 'una pared recién pintada que huele a humedad',
  'un cable que termina en ningún lado', 'una fotografía en la que falta alguien',
  'un boleto perforado de hace muchos años', 'una taza con labial seco en el borde',
  'una nota pegada con cinta adhesiva amarillenta',
];

function pick(arr, seed) {
  const i = Math.floor((seed % arr.length + arr.length) % arr.length);
  return arr[i];
}

function randomSeed() {
  return Math.floor(Math.random() * 1e9);
}

export function pickCreativityKnobs({ seed = randomSeed(), formId = null } = {}) {
  const form = formId
    ? (NARRATIVE_FORMS.find((f) => f.id === formId) || pick(NARRATIVE_FORMS, seed))
    : pick(NARRATIVE_FORMS, seed);
  const object = pick(CONCRETE_OBJECTS, Math.floor(seed / NARRATIVE_FORMS.length));
  return { form, object, seed };
}

export const NARRATIVE_FORM_IDS = NARRATIVE_FORMS.map((f) => f.id);

export function buildCreativityNote({ form, object }) {
  const parts = [];
  if (form) parts.push(`\n\nFORMA NARRATIVA OBLIGATORIA esta vez: ${form.note}`);
  if (object) parts.push(`\n\nOBJETO-GANCHO OBLIGATORIO: En algún momento del cuento, de manera concreta y específica, tiene que aparecer ${object}. No como metáfora abstracta — como objeto físico real en la escena. Puede ser central o marginal, pero presente.`);
  return parts.join('');
}
