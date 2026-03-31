import { Establecimiento } from '../types';

/**
 * Orden específico de establecimientos según requerimientos del usuario
 * Mantiene la jerarquía: Hospital → Centro de Salud → Puesto de Salud
 * Agrupados por centro de acopio
 */
export const ORDEN_ESTABLECIMIENTOS = [
  // Establecimientos sin centro de acopio específico (nivel regional)
  'HOSP. ESSALUD-ANDAHUAYLAS',
  'HOSPITAL ANDAHUAYLAS',
  
  // Centro de Acopio: ANDAHUAYLAS
  'C.S. ANDAHUAYLAS',
  'C.S. ANDARAPA',
  'P.S. HUANCAS',
  'P.S. HUAMPICA',
  'P.S. ILLAHUASI',
  'P.S. PUYHUALLA',
  'P.S. CHANTA UMACA',
  'P.S. SAN JUAN DE MIRAFLORES',
  
  // Centro de Acopio: SAN JERONIMO
  'C.S. SAN JERONIMO',
  'P.S. ANCATIRA',
  'P.S. LLIUPAPUQUIO',
  'P.S. CHOCCECANCHA',
  'P.S. CHAMPACCOCHA',
  'P.S. POLTOCCSA',
  'P.S. CHULLCUISA',
  'P.S. CUPISA',
  'P.S. OLLABAMBA',
  
  // Centro de Acopio: PACUCHA
  'C.S. PACUCHA',
  'P.S. PUCULLOCCOCHA',
  'P.S. COTAHUACHO',
  'P.S. ARGAMA',
  'P.S. CHURRUBAMBA',
  'P.S. LAGUNA',
  
  // Centro de Acopio: KAKIABAMBA
  'C.S. KAKIABAMBA',
  'P.S. PULLURI',
  'P.S. COCAIRO',
  
  // Centro de Acopio: KISHUARA
  'C.S. KISHUARA',
  'P.S. CAVIRA',
  
  // Centro de Acopio: MATAPUQUIO
  'C.S. MATAPUQUIO',
  'P.S. QUILLABAMBA',
  'P.S. COLPA',
  'P.S. TINTAY',
  'P.S. SOTCCOMAYO',
  
  // Centro de Acopio: TURPO
  'C.S. TURPO',
  'P.S. PALLACCOCHA',
  'P.S. BELEN DE ANTA',
  'P.S. TAYPICHA',
  'P.S. TORACCA',
  'P.S. YANACCMA',
  'P.S. SOCCOSPATA',
  
  // Centro de Acopio: TALAVERA
  'C.S. TALAVERA',
  'P.S. CCACCACHA',
  'P.S. LLANTUYHUANCA',
  'P.S. LUIS PATA',
  'P.S. MULACANCHA',
  'P.S. OSCCOLLOPAMPA',
  'P.S. PAMPAMARCA',
  'P.S. UCHUHUANCARAY',
  'P.S. CHOCCEPUQUIO',
  'P.S. SACHAPUNA',
  
  // Centro de Acopio: CHICMO
  'C.S. CHICMO',
  'C.S. CASCABAMBA',
  'C.S. NUEVA ESPERANZA',
  'P.S. TARAMBA',
  'P.S. REBELDE HUAYRANA',
  'P.S. MOYABAMBA BAJA',
  'P.S. LAMAY',
  'P.S. CCANTUPATA',
  'P.S. HUANCANE',
  'P.S. PARIABAMBA',
  
  // Centro de Acopio: PAMPACHIRI
  'C.S. PAMPACHIRI',
  'P.S. CHILLIHUA',
  'P.S. LLANCAMA',
  'P.S. HUAYANA',
  'P.S. CHECCCHEPAMPA',
  'P.S. POMACOCHA',
  
  // Centro de Acopio: UMAMARCA
  'C.S. UMAMARCA',
  'P.S. VILLA SANTA ROSA',
  'P.S. CCOCHAPUCRO',
  
  // Centro de Acopio: HUANCARAY
  'C.S. HUANCARAY',
  'P.S. MOLLEPATA',
  'P.S. CCANCCAYLLO',
  'P.S. OCCOCHO',
  'P.S. CHIARA',
  'P.S. NUEVA HUILLCAYHUA',
  'P.S. SANTIAGO DE YAURECC',
  'P.S. SAN ANTONIO DE CACHI',
  'P.S. CHULLIZANA',
  'P.S. TANQUIYAURECC',
  'P.S. SAN JUAN DE CULA',
  'P.S. CHACCRAMPA',
  'P.S. IGLESIA PATA',
  'P.S. SAN JUAN PAMPA',
  'P.S. SANTIAGO DE YANACULLO',
  
  // Centro de Acopio: HUANCABAMBA
  'C.S. HUANCABAMBA',
  'P.S. SACCLAYA',
  'P.S. HUINCHOS',
  'P.S. CCEÑUARAN',
  'P.S. SOCCÑACANCHA',
  'P.S. SUCARAYLLA',
  'P.S. SAN JUAN DE OCCOLLO'
];

