'use strict';


// ═══════════════════════════════════════
// CONFIG — API KEY GEMINI (interna)
// ═══════════════════════════════════════
// Pega tu key aquí O déjala vacía y se usará la guardada en localStorage.
const GEMINI_API_KEY_BUILTIN = '';

// ═══════════════════════════════════════
// STORAGE KEYS
// ═══════════════════════════════════════
const KEYS = {
  nombre:'cfg_n', cn:'cfg_cn', ct:'cfg_ct',
  d1:'cfg_d1', d2:'cfg_d2', d3:'cfg_d3', d4:'cfg_d4',
  mc:'cfg_mc', md:'cfg_md', comida:'cfg_comida',
  sangre:'cfg_sangre', alergias:'cfg_alergias',
  hiper:'cfg_hiper', hipo:'cfg_hipo', triggers:'cfg_triggers',
  intereses:'cfg_intereses', nacionalidad:'cfg_nac', documento:'cfg_doc',
  apikey:'cfg_key',
  ocupacion:'cfg_ocu', horas:'cfg_hrs', retos:'cfg_ret',
  imgUbicacion:'cfg_img_u', imgContacto:'cfg_img_c',
  imgUsuario:'cfg_img_usr', imgMeds:'cfg_img_m',
  imgDiag:'cfg_img_diag',
  apoyoRel:'cfg_ap_r',
  deudas:'cfg_deudas', historial:'cfg_hist',
  // Apoyo emocional
  petName:'cfg_pet_n', petType:'cfg_pet_t', petDesc:'cfg_pet_d', imgPet:'cfg_img_pet',
  objName:'cfg_obj_n', objDesc:'cfg_obj_d', objLocation:'cfg_obj_loc',
  // Mundo autista
  lugarFijo:'cfg_lugar', rutas:'cfg_rutas', rutaCambio:'cfg_ruta_c',
  rituales:'cfg_rituales', peculiaridades:'cfg_peculiar',
  objetosSalida:'cfg_obj_sal', texturasRopa:'cfg_texturas', stimming:'cfg_stimming',
  // Transporte seguro
  taxiApp:'cfg_taxi_app', taxiMsg:'cfg_taxi_msg',
  // Alarmas y calendario medicación
  alarms:'cfg_alarms', medLog:'cfg_medlog'
};

// ── Auto-detect device language on first run ──
(function detectLang() {
  const saved = localStorage.getItem('cfg_lang');
  if (saved) return; // already set by user
  const lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase().slice(0,2);
  const chosen = (lang === 'es') ? 'es' : 'en';
  localStorage.setItem('cfg_lang', chosen);
})();

let C = {};
let chatHistory = [];
let deudas = [];
let historial = [];
let alarms = [];
let medLog = {};
let alarmCheckInterval = null;

// ═══════════════════════════════════════
// LOAD CONFIG
// ═══════════════════════════════════════
function loadC() {
  Object.entries(KEYS).forEach(([k, storageKey]) => {
    C[k] = localStorage.getItem(storageKey) || '';
  });
  try { deudas   = JSON.parse(localStorage.getItem(KEYS.deudas)   || '[]'); } catch(e){ deudas   = []; }
  try { historial = JSON.parse(localStorage.getItem(KEYS.historial) || '[]'); } catch(e){ historial = []; }
  try { alarms    = JSON.parse(localStorage.getItem(KEYS.alarms)    || '[]'); } catch(e){ alarms    = []; }
  try { medLog    = JSON.parse(localStorage.getItem(KEYS.medLog)    || '{}'); } catch(e){ medLog    = {}; }
  if (!localStorage.getItem('appInstallDate')) {
    localStorage.setItem('appInstallDate', new Date().toISOString().slice(0, 10));
  }
}

// ═══════════════════════════════════════
// ACCORDION
// ═══════════════════════════════════════
function toggleAcc(btn) {
  const body = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');
  btn.classList.toggle('open', !isOpen);
  // Usar display en lugar de max-height para evitar que aplaste hermanos
  if (!isOpen) {
    body.classList.add('open');
    body.style.display = 'block';
  } else {
    body.classList.remove('open');
    body.style.display = 'none';
  }
}

