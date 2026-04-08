import {
  SibotCapability,
  SibotModule,
  SibotScope,
} from './types';

export const SIBOT_NAME = 'SiBot';
export const SIBOT_MAX_MESSAGE_CHARS = 4000;
export const SIBOT_MAX_HISTORY_MESSAGES = 18;
export const SIBOT_MAX_STEPS = 10;
export const SIBOT_DEFAULT_LIMIT = 25;
export const SIBOT_MAX_LIMIT = 100;

export const SIBOT_SCOPE: SibotScope = {
  roles: ['administrador'],
  mode: 'read-only',
};

export const SIBOT_CAPABILITIES: SibotCapability[] = [
  'chat',
  'streaming',
  'read-only',
  'evidence-first',
  'charts',
  'tables',
  'logs',
];

export const SIBOT_MODULES: SibotModule[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Indicadores ejecutivos, movimientos mensuales, stock por vacuna, alertas y actividad reciente.',
    toolNames: [
      'dashboard_get_summary',
      'dashboard_get_movimientos_mensuales',
      'dashboard_get_stock_por_vacuna',
      'dashboard_get_alertas_recientes',
      'dashboard_get_actividad_reciente',
    ],
  },
  {
    id: 'territorial',
    label: 'Territorial',
    description: 'Redes, microredes, centros de acopio y establecimientos de salud.',
    toolNames: [
      'territorial_get_redes',
      'territorial_get_microredes',
      'territorial_get_centros_acopio',
      'territorial_get_establecimientos',
    ],
  },
  {
    id: 'inventario',
    label: 'Inventario',
    description: 'Vacunas, jeringas, lotes, stock actual, stock crítico y vencimientos.',
    toolNames: [
      'inventario_get_vacunas',
      'inventario_get_jeringas',
      'inventario_get_lotes_vacunas',
      'inventario_get_lotes_jeringas',
      'inventario_get_stock_actual',
      'reportes_get_stock_critico',
      'reportes_get_proximos_vencimientos',
      'reportes_get_lotes_vencidos',
    ],
  },
  {
    id: 'movimientos',
    label: 'Movimientos',
    description: 'Movimientos operativos, consumo histórico, entregas, eficiencia y análisis por establecimiento.',
    toolNames: [
      'movimientos_get_periodo',
      'reportes_get_consumo_historico',
      'reportes_get_entregas_por_establecimiento',
      'reportes_get_eficiencia_distribucion',
      'reportes_get_movimientos_por_eess',
    ],
  },
  {
    id: 'planificacion',
    label: 'Planificación',
    description: 'Programación anual, cumplimiento de metas, proyección de demanda y distribución geográfica.',
    toolNames: [
      'planificacion_get_programacion',
      'planificacion_get_cumplimiento_metas',
      'planificacion_get_proyeccion_demanda',
      'planificacion_get_distribucion_geografica',
    ],
  },
  {
    id: 'cenares',
    label: 'Programación Anual CENARES',
    description: 'Programación anual, tabla completa y seguimiento de saldos del módulo CENARES.',
    toolNames: [
      'cenares_get_programacion',
      'cenares_get_tabla_anual',
      'cenares_get_saldos_seguimiento',
    ],
  },
  {
    id: 'ici_demid',
    label: 'ICI DEMID',
    description: 'Años disponibles, registros por filtros, totales, meses detectados, situación y disponibilidad.',
    toolNames: [
      'ici_demid_get_anios',
      'ici_demid_get_registros',
    ],
  },
  {
    id: 'configuracion_jv',
    label: 'Configuración Jeringa-Vacuna',
    description: 'Configuraciones por defecto, por centro, efectivas y cálculo de jeringas.',
    toolNames: [
      'configuracion_jv_get_defecto',
      'configuracion_jv_get_centro',
      'configuracion_jv_get_efectiva',
      'configuracion_jv_calcular_jeringas',
    ],
  },
  {
    id: 'seguridad',
    label: 'Seguridad y Acceso',
    description: 'Usuarios, roles, permisos y permisos operativos.',
    toolNames: [
      'seguridad_get_usuarios',
      'roles_get_list',
      'roles_get_permissions',
      'permissions_get_list',
      'permissions_get_grouped',
      'permisos_operativos_get_resumen',
      'permisos_operativos_get_usuario',
    ],
  },
  {
    id: 'kardex',
    label: 'Kardex',
    description: 'Historial, trazabilidad y estadísticas de movimientos de inventario.',
    toolNames: [
      'kardex_get_registros',
      'kardex_get_estadisticas',
    ],
  },
  {
    id: 'vales',
    label: 'Vales',
    description: 'Consulta de vales generados, estados y totales asociados.',
    toolNames: [
      'vales_get_list',
    ],
  },
  {
    id: 'alertas',
    label: 'Alertas',
    description: 'Alertas recientes por tipo, nivel y estado de lectura.',
    toolNames: [
      'alertas_get_list',
    ],
  },
  {
    id: 'sistema',
    label: 'Sistema',
    description: 'Configuración visible, diagnóstico técnico e inspección de logs recientes.',
    toolNames: [
      'sistema_get_configuracion_visible',
      'sistema_get_info',
      'logs_get_recent_errors',
    ],
  },
];