/**
 * Paleta de colores corporativos claros y profesionales
 * Cada centro de acopio tendrá un color único y distintivo
 */
export const COLORES_CENTROS_ACOPIO = {
  // Colores base para centros principales
  'ANDAHUAYLAS': {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    accent: 'bg-blue-500',
    icon: '🏥',
    name: 'Azul Corporativo'
  },
  'SAN JERONIMO': {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    accent: 'bg-emerald-500',
    icon: '🏢',
    name: 'Verde Esmeralda'
  },
  'PACUCHA': {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-800',
    accent: 'bg-purple-500',
    icon: '🏛️',
    name: 'Púrpura Profesional'
  },
  'KAKIABAMBA': {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-800',
    accent: 'bg-indigo-500',
    icon: '🏗️',
    name: 'Índigo Institucional'
  },
  'KISHUARA': {
    bg: 'bg-zinc-50',
    border: 'border-zinc-200',
    text: 'text-zinc-800',
    accent: 'bg-zinc-500',
    icon: '🏘️',
    name: 'Zinc Claro'
  },
  'MATAPUQUIO': {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    accent: 'bg-blue-500',
    icon: '🏪',
    name: 'Azul Institucional'
  },
  'TURPO': {
    bg: 'bg-zinc-100',
    border: 'border-zinc-300',
    text: 'text-zinc-800',
    accent: 'bg-zinc-600',
    icon: '🏬',
    name: 'Zinc Profundo'
  },
  'TALAVERA': {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-800',
    accent: 'bg-violet-500',
    icon: '🏭',
    name: 'Violeta Elegante'
  },
  'CHICMO': {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-800',
    accent: 'bg-rose-500',
    icon: '🏯',
    name: 'Rosa Corporativo'
  },
  'PAMPACHIRI': {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    accent: 'bg-orange-500',
    icon: '🏰',
    name: 'Naranja Profesional'
  },
  'UMAMARCA': {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    accent: 'bg-amber-500',
    icon: '🏢',
    name: 'Ámbar Institucional'
  },
  'HUANCARAY': {
    bg: 'bg-lime-50',
    border: 'border-lime-200',
    text: 'text-lime-800',
    accent: 'bg-lime-500',
    icon: '🏣',
    name: 'Lima Verde'
  },
  'HUANCABAMBA': {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    accent: 'bg-green-500',
    icon: '🏤',
    name: 'Verde Clásico'
  },
  // Color por defecto para establecimientos sin centro de acopio
  'HOSPITAL ANDAHUAYLAS': {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    accent: 'bg-red-500',
    icon: '🏥',
    name: 'Hospital Andahuaylas'
  },
  'HOSP. ESSALUD-ANDAHUAYLAS': {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-800',
    accent: 'bg-indigo-500',
    icon: '🏥',
    name: 'Hospital EsSalud'
  },
  'DEFAULT': {
    bg: 'bg-zinc-50',
    border: 'border-zinc-200',
    text: 'text-zinc-800',
    accent: 'bg-zinc-500',
    icon: '🏥',
    name: 'Zinc Neutro'
  }
};

/**
 * Mapeo de establecimientos a sus centros de acopio
 * Basado en el orden específico proporcionado
 */