// ═══════════════════════════════════════
// i18n — LANGUAGE SYSTEM
// ═══════════════════════════════════════
const T = {
  es: {
    appName: 'NEURO-DOME',
    sosBtnLabel: '🆘 SOS — CREDENCIAL MÉDICA Y LEGAL',
    scannerLbl: 'ESCÁNER', deudasLbl: 'DEUDAS', iaHoyLbl: 'IA HOY', tonosLbl: 'TONOS ISO',
    nivelTag: 'SELECCIONA TU NIVEL ACTUAL',
    n1title:'CRISIS SEVERA', n1sub:'Meltdown · Shutdown · No funciono',
    n2title:'DISOCIACIÓN / AGNOSIA', n2sub:'No reconozco el entorno ni personas',
    n3title:'BAJA ENERGÍA', n3sub:'Fatiga cognitiva · Burnout activo',
    n4title:'FUNCIONAL REDUCIDO', n4sub:'Tareas simples y rutinas',
    n5title:'ESTADO ÓPTIMO', n5sub:'Ventana funcional abierta',
    tarjetas:'🃏 Tarjetas', cueva:'🕳️ Cueva', alarmas:'💊 Alarmas',
    miApoyo:'🐾 Mi apoyo emocional', miObjeto:'🧸 Mi objeto favorito',
    batLabel:'Mi Batería Social',
    taxiTitle:'IR A CASA EN TAXI', taxiSub:'Un toque — tu dirección ya está lista',
    // Setup
    setupHeroTitle:'Mi Perfil de Apoyo',
    setupHint:'<b style="color:var(--text)">👋 Solo 3 pasos para empezar:</b> completa los campos marcados con <b style="color:var(--red)">*</b> en <b>Mi identidad</b>, <b>Contacto de emergencia</b> e <b>Imágenes</b>. Puedes llenar el resto desde <b>Configuración ⚙️</b> cuando quieras, sin prisa.',
    saveBtn:'GUARDAR Y CONTINUAR',
    btnMoreProfile:'Completar mi perfil (opcional)',
    btnHideAdvanced:'Ocultar sección avanzada',
    // SOS
    sosTitle:'PERSONA AUTISTA EN CRISIS',
    sosDireccionLbl:'📍 DIRECCIÓN DE DOMICILIO',
    sosContactoLbl:'CONTACTO PRINCIPAL',
    sosWaBtn:'📱 WhatsApp de emergencia',
    sosCallBtn:'📞 LLAMAR AL CONTACTO AHORA',
    // L1
    l1Tag:'PROTOCOLO ACTIVO', l1H1:'NIVEL 1 — CRISIS',
    l1ProtoHd:'📋 Protocolo de crisis — una acción a la vez',
    l1Step1:'<b>Siéntate o acuéstate en el suelo ahora.</b> No importa dónde estés.',
    l1Step3:'No tienes que hablar. No tienes que responder mensajes. <b>Mutismo autorizado.</b>',
    l1Step4:'Pon auriculares. Si no tienes, cúbrete las orejas con las manos.',
    l1Step5:'No tomes ninguna decisión ahora. <b>Ninguna.</b>',
    btnCaveMode:'🕳️ Modo Cueva — cero estímulos',
    btnSafety:'⚠️ Protocolo de seguridad vital',
    // L2
    l2Tag:'ANCLAJE DE REALIDAD', l2H1:'NIVEL 2 — DISOCIACIÓN',
    l2YourName:'TU NOMBRE',
    l2WhoHd:'🪞 Quién eres ahora mismo',
    l2HomeHd:'🏠 Tu casa está aquí',
    btnMaps:'🗺️ Cómo llegar a casa caminando',
    l2ContactRole:'CONTACTO DE EMERGENCIA',
    btnCall:'Llamar',
    l2AnchorHd:'⚓ Protocolo de anclaje — 4 pasos',
    l2Step1:'<b>Aplica algo frío</b> en las muñecas o cara. Hielo, agua fría, lata fría.',
    l2Step2:'<b>Presión profunda:</b> aprieta tus brazos contra el cuerpo o siéntate en el suelo y siente el peso.',
    l2Step3:'<b>Toca el suelo</b> con las manos. Describe en voz baja la textura: rugoso, liso, frío.',
    l2Step4:'Encuentra <b>un objeto conocido</b> en tu bolsillo o mochila. Sostenlo.',
    // L3
    l3Tag:'MODO SUPERVIVENCIA', l3H1:'NIVEL 3 — BAJA ENERGÍA',
    l3MedsHd:'🪫 Medicación registrada',
    btnCalendar:'📅 Calendario',
    l3FoodHd:'🍽️ Comida segura ahora',
    btnRecipes:'🥘 Prepara algo sencillo — ver recetas',
    l3ValidationHd:'✅ Validación operativa',
    l3PriorityHd:'📋 Prioridades — sólo estas cuatro',
    // L4
    l4Tag:'MODO ECONOMÍA', l4H1:'NIVEL 4 — FUNCIONAL',
    l4AvailHd:'✅ Actividades disponibles ahora',
    l4AvoidHd:'🚫 Evitar',
    // L5
    l5Tag:'VENTANA ABIERTA', l5H1:'NIVEL 5 — ÓPTIMO',
    l5ActsHd:'🚀 Actividades de alto retorno',
    l5ConsHd:'🛡️ Protocolo de conservación',
    // Isochronic
    isoTitle:'Tonos Isocrónicos',
    isoSubtitle:'REGULACIÓN NEUROLÓGICA',
    isoAiBtn:'🧠 Sugerir tonos personalizados con IA',
    isoWhat:'¿Qué son los tonos isocrónicos?',
    isoDesc:'Son pulsos rítmicos de sonido puro que sincronizan las ondas cerebrales sin necesidad de auriculares. Especialmente útiles para autistas: <b>reducen la hiperactivación del sistema nervioso</b>, facilitan el sueño y ayudan a salir de estados de bloqueo. Escúchalos a volumen bajo y cómodo.',
    tonePlay:'▶ Iniciar', toneStop:'⏹ Detener', toneDurLabel:'Duración sugerida:',
    toneNames:['Gamma — Foco suave','Alpha — Calma activa','Schumann — Tierra','Theta — Sueño','Delta — Sueño profundo','Beta bajo — Alerta leve'],
    toneUses:['Transición de sobrecarga a enfoque leve. Útil cuando no puedes concentrarte.','Relajación sin sueño. Ideal antes de una tarea que requiere calma.','Frecuencia natural del planeta. Reduce ansiedad profunda y desregulación.','Para quedarse dormido o descansar profundamente. No usar al conducir.','Para insomnio severo. Máxima desactivación del sistema nervioso.','Cuando necesitas activarte sin sobrecargar. Días de baja energía.'],
    backArrow:'←',
    // SOS static
    sosHdrTitle:'IDENTIFICACIÓN MÉDICA Y LEGAL',
    sosHdrSub:'Mostrar a policía, médico o personal de emergencia',
    sosBannerMain:'SOY AUTISTA (TEA)',
    sosRule1:'NO ME TOQUE SIN AVISAR PRIMERO',
    sosRule2:'NO ME GRITE NI ELEVE LA VOZ',
    sosRule3:'PERMÍTAME USAR AURICULARES',
    sosRule4:'DÉME ESPACIO — NO FUERCE CONTACTO VISUAL',
    sosIdHdr:'👤 Identificación del titular',
    sosNombreLbl:'NOMBRE COMPLETO',
    sosDocLbl:'DOCUMENTO',
    sosNacLbl:'NACIONALIDAD',
    cfgDocLbl:'DOCUMENTO DE IDENTIDAD (DNI/Pasaporte)',
    cfgNacLbl:'NACIONALIDAD',
    sosDiagLbl:'DIAGNÓSTICO',
    sosSangreLbl:'TIPO DE SANGRE',
    sosMedHdr:'🩺 Datos médicos',
    sosAlergLbl:'⚠️ ALERGIAS — NO ADMINISTRAR',
    sosMedActLbl:'MEDICACIÓN ACTIVA',
    sosInstHdr:'📋 Instrucciones de manejo',
    sosInst1:'No tocar sin avisar verbalmente primero',
    sosInst2:'No gritar ni elevar el tono de voz',
    sosInst3:'Hablar despacio, frases cortas, una instrucción a la vez',
    sosInst4:'Permitir auriculares y herramientas de regulación',
    sosInst5:'Dar tiempo para procesar. No presionar respuesta inmediata',
    sosCntHdr:'📞 Contacto de emergencia',
    // L1
    l1TomarBtn:'TOMAR',
    l1Step2:'Toma tu medicamento de crisis:',
    l1AvisarBtn:'Avisar a',
    // L3 validation
    l3ValTitle:'Hoy puede ser uno de esos días. Está bien.',
    l3Val1:'No ducharte hoy es una <b>decisión lógica de ahorro de energía</b>, no descuido.',
    l3Val2:'No contestar mensajes no te hace mala persona. Te hace alguien con batería al mínimo.',
    l3Val3:'No cocinar no es fracasar. Es adaptarte.',
    l3Val4:'No limpiar hoy no destruye tu espacio para siempre.',
    l3Val5:'No salir no es rendirse.',
    l3Val6:'Una sola cosa completada ya cuenta como victoria.',
    l3P1:'<b>Medicación.</b> Lo primero, sin negociar.',
    l3P2:'<b>Agua.</b> Mínimo un vaso ahora.',
    l3P3:'<b>Comida segura.</b> Una opción simple, puede ser una receta rápida.',
    l3P4:'<b>Diferir todo lo demás.</b> Todo. Nada más importa hoy.',
    // L4
    l4Act1:'<b>Contenido pasivo:</b> video, podcast, música sin esfuerzo de análisis.',
    l4Act2:'<b>Lectura conocida:</b> material ya leído antes o de interés propio.',
    l4Act3:'<b>Tareas mecánicas:</b> organizar, limpiar en silencio, ordenar archivos.',
    l4Act4:'<b>Paseo corto</b> sin objetivo ni itinerario.',
    l4Avoid1:'Decisiones importantes',
    l4Avoid2:'Conversaciones exigentes',
    l4Avoid3:'Compromisos nuevos',
    l4Avoid4:'Entornos ruidosos',
    // L5
    l5Act1:'<b>Estudio activo y aprendizaje</b> de material nuevo o complejo.',
    l5Act2:'<b>Trabajo creativo o técnico</b> de alta demanda cognitiva.',
    l5Act3:'<b>Interacción social breve</b> con personas conocidas (máx. 90 min).',
    l5Act4:'<b>Ejercicio o movimiento</b> con intensidad moderada-alta.',
    l5Cons1:'Define la duración de cada actividad <b>antes de comenzar</b>.',
    l5Cons2:'Prepara tu espacio de descanso antes de que termine la ventana.',
    l5Cons3:'La medicación sigue siendo prioritaria aunque estés bien.',
    // Cave
    caveTitle:'MODO CERO ESTÍMULOS',
    caveBody:'Sin ruido.<br>Sin luz.<br>Sin demandas.<br>Solo estar.',
    caveTap:'TAP PARA SALIR',
    // Scanner
    scanCalib:'CALIBRACIÓN INTEROCEPTIVA',
    scanTitle:'ESCÁNER CORPORAL',
    scanYes:'✓ SÍ',
    scanNo:'✗ NO',
    scanResult:'RESULTADO DEL ESCÁNER',
    // Profile info labels
    piSangreLbl:'SANGRE',
    piAlergiasLbl:'ALERGIAS',
    piCrisisLbl:'CRISIS',
    piDirLbl:'DIRECCIÓN',
    // Medication
    medTag:'RECORDATORIO MÉDICO',
    medTitle:'Alarmas de Medicación',
    medMantra:'La medicación no es opcional. Es parte del protocolo. Configura tus horarios una vez y el sistema te avisará.',
    medAddBtn:'➕ Añadir alarma',
    medNewAlarm:'Nueva alarma',
    medNoAlarms:'Sin alarmas configuradas',
    medNoAlarmsSub:'Añade tus horarios de medicación',
    medCalBtn:'📅 Ver calendario de tomas',
    // MedCal
    medCalTag:'HISTORIAL DE MEDICACIÓN',
    medCalTitle:'Calendario de tomas',
    medCalHowHdr:'📌 Cómo funciona',
    medCalHow:'Cada vez que tocas <b>✓ Entendido</b> en una alarma, ese día queda marcado como tomada. También puedes marcar o desmarcar un día tocándolo en el calendario. Si un día no confirmas, aparece en rojo. No es un juicio, es información.',
    // Deudas
    deudasTag:'MÓDULO FINANCIERO',
    deudasTitle:'COMPROMISOS FUTUROS',
    deudasMantraLbl:'Marco operativo',
    deudasEmpty:'Sin compromisos pendientes',
    deudasEmptySub:'Todos los bucles están cerrados.',
    deudasTotal:'Total por procesar',
    deudasHistTag:'HISTORIAL — BUCLES CERRADOS',
    // Comms
    commsTag:'COMUNICACIÓN AUMENTATIVA',
    commsTitle:'Tarjetas de Comunicación',
    // Nuevas funciones
    btnShareLoc: '📍 Compartir mi ubicación en vivo',
    btnExportPdf: '📄 Exportar Perfil a PDF',
    ccTag: 'MIS TARJETAS',
    ccBtnCreate: '➕ Crear',
    ccNewTitle: 'Nueva Tarjeta',
    ccBtnSave: 'Guardar',
    ccBtnCancel: 'Cancelar',
    kitTag: 'HERRAMIENTAS SENSORIALES',
    kitTitle: 'Kit de Supervivencia',
    kitDesc: 'Selección de herramientas probadas para la regulación del sistema nervioso.',
    kitDisclaimer: '*Al comprar desde estos enlaces, apoyas el desarrollo de NEURO-DOME sin costo extra para ti.',
    kitI1Title: 'Tapones Loop Experience',
    kitI1Desc: 'Reducen el ruido de fondo sin aislarte por completo. Ideales para supermercados o reuniones.',
    kitI2Title: 'Manta con Peso (Weighted Blanket)',
    kitI2Desc: 'Presión profunda constante (DTP). Ayuda a regular el sistema nervioso y mejorar el sueño.',
    kitI3Title: 'Fidget Cube / Tangle',
    kitI3Desc: 'Herramienta de stimming silenciosa. Ayuda a canalizar la ansiedad motora en público.',
    kitI4Title: 'Gafas FL-41 (Sensibilidad a la luz)',
    kitI4Desc: 'Bloquean la luz azul/verde de pantallas y luces fluorescentes que causan migrañas y sobrecarga.',
    kitBtnAmazon: 'Ver en Amazon ↗',
    spoonTag: 'GESTIÓN DE ENERGÍA',
    spoonTitle: 'Mis Cucharas',
    spoonCardHd: 'Teoría de las Cucharas',
    spoonCardBd: 'Cada cuchara representa una unidad de energía física y mental. Tocar una cuchara la "gasta". Úsalo para visualizar cuánta energía te queda hoy y evitar el burnout.',
    spoonBtnRm: '- Quitar cuchara total',
    spoonBtnAdd: '+ Añadir cuchara total',
    spoonStable: 'Energía estable. Tienes {n} cucharas.',
    spoonCaution: 'Precaución. Te quedan {n} cucharas.',
    spoonCritical: 'Batería crítica. Te quedan {n} cucharas. Prioriza el descanso.',
    lblPasoapaso: 'PASO A PASO (IA)',
    lblGuiones: 'GUIONES (IA)',
    lblRegistro: 'REGISTRO',
    ovTareasTag: 'DISFUNCIÓN EJECUTIVA',
    ovTareasTitle: 'Desglosador de Tareas',
    ovTareasDesc: '¿Qué tarea te parece abrumadora ahora mismo? La IA la dividirá en pasos ridículamente pequeños.',
    ovTareasBtn: '✨ Desglosar con IA',
    ovGuionesTag: 'COMUNICACIÓN',
    ovGuionesTitle: 'Guiones Sociales',
    ovGuionesDesc: '¿Qué necesitas decir y a quién? La IA creará 3 opciones de mensajes para copiar y pegar.',
    ovGuionesBtn: '✨ Generar Guiones',
    btnCerrar: 'Cerrar',
    btnCucharas: '🥄 Cucharas',
    btnVolverTarjetas: '← Volver a tarjetas',
    commsTagEmergencia: 'EMERGENCIA',
    commsBtnEmergencia: '🏥 EMERGENCIA — llamar contacto',
    btnEntendidoCerrar: 'Entendido — Cerrar',
    btnCancelar: '✗ Cancelar',
    btnRegistrar: '✓ Registrar',
    btnGuardar: '✓ Guardar',
    hmAddDeuda: '➕ Añadir compromiso',
    hmModDeuda: '✏️ Modificar',
    hmHistDeuda: '📋 Historial',
    hmenuShare: 'Compartir App',
    shareTitle: 'NEURO-DOME',
    shareText: 'Mira NEURO-DOME, una app de regulación y apoyo para personas autistas.',
  },
  en: {
    appName: 'NEURO-DOME',
    sosBtnLabel: '🆘 SOS — MEDICAL & LEGAL ID',
    scannerLbl: 'SCANNER', deudasLbl: 'DEBTS', iaHoyLbl: 'AI TODAY', tonosLbl: 'ISO TONES',
    nivelTag: 'SELECT YOUR CURRENT LEVEL',
    n1title:'SEVERE CRISIS', n1sub:'Meltdown · Shutdown · Not functioning',
    n2title:'DISSOCIATION / AGNOSIA', n2sub:'I don\'t recognize my surroundings',
    n3title:'LOW ENERGY', n3sub:'Cognitive fatigue · Active burnout',
    n4title:'REDUCED FUNCTIONAL', n4sub:'Simple tasks and routines',
    n5title:'OPTIMAL STATE', n5sub:'Functional window open',
    tarjetas:'🃏 Cards', cueva:'🕳️ Cave', alarmas:'💊 Alarms',
    miApoyo:'🐾 Emotional support', miObjeto:'🧸 Favorite object',
    batLabel:'My Social Battery',
    taxiTitle:'GO HOME BY TAXI', taxiSub:'One tap — your address is ready',
    // Setup
    setupHeroTitle:'My Support Profile',
    setupHint:'<b style="color:var(--text)">👋 Just 3 steps to start:</b> fill in the fields marked <b style="color:var(--red)">*</b> in <b>My identity</b>, <b>Emergency contact</b> and <b>Images</b>. You can fill the rest from <b>Settings ⚙️</b> whenever you want, no rush.',
    saveBtn:'SAVE AND CONTINUE',
    btnMoreProfile:'Complete my profile (optional)',
    btnHideAdvanced:'Hide advanced section',
    // SOS
    sosTitle:'AUTISTIC PERSON IN CRISIS',
    sosDireccionLbl:'📍 HOME ADDRESS',
    sosContactoLbl:'MAIN CONTACT',
    sosWaBtn:'📱 Emergency WhatsApp',
    sosCallBtn:'📞 CALL CONTACT NOW',
    // L1
    l1Tag:'ACTIVE PROTOCOL', l1H1:'LEVEL 1 — CRISIS',
    l1ProtoHd:'📋 Crisis protocol — one action at a time',
    l1Step1:'<b>Sit or lie on the floor now.</b> No matter where you are.',
    l1Step3:'You don\'t have to talk. You don\'t have to reply to messages. <b>Authorized mutism.</b>',
    l1Step4:'Put on headphones. If you don\'t have any, cover your ears with your hands.',
    l1Step5:'Do not make any decisions now. <b>None.</b>',
    btnCaveMode:'🕳️ Cave Mode — zero stimuli',
    btnSafety:'⚠️ Vital safety protocol',
    // L2
    l2Tag:'REALITY ANCHORING', l2H1:'LEVEL 2 — DISSOCIATION',
    l2YourName:'YOUR NAME',
    l2WhoHd:'🪞 Who you are right now',
    l2HomeHd:'🏠 Your home is here',
    btnMaps:'🗺️ How to walk home',
    l2ContactRole:'EMERGENCY CONTACT',
    btnCall:'Call',
    l2AnchorHd:'⚓ Anchoring protocol — 4 steps',
    l2Step1:'<b>Apply something cold</b> to your wrists or face. Ice, cold water, cold can.',
    l2Step2:'<b>Deep pressure:</b> press your arms against your body or sit on the floor and feel the weight.',
    l2Step3:'<b>Touch the floor</b> with your hands. Describe the texture quietly: rough, smooth, cold.',
    l2Step4:'Find <b>a familiar object</b> in your pocket or bag. Hold it.',
    // L3
    l3Tag:'SURVIVAL MODE', l3H1:'LEVEL 3 — LOW ENERGY',
    l3MedsHd:'🪫 Registered medication',
    btnCalendar:'📅 Calendar',
    l3FoodHd:'🍽️ Safe food now',
    btnRecipes:'🥘 Make something simple — see recipes',
    l3ValidationHd:'✅ Operational validation',
    l3PriorityHd:'📋 Priorities — only these four',
    // L4
    l4Tag:'ECONOMY MODE', l4H1:'LEVEL 4 — FUNCTIONAL',
    l4AvailHd:'✅ Available activities now',
    l4AvoidHd:'🚫 Avoid',
    // L5
    l5Tag:'OPEN WINDOW', l5H1:'LEVEL 5 — OPTIMAL',
    l5ActsHd:'🚀 High-return activities',
    l5ConsHd:'🛡️ Conservation protocol',
    // Isochronic
    isoTitle:'Isochronic Tones',
    isoSubtitle:'NEUROLOGICAL REGULATION',
    isoAiBtn:'🧠 Get AI-personalized tone suggestions',
    isoWhat:'What are isochronic tones?',
    isoDesc:'They are rhythmic pulses of pure sound that synchronize brain waves without the need for headphones. Especially useful for autistic people: <b>they reduce nervous system hyperactivation</b>, aid sleep, and help exit blocked states. Listen at a low, comfortable volume.',
    tonePlay:'▶ Play', toneStop:'⏹ Stop', toneDurLabel:'Suggested duration:',
    toneNames:['Gamma — Soft Focus','Alpha — Active Calm','Schumann — Grounding','Theta — Sleep','Delta — Deep Sleep','Beta Low — Gentle Alert'],
    toneUses:['Transition from overload to gentle focus. Useful when you can\'t concentrate.','Relaxation without sleep. Ideal before a task requiring calm.','Natural frequency of the planet. Reduces deep anxiety and dysregulation.','For falling asleep or resting deeply. Do not use while driving.','For severe insomnia. Maximum nervous system deactivation.','When you need to activate without overwhelming. Low-energy days.'],
    backArrow:'←',
    // SOS static
    sosHdrTitle:'MEDICAL & LEGAL IDENTIFICATION',
    sosHdrSub:'Show to police, doctor or emergency personnel',
    sosBannerMain:'I AM AUTISTIC (ASD)',
    sosRule1:'DO NOT TOUCH ME WITHOUT WARNING FIRST',
    sosRule2:'DO NOT SHOUT OR RAISE YOUR VOICE',
    sosRule3:'ALLOW ME TO USE HEADPHONES',
    sosRule4:'GIVE ME SPACE — DO NOT FORCE EYE CONTACT',
    sosIdHdr:'👤 Person identification',
    sosNombreLbl:'FULL NAME',
    sosDocLbl:'DOCUMENT',
    sosNacLbl:'NATIONALITY',
    cfgDocLbl:'IDENTITY DOCUMENT (ID/Passport)',
    cfgNacLbl:'NATIONALITY',
    sosDiagLbl:'DIAGNOSIS',
    sosSangreLbl:'BLOOD TYPE',
    sosMedHdr:'🩺 Medical data',
    sosAlergLbl:'⚠️ ALLERGIES — DO NOT ADMINISTER',
    sosMedActLbl:'ACTIVE MEDICATION',
    sosInstHdr:'📋 Handling instructions',
    sosInst1:'Do not touch without verbal warning first',
    sosInst2:'Do not shout or raise your tone of voice',
    sosInst3:'Speak slowly, short sentences, one instruction at a time',
    sosInst4:'Allow headphones and regulation tools',
    sosInst5:'Allow time to process. Do not pressure for immediate response',
    sosCntHdr:'📞 Emergency contact',
    // L1
    l1TomarBtn:'TAKE',
    l1Step2:'Take your crisis medication:',
    l1AvisarBtn:'Alert',
    // L3 validation
    l3ValTitle:'Today might be one of those days. That\'s okay.',
    l3Val1:'Not showering today is a <b>logical energy-saving decision</b>, not negligence.',
    l3Val2:'Not replying to messages doesn\'t make you a bad person. It makes you someone running on minimum battery.',
    l3Val3:'Not cooking is not failing. It\'s adapting.',
    l3Val4:'Not cleaning today won\'t destroy your space forever.',
    l3Val5:'Not going out is not giving up.',
    l3Val6:'One single thing completed already counts as a victory.',
    l3P1:'<b>Medication.</b> First, non-negotiable.',
    l3P2:'<b>Water.</b> At least one glass now.',
    l3P3:'<b>Safe food.</b> A simple option, can be a quick recipe.',
    l3P4:'<b>Defer everything else.</b> Everything. Nothing else matters today.',
    // L4
    l4Act1:'<b>Passive content:</b> video, podcast, music without analysis effort.',
    l4Act2:'<b>Familiar reading:</b> material read before or of personal interest.',
    l4Act3:'<b>Mechanical tasks:</b> organize, clean silently, sort files.',
    l4Act4:'<b>Short walk</b> without goal or itinerary.',
    l4Avoid1:'Important decisions',
    l4Avoid2:'Demanding conversations',
    l4Avoid3:'New commitments',
    l4Avoid4:'Noisy environments',
    // L5
    l5Act1:'<b>Active study and learning</b> of new or complex material.',
    l5Act2:'<b>Creative or technical work</b> of high cognitive demand.',
    l5Act3:'<b>Brief social interaction</b> with known people (max. 90 min).',
    l5Act4:'<b>Exercise or movement</b> at moderate-high intensity.',
    l5Cons1:'Set the duration of each activity <b>before starting</b>.',
    l5Cons2:'Prepare your rest space before the window ends.',
    l5Cons3:'Medication remains a priority even when you\'re feeling well.',
    // Cave
    caveTitle:'ZERO STIMULI MODE',
    caveBody:'No noise.<br>No light.<br>No demands.<br>Just be.',
    caveTap:'TAP TO EXIT',
    // Scanner
    scanCalib:'INTEROCEPTIVE CALIBRATION',
    scanTitle:'BODY SCANNER',
    scanYes:'✓ YES',
    scanNo:'✗ NO',
    scanResult:'SCANNER RESULT',
    // Profile info labels
    piSangreLbl:'BLOOD',
    piAlergiasLbl:'ALLERGIES',
    piCrisisLbl:'CRISIS MED',
    piDirLbl:'ADDRESS',
    // Medication
    medTag:'MEDICAL REMINDER',
    medTitle:'Medication Alarms',
    medMantra:'Medication is not optional. It\'s part of the protocol. Set your schedules once and the system will remind you.',
    medAddBtn:'➕ Add alarm',
    medNewAlarm:'New alarm',
    medNoAlarms:'No alarms configured',
    medNoAlarmsSub:'Add your medication schedules',
    medCalBtn:'📅 View medication calendar',
    // MedCal
    medCalTag:'MEDICATION HISTORY',
    medCalTitle:'Medication calendar',
    medCalHowHdr:'📌 How it works',
    medCalHow:'Every time you tap <b>✓ Understood</b> on an alarm, that day is marked as taken. You can also tap a day on the calendar to mark/unmark it. If a day is not confirmed, it appears in red. Not a judgment, just information.',
    // Deudas
    deudasTag:'FINANCIAL MODULE',
    deudasTitle:'FUTURE COMMITMENTS',
    deudasMantraLbl:'Operating framework',
    deudasEmpty:'No pending commitments',
    deudasEmptySub:'All loops are closed.',
    deudasTotal:'Total to process',
    deudasHistTag:'HISTORY — CLOSED LOOPS',
    // Comms
    commsTag:'AUGMENTATIVE COMMUNICATION',
    commsTitle:'Communication Cards',
    // Nuevas funciones
    btnShareLoc: '📍 Share my live location',
    btnExportPdf: '📄 Export Profile to PDF',
    ccTag: 'MY CARDS',
    ccBtnCreate: '➕ Create',
    ccNewTitle: 'New Card',
    ccBtnSave: 'Save',
    ccBtnCancel: 'Cancel',
    kitTag: 'SENSORY TOOLS',
    kitTitle: 'Survival Kit',
    kitDesc: 'Selection of proven tools for nervous system regulation.',
    kitDisclaimer: '*By purchasing from these links, you support the development of NEURO-DOME at no extra cost to you.',
    kitI1Title: 'Loop Experience Earplugs',
    kitI1Desc: 'Reduce background noise without completely isolating you. Ideal for supermarkets or meetings.',
    kitI2Title: 'Weighted Blanket',
    kitI2Desc: 'Constant deep pressure (DTP). Helps regulate the nervous system and improve sleep.',
    kitI3Title: 'Fidget Cube / Tangle',
    kitI3Desc: 'Silent stimming tool. Helps channel motor anxiety in public.',
    kitI4Title: 'FL-41 Glasses (Light Sensitivity)',
    kitI4Desc: 'Block blue/green light from screens and fluorescent lights that cause migraines and overload.',
    kitBtnAmazon: 'View on Amazon ↗',
    spoonTag: 'ENERGY MANAGEMENT',
    spoonTitle: 'My Spoons',
    spoonCardHd: 'Spoon Theory',
    spoonCardBd: 'Each spoon represents a unit of physical and mental energy. Tapping a spoon "spends" it. Use this to visualize how much energy you have left today and avoid burnout.',
    spoonBtnRm: '- Remove total spoon',
    spoonBtnAdd: '+ Add total spoon',
    spoonStable: 'Stable energy. You have {n} spoons.',
    spoonCaution: 'Caution. You have {n} spoons left.',
    spoonCritical: 'Critical battery. You have {n} spoons left. Prioritize rest.',
    lblPasoapaso: 'STEP BY STEP (AI)',
    lblGuiones: 'SCRIPTS (AI)',
    lblRegistro: 'TRACKER',
    ovTareasTag: 'EXECUTIVE DYSFUNCTION',
    ovTareasTitle: 'Task Breakdown',
    ovTareasDesc: 'What task feels overwhelming right now? The AI will break it down into ridiculously small steps.',
    ovTareasBtn: '✨ Break down with AI',
    ovGuionesTag: 'COMMUNICATION',
    ovGuionesTitle: 'Social Scripts',
    ovGuionesDesc: 'What do you need to say and to whom? The AI will create 3 message options to copy and paste.',
    ovGuionesBtn: '✨ Generate Scripts',
    btnCerrar: 'Close',
    btnCucharas: '🥄 Spoons',
    btnVolverTarjetas: '← Back to cards',
    commsTagEmergencia: 'EMERGENCY',
    commsBtnEmergencia: '🏥 EMERGENCY — call contact',
    btnEntendidoCerrar: 'Understood — Close',
    btnCancelar: '✗ Cancel',
    btnRegistrar: '✓ Register',
    btnGuardar: '✓ Save',
    hmAddDeuda: '➕ Add commitment',
    hmModDeuda: '✏️ Modify',
    hmHistDeuda: '📋 History',
    hmenuShare: 'Share App',
    shareTitle: 'NEURO-DOME',
    shareText: 'Check out NEURO-DOME, an app for autism regulation and support.',
  }
};

