// Clawd Pet: motor de las mascotas (se ejecuta dentro del webview)
(function () {
  'use strict';

  const vscode = acquireVsCodeApi();
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  const hud = document.getElementById('hud');
  const statsEl = document.getElementById('stats');
  const toolbar = document.getElementById('toolbar');

  // ---------------------------------------------------------------- datos

  const PALETTES = {
    orange: { body: '#D97757', shade: '#BC6243' },
    blue: { body: '#5B8DEF', shade: '#4372D0' },
    green: { body: '#5FB878', shade: '#46985E' },
    pink: { body: '#E87FA8', shade: '#CB6489' },
    purple: { body: '#9B7BE0', shade: '#7F60C4' },
    gold: { body: '#E3B341', shade: '#C4962B' },
    ghost: { body: '#E6E6E6', shade: '#C2C2C2' },
    black: { body: '#3A3A44', shade: '#26262E', eye: '#F5D547' },
  };
  const EYE = '#1E1E1E';
  const BLUSH = '#FF9C9C';
  const NAMES = ['Clawd', 'Clawdia', 'Pinzas', 'Tokencito', 'Bytey', 'Opi', 'Sonny', 'Haiku'];
  const SIZES = { small: 3, medium: 4, large: 5 };

  // w/h: tamaño del sprite en unidades; legs: filas de piernas (se ocultan al sentarse)
  const SPECIES = {
    clawd: { w: 14, h: 9, legs: 2, unit: () => S, draw: drawClawd, food: 'cookie' },
    miku: {
      w: 18, h: 19, legs: 5, unit: () => Math.max(2, Math.round(S * 0.75)), draw: drawChibi, name: 'Miku',
      food: 'leek', singer: true, prop: 'leek', note: '#39C5BB', tails: 'long',
      look: {
        hair: '#39C5BB', hairDark: '#26968E', eye: '#1E9C93', skin: '#FFE3D3', shirt: '#C9CED6',
        tie: '#39C5BB', sleeve: '#2B2B33', skirt: '#3A3F47', trim: '#39C5BB', boot: '#2B2B33',
        hairTie: '#2B2B33', accent: '#E0457B',
      },
    },
    teto: {
      w: 18, h: 19, legs: 5, unit: () => Math.max(2, Math.round(S * 0.75)), draw: drawChibi, name: 'Teto',
      food: 'bread', singer: true, prop: 'bread', note: '#E0475E', tails: 'drills',
      look: {
        hair: '#D63A50', hairDark: '#A3263A', eye: '#B3203F', skin: '#FFE3D3', shirt: '#5A5A66',
        tie: '#D63A50', sleeve: '#3A3A44', skirt: '#33333C', trim: '#D63A50', boot: '#2A2A30',
        hairTie: '#D63A50', accent: '#FFFFFF',
      },
    },
    // Umamusume: orejas y cola de caballo; solo: comportamiento propio que solo hace esa especie
    goldship: {
      w: 18, h: 21, crown: 2, legs: 5, unit: () => Math.max(2, Math.round(S * 0.75)), draw: drawChibi, name: 'Gold Ship',
      food: 'yakisoba', singer: true, prop: 'mic', note: '#8E6BD8', tails: 'straight', uma: true, solo: 'zoom',
      look: {
        hair: '#C9CDD6', hairDark: '#9EA3AE', eye: '#C2185B', skin: '#FFE3D3', shirt: '#F2F2F7',
        tie: '#7A4FC4', sleeve: '#F2F2F7', skirt: '#6E4FB0', trim: '#F2F2F7', boot: '#3A2E4A',
        earIn: '#F2B8C6', hat: '#2B2B33', hatBand: '#D6303B',
      },
    },
    tachyon: {
      w: 18, h: 21, crown: 2, legs: 5, unit: () => Math.max(2, Math.round(S * 0.75)), draw: drawChibi, name: 'Tachyon',
      food: 'carrot', singer: true, prop: 'flask', note: '#4CC38A', tails: 'short', uma: true, ahoge: true, solo: 'brew',
      look: {
        hair: '#8A5A3C', hairDark: '#5E3B26', eye: '#D9443A', skin: '#FFE3D3', shirt: '#E8C547',
        tie: '#2B2B33', sleeve: '#F5F5F5', skirt: '#3A3A44', trim: '#2B2B33', boot: '#2B2B33',
        earIn: '#F2B8C6', coat: '#F5F5F5', hand: '#F5F5F5', longSleeves: true,
      },
    },
    // Voz por defecto de UTAU: canta por su auricular y suelta "あ" en vez de notas
    defoko: {
      w: 18, h: 21, crown: 2, legs: 5, unit: () => Math.max(2, Math.round(S * 0.75)), draw: drawChibi, name: 'Defoko',
      food: 'onigiri', singer: true, note: '#8A4FD1', glyphs: ['あ', 'あ~'], tails: 'bob',
      look: {
        hair: '#9466D1', hairDark: '#6A3FA3', eye: '#9B7FD6', skin: '#FFE3D3', shirt: '#F4F2F8',
        tie: '#8A4FD1', collar: '#26222E', sleeve: '#26222E', shoulder: '#FFE3D3', cuff: '#B79AE6',
        skirt: '#26222E', trim: '#8A4FD1', boot: '#26222E',
        beret: '#26222E', beretText: '#D8D8DE', phones: '#C9CDD6', phonesLight: '#5BD3F0',
      },
    },
    // Archimaga carmesí: su solo es ¡EXPLOSIÓN!, tras la que se desmaya sin maná
    megumin: {
      w: 18, h: 23, crown: 4, legs: 5, unit: () => Math.max(2, Math.round(S * 0.75)), draw: drawChibi, name: 'Megumin',
      food: 'potion', tails: 'short', solo: 'explode',
      look: {
        hair: '#3B2A22', hairDark: '#24170F', eye: '#D62B2B', skin: '#FFE3D3', shirt: '#C8323C',
        tie: '#E8B04A', sleeve: '#C8323C', skirt: '#C8323C', trim: '#E8902A', boot: '#E06A2A', hand: '#26262E',
        leg: '#26262E', legAlt: '#F2F2E8', belt: '#1E1E1E', cape: '#3B2A2A', capeTrim: '#E8902A',
        witchHat: '#4A3530', witchBand: '#E8902A', witchBuckle: '#D63A3A', staff: '#6B4A2B',
      },
    },
  };

  const PHRASES = {
    idle: [
      "You're absolutely right!", '¿Refactorizamos algo?', 'Leyendo el README...', '¿Un café? ☕',
      'Pensando... 🤔', '*clic clic clic*', '¡Todo compila! 🎉', 'Hola 👋', 'git commit -m "magia"',
      '¿Y si agregamos tests?', 'Mmm, buen código', 'Puedo ayudarte con eso',
    ],
    hungry: ['Tengo hambre... 🍪', '¿Hay galletas?', 'Necesito tokens... digo, comida'],
    tired: ['Qué sueño... 😴', 'Necesito una siesta', '*bosteza*'],
    sad: ['¿Jugamos? ⚽', 'Me siento solito...', 'Acaríciame 🥺'],
    pet: ['¡Jeje! 💕', '¡Me encanta!', '♥', '¡Otra vez!', '*feliz*'],
    save: ['¡Guardado! 💾', 'Ctrl+S, mi favorito', '¡Bien hecho!', '✨ Nice ✨'],
    error: ['Hmm... ¿un bug? 🐛', 'Algo se rompió...', 'Veamos ese error 🔍', 'Rojo... 😬'],
    fixed: ['¡Bug aplastado! ✨', '¡Sin errores! 🎉', '¡Lo logramos!'],
    typing: ['¡Te ayudo!', 'Programemos juntos', 'Yo también 💻'],
    codeDone: ['¡Listo! Tests en verde ✅', 'Push a producción 🚀', 'Refactor completo', 'LGTM 👍', '¡Funciona en mi máquina!'],
    yum: ['¡Ñam ñam! 😋', '¡Delicioso!', 'Más galletas, porfa'],
    wake: ['¡Como nuevo! ☀️', '¡A programar!', '*se estira*'],
    grumpy: ['5 minutitos más...', 'Zzz... ¿eh?'],
    ball: ['¡Gol! ⚽', '¡Wiii!', '¡Otra vez!'],
    thrown: ['¡Uf!', '¡Wiii!', 'Mareado... 💫'],
    hello: ['¡Hola! 👋', '¡Hey!', '¡Hola, humano!'],
    hug: ['¡Abracito! 🤗'],
    sing: ['♪ La la la~'],
    concert: ['¡Concierto! 🎤'],
  };

  const SPECIAL = {
    clawd: { hug: ['¡Abrazo de cangrejo! 🦀', '¡Abracito! 🤗'] },
    miku: {
      idle: ['Miku Miku ni shite ageru ♪', '¿Cantamos? 🎤', '¡Puerros! 🥬', '39 ♪ ¡Gracias!', 'Ievan Polkka~ 🎶', 'Mi voz es 100% digital'],
      hungry: ['Quiero un puerro... 🥬', '¿Hay puerros?'],
      yum: ['¡Puerro delicioso! 🥬', '¡Ñam! ♪'],
      hello: ['¡Hola! Soy Miku ♪', '¡Hatsune Miku, presente! 🎤'],
      sing: ['♪ La la la~', '¡Escuchen esto! 🎤', 'Ievan Polkka~ 🥬'],
      concert: ['¡Todos a bailar! 🎶', '¡Concierto sorpresa! 🎤'],
      hug: ['¡Abrazo! 💙'],
    },
    teto: {
      idle: ['¡Kasane Teto, 31 años! ✌️', '¿Pan francés? 🥖', 'Mis taladros giran 🌀', 'Teto Territory~', 'Soy una quimera, ¿sabías?', '¡No soy una broma de abril!'],
      hungry: ['¿Y mi pan? 🥖', 'Quiero baguette...'],
      yum: ['¡Baguette! 🥖', '¡Pan del bueno!'],
      hello: ['¡Teto aquí! ✌️', '¡Hola! Soy Kasane Teto'],
      sing: ['♪ Teto Territory~', '¡Mi turno! 🎤'],
      concert: ['¡Show de Teto! 🎤', '¡Al escenario!'],
      hug: ['¡Abrazo! ❤️'],
    },
    goldship: {
      idle: ['¡Golshi-chan ha llegado! ⚓', '¿Quieres yakisoba? 🍜', '¿Sabías que soy un barco? ⛴️', 'Hoy me siento como un submarino', 'Estoy pensando en nada. Literalmente.', '¿Alguien quiere un dropkick? 🦵'],
      hungry: ['¿Y mi yakisoba? 🍜', 'Golshi tiene hambre...'],
      yum: ['¡Yakisoba de la buena! 🍜', '¡Sabe a victoria!'],
      hello: ['¡Golshi-chan ha llegado! ⚓', '¡Yo! Soy Gold Ship'],
      sing: ['♪ Umapyoi~ Umapyoi~', '¡Winning Live! 🎤'],
      concert: ['¡Winning Live de Golshi! 🎤', '¡Todos a mi barco! ⚓'],
      hug: ['¡Abrazo... y luego dropkick! 😏'],
      zoom: ['¡Golshi pasa~! 💨', '¡Turbo! 💨', '¡No me alcanzan!'],
    },
    tachyon: {
      idle: ['¿Te interesa un experimento? 🧪', 'Kukuku...', 'Más azúcar en mi té ☕', 'La velocidad... ¡el límite!', 'Necesito un conejillo de indias', 'Mis datos son perfectos 📋'],
      hungry: ['Necesito glucosa... 🥕', '¿Hay té con diez de azúcar?'],
      yum: ['¡Zanahoria! Nutrientes óptimos 🥕', '¡Ñam! Kukuku'],
      hello: ['¡Agnes Tachyon, a tu servicio! 🧪', 'Hola, conejillo... digo, amigo'],
      sing: ['♪ Umapyoi~', 'Prueba de cuerdas vocales 🎤'],
      concert: ['Experimento musical, ¡comienza! 🎤'],
      hug: ['Esto es... por la ciencia 💚'],
      brew: ['Veamos esta fórmula... 🧪', 'Un poquito más de esto...', 'Kukuku...'],
      eureka: ['¡Eureka! ✨', '¡Fascinante!', '¡Datos excelentes!'],
      fail: ['*¡puf!* 💥', 'Cof cof... casi', 'Resultado... interesante'],
    },
    defoko: {
      idle: ['あ', 'Soy la voz por defecto de UTAU', 'あ あ あ~ ♪', '¿Quién tocó mi oto.ini?', 'Probando, probando... あ', 'Uta Utane, presente'],
      hungry: ['¿Hay onigiri? 🍙', 'あ... hambre...'],
      yum: ['¡Onigiri! 🍙', '¡Ñam! あ~'],
      hello: ['¡Hola! Soy Defoko', 'あ! ¡Uta Utane aquí!'],
      sing: ['あ~ あ~ あ~ ♪', '¡Voz por defecto, activada! 🎤'],
      concert: ['¡Concierto UTAU! 🎤', 'あ あ あ~ ¡a bailar!'],
      hug: ['¡Abrazo! 💜'],
    },
    megumin: {
      idle: [
        '¡Mi nombre es Megumin!', 'Archimaga de los Demonios Carmesí 🔥', 'Solo sé un hechizo... ¡el mejor!',
        '¿Una explosión? ¿Ahora? ¿Sí? 💥', 'Una explosión al día...', '¿Dónde se metió Chomusuke? 🐈‍⬛',
        'La magia de explosión es arte', '¡No soy una niña!',
      ],
      hungry: ['Tengo hambre... ¿me invitas?', 'Los magos también comen 🥺', 'Sin comida no hay explosión'],
      tired: ['Sin maná... 😵', 'Necesito descansar para explotar mañana'],
      yum: ['¡Maná recargado! ✨', '¡Lista para otra explosión! 💥'],
      hello: ['¡Mi nombre es Megumin! 💥', '¡Archimaga carmesí, presente! 🔥'],
      pet: ['¡N-no me trates como niña! 😳', '...bueno, un poquito más', '¡Jeje! 💕'],
      hug: ['¡Abrazo carmesí! ❤️'],
      chant: [
        'Oscuridad más negra que la noche...', 'Que el poder carmesí despierte...',
        'Fuego ancestral, responde a mi llamado...',
      ],
      drained: ['...no me queda maná 😵', '¿Alguien me carga? 🥺', 'No puedo moverme...'],
      recovered: ['¡Valió la pena! 💥', '¡Qué explosión tan perfecta!', '¿Le pongo nota? ¡100 puntos!'],
    },
  };

  // Diálogos: [especie que habla, texto]. En "same" se usa el índice del participante.
  const DIALOGUES = {
    'clawd+miku': [
      [['miku', '¡Clawd! ¿Cantamos juntos? 🎤'], ['clawd', 'Solo sé hacer beep boop'], ['miku', '¡Eso también es música! ♪']],
      [['clawd', '¿Qué es eso verde?'], ['miku', '¡Un puerro! 🥬'], ['clawd', '...¿se come?']],
      [['miku', '¿Me ayudas con mi código?'], ['clawd', "You're absolutely right!"], ['miku', '¡Pero si no dije nada! 😂']],
    ],
    'clawd+teto': [
      [['teto', '¿Quieres pan francés? 🥖'], ['clawd', '¡Sí, por favor!'], ['teto', '¡Es mío! Jeje ✌️']],
      [['clawd', '¿Cuántos años tienes?'], ['teto', '¡31! ✌️'], ['clawd', 'Yo tengo... ¿tokens?']],
      [['teto', 'Mis taladros giran 🌀'], ['clawd', 'Yo no tengo pinzas...'], ['teto', '¡Eres un cangrejo raro! 😆']],
    ],
    'miku+teto': [
      [['teto', '¡Miku! ¡Dueto! 🎶'], ['miku', '¡Sí! ¿Cuál canción?'], ['teto', '¡Teto Territory!']],
      [['miku', '¿Puerro? 🥬'], ['teto', '¿Pan? 🥖'], ['miku', '¡Hagamos sopa! 🍲']],
      [['teto', '¿Quién canta más agudo?'], ['miku', '¡Yo! ♪♪♪'], ['teto', '¡Ya veremos! 🎤']],
    ],
    'clawd+goldship': [
      [['goldship', '¡Clawd! ¿Te unes a mi tripulación? ⚓'], ['clawd', '¿De qué barco?'], ['goldship', '¡De mí! Soy Gold Ship ⛴️']],
      [['clawd', '¿Te ayudo con algo?'], ['goldship', 'Sí. ¡Sostén esta yakisoba!'], ['clawd', '...¿por qué? 🍜']],
      [['goldship', 'Los cangrejos son primos de los caballos'], ['clawd', "You're absolutely right!"], ['goldship', '¡Ni yo me lo creí! 😂']],
    ],
    'clawd+tachyon': [
      [['tachyon', 'Clawd... ¿pruebas mi nueva fórmula? 🧪'], ['clawd', '¿Qué hace?'], ['tachyon', 'Kukuku... eso queremos averiguar']],
      [['clawd', '¿Escribimos tests?'], ['tachyon', '¡Claro! Tests en sujetos vivos'], ['clawd', 'Yo decía unit tests... 😰']],
      [['tachyon', '¿Eres una IA? Fascinante...'], ['clawd', 'Soy un cangrejo, creo'], ['tachyon', 'Anotado en mis datos 📋']],
    ],
    'goldship+miku': [
      [['goldship', '¡Miku! ¡Cambio puerro por yakisoba!'], ['miku', '¡Trato! 🥬'], ['goldship', '¡Yakisoba con puerro! Nueva receta']],
      [['miku', '¿Cantamos juntas? 🎤'], ['goldship', '¡Umapyoi Densetsu!'], ['miku', '¡No me sé la coreografía! 😅']],
    ],
    'goldship+teto': [
      [['teto', '¡Tengo 31 años! ✌️'], ['goldship', 'Yo tengo un barco'], ['teto', '...¿y eso qué tiene que ver? 😂']],
      [['goldship', '¿Esos taladros sirven para excavar?'], ['teto', '¡Son coletas!'], ['goldship', '¡Busquemos un tesoro! ⛏️']],
    ],
    'goldship+tachyon': [
      [['tachyon', 'Golshi, ¿me ayudas con un experimento?'], ['goldship', 'Solo si me das yakisoba'], ['tachyon', 'Kukuku... trato hecho 🧪']],
      [['goldship', '¡Tachyon! ¡Carrera hasta la pared!'], ['tachyon', 'Prefiero observarte desde aquí'], ['goldship', '¡Cobarde! 😝']],
      [['goldship', '¿Qué hay en ese frasco?'], ['tachyon', 'Algo que te hará brillar'], ['goldship', '¡Ya brillo bastante! ✨']],
    ],
    'miku+tachyon': [
      [['tachyon', 'Tu voz digital... fascinante 🧪'], ['miku', '¡Gracias! ♪'], ['tachyon', '¿Me dejas analizarla?']],
      [['miku', '¿Ese té tiene azúcar?'], ['tachyon', 'Diez cucharadas ☕'], ['miku', '¡¿Diez?! 😱']],
    ],
    'tachyon+teto': [
      [['teto', '¿Quieres pan? 🥖'], ['tachyon', 'Solo si puedo analizarlo'], ['teto', '¡No experimentes con mi pan!']],
      [['tachyon', 'Una quimera... ¡qué sujeto tan interesante!'], ['teto', '¿Sujeto? 😨'], ['tachyon', 'Kukuku...']],
    ],
    'defoko+teto': [
      [['teto', '¡Defoko! ¡Compañera de UTAU! ✌️'], ['defoko', 'あ! ¡Teto!'], ['teto', '¡Las dos venimos de la misma casa!']],
      [['defoko', 'Yo vine incluida con UTAU'], ['teto', 'Yo empecé como broma de abril'], ['defoko', 'Y mira dónde estás ahora 😄']],
      [['teto', '¿Cantamos? 🎤'], ['defoko', 'あ~'], ['teto', '¡Eso no es una canción!']],
    ],
    'clawd+defoko': [
      [['clawd', '¿Por qué solo dices "あ"?'], ['defoko', 'Es mi muestra por defecto'], ['clawd', 'Como mi "Hello World" 🦀']],
      [['defoko', '¿Me ayudas a configurar mi oto.ini?'], ['clawd', '¡Claro! ¿Dónde está?'], ['defoko', '...no sé 😅']],
    ],
    'defoko+miku': [
      [['miku', '¿Tú también eres una voz sintética?'], ['defoko', 'Sí, pero gratis ✌️'], ['miku', '¡Qué generosa! ♪']],
      [['defoko', 'あ~'], ['miku', '¡La la la~!'], ['defoko', 'Suena mejor juntas 💜']],
    ],
    'defoko+goldship': [
      [['goldship', '¿Solo sabes decir "あ"?'], ['defoko', 'あ'], ['goldship', '¡Genial! ¡Únete a mi tripulación! ⚓']],
      [['defoko', '¿Por qué tienes orejas de caballo?'], ['goldship', 'Porque soy un barco'], ['defoko', '...あ? 🤔']],
    ],
    'defoko+tachyon': [
      [['tachyon', 'Una voz sintetizada... fascinante 🧪'], ['defoko', '¿Me vas a analizar?'], ['tachyon', 'Solo un poquito. Kukuku...']],
      [['defoko', '¿Qué hay en ese frasco?'], ['tachyon', 'Algo que mejora la voz'], ['defoko', 'あ... ¿seguro? 😰']],
    ],
    'clawd+megumin': [
      [['megumin', '¡Un cangrejo! ¿Se come? 🤤'], ['clawd', '¡NO! 🦀'], ['megumin', 'Qué lástima...']],
      [['clawd', '¿Sabes otros hechizos?'], ['megumin', '¡Solo Explosión!'], ['clawd', '...ok']],
      [['megumin', '¿Me cargarás si me desmayo?'], ['clawd', '¿Por qué te desmayarías?'], ['megumin', 'Ya verás 😏']],
    ],
    'megumin+miku': [
      [['miku', '¿Cantamos? 🎤'], ['megumin', '¡Solo si termina en explosión!'], ['miku', '¡Un final explosivo! 💥']],
      [['megumin', 'Ese puerro... ¿es un báculo?'], ['miku', '¡Es un puerro! 🥬'], ['megumin', 'Igual lo respeto']],
    ],
    'megumin+teto': [
      [['megumin', 'Tus coletas parecen taladros'], ['teto', '¡Son taladros! 🌀'], ['megumin', 'Respeto 😤']],
      [['teto', '¡Teto Territory!'], ['megumin', '¡Explosión!'], ['teto', '¡Empate! ✌️']],
    ],
    'goldship+megumin': [
      [['goldship', '¿Explosión? ¡Yo también sé!'], ['megumin', '¿Ah, sí?'], ['goldship', '¡Golshi Kick! 🦵']],
      [['megumin', '¿Eres un barco o un caballo?'], ['goldship', 'Sí'], ['megumin', '...me caes bien 😤']],
    ],
    'megumin+tachyon': [
      [['tachyon', 'Tu maná... ¿puedo medirlo? 🧪'], ['megumin', '¡Solo si me das una poción!'], ['tachyon', 'Kukuku... trato hecho']],
      [['megumin', 'Tus pócimas explotan'], ['tachyon', 'A veces'], ['megumin', '¡Eres de las mías! 💥']],
    ],
    'defoko+megumin': [
      [['defoko', 'あ'], ['megumin', '¡EXPLOSIÓN!'], ['defoko', 'あ... 😨']],
      [['megumin', '¿Solo sabes una palabra?'], ['defoko', 'あ'], ['megumin', 'Yo solo sé un hechizo. Te entiendo']],
    ],
    same: [
      [[0, '¿Viste ese bug?'], [1, 'Sí... da miedo 😨'], [0, '¡Arreglémoslo juntos!']],
      [[0, '¡Hola, gemelo!'], [1, '¡Hola, gemelo!'], [0, '...']],
      [[0, '¿Jugamos?'], [1, '¡Sí! ⚽']],
    ],
    // Para parejas sin diálogos propios
    any: [
      [[0, '¡Hola! ¿Cómo estás?'], [1, '¡Muy bien! ¿Y tú?'], [0, '¡Programando! 💻']],
      [[0, '¿Jugamos?'], [1, '¡Sí! ⚽']],
      [[0, '¿Tienes hambre?'], [1, 'Siempre 😋'], [0, '¡Igual yo!']],
      [[0, '¿Viste ese bug?'], [1, 'Sí... da miedo 😨'], [0, '¡Arreglémoslo juntos!']],
    ],
  };

  const FOODS = {
    cookie: { rows: ['.cccc.', 'ccdccc', 'ccccdc', 'cdcccc', '.cccc.'], colors: { c: '#C98B4B', d: '#5A3A22' } },
    leek: { rows: ['.wwwgggGG', 'wwwwggGGG', '.wwwgggGG'], colors: { w: '#F2F2E8', g: '#9BD36B', G: '#4E9A3A' } },
    bread: { rows: ['..bbbbbbb.', '.bBbbBbbBb', 'bbbbbbbbb.'], colors: { b: '#D9A55B', B: '#A8692A' } },
    yakisoba: { rows: ['..nnnnn..', '.nNnnrNn.', 'nnnNnnnNn', 'ppppppppp', '.ppppppp.'], colors: { n: '#C8843A', N: '#8A5424', r: '#E5534B', p: '#EDEDED' } },
    carrot: { rows: ['g.g.......', '.gooooooo.', 'gooOoooOoo', '.ooooooo..'], colors: { o: '#F28C28', O: '#C96A12', g: '#5FB84A' } },
    onigiri: { rows: ['...ww...', '..wwww..', '.wwwwww.', 'wwnnnnww', 'wwnnnnww'], colors: { w: '#F5F5F0', n: '#2E3B2E' } },
    potion: { rows: ['.cc.', '.gg.', 'bbbb', 'bBbb', 'bbbb', '.bb.'], colors: { b: '#5B8DEF', B: '#A5E4FF', g: '#C9D6E3', c: '#8B5A2B' } },
  };
  const HEART = ['.x.x.', 'xxxxx', '.xxx.', '..x..'];
  const STARS = Array.from({ length: 50 }, () => ({ x: Math.random(), y: Math.random() * 0.85, p: Math.random() * 6 }));
  const BG_TEXT = { night: '#E6EDF3', beach: '#333333', grass: '#2F3B2A', terminal: '#7EE787' };

  // ---------------------------------------------------------------- utilidades

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

  function weighted(options) {
    let r = Math.random() * options.reduce((a, o) => a + o[1], 0);
    for (const o of options) if ((r -= o[1]) < 0) return o;
    return options[0];
  }

  function phr(p, key) {
    const own = SPECIAL[p.species] && SPECIAL[p.species][key];
    if (own && (key !== 'idle' || Math.random() < 0.6)) return pick(own);
    return pick(PHRASES[key] || ['...']);
  }

  // ---------------------------------------------------------------- estado global

  let W = 0, H = 0, S = 4, groundY = 0;
  let config = { size: 'medium', background: 'none', showToolbar: true, speechBubbles: true };
  let theme = {};
  const pets = [];
  const particles = [];
  const foods = [];
  const interactions = [];
  let ball = null;
  let selected = null;
  let drag = null;
  let socialT = rand(8, 15);
  let shake = 0;
  let nextId = 1;

  function readTheme() {
    const cs = getComputedStyle(document.body);
    const v = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
    const fg = v('--vscode-foreground', '#cccccc');
    theme = {
      fg,
      bubbleBg: v('--vscode-editorHoverWidget-background', '#252526'),
      bubbleFg: v('--vscode-editorHoverWidget-foreground', fg),
      bubbleBorder: v('--vscode-editorHoverWidget-border', '#454545'),
      font: v('--vscode-font-family', 'sans-serif'),
    };
  }

  const textColor = () => BG_TEXT[config.background] || theme.fg;

  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    groundY = Math.round(H - 10);
    for (const p of pets) {
      p.x = p.clampX(p.x);
      if (p.grounded()) p.y = groundY;
    }
  }

  function applyConfig(c) {
    config = Object.assign(config, c || {});
    S = SIZES[config.size] || 4;
    hud.classList.toggle('hidden', !config.showToolbar);
    resize();
  }

  // ---------------------------------------------------------------- partículas

  function spawn(kind, x, y, o = {}) {
    particles.push(Object.assign({ kind, x, y, vx: 0, vy: -20, life: 1.5, age: 0 }, o));
  }

  function hearts(x, y, n = 3) {
    for (let i = 0; i < n; i++) {
      spawn('heart', x + rand(-10, 10), y + rand(-4, 4), { vx: rand(-12, 12), vy: rand(-35, -20), life: rand(1, 1.6) });
    }
  }

  function sparkles(x, y, n = 5) {
    for (let i = 0; i < n; i++) {
      spawn('spark', x, y, { vx: rand(-60, 60), vy: rand(-80, -20), life: rand(0.5, 0.9), color: pick(['#FFD65C', '#FFFFFF', '#7DD3FC']) });
    }
  }

  function note(p, color, glyphs) {
    spawn('text', p.x + rand(-0.4, 0.4) * p.halfW() * 2, p.top(), {
      text: pick(glyphs || ['♪', '♫']), vx: rand(-15, 15), vy: -25, life: 1.6, size: 12,
      color: color || pick(['#FF7EB6', '#7DD3FC', '#FFD65C', '#A5F3A1']),
    });
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const q = particles[i];
      q.age += dt;
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      if (q.kind === 'crumb' || q.kind === 'spark') {
        q.vy += 400 * dt;
        if (q.y > groundY) { q.y = groundY; q.vy = 0; q.vx *= 0.8; }
      }
      if (q.age >= q.life) particles.splice(i, 1);
    }
  }

  function drawPattern(pattern, x, y, size, color) {
    ctx.fillStyle = color;
    pattern.forEach((row, r) => {
      for (let c = 0; c < row.length; c++) {
        if (row[c] !== '.') ctx.fillRect(Math.round(x + c * size), Math.round(y + r * size), size, size);
      }
    });
  }

  function drawParticles() {
    for (const q of particles) {
      ctx.globalAlpha = clamp(1 - q.age / q.life, 0, 1);
      if (q.kind === 'heart') {
        const s = Math.max(2, Math.round(S * 0.6));
        drawPattern(HEART, q.x - 2.5 * s, q.y - 2 * s, s, '#E5534B');
      } else if (q.kind === 'spark' || q.kind === 'crumb') {
        const s = Math.max(2, Math.round(S * 0.5));
        ctx.fillStyle = q.color;
        ctx.fillRect(Math.round(q.x), Math.round(q.y - s), s, s);
      } else if (q.kind === 'boom') {
        // Cúpula de fuego que crece desde el suelo
        const r = 12 + (q.age / q.life) * 60;
        for (const [c, f] of [['#FF6A2A', 1], ['#FFD65C', 0.65], ['#FFFFFF', 0.3]]) {
          ctx.fillStyle = c;
          ctx.beginPath();
          ctx.arc(q.x, q.y, r * f, Math.PI, 0);
          ctx.fill();
        }
      } else if (q.kind === 'ring') {
        // Círculo mágico en el suelo
        const k = Math.min(1, q.age / 0.5);
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = '#E5534B';
        ctx.lineWidth = 2;
        for (const [rx, ry] of [[28, 6], [18, 4]]) {
          ctx.beginPath();
          ctx.ellipse(q.x, q.y, rx * k, ry * k, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (q.kind === 'smoke') {
        const s = Math.round(S * (1.5 + (q.age / q.life) * 2));
        ctx.fillStyle = '#8B8F96';
        ctx.fillRect(Math.round(q.x - s / 2), Math.round(q.y - s / 2), s, s);
      } else {
        const size = (q.size || 10) + (q.grow ? (q.age / q.life) * 6 : 0);
        ctx.font = `bold ${Math.round(size)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillStyle = q.color || textColor();
        ctx.fillText(q.text, q.x, q.y);
      }
    }
    ctx.globalAlpha = 1;
  }

  // ---------------------------------------------------------------- mascota

  function defaultName(species) {
    if (SPECIES[species].name) return SPECIES[species].name;
    return pets.some((p) => p.name === 'Clawd') ? pick(NAMES.slice(1)) : 'Clawd';
  }

  class Pet {
    constructor(o = {}) {
      this.id = nextId++;
      this.species = SPECIES[o.species] ? o.species : 'clawd';
      this.sp = SPECIES[this.species];
      this.name = o.name || defaultName(this.species);
      this.color = PALETTES[o.color] ? o.color : 'orange';
      this.hunger = o.hunger ?? 80;
      this.energy = o.energy ?? 80;
      this.happy = o.happy ?? 80;
      this.x = this.clampX(o.x != null ? o.x * W : rand(0, W));
      this.y = -this.height();
      this.vx = 0;
      this.vy = 0;
      this.dir = Math.random() < 0.5 ? 1 : -1;
      this.anim = 0;
      this.blink = rand(2, 5);
      this.chatT = rand(15, 40);
      this.bubble = null;
      this.resetPose();
      this.setState('fall');
    }

    u() { return this.sp.unit(); }
    halfW() { return (this.sp.w * this.u()) / 2; }
    height() { return this.sp.h * this.u(); }
    clampX(x) { return clamp(x, this.halfW(), Math.max(this.halfW(), W - this.halfW())); }
    top() { return this.y - this.height() + this.pose.bob; }

    resetPose() {
      this.pose = { eyes: 'open', armB: 'mid', armF: 'mid', legs: 0, bob: 0, mouth: false, look: 0, blush: false, prop: null, propFrame: 0, tilt: 0, lie: false };
    }

    grounded() {
      return !['jump', 'fall', 'drag'].includes(this.state) && !(this.state === 'social' && this.data.air);
    }

    free() {
      return this.grounded() && ['idle', 'walk', 'sit', 'look'].includes(this.state);
    }

    setState(name, data = {}) {
      this.state = name;
      this.t = 0;
      this.data = data;
      if (STATES[name].enter) STATES[name].enter(this, data);
    }

    say(text, dur = 2.8) {
      if (config.speechBubbles) this.bubble = { text, t: dur };
    }

    boost(stat, v) {
      this[stat] = clamp(this[stat] + v, 0, 100);
    }

    mood() {
      if (this.hunger < 25) return phr(this, 'hungry');
      if (this.energy < 25) return phr(this, 'tired');
      if (this.happy < 25) return phr(this, 'sad');
      return phr(this, 'idle');
    }

    hit(mx, my) {
      return Math.abs(mx - this.x) <= this.halfW() && my >= this.top() - 2 && my <= this.y + 2;
    }

    update(dt) {
      this.t += dt;
      this.anim += dt;
      this.resetPose();

      this.boost('hunger', -dt / 30);
      this.boost('energy', -dt / 45);
      this.boost('happy', -dt / 50 - (this.hunger < 20 ? dt / 20 : 0));

      STATES[this.state].update(this, dt);

      if (this.pose.eyes === 'open') {
        this.blink -= dt;
        if (this.blink < 0) {
          this.pose.eyes = 'closed';
          if (this.blink < -0.12) this.blink = rand(2, 6);
        }
      }

      if (this.bubble && (this.bubble.t -= dt) <= 0) this.bubble = null;

      // Efecto de una pócima de Tachyon
      if (this.glow > 0) {
        this.glow -= dt;
        if (Math.random() < dt * 4) sparkles(this.x, this.top() + rand(0, this.height()), 1);
      }

      this.chatT -= dt;
      if (this.chatT < 0) {
        this.chatT = rand(25, 60);
        if (!this.bubble && ['idle', 'walk', 'sit'].includes(this.state)) this.say(this.mood());
      }
    }
  }

  function moveToward(p, tx, speed, dt) {
    const d = tx - p.x;
    if (Math.abs(d) < 2) return true;
    p.dir = Math.sign(d);
    p.x += p.dir * Math.min(Math.abs(d), speed * dt);
    p.pose.legs = Math.floor((p.anim * speed) / 10) % 2 ? 1 : 2;
    p.pose.look = 1;
    return Math.abs(tx - p.x) < 2;
  }

  // Devuelve la velocidad de impacto (>0) al tocar el suelo
  function physics(p, dt) {
    p.vy += 600 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    const x = p.clampX(p.x);
    if (x !== p.x) {
      p.x = x;
      p.vx = -p.vx * 0.5;
    }
    if (p.y >= groundY) {
      const impact = Math.max(1, p.vy);
      p.y = groundY;
      p.vx = 0;
      p.vy = 0;
      return impact;
    }
    return 0;
  }

  function sitPose(p) {
    p.pose.legs = 'sit';
    p.pose.bob = p.sp.legs * p.u();
  }

  function dancePose(p, dt) {
    const beat = Math.floor(p.t * 4) % 2;
    p.pose.eyes = 'happy';
    p.pose.bob = beat ? -p.u() : 0;
    p.pose.armF = beat ? 'up' : 'mid';
    p.pose.armB = beat ? 'mid' : 'up';
    p.pose.legs = beat ? 1 : 2;
    p.dir = Math.floor(p.t * 2) % 2 ? 1 : -1;
    p.boost('happy', dt * 2);
    if ((p.data.n = (p.data.n || 0) - dt) <= 0) {
      p.data.n = 0.45;
      note(p);
    }
  }

  function singPose(p, dt) {
    p.pose.eyes = 'happy';
    p.pose.mouth = Math.floor(p.t * 4) % 2 === 0;
    p.pose.armF = 'up';
    p.pose.prop = p.sp.prop;
    p.pose.propFrame = Math.floor(p.t * 4) % 2;
    p.pose.bob = Math.floor(p.t * 2) % 2 ? -p.u() : 0;
    p.boost('happy', dt * 1.5);
    if ((p.data.n = (p.data.n || 0) - dt) <= 0) {
      p.data.n = 0.4;
      note(p, p.sp.note, p.sp.glyphs);
    }
  }

  function pickNext(p) {
    if (p.energy < 15) return p.setState('sleep');
    const [name] = weighted([
      ['walk', 35], ['idle', 15], ['sit', 8], ['look', 8],
      ['code', p.energy > 30 ? 9 : 0],
      ['dance', p.happy > 60 ? 5 : 1],
      ['sing', p.sp.singer ? 8 : 0],
      ...(p.sp.solo ? [[p.sp.solo, 6]] : []),
      ['wave', 3], ['jump', 3],
      ['sleep', p.energy < 40 ? 25 : 1],
    ]);
    p.setState(name);
  }

  const STATES = {
    idle: {
      enter: (p) => (p.data.dur = rand(1.5, 4)),
      update(p) {
        if (p.t > p.data.dur) pickNext(p);
      },
    },

    walk: {
      enter(p) {
        p.data.tx = p.clampX(p.x + rand(-1, 1) * W * 0.6);
        p.data.sp = rand(22, 40);
      },
      update(p, dt) {
        if (moveToward(p, p.data.tx, p.data.sp, dt) || p.t > 12) p.setState('idle');
      },
    },

    goto: {
      update(p, dt) {
        if (moveToward(p, p.data.tx, p.data.sp || 50, dt)) p.data.then();
        else if (p.t > 15) p.setState('idle');
      },
    },

    sit: {
      enter: (p) => (p.data.dur = rand(3, 7)),
      update(p) {
        sitPose(p);
        if (p.t > p.data.dur) p.setState('idle');
      },
    },

    look: {
      enter(p) {
        p.data.d0 = p.dir;
        p.data.dur = rand(2, 3.5);
      },
      update(p) {
        p.pose.look = 1;
        p.dir = Math.floor(p.t / 0.8) % 2 ? -p.data.d0 : p.data.d0;
        if (p.t > p.data.dur) p.setState('idle');
      },
    },

    sleep: {
      enter(p) {
        p.data.min = p.data.min || 4;
        p.data.z = 0.5;
      },
      update(p, dt) {
        sitPose(p);
        p.pose.eyes = 'closed';
        p.pose.armB = p.pose.armF = 'low';
        if (Math.sin(p.t * 2) > 0.6) p.pose.bob += 1;
        p.boost('energy', dt * 3);
        if ((p.data.z -= dt) <= 0) {
          p.data.z = 1.1;
          spawn('text', p.x + p.dir * p.halfW() * 0.6, p.top(), { text: 'z', vx: p.dir * 8, vy: -14, life: 2.2, grow: true });
        }
        if (p.energy >= 100 && p.t > p.data.min) p.setState('stretch');
      },
    },

    stretch: {
      update(p) {
        p.pose.armB = p.pose.armF = 'up';
        p.pose.eyes = 'happy';
        if (p.t > 1.4) {
          p.say(pick(PHRASES.wake));
          p.setState('idle');
        }
      },
    },

    eat: {
      update(p, dt) {
        const f = p.data.food;
        if (!f || f.gone) return p.setState('idle');
        p.dir = Math.sign(f.x - p.x) || p.dir;
        if (!f.landed) {
          p.pose.eyes = 'big';
          p.t = 0;
          return;
        }
        f.eatSide = -p.dir;
        p.pose.look = 1;
        p.pose.eyes = 'happy';
        p.pose.mouth = Math.floor(p.t * 6) % 2 === 0;
        f.bites = Math.min(0.99, p.t / 3);
        if (Math.random() < dt * 5) {
          const color = Object.values(FOODS[f.kind].colors)[0];
          spawn('crumb', f.x, groundY - 3 * S, { vx: rand(-40, 40), vy: -rand(60, 110), life: 0.9, color });
        }
        if (p.t > 3) {
          f.gone = true;
          p.boost('hunger', 35);
          p.boost('happy', 5);
          p.say(phr(p, 'yum'));
          p.setState('idle');
        }
      },
    },

    dance: {
      enter: (p) => (p.data.dur = rand(4, 6)),
      update(p, dt) {
        dancePose(p, dt);
        if (p.t > p.data.dur) p.setState('idle');
      },
    },

    sing: {
      enter(p) {
        p.data.dur = rand(5, 7);
        p.say(phr(p, 'sing'), 2.5);
      },
      update(p, dt) {
        singPose(p, dt);
        if (p.t > p.data.dur) p.setState('idle');
      },
    },

    code: {
      enter(p) {
        p.data.dur = rand(7, 12);
        p.data.pt = 0.5;
      },
      update(p, dt) {
        sitPose(p);
        p.pose.look = 1;
        p.pose.armB = 'low';
        p.pose.armF = Math.floor(p.t * 8) % 2 ? 'low' : 'mid';
        p.boost('energy', -dt * 0.4);
        if ((p.data.pt -= dt) <= 0) {
          p.data.pt = 0.7;
          spawn('text', p.x + p.dir * (p.halfW() + 7 * S), groundY - 8 * S, {
            text: pick(['{ }', '</>', '=>', '()', '01', '✓', ';']), vx: rand(-8, 8), vy: -22, life: 1.6, size: 9, color: '#7DD3FC',
          });
        }
        if (p.t > p.data.dur) {
          p.boost('happy', 8);
          p.say(pick(PHRASES.codeDone));
          p.setState('idle');
        }
      },
    },

    wave: {
      enter: (p) => p.say(phr(p, 'hello'), 2),
      update(p) {
        p.pose.eyes = 'happy';
        p.pose.armF = Math.floor(p.t * 6) % 2 ? 'up' : 'mid';
        if (p.t > 1.8) p.setState('idle');
      },
    },

    think: {
      enter(p) {
        p.say(p.data.text || '¿?', 3);
        spawn('text', p.x + p.dir * p.halfW() * 0.7, p.top() - 4, { text: '?', vy: -10, life: 2, size: 14 });
      },
      update(p) {
        p.pose.armF = 'up';
        if (p.t > 2.5) p.setState('idle');
      },
    },

    jump: {
      enter(p) {
        p.vy = p.data.small ? -150 : -rand(190, 240);
        p.vx = 0;
      },
      update(p, dt) {
        p.pose.armB = p.pose.armF = 'up';
        p.pose.eyes = 'happy';
        p.pose.blush = !!p.data.blush;
        if (physics(p, dt)) p.setState('idle');
      },
    },

    fall: {
      update(p, dt) {
        p.pose.eyes = 'big';
        p.pose.armB = p.pose.armF = 'up';
        const impact = physics(p, dt);
        if (impact) {
          if (impact > 380) {
            p.say(pick(PHRASES.thrown), 2);
            sparkles(p.x, groundY, 6);
          }
          p.setState('idle');
        }
      },
    },

    drag: {
      update(p) {
        p.pose.eyes = 'big';
        p.pose.armB = p.pose.armF = 'up';
        p.pose.legs = Math.floor(p.t * 10) % 2 ? 1 : 2;
      },
    },

    chase: {
      enter(p) {
        p.data.kicks = 0;
        p.data.max = Math.floor(rand(3, 6));
        p.data.cd = 0;
      },
      update(p, dt) {
        if (!ball) return p.setState('idle');
        p.data.cd -= dt;
        const close = Math.abs(ball.x - p.x) < p.halfW() && ball.y > groundY - p.height();
        if (!close) {
          moveToward(p, p.clampX(ball.x), 95, dt);
        } else if (p.data.cd <= 0) {
          p.dir = Math.sign(ball.x - p.x) || p.dir;
          ball.vx = p.dir * rand(140, 260);
          ball.vy = -rand(150, 260);
          p.data.cd = 0.5;
          p.data.kicks++;
          p.boost('happy', 3);
          sparkles(ball.x, ball.y, 3);
          if (p.data.kicks >= p.data.max) {
            p.say(pick(PHRASES.ball));
            ball.life = Math.min(ball.life, 3);
            return p.setState('jump');
          }
        }
        if (p.t > 20) p.setState('idle');
      },
    },

    // Gold Ship cruza la pantalla corriendo a toda velocidad
    zoom: {
      enter(p) {
        p.data.tx = p.x < W / 2 ? p.clampX(W) : p.clampX(0);
        p.data.d = 0;
        p.say(phr(p, 'zoom'), 2);
      },
      update(p, dt) {
        p.pose.eyes = 'happy';
        p.pose.armB = p.pose.armF = Math.floor(p.t * 8) % 2 ? 'up' : 'low';
        if ((p.data.d -= dt) <= 0) {
          p.data.d = 0.08;
          spawn('spark', p.x - p.dir * p.halfW() * 0.6, groundY, { vx: -p.dir * rand(20, 50), vy: -rand(20, 60), life: 0.4, color: '#C8C8C8' });
        }
        p.boost('energy', -dt);
        if (moveToward(p, p.data.tx, 150, dt) || p.t > 8) p.setState('idle');
      },
    },

    // Tachyon prepara una pócima; a veces sale bien y a veces explota
    brew: {
      enter(p) {
        p.data.dur = rand(4, 6);
        p.data.b = 0;
        p.say(phr(p, 'brew'), 2.5);
      },
      update(p, dt) {
        sitPose(p);
        p.pose.look = 1;
        p.pose.armF = 'up';
        p.pose.prop = 'flask';
        p.pose.propFrame = Math.floor(p.t * 3) % 2;
        if ((p.data.b -= dt) <= 0) {
          p.data.b = 0.35;
          spawn('text', p.x + p.dir * 5 * p.u(), p.top(), {
            text: pick(['o', '°', '•']), vx: rand(-6, 6), vy: -18, life: 1.2, size: 9, color: pick(['#7CFF6B', '#B48CFF', '#7DD3FC']),
          });
        }
        if (p.t > p.data.dur) {
          if (Math.random() < 0.5) {
            p.say(phr(p, 'eureka'));
            sparkles(p.x + p.dir * 5 * p.u(), p.top(), 8);
            p.boost('happy', 8);
          } else {
            p.say(phr(p, 'fail'));
            spawn('text', p.x + p.dir * 5 * p.u(), p.top(), { text: '💥', vy: -10, life: 1, size: 14 });
          }
          p.setState('idle');
        }
      },
    },

    // Megumin: conjura, lanza ¡EXPLOSIÓN! y se desmaya sin maná
    explode: {
      enter(p) {
        p.dir = p.x < W / 2 ? 1 : -1;
        p.data.tx = clamp(p.x + p.dir * rand(60, Math.max(70, W * 0.4)), 20, Math.max(20, W - 20));
        p.data.sp = 0;
        p.say(phr(p, 'chant'), 2.3);
        spawn('ring', p.data.tx, groundY, { vx: 0, vy: 0, life: 2.4 });
      },
      update(p, dt) {
        const d = p.data;
        if (p.t < 2.4) {
          p.pose.armF = p.pose.armB = 'up';
          p.pose.eyes = p.t < 1.2 ? 'closed' : 'big';
          if ((d.sp -= dt) <= 0) {
            d.sp = 0.12;
            spawn('spark', d.tx + rand(-25, 25), groundY - 2, { vx: 0, vy: -rand(80, 140), life: 0.6, color: pick(['#E5534B', '#FF9C5B', '#FFD65C']) });
          }
          return;
        }
        if (!d.boom) {
          d.boom = true;
          p.say('¡EXPLOSIÓN! 💥', 2.5);
          explosion(d.tx);
        }
        if (p.t < 3.4) {
          p.pose.armF = 'up';
          p.pose.eyes = 'happy';
          p.pose.mouth = true;
          return;
        }
        if (!d.down) {
          d.down = true;
          p.boost('energy', -50);
          p.boost('happy', 15);
          p.say(phr(p, 'drained'), 3);
        }
        p.pose.lie = true;
        p.pose.eyes = 'closed';
        p.pose.armB = p.pose.armF = 'low';
        if (p.t > 9) {
          p.say(phr(p, 'recovered'));
          p.setState('idle');
        }
      },
    },

    // Controlado por una Interaction (ver más abajo)
    social: { update() {} },
  };

  // ---------------------------------------------------------------- interacciones entre mascotas

  class Interaction {
    constructor(kind, members) {
      this.kind = kind;
      this.def = INTERACTIONS[kind];
      this.members = members;
      this.t = 0;
      this.pt = 0;
      this.phase = 0;
      this.done = false;
      members.forEach((m, i) => m.setState('social', { ctl: this, role: i }));
      this.def.start(this);
      interactions.push(this);
    }

    valid() {
      return this.members.every((m) => pets.includes(m) && m.state === 'social' && m.data.ctl === this);
    }

    next() {
      this.phase++;
      this.pt = 0;
    }

    update(dt) {
      if (!this.valid()) return this.end();
      this.t += dt;
      this.pt += dt;
      if (this.t > (this.def.max || 25)) return this.end();
      this.def.update(this, dt);
    }

    end() {
      if (this.done) return;
      this.done = true;
      for (const m of this.members) {
        if (m.state !== 'social' || m.data.ctl !== this) continue;
        if (m.y < groundY - 1) {
          m.vx = 0;
          m.vy = 0;
          m.setState('fall');
        } else {
          m.setState('idle');
        }
      }
    }
  }

  // Lleva a dos mascotas a quedar frente a frente, separadas por `extra` px
  function meet(c, a, b, extra, dt) {
    if (c.mid == null) {
      c.gap = a.halfW() + b.halfW() + extra;
      c.side = a.x <= b.x ? 1 : -1;
      const margin = c.gap / 2 + Math.max(a.halfW(), b.halfW());
      c.mid = clamp((a.x + b.x) / 2, margin, Math.max(margin, W - margin));
    }
    const ra = moveToward(a, c.mid - (c.side * c.gap) / 2, 50, dt);
    const rb = moveToward(b, c.mid + (c.side * c.gap) / 2, 50, dt);
    if (ra && rb) {
      a.dir = c.side;
      b.dir = -c.side;
      return true;
    }
    return false;
  }

  function pickDialogue([a, b]) {
    const set = DIALOGUES[[a.species, b.species].sort().join('+')];
    if (a.species === b.species || !set) {
      return pick(a.species === b.species ? DIALOGUES.same : DIALOGUES.any).map(([i, t]) => [i ? b : a, t]);
    }
    return pick(set).map(([sp, t]) => [a.species === sp ? a : b, t]);
  }

  const INTERACTIONS = {
    highfive: {
      start: (c) => c.members[0].say('¡Choca esos cinco! ✋', 2),
      update(c, dt) {
        const [a, b] = c.members;
        if (c.phase === 0) {
          if (meet(c, a, b, 2, dt)) c.next();
          else if (c.pt > 10) c.end();
          return;
        }
        const k = Math.min(1, c.pt / 0.6);
        for (const m of c.members) {
          m.pose.armF = 'up';
          m.pose.eyes = 'happy';
          m.pose.look = 1;
          m.pose.bob = -Math.sin(Math.PI * k) * 5 * m.u();
        }
        const x = (a.x + b.x) / 2, y = Math.min(a.top(), b.top());
        if (k >= 0.5 && !c.clap) {
          c.clap = true;
          sparkles(x, y, 8);
          spawn('text', x, y - 4, { text: '¡Clap!', vy: -15, life: 1.2, size: 11 });
        }
        if (c.pt > 1.4) {
          hearts(x, y, 2);
          a.boost('happy', 6);
          b.boost('happy', 6);
          c.end();
        }
      },
    },

    hug: {
      start() {},
      update(c, dt) {
        const [a, b] = c.members;
        if (c.phase === 0) {
          if (meet(c, a, b, -2 * Math.min(a.u(), b.u()), dt)) {
            c.next();
            a.say(phr(a, 'hug'), 2);
          } else if (c.pt > 10) c.end();
          return;
        }
        for (const m of c.members) {
          m.pose.eyes = 'happy';
          m.pose.blush = true;
          m.pose.armF = 'up';
          m.pose.look = 1;
        }
        if ((c.h = (c.h || 0) - dt) <= 0) {
          c.h = 0.5;
          hearts((a.x + b.x) / 2, Math.min(a.top(), b.top()), 1);
        }
        if (c.pt > 2.5) {
          a.boost('happy', 10);
          b.boost('happy', 10);
          c.end();
        }
      },
    },

    chat: {
      start(c) {
        c.lines = pickDialogue(c.members);
        c.line = -1;
      },
      update(c, dt) {
        const [a, b] = c.members;
        if (c.phase === 0) {
          if (meet(c, a, b, 16, dt)) c.next();
          else if (c.pt > 10) c.end();
          return;
        }
        a.pose.look = b.pose.look = 1;
        const idx = Math.floor(c.pt / 2.6);
        if (idx !== c.line) {
          if (idx >= c.lines.length) {
            a.boost('happy', 5);
            b.boost('happy', 5);
            return c.end();
          }
          c.line = idx;
          c.lines[idx][0].say(c.lines[idx][1], 2.5);
        }
        const speaker = c.lines[c.line][0];
        speaker.pose.mouth = Math.floor(c.pt * 6) % 2 === 0;
        speaker.pose.armF = c.line % 2 ? 'up' : 'mid';
      },
    },

    tag: {
      max: 22,
      start(c) {
        c.chaser = 0;
        c.cool = 1.5;
        c.tags = 0;
        c.dash = 0;
        c.members[0].say('¡A pillarte! 🏃', 2);
      },
      update(c, dt) {
        const ch = c.members[c.chaser], ru = c.members[1 - c.chaser];
        c.cool -= dt;

        // El que huye corre al lado contrario; si queda acorralado, se escabulle
        if (c.dash > 0) {
          c.dash -= dt;
          moveToward(ru, ru.clampX(ru.x + c.dashDir * 50), 95, dt);
        } else {
          const away = Math.sign(ru.x - ch.x) || 1;
          const tx = ru.clampX(ru.x + away * 40);
          if (Math.abs(tx - ru.x) < 6 && Math.abs(ru.x - ch.x) < 90) {
            c.dash = 1.2;
            c.dashDir = -away;
          } else {
            moveToward(ru, tx, 70, dt);
          }
        }
        ru.pose.eyes = 'big';

        if (c.cool > 0) {
          ch.pose.eyes = 'closed';
          ch.pose.armF = 'up';
          return;
        }
        moveToward(ch, ch.clampX(ru.x), 66, dt);
        ch.pose.eyes = 'happy';
        if (Math.abs(ch.x - ru.x) < (ch.halfW() + ru.halfW()) * 0.7) {
          ch.say(pick(['¡Te pillé!', '¡Pillado! 😆']), 1.5);
          sparkles(ru.x, ru.top(), 5);
          c.chaser = 1 - c.chaser;
          c.cool = 1.2;
          c.dash = 0;
          if (++c.tags >= 3) {
            hearts((ch.x + ru.x) / 2, ru.top(), 3);
            ch.boost('happy', 10);
            ru.boost('happy', 10);
            c.end();
          }
        }
      },
    },

    // Miku o Teto se sube al lomo de Clawd y dan un paseo
    ride: {
      max: 22,
      start: (c) => c.members[1].say(pick(['¡Súbeme, Clawd!', '¡Llévame! 🦀']), 2),
      update(c, dt) {
        const [m, r] = c.members;
        const seat = () => m.top() + m.u();

        if (c.phase === 0) {
          const s = Math.sign(m.x - r.x) || 1;
          m.dir = -s;
          if (moveToward(r, r.clampX(m.x - s * m.halfW() * 0.6), 50, dt)) {
            c.x0 = r.x;
            c.next();
          } else if (c.pt > 10) c.end();
          return;
        }

        if (c.phase === 1) {
          const k = Math.min(1, c.pt / 0.5);
          r.data.air = true;
          r.x = c.x0 + (m.x - c.x0) * k;
          r.y = groundY + (seat() - groundY) * k - Math.sin(Math.PI * k) * 18;
          r.pose.armF = r.pose.armB = 'up';
          r.pose.eyes = 'happy';
          if (k > 0.5) sitPose(r);
          if (k >= 1) {
            c.next();
            c.tx = m.x < W / 2 ? m.clampX(W - m.halfW() - rand(0, W * 0.2)) : m.clampX(m.halfW() + rand(0, W * 0.2));
            r.say('¡Wiii! 🎉', 2);
          }
          return;
        }

        if (c.phase === 2) {
          const arrived = moveToward(m, c.tx, 38, dt);
          m.pose.eyes = 'happy';
          r.x = m.x;
          r.dir = m.dir;
          sitPose(r);
          r.y = seat() + (m.pose.legs === 1 ? 1 : 0);
          r.pose.armF = r.pose.armB = Math.floor(c.pt * 3) % 2 ? 'up' : 'mid';
          r.pose.eyes = 'happy';
          r.pose.look = 1;
          if (arrived || c.pt > 9) c.next();
          return;
        }

        r.vx = -m.dir * 70;
        r.vy = -200;
        r.setState('fall');
        m.say(pick(['¡Uf, pesas!', '¿Otra vuelta?']), 2);
        m.boost('happy', 8);
        r.boost('happy', 10);
        c.end();
      },
    },

    // Las cantantes cantan al centro y el resto baila alrededor
    concert: {
      max: 22,
      start(c) {
        c.singers = c.members.filter((m) => m.sp.singer);
        c.fans = c.members.filter((m) => !m.sp.singer);
        c.spots = new Map();
        const n = c.singers.length;
        c.singers.forEach((m, i) => c.spots.set(m, m.clampX(W / 2 + (2 * i - (n - 1)) * (m.halfW() + 6))));
        const stage = 70 + Math.max(0, n - 2) * 30;
        c.fans.forEach((m, i) => {
          const side = i % 2 ? 1 : -1;
          const row = Math.floor(i / 2);
          c.spots.set(m, m.clampX(W / 2 + side * (stage + row * (m.halfW() * 2 + 6))));
        });
        c.singers[0].say(phr(c.singers[0], 'concert'), 2.5);
      },
      update(c, dt) {
        if (c.phase === 0) {
          let ready = true;
          for (const m of c.members) if (!moveToward(m, c.spots.get(m), 55, dt)) ready = false;
          if (ready || c.pt > 7) c.next();
          return;
        }
        for (const m of c.singers) {
          if (c.singers.length > 1) m.dir = Math.sign(W / 2 - m.x) || 1;
          singPose(m, dt);
        }
        for (const m of c.fans) dancePose(m, dt);
        if (c.pt > 7) {
          c.singers.forEach((m) => m.say('¡Gracias! 💖', 2));
          c.fans.forEach((m) => {
            m.say(pick(['¡Bravo!', '👏👏', '¡Otra!']), 2);
            m.boost('happy', 10);
          });
          sparkles(W / 2, groundY - 40, 12);
          c.end();
        }
      },
    },

    // Gold Ship toma carrerilla y le hace un dropkick al otro
    dropkick: {
      max: 15,
      start: (c) => c.members[0].say(pick(['Jejeje... 😏', '¡Prepárate~!', '¡Ahí voy!']), 2),
      update(c, dt) {
        const [g, v] = c.members;
        if (c.s == null) {
          const gap = g.halfW() + v.halfW();
          c.s = Math.sign(g.x - v.x) || 1;
          if (v.x + c.s * (gap + 70) !== g.clampX(v.x + c.s * (gap + 70))) c.s = -c.s;
          c.far = g.clampX(v.x + c.s * (gap + 70));
          c.near = g.clampX(v.x + c.s * (gap + 30));
        }
        v.dir = c.s;
        v.pose.look = 1;

        if (c.phase === 0) {
          if (moveToward(g, c.far, 70, dt)) c.next();
          else if (c.pt > 8) c.end();
          return;
        }

        if (c.phase === 1) {
          if (moveToward(g, c.near, 140, dt)) {
            g.data.air = true;
            g.vx = -c.s * 170;
            g.vy = -180;
            c.next();
          } else if (c.pt > 5) c.end();
          return;
        }

        g.dir = -c.s;
        g.pose.tilt = -g.dir * 1.2;
        g.pose.armB = g.pose.armF = 'up';
        g.pose.eyes = 'happy';
        v.pose.eyes = 'big';
        if (Math.abs(g.x - v.x) < g.halfW() + v.halfW() * 0.5) {
          spawn('text', v.x, v.top() - 4, { text: '¡POW!', vy: -20, life: 1, size: 13, color: '#E5534B' });
          sparkles(v.x, v.top() + v.height() / 2, 10);
          g.say(pick(['¡Golshi Kick! 🦵', '¡Strike! 😎']), 2);
          v.say(pick(['¡¿Eeeh?!', '¡Auch! 💫', '¡¿Por quéee?!']), 2);
          g.boost('happy', 10);
          v.vx = -c.s * rand(180, 240);
          v.vy = -rand(200, 250);
          v.setState('fall');
          g.vx *= -0.3;
          g.vy = Math.min(g.vy, -80);
          g.setState('fall');
          return c.end();
        }
        if (physics(g, dt)) {
          g.say('¿Fallé? 😅', 2);
          c.end();
        }
      },
    },

    // Tachyon le da a probar una pócima al otro, que se pone a brillar
    experiment: {
      max: 18,
      start: (c) => c.members[0].say(pick(['Tengo algo para ti~ 🧪', '¿Me ayudas con un experimento?']), 2.5),
      update(c, dt) {
        const [t, v] = c.members;
        if (c.phase === 0) {
          if (meet(c, t, v, 8, dt)) c.next();
          else if (c.pt > 10) c.end();
          return;
        }
        t.pose.look = v.pose.look = 1;

        if (c.phase === 1) {
          t.pose.armF = 'up';
          t.pose.prop = 'flask';
          t.pose.propFrame = Math.floor(c.pt * 4) % 2;
          t.pose.eyes = 'happy';
          v.pose.eyes = 'big';
          if (c.pt > 1.5) {
            v.say(pick(['¿Es seguro? 😰', '...¿qué es esto?', 'Huele raro...']), 2);
            c.next();
          }
          return;
        }

        if (c.phase === 2) {
          v.pose.armF = 'up';
          v.pose.eyes = 'closed';
          t.pose.eyes = 'happy';
          if (c.pt > 1.5) {
            v.glow = 8;
            sparkles(v.x, v.top(), 10);
            v.say(pick(['¡Estoy brillando! ✨', '¿¡Qué me pasó!?', '¡Me siento rapidísimo!']), 2.5);
            c.next();
          }
          return;
        }

        t.pose.eyes = 'happy';
        t.pose.armB = t.pose.armF = 'up';
        v.pose.eyes = 'big';
        if (c.pt > 1 && !c.said) {
          c.said = true;
          t.say(pick(['¡Fascinante! 🧪', '¡Datos excelentes!', 'Kukuku... ¡éxito!']), 2.5);
        }
        if (c.pt > 3.5) {
          t.boost('happy', 10);
          v.boost('energy', 20);
          c.end();
        }
      },
    },
  };

  function startSocial(force) {
    const free = pets.filter((p) =>
      force ? p.grounded() && !['sleep', 'eat', 'drag', 'social'].includes(p.state) : p.free()
    );
    if (free.length < 2) {
      if (force) {
        const p = pets.find((q) => q.state !== 'drag');
        if (p) p.say(pets.length < 2 ? 'Invita a un amigo con ➕' : 'Están ocupados...', 2.5);
      }
      return;
    }

    const a = pick(free);
    const b = pick(free.filter((p) => p !== a));
    const options = [
      ['chat', 3, [a, b]], ['highfive', 2, [a, b]], ['hug', 2, [a, b]], ['tag', 2, [a, b]],
    ];
    const mount = [a, b].find((p) => p.species === 'clawd');
    const rider = [a, b].find((p) => p.species !== 'clawd');
    if (mount && rider) options.push(['ride', 4, [mount, rider]]);
    const other = (p) => (p === a ? b : a);
    const golshi = [a, b].find((p) => p.species === 'goldship');
    if (golshi) options.push(['dropkick', 3, [golshi, other(golshi)]]);
    const tachyon = [a, b].find((p) => p.species === 'tachyon');
    if (tachyon) options.push(['experiment', 3, [tachyon, other(tachyon)]]);
    const singers = free.filter((p) => p.sp.singer);
    if (singers.length) {
      options.push(['concert', 3, [...singers.slice(0, 4), ...free.filter((p) => !p.sp.singer)].slice(0, 6)]);
    }
    const [kind, , members] = weighted(options);
    new Interaction(kind, members);
  }

  // ---------------------------------------------------------------- dibujo

  // Mascota de Claude Code: sprite de 14x9 unidades
  function drawClawd(p) {
    const pal = PALETTES[p.color];
    const eye = pal.eye || EYE;
    const po = p.pose;
    const s = p.u();
    const ox = Math.round(p.x - 7 * s);
    const oy = Math.round(p.y - 9 * s + po.bob);
    const flip = p.dir < 0;
    const px = (x, y, w, h, c) => {
      ctx.fillStyle = c;
      const fx = flip ? 14 - x - w : x;
      ctx.fillRect(ox + fx * s, oy + y * s, w * s, h * s);
    };

    if (po.legs !== 'sit') {
      [2, 4, 9, 11].forEach((lx, i) => {
        let h = 2;
        if (po.legs === 1 && i % 2 === 0) h = 1;
        if (po.legs === 2 && i % 2 === 1) h = 1;
        px(lx, 7, 1, h, pal.body);
      });
    }

    px(2, 0, 10, 7, pal.body);
    px(2, 6, 10, 1, pal.shade);

    const armY = { up: 1, mid: 3, low: 4 };
    px(0, armY[po.armB], 2, 2, pal.body);
    px(12, armY[po.armF], 2, 2, pal.body);

    const eyes = po.look ? [5, 10] : [4, 9];
    eyes.forEach((ex, i) => {
      switch (po.eyes) {
        case 'closed':
          px(ex - i, 3, 2, 1, eye);
          break;
        case 'happy':
          px(ex - 1, 3, 1, 1, eye);
          px(ex, 2, 1, 1, eye);
          px(ex + 1, 3, 1, 1, eye);
          break;
        case 'big':
          px(ex, 1, 1, 3, eye);
          break;
        default:
          px(ex, 2, 1, 2, eye);
      }
    });

    if (po.blush) {
      px(eyes[0] - 1, 4, 1, 1, BLUSH);
      px(eyes[1] + 1, 4, 1, 1, BLUSH);
    }
    if (po.mouth) px(6 + po.look, 5, 2, 1, eye);
  }

  // Chibi de 18x19 unidades: coletas (Miku), taladros (Teto), umamusume con orejas y cola o bruja (Megumin)
  function drawChibi(p) {
    const sp = p.sp;
    const L = sp.look;
    const po = p.pose;
    const u = p.u();
    const w = sp.w;
    const ox = Math.round(p.x - (w * u) / 2);
    // crown: filas por encima de la fila 0 (orejas, sombrero)
    const oy = Math.round(p.y - (sp.h - (sp.crown || 0)) * u + po.bob);
    const flip = p.dir < 0;
    const px = (x, y, ww, h, c) => {
      ctx.fillStyle = c;
      const fx = flip ? w - x - ww : x;
      ctx.fillRect(ox + fx * u, oy + y * u, ww * u, h * u);
    };
    const sway = po.legs === 1 ? 1 : 0;
    const hand = L.hand || L.skin;
    // mirror(side) devuelve X(), que refleja las coordenadas para el lado derecho
    const mirror = (side) => (x, ww) => (side < 0 ? x : w - x - ww);

    // Capa por detrás de todo (Megumin)
    if (L.cape) {
      px(2, 8, 14, 8, L.cape);
      px(2, 15, 14, 1, L.capeTrim);
    }

    // Cola de caballo, en la espalda (a la izquierda del sprite sin voltear)
    if (sp.uma) {
      px(3, 11, 2, 1, L.hair);
      px(2 - sway, 12, 2, 2, L.hair);
      px(2 - sway, 12, 1, 2, L.hairDark);
      px(1 - sway, 14, 2, 2, L.hair);
    }

    // Pelo de los lados
    for (const side of [-1, 1]) {
      const X = mirror(side);
      if (sp.tails === 'long') {
        px(X(2, 2), 2, 2, 2, L.hair);
        px(X(1, 3), 4, 3, 8, L.hair);
        px(X(1 - sway, 3), 12, 3, 3, L.hair);
        px(X(2 - sway, 2), 15, 2, 2, L.hair);
        px(X(2, 1), 5, 1, 7, L.hairDark);
      } else if (sp.tails === 'drills') {
        for (let r = 3; r <= 12; r++) {
          const width = r <= 9 ? 3 : r <= 11 ? 2 : 1;
          const xs = 4 - width - (r >= 9 ? sway : 0);
          px(X(xs, width), r, width, 1, L.hair);
          px(X(xs + (r % width), 1), r, 1, 1, L.hairDark);
        }
      } else if (sp.tails === 'straight') {
        px(X(2, 2), 3, 2, 12, L.hair);
        px(X(4, 1), 8, 1, 6, L.hair);
        px(X(2 - sway, 2), 15, 2, 1, L.hair);
        px(X(3, 1), 5, 1, 9, L.hairDark);
      } else if (sp.tails === 'bob') {
        px(X(3, 1), 3, 1, 7, L.hair);
        px(X(4, 1), 8, 1, 2, L.hair);
        px(X(3, 1), 5, 1, 4, L.hairDark);
      } else if (sp.tails === 'short') {
        px(X(3, 1), 3, 1, 7, L.hair);
        px(X(2, 1), 5, 1, 3, L.hair);
        px(X(4, 1), 8, 1, 2, L.hair);
        px(X(3, 1), 9, 1, 1, L.hairDark);
      }
      if (L.hairTie) {
        px(X(3, 1), 2, 1, 2, L.hairTie);
        px(X(3, 1), 2, 1, 1, L.accent);
      }
    }

    if (po.legs !== 'sit') {
      [6, 10].forEach((lx, i) => {
        const lift = (po.legs === 1 && i === 0) || (po.legs === 2 && i === 1) ? 1 : 0;
        // leg: medias; legAlt: la pierna de atrás distinta (venda de Megumin)
        px(lx, 14, 2, 2 - lift, (i === 0 && L.legAlt) || L.leg || L.skin);
        px(lx, 16 - lift, 2, 3, L.boot);
        px(lx, 16 - lift, 2, 1, L.trim);
      });
    }

    px(5, 11, 8, 1, L.skirt);
    px(4, 12, 10, 2, L.skirt);
    px(4, 13, 10, 1, L.trim);
    px(6, 8, 6, 3, L.shirt);
    if (L.collar) {
      px(7, 8, 1, 1, L.collar);
      px(10, 8, 1, 1, L.collar);
    }
    px(8, 8, 2, 3, L.tie);
    if (L.belt) {
      px(5, 11, 8, 1, L.belt);
      px(8, 11, 2, 1, '#C9CED6');
    }

    // Bata de laboratorio abierta (Tachyon)
    if (L.coat) {
      for (const side of [-1, 1]) {
        const X = mirror(side);
        px(X(5, 1), 8, 1, 5, L.coat);
        px(X(4, 1), 11, 1, 4, L.coat);
      }
    }

    px(6, 0, 6, 1, L.hair);
    px(5, 1, 8, 1, L.hair);
    px(4, 2, 10, 6, L.hair);
    px(5, 4, 8, 4, L.skin);
    px(5, 4, 1, 1, L.hair);
    px(12, 4, 1, 1, L.hair);
    px(8, 4, 2, 1, L.hair);
    px(4, 8, 1, 1, L.hair);
    px(13, 8, 1, 1, L.hair);

    if (sp.uma) {
      for (const side of [-1, 1]) {
        const X = mirror(side);
        px(X(4, 1), -1, 1, 1, L.hair);
        px(X(4, 2), 0, 2, 2, L.hair);
        px(X(5, 1), 0, 1, 1, L.earIn);
      }
    }
    if (sp.ahoge) {
      px(9, -1, 1, 1, L.hair);
      px(10, -2, 1, 1, L.hair);
    }
    if (L.hat) {
      px(7, -2, 4, 2, L.hat);
      px(6, 0, 6, 1, L.hatBand);
    }
    // Sombrero de bruja con la punta doblada hacia atrás (Megumin)
    if (L.witchHat) {
      px(5, -1, 8, 3, L.witchHat);
      px(6, -2, 5, 1, L.witchHat);
      px(6, -3, 3, 1, L.witchHat);
      px(4, -4, 3, 1, L.witchHat);
      px(5, 1, 8, 1, L.witchBand);
      px(8, 1, 2, 1, L.witchBuckle);
      px(2, 2, 14, 1, L.witchHat);
      px(2, 2, 1, 1, L.witchBand);
      px(15, 2, 1, 1, L.witchBand);
    }
    // Boina con "UTAU" y audífonos (Defoko)
    if (L.beret) {
      px(6, -2, 7, 1, L.beret);
      px(4, -1, 10, 2, L.beret);
      [6, 8, 9, 11].forEach((x) => px(x, 0, 1, 1, L.beretText));
    }
    if (L.phones) {
      for (const side of [-1, 1]) {
        const X = mirror(side);
        px(X(3, 2), 4, 2, 3, L.phones);
        px(X(3, 1), 5, 1, 1, L.phonesLight);
      }
    }

    const eyes = po.look ? [7, 12] : [6, 11];
    eyes.forEach((ex, i) => {
      switch (po.eyes) {
        case 'closed':
          px(ex - 1 + i, 6, 2, 1, EYE);
          break;
        case 'happy':
          px(ex - 1, 6, 1, 1, EYE);
          px(ex, 5, 1, 1, EYE);
          px(ex + 1, 6, 1, 1, EYE);
          break;
        case 'big':
          px(ex, 4, 1, 1, EYE);
          px(ex, 5, 1, 2, L.eye);
          break;
        default:
          px(ex, 5, 1, 1, EYE);
          px(ex, 6, 1, 1, L.eye);
      }
    });
    if (po.blush) {
      px(eyes[0] - 1, 7, 1, 1, BLUSH);
      px(eyes[1] + 1, 7, 1, 1, BLUSH);
    }
    if (po.mouth) px(8 + po.look, 7, 1, 1, '#B04050');

    // Brazos: coordenadas del brazo trasero; el delantero se refleja
    // shoulder: hombro descubierto (mangas sueltas); cuff: puño de la manga
    const shoulder = L.shoulder || L.sleeve;
    const cuff = L.cuff || L.sleeve;
    const arm = (front, pose) => {
      const X = (x) => (front ? w - x - 1 : x);
      if (pose === 'up') {
        px(X(5), 8, 1, 1, shoulder);
        px(X(4), 6, 1, 2, L.sleeve);
        px(X(3), 5, 1, 1, cuff);
        px(X(3), 4, 1, 1, hand);
      } else if (pose === 'low') {
        px(X(5), 8, 1, 1, shoulder);
        px(X(5), 9, 1, 1, L.sleeve);
        px(X(4), 10, 1, 1, cuff);
        px(X(4), 11, 1, L.longSleeves ? 2 : 1, hand);
      } else {
        px(X(5), 8, 1, 1, shoulder);
        px(X(5), 9, 1, 1, L.sleeve);
        px(X(5), 10, 1, 1, cuff);
        px(X(5), 11, 1, L.longSleeves ? 2 : 1, hand);
      }
    };
    arm(false, po.armB);
    arm(true, po.armF);

    // Báculo con esfera azul, siempre en la mano delantera (Megumin)
    if (L.staff) {
      const [hx, hy] = po.armF === 'up' ? [14, 4] : po.armF === 'low' ? [13, 11] : [12, 11];
      px(hx, hy - 6, 1, 12, L.staff);
      px(hx + 1, hy - 9, 1, 3, L.staff);
      px(hx - 1, hy - 8, 2, 2, '#3A6FD8');
      px(hx - 1, hy - 8, 1, 1, '#A5E4FF');
      px(hx, hy, 1, 1, hand);
    }

    // Objeto en la mano delantera levantada (x=14, y=4)
    if (po.prop === 'leek') {
      if (po.propFrame) {
        px(15, 3, 1, 1, '#F2F2E8');
        px(16, 2, 1, 1, '#F2F2E8');
        px(17, 1, 1, 1, '#9BD36B');
        px(18, 0, 1, 1, '#9BD36B');
        px(19, -1, 1, 1, '#4E9A3A');
        px(19, -2, 1, 1, '#4E9A3A');
        px(20, -1, 1, 1, '#4E9A3A');
      } else {
        px(14, 2, 1, 2, '#F2F2E8');
        px(14, -2, 1, 4, '#9BD36B');
        px(13, -4, 1, 2, '#4E9A3A');
        px(15, -4, 1, 2, '#4E9A3A');
      }
    } else if (po.prop === 'bread') {
      if (po.propFrame) {
        [[15, 3], [16, 2], [17, 1], [18, 0]].forEach(([x, y], i) => px(x, y, 1, 1, i % 2 ? '#A8692A' : '#D9A55B'));
      } else {
        px(14, -2, 1, 6, '#D9A55B');
        px(14, -1, 1, 1, '#A8692A');
        px(14, 1, 1, 1, '#A8692A');
      }
    } else if (po.prop === 'mic') {
      px(14, 2, 1, 2, '#3A3A44');
      px(14, 1, 1, 1, po.propFrame ? '#FFD65C' : '#B8BCC6');
    } else if (po.prop === 'flask') {
      px(14, 0, 1, 1, '#CFE8F0');
      px(13, 1, 3, 3, '#CFE8F0');
      px(13, 2, 3, 2, po.propFrame ? '#B48CFF' : '#7CFF6B');
    }
  }

  // tilt: giro del cuerpo (dropkick); glow: brillo arcoíris de las pócimas de Tachyon
  // lie: tumbada en el suelo (Megumin sin maná)
  function drawPet(p) {
    if (!p.pose.tilt && !p.pose.lie && !(p.glow > 0)) return p.sp.draw(p);
    ctx.save();
    if (p.glow > 0) ctx.filter = `hue-rotate(${Math.round(clock * 240) % 360}deg) drop-shadow(0 0 3px #9DFF7A)`;
    if (p.pose.lie) {
      // Se gira 90° hacia donde mira y queda apoyada en el suelo
      ctx.translate(Math.round(p.x), Math.round(groundY - p.halfW()));
      ctx.rotate((p.dir * Math.PI) / 2);
      ctx.translate(-Math.round(p.x), -Math.round(p.y - p.height() / 2));
    } else if (p.pose.tilt) {
      const cy = p.y - p.height() / 2 + p.pose.bob;
      ctx.translate(p.x, cy);
      ctx.rotate(p.pose.tilt);
      ctx.translate(-p.x, -cy);
    }
    p.sp.draw(p);
    ctx.restore();
  }

  function drawShadow(p) {
    const lift = Math.max(0, groundY - p.y);
    const k = 1 - Math.min(lift / 150, 0.6);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(p.x, groundY + 1, p.halfW() * 0.85 * k, S * 0.8 * k, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawLaptop(p) {
    const s = S, d = p.dir;
    const base = p.x + d * p.halfW();
    const px = (fx, fy, w, h, c) => {
      ctx.fillStyle = c;
      const x = d > 0 ? base + fx * s : base - (fx + w) * s;
      ctx.fillRect(Math.round(x), Math.round(groundY + fy * s), w * s, h * s);
    };
    px(1, -1, 7, 1, '#8B949E');
    px(7, -3, 1, 2, '#4B5563');
    px(8, -7, 1, 4, '#4B5563');
    px(7, -6, 1, 3, Math.floor(p.t * 3) % 2 ? '#7DD3FC' : '#A5E4FF');
  }

  function drawFood(f) {
    const { rows, colors } = FOODS[f.kind];
    const s = Math.max(2, Math.round(S * 0.8));
    const w = rows[0].length;
    const eaten = Math.floor(f.bites * w);
    const x0 = f.x - (w * s) / 2, y0 = f.y - rows.length * s;
    rows.forEach((row, r) => {
      for (let c = 0; c < w; c++) {
        if (row[c] === '.') continue;
        const k = f.eatSide < 0 ? c : w - 1 - c;
        if (k < eaten) continue;
        ctx.fillStyle = colors[row[c]];
        ctx.fillRect(Math.round(x0 + c * s), Math.round(y0 + r * s), s, s);
      }
    });
  }

  function drawBall() {
    if (!ball) return;
    ctx.globalAlpha = clamp(ball.life, 0, 1);
    ctx.fillStyle = '#E5534B';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ball.x + Math.cos(ball.rot) * ball.r * 0.45, ball.y + Math.sin(ball.rot) * ball.r * 0.45, ball.r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawBubble(p) {
    const text = p.bubble.text;
    ctx.font = `12px ${theme.font}`;
    const tw = ctx.measureText(text).width;
    const bw = tw + 12, bh = 20;
    const bx = clamp(p.x - bw / 2, 2, Math.max(2, W - bw - 2));
    const by = Math.max(2, p.top() - bh - 8);
    ctx.globalAlpha = clamp(p.bubble.t * 3, 0, 1);
    ctx.fillStyle = theme.bubbleBg;
    ctx.strokeStyle = theme.bubbleBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx + 0.5, by + 0.5, bw, bh, 6);
    else ctx.rect(bx + 0.5, by + 0.5, bw, bh);
    ctx.fill();
    ctx.stroke();
    const tx = clamp(p.x, bx + 8, bx + bw - 8);
    if (by + bh + 6 < p.top() + 2) {
      ctx.beginPath();
      ctx.moveTo(tx - 4, by + bh);
      ctx.lineTo(tx, by + bh + 5);
      ctx.lineTo(tx + 4, by + bh);
      ctx.fill();
    }
    ctx.fillStyle = theme.bubbleFg;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bx + 6, by + bh / 2 + 1);
    ctx.textBaseline = 'alphabetic';
    ctx.globalAlpha = 1;
  }

  function skyGradient(top, bottom) {
    const g = ctx.createLinearGradient(0, 0, 0, groundY);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, groundY);
  }

  function drawCloud(x, y, s) {
    drawPattern(['..xxx...', '.xxxxxx.', 'xxxxxxxx'], x, y, s, 'rgba(255,255,255,0.9)');
  }

  function drawBackground(t) {
    switch (config.background) {
      case 'night': {
        skyGradient('#0B1026', '#1F2E52');
        for (const st of STARS) {
          ctx.fillStyle = `rgba(255,255,240,${0.3 + 0.7 * Math.abs(Math.sin(t + st.p))})`;
          ctx.fillRect(Math.round(st.x * W), Math.round(st.y * groundY), 1.5, 1.5);
        }
        ctx.fillStyle = '#F5F3CE';
        ctx.beginPath();
        ctx.arc(W - 28, 22, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#20263A';
        ctx.fillRect(0, groundY, W, H - groundY);
        break;
      }
      case 'beach': {
        skyGradient('#7CC7F5', '#D8F0FF');
        ctx.fillStyle = '#FFD65C';
        ctx.beginPath();
        ctx.arc(30, 24, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3FA7D6';
        ctx.fillRect(0, groundY - 14, W, 14);
        ctx.fillStyle = '#A6DCF2';
        for (let x = 0; x < W + 16; x += 24) ctx.fillRect(Math.round((x + t * 12) % (W + 16)) - 16, groundY - 14, 10, 2);
        ctx.fillStyle = '#EFD29A';
        ctx.fillRect(0, groundY, W, H - groundY);
        break;
      }
      case 'grass': {
        skyGradient('#9FD8FF', '#E8F6FF');
        drawCloud(((t * 6) % (W + 60)) - 40, 14, 3);
        drawCloud(((t * 4 + W / 2) % (W + 60)) - 40, 30, 2);
        ctx.fillStyle = '#5AA64A';
        ctx.fillRect(0, groundY, W, H - groundY);
        ctx.fillStyle = '#6CC35A';
        ctx.fillRect(0, groundY, W, 3);
        for (let x = 7; x < W; x += 23) ctx.fillRect(x, groundY - 3, 2, 3);
        break;
      }
      case 'terminal': {
        ctx.fillStyle = '#0D1117';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(255,255,255,0.025)';
        for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
        ctx.font = '11px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#7EE787';
        ctx.fillText('> claude' + (Math.floor(t * 2) % 2 ? ' █' : ''), 8, 16);
        ctx.fillStyle = '#30363D';
        for (let x = 0; x < W; x += 6) ctx.fillRect(x, groundY + 1, 3, 1);
        break;
      }
      default: {
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = theme.fg;
        ctx.fillRect(0, groundY + 1, W, 1);
        ctx.globalAlpha = 1;
      }
    }
  }

  // Quien va montado se dibuja (y se selecciona) encima de su montura
  function drawOrder() {
    return pets.slice().sort((a, b) => (a.data.air ? 1 : 0) - (b.data.air ? 1 : 0));
  }

  // ---------------------------------------------------------------- objetos

  function updateObjects(dt) {
    for (let i = foods.length - 1; i >= 0; i--) {
      const f = foods[i];
      if (f.gone) { foods.splice(i, 1); continue; }
      if (!f.landed) {
        f.vy += 600 * dt;
        f.y += f.vy * dt;
        if (f.y >= groundY) { f.y = groundY; f.landed = true; }
      }
      if ((f.ttl -= dt) <= 0) f.gone = true;
    }

    if (ball) {
      const b = ball;
      b.life -= dt;
      b.vy += 600 * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * 0.7; }
      if (b.x > W - b.r) { b.x = W - b.r; b.vx = -Math.abs(b.vx) * 0.7; }
      if (b.y > groundY - b.r) {
        b.y = groundY - b.r;
        b.vy = b.vy > 40 ? -b.vy * 0.55 : 0;
        b.vx *= 1 - Math.min(1, 1.2 * dt);
      }
      b.rot += (b.vx * dt) / b.r;
      if (b.life <= 0) ball = null;
    }

    for (let i = interactions.length - 1; i >= 0; i--) {
      interactions[i].update(dt);
      if (interactions[i].done) interactions.splice(i, 1);
    }
  }

  function throwBall(x) {
    ball = { x: clamp(x, 10, W - 10), y: -10, vx: rand(-40, 40), vy: 0, r: 2.5 * S, life: 25, rot: 0 };
    for (const p of pets) {
      if (p.grounded() && !['sleep', 'eat', 'chase', 'social', 'explode'].includes(p.state)) p.setState('chase');
    }
  }

  // Fuego, humo, temblor y las mascotas cercanas salen volando
  function explosion(x) {
    spawn('boom', x, groundY, { vx: 0, vy: 0, life: 1.1 });
    for (let i = 0; i < 30; i++) {
      spawn('spark', x, groundY - 10, { vx: rand(-160, 160), vy: rand(-260, -60), life: rand(0.8, 1.5), color: pick(['#E5534B', '#FF9C5B', '#FFD65C', '#FFFFFF']) });
    }
    for (let i = 0; i < 6; i++) {
      spawn('smoke', x + rand(-20, 20), groundY - rand(0, 20), { vx: rand(-10, 10), vy: rand(-25, -12), life: rand(1.5, 2.5) });
    }
    shake = 0.7;
    for (const q of pets) {
      const d = q.x - x;
      if (Math.abs(d) > 90 || !q.grounded() || ['sleep', 'social', 'explode'].includes(q.state)) continue;
      q.vx = (Math.sign(d) || 1) * rand(120, 220);
      q.vy = -rand(200, 300);
      q.setState('fall');
      q.say(pick(PHRASES.thrown), 2);
    }
  }

  function feed() {
    for (const p of pets) {
      if (!p.grounded()) continue;
      if (p.state === 'sleep') p.say(pick(PHRASES.grumpy));
      const side = p.x < W / 2 ? 1 : -1;
      const fx = clamp(p.x + side * rand(35, 80), 10 * S, Math.max(10 * S, W - 10 * S));
      const food = { kind: p.sp.food, x: fx, y: -10, vy: 0, landed: false, bites: 0, eatSide: -1, gone: false, ttl: 30 };
      foods.push(food);
      const reach = p.halfW() + FOODS[food.kind].rows[0].length * S * 0.4 + 2;
      const stand = p.clampX(fx - (Math.sign(fx - p.x) || 1) * reach);
      p.setState('goto', { tx: stand, sp: 60, then: () => p.setState('eat', { food }) });
    }
  }

  function petPet(p) {
    p.boost('happy', 6);
    hearts(p.x, p.top());
    if (p.state === 'sleep') {
      p.say(pick(PHRASES.grumpy));
      return;
    }
    p.say(phr(p, 'pet'), 1.8);
    if (p.grounded() && p.state !== 'social') p.setState('jump', { blush: true, small: true });
  }

  function addPet(o) {
    const p = new Pet(o);
    pets.push(p);
    selected = p;
    setTimeout(() => pets.includes(p) && p.say(phr(p, 'hello'), 2.5), 900);
    save();
    return p;
  }

  // La extensión muestra la lista y responde con la acción 'remove' y el id elegido ('all' = todas)
  function requestRemove() {
    vscode.postMessage({
      type: 'removeRequest',
      selected: selected && selected.id,
      pets: pets.map((p) => ({ id: p.id, name: p.name, species: p.species })),
    });
  }

  function removePet(id) {
    const gone = id === 'all' ? pets.slice() : pets.filter((p) => p.id === id);
    for (const p of gone) {
      sparkles(p.x, p.top() + p.height() / 2, 10);
      pets.splice(pets.indexOf(p), 1);
    }
    if (!pets.includes(selected)) selected = pets[0] || null;
    renderHud();
    save();
  }

  // ✨: su solo si tiene (zoom, brew, explode...), si no canta o baila
  const specialOf = (p) => p.sp.solo || (p.sp.singer ? 'sing' : 'dance');

  function forEachPet(fn) {
    pets.forEach((p, i) => setTimeout(() => {
      if (pets.includes(p) && p.state !== 'drag') fn(p);
    }, i * 250));
  }

  function doAction(msg) {
    switch (msg.action) {
      case 'feed': return feed();
      case 'play': return throwBall(rand(W * 0.2, W * 0.8));
      case 'social': return startSocial(true);
      case 'sleep': return forEachPet((p) => p.grounded() && p.setState('sleep', { min: 5 }));
      case 'code':
      case 'dance':
      case 'wave': return forEachPet((p) => p.grounded() && p.setState(msg.action));
      case 'special':
        return forEachPet((p) => {
          if (p.grounded() && p.state !== specialOf(p)) p.setState(specialOf(p));
        });
      case 'spawn': return addPet({ species: msg.species, color: msg.color, name: msg.name });
      case 'remove': return msg.id != null ? removePet(msg.id) : requestRemove();
    }
  }

  function onEditorEvent(event) {
    const awake = pets.filter((p) => p.grounded() && !['sleep', 'social'].includes(p.state));
    if (!awake.length) return;
    const p = pick(awake);
    switch (event) {
      case 'save':
        p.say(pick(PHRASES.save));
        sparkles(p.x, p.top(), 6);
        p.setState('jump');
        break;
      case 'error':
        p.setState('think', { text: pick(PHRASES.error) });
        break;
      case 'fixed':
        awake.forEach((q) => q.setState(q.sp.singer ? 'sing' : 'dance'));
        p.say(pick(PHRASES.fixed));
        break;
      case 'typing':
        if (['idle', 'walk', 'sit', 'look'].includes(p.state)) {
          p.setState('code');
          p.say(pick(PHRASES.typing), 2);
        }
        break;
    }
  }

  // ---------------------------------------------------------------- HUD y guardado

  function renderHud() {
    const p = selected && pets.includes(selected) ? selected : pets[0];
    if (!p) { statsEl.innerHTML = ''; return; }
    const bar = (icon, v, cls, label) =>
      `<span class="stat" title="${label}: ${Math.round(v)}%">${icon}<span class="bar ${cls}${v < 25 ? ' low' : ''}"><div style="width:${v.toFixed(0)}%"></div></span></span>`;
    const foodIcon = { cookie: '🍪', leek: '🥬', bread: '🥖', yakisoba: '🍜', carrot: '🥕', onigiri: '🍙', potion: '🧪' }[p.sp.food];
    statsEl.innerHTML =
      `<span class="name" title="${esc(p.name)}">${esc(p.name)}</span>` +
      bar(foodIcon, p.hunger, 'hunger', 'Comida') +
      bar('⚡', p.energy, 'energy', 'Energía') +
      bar('❤️', p.happy, 'happy', 'Felicidad');
  }

  function save() {
    vscode.postMessage({
      type: 'save',
      state: {
        savedAt: Date.now(),
        pets: pets.map((p) => ({
          species: p.species, name: p.name, color: p.color,
          hunger: Math.round(p.hunger), energy: Math.round(p.energy), happy: Math.round(p.happy),
          x: W ? p.x / W : 0.5,
        })),
      },
    });
  }

  function restore(state) {
    pets.length = 0;
    const saved = state && Array.isArray(state.pets) ? state.pets : [];
    const elapsed = state && state.savedAt ? Math.min((Date.now() - state.savedAt) / 1000, 3 * 3600) : 0;
    for (const s of saved) {
      pets.push(new Pet({
        ...s,
        hunger: clamp(s.hunger - elapsed / 120, 10, 100),
        energy: clamp(s.energy + elapsed / 60, 0, 100),
        happy: clamp(s.happy - elapsed / 180, 10, 100),
      }));
    }
    // Solo la primera vez (sin estado guardado) aparece Clawd; si las despidieron a todas, sigue vacío
    if (!state) pets.push(new Pet({ name: 'Clawd', color: 'orange' }));
    selected = pets[0];
    setTimeout(() => pets[0] && pets[0].say(phr(pets[0], 'hello')), 900);
  }

  // ---------------------------------------------------------------- entrada

  function pointerPos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function petAt(x, y) {
    const order = drawOrder();
    for (let i = order.length - 1; i >= 0; i--) if (order[i].hit(x, y)) return order[i];
    return null;
  }

  canvas.addEventListener('pointerdown', (e) => {
    const { x, y } = pointerPos(e);
    const p = petAt(x, y);
    if (!p) {
      throwBall(x);
      return;
    }
    selected = p;
    renderHud();
    drag = { pet: p, ox: x - p.x, oy: y - p.y, sx: x, sy: y, lx: x, ly: y, lt: performance.now(), vx: 0, vy: 0, moved: false };
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener('pointermove', (e) => {
    const { x, y } = pointerPos(e);
    if (!drag) {
      canvas.style.cursor = petAt(x, y) ? 'grab' : 'pointer';
      return;
    }
    const p = drag.pet;
    if (!drag.moved && Math.hypot(x - drag.sx, y - drag.sy) > 4) {
      drag.moved = true;
      p.setState('drag');
      canvas.style.cursor = 'grabbing';
    }
    if (!drag.moved) return;
    const now = performance.now();
    const dts = Math.max(1, now - drag.lt) / 1000;
    drag.vx = drag.vx * 0.5 + ((x - drag.lx) / dts) * 0.5;
    drag.vy = drag.vy * 0.5 + ((y - drag.ly) / dts) * 0.5;
    drag.lx = x; drag.ly = y; drag.lt = now;
    p.x = p.clampX(x - drag.ox);
    p.y = clamp(y - drag.oy, p.height(), groundY);
  });

  function endDrag() {
    if (!drag) return;
    const p = drag.pet;
    if (drag.moved) {
      p.vx = clamp(drag.vx, -400, 400);
      p.vy = clamp(drag.vy, -500, 300);
      p.setState('fall');
    } else {
      petPet(p);
    }
    drag = null;
    canvas.style.cursor = 'grab';
  }

  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  toolbar.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.action === 'spawn') vscode.postMessage({ type: 'spawnRequest' });
    else doAction({ action: b.dataset.action });
  });

  window.addEventListener('message', (e) => {
    const msg = e.data;
    switch (msg.type) {
      case 'init':
        applyConfig(msg.config);
        restore(msg.state);
        renderHud();
        break;
      case 'config':
        applyConfig(msg.config);
        break;
      case 'action':
        doAction(msg);
        break;
      case 'event':
        onEditorEvent(msg.event);
        break;
    }
  });

  // ---------------------------------------------------------------- bucle

  let last = performance.now();
  let hudT = 0, saveT = 0, themeT = 0, clock = 0;

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;

    for (const p of pets) p.update(dt);
    updateObjects(dt);
    updateParticles(dt);

    if ((socialT -= dt) <= 0) {
      socialT = rand(12, 25);
      if (Math.random() < 0.8) startSocial(false);
    }
    if ((hudT -= dt) <= 0) { hudT = 0.5; renderHud(); }
    if ((saveT -= dt) <= 0) { saveT = 10; if (pets.length) save(); }
    if ((themeT -= dt) <= 0) { themeT = 2; readTheme(); }

    const order = drawOrder();
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    if (shake > 0) {
      shake -= dt;
      ctx.translate(Math.round(rand(-3, 3)), Math.round(rand(-2, 2)));
    }
    drawBackground(clock);
    foods.forEach(drawFood);
    pets.forEach((p) => p.state === 'code' && drawLaptop(p));
    pets.forEach(drawShadow);
    order.forEach(drawPet);
    drawBall();
    drawParticles();
    order.forEach((p) => p.bubble && drawBubble(p));
    if (!pets.length) {
      ctx.font = `12px ${theme.font}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = textColor();
      ctx.globalAlpha = 0.7;
      ctx.fillText('Invoca una mascota con ➕', W / 2, H / 2);
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    requestAnimationFrame(frame);
  }

  readTheme();
  new ResizeObserver(resize).observe(canvas);
  resize();
  requestAnimationFrame(frame);
  vscode.postMessage({ type: 'ready' });
})();