export const ESTABLECIMIENTO_TO_CENTRO: Record<string, string> = {
  // Hospitales como centros de acopio principales
  'HOSP. ESSALUD-ANDAHUAYLAS': 'HOSP. ESSALUD-ANDAHUAYLAS',
  'HOSPITAL ANDAHUAYLAS': 'HOSPITAL ANDAHUAYLAS',
  
  // Centro ANDAHUAYLAS
  'C.S. ANDAHUAYLAS': 'ANDAHUAYLAS',
  'C.S. ANDARAPA': 'ANDAHUAYLAS',
  'P.S. HUANCAS': 'ANDAHUAYLAS',
  'P.S. HUAMPICA': 'ANDAHUAYLAS',
  'P.S. ILLAHUASI': 'ANDAHUAYLAS',
  'P.S. PUYHUALLA': 'ANDAHUAYLAS',
  'P.S. CHANTA UMACA': 'ANDAHUAYLAS',
  'P.S. SAN JUAN DE MIRAFLORES': 'ANDAHUAYLAS',
  
  // Centro SAN JERONIMO
  'C.S. SAN JERONIMO': 'SAN JERONIMO',
  'P.S. ANCATIRA': 'SAN JERONIMO',
  'P.S. LLIUPAPUQUIO': 'SAN JERONIMO',
  'P.S. CHOCCECANCHA': 'SAN JERONIMO',
  'P.S. CHAMPACCOCHA': 'SAN JERONIMO',
  'P.S. POLTOCCSA': 'SAN JERONIMO',
  'P.S. CHULLCUISA': 'SAN JERONIMO',
  'P.S. CUPISA': 'SAN JERONIMO',
  'P.S. OLLABAMBA': 'SAN JERONIMO',

  // Centro PACUCHA
  'C.S. PACUCHA': 'PACUCHA',
  'P.S. PUCULLOCCOCHA': 'PACUCHA',
  'P.S. COTAHUACHO': 'PACUCHA',
  'P.S. ARGAMA': 'PACUCHA',
  'P.S. CHURRUBAMBA': 'PACUCHA',
  'P.S. LAGUNA': 'PACUCHA',

  // Centro KAKIABAMBA
  'C.S. KAKIABAMBA': 'KAKIABAMBA',
  'P.S. PULLURI': 'KAKIABAMBA',
  'P.S. COCAIRO': 'KAKIABAMBA',

  // Centro KISHUARA
  'C.S. KISHUARA': 'KISHUARA',
  'P.S. CAVIRA': 'KISHUARA',

  // Centro MATAPUQUIO
  'C.S. MATAPUQUIO': 'MATAPUQUIO',
  'P.S. QUILLABAMBA': 'MATAPUQUIO',
  'P.S. COLPA': 'MATAPUQUIO',
  'P.S. TINTAY': 'MATAPUQUIO',
  'P.S. SOTCCOMAYO': 'MATAPUQUIO',

  // Centro TURPO
  'C.S. TURPO': 'TURPO',
  'P.S. PALLACCOCHA': 'TURPO',
  'P.S. BELEN DE ANTA': 'TURPO',
  'P.S. TAYPICHA': 'TURPO',
  'P.S. TORACCA': 'TURPO',
  'P.S. YANACCMA': 'TURPO',
  'P.S. SOCCOSPATA': 'TURPO',

  // Centro TALAVERA
  'C.S. TALAVERA': 'TALAVERA',
  'P.S. CCACCACHA': 'TALAVERA',
  'P.S. LLANTUYHUANCA': 'TALAVERA',
  'P.S. LUIS PATA': 'TALAVERA',
  'P.S. MULACANCHA': 'TALAVERA',
  'P.S. OSCCOLLOPAMPA': 'TALAVERA',
  'P.S. PAMPAMARCA': 'TALAVERA',
  'P.S. UCHUHUANCARAY': 'TALAVERA',
  'P.S. CHOCCEPUQUIO': 'TALAVERA',
  'P.S. SACHAPUNA': 'TALAVERA',

  // Centro CHICMO
  'C.S. CHICMO': 'CHICMO',
  'C.S. CASCABAMBA': 'CHICMO',
  'C.S. NUEVA ESPERANZA': 'CHICMO',
  'P.S. TARAMBA': 'CHICMO',
  'P.S. REBELDE HUAYRANA': 'CHICMO',
  'P.S. MOYABAMBA BAJA': 'CHICMO',
  'P.S. LAMAY': 'CHICMO',
  'P.S. CCANTUPATA': 'CHICMO',
  'P.S. HUANCANE': 'CHICMO',
  'P.S. PARIABAMBA': 'CHICMO',

  // Centro PAMPACHIRI
  'C.S. PAMPACHIRI': 'PAMPACHIRI',
  'P.S. CHILLIHUA': 'PAMPACHIRI',
  'P.S. LLANCAMA': 'PAMPACHIRI',
  'P.S. HUAYANA': 'PAMPACHIRI',
  'P.S. CHECCCHEPAMPA': 'PAMPACHIRI',
  'P.S. POMACOCHA': 'PAMPACHIRI',

  // Centro UMAMARCA
  'C.S. UMAMARCA': 'UMAMARCA',
  'P.S. VILLA SANTA ROSA': 'UMAMARCA',
  'P.S. CCOCHAPUCRO': 'UMAMARCA',

  // Centro HUANCARAY
  'C.S. HUANCARAY': 'HUANCARAY',
  'P.S. MOLLEPATA': 'HUANCARAY',
  'P.S. CCANCCAYLLO': 'HUANCARAY',
  'P.S. OCCOCHO': 'HUANCARAY',
  'P.S. CHIARA': 'HUANCARAY',
  'P.S. NUEVA HUILLCAYHUA': 'HUANCARAY',
  'P.S. SANTIAGO DE YAURECC': 'HUANCARAY',
  'P.S. SAN ANTONIO DE CACHI': 'HUANCARAY',
  'P.S. CHULLIZANA': 'HUANCARAY',
  'P.S. TANQUIYAURECC': 'HUANCARAY',
  'P.S. SAN JUAN DE CULA': 'HUANCARAY',
  'P.S. CHACCRAMPA': 'HUANCARAY',
  'P.S. IGLESIA PATA': 'HUANCARAY',
  'P.S. SAN JUAN PAMPA': 'HUANCARAY',
  'P.S. SANTIAGO DE YANACULLO': 'HUANCARAY',

  // Centro HUANCABAMBA
  'C.S. HUANCABAMBA': 'HUANCABAMBA',
  'P.S. SACCLAYA': 'HUANCABAMBA',
  'P.S. HUINCHOS': 'HUANCABAMBA',
  'P.S. CCEÑUARAN': 'HUANCABAMBA',
  'P.S. SOCCÑACANCHA': 'HUANCABAMBA',
  'P.S. SUCARAYLLA': 'HUANCABAMBA',
  'P.S. SAN JUAN DE OCCOLLO': 'HUANCABAMBA'
};