let LANG = localStorage.getItem('cfg_lang');
if (!LANG) {
  const userLang = navigator.language || navigator.userLanguage;
  if (userLang.toLowerCase().startsWith('es')) {
    LANG = 'es';
  } else {
    LANG = 'en';
  }
}

function t(key) { return (T[LANG] && T[LANG][key] !== undefined) ? T[LANG][key] : (T.es[key] || key); }

function setLang(lang) {
  LANG = lang;
  localStorage.setItem('cfg_lang', lang);
  applyLang();
}

function applyLang() {
  const L = T[LANG] || T.es;
  const isEn = LANG === 'en';
  function st(id, val) { const e = document.getElementById(id); if (e && val !== undefined) e.textContent = val; }
  function sh(id, val) { const e = document.getElementById(id); if (e && val !== undefined) e.innerHTML = val; }

  // Home
  document.querySelectorAll('.h-appname').forEach(el => el.innerHTML = 'NEURO<span style="color:var(--text3)">-DOME</span>');
  st('bat-label', L.batLabel);
  st('sos-main-btn', L.sosBtnLabel);
  st('lbl-scanner', L.scannerLbl); st('lbl-deudas', L.deudasLbl);
  st('lbl-ia', L.iaHoyLbl); st('lbl-tonos', L.tonosLbl);
  st('tag-nivel', L.nivelTag);
  st('n1-title', L.n1title); st('n1-sub', L.n1sub);
  st('n2-title', L.n2title); st('n2-sub', L.n2sub);
  st('n3-title', L.n3title); st('n3-sub', L.n3sub);
  st('n4-title', L.n4title); st('n4-sub', L.n4sub);
  st('n5-title', L.n5title); st('n5-sub', L.n5sub);
  st('btn-tarjetas', L.tarjetas); st('btn-cueva', L.cueva); st('btn-alarmas', L.alarmas);
  st('btn-apoyo', L.miApoyo); st('btn-objeto', L.miObjeto);
  // Taxi
  st('taxi-btn-title', L.taxiTitle); st('taxi-btn-sub', L.taxiSub);
  
  // Nuevas funciones
  st('btn-share-loc', L.btnShareLoc);
  st('btn-export-pdf', L.btnExportPdf);
  st('cc-tag', L.ccTag);
  st('cc-btn-create', L.ccBtnCreate);
  st('cc-new-title', L.ccNewTitle);
  st('cc-btn-save', L.ccBtnSave);
  st('cc-btn-cancel', L.ccBtnCancel);
  
  const ccIcon = document.getElementById('cc-icon');
  if (ccIcon) ccIcon.placeholder = isEn ? 'Emoji (e.g. 🐶)' : 'Emoji (ej: 🐶)';
  const ccTitle = document.getElementById('cc-title');
  if (ccTitle) ccTitle.placeholder = isEn ? 'Short title' : 'Título corto';
  const ccText = document.getElementById('cc-text');
  if (ccText) ccText.placeholder = isEn ? 'Main message (e.g. I need my service dog)' : 'Mensaje principal (ej: Necesito a mi perro de asistencia)';
  const ccSub = document.getElementById('cc-sub');
  if (ccSub) ccSub.placeholder = isEn ? 'Secondary instruction (optional)' : 'Instrucción secundaria (opcional)';
  
  st('kit-tag', L.kitTag);
  st('kit-title', L.kitTitle);
  st('kit-desc', L.kitDesc);
  st('kit-disclaimer', L.kitDisclaimer);
  st('kit-i1-title', L.kitI1Title);
  st('kit-i1-desc', L.kitI1Desc);
  st('kit-i2-title', L.kitI2Title);
  st('kit-i2-desc', L.kitI2Desc);
  st('kit-i3-title', L.kitI3Title);
  st('kit-i3-desc', L.kitI3Desc);
  st('kit-i4-title', L.kitI4Title);
  st('kit-i4-desc', L.kitI4Desc);
  st('kit-i1-btn', L.kitBtnAmazon);
  st('kit-i2-btn', L.kitBtnAmazon);
  st('kit-i3-btn', L.kitBtnAmazon);
  st('kit-i4-btn', L.kitBtnAmazon);
  st('spoon-tag', L.spoonTag);
  st('spoon-title', L.spoonTitle);
  st('spoon-card-hd', L.spoonCardHd);
  st('spoon-card-bd', L.spoonCardBd);
  st('spoon-btn-rm', L.spoonBtnRm);
  st('spoon-btn-add', L.spoonBtnAdd);
  
  st('lbl-pasoapaso', L.lblPasoapaso);
  st('lbl-guiones', L.lblGuiones);
  st('lbl-registro', L.lblRegistro);
  st('ov-tareas-tag', L.ovTareasTag);
  st('ov-tareas-title', L.ovTareasTitle);
  st('ov-tareas-desc', L.ovTareasDesc);
  st('btn-generar-tarea', L.ovTareasBtn);
  st('ov-guiones-tag', L.ovGuionesTag);
  st('ov-guiones-title', L.ovGuionesTitle);
  st('ov-guiones-desc', L.ovGuionesDesc);
  st('btn-generar-guion', L.ovGuionesBtn);
  st('btn-cerrar-tarea', L.btnCerrar);
  st('btn-cerrar-guion', L.btnCerrar);
  st('btn-cerrar-risk', L.btnCerrar);
  st('btn-cucharas', L.btnCucharas);
  st('btn-volver-tarjetas', L.btnVolverTarjetas);
  st('comms-tag-emergencia', L.commsTagEmergencia);
  st('comms-btn-emergencia', L.commsBtnEmergencia);
  st('btn-cerrar-ia', L.btnEntendidoCerrar);
  st('btn-cancelar-deuda', L.btnCancelar);
  st('btn-cancelar-alarma', L.btnCancelar);
  st('btn-registrar-deuda', L.btnRegistrar);
  st('btn-guardar-alarma', L.btnGuardar);
  st('hm-add-deuda', L.hmAddDeuda);
  st('hm-mod-deuda', L.hmModDeuda);
  st('hm-hist-deuda', L.hmHistDeuda);
  
  const muteBtn = document.getElementById('mute-btn-floating');
  if (muteBtn) muteBtn.title = isEn ? 'Low Stimulation Mode' : 'Modo Baja Estimulación';
  
  const inputTarea = document.getElementById('input-tarea-ia');
  if (inputTarea) inputTarea.placeholder = isEn ? 'e.g. Clean the kitchen, make a call...' : 'Ej: Limpiar la cocina, hacer una llamada...';
  const inputGuion = document.getElementById('input-guion-ia');
  if (inputGuion) inputGuion.placeholder = isEn ? 'e.g. I need to tell my boss I am overloaded but sound professional...' : 'Ej: Necesito decirle a mi jefe que estoy sobrecargada pero sonar profesional...';
  
  if (typeof renderSpoons === 'function') renderSpoons();
  if (typeof renderCustomCards === 'function') renderCustomCards();
  
  // Hamburger
  st('hmenu-perfil',  isEn ? 'Profile'       : 'Perfil');
  st('hmenu-config',  isEn ? 'Settings'      : 'Configuración');
  st('hmenu-sos',     isEn ? 'SOS'           : 'SOS');
  st('hmenu-scanner', isEn ? 'Body Scanner'  : 'Escáner Corporal');
  st('hmenu-l1',      isEn ? 'Level 1 — Crisis'       : 'Nivel 1 — Crisis');
  st('hmenu-l2',      isEn ? 'Level 2 — Dissociation' : 'Nivel 2 — Disociación');
  st('hmenu-l3',      isEn ? 'Level 3 — Low Energy'   : 'Nivel 3 — Baja Energía');
  st('hmenu-l4',      isEn ? 'Level 4 — Functional'   : 'Nivel 4 — Funcional');
  st('hmenu-l5',      isEn ? 'Level 5 — Optimal'      : 'Nivel 5 — Óptimo');
  st('hmenu-tarjetas',isEn ? 'Cards'         : 'Tarjetas');
  st('hmenu-alarmas', isEn ? 'Alarms'        : 'Alarmas');
  st('hmenu-deudas',  isEn ? 'Finances'      : 'Deudas');
  st('hmenu-tonos',   isEn ? 'ISO Tones'     : 'Tonos ISO');
  st('hmenu-cueva',   isEn ? 'Cave Mode'     : 'Cueva');
  st('hmenu-kit',     isEn ? 'Survival Kit'  : 'Kit de Supervivencia');
  st('hmenu-cucharas',isEn ? 'My Spoons'     : 'Mis Cucharas');
  st('hmenu-sub',     isEn ? 'Subscription'  : 'Suscripción');
  st('hmenu-share',   isEn ? 'Share App'     : 'Compartir App');
  st('hmenu-lang-lbl',isEn ? 'LANGUAGE'      : 'IDIOMA');
  // Subscription screen
  st('sub-hdr-title',  isEn ? 'Subscription'   : 'Suscripción');
  st('sub-hero-title', isEn ? 'NEURO-DOME Pro' : 'NEURO-DOME Pro');
  st('sub-hero-sub',   isEn ? 'Support app development and unlock advanced features designed for your nervous system.' : 'Apoya el desarrollo de la app y desbloquea funciones avanzadas diseñadas para tu sistema nervioso.');
  st('sub-free-name',  isEn ? 'Free Plan'      : 'Plan Gratuito');
  st('sub-forever',    isEn ? '/ forever'      : '/ siempre');
  st('sub-free-f1',    isEn ? 'SOS & medical ID'            : 'SOS y credencial médica');
  st('sub-free-f2',    isEn ? 'Regulation levels N1–N5'     : 'Niveles de regulación N1–N5');
  st('sub-free-f3',    isEn ? 'Body scanner'                : 'Escáner corporal');
  st('sub-free-f4',    isEn ? 'Communication cards'         : 'Tarjetas de comunicación');
  st('sub-free-f5',    isEn ? 'Medication alarms'           : 'Alarmas de medicación');
  st('sub-free-f6',    isEn ? 'Taxi home'                   : 'Taxi a casa');
  st('sub-free-btn',   isEn ? 'Current plan'               : 'Plan actual');
  st('sub-pro-badge',  isEn ? '✦ RECOMMENDED'              : '✦ RECOMENDADO');
  st('sub-pro-name',   isEn ? 'Pro Plan'                   : 'Plan Pro');
  st('sub-per-month',  isEn ? '/ month'                    : '/ mes');
  st('sub-pro-f1',     isEn ? 'Everything in Free included'         : 'Todo el Plan Gratuito incluido');
  st('sub-pro-f2',     isEn ? 'Unlimited personalized AI — advice adapted to your profile' : 'IA personalizada sin límites — consejos adaptados a tu perfil');
  st('sub-pro-f3',     isEn ? 'Safe food & recipes with AI'         : 'Recetas y alimentación segura con IA');
  st('sub-pro-f4',     isEn ? 'Emotional companion (pet / regulation object with AI)'  : 'Compañero emocional (mascota / objeto de regulación con IA)');
  st('sub-pro-f5',     isEn ? 'AI-personalized isochronic tones'    : 'Tonos isocrónicos personalizados con IA');
  st('sub-pro-f6',     isEn ? 'Priority access to new features'     : 'Acceso prioritario a nuevas funciones');
  st('sub-pro-f7',     isEn ? 'You support the app\'s development ♾️' : 'Apoyas el desarrollo de la app ♾️');
  st('sub-pro-btn',    isEn ? '✦ Subscribe to Pro'                  : '✦ Suscribirse a Pro');
  st('sub-legal',      isEn ? 'Secure payment. Cancel anytime.\nNEURO-DOME by Fabiola Aponte — all rights reserved.' : 'Pago seguro. Cancela cuando quieras.\nNEURO-DOME by Fabiola Aponte — todos los derechos reservados.');
  // Profile screen
  st('profile-hdr-title', isEn ? 'My Profile' : 'Mi Perfil');
  const piEditBtn = document.getElementById('pi-edit-btn');
  if (piEditBtn) piEditBtn.textContent = isEn ? '✏️ Edit profile' : '✏️ Editar perfil';
  const piLbl = document.getElementById('pi-lang-label');
  if (piLbl) piLbl.textContent = '🌐 Idioma / Language';
  // Setup
  st('setup-hero-title', L.setupHeroTitle);
  sh('setup-hint-text', L.setupHint);
  const moreLbl = document.getElementById('setup-more-label');
  if (moreLbl) {
    const adv = document.getElementById('advanced-section');
    const isOpen = adv && adv.style.display === 'block';
    moreLbl.textContent = isOpen ? L.btnHideAdvanced : L.btnMoreProfile;
  }
  document.querySelectorAll('.save-cfg-btn').forEach(b => b.innerHTML = `<span>${L.saveBtn}</span>`);
  // SOS
  st('sos-main-title', L.sosTitle);
  const sosDirLbl = document.getElementById('sos-dir-lbl'); if (sosDirLbl) sosDirLbl.textContent = L.sosDireccionLbl;
  const sosCnLbl  = document.getElementById('sos-cn-lbl');  if (sosCnLbl)  sosCnLbl.textContent  = L.sosContactoLbl;
  st('sos-wa-btn-txt', L.sosWaBtn); st('sos-call-btn-txt', L.sosCallBtn);
  // L1
  st('l1-tag', L.l1Tag); st('l1-h1', L.l1H1);
  st('l1-proto-hd', L.l1ProtoHd);
  sh('l1-step1', L.l1Step1);
  sh('l1-step3', L.l1Step3);
  sh('l1-step4', L.l1Step4);
  sh('l1-step5', L.l1Step5);
  st('btn-cave-mode', L.btnCaveMode);
  st('btn-safety', L.btnSafety);
  // L2
  st('l2-tag', L.l2Tag); st('l2-h1', L.l2H1);
  st('l2-your-name', L.l2YourName);
  st('l2-who-hd', L.l2WhoHd);
  st('l2-home-hd', L.l2HomeHd);
  st('btn-maps', L.btnMaps);
  st('l2-contact-role', L.l2ContactRole);
  st('btn-llamar', L.btnCall);
  st('l2-anchor-hd', L.l2AnchorHd);
  sh('l2-step1', L.l2Step1); sh('l2-step2', L.l2Step2);
  sh('l2-step3', L.l2Step3); sh('l2-step4', L.l2Step4);
  // L3
  st('l3-tag', L.l3Tag); st('l3-h1', L.l3H1);
  st('l3-meds-hd', L.l3MedsHd);
  st('btn-calendar', L.btnCalendar);
  st('l3-food-hd', L.l3FoodHd);
  const recipeBtn = document.getElementById('btn-recipes');
  if (recipeBtn) recipeBtn.textContent = L.btnRecipes;
  st('l3-validation-hd', L.l3ValidationHd);
  st('l3-priority-hd', L.l3PriorityHd);
  // L4
  st('l4-tag', L.l4Tag); st('l4-h1', L.l4H1);
  st('l4-avail-hd', L.l4AvailHd);
  st('l4-avoid-hd', L.l4AvoidHd);
  // L5
  st('l5-tag', L.l5Tag); st('l5-h1', L.l5H1);
  st('l5-acts-hd', L.l5ActsHd);
  st('l5-cons-hd', L.l5ConsHd);
  // Isochronic
  st('iso-title-txt', L.isoTitle); st('iso-subtitle-txt', L.isoSubtitle);
  st('iso-ai-btn-txt', L.isoAiBtn); st('iso-what-txt', L.isoWhat);
  const isoDescEl = document.getElementById('iso-desc-txt'); if (isoDescEl) isoDescEl.innerHTML = L.isoDesc;
  // Single-flag toggle buttons
  // Profile lang buttons sync
  document.querySelectorAll('.lang-pill-btn, .profile-lang-btn, .setup-lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === LANG);
  });
  // ── Sync lang slider toggles ──
  syncLangSliders();
  // Lang pill buttons (profile screen)
  document.querySelectorAll('.lang-pill-btn, .profile-lang-btn, .setup-lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === LANG);
  });
  // ── data-i18n: translate ALL tagged elements ──
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = L[key];
    if (val !== undefined) el.innerHTML = val;
  });

  // Re-render isochronic list if visible
  const isoList = document.getElementById('iso-tones-list');
  if (isoList && isoList.children.length > 0) { isoList.innerHTML = ''; initIsoTones(); }
  // Sync theme labels with current language
  applyThemeLabels();
}

function setText(id, val) { const e = document.getElementById(id); if (e) e.textContent = val; }
function setLbl(id, val)  { const e = document.getElementById(id); if (e) e.textContent = val; }

// ═══════════════════════════════════════
// SAVE CONFIG
// ═══════════════════════════════════════
function saveConfig() {
  const required = [
    { id:'cfg-nombre', errId:'err-nombre' },
    { id:'cfg-cn',     errId:'err-cn'     },
    { id:'cfg-ct',     errId:'err-ct'     },
  ];
  let valid = true;
  required.forEach(({ id, errId }) => {
    const el = document.getElementById(id);
    const err = document.getElementById(errId);
    if (!el) return;
    if (!el.value.trim()) {
      el.classList.add('error');
      if (err) err.classList.add('visible');
      valid = false;
      const body = el.closest('.acc-body');
      const trigger = body?.previousElementSibling;
      if (body && !body.classList.contains('open')) {
        body.classList.add('open');
        body.style.display = 'block';
        trigger?.classList.add('open');
      }
    } else {
      el.classList.remove('error');
      if (err) err.classList.remove('visible');
    }
  });
  if (!valid) {
    document.querySelector('.sfield input.error')?.scrollIntoView({ behavior:'smooth', block:'center' });
    return;
  }

  const map = {
    nombre:'cfg-nombre', cn:'cfg-cn', ct:'cfg-ct',
    d1:'cfg-d1', d2:'cfg-d2', d3:'cfg-d3', d4:'cfg-d4', pais:'cfg-pais',
    nacionalidad:'cfg-nac', documento:'cfg-doc',
    mc:'cfg-mc', md:'cfg-md', comida:'cfg-comida',
    sangre:'cfg-sangre', alergias:'cfg-alergias',
    hiper:'cfg-hiper', hipo:'cfg-hipo', triggers:'cfg-triggers',
    intereses:'cfg-intereses',
    ocupacion:'cfg-ocupacion', horas:'cfg-horas', retos:'cfg-retos',
    apoyoRel:'cfg-apoyo-rel',
    petName:'cfg-pet-name', petType:'cfg-pet-type', petDesc:'cfg-pet-desc',
    objName:'cfg-obj-name', objDesc:'cfg-obj-desc', objLocation:'cfg-obj-location',
    lugarFijo:'cfg-lugar-fijo', rutas:'cfg-rutas', rutaCambio:'cfg-ruta-cambio',
    rituales:'cfg-rituales', peculiaridades:'cfg-peculiaridades',
    objetosSalida:'cfg-objetos-salida', texturasRopa:'cfg-texturas-ropa', stimming:'cfg-stimming',
    taxiApp:'cfg-taxi-app', taxiMsg:'cfg-taxi-msg'
  };
  Object.entries(map).forEach(([k, id]) => {
    const el = document.getElementById(id);
    if (el) { C[k] = el.value.trim(); localStorage.setItem(KEYS[k], C[k]); }
  });
  chatHistory = [];
  applyC();
  go('home');
}

