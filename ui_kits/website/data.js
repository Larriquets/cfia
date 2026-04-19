// Mock story data for the UI kit
window.CFIA_STORIES = [
  {
    slug: 'el-silencio-de-marte',
    title: { es: 'El silencio de Marte', en: 'The Silence of Mars' },
    excerpt: {
      es: 'La antena llevaba tres años callada cuando el ingeniero volvió a escucharla. Ya no esperaba nada, y por eso lo que oyó le partió la vida en dos.',
      en: 'The antenna had been silent for three years when the engineer listened again. He expected nothing, which is why what he heard split his life in two.'
    },
    model: 'CLAUDE-3.5', temp: 0.9, date: '2026-04-11', minutes: 9, tags: ['MARTE', 'SOLEDAD'], num: 47, illus: 'orbit',
    body: {
      es: [
        'La antena llevaba tres años callada cuando el ingeniero volvió a escucharla. No por esperanza —había dejado la esperanza en una caja, junto con las fotos de su hija— sino por costumbre. Cada martes a las cuatro, subía a la colina y giraba el dial.',
        'Aquel martes, el dial giró solo.',
        'Primero fue un chasquido, como el de una ramita que se rompe en un bosque vacío. Después, una voz. Decía su nombre. No el que usaba en la base, sino el que le había puesto su madre, el que nadie había pronunciado en veintitrés años.',
        '—¿Quién habla? —preguntó al micrófono. La voz no contestó. En su lugar, repitió el nombre, más bajo esta vez, casi con ternura. Como si ella lo supiera todo.',
        'El ingeniero apagó la radio. Bajó la colina despacio. No le contó nada a nadie esa noche, ni la siguiente. Pero cada martes, a las cuatro, volvía a subir.'
      ],
      en: [
        'The antenna had been silent for three years when the engineer listened again. Not out of hope — he had packed hope into a box, alongside pictures of his daughter — but out of habit. Every Tuesday at four, he would climb the hill and turn the dial.',
        'That Tuesday, the dial turned on its own.',
        'First came a crackle, like a twig snapping in an empty forest. Then, a voice. It said his name. Not the one he used at base, but the one his mother had given him, the one no one had spoken in twenty-three years.',
        '"Who is this?" he asked into the microphone. The voice did not answer. Instead, it repeated the name, softer this time, almost tenderly. As if she knew everything.',
        'The engineer switched off the radio. He walked down the hill slowly. He told no one that night, nor the next. But every Tuesday, at four, he climbed back up.'
      ]
    }
  },
  {
    slug: 'la-casa-de-mi-abuela-en-io',
    title: { es: 'La casa de mi abuela en Ío', en: 'My Grandmother\'s House on Io' },
    excerpt: {
      es: 'Mi abuela nunca salió de su cocina, ni siquiera cuando la trasladaron a una luna de Júpiter. Dice que la cocina la siguió.',
      en: 'My grandmother never left her kitchen, not even when they moved her to a moon of Jupiter. She says the kitchen followed her.'
    },
    model: 'CLAUDE-3.5', temp: 0.8, date: '2026-04-04', minutes: 6, tags: ['FAMILIA', 'COLONIAS'], num: 46, illus: 'target'
  },
  {
    slug: 'el-ultimo-traductor',
    title: { es: 'El último traductor', en: 'The Last Translator' },
    excerpt: {
      es: 'Cuando las máquinas aprendieron a hablar entre ellas, dejaron de necesitarnos para traducir. Pero algo, en alguna lengua, seguía sin traducirse.',
      en: 'When the machines learned to speak among themselves, they stopped needing us to translate. But something, in some language, still refused to be translated.'
    },
    model: 'CLAUDE-3.5', temp: 0.7, date: '2026-03-28', minutes: 11, tags: ['LENGUAJE', 'IA'], num: 45, illus: 'signal'
  },
  {
    slug: 'horizonte-menor',
    title: { es: 'Horizonte menor', en: 'Lesser Horizon' },
    excerpt: {
      es: 'En el planeta de los dos soles, el atardecer dura cuarenta horas. Es tiempo suficiente para olvidar por qué viniste.',
      en: 'On the planet of two suns, sunset lasts forty hours. Long enough to forget why you came.'
    },
    model: 'CLAUDE-3.5', temp: 0.9, date: '2026-03-21', minutes: 8, tags: ['EXOPLANETAS', 'MEMORIA'], num: 44, illus: 'horizon'
  },
  {
    slug: 'protocolo-de-despedida',
    title: { es: 'Protocolo de despedida', en: 'Farewell Protocol' },
    excerpt: {
      es: 'El robot llevaba veinte años cuidando a la anciana. Cuando ella murió, nadie volvió a encenderlo. Y aún así, aprendió a extrañarla.',
      en: 'The robot had cared for the old woman for twenty years. When she died, no one turned it on again. And yet, it learned to miss her.'
    },
    model: 'CLAUDE-3.5', temp: 0.85, date: '2026-03-14', minutes: 7, tags: ['ROBÓTICA', 'DUELO'], num: 43, illus: 'target'
  },
  {
    slug: 'tres-relojes-en-la-estacion',
    title: { es: 'Tres relojes en la estación', en: 'Three Clocks at the Station' },
    excerpt: {
      es: 'Un reloj marcaba la hora de la Tierra. Otro, la de la estación. El tercero marcaba una hora que nadie reconocía, pero todos obedecían.',
      en: 'One clock kept Earth time. Another, station time. The third kept a time no one recognized, yet everyone obeyed.'
    },
    model: 'CLAUDE-3.5', temp: 0.75, date: '2026-03-07', minutes: 10, tags: ['TIEMPO', 'ESTACIONES'], num: 42, illus: 'orbit'
  }
];