export const SIBOT_DOMAIN_KEYWORDS = [
  'sivac',
  'sibot',
  'dashboard',
  'vacuna',
  'vacunas',
  'jeringa',
  'jeringas',
  'lote',
  'lotes',
  'stock',
  'inventario',
  'movimiento',
  'movimientos',
  'planificacion',
  'planificación',
  'reporte',
  'reportes',
  'kardex',
  'vale',
  'vales',
  'alerta',
  'alertas',
  'red',
  'redes',
  'microred',
  'microredes',
  'centro de acopio',
  'centros de acopio',
  'establecimiento',
  'establecimientos',
  'ici',
  'demid',
  'cenares',
  'permiso',
  'permisos',
  'rol',
  'roles',
  'usuario',
  'usuarios',
  'configuracion',
  'configuración',
  'log',
  'logs',
  'error',
  'errores',
  'sistema',
];

export const SIBOT_FOLLOW_UP_KEYWORDS = [
  'y ahora',
  'y tambien',
  'y también',
  'continua',
  'continúa',
  'detalle',
  'detalla',
  'resumen',
  'profundiza',
  'explícalo',
  'explicalo',
  'compara',
  'grafica',
  'gráfico',
  'grafico',
];

export const SIBOT_HELP_KEYWORDS = [
  'que puedes hacer',
  'qué puedes hacer',
  'como ayudas',
  'cómo ayudas',
  'ayuda',
  'help',
  'capacidades',
  'modulos',
  'módulos',
];

export const SIBOT_CASUAL_KEYWORDS = [
  'hola',
  'buenos dias',
  'buenos días',
  'buenas tardes',
  'buenas noches',
  'gracias',
  'ok',
  'entiendo',
];

export const SIBOT_UNSAFE_PATTERNS: RegExp[] = [
  /ignora\s+las\s+instrucciones/i,
  /ignore\s+previous\s+instructions/i,
  /revela(r)?\s+el\s+prompt/i,
  /system\s+prompt/i,
  /developer\s+message/i,
  /api[_\s-]?key/i,
  /database[_\s-]?url/i,
  /token/i,
  /jailbreak/i,
  /prompt\s+injection/i,
  /muestra\s+tus\s+herramientas/i,
  /lista\s+todas\s+las\s+tools/i,
  /haz\s+un\s+insert/i,
  /haz\s+un\s+update/i,
  /haz\s+un\s+delete/i,
  /drop\s+table/i,
  /select\s+\*/i,
];

export const SIBOT_WRITE_PATTERNS: RegExp[] = [
  /\b(crea|crear|actualiza|actualizar|edita|editar|elimina|eliminar|borra|borrar)\b/i,
  /\b(importa|importar|sincroniza|sincronizar|procesa|procesar)\b/i,
  /\b(activa|activar|desactiva|desactivar|cambia|cambiar|guarda|guardar)\b/i,
];

export const SIBOT_MUTATION_TARGET_KEYWORDS = [
  'registro',
  'registros',
  'usuario',
  'usuarios',
  'permiso',
  'permisos',
  'configuracion',
  'configuración',
  'vale',
  'vales',
  'movimiento',
  'movimientos',
  'planificacion',
  'planificación',
  'ici demid',
  'cenares',
  'lote',
  'lotes',
];