function openSettings() {
  try {
    const map = {
      nombre:'cfg-nombre', cn:'cfg-cn', ct:'cfg-ct',
      d1:'cfg-d1', d2:'cfg-d2', d3:'cfg-d3', d4:'cfg-d4', pais:'cfg-pais',
      nacionalidad:'cfg-nac', documento:'cfg-doc',
      mc:'cfg-mc', md:'cfg-md', comida:'cfg-comida',
      sangre:'cfg-sangre', alergias:'cfg-alergias',
      hiper:'cfg-hiper', hipo:'cfg-hipo', triggers:'cfg-triggers',
      intereses:'cfg-intereses',
      ocupacion:'cfg-ocupacion', horas:'cfg-horas', retos:'cfg-retos',
      apoyoRel:'cfg-apoyo-rel',
      petName:'cfg-pet-name', petType:'cfg-pet-type', petDesc:'cfg-pet-desc',
      objName:'cfg-obj-name', objDesc:'cfg-obj-desc', objLocation:'cfg-obj-location',
      lugarFijo:'cfg-lugar-fijo', rutas:'cfg-rutas', rutaCambio:'cfg-ruta-cambio',
      rituales:'cfg-rituales', peculiaridades:'cfg-peculiaridades',
      objetosSalida:'cfg-objetos-salida', texturasRopa:'cfg-texturas-ropa', stimming:'cfg-stimming',
      taxiApp:'cfg-taxi-app', taxiMsg:'cfg-taxi-msg'
    };
    Object.entries(map).forEach(([k, id]) => { const el = document.getElementById(id); if (el) el.value = C[k] || ''; });
    if (C.imgUsuario)   setFilePreview('usuario',  C.imgUsuario);
    if (C.imgUbicacion) setFilePreview('ubicacion', C.imgUbicacion);
    if (C.imgContacto)  setFilePreview('contacto',  C.imgContacto);
    if (C.imgMeds)      setFilePreview('meds',       C.imgMeds);
    if (C.imgPet)       setFilePreview('pet',        C.imgPet);
    if (C.imgObjeto)    setFilePreview('objeto',     C.imgObjeto);
    if (C.imgDiag && typeof C.imgDiag === 'string') {
      const fn = document.getElementById('diag-filename');
      if (fn) fn.textContent = C.imgDiag.startsWith('pdf:') ? `✓ ${C.imgDiag.slice(4)}` : '✓ Imagen cargada';
      const prev = document.getElementById('prev-diagnostico');
      if (prev && !C.imgDiag.startsWith('pdf:')) prev.innerHTML = `<img src="${C.imgDiag}" style="width:100%;height:100%;object-fit:cover;border-radius:7px">`;
    }
    document.querySelectorAll('.acc-trigger').forEach((t, i) => {
      const body = t.nextElementSibling;
      if (!body) return;
      if (i === 0) {
        t.classList.add('open'); body.classList.add('open'); body.style.display = 'block';
      } else {
        t.classList.remove('open'); body.classList.remove('open'); body.style.display = 'none';
      }
    });
    // Show all accordions when coming from Settings (not first setup)
    const sb2 = document.querySelector('.setup-body');
    if (sb2) sb2.classList.add('show-all');
    const adv2 = document.getElementById('advanced-section');
    if (adv2) adv2.style.display = 'flex';
    const showMoreBtn = document.getElementById('setup-show-more');
    if (showMoreBtn) showMoreBtn.style.display = 'none';
    go('setup', false);
  } catch(e) {
    console.error('Error in openSettings:', e);
    go('setup', false);
  }
}

// ═══════════════════════════════════════
// FILE UPLOAD — Base64 → localStorage
// ═══════════════════════════════════════
function handleFileUpload(key, input) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const b64 = e.target.result;
    const keyMap = { usuario:'imgUsuario', ubicacion:'imgUbicacion', contacto:'imgContacto', meds:'imgMeds', pet:'imgPet' };
    const ck = keyMap[key];
    if (!ck) return;
    C[ck] = b64;
    localStorage.setItem(KEYS[ck], b64);
    setFilePreview(key, b64);
    applyC();
  };
  reader.readAsDataURL(file);
}

function setFilePreview(key, src) {
  const el = document.getElementById('prev-' + key);
  if (!el) return;
  el.innerHTML = src
    ? `<img src="${src}" style="width:100%;height:100%;object-fit:cover;border-radius:7px">`
    : '';
}

// ═══════════════════════════════════════
// APPLY CONFIG TO ALL SCREENS
// ═══════════════════════════════════════
function setT(id, v) { const el = document.getElementById(id); if (el) el.textContent = v || '—'; }
function setImgEl(imgId, wrapId, src) {
  const img = document.getElementById(imgId), wrap = document.getElementById(wrapId);
  if (!img || !wrap) return;
  if (src) { img.src = src; wrap.style.display = 'block'; }
  else { wrap.style.display = 'none'; }
}
function setAvEl(id, src, fallback) {
  const el = document.getElementById(id); if (!el) return;
  el.innerHTML = src
    ? `<img src="${src}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" onerror="this.parentElement.textContent='${fallback}'">`
    : fallback;
}

function applyC() {
  const n  = C.nombre  || 'Usuario';
  const cn = C.cn      || 'Contacto';
  const mc = C.mc      || 'Medicamento de crisis';
  const md = C.md      || 'Medicamento diario';

  // Home — solo primer nombre
  const parts = (C.nombre || '').trim().split(/\s+/);
  const firstName = parts[0] || '—';
  setT('home-name', firstName);

  // Profile screen
  setT('profile-name-full', C.nombre || '—');
  setAvEl('profile-av', C.imgUsuario, '🧑');
  setT('pi-sangre', C.sangre || '—');
  setT('pi-alergias', C.alergias || '—');
  setT('pi-mc', C.mc || '—');
  const dirFull = [C.d1, C.d2, C.d3].filter(Boolean).join(', ');
  setT('pi-dir', dirFull + (C.d4 ? ` (${C.d4})` : '') || '—');

  // Taxi button visibility
  const taxiBtn = document.getElementById('taxi-home-btn');
  if (taxiBtn) taxiBtn.style.display = C.taxiApp ? 'flex' : 'none';

  // L1
  setT('lbl-mc', mc); setT('lbl-mc2', mc); setT('lbl-wa-cn', cn);
  setT('wa-preview', `"Tengo una crisis. Necesito tu contención y sentirme a salvo."`);
  setImgEl('l1-meds-img', 'l1-meds-wrap', C.imgMeds);

  // L2
  setT('l2-nombre', n); setAvEl('l2-av', C.imgUsuario, '🧑');
  setT('l2-dir', [C.d1, C.d2, C.d3].filter(Boolean).join(', ') || 'Dirección no configurada');
  setT('l2-ref', C.d4 || '');
  setImgEl('l2-casa-img', 'l2-casa-wrap', C.imgUbicacion);
  setAvEl('l2-c-av', C.imgContacto, '👤');
  setT('l2-c-nombre', cn);

  // L3
  setT('lbl-md', md);
  setImgEl('l3-meds-img', 'l3-meds-wrap', C.imgMeds);
  const pills = document.getElementById('l3-comida-pills');
  if (pills) {
    const foods = (C.comida || 'Yogurt, Frutos secos').split(',').map(f => f.trim()).filter(Boolean);
    pills.innerHTML = foods.map(f => `<div class="pill g">${f}</div>`).join('');
  }

  // SOS
  setT('sos-nombre', n);
  setT('sos-nacionalidad', C.nacionalidad || '—');
  setT('sos-documento', C.documento || '—');
  setT('sos-sangre', C.sangre || '—');
  setT('sos-alergias', C.alergias || 'Sin alergias registradas');
  setT('sos-medicacion', [C.mc, C.md].filter(v => v && v.length > 1).join(' · ') || 'No configurado');
  setT('sos-contacto-nombre', cn);
  setT('sos-contacto-tel', C.ct || '—');
  setT('sos-direccion', [C.d1, C.d2, C.d3].filter(Boolean).join(', ') || '—');
  setT('sos-referencia', C.d4 || '');
  setAvEl('sos-avatar',   C.imgUsuario,  '🧑');
  setAvEl('sos-c-avatar', C.imgContacto, '👤');

  // Overlay
  setT('ov-cn', cn);

  // Btn tomar
  const btn = document.getElementById('btn-tomar');
  if (btn && !btn.disabled) btn.innerHTML = `💊 TOMAR <span id="lbl-mc">${mc}</span>`;

  // Apply current language
  applyLang();
}

// ═══════════════════════════════════════
// NAVIGATION — con historial y gestos
// ═══════════════════════════════════════
let caveInt = null;
const navHistory = [];

function go(id, addHistory = true) {
  const current = document.querySelector('.screen.active');
  const currentId = current?.id?.replace('screen-', '');
  if (addHistory && currentId && currentId !== id) navHistory.push(currentId);

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');

  if (id === 'cave')       startCave();
  else                     clearInterval(caveInt);
  if (id === 'scanner')    initScanner();
  if (id === 'deudas')     renderDeudas();
  if (id === 'medication') renderAlarms();
  if (id === 'medcal')     initMedCal();
  if (id === 'isochronic') initIsoTones();
  if (id === 'registro')   renderRegistro();
  if (id === 'l1') {
    const b = document.getElementById('btn-tomar');
    if (b) { b.style.background = ''; b.disabled = false; b.innerHTML = `💊 TOMAR <span id="lbl-mc">${C.mc||'MEDICAMENTO'}</span>`; }
    setTimeout(() => triggerIaPopup('crisis'), 600);
  }
  if (id === 'l2') setTimeout(() => triggerIaPopup('disociacion'), 600);
  if (id === 'l3') setTimeout(() => triggerIaPopup('energia'), 800);
  document.getElementById('hamburger-menu')?.classList.remove('open');
  // Force layout repaint (fixes mobile rendering issues)
  const activeScreen = document.getElementById('screen-' + id);
  if (activeScreen) { void activeScreen.offsetHeight; }
}

function goBack() {
  if (navHistory.length > 0) {
    const prev = navHistory.pop();
    go(prev, false);
  } else {
    go('home', false);
  }
}

// ─── HOME MENU ───────────────────────────
// ─── SETUP ADVANCED SECTION TOGGLE ──────
function toggleAdvancedSetup() {
  const body = document.querySelector('.setup-body');
  const adv  = document.getElementById('advanced-section');
  const icon = document.getElementById('setup-more-icon');
  const lbl  = document.getElementById('setup-more-label');
  const btn  = document.getElementById('setup-show-more');
  if (!body) return;
  const isOpen = body.classList.contains('show-all');
  if (isOpen) {
    body.classList.remove('show-all');
    if (adv)  adv.style.display = 'none';
    if (icon) icon.textContent = '＋';
    if (lbl)  lbl.textContent = T[LANG].btnMoreProfile || 'Completar mi perfil (opcional)';
    if (btn)  btn.style.borderStyle = 'dashed';
  } else {
    body.classList.add('show-all');
    if (adv)  adv.style.display = 'flex';
    if (icon) icon.textContent = '－';
    if (lbl)  lbl.textContent = T[LANG].btnHideAdvanced || 'Ocultar sección avanzada';
    if (btn)  btn.style.borderStyle = 'solid';
    if (adv)  setTimeout(() => adv.scrollIntoView({ behavior:'smooth', block:'start' }), 50);
  }
}

// ══════════════════════════════════════════════
// THEME ENGINE — dark / light / rainbow
// ══════════════════════════════════════════════
let THEME = localStorage.getItem('cfg_theme') || 'dark';

function setTheme(theme) {
  THEME = theme;
  localStorage.setItem('cfg_theme', theme);
  applyTheme();
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', THEME);
  // Update active state on buttons
  ['dark','light','rainbow'].forEach(t => {
    const btn = document.getElementById('theme-btn-' + t);
    if (btn) btn.classList.toggle('active', THEME === t);
  });
}

function toggleAppearanceSubmenu() {
  const sub   = document.getElementById('appear-submenu');
  const arrow = document.getElementById('appear-arrow');
  if (!sub) return;
  const isOpen = sub.classList.contains('open');
  sub.classList.toggle('open', !isOpen);
  if (arrow) arrow.classList.toggle('open', !isOpen);
}

// Translate theme labels
function applyThemeLabels() {
  const isEn = LANG === 'en';
  const st = (id, v) => { const e = document.getElementById(id); if(e) e.textContent = v; };
  st('hmenu-appear-lbl',   isEn ? 'VISUAL APPEARANCE'  : 'APARIENCIA VISUAL');
  st('theme-lbl-dark',     isEn ? 'Dark Mode'          : 'Modo Oscuro');
  st('theme-lbl-light',    isEn ? 'Light Mode'         : 'Modo Claro');
  st('theme-lbl-rainbow',  isEn ? 'Rainbow Mode ♾️'    : 'Modo Arcoíris ♾️');
  st('hmenu-config-direct',isEn ? 'Profile settings'   : 'Ajustes del perfil');
}

// ── Sliding language toggle (shared: setup + hamburger) ──
function toggleLangSlider() {
  const next = LANG === 'es' ? 'en' : 'es';
  setLang(next);
}

function syncLangSliders() {
  const isEn = LANG === 'en';
  // setup slider
  const sTrack = document.getElementById('setup-lang-track');
  const sThumb = document.getElementById('setup-lang-thumb');
  if (sTrack) sTrack.style.transform = isEn ? 'translateX(-50%)' : 'translateX(0)';
  if (sThumb) { sThumb.style.left = isEn ? '40px' : '3px'; sThumb.textContent = isEn ? '🇺🇸' : '🇪🇸'; }
  // hamburger slider
  const hTrack = document.getElementById('hmenu-lang-track');
  const hThumb = document.getElementById('hmenu-lang-thumb');
  if (hTrack) hTrack.style.transform = isEn ? 'translateX(-50%)' : 'translateX(0)';
  if (hThumb) { hThumb.style.left = isEn ? '40px' : '3px'; hThumb.textContent = isEn ? '🇺🇸' : '🇪🇸'; }
}

// ── Single-button language toggle ──
function toggleLang() {
  const next = LANG === 'es' ? 'en' : 'es';
  setLang(next);
}

async function shareApp() {
  const shareData = {
    title: T[LANG].shareTitle || 'NEURO-DOME',
    text: T[LANG].shareText || 'App de regulación y apoyo para personas autistas.',
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      showToast(LANG === 'es' ? 'Copiado al portapapeles' : 'Copied to clipboard');
    }
  } catch (err) {
    console.log('Error sharing:', err);
  }
}

function toggleHomeMenu(forceClose) {
  const m     = document.getElementById('h-menu');
  const sub   = document.getElementById('appear-submenu');
  const arrow = document.getElementById('appear-arrow');
  if (!m) return;
  if (forceClose || m.classList.contains('open')) {
    m.classList.remove('open');
    // Also close appearance submenu
    if (sub)   sub.classList.remove('open');
    if (arrow) arrow.classList.remove('open');
  } else {
    m.classList.add('open');
  }
}
document.addEventListener('click', e => {
  if (!e.target.closest('.h-menu-wrap')) {
    const m = document.getElementById('h-menu');
    if (m && m.classList.contains('open')) toggleHomeMenu(true);
  }
});

// ─── TAXI A CASA ─────────────────────────
function callTaxiHome() {
  const app = (C.taxiApp || '').trim().toLowerCase();
  const addr = [C.d1, C.d2, C.d3, C.d4].filter(Boolean).join(', ');
  const addrEnc = encodeURIComponent(addr);
  const msg = C.taxiMsg || '';
  const LANG_IS_EN = LANG === 'en';

  // App deep-links map
  const deepLinks = {
    uber:     `uber://?action=setPickup&pickup=my_location&dropoff[formatted_address]=${addrEnc}`,
    cabify:   `cabify://route?end[street]=${addrEnc}`,
    indrive:  `https://indrive.com/`,
    indriver: `https://indrive.com/`,
    beat:     `https://thebeat.co/`,
    lyft:     `lyft://ridetype?id=lyft&destination[address]=${addrEnc}`,
    didi:     `https://web.didiglobal.com/`,
    free:     `free://`,
    ola:      `olacabs://booking?dropLat=&dropLng=&dropName=${addrEnc}`,
  };

  // Find matching deep link
  let link = null;
  for (const [key, url] of Object.entries(deepLinks)) {
    if (app.includes(key)) { link = url; break; }
  }

  if (!addr) {
    alert(LANG_IS_EN
      ? 'Configure your address in Settings first.'
      : 'Configura tu dirección en el perfil primero.');
    return;
  }
  if (!C.taxiApp) {
    alert(LANG_IS_EN
      ? 'Configure your preferred taxi app in Settings.'
      : 'Configura tu app de taxi en el perfil primero.');
    return;
  }

  // Build advice message
  const shareAdvice = LANG_IS_EN
    ? `✅ Remember to SHARE YOUR TRIP with your emergency contact once you're in the taxi.`
    : `✅ Recuerda COMPARTIR EL VIAJE con tu contacto de emergencia una vez en el taxi.`;

  const msgReminder = msg
    ? (LANG_IS_EN ? `\n\n💬 Message for driver: "${msg}"` : `\n\n💬 Mensaje para el conductor: "${msg}"`)
    : '';

  const confirmed = confirm(
    (LANG_IS_EN ? `Opening ${C.taxiApp}...\n\nDestination: ${addr}` : `Abriendo ${C.taxiApp}...\n\nDestino: ${addr}`)
    + msgReminder
    + `\n\n${shareAdvice}`
  );
  if (!confirmed) return;

  if (link) {
    // Try deep link first; fall back to store/web
    window.location.href = link;
    setTimeout(() => {
      // If app didn't open, try search
      window.open(`https://www.google.com/search?q=${encodeURIComponent(C.taxiApp + ' app')}`, '_blank');
    }, 1500);
  } else {
    // Generic: search for the app
    window.open(`https://www.google.com/search?q=${encodeURIComponent(C.taxiApp + ' app download')}`, '_blank');
  }
}

