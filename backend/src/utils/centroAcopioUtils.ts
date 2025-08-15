/**
 * Utilidades para manejo de centros de acopio y ordenamiento de establecimientos
 * Mantiene consistencia con el frontend
 */

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
 * Paleta de colores corporativos para Excel (formato ARGB)
 * Cada centro de acopio tendrá un color único y distintivo
 */
export const COLORES_CENTROS_ACOPIO_EXCEL = {
  'ANDAHUAYLAS': {
    bg: 'FFE3F2FD', // Azul claro
    text: 'FF1565C0', // Azul oscuro
    accent: 'FF2196F3', // Azul
    name: 'Azul Corporativo'
  },
  'SAN JERONIMO': {
    bg: 'FFE8F5E8', // Verde claro
    text: 'FF2E7D32', // Verde oscuro
    accent: 'FF4CAF50', // Verde
    name: 'Verde Esmeralda'
  },
  'PACUCHA': {
    bg: 'FFF3E5F5', // Púrpura claro
    text: 'FF7B1FA2', // Púrpura oscuro
    accent: 'FF9C27B0', // Púrpura
    name: 'Púrpura Profesional'
  },
  'KAKIABAMBA': {
    bg: 'FFE8EAF6', // Índigo claro
    text: 'FF303F9F', // Índigo oscuro
    accent: 'FF3F51B5', // Índigo
    name: 'Índigo Institucional'
  },
  'KISHUARA': {
    bg: 'FFE0F2F1', // Turquesa claro
    text: 'FF00695C', // Turquesa oscuro
    accent: 'FF009688', // Turquesa
    name: 'Turquesa Claro'
  },
  'MATAPUQUIO': {
    bg: 'FFE0F7FA', // Cian claro
    text: 'FF0097A7', // Cian oscuro
    accent: 'FF00BCD4', // Cian
    name: 'Cian Corporativo'
  },
  'TURPO': {
    bg: 'FFE1F5FE', // Azul cielo claro
    text: 'FF0277BD', // Azul cielo oscuro
    accent: 'FF03A9F4', // Azul cielo
    name: 'Azul Cielo'
  },
  'TALAVERA': {
    bg: 'FFF1F8E9', // Violeta claro
    text: 'FF512DA8', // Violeta oscuro
    accent: 'FF673AB7', // Violeta
    name: 'Violeta Elegante'
  },
  'CHICMO': {
    bg: 'FFFCE4EC', // Rosa claro
    text: 'FFC2185B', // Rosa oscuro
    accent: 'FFE91E63', // Rosa
    name: 'Rosa Corporativo'
  },
  'PAMPACHIRI': {
    bg: 'FFFFF3E0', // Naranja claro
    text: 'FFF57C00', // Naranja oscuro
    accent: 'FFFF9800', // Naranja
    name: 'Naranja Profesional'
  },
  'UMAMARCA': {
    bg: 'FFFFF8E1', // Ámbar claro
    text: 'FFFF8F00', // Ámbar oscuro
    accent: 'FFFFC107', // Ámbar
    name: 'Ámbar Institucional'
  },
  'HUANCARAY': {
    bg: 'FFF9FBE7', // Lima claro
    text: 'FF689F38', // Lima oscuro
    accent: 'FF8BC34A', // Lima
    name: 'Lima Verde'
  },
  'HUANCABAMBA': {
    bg: 'FFE8F5E8', // Verde clásico claro
    text: 'FF388E3C', // Verde clásico oscuro
    accent: 'FF4CAF50', // Verde clásico
    name: 'Verde Clásico'
  },
  // Color por defecto para establecimientos sin centro de acopio
  'DEFAULT': {
    bg: 'FFF5F5F5', // Gris claro
    text: 'FF424242', // Gris oscuro
    accent: 'FF9E9E9E', // Gris
    name: 'Gris Neutro'
  }
};

/**
 * Mapeo de establecimientos a sus centros de acopio
 */
export const ESTABLECIMIENTO_TO_CENTRO: Record<string, string> = {
  // Establecimientos regionales (sin centro específico)
  'HOSP. ESSALUD-ANDAHUAYLAS': 'DEFAULT',
  'HOSPITAL ANDAHUAYLAS': 'DEFAULT',
  
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
 * Obtiene los colores asociados a un centro de acopio para Excel
 */
export const getColoresCentroAcopioExcel = (centroAcopio: string) => {
  return COLORES_CENTROS_ACOPIO_EXCEL[centroAcopio as keyof typeof COLORES_CENTROS_ACOPIO_EXCEL] || COLORES_CENTROS_ACOPIO_EXCEL['DEFAULT'];
};

/**
 * Ordena una lista de establecimientos según el orden específico definido
 */
export const ordenarEstablecimientos = <T extends { nombre: string }>(establecimientos: T[]): T[] => {
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