/**
 * Obtiene el centro de acopio asociado a un establecimiento por nombre
 */
export const getCentroAcopioPorNombre = (nombreEstablecimiento: string): string => {
  return ESTABLECIMIENTO_TO_CENTRO[nombreEstablecimiento] || 'DEFAULT';
};

/**
 * Obtiene los colores asociados a un centro de acopio
 */
export const getColoresCentroAcopio = (centroAcopio: string) => {
  return COLORES_CENTROS_ACOPIO[centroAcopio as keyof typeof COLORES_CENTROS_ACOPIO] || COLORES_CENTROS_ACOPIO['DEFAULT'];
};

/**
 * Obtiene los colores de un establecimiento basado en su nombre
 */
export const getColoresEstablecimiento = (nombreEstablecimiento: string) => {
  const centro = getCentroAcopioPorNombre(nombreEstablecimiento);
  return getColoresCentroAcopio(centro);
};

/**
 * Ordena una lista de establecimientos según el orden específico definido
 */
export const ordenarEstablecimientos = (establecimientos: Establecimiento[]): Establecimiento[] => {
  return establecimientos.sort((a, b) => {
    const indexA = ORDEN_ESTABLECIMIENTOS.indexOf(a.nombre);
    const indexB = ORDEN_ESTABLECIMIENTOS.indexOf(b.nombre);

    // Si ambos están en la lista, usar el orden definido
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // Si solo uno está en la lista, ese va primero
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // Si ninguno está en la lista, ordenar alfabéticamente
    return a.nombre.localeCompare(b.nombre);
  });
};

/**
 * Agrupa establecimientos por centro de acopio manteniendo el orden específico
 */
export const agruparPorCentroAcopio = (establecimientos: Establecimiento[]) => {
  const establecimientosOrdenados = ordenarEstablecimientos(establecimientos);
  const grupos: Record<string, Establecimiento[]> = {};

  establecimientosOrdenados.forEach(establecimiento => {
    const centro = getCentroAcopioPorNombre(establecimiento.nombre);
    if (!grupos[centro]) {
      grupos[centro] = [];
    }
    grupos[centro].push(establecimiento);
  });

  return grupos;
};

/**
 * Obtiene el icono apropiado según el tipo de establecimiento
 */
export const getIconoTipoEstablecimiento = (establecimiento: Establecimiento): string => {
  const nombre = establecimiento.nombre.toUpperCase();

  if (nombre.includes('HOSPITAL') || nombre.includes('ESSALUD')) {
    return '🏥';
  } else if (establecimiento.tipo === 'centro_salud' || nombre.includes('C.S.')) {
    return '🏥';
  } else if (establecimiento.tipo === 'puesto_salud' || nombre.includes('P.S.')) {
    return '🏪';
  }

  return '🏥'; // Por defecto
};

/**
 * Genera información completa de estilo para un establecimiento
 */
export const getEstiloEstablecimiento = (establecimiento: Establecimiento) => {
  const colores = getColoresEstablecimiento(establecimiento.nombre);
  const icono = getIconoTipoEstablecimiento(establecimiento);
  const centro = getCentroAcopioPorNombre(establecimiento.nombre);

  return {
    colores,
    icono,
    centro,
    esHospital: establecimiento.nombre.includes('HOSPITAL') || establecimiento.nombre.includes('ESSALUD'),
    esCentroSalud: establecimiento.tipo === 'centro_salud' && !establecimiento.nombre.includes('HOSPITAL'),
    esPuestoSalud: establecimiento.tipo === 'puesto_salud'
  };
};

/**
 * Obtiene todos los centros de acopio únicos de una lista de establecimientos
 */
export const getCentrosAcopioUnicos = (establecimientos: Establecimiento[]): string[] => {
  const centros = new Set<string>();

  establecimientos.forEach(establecimiento => {
    const centro = getCentroAcopioPorNombre(establecimiento.nombre);
    centros.add(centro);
  });

  return Array.from(centros).sort();
};