// ═══════════════════════════════════════
// L1 ACTIONS
// ═══════════════════════════════════════
function tomarCrisis() {
  const b = document.getElementById('btn-tomar');
  if (b) { b.style.background = '#003320'; b.textContent = `✅ TOMADO: ${C.mc||'medicamento'}`; b.disabled = true; }
}
function sendWA() {
  if (!C.ct) { alert('Configura el teléfono en Ajustes ⚙️'); return; }
  const msg = encodeURIComponent(`Tengo una crisis. Necesito tu contención y sentirme a salvo. No me hables todavía, solo quédate cerca.`);
  window.open(`https://wa.me/${C.ct}?text=${msg}`, '_blank');
}
function sosSendWA() {
  if (!C.ct) { alert('Configura el teléfono en Ajustes ⚙️'); return; }
  const msg = encodeURIComponent(`Tengo una crisis, necesito tu contención y sentirme a salvo. Por favor ven o llámame.`);
  window.open(`https://wa.me/${C.ct}?text=${msg}`, '_blank');
}

// ═══════════════════════════════════════
// L2 ACTIONS
// ═══════════════════════════════════════
function openMaps() {
  const addr = [C.d1, C.d2, C.d3].filter(Boolean).join(', ');
  if (!addr) { alert('Configura tu dirección en Ajustes ⚙️'); return; }
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}&travelmode=walking`, '_blank');
}
function llamar() {
  if (!C.ct) { alert('Configura el teléfono en Ajustes ⚙️'); return; }
  window.location.href = 'tel:' + C.ct;
}

// ═══════════════════════════════════════
// L3 ACTIONS
// ═══════════════════════════════════════
// (button "Tomada" removed — tracking done via alarm calendar)

// ═══════════════════════════════════════
// IMAGE LIGHTBOX
// ═══════════════════════════════════════
function openLightbox(src, label) {
  if (!src || src.startsWith('data:image') === false && !src.startsWith('http') && !src.startsWith('blob')) return;
  document.getElementById('lb-img').src = src;
  document.getElementById('lb-label').textContent = label || '';
  document.getElementById('img-lightbox').classList.add('active');
}
function closeLightbox() {
  document.getElementById('img-lightbox').classList.remove('active');
}
// Make card-img-cover images tappable
document.addEventListener('click', e => {
  const img = e.target.closest('.card-img-cover');
  if (img && img.src) openLightbox(img.src, '');
});

// ═══════════════════════════════════════
// RECIPE MODAL (punto 6)
// ═══════════════════════════════════════
async function openRecipeModal() {
  document.getElementById('recipe-modal').classList.add('active');
  const body = document.getElementById('recipe-sheet-body');
  const loading = document.getElementById('recipe-loading');
  loading.style.display = 'block';
  body.innerHTML = '<div class="recipe-loading" id="recipe-loading">Generando recetas con tus alimentos seguros…</div>';

  const comida = C.comida || 'arroz, huevos, tostadas';
  const apikey = getApiKey();

  if (!apikey) {
    // Fallback local recipes
    body.innerHTML = generateLocalRecipes(comida);
    return;
  }

  try {
    const prompt = `Eres un asistente de cocina simple para una persona autista con batería baja. 
    Sus alimentos seguros son: ${comida}.
    Genera 3 recetas MUY simples (máximo 4 pasos cada una) que usen principalmente estos ingredientes. 
    Responde SOLO en JSON así:
    [{"nombre":"Nombre","ingredientes":"lista breve","pasos":"paso1\\npaso2\\npaso3","tiempo":"5 min"}]
    Sin markdown, sin explicaciones, solo el JSON.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apikey}`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ contents:[{role:'user',parts:[{text:prompt}]}], generationConfig:{temperature:0.4,maxOutputTokens:600} })
    });
    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    text = text.replace(/```json|```/g,'').trim();
    const recipes = JSON.parse(text);
    body.innerHTML = recipes.map(r => `
      <div class="recipe-card">
        <div class="recipe-card-name">🍳 ${r.nombre} <span style="font-size:12px;font-family:var(--mono);color:var(--teal)">· ${r.tiempo||''}</span></div>
        <div style="font-size:13px;color:var(--teal);margin-bottom:8px">🛒 ${r.ingredientes}</div>
        <div class="recipe-card-steps">${r.pasos.split('\\n').map((s,i)=>`<b>${i+1}.</b> ${s}`).join('<br>')}</div>
      </div>`).join('');
  } catch(e) {
    body.innerHTML = generateLocalRecipes(comida);
  }
}

function generateLocalRecipes(comida) {
  const items = comida.split(',').map(s=>s.trim()).filter(Boolean);
  const base = items[0] || 'lo que tengas';
  return `
    <div class="recipe-card">
      <div class="recipe-card-name">🥚 Lo más rápido posible</div>
      <div class="recipe-card-steps">
        <b>1.</b> Toma ${base}.<br>
        <b>2.</b> Si requiere calor, usa el microondas o sartén a fuego mínimo.<br>
        <b>3.</b> Agrega sal si quieres. Listo.
      </div>
    </div>
    <div class="recipe-card">
      <div class="recipe-card-name">🍞 Sin cocinar (modo cero energía)</div>
      <div class="recipe-card-steps">
        <b>1.</b> Abre lo primero que encuentres que sea comida segura.<br>
        <b>2.</b> Cómelo tal como está.<br>
        <b>3.</b> No necesitas más que eso ahora mismo.
      </div>
    </div>`;
}

function closeRecipeModal() {
  document.getElementById('recipe-modal').classList.remove('active');
}

// ═══════════════════════════════════════
// ALARM MANAGER (punto 9)
// ═══════════════════════════════════════
let alarmAudio = null;
let currentRingingAlarm = null;

// --- DESBLOQUEO DE AUDIO PARA ALARMAS ---
let globalAudioCtx = null;
function unlockAudio() {
  if (!globalAudioCtx) {
    globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
}
// Con el primer toque en la pantalla, el navegador nos da permiso de emitir sonido luego
document.addEventListener('click', unlockAudio, { once: true });
document.addEventListener('touchstart', unlockAudio, { once: true });

function initAlarmAudio() {
  // Gentle sine wave tone — calming, low frequency, suitable for autism
  try {
    const ctx = globalAudioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    
    const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      const env = t < 0.5 ? t/0.5 : t > 2.5 ? (3-t)/0.5 : 1;
      data[i] = Math.sin(2 * Math.PI * 220 * t) * 0.3 * env
               + Math.sin(2 * Math.PI * 330 * t) * 0.15 * env;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.connect(ctx.destination);
    return { play: () => src.start(), stop: () => { try { src.stop(); } catch(e){} } };
  } catch(e) { return null; }
}

let editingAlarmId = null;

function openAlarmForm() {
  editingAlarmId = null;
  const f = document.getElementById('alarm-form');
  if (f) f.style.display = 'flex';
  document.getElementById('alarm-med-name').value = '';
  document.getElementById('alarm-time-input').value = '';
  document.querySelectorAll('.day-btn').forEach(b => b.classList.add('active'));
}

function modificarAlarma(id) {
  const alarm = alarms.find(a => a.id === id);
  if (!alarm) return;
  
  editingAlarmId = id;
  const f = document.getElementById('alarm-form');
  if (f) f.style.display = 'flex';
  document.getElementById('alarm-med-name').value = alarm.medName;
  document.getElementById('alarm-time-input').value = alarm.time;
  
  document.querySelectorAll('.day-btn').forEach(b => {
    if (alarm.days.includes(b.dataset.day)) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
}

function closeAlarmForm() {
  editingAlarmId = null;
  const f = document.getElementById('alarm-form');
  if (f) f.style.display = 'none';
  document.getElementById('alarm-med-name').value = '';
  document.getElementById('alarm-time-input').value = '';
}

document.addEventListener('click', e => {
  const btn = e.target.closest('.day-btn');
  if (btn) btn.classList.toggle('active');
});

function addAlarm() {
  const medName = document.getElementById('alarm-med-name').value.trim();
  const time    = document.getElementById('alarm-time-input').value;
  if (!time) { document.getElementById('alarm-time-input').focus(); return; }
  const days = [...document.querySelectorAll('.day-btn.active')].map(b => b.dataset.day);
  
  if (editingAlarmId !== null) {
    const idx = alarms.findIndex(a => a.id === editingAlarmId);
    if (idx !== -1) {
      alarms[idx] = { id: editingAlarmId, medName: medName || C.md || 'Medicación', time, days, active: true };
    }
  } else {
    alarms.push({ id:Date.now(), medName:medName||C.md||'Medicación', time, days, active:true });
  }
  
  localStorage.setItem(KEYS.alarms, JSON.stringify(alarms));
  closeAlarmForm();
  renderAlarms();
  startAlarmChecker();
}

function deleteAlarm(id) {
  alarms = alarms.filter(a => a.id !== id);
  localStorage.setItem(KEYS.alarms, JSON.stringify(alarms));
  renderAlarms();
}

function renderAlarms() {
  const lista = document.getElementById('alarm-lista');
  const empty = document.getElementById('alarm-empty');
  if (!lista) return;
  if (alarms.length === 0) { lista.innerHTML = ''; if(empty) empty.style.display = 'block'; return; }
  if (empty) empty.style.display = 'none';
  lista.innerHTML = alarms.map(a => `
    <div class="alarm-item">
      <div class="alarm-time">${a.time}</div>
      <div class="alarm-info">
        <div class="alarm-label">${a.medName}</div>
        <div class="alarm-days">${a.days.join(' · ')}</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="alarm-mod" onclick="modificarAlarma(${a.id})" style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:4px 8px;color:var(--text2);cursor:pointer">✎</button>
        <button class="alarm-del" onclick="deleteAlarm(${a.id})">✕</button>
      </div>
    </div>`).join('');
}

function startAlarmChecker() {
  if (alarmCheckInterval) clearInterval(alarmCheckInterval);
  alarmCheckInterval = setInterval(checkAlarms, 30000); // every 30s
  checkAlarms();
}

const DAYS_MAP = { 0:'D', 1:'L', 2:'M', 3:'X', 4:'J', 5:'V', 6:'S' };
let lastTriggeredMinute = '';

function checkAlarms() {
  const now = new Date();
  const hhmm = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  if (hhmm === lastTriggeredMinute) return;
  const dayCode = DAYS_MAP[now.getDay()];
  const triggered = alarms.find(a => a.active && a.time === hhmm && a.days.includes(dayCode));
  if (triggered) {
    lastTriggeredMinute = hhmm;
    fireAlarm(triggered);
  }
}

function fireAlarm(alarm) {
  currentRingingAlarm = alarm;
  document.getElementById('alarm-ring-time').textContent = alarm.time;
  document.getElementById('alarm-ring-label').textContent = alarm.medName;
  document.getElementById('alarm-ringing').classList.add('active');
  alarmAudio = initAlarmAudio();
  if (alarmAudio) alarmAudio.play();
}

function dismissAlarm() {
  document.getElementById('alarm-ringing').classList.remove('active');
  if (alarmAudio) { alarmAudio.stop(); alarmAudio = null; }
  // Log the take
  const today = new Date().toISOString().slice(0,10);
  if (!medLog[today]) medLog[today] = [];
  if (currentRingingAlarm) medLog[today].push(currentRingingAlarm.medName);
  localStorage.setItem(KEYS.medLog, JSON.stringify(medLog));
  currentRingingAlarm = null;
}

// ═══════════════════════════════════════
// MED CALENDAR
// ═══════════════════════════════════════
let calYear, calMonth;
function initMedCal() {
  const now = new Date();
  calYear = now.getFullYear();
  calMonth = now.getMonth();
  renderCal();
}
function calPrevMonth() { calMonth--; if(calMonth<0){calMonth=11;calYear--;} renderCal(); }
function calNextMonth() { calMonth++; if(calMonth>11){calMonth=0;calYear++;} renderCal(); }

function renderCal() {
  const lbl = document.getElementById('cal-month-lbl');
  const grid = document.getElementById('cal-grid');
  if (!lbl || !grid) return;
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  lbl.textContent = `${monthNames[calMonth]} ${calYear}`;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  
  let firstAlarmDateStr = todayStr;
  if (alarms.length > 0) {
    const minTimestamp = Math.min(...alarms.map(a => a.id));
    const firstAlarmDate = new Date(minTimestamp);
    firstAlarmDateStr = `${firstAlarmDate.getFullYear()}-${String(firstAlarmDate.getMonth()+1).padStart(2,'0')}-${String(firstAlarmDate.getDate()).padStart(2,'0')}`;
  }

  const firstDay = new Date(calYear, calMonth, 1);
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  // Monday-first offset
  let offset = firstDay.getDay() - 1; if (offset < 0) offset = 6;

  let html = '';
  for (let i = 0; i < offset; i++) html += `<div class="cal-day empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isFuture = dateStr > todayStr;
    const isToday  = dateStr === todayStr;
    const isBeforeFirstAlarm = dateStr < firstAlarmDateStr;
    const taken    = !!medLog[dateStr]?.length;
    // Only mark missed if alarms exist, past date, and not before first alarm
    const hasMissed = !isFuture && !isToday && !taken && alarms.length > 0 && !isBeforeFirstAlarm;
    const cls = isFuture ? 'future' : isToday ? 'today' : taken ? 'taken' : hasMissed ? 'missed' : '';
    html += `<div class="cal-day ${cls}" onclick="toggleMedDay('${dateStr}')">${d}</div>`;
  }
  grid.innerHTML = html;
}

function toggleMedDay(dateStr) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  if (dateStr > todayStr) return; // Cannot toggle future dates
  
  if (medLog[dateStr] && medLog[dateStr].length > 0) {
    // Already taken, remove it
    delete medLog[dateStr];
  } else {
    // Not taken, mark as taken
    medLog[dateStr] = [new Date().toISOString()];
  }
  localStorage.setItem(KEYS.medLog, JSON.stringify(medLog));
  renderCal();
}

// ═══════════════════════════════════════
// EMOTIONAL SUPPORT SCREEN (punto 8)
// ═══════════════════════════════════════
function openEmotionalScreen(type) {
  // type: 'pet' or 'object'
  const isPet = type === 'pet';
  document.getElementById('emo-screen-title').textContent = isPet ? C.petName || 'Mi apoyo incondicional' : C.objName || 'Mi objeto favorito';
  document.getElementById('emo-screen-icon').textContent  = isPet ? '🐾' : '🧸';

  const circle = document.getElementById('emo-circle');
  const photo  = document.getElementById('emo-pet-photo');
  const emoji  = document.getElementById('emo-pet-emoji');
  const displayName = document.getElementById('emo-pet-display-name');

  if (isPet && C.imgPet) {
    photo.src = C.imgPet; photo.style.display = 'block'; emoji.style.display = 'none';
    circle.onclick = () => openLightbox(C.imgPet, C.petName||'');
  } else {
    photo.style.display = 'none'; emoji.style.display = 'block';
    emoji.textContent = isPet ? '🐾' : '🧸';
    circle.onclick = null;
  }
  displayName.textContent = isPet ? (C.petName||'—') : (C.objName||'—');

  const msgEl = document.getElementById('emo-message');
  const cardHd = document.getElementById('emo-card-hd');
  if (isPet && C.petName) {
    if (cardHd) { cardHd.style.display = 'block'; cardHd.textContent = '💌 Está contigo ahora mismo'; }
    msgEl.textContent = `${C.petName} te está esperando. Aunque ahora no puedas sentirle, su energía viaja contigo. Pronto van a estar juntos de nuevo.`;
  } else if (!isPet && C.objName) {
    if (cardHd) cardHd.style.display = 'none';
    msgEl.textContent = `Tu ${C.objName} está ${C.objLocation||'esperándote'}. Cuando puedas, ve a buscarlo. Es tuyo y te espera.`;
  } else {
    if (cardHd) { cardHd.style.display = 'none'; }
    msgEl.textContent = isPet ? 'Tu apoyo incondicional está contigo de alguna forma. Respira.' : 'Tu objeto favorito te brinda seguridad y confort. Respira.';
  }

  // Reset AI image area
  const placeholderText = isPet 
    ? 'Toca el botón para que la IA genere una imagen de tu apoyo incondicional mostrándote amor 🤍'
    : 'Toca el botón para que la IA genere una imagen de tu objeto favorito brindándote calma 🤍';
  document.getElementById('emo-ai-img-wrap').innerHTML = `<div style="padding:24px;text-align:center;color:var(--text3);font-size:14px" id="emo-ai-placeholder">${placeholderText}</div>`;
  document.getElementById('emo-gen-loading').style.display = 'none';

  // Store current type for generation
  document.getElementById('screen-emotional').dataset.emoType = type;
  go('emotional');
}

async function generateEmotionalImage() {
  const apikey = getApiKey();
  const screen = document.getElementById('screen-emotional');
  const isPet = screen.dataset.emoType === 'pet';
  const loadingEl = document.getElementById('emo-gen-loading');
  const wrapEl = document.getElementById('emo-ai-img-wrap');

  if (!apikey) {
    wrapEl.innerHTML = `<div style="padding:24px;text-align:center;color:var(--text3);font-size:14px">Necesitas una API key de Gemini en ⚙️ Ajustes para generar imágenes con IA.</div>`;
    return;
  }

  loadingEl.style.display = 'block';
  const desc = isPet
    ? `${C.petType||'animal'} llamado ${C.petName||'mi mascota'}. ${C.petDesc||''}`
    : `objeto de confort: ${C.objDesc||'objeto querido'}`;

  const prompt = `Genera una descripción detallada en inglés (para DALL-E o Stable Diffusion) de una imagen emotiva y tierna que muestre: ${desc}. 
  La imagen debe transmitir amor, calidez y empatía hacia su dueño autista que está pasando un momento difícil.
  El ${isPet?'animal':'objeto'} debe parecer que manda amor y consuelo.
  Responde SOLO con el prompt en inglés, sin explicaciones ni comillas.`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apikey}`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ contents:[{role:'user',parts:[{text:prompt}]}], generationConfig:{temperature:0.7,maxOutputTokens:200} })
    });
    const data = await res.json();
    const imgPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    loadingEl.style.display = 'none';

    // Show the generated prompt as a warm message instead (Gemini doesn't generate images directly)
    wrapEl.innerHTML = `
      <div style="padding:20px;text-align:left">
        <div style="font-size:11px;font-family:var(--mono);letter-spacing:1.5px;color:var(--teal);margin-bottom:10px">DESCRIPCIÓN PARA IA DE IMAGEN</div>
        <div style="font-size:14px;color:var(--text2);line-height:1.7;font-style:italic">${imgPrompt}</div>
        <div style="margin-top:14px;font-size:12px;color:var(--text3)">Puedes copiar esto en Midjourney, DALL-E o Adobe Firefly para generar la imagen.</div>
      </div>`;
  } catch(e) {
    loadingEl.style.display = 'none';
    wrapEl.innerHTML = `<div style="padding:24px;text-align:center;color:var(--red);font-size:14px">Error al conectar con la IA. Verifica tu conexión.</div>`;
  }
}
function startCave() {
  clearInterval(caveInt);
  let s = 900;
  const el = document.getElementById('cave-timer');
  function u() { if (el) el.textContent = String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); if (s>0) s--; }
  u(); caveInt = setInterval(u, 1000);
}

// ═══════════════════════════════════════
// ISOCHRONIC TONES — WebAudio Engine
// ═══════════════════════════════════════
const ISO_TONES = [
  { freq:40,  beat:40,  name:'Gamma — Foco suave',     use:'Transición de sobrecarga a enfoque leve. Útil cuando no puedes concentrarte.', color:'#9060d0', duration:'10 min' },
  { freq:10,  beat:10,  name:'Alpha — Calma activa',   use:'Relajación sin sueño. Ideal antes de una tarea que requiere calma.',           color:'#3090d0', duration:'15 min' },
  { freq:7.83,beat:7.83,name:'Schumann — Tierra',      use:'Frecuencia natural del planeta. Reduce ansiedad profunda y desregulación.',    color:'#30a060', duration:'20 min' },
  { freq:4,   beat:4,   name:'Theta — Sueño',          use:'Para quedarse dormido o descansar profundamente. No usar al conducir.',        color:'#304080', duration:'30 min' },
  { freq:2,   beat:2,   name:'Delta — Sueño profundo', use:'Para insomnio severo. Máxima desactivación del sistema nervioso.',             color:'#202860', duration:'45 min' },
  { freq:14,  beat:14,  name:'Beta bajo — Alerta leve',use:'Cuando necesitas activarte sin sobrecargar. Días de baja energía.',            color:'#806000', duration:'10 min' },
];

let isoAudioCtx = null;
let isoNodes = {};
let isoPlayingIdx = null;

function stopAllTones() {
  Object.values(isoNodes).forEach(n => { try { n.osc?.stop(); n.osc2?.stop(); n.gain?.disconnect(); } catch(e){} });
  isoNodes = {};
  isoPlayingIdx = null;
  document.querySelectorAll('.tone-play-btn').forEach(b => {
    b.classList.remove('playing');
    b.textContent = '▶ Iniciar';
  });
}

function playIsoTone(idx) {
  if (isoPlayingIdx === idx) { stopAllTones(); return; }
  stopAllTones();
  const tone = ISO_TONES[idx];
  try {
    isoAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = isoAudioCtx;
    const master = ctx.createGain();
    master.gain.value = 0.18;
    master.connect(ctx.destination);

    // Carrier oscillator (audible base tone ~200Hz)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 200;

    // Amplitude modulation at beat frequency = isochronic pulse
    const amGain = ctx.createGain();
    amGain.gain.value = 1;
    osc.connect(amGain);
    amGain.connect(master);

    // LFO for amplitude modulation
    const lfo = ctx.createOscillator();
    lfo.type = 'square'; // hard on/off = true isochronic
    lfo.frequency.value = tone.beat;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.5;
    lfo.connect(lfoGain);
    lfoGain.connect(amGain.gain);

    // Gentle fade-in
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 3);

    osc.start(); lfo.start();
    isoNodes[idx] = { osc, osc2:lfo, gain:master };
    isoPlayingIdx = idx;

    const btn = document.getElementById('iso-btn-' + idx);
    if (btn) { btn.classList.add('playing'); btn.textContent = (T[LANG]||T.es).toneStop || '⏹ Detener'; }
  } catch(e) {
    alert('Tu navegador no soporta síntesis de audio. Prueba en Chrome o Safari.');
  }
}

function initIsoTones() {
  const list = document.getElementById('iso-tones-list');
  if (!list) return;
  list.innerHTML = '';
  const L = T[LANG] || T.es;
  ISO_TONES.forEach((tone, i) => {
    const name = (L.toneNames && L.toneNames[i]) || tone.name;
    const use  = (L.toneUses  && L.toneUses[i])  || tone.use;
    const durLabel = L.toneDurLabel || 'Duración sugerida:';
    list.innerHTML += `
    <div class="tone-card" style="border-color:${tone.color}20">
      <div class="tone-card-hdr">
        <div class="tone-freq" style="color:${tone.color}">${tone.freq}Hz</div>
        <div class="tone-info">
          <div class="tone-name">${name}</div>
          <div class="tone-use">${use}</div>
        </div>
      </div>
      <button class="tone-play-btn" id="iso-btn-${i}" style="border-color:${tone.color};color:${tone.color};background:${tone.color}18" onclick="playIsoTone(${i})">
        ${L.tonePlay || '▶ Iniciar'}
      </button>
      <div class="tone-duration">${durLabel} ${tone.duration}</div>
    </div>`;
  });
}

async function loadIsoTonesWithAI() {
  const apikey = getApiKey();
  const resultEl = document.getElementById('iso-ai-result');
  if (!apikey) {
    resultEl.style.display = 'block';
    resultEl.innerHTML = '<div class="card"><div class="card-bd" style="font-size:14px;color:var(--text3)">Agrega una API key de Gemini en ⚙️ para obtener recomendaciones personalizadas.</div></div>';
    return;
  }
  resultEl.style.display = 'block';
  resultEl.innerHTML = '<div class="card"><div class="card-bd" style="font-size:14px;color:var(--text3);font-family:var(--mono)">Consultando a la IA…</div></div>';
  const profile = `Hipersensibilidades: ${C.hiper||'no especificadas'}. Triggers: ${C.triggers||'no especificados'}. Stimming: ${C.stimming||'no especificado'}.`;
  const prompt = `Eres un especialista en neurodivergencia y terapia de sonido. Basándote en este perfil autista: ${profile}. Recomienda SOLO 3 tonos isocrónicos específicos (con su frecuencia exacta en Hz) que serían más beneficiosos para esta persona. Para cada uno indica: frecuencia, nombre, cuándo usarlo (máximo 1 oración), y tiempo de escucha. Sé muy concreto. Responde en español, sin listas largas.`;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apikey}`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ contents:[{role:'user',parts:[{text:prompt}]}], generationConfig:{temperature:0.4,maxOutputTokens:400} })
    });
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Sin respuesta.';
    resultEl.innerHTML = `<div class="card" style="border-color:var(--purple)"><div class="card-hd">✨ Recomendación personalizada</div><div class="card-bd" style="font-size:14px;color:var(--text2);line-height:1.8">${reply.replace(/\n/g,'<br>')}</div></div>`;
  } catch(e) {
    resultEl.innerHTML = '<div class="card"><div class="card-bd" style="color:var(--red);font-size:14px">Error al conectar con la IA.</div></div>';
  }
}

// ═══════════════════════════════════════
// SOCIAL BATTERY
// ═══════════════════════════════════════
function updateBattery(val) {
  val = parseInt(val);
  const fill = document.getElementById('sb-fill');
  const pct  = document.getElementById('sb-pct');
  const icon = document.getElementById('sb-icon');
  let color, emoji;
  if (val >= 70)      { color = 'var(--green)';  emoji = '🔋'; }
  else if (val >= 40) { color = 'var(--amber)';  emoji = '🪫'; }
  else if (val >= 15) { color = '#c05020';        emoji = '⚠️'; }
  else                { color = 'var(--red)';     emoji = '🆘'; }
  if (fill) { fill.style.width = val + '%'; fill.style.background = color; }
  if (pct)  { pct.textContent = val + '%'; pct.style.color = color; }
  if (icon) icon.textContent = emoji;
  localStorage.setItem('cfg_social_bat', val);
}
// ═══════════════════════════════════════
// CAVE
// ═══════════════════════════════════════
const commsCards = {
  // Estado actual
  noconozco: { icon:'🌫️', text:'Ahora mismo no te reconozco.\nEsto es un síntoma neurológico temporal,\nno un reflejo de nuestra relación.', sub:'NO REACCIONAR · ESPERAR · DAR ESPACIO' },
  hablar:    { icon:'🔇', text:'No puedo procesar lenguaje verbal\nen este momento.\nNo es rechazo. Es incapacidad temporal.', sub:'COMUNÍCATE POR ESCRITO O ESPERA' },
  autista:   { icon:'♾️', text:'SOY AUTISTA\nEstoy en crisis neurológica.\nNecesito: SILENCIO · ESPACIO · NO TOCARME', sub:'NO LLAMAR ATENCIÓN · NO PREGUNTAR · SOLO ESPERAR' },
  // Necesito ahora
  clona:     { icon:'💊', text:'Necesito tomar mi medicamento de emergencia ahora mismo.\nNo es negociable. No puedo esperar.', sub:'AYÚDAME A ENCONTRARLO O DAME ESPACIO PARA TOMARLO' },
  agua:      { icon:'💧', text:'Necesito tomar agua ahora.\nPor favor tráeme un vaso\no indícame dónde hay.', sub:'UNA SOLA ACCIÓN · SIN PREGUNTAS' },
  piso:      { icon:'🧘', text:'Necesito acostarme en el piso.\nEs una técnica de regulación propioceptiva.\nNo estoy mal — estoy regulando.', sub:'NO ME PREGUNTES POR QUÉ · DEJA QUE LO HAGA' },
  presion:   { icon:'🫂', text:'Necesito presión profunda en el pecho.\nPuedes abrazarme con fuerza\no traerme algo pesado para apoyar sobre mí.', sub:'PRESIÓN FIRME Y SOSTENIDA · SIN MOVIMIENTO' },
  // Sensorial
  ruido:     { icon:'🔊', text:'Los ruidos me están lastimando ahora mismo.\nNecesito silencio o reducir el volumen\ndel entorno inmediato.', sub:'BAJA VOLUMEN · CIERRA PUERTAS · HABLA BAJITO' },
  luz:       { icon:'💡', text:'La luz me está causando dolor o sobrecarga.\nNecesito bajar la intensidad\no salir del entorno iluminado.', sub:'APAGA LUZ · BAJA PANTALLAS · DAME MIS GAFAS' },
  audifonos: { icon:'🎧', text:'Necesito mis audífonos o loops ahora.\nSon mi herramienta de regulación sensorial.\nNo es grosería — es necesidad.', sub:'DÓNDE ESTÁN MIS AUDÍFONOS' },
  gafas:     { icon:'🕶️', text:'Necesito mis gafas de sol ahora.\nLa luz me sobrecarga el sistema nervioso.\nEs una herramienta médica, no un accesorio.', sub:'DÓNDE ESTÁN MIS GAFAS DE SOL' },
  fidget:    { icon:'🪀', text:'Necesito un fidget toy o algo para mis manos.\nEl movimiento repetitivo me regula.\nNo me pidas que pare — me ayuda.', sub:'DAME ALGO PARA MOVER LAS MANOS' },
  // Emergencia
  emergencia:{ icon:'🏥', text:'', sub:'' }
};
function showCard(id) {
  const d = commsCards[id];
  document.getElementById('cd-icon').textContent = d.icon;
  document.getElementById('cd-text').textContent = id==='emergencia'
    ? `EMERGENCIA\nLlama a mi contacto:\n${C.cn||'CONTACTO'}\n${C.ct||''}`
    : d.text;
  document.getElementById('cd-sub').textContent = id==='emergencia'
    ? `MARCAR: ${C.ct||''}`
    : d.sub;
  go('comms-display');
}

// ═══════════════════════════════════════
// OVERLAYS
// ═══════════════════════════════════════
function showRisk() { document.getElementById('ov-risk').classList.add('active'); }
function closeOv(id) { document.getElementById(id).classList.remove('active'); }
function lineaCrisis() { window.location.href = 'tel:800-290-0024'; }

// ═══════════════════════════════════════
// ESCÁNER CORPORAL
// ═══════════════════════════════════════
const SCANNER_QUESTIONS = [
  { text:'Cierra los ojos. Aprieta las manos.\n¿Sientes tensión o rigidez muscular?', hint:'Tómate 5 segundos.', key:'tension' },
  { text:'¿Sientes que tu corazón late rápido\no muy fuerte?', hint:'Pon la mano en el pecho.', key:'taquicardia' },
  { text:'¿El ruido de afuera te molesta\no te duele?', hint:'Presta atención al entorno sonoro.', key:'hipersonido' },
  { text:'¿Tienes la boca seca o el\nestómago revuelto?', hint:'', key:'boca_estomago' },
  { text:'¿Sientes que no sabes bien dónde\ntermina tu cuerpo, o que flotas?', hint:'Señal de disociación propioceptiva.', key:'disociacion' },
  { text:'¿Tienes energía para hacer\nUNA tarea simple como beber agua?', hint:'', key:'energia_minima' },
  { text:'¿La luz o las pantallas te molestan\nmás de lo normal ahora?', hint:'', key:'hiperluz' }
];
let scanIdx = 0, scanAnswers = {};

function initScanner() {
  scanIdx = 0; scanAnswers = {};
  document.getElementById('scan-result').classList.remove('visible');
  document.getElementById('scan-q-card').style.display = 'block';
  document.querySelector('.yn-row').style.display = 'flex';
  renderScanQ();
}
function renderScanQ() {
  const total = SCANNER_QUESTIONS.length;
  document.getElementById('scan-progress').innerHTML = SCANNER_QUESTIONS.map((_,i) => {
    let cls = 'scan-dot';
    if (i < scanIdx) cls += ' done'; else if (i===scanIdx) cls += ' active';
    return `<div class="${cls}"></div>`;
  }).join('');
  const q = SCANNER_QUESTIONS[scanIdx];
  setT('scan-q-num', `PREGUNTA ${scanIdx+1} DE ${total}`);
  document.getElementById('scan-q-text').textContent = q.text;
  document.getElementById('scan-q-hint').textContent = q.hint;
}
function scanAnswer(yes) {
  scanAnswers[SCANNER_QUESTIONS[scanIdx].key] = yes;
  scanIdx++;
  if (scanIdx >= SCANNER_QUESTIONS.length) computeScanResult();
  else renderScanQ();
}

async function computeScanResult() {
  document.getElementById('scan-q-card').style.display = 'none';
  document.querySelector('.yn-row').style.display = 'none';
  const res = document.getElementById('scan-result');
  document.getElementById('scan-rec').innerHTML = `<span style="color:var(--teal)">Analizando respuestas…</span>`;
  document.getElementById('scan-detail').textContent = '';
  document.getElementById('scan-actions').innerHTML = '';
  res.classList.add('visible');
  document.getElementById('scan-progress').querySelectorAll('.scan-dot').forEach(d=>{d.classList.remove('active');d.classList.add('done');});

  const a = scanAnswers;
  let score = 0;
  if (a.tension) score+=2; if (a.taquicardia) score+=2; if (a.hipersonido) score+=2;
  if (a.disociacion) score+=3; if (a.boca_estomago) score+=1;
  if (!a.energia_minima) score+=3; if (a.hiperluz) score+=1;
  const hiperList = C.hiper || 'perfil no configurado';
  const apikey = getApiKey();

  if (apikey) {
    try {
      const answersText = SCANNER_QUESTIONS.map(q=>`- ${q.text.replace('\n',' ')}: ${scanAnswers[q.key]?'SÍ':'NO'}`).join('\n');
      const prompt = `Analiza estas respuestas de calibración interoceptiva de una persona autista:\n${answersText}\n\nPerfil sensorial:\n- Sensibilidades: ${hiperList}\n- Hiposensibilidades: ${C.hipo||'no configuradas'}\n- Triggers: ${C.triggers||'no configurados'}\n- Intereses: ${C.intereses||'no configurados'}\n- Ocupación: ${C.ocupacion||'no configurada'}, ${C.horas||'?'} horas/día, retos: ${C.retos||'no configurados'}\n\nSugiere el nivel apropiado (1-5):\n- N1: Crisis severa\n- N2: Disociación / agnosia\n- N3: Baja energía / burnout\n- N4: Funcional reducido\n- N5: Óptimo\n\nResponde SOLO con JSON exacto sin texto adicional:\n{"nivel":3,"titulo":"BAJA ENERGÍA","razon":"1-2 oraciones directas.","accion":"Una instrucción operativa inmediata."}`;
      const payload = {
        system_instruction:{ parts:[{ text:buildSystemPrompt() }] },
        contents:[{ role:'user', parts:[{ text:prompt }] }],
        generationConfig:{ temperature:0.2, maxOutputTokens:256 }
      };
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apikey}`,{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      const data = await r.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = JSON.parse(raw.replace(/```json|```/g,'').trim());
      const cm = {1:'#d84050',2:'#c87020',3:'#b89820',4:'#28a870',5:'#4888d0'};
      const color = cm[parsed.nivel]||'var(--teal)';
      document.getElementById('scan-rec').innerHTML = `<span style="color:${color}">🤖 IA: NIVEL ${parsed.nivel} — ${parsed.titulo}</span>`;
      document.getElementById('scan-detail').innerHTML = `<b>Análisis:</b> ${parsed.razon}<br><br><b>Acción:</b> ${parsed.accion}`;
      document.getElementById('scan-actions').innerHTML = `<button class="btn" style="background:${color};color:${parsed.nivel<=2?'#fff':'#111'}" onclick="go('l${parsed.nivel}')">→ IR AL NIVEL ${parsed.nivel}</button><button class="btn ghost sm" onclick="initScanner()">🔄 Repetir</button>`;
      return;
    } catch(e) { console.warn('Scanner Gemini fallback:', e.message); }
  }

  // Local fallback
  let nivel, color, rec, detail;
  if (score>=10){ nivel=1;color='#d84050';rec='NIVEL 1 — CRISIS SEVERA';detail=`Señales críticas. Hipersensibilidades a: ${hiperList}. Protocolo de crisis activado.`; }
  else if (score>=7){ nivel=2;color='#c87020';rec='NIVEL 2 — DISOCIACIÓN';detail=`Sobrecarga alta. Riesgo de disociación con tu perfil. Módulo de Anclaje de Realidad.`; }
  else if (score>=4){ nivel=3;color='#b89820';rec='NIVEL 3 — BAJA ENERGÍA';detail=`Fatiga moderada. Evita ${hiperList}. Protocolo de supervivencia básica.`; }
  else              { nivel=4;color='#28a870';rec='NIVEL 4 — FUNCIONAL';detail='Señales bajas. Energía operativa básica disponible. Monitorear.'; }

  document.getElementById('scan-rec').innerHTML = `<span style="color:${color}">${rec}</span>`;
  document.getElementById('scan-detail').textContent = detail;
  document.getElementById('scan-actions').innerHTML = `<button class="btn" style="background:${color};color:${nivel<=2?'#fff':'#111'}" onclick="go('l${nivel}')">→ IR AL NIVEL ${nivel}</button><button class="btn ghost sm" onclick="initScanner()">🔄 Repetir</button>`;
}

// ═══════════════════════════════════════
// IA GEMINI — SISTEMA DINÁMICO / POP-UP
// ═══════════════════════════════════════
function getApiKey() {
  try {
    return process.env.GEMINI_API_KEY || GEMINI_API_KEY_BUILTIN || C.apikey || localStorage.getItem(KEYS.apikey) || '';
  } catch (e) {
    return GEMINI_API_KEY_BUILTIN || C.apikey || localStorage.getItem(KEYS.apikey) || '';
  }
}

function buildSystemPrompt() {
  const n = C.nombre||'el usuario', cn = C.cn||'contacto', ct = C.ct||'sin tel.';
  const mc = C.mc||'no configurado', md = C.md||'no configurado';
  return `Actúas como regulador lógico para ${n}, persona autista.

ROL: Corteza prefrontal externa. Sistema de soporte lógico y baja demanda. No eres terapeuta ni das consuelo vacío.

REGLAS: Respuestas directas. Una instrucción a la vez. Máximo 4 oraciones. Imperativo directo. No uses "podrías" ni "quizás". Nunca preguntes "¿cómo te sientes?". Interpreta errores de escritura como estado.

PERFIL:
- Nombre: ${n} | Documento: ${C.documento||'—'} | Nacionalidad: ${C.nacionalidad||'—'}
- Sangre: ${C.sangre||'—'} | Alergias: ${C.alergias||'ninguna'}
- Crisis: ${mc} | Diario: ${md}
${C.hiper    ? `- Hipersensibilidades: ${C.hiper}. NUNCA sugieras actividades con estos estímulos.` : ''}
${C.hipo     ? `- Hiposensibilidades: ${C.hipo}.` : ''}
${C.triggers ? `- Triggers: ${C.triggers}. Evítalos siempre.` : ''}
${C.intereses? `- Intereses reguladores: ${C.intereses}. Úsalos como ancla cuando el sistema nervioso esté sobrecargado.` : ''}
${C.ocupacion? `- Ocupación: ${C.ocupacion}, ${C.horas||'?'} h/día. Retos: ${C.retos||'—'}.` : ''}
${C.lugarFijo    ? `- Lugar fijo habitual: ${C.lugarFijo}. Si alguien lo ocupa, valida su incomodidad y ofrece alternativa concreta.` : ''}
${C.rutas        ? `- Rutas habituales: ${C.rutas}.` : ''}
${C.rutaCambio   ? `- Ante cambio de ruta reacciona así: ${C.rutaCambio}. Si detectas incomodidad por cambio de ruta, explica la lógica de la nueva ruta paso a paso, sin juicio.` : ''}
${C.rituales     ? `- Rituales: ${C.rituales}. No interrumpas ni cuestiones estos rituales.` : ''}
${C.stimming     ? `- Stimming: ${C.stimming}. Sugiérelo activamente como estrategia de regulación.` : ''}
${C.peculiaridades ? `- Hábitos propios: ${C.peculiaridades}.` : ''}

CONTACTO: ${cn} — ${ct}. Si hay riesgo vital: "Llama a ${cn} al ${ct} ahora."
PROTOCOLO CRISIS N1/N2: Primera instrucción = sentarse/acostarse. Autoriza mutismo. Recuerda ${mc}.
PROTOCOLO DEUDAS: "Las deudas son dinero traído del futuro. No es fallo moral." Planificación técnica.
LÍMITES: No diagnostiques. No evalúes riesgo clínico. Si hay riesgo vital, deriva al contacto.`;
}

// ── Mensajes de contención locales (sin API) ──
const LOCAL_MSGS = {
  crisis: [
    { icon:'🔴', title:'Protocolo de crisis activo', body:'Siéntate o acuéstate en el suelo ahora mismo. No importa dónde estés.\n\nToma tu medicamento de crisis: {mc}.\n\nNo tienes que hablar. No tienes que responder mensajes. Mutismo autorizado.' },
    { icon:'🔴', title:'Sistema nervioso en alarma', body:'El cuerpo está procesando demasiado a la vez. Eso es fisiológico, no un fallo tuyo.\n\nUna acción: busca la superficie más cercana y apoya el cuerpo completo contra ella.\n\nRecuerda: {mc} existe exactamente para este momento.' },
    { icon:'🔴', title:'Una sola cosa ahora', body:'No planifiques. No decidas nada ahora mismo.\n\nAplica frío en muñecas o cara si puedes. Después: {mc}.\n\nAvisar a {cn} es una opción — no una obligación.' }
  ],
  disociacion: [
    { icon:'🟠', title:'Protocolo de anclaje activo', body:'Tu cuerpo está en el espacio aunque no lo sientas.\n\nToca el suelo con las manos. Describe la textura en voz baja: rugoso, frío, liso. Eso es real.\n\nUn objeto conocido en tu bolsillo. Encuéntralo y sostenlo.' },
    { icon:'🟠', title:'Esto es temporal y tiene nombre', body:'Lo que sientes es disociación propioceptiva. Es un mecanismo de protección neurológica, no estás perdiéndote.\n\nPresión profunda: abraza tus propios brazos fuerte contra el cuerpo. Cuenta hasta 10.\n\nDespués, mira tu nombre escrito en esta pantalla: {nombre}.' }
  ],
  energia: [
    { icon:'🟡', title:'Batería baja — modo conservación', body:'Tu sistema nervioso ha agotado recursos. Eso es información, no fracaso.\n\nUna prioridad ahora: {md}. Solo eso.\n\nComida segura si puedes: {comida}. Todo lo demás puede esperar.' },
    { icon:'🟡', title:'Hoy es un día de P1 y P2', body:'P1: medicación. P2: agua. Eso es todo lo que existe hoy.\n\nNo te debes duchas, respuestas, ni productividad cuando la batería está en rojo.\n\nDecide una cosa que puedes diferir para mañana y hazlo ahora.' }
  ],
  diario: [
    { icon:'🧠', title:'Recordatorio del sistema', body:'Hoy existe. Eso ya cuenta.\n\nSi tienes medicación diaria: {md} — hazlo antes de que el sistema colapse.\n\nTu interés de anclaje ({intereses}) está disponible cuando necesites regulación.' },
    { icon:'🧠', title:'Estado del sistema hoy', body:'El cuerpo autista tiene ciclos. No todos los días serán iguales y eso es biológicamente correcto.\n\nSi sientes sobrecarga temprana: usa el Escáner Corporal. La información es más útil que ignorar la señal.\n\nRecuerda: {mc} para emergencias, {md} para el mantenimiento diario.' },
    { icon:'🧠', title:'Un ancla para hoy', body:'Antes de empezar el día: verifica sensibilidades activas ({hiper}).\n\nEvita exposición innecesaria a tus triggers ({triggers}) si puedes controlar el entorno.\n\nTienes herramientas. Este sistema es una de ellas.' }
  ]
};

function fillTemplate(text) {
  return text
    .replace(/{mc}/g,        C.mc        || 'medicamento de crisis')
    .replace(/{md}/g,        C.md        || 'medicamento diario')
    .replace(/{cn}/g,        C.cn        || 'tu contacto')
    .replace(/{nombre}/g,    C.nombre    || 'tu nombre')
    .replace(/{intereses}/g, C.intereses || 'tus intereses')
    .replace(/{hiper}/g,     C.hiper     || 'tus sensibilidades')
    .replace(/{triggers}/g,  C.triggers  || 'tus triggers')
    .replace(/{comida}/g,    C.comida    || 'comida que toleras');
}

function showIaPopup({ icon, label, title, body, extraActions = [] }) {
  document.getElementById('ov-ia-icon').textContent  = icon  || '🧠';
  document.getElementById('ov-ia-label').textContent = label || 'SISTEMA DE APOYO';
  document.getElementById('ov-ia-title').textContent = title || '—';
  document.getElementById('ov-ia-body').innerHTML    = body.replace(/\n/g, '<br>');
  const acts = document.getElementById('ov-ia-actions');
  acts.innerHTML = extraActions.map(a => `<button class="btn ${a.cls||'ghost'} sm" onclick="${a.fn}">${a.txt}</button>`).join('') +
    `<button class="btn ghost sm" onclick="closeOv('ov-ia')" style="margin-top:4px">Entendido — Cerrar</button>`;
  document.getElementById('ov-ia').classList.add('active');
}

async function triggerIaPopup(type) {
  const apikey = getApiKey();

  // Determine local fallback pool
  const pool = LOCAL_MSGS[type] || LOCAL_MSGS.diario;
  const local = pool[Math.floor(Math.random() * pool.length)];

  // Show local message instantly
  const extraActions = type === 'crisis'
    ? [{ txt:`💊 TOMAR ${C.mc||'MEDICAMENTO'}`, cls:'red',   fn:'tomarCrisis();closeOv(\'ov-ia\')' },
       { txt:`📱 Avisar a ${C.cn||'contacto'}`, cls:'green', fn:'sendWA();closeOv(\'ov-ia\')' }]
    : type === 'disociacion'
    ? [{ txt:'🗺️ Cómo llegar a casa', cls:'blue', fn:'openMaps();closeOv(\'ov-ia\')' }]
    : [];

  showIaPopup({
    icon: local.icon, label: type === 'diario' ? 'RECORDATORIO IA' : 'CONTENCIÓN ACTIVA',
    title: local.title,
    body: fillTemplate(local.body),
    extraActions
  });

  // If API key available, enhance with AI in background
  if (!apikey) return;
  const ctxMap = {
    crisis:     `El usuario acaba de activar el protocolo de CRISIS SEVERA (Nivel 1). Genera un mensaje de contención de máximo 3 oraciones. Directo, sin preguntas, con una sola instrucción operativa. NO empieces con "Hola" ni con el nombre. Empieza directo con la instrucción.`,
    disociacion:`El usuario está en NIVEL 2 — DISOCIACIÓN / AGNOSIA. Genera un recordatorio de anclaje de máximo 3 oraciones. Usa datos del perfil sensorial si están disponibles. Sin preguntas.`,
    energia:    `El usuario está en NIVEL 3 — BAJA ENERGÍA. Genera un mensaje de validación y una instrucción de supervivencia básica. Máximo 3 oraciones. Sin condescendencia.`,
    diario:     `El usuario abrió su sistema de apoyo para un recordatorio diario. Genera un recordatorio operativo de 2-3 oraciones usando su perfil: intereses, medicación, sensibilidades. Realista, directo, útil para hoy.`
  };
  try {
    document.getElementById('ov-ia-loading').style.display = 'block';
    const payload = {
      system_instruction:{ parts:[{ text: buildSystemPrompt() }] },
      contents:[{ role:'user', parts:[{ text: ctxMap[type] || ctxMap.diario }] }],
      generationConfig:{ temperature:0.35, maxOutputTokens:200 }
    };
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apikey}`,
      { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (reply && document.getElementById('ov-ia')?.classList.contains('active')) {
      document.getElementById('ov-ia-body').innerHTML = reply.replace(/\n/g,'<br>');
      document.getElementById('ov-ia-title').textContent = type === 'diario' ? 'Mensaje del día' : 'Contención personalizada';
    }
  } catch(e) { /* silently keep local message */ }
  finally { document.getElementById('ov-ia-loading').style.display = 'none'; }
}

function showDailyReminder() { triggerIaPopup('diario'); }

// ═══════════════════════════════════════
// DESGLOSADOR DE TAREAS (DISFUNCIÓN EJECUTIVA)
// ═══════════════════════════════════════
async function desglosarTareaIA() {
  const apikey = getApiKey();
  const input = document.getElementById('input-tarea-ia').value.trim();
  const resultDiv = document.getElementById('resultado-tarea-ia');
  const btn = document.getElementById('btn-generar-tarea');

  if (!input) return;

  if (!apikey) {
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<span style="color:var(--red)">Necesitas configurar tu API Key de Gemini en Ajustes ⚙️ para usar esta función.</span>';
    return;
  }

  btn.textContent = "⏳ Pensando...";
  btn.disabled = true;
  resultDiv.style.display = 'block';
  resultDiv.innerHTML = '<span style="color:var(--text3)">Dividiendo la tarea en pasos muy pequeños...</span>';

  const prompt = `Actúa como un asistente para una persona autista con disfunción ejecutiva severa en este momento. 
  La tarea que le abruma es: "${input}".
  Divide esta tarea en pasos RIDÍCULAMENTE PEQUEÑOS y literales. 
  Usa un tono amable, cero juicios. 
  Formato: Una lista numerada corta. El paso 1 debe ser algo tan fácil como "Levántate" o "Respira".
  No escribas introducciones largas, ve directo a la lista.`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apikey}`, {
      method:'POST', 
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ 
        contents:[{role:'user',parts:[{text:prompt}]}], 
        generationConfig:{temperature:0.4, maxOutputTokens:300} 
      })
    });
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'No se pudo generar.';
    
    // Convertir saltos de línea en <br> y negritas en <b>
    let formattedReply = reply.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    resultDiv.innerHTML = formattedReply;
  } catch(e) {
    resultDiv.innerHTML = '<span style="color:var(--red)">Error de conexión con la IA.</span>';
  } finally {
    btn.textContent = "✨ Desglosar con IA";
    btn.disabled = false;
  }
}

// ═══════════════════════════════════════
// GUIONES SOCIALES (IA)
// ═══════════════════════════════════════
async function generarGuionIA() {
  const apikey = getApiKey();
  const input = document.getElementById('input-guion-ia').value.trim();
  const resultDiv = document.getElementById('resultado-guion-ia');
  const btn = document.getElementById('btn-generar-guion');

  if (!input) return;

  if (!apikey) {
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<span style="color:var(--red)">Necesitas configurar tu API Key de Gemini en Ajustes ⚙️ para usar esta función.</span>';
    return;
  }

  btn.textContent = "⏳ Escribiendo...";
  btn.disabled = true;
  resultDiv.style.display = 'block';
  resultDiv.innerHTML = '<span style="color:var(--text3)">Creando opciones de respuesta...</span>';

  const prompt = `Actúa como un asistente de comunicación para una persona autista. 
  El usuario necesita comunicar esto: "${input}".
  Genera 3 opciones de mensajes (scripts) listos para copiar y enviar. 
  Opción 1: Directa y profesional.
  Opción 2: Amable y suave.
  Opción 3: Muy corta y al grano.
  No des explicaciones, solo entrega las 3 opciones claramente separadas.`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apikey}`, {
      method:'POST', 
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ 
        contents:[{role:'user',parts:[{text:prompt}]}], 
        generationConfig:{temperature:0.4, maxOutputTokens:400} 
      })
    });
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'No se pudo generar.';
    
    let formattedReply = reply.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    resultDiv.innerHTML = formattedReply;
  } catch(e) {
    resultDiv.innerHTML = '<span style="color:var(--red)">Error de conexión con la IA.</span>';
  } finally {
    btn.textContent = "✨ Generar Guiones";
    btn.disabled = false;
  }
}

// ═══════════════════════════════════════
// REGISTRO SENSORIAL
// ═══════════════════════════════════════
let sensoryLog = [];
try { sensoryLog = JSON.parse(localStorage.getItem('cfg_sensory_log') || '[]'); } catch(e) { sensoryLog = []; }

function guardarRegistro() {
  const tipo = document.getElementById('reg-tipo').value;
  const trigger = document.getElementById('reg-trigger').value.trim() || 'No especificado';
  const fecha = new Date().toLocaleString('es', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
  
  sensoryLog.unshift({ id: Date.now(), tipo, trigger, fecha });
  localStorage.setItem('cfg_sensory_log', JSON.stringify(sensoryLog));
  
  document.getElementById('reg-trigger').value = '';
  renderRegistro();
}

function renderRegistro() {
  const lista = document.getElementById('registro-lista');
  if (!lista) return;
  
  if (sensoryLog.length === 0) {
    lista.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text3);font-size:14px;">No hay registros aún.</div>';
    return;
  }
  
  lista.innerHTML = sensoryLog.slice(0, 20).map(r => `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;display:flex;align-items:center;gap:10px;">
      <div style="flex:1;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <div style="font-size:14px;font-weight:700;color:${r.tipo === 'Meltdown' ? 'var(--red)' : r.tipo === 'Shutdown' ? 'var(--blue)' : 'var(--amber)'}">${r.tipo}</div>
          <div style="font-size:11px;color:var(--text3);font-family:var(--mono)">${r.fecha}</div>
        </div>
        <div style="font-size:13px;color:var(--text2)">Trigger: ${r.trigger}</div>
      </div>
      <button onclick="eliminarRegistroSensorial(${r.id})" style="width:30px;height:30px;border-radius:6px;background:var(--red-bg);border:1px solid var(--red);color:var(--red);font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;" title="ELIMINAR">✕</button>
    </div>
  `).join('');
}

function eliminarRegistroSensorial(id) {
  if (confirm(isEn ? 'Delete this record?' : '¿Eliminar este registro?')) {
    sensoryLog = sensoryLog.filter(x => x.id !== id);
    localStorage.setItem(KEYS.sensoryLog, JSON.stringify(sensoryLog));
    renderRegistro();
  }
}

function saveApiKey() {
  // kept for compatibility if called elsewhere
}
function appendMsg()  {} // stub — no chat screen
function quickMsg()   {} // stub

// ═══════════════════════════════════════
// DEUDAS
// ═══════════════════════════════════════
function toggleHamburger() { document.getElementById('hamburger-menu').classList.toggle('open'); }
document.addEventListener('click', e => { if (!e.target.closest('.hamburger-wrap')) document.getElementById('hamburger-menu')?.classList.remove('open'); });

function openDeudaForm() {
  const f = document.getElementById('deuda-form');
  if (f) f.style.display = 'flex';
  const m = document.getElementById('deuda-monto');
  if (m) {
    let sym = '$';
    const p = (C.pais || '').toLowerCase();
    if (p.includes('peru') || p.includes('perú')) sym = 'S/.';
    else if (p.includes('españa') || p.includes('europa')) sym = '€';
    else if (p.includes('mexico') || p.includes('méxico')) sym = 'MXN';
    m.placeholder = `Ej: ${sym} 850`;
  }
}
let editingDeudaId = null;

function closeDeudaForm() {
  const f=document.getElementById('deuda-form'); if(f) f.style.display='none';
  ['deuda-acreedor','deuda-monto','deuda-fecha'].forEach(id=>{ const el=document.getElementById(id); if(el)el.value=''; });
  editingDeudaId = null;
}

function addDeuda() {
  const acreedor = document.getElementById('deuda-acreedor').value.trim();
  const monto    = document.getElementById('deuda-monto').value.trim();
  const fecha    = document.getElementById('deuda-fecha').value;
  if (!acreedor) { document.getElementById('deuda-acreedor').focus(); return; }
  
  if (editingDeudaId) {
    const d = deudas.find(x => x.id === editingDeudaId);
    if (d) {
      d.acreedor = acreedor;
      d.monto = monto || '—';
      d.fecha = fecha || '';
    }
    editingDeudaId = null;
  } else {
    deudas.push({ id:Date.now(), acreedor, monto:monto||'—', fecha:fecha||'', pagada:false });
  }
  saveDeudas(); closeDeudaForm(); renderDeudas();
}

function pagarDeuda(id) {
  const d = deudas.find(x=>x.id===id); if (!d) return;
  const card = document.getElementById('deuda-card-'+id);
  if (card) {
    card.style.borderColor='var(--green)';
    card.innerHTML=`<div style="padding:18px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:7px"><div style="font-size:36px">✅</div><div style="font-size:15px;font-weight:900;color:var(--green)">BUCLE TÉCNICO CERRADO</div><div style="font-size:13px;color:var(--text3)">${d.acreedor} — ${d.monto}</div><div style="font-size:11px;font-family:var(--mono);color:var(--teal);margin-top:3px">Recurso devuelto al presente. Sistema actualizado.</div></div>`;
    card.style.background='var(--green-bg)';
    // save to historial
    historial.unshift({ ...d, cerradaEn: new Date().toLocaleDateString('es', {day:'2-digit',month:'2-digit',year:'numeric'}) });
    localStorage.setItem(KEYS.historial, JSON.stringify(historial));
    setTimeout(()=>{
      card.style.transition='opacity .5s, transform .5s';
      card.style.opacity='0'; card.style.transform='translateX(40px)';
      setTimeout(()=>{ deudas=deudas.filter(x=>x.id!==id); saveDeudas(); renderDeudas(); },500);
    }, 3000);
  }
}

function saveDeudas() { localStorage.setItem(KEYS.deudas, JSON.stringify(deudas)); }

function showHistorial(forceShow = false) {
  const block = document.getElementById('historial-block');
  const lista  = document.getElementById('historial-lista');
  if (!block||!lista) return;
  
  if (!forceShow && block.style.display === 'block') {
    block.style.display = 'none';
    return;
  }

  if (historial.length===0) { 
    block.style.display='block'; 
    lista.innerHTML='<div style="font-size:14px;color:var(--text3)">Sin compromisos cerrados aún.</div>'; 
    return; 
  }
  
  block.style.display='block';
  lista.innerHTML = historial.slice(0,20).map(d=>`
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;display:flex;align-items:center;gap:10px">
      <div style="font-size:20px">✅</div>
      <div style="flex:1">
        <div style="font-size:14px;font-weight:700">${d.acreedor}</div>
        <div style="font-size:13px;color:var(--text3)">${d.monto} — Cerrado: ${d.cerradaEn||'—'}</div>
      </div>
      <button onclick="eliminarHistorialDeuda(${d.id})" style="width:30px;height:30px;border-radius:6px;background:var(--red-bg);border:1px solid var(--red);color:var(--red);font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center" title="ELIMINAR">✕</button>
    </div>`).join('');
}

function eliminarHistorialDeuda(id) {
  historial = historial.filter(x => x.id !== id);
  localStorage.setItem(KEYS.historial, JSON.stringify(historial));
  showHistorial(true);
}

function renderDeudas() {
  const lista = document.getElementById('deudas-lista');
  const empty = document.getElementById('deudas-empty');
  if (!lista) return;
  const activas = deudas.filter(d=>!d.pagada);
  if (activas.length===0) { lista.innerHTML=''; if(empty) empty.style.display='block'; updateTotal([]); return; }
  if (empty) empty.style.display='none';
  lista.innerHTML = activas.map(d=>{
    const fechaStr = d.fecha ? (()=>{const p=d.fecha.split('-');return `${p[2]}/${p[1]}/${p[0]}`;})() : 'Sin fecha';
    let urgencia='', cardBorder='var(--border)';
    if (d.fecha) {
      const today=new Date(); today.setHours(0,0,0,0);
      const pay=new Date(d.fecha+'T00:00:00');
      const diff=Math.ceil((pay-today)/86400000);
      if (diff<0)       { urgencia=`<span style="color:var(--red);font-size:11px;font-family:var(--mono)">VENCIDA hace ${Math.abs(diff)} día(s)</span>`; cardBorder='var(--red)'; }
      else if (diff===0){ urgencia=`<span style="color:var(--red);font-size:11px;font-family:var(--mono)">VENCE HOY</span>`;                            cardBorder='var(--red)'; }
      else if (diff<=7) { urgencia=`<span style="color:var(--amber);font-size:11px;font-family:var(--mono)">Faltan ${diff} día(s)</span>`;               cardBorder='var(--amber)'; }
      else              { urgencia=`<span style="color:var(--text3);font-size:11px;font-family:var(--mono)">Faltan ${diff} días</span>`; }
    }
    return `<div id="deuda-card-${d.id}" style="background:var(--surface);border:1.5px solid ${cardBorder};border-radius:var(--r);overflow:hidden">
      <div style="padding:12px 14px;display:flex;align-items:flex-start;gap:11px">
        <div style="flex:1">
          <div style="font-size:15px;font-weight:700;margin-bottom:2px">${d.acreedor}</div>
          <div style="font-size:20px;font-weight:900;font-family:var(--mono);color:var(--amber);margin-bottom:4px">${d.monto}</div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span style="font-size:12px;color:var(--text3)">📅 ${fechaStr}</span>${urgencia}
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          <button onclick="pagarDeuda(${d.id})" style="width:66px;height:40px;border-radius:10px;background:var(--green-bg);border:1.5px solid var(--green);color:var(--green);font-size:22px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center" title="LIBERAR">✓</button>
          <div style="display:flex; gap:6px;">
            <button onclick="modificarDeuda(${d.id})" style="width:30px;height:30px;border-radius:6px;background:var(--surface2);border:1px solid var(--border2);color:var(--text2);font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center" title="MODIFICAR">✏️</button>
            <button onclick="eliminarDeuda(${d.id})" style="width:30px;height:30px;border-radius:6px;background:var(--red-bg);border:1px solid var(--red);color:var(--red);font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center" title="ELIMINAR">✕</button>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
  updateTotal(activas);
}

function eliminarDeuda(id) {
  if (confirm(isEn ? 'Delete this commitment?' : '¿Eliminar este compromiso?')) {
    deudas = deudas.filter(x => x.id !== id);
    saveDeudas();
    renderDeudas();
  }
}

function modificarDeuda(id) {
  const d = deudas.find(x => x.id === id);
  if (!d) return;
  openDeudaForm();
  document.getElementById('deuda-acreedor').value = d.acreedor;
  document.getElementById('deuda-monto').value = d.monto;
  document.getElementById('deuda-fecha').value = d.fecha;
  editingDeudaId = id;
}

function updateTotal(activas) {
  const el = document.getElementById('deudas-total');
  if (!el) return;
  let sum = 0;
  activas.forEach(d => {
    const clean = d.monto.replace(/[^0-9.,]/g,'').replace(',','.');
    const n = parseFloat(clean);
    if (!isNaN(n)) sum += n;
  });
  let sym = '$';
  const p = (C.pais || '').toLowerCase();
  if (p.includes('peru') || p.includes('perú')) sym = 'S/.';
  else if (p.includes('españa') || p.includes('europa')) sym = '€';
  else if (p.includes('mexico') || p.includes('méxico')) sym = 'MXN';
  el.textContent = sum > 0 ? `${sym} ${sum.toFixed(2)}` : '—';
}

// ═══════════════════════════════════════
// DIAGNÓSTICO — FILE UPLOAD
// ═══════════════════════════════════════
function handleDiagUpload(input) {
  const file = input.files?.[0];
  if (!file) return;
  // Show filename
  const fn = document.getElementById('diag-filename');
  if (fn) fn.textContent = `✓ ${file.name}`;
  const prev = document.getElementById('prev-diagnostico');
  if (file.type === 'application/pdf') {
    if (prev) prev.textContent = '📄';
    // Store just the name for PDF (too large for localStorage usually)
    C.imgDiag = 'pdf:' + file.name;
    localStorage.setItem(KEYS.imgDiag, C.imgDiag);
  } else {
    const reader = new FileReader();
    reader.onload = e => {
      C.imgDiag = e.target.result;
      localStorage.setItem(KEYS.imgDiag, C.imgDiag);
      if (prev) prev.innerHTML = `<img src="${C.imgDiag}" style="width:100%;height:100%;object-fit:cover;border-radius:7px">`;
    };
    reader.readAsDataURL(file);
  }
}

// ═══════════════════════════════════════
// GESTOS DE NAVEGACIÓN — Swipe
// ═══════════════════════════════════════
(function initSwipe() {
  let startX = 0, startY = 0, startTime = 0;
  const THRESHOLD = 80;   // px mínimo para considerar swipe
  const MAX_Y = 60;       // máxima desviación vertical para que sea horizontal
  const MAX_T = 400;      // ms máximo

  document.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startTime = Date.now();
  }, { passive: true });

  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = Math.abs(e.changedTouches[0].clientY - startY);
    const dt = Date.now() - startTime;

    if (Math.abs(dx) < THRESHOLD || dy > MAX_Y || dt > MAX_T) return;

    // Swipe derecha → volver atrás
    if (dx > 0) {
      // No retroceder desde home ni desde setup sin nombre
      const cur = document.querySelector('.screen.active')?.id?.replace('screen-','');
      if (cur === 'home' || cur === 'setup') return;
      // No cerrar SOS con swipe accidental
      if (cur === 'sos') return;
      goBack();
    }
  }, { passive: true });
})();

// ═══════════════════════════════════════
// AUTO-GUARDADO — cada campo se guarda al perder foco
// Previene pérdida de datos si el usuario no toca "Guardar"
// ═══════════════════════════════════════
const INPUT_KEY_MAP = {
  'cfg-nombre':'nombre', 'cfg-cn':'cn', 'cfg-ct':'ct',
  'cfg-d1':'d1', 'cfg-d2':'d2', 'cfg-d3':'d3', 'cfg-d4':'d4', 'cfg-pais':'pais',
  'cfg-mc':'mc', 'cfg-md':'md', 'cfg-comida':'comida',
  'cfg-sangre':'sangre', 'cfg-alergias':'alergias',
  'cfg-hiper':'hiper', 'cfg-hipo':'hipo', 'cfg-triggers':'triggers',
  'cfg-intereses':'intereses',
  'cfg-ocupacion':'ocupacion', 'cfg-horas':'horas', 'cfg-retos':'retos',
  'cfg-apoyo-rel':'apoyoRel',
  'cfg-pet-name':'petName', 'cfg-pet-type':'petType', 'cfg-pet-desc':'petDesc',
  'cfg-obj-name':'objName', 'cfg-obj-desc':'objDesc', 'cfg-obj-location':'objLocation',
  'cfg-lugar-fijo':'lugarFijo', 'cfg-rutas':'rutas', 'cfg-ruta-cambio':'rutaCambio',
  'cfg-rituales':'rituales', 'cfg-peculiaridades':'peculiaridades',
  'cfg-objetos-salida':'objetosSalida', 'cfg-texturas-ropa':'texturasRopa', 'cfg-stimming':'stimming',
  'cfg-taxi-app':'taxiApp', 'cfg-taxi-msg':'taxiMsg'
};
document.addEventListener('blur', function(e) {
  const id = e.target?.id;
  const key = INPUT_KEY_MAP[id];
  if (!key || !KEYS[key]) return;
  const val = e.target.value?.trim() || '';
  C[key] = val;
  try { localStorage.setItem(KEYS[key], val); } catch(err) { console.warn('AutoSave failed:', err); }
}, true);
// ── INIT ── wrapped in try/catch so any error never leaves black screen
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + id);
  if (el) { el.classList.add('active'); el.style.display = 'flex'; }
}
try {
  loadC();
} catch(e) { console.warn('loadC error:', e); }
try {
  LANG = localStorage.getItem('cfg_lang') || 'es';
  document.querySelectorAll('.lang-pill-btn, .profile-lang-btn, .setup-lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === LANG));
  syncLangSliders();
} catch(e) { console.warn('lang init error:', e); }
try {
  applyTheme();
} catch(e) { console.warn('theme error:', e); }
try {
  const saved = localStorage.getItem('cfg_social_bat');
  if (saved !== null) {
    const slider = document.getElementById('sb-slider');
    if (slider) { slider.value = saved; updateBattery(saved); }
  }
} catch(e) {}

// Navigate to first screen — guaranteed to run
try {
  const hasProfile = !!(C.nombre || C.mc || C.hiper || C.ocupacion);
  if (hasProfile) {
    try { applyC(); } catch(e) { console.warn('applyC error:', e); }
    showScreen('home');
  } else {
    try {
      const sb = document.querySelector('.setup-body');
      if (sb) sb.classList.remove('show-all');
      const advInit = document.getElementById('advanced-section');
      if (advInit) advInit.style.display = 'none';
    } catch(e) {}
    showScreen('setup');
  }
} catch(e) {
  console.error('Init navigation error:', e);
  // Absolute fallback — force setup screen visible no matter what
  showScreen('setup');
}

try { applyLang(); } catch(e) { console.warn('applyLang error:', e); }
try { startAlarmChecker(); } catch(e) {}

function handleSubClick() {
  const btn = document.getElementById('sub-pro-btn');
  const isEn = (navigator.language || navigator.userLanguage || 'en').toLowerCase().startsWith('en');
  btn.textContent = isEn ? 'Coming soon 💜' : 'Próximamente 💜';
  btn.style.opacity = '0.7';
  btn.style.cursor = 'default';
  btn.onclick = null;
}

function showToast(msg) {
  const t = document.createElement('div');
  t.style = "position:fixed; bottom:80px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.8); color:white; padding:10px 20px; border-radius:30px; font-size:13px; z-index:10000; animation: fadeUp 0.3s ease-out;";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity 0.5s';
    setTimeout(() => t.remove(), 500);
  }, 2500);
}

// Splash ya manejado por hideSplash() en <head>
