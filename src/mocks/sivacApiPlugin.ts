import type { Plugin } from 'vite';

interface MockReq {
  url?: string;
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  on(event: string, listener: (...args: any[]) => void): void;
}

interface MockRes {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(chunk?: string): void;
}

const nowIso = () => new Date().toISOString();

const ALL_ADMIN_PERMISSIONS = [
  '*',
  'dashboard:read',
  'redes:read', 'redes:write',
  'microredes:read', 'microredes:write',
  'centros_acopio:read', 'centros_acopio:write',
  'establecimientos:read', 'establecimientos:write',
  'vacunas:read', 'vacunas:write',
  'jeringas:read', 'jeringas:write',
  'lotes_vacunas:read', 'lotes_vacunas:write',
  'lotes_jeringas:read', 'lotes_jeringas:write',
  'config_jeringas:read', 'config_jeringas:write',
  'inventario:ingreso',
  'movimientos:read', 'movimientos:write', 'movimientos:anular',
  'planificacion:read', 'planificacion:write', 'planificacion:aprobar',
  'ici_demid:read', 'ici_demid:write',
  'kardex:read', 'kardex:export',
  'reportes_inventario:read', 'reportes_inventario:export',
  'reportes_movimientos:read', 'reportes_movimientos:export',
  'reportes_planificacion:read', 'reportes_planificacion:export',
  'reportes_cenares:read', 'reportes_cenares:export',
  'reportes_config:read', 'reportes_config:write',
  'alertas_dashboard:read', 'alertas:read', 'alertas:write', 'alertas:marcar',
  'alertas_reportes:read', 'alertas_config:read', 'alertas_config:write',
  'usuarios:read', 'usuarios:write', 'usuarios:update', 'usuarios:delete', 'usuarios:password', 'usuarios:estado',
  'roles:read', 'roles:write',
  'permisos:read', 'permisos:assign',
  'config_general:read', 'config_general:write',
  'config_notificaciones:read', 'config_notificaciones:write',
  'config_seguridad:read', 'config_seguridad:write',
  'config_respaldos:read', 'config_respaldos:write',
  'config_sistema:read', 'config_sistema:write',
  'config_mantenimiento:read', 'config_mantenimiento:write',
  'config_integraciones:read', 'config_integraciones:write',
  'config_avanzado:read', 'config_avanzado:write',
];

const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  administrador: ALL_ADMIN_PERMISSIONS,
  coordinador: [
    'dashboard:read',
    'redes:read',
    'microredes:read',
    'centros_acopio:read',
    'establecimientos:read',
    'vacunas:read',
    'jeringas:read',
    'lotes_vacunas:read',
    'lotes_jeringas:read',
    'config_jeringas:read',
    'movimientos:read',
    'planificacion:read',
    'planificacion:write',
    'planificacion:aprobar',
    'kardex:read',
    'kardex:export',
    'reportes_inventario:read',
    'reportes_inventario:export',
    'reportes_movimientos:read',
    'reportes_movimientos:export',
    'reportes_planificacion:read',
    'reportes_planificacion:export',
    'reportes_cenares:read',
    'reportes_cenares:export',
    'alertas_dashboard:read',
    'alertas:read',
    'alertas_reportes:read',
    'roles:read',
    'permisos:read',
    'usuarios:read',
  ],
  responsable_acopio: [
    'dashboard:read',
    'establecimientos:read',
    'vacunas:read',
    'movimientos:read',
    'planificacion:read',
  ],
  operador: [
    'dashboard:read',
    'establecimientos:read',
    'vacunas:read',
    'movimientos:read',
    'planificacion:read',
  ],
};

function createInitialStore() {
  const createdAt = '2025-01-10T08:00:00.000Z';
  const updatedAt = '2026-06-15T10:30:00.000Z';

  const redes = [
    {
      id: 'red-jma',
      nombre: 'JOSE MARIA ARGUEDAS',
      codigo: 'JMA',
      descripcion: 'Red de Salud José María Arguedas',
      estado: 'activo',
      createdAt,
      updatedAt,
      _count: { microredes: 7, centrosAcopio: 12, establecimientos: 61 },
    },
    {
      id: 'red-sdr',
      nombre: 'SONDOR',
      codigo: 'SDR',
      descripcion: 'Red de Salud Sondor',
      estado: 'activo',
      createdAt,
      updatedAt,
      _count: { microredes: 4, centrosAcopio: 6, establecimientos: 32 },
    },
  ];

  const microredes = [
    { id: 'mr-sin', nombre: 'SIN MICRORED', codigo: 'SMR', redId: 'red-jma', estado: 'activo', createdAt, updatedAt },
    { id: 'mr-hcb', nombre: 'HUANCABAMBA', codigo: 'HCB', redId: 'red-jma', estado: 'activo', createdAt, updatedAt },
    { id: 'mr-hcr', nombre: 'HUANCARAY', codigo: 'HCR', redId: 'red-jma', estado: 'activo', createdAt, updatedAt },
    { id: 'mr-pmp', nombre: 'PAMPACHIRI', codigo: 'PMP', redId: 'red-jma', estado: 'activo', createdAt, updatedAt },
    { id: 'mr-chm', nombre: 'CHICMO', codigo: 'CHM', redId: 'red-jma', estado: 'activo', createdAt, updatedAt },
    { id: 'mr-tlv', nombre: 'TALAVERA', codigo: 'TLV', redId: 'red-jma', estado: 'activo', createdAt, updatedAt },
    { id: 'mr-trp', nombre: 'TURPO', codigo: 'TRP', redId: 'red-jma', estado: 'activo', createdAt, updatedAt },
    { id: 'mr-ksh', nombre: 'KISHUARA', codigo: 'KSH', redId: 'red-sdr', estado: 'activo', createdAt, updatedAt },
    { id: 'mr-pch', nombre: 'PACUCHA', codigo: 'PCH', redId: 'red-sdr', estado: 'activo', createdAt, updatedAt },
    { id: 'mr-sjr', nombre: 'SAN JERONIMO', codigo: 'SJR', redId: 'red-sdr', estado: 'activo', createdAt, updatedAt },
    { id: 'mr-and', nombre: 'ANDARAPA', codigo: 'AND', redId: 'red-sdr', estado: 'activo', createdAt, updatedAt },
  ].map((m) => ({
    ...m,
    red: redes.find((r) => r.id === m.redId),
    _count: { centrosAcopio: 2, establecimientos: 8 },
  }));

  const centrosAcopio = [
    { id: 'ca-chanka', nombre: 'ALMACÉN (CHANKA)', codigo: 'CHANKA-001', microredId: 'mr-sin', direccion: 'Almacén Central DISA Apurímac II, Andahuaylas', responsable: 'Q.F. José Luis Quispe León', telefono: '083-400000', estado: 'activo' },
    { id: 'ca-essalud', nombre: 'Hospital ESSALUD Andahuaylas', codigo: '11214', microredId: 'mr-sin', direccion: 'Av. Perú S/N, Andahuaylas', responsable: 'Lic. María Cárdenas', telefono: '083-421234', estado: 'activo' },
    { id: 'ca-handa', nombre: 'Hospital Andahuaylas', codigo: '6803', microredId: 'mr-sin', direccion: 'Av. Hugo Pesce Pescetto, Andahuaylas', responsable: 'Lic. Rosa Gutiérrez', telefono: '083-421000', estado: 'activo' },
    { id: 'ca-csanda', nombre: 'Centro de Salud Andahuaylas', codigo: '6804', microredId: 'mr-sin', direccion: 'Jr. Constitución 415, Andahuaylas', responsable: 'Lic. Carmen Palomino', telefono: '083-421100', estado: 'activo' },
    { id: 'ca-hcb', nombre: 'Huancabamba', codigo: '4172', microredId: 'mr-hcb', direccion: 'Plaza Principal Huancabamba', responsable: 'Lic. Luz Marina Silvera', telefono: '083-422010', estado: 'activo' },
    { id: 'ca-hcr', nombre: 'Huancaray', codigo: '4158', microredId: 'mr-hcr', direccion: 'Huancaray, Andahuaylas', responsable: 'Lic. Nelly Rivas', telefono: '083-422020', estado: 'activo' },
    { id: 'ca-chm', nombre: 'Chicmo', codigo: '4202', microredId: 'mr-chm', direccion: 'Santa María de Chicmo, Andahuaylas', responsable: 'Lic. Gladis Huamán', telefono: '083-422030', estado: 'activo' },
    { id: 'ca-tlv', nombre: 'Talavera', codigo: '4195', microredId: 'mr-tlv', direccion: 'Av. Confraternidad, Talavera', responsable: 'Lic. Sonia Altamirano', telefono: '083-422040', estado: 'activo' },
    { id: 'ca-trp', nombre: 'Turpo', codigo: '4163', microredId: 'mr-trp', direccion: 'Turpo, Andahuaylas', responsable: 'Lic. Edith Rojas', telefono: '083-422050', estado: 'activo' },
    { id: 'ca-ksh', nombre: 'Kishuara', codigo: '4183', microredId: 'mr-ksh', direccion: 'Kishuara, Andahuaylas', responsable: 'Lic. Maribel Ccahuana', telefono: '083-422060', estado: 'activo' },
    { id: 'ca-pch', nombre: 'Pacucha', codigo: '4189', microredId: 'mr-pch', direccion: 'Pacucha, Andahuaylas', responsable: 'Lic. Norma Hurtado', telefono: '083-422070', estado: 'activo' },
    { id: 'ca-sjr', nombre: 'San Jeronimo', codigo: '4167-SJ', microredId: 'mr-sjr', direccion: 'San Jerónimo, Andahuaylas', responsable: 'Lic. Doris Cáceres', telefono: '083-422080', estado: 'activo' },
    { id: 'ca-and', nombre: 'Andarapa', codigo: '4132', microredId: 'mr-and', direccion: 'Andarapa, Andahuaylas', responsable: 'Lic. Yovana Vargas', telefono: '083-422090', estado: 'activo' },
  ].map((ca) => ({
    ...ca,
    createdAt,
    updatedAt,
    microred: microredes.find((m) => m.id === ca.microredId),
    _count: { establecimientos: 6 },
  }));

  const establecimientos = [
    { id: 'est-chanka', nombre: 'ALMACÉN (CHANKA)', tipo: 'hospital', codigo: 'CHANKA-EST-001', centroAcopioId: 'ca-chanka', direccion: 'Almacén Central, Apurímac', responsable: 'Administrador Central', telefono: '083-400000', estado: 'activo' },
    { id: 'est-1', nombre: 'HOSP. ESSALUD-ANDAHUAYLAS', tipo: 'hospital', codigo: '11214', centroAcopioId: 'ca-essalud', direccion: 'Andahuaylas, Apurímac', responsable: 'Lic. María Cárdenas', telefono: '083-420001', estado: 'activo' },
    { id: 'est-2', nombre: 'HOSPITAL ANDAHUAYLAS', tipo: 'hospital', codigo: 'EST-002', centroAcopioId: 'ca-handa', direccion: 'Andahuaylas, Apurímac', responsable: 'Lic. Rosa Gutiérrez', telefono: '083-420002', estado: 'activo' },
    { id: 'est-3', nombre: 'C.S. ANDAHUAYLAS', tipo: 'centro_salud', codigo: '6804', centroAcopioId: 'ca-csanda', direccion: 'Andahuaylas, Apurímac', responsable: 'Lic. Carmen Palomino', telefono: '083-420003', estado: 'activo' },
    { id: 'est-4', nombre: 'C.S. HUANCABAMBA', tipo: 'centro_salud', codigo: '4172', centroAcopioId: 'ca-hcb', direccion: 'Huancabamba, Andahuaylas', responsable: 'Lic. Luz Marina Silvera', telefono: '083-420004', estado: 'activo' },
    { id: 'est-5', nombre: 'P.S. SACCLAYA', tipo: 'puesto_salud', codigo: '4174', centroAcopioId: 'ca-hcb', direccion: 'Sacclaya, Huancabamba', responsable: 'Lic. Raúl Mendoza', telefono: '083-420005', estado: 'activo' },
    { id: 'est-6', nombre: 'P.S. HUINCHOS', tipo: 'puesto_salud', codigo: '4173', centroAcopioId: 'ca-hcb', direccion: 'Huinchos, Huancabamba', responsable: 'Lic. Ana Pérez', telefono: '083-420006', estado: 'activo' },
    { id: 'est-7', nombre: 'C.S. HUANCARAY', tipo: 'centro_salud', codigo: '4158', centroAcopioId: 'ca-hcr', direccion: 'Huancaray, Andahuaylas', responsable: 'Lic. Nelly Rivas', telefono: '083-420007', estado: 'activo' },
    { id: 'est-8', nombre: 'P.S. MOLLEPATA', tipo: 'puesto_salud', codigo: '4159', centroAcopioId: 'ca-hcr', direccion: 'Mollepata, Huancaray', responsable: 'Lic. Jorge Salas', telefono: '083-420008', estado: 'activo' },
    { id: 'est-9', nombre: 'C.S. CHICMO', tipo: 'centro_salud', codigo: '4202', centroAcopioId: 'ca-chm', direccion: 'Santa María de Chicmo', responsable: 'Lic. Gladis Huamán', telefono: '083-420009', estado: 'activo' },
    { id: 'est-10', nombre: 'C.S. CASCABAMBA', tipo: 'centro_salud', codigo: '4203', centroAcopioId: 'ca-chm', direccion: 'Cascabamba, Chicmo', responsable: 'Lic. Elena Vega', telefono: '083-420010', estado: 'activo' },
    { id: 'est-11', nombre: 'C.S. TALAVERA', tipo: 'centro_salud', codigo: '4195', centroAcopioId: 'ca-tlv', direccion: 'Talavera, Andahuaylas', responsable: 'Lic. Sonia Altamirano', telefono: '083-420011', estado: 'activo' },
    { id: 'est-12', nombre: 'P.S. PAMPAMARCA', tipo: 'puesto_salud', codigo: '4198', centroAcopioId: 'ca-tlv', direccion: 'Pampamarca, Talavera', responsable: 'Lic. Víctor Lazo', telefono: '083-420012', estado: 'activo' },
    { id: 'est-13', nombre: 'C.S. TURPO', tipo: 'centro_salud', codigo: '4163', centroAcopioId: 'ca-trp', direccion: 'Turpo, Andahuaylas', responsable: 'Lic. Edith Rojas', telefono: '083-420013', estado: 'activo' },
    { id: 'est-14', nombre: 'C.S. KISHUARA', tipo: 'centro_salud', codigo: '4183', centroAcopioId: 'ca-ksh', direccion: 'Kishuara, Andahuaylas', responsable: 'Lic. Maribel Ccahuana', telefono: '083-420014', estado: 'activo' },
    { id: 'est-15', nombre: 'C.S. PACUCHA', tipo: 'centro_salud', codigo: '4189', centroAcopioId: 'ca-pch', direccion: 'Pacucha, Andahuaylas', responsable: 'Lic. Norma Hurtado', telefono: '083-420015', estado: 'activo' },
    { id: 'est-16', nombre: 'C.S. SAN JERONIMO', tipo: 'centro_salud', codigo: '4167-SJ', centroAcopioId: 'ca-sjr', direccion: 'San Jerónimo, Andahuaylas', responsable: 'Lic. Doris Cáceres', telefono: '083-420016', estado: 'activo' },
    { id: 'est-17', nombre: 'C.S. ANDARAPA', tipo: 'centro_salud', codigo: '4132', centroAcopioId: 'ca-and', direccion: 'Andarapa, Andahuaylas', responsable: 'Lic. Yovana Vargas', telefono: '083-420017', estado: 'activo' },
  ].map((e) => ({
    ...e,
    createdAt,
    updatedAt,
    centroAcopio: centrosAcopio.find((c) => c.id === e.centroAcopioId),
  }));

  const vacunas = [
    { id: 'vac-bcg', codigo: 'VAC-001', nombre: 'BCG', tipo: 'Antituberculosa', presentacion: 'Frasco 10 dosis', dosisPorFrasco: 10, tiempoVidaUtil: 1825, temperaturaAlmacenamiento: '2°C a 8°C', estado: 'activo' },
    { id: 'vac-hvbp', codigo: 'VAC-002', nombre: 'HVB Pediatrico', tipo: 'Hepatitis B', presentacion: 'Frasco unidosis', dosisPorFrasco: 1, tiempoVidaUtil: 1095, temperaturaAlmacenamiento: '2°C a 8°C', estado: 'activo' },
    { id: 'vac-hvba', codigo: 'VAC-003', nombre: 'HVB Adulto', tipo: 'Hepatitis B', presentacion: 'Frasco unidosis', dosisPorFrasco: 1, tiempoVidaUtil: 1095, temperaturaAlmacenamiento: '2°C a 8°C', estado: 'activo' },
    { id: 'vac-penta', codigo: 'VAC-004', nombre: 'Pentavalente', tipo: 'Pentavalente', presentacion: 'Frasco unidosis', dosisPorFrasco: 1, tiempoVidaUtil: 1095, temperaturaAlmacenamiento: '2°C a 8°C', estado: 'activo' },
    { id: 'vac-apo', codigo: 'VAC-005', nombre: 'APO', tipo: 'Antipoliomielítica', presentacion: 'Frasco 20 dosis', dosisPorFrasco: 20, tiempoVidaUtil: 730, temperaturaAlmacenamiento: '2°C a 8°C', estado: 'activo' },
    { id: 'vac-neumo', codigo: 'VAC-006', nombre: 'Neumococo', tipo: 'Antineumocócica', presentacion: 'Frasco unidosis', dosisPorFrasco: 1, tiempoVidaUtil: 1095, temperaturaAlmacenamiento: '2°C a 8°C', estado: 'activo' },
    { id: 'vac-rota', codigo: 'VAC-007', nombre: 'Rotavirus', tipo: 'Antirrotavirus', presentacion: 'Frasco unidosis', dosisPorFrasco: 1, tiempoVidaUtil: 730, temperaturaAlmacenamiento: '2°C a 8°C', estado: 'activo' },
    { id: 'vac-infp', codigo: 'VAC-008', nombre: 'Influenza Pediatrica', tipo: 'Antiinfluenza', presentacion: 'Frasco 20 dosis', dosisPorFrasco: 20, tiempoVidaUtil: 365, temperaturaAlmacenamiento: '2°C a 8°C', estado: 'activo' },
    { id: 'vac-dpt', codigo: 'VAC-009', nombre: 'DPT', tipo: 'DPT Triple', presentacion: 'Frasco 10 dosis', dosisPorFrasco: 10, tiempoVidaUtil: 1095, temperaturaAlmacenamiento: '2°C a 8°C', estado: 'activo' },
    { id: 'vac-spr1', codigo: 'VAC-011', nombre: 'SPR X 1 DOSIS', tipo: 'Triple viral', presentacion: 'Frasco unidosis', dosisPorFrasco: 1, tiempoVidaUtil: 730, temperaturaAlmacenamiento: '2°C a 8°C', estado: 'activo' },
    { id: 'vac-ama', codigo: 'VAC-012', nombre: 'AMA', tipo: 'Antiamarílica', presentacion: 'Frasco 10 dosis', dosisPorFrasco: 10, tiempoVidaUtil: 1095, temperaturaAlmacenamiento: '2°C a 8°C', estado: 'activo' },
    { id: 'vac-dta', codigo: 'VAC-014', nombre: 'Dt Adulto', tipo: 'Antidiftérica-Antitetánica', presentacion: 'Frasco 10 dosis', dosisPorFrasco: 10, tiempoVidaUtil: 1095, temperaturaAlmacenamiento: '2°C a 8°C', estado: 'activo' },
    { id: 'vac-ipv', codigo: 'VAC-016', nombre: 'IPV', tipo: 'Antipoliomielítica', presentacion: 'Frasco unidosis', dosisPorFrasco: 1, tiempoVidaUtil: 1095, temperaturaAlmacenamiento: '2°C a 8°C', estado: 'activo' },
    { id: 'vac-infa', codigo: 'VAC-017', nombre: 'Influenza Adulto', tipo: 'Antiinfluenza', presentacion: 'Frasco unidosis', dosisPorFrasco: 1, tiempoVidaUtil: 365, temperaturaAlmacenamiento: '2°C a 8°C', estado: 'activo' },
    { id: 'vac-vph', codigo: 'VAC-018', nombre: 'VPH', tipo: 'VPH', presentacion: 'Frasco unidosis', dosisPorFrasco: 1, tiempoVidaUtil: 1095, temperaturaAlmacenamiento: '2°C a 8°C', estado: 'activo' },
    { id: 'vac-vari', codigo: 'VAC-019', nombre: 'Varicela', tipo: 'Antivaricela', presentacion: 'Frasco unidosis', dosisPorFrasco: 1, tiempoVidaUtil: 730, temperaturaAlmacenamiento: '2°C a 8°C', estado: 'activo' },
    { id: 'vac-hepa', codigo: 'VAC-022', nombre: 'HEPATITIS A', tipo: 'Hepatitis A', presentacion: 'Frasco unidosis', dosisPorFrasco: 1, tiempoVidaUtil: 1095, temperaturaAlmacenamiento: '2°C a 8°C', estado: 'activo' },
  ].map((v) => ({
    ...v,
    createdAt,
    updatedAt,
    _count: { lotes: 2, planificaciones: 15, movimientos: 30 },
  }));

  const jeringas = [
    { id: 'jer-1', tipo: 'Jeringa autoretractil 1cc 27 G x 1/2"', capacidad: '1cc', color: 'Azul', estado: 'activo', createdAt, updatedAt, _count: { lotes: 2 } },
    { id: 'jer-2', tipo: 'Jeringa autoretractil 1cc 25 G x 5/8"', capacidad: '1cc', color: 'Azul', estado: 'activo', createdAt, updatedAt, _count: { lotes: 2 } },
    { id: 'jer-3', tipo: 'Jeringa autoretractil 1cc 25 G x 1"', capacidad: '1cc', color: 'Azul', estado: 'activo', createdAt, updatedAt, _count: { lotes: 2 } },
    { id: 'jer-5', tipo: 'Jeringa 5cc con aguja 21 G X 1 1/2"', capacidad: '5ml', color: 'Transparente', estado: 'activo', createdAt, updatedAt, _count: { lotes: 2 } },
    { id: 'jer-9', tipo: 'Jeringa 3 mL con aguja 23 G X 1"', capacidad: '3ml', color: 'Transparente', estado: 'activo', createdAt, updatedAt, _count: { lotes: 1 } },
  ];

  const baseLotesVacunas = [
    { id: 'lv-1', numero: '0363G101', vacunaId: 'vac-bcg', fechaIngreso: '2026-01-15T00:00:00.000Z', fechaVencimiento: '2027-08-31T00:00:00.000Z', formaIngreso: '1° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'PEC-00112-2026', cantidadInicial: 600, cantidadActual: 480, estado: 'disponible', observaciones: 'Lote habilitado para uso' },
    { id: 'lv-2', numero: '0344X006', vacunaId: 'vac-hvbp', fechaIngreso: '2026-01-15T00:00:00.000Z', fechaVencimiento: '2027-06-30T00:00:00.000Z', formaIngreso: '1° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'PEC-00113-2026', cantidadInicial: 1800, cantidadActual: 1420, estado: 'disponible', observaciones: 'Lote habilitado para uso' },
    { id: 'lv-3', numero: '2853X019', vacunaId: 'vac-penta', fechaIngreso: '2026-02-10T00:00:00.000Z', fechaVencimiento: '2027-11-30T00:00:00.000Z', formaIngreso: '1° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'PEC-00145-2026', cantidadInicial: 4500, cantidadActual: 3650, estado: 'disponible', observaciones: 'Lote habilitado para uso' },
    { id: 'lv-4', numero: 'AHBVC542AA', vacunaId: 'vac-neumo', fechaIngreso: '2026-02-12T00:00:00.000Z', fechaVencimiento: '2027-09-30T00:00:00.000Z', formaIngreso: '1° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'PEC-00148-2026', cantidadInicial: 3200, cantidadActual: 2740, estado: 'disponible', observaciones: 'Lote habilitado para uso' },
    { id: 'lv-5', numero: 'ROTA2026A', vacunaId: 'vac-rota', fechaIngreso: '2026-03-01T00:00:00.000Z', fechaVencimiento: '2027-05-31T00:00:00.000Z', formaIngreso: '1° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'PEC-00180-2026', cantidadInicial: 2400, cantidadActual: 1910, estado: 'disponible', observaciones: 'Lote habilitado para uso' },
    { id: 'lv-6', numero: 'SPR0158N', vacunaId: 'vac-spr1', fechaIngreso: '2026-03-10T00:00:00.000Z', fechaVencimiento: '2027-10-31T00:00:00.000Z', formaIngreso: '1° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'PEC-00201-2026', cantidadInicial: 3000, cantidadActual: 2490, estado: 'disponible', observaciones: 'Lote habilitado para uso' },
    { id: 'lv-7', numero: 'IPV9924A', vacunaId: 'vac-ipv', fechaIngreso: '2026-04-05T00:00:00.000Z', fechaVencimiento: '2027-12-31T00:00:00.000Z', formaIngreso: '2° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'PEC-00255-2026', cantidadInicial: 3500, cantidadActual: 2980, estado: 'disponible', observaciones: 'Lote habilitado para uso' },
    { id: 'lv-8', numero: 'VPH2026X', vacunaId: 'vac-vph', fechaIngreso: '2026-04-12T00:00:00.000Z', fechaVencimiento: '2028-03-31T00:00:00.000Z', formaIngreso: '2° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'PEC-00260-2026', cantidadInicial: 2800, cantidadActual: 2310, estado: 'disponible', observaciones: 'Campaña escolar VPH' },
    { id: 'lv-9', numero: 'INFA26B', vacunaId: 'vac-infa', fechaIngreso: '2026-05-01T00:00:00.000Z', fechaVencimiento: '2026-11-15T00:00:00.000Z', formaIngreso: '2° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'PEC-00302-2026', cantidadInicial: 5000, cantidadActual: 820, estado: 'disponible', observaciones: 'Campaña invierno - próximo a vencer' },
  ];

  // Ensure every active vaccine has at least one available lot
  vacunas.forEach((v, idx) => {
    if (!baseLotesVacunas.some((l) => l.vacunaId === v.id)) {
      baseLotesVacunas.push({
        id: `lv-auto-${idx + 1}`,
        numero: `LOT26-${String(idx + 10).padStart(3, '0')}`,
        vacunaId: v.id,
        fechaIngreso: '2026-02-20T00:00:00.000Z',
        fechaVencimiento: '2027-10-31T00:00:00.000Z',
        formaIngreso: '1° TRIMESTRE',
        comprobanteClase: 'PECOSA',
        numeroComprobante: `PEC-00${210 + idx}-2026`,
        cantidadInicial: 2400,
        cantidadActual: 1850,
        estado: 'disponible',
        observaciones: 'Lote regular CENARES',
      });
    }
  });

  const lotesVacunas = baseLotesVacunas.map((l) => {
    const v = vacunas.find((vac) => vac.id === l.vacunaId);
    return {
      ...l,
      createdAt,
      updatedAt,
      vacuna: v ? { id: v.id, nombre: v.nombre, tipo: v.tipo, presentacion: v.presentacion } : undefined,
    };
  });

  // Attach lotes to vacunas
  vacunas.forEach((v: any) => {
    v.lotes = lotesVacunas
      .filter((l) => l.vacunaId === v.id)
      .map((l) => ({
        id: l.id,
        numero: l.numero,
        cantidadActual: l.cantidadActual,
        estado: l.estado,
        fechaVencimiento: l.fechaVencimiento,
      }));
  });

  const lotesJeringas = [
    { id: 'lj-1', numero: 'G220216', jeringaId: 'jer-1', fechaIngreso: '2026-01-20T00:00:00.000Z', fechaVencimiento: '2027-08-31T00:00:00.000Z', formaIngreso: '1° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'COMP-2-2026', cantidadInicial: 8000, cantidadActual: 6450, estado: 'disponible', observaciones: 'Lote en condiciones normales' },
    { id: 'lj-2', numero: 'W240804', jeringaId: 'jer-2', fechaIngreso: '2026-02-15T00:00:00.000Z', fechaVencimiento: '2027-09-30T00:00:00.000Z', formaIngreso: '1° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'COMP-21-2026', cantidadInicial: 12000, cantidadActual: 9820, estado: 'disponible', observaciones: 'Lote en condiciones normales' },
    { id: 'lj-3', numero: 'G220218', jeringaId: 'jer-3', fechaIngreso: '2026-03-10T00:00:00.000Z', fechaVencimiento: '2027-10-31T00:00:00.000Z', formaIngreso: '1° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'COMP-7-2026', cantidadInicial: 25600, cantidadActual: 21400, estado: 'disponible', observaciones: 'Lote en condiciones normales' },
    { id: 'lj-4', numero: '20240723', jeringaId: 'jer-5', fechaIngreso: '2026-03-25T00:00:00.000Z', fechaVencimiento: '2029-07-31T00:00:00.000Z', formaIngreso: '1° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'COMP-17-2026', cantidadInicial: 40000, cantidadActual: 34120, estado: 'disponible', observaciones: 'Lote en condiciones normales' },
    { id: 'lj-5', numero: '20220818', jeringaId: 'jer-9', fechaIngreso: '2026-04-05T00:00:00.000Z', fechaVencimiento: '2027-08-31T00:00:00.000Z', formaIngreso: '2° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'COMP-22-2026', cantidadInicial: 5000, cantidadActual: 4100, estado: 'disponible', observaciones: 'Lote en condiciones normales' },
  ].map((l) => {
    const j = jeringas.find((jer) => jer.id === l.jeringaId);
    return {
      ...l,
      createdAt,
      updatedAt,
      jeringa: j ? { id: j.id, tipo: j.tipo, capacidad: j.capacidad, color: j.color } : undefined,
    };
  });

  jeringas.forEach((j: any) => {
    j.lotes = lotesJeringas
      .filter((l) => l.jeringaId === j.id)
      .map((l) => ({
        id: l.id,
        numero: l.numero,
        cantidadActual: l.cantidadActual,
        estado: l.estado,
        fechaVencimiento: l.fechaVencimiento,
      }));
  });

  const permissions = [
    { id: 'perm-1', nombre: 'Ver Dashboard', descripcion: 'Acceso de lectura al panel principal', codigo: 'dashboard:read', recurso: 'dashboard', accion: 'read', categoria: 'Dashboard', estado: 'activo', createdAt, updatedAt, _count: { rolePermissions: 4 } },
    { id: 'perm-2', nombre: 'Ver Redes', descripcion: 'Consultar redes de salud', codigo: 'redes:read', recurso: 'redes', accion: 'read', categoria: 'Establecimientos', estado: 'activo', createdAt, updatedAt, _count: { rolePermissions: 2 } },
    { id: 'perm-3', nombre: 'Ver Microredes', descripcion: 'Consultar microredes de salud', codigo: 'microredes:read', recurso: 'microredes', accion: 'read', categoria: 'Establecimientos', estado: 'activo', createdAt, updatedAt, _count: { rolePermissions: 2 } },
    { id: 'perm-4', nombre: 'Ver Centros de Acopio', descripcion: 'Consultar centros de acopio', codigo: 'centros_acopio:read', recurso: 'centros_acopio', accion: 'read', categoria: 'Establecimientos', estado: 'activo', createdAt, updatedAt, _count: { rolePermissions: 2 } },
    { id: 'perm-5', nombre: 'Ver Establecimientos', descripcion: 'Consultar establecimientos', codigo: 'establecimientos:read', recurso: 'establecimientos', accion: 'read', categoria: 'Establecimientos', estado: 'activo', createdAt, updatedAt, _count: { rolePermissions: 4 } },
    { id: 'perm-6', nombre: 'Ver Vacunas', descripcion: 'Consultar catálogo y lotes de vacunas', codigo: 'vacunas:read', recurso: 'vacunas', accion: 'read', categoria: 'Inventario', estado: 'activo', createdAt, updatedAt, _count: { rolePermissions: 4 } },
    { id: 'perm-7', nombre: 'Gestionar Vacunas', descripcion: 'Crear y editar vacunas y lotes', codigo: 'vacunas:write', recurso: 'vacunas', accion: 'write', categoria: 'Inventario', estado: 'activo', createdAt, updatedAt, _count: { rolePermissions: 1 } },
    { id: 'perm-8', nombre: 'Ver Jeringas', descripcion: 'Consultar catálogo y lotes de jeringas', codigo: 'jeringas:read', recurso: 'jeringas', accion: 'read', categoria: 'Inventario', estado: 'activo', createdAt, updatedAt, _count: { rolePermissions: 2 } },
    { id: 'perm-9', nombre: 'Ver Movimientos', descripcion: 'Consultar movimientos mensuales', codigo: 'movimientos:read', recurso: 'movimientos', accion: 'read', categoria: 'Operaciones', estado: 'activo', createdAt, updatedAt, _count: { rolePermissions: 4 } },
    { id: 'perm-10', nombre: 'Editar Movimientos', descripcion: 'Registrar y actualizar movimientos', codigo: 'movimientos:write', recurso: 'movimientos', accion: 'write', categoria: 'Operaciones', estado: 'activo', createdAt, updatedAt, _count: { rolePermissions: 1 } },
    { id: 'perm-11', nombre: 'Ver Planificación', descripcion: 'Consultar programación anual', codigo: 'planificacion:read', recurso: 'planificacion', accion: 'read', categoria: 'Planificación', estado: 'activo', createdAt, updatedAt, _count: { rolePermissions: 4 } },
    { id: 'perm-12', nombre: 'Editar Planificación', descripcion: 'Crear y editar metas anuales', codigo: 'planificacion:write', recurso: 'planificacion', accion: 'write', categoria: 'Planificación', estado: 'activo', createdAt, updatedAt, _count: { rolePermissions: 2 } },
    { id: 'perm-13', nombre: 'Aprobar Planificación', descripcion: 'Aprobar programación anual', codigo: 'planificacion:aprobar', recurso: 'planificacion', accion: 'aprobar', categoria: 'Planificación', estado: 'activo', createdAt, updatedAt, _count: { rolePermissions: 2 } },
    { id: 'perm-14', nombre: 'Ver Usuarios', descripcion: 'Consultar cuentas de usuario', codigo: 'usuarios:read', recurso: 'usuarios', accion: 'read', categoria: 'Seguridad', estado: 'activo', createdAt, updatedAt, _count: { rolePermissions: 2 } },
    { id: 'perm-15', nombre: 'Gestionar Usuarios', descripcion: 'Crear y editar usuarios', codigo: 'usuarios:write', recurso: 'usuarios', accion: 'write', categoria: 'Seguridad', estado: 'activo', createdAt, updatedAt, _count: { rolePermissions: 1 } },
    { id: 'perm-16', nombre: 'Ver Roles', descripcion: 'Consultar roles del sistema', codigo: 'roles:read', recurso: 'roles', accion: 'read', categoria: 'Seguridad', estado: 'activo', createdAt, updatedAt, _count: { rolePermissions: 2 } },
    { id: 'perm-17', nombre: 'Ver Permisos', descripcion: 'Consultar matriz de permisos', codigo: 'permisos:read', recurso: 'permisos', accion: 'read', categoria: 'Seguridad', estado: 'activo', createdAt, updatedAt, _count: { rolePermissions: 2 } },
  ];

  const roles = [
    {
      id: 'role-admin',
      nombre: 'Administrador',
      descripcion: 'Control total del sistema SIVAC DISA Apurímac II',
      codigo: 'administrador',
      estado: 'activo',
      esDefault: true,
      createdAt,
      updatedAt,
      _count: { usuarios: 1, rolePermissions: permissions.length },
      permissions,
    },
    {
      id: 'role-coord',
      nombre: 'Coordinador',
      descripcion: 'Supervisión de cadena de frío, planificación y reportes regionales',
      codigo: 'coordinador',
      estado: 'activo',
      esDefault: true,
      createdAt,
      updatedAt,
      _count: { usuarios: 1, rolePermissions: 14 },
      permissions: permissions.filter((p) => DEFAULT_ROLE_PERMISSIONS.coordinador.includes(p.codigo)),
    },
    {
      id: 'role-resp',
      nombre: 'Responsable de Acopio',
      descripcion: 'Gestión operativa y seguimiento de centro de acopio asignado',
      codigo: 'responsable_acopio',
      estado: 'activo',
      esDefault: true,
      createdAt,
      updatedAt,
      _count: { usuarios: 2, rolePermissions: 5 },
      permissions: permissions.filter((p) => DEFAULT_ROLE_PERMISSIONS.responsable_acopio.includes(p.codigo)),
    },
    {
      id: 'role-oper',
      nombre: 'Operador',
      descripcion: 'Consulta operativa de establecimientos y programación',
      codigo: 'operador',
      estado: 'activo',
      esDefault: true,
      createdAt,
      updatedAt,
      _count: { usuarios: 1, rolePermissions: 5 },
      permissions: permissions.filter((p) => DEFAULT_ROLE_PERMISSIONS.operador.includes(p.codigo)),
    },
  ];

  const usuarios = [
    {
      id: 'usr-admin',
      nombres: 'José Luis',
      apellidos: 'Quispe León',
      email: 'admin@saludapurimac.gob.pe',
      usuario: 'admin',
      rol: 'administrador',
      roleId: 'role-admin',
      estado: 'activo',
      ultimoAcceso: nowIso(),
      createdAt,
      updatedAt,
      permissions: DEFAULT_ROLE_PERMISSIONS.administrador,
    },
    {
      id: 'usr-coord',
      nombres: 'María Elena',
      apellidos: 'Cárdenas Palomino',
      email: 'coordinacion.pai@saludapurimac.gob.pe',
      usuario: 'mcardenas',
      rol: 'coordinador',
      roleId: 'role-coord',
      estado: 'activo',
      ultimoAcceso: '2026-10-16T15:20:00.000Z',
      createdAt,
      updatedAt,
      permissions: DEFAULT_ROLE_PERMISSIONS.coordinador,
    },
    {
      id: 'usr-resp-1',
      nombres: 'Sonia',
      apellidos: 'Altamirano Silvera',
      email: 'acopio.talavera@saludapurimac.gob.pe',
      usuario: 'saltamirano',
      rol: 'responsable_acopio',
      roleId: 'role-resp',
      centroAcopioId: 'ca-tlv',
      centroAcopioIds: ['ca-tlv'],
      centroAcopio: { id: 'ca-tlv', nombre: 'Talavera', codigo: '4195' },
      centrosAcopioAsignados: [{ centroAcopioId: 'ca-tlv', centroAcopio: { id: 'ca-tlv', nombre: 'Talavera', codigo: '4195' } }],
      estado: 'activo',
      ultimoAcceso: '2026-10-16T11:45:00.000Z',
      createdAt,
      updatedAt,
      permissions: DEFAULT_ROLE_PERMISSIONS.responsable_acopio,
    },
    {
      id: 'usr-resp-qa',
      nombres: 'QA',
      apellidos: 'Responsable Acopio',
      email: 'qa.resp.acopio@saludapurimac.gob.pe',
      usuario: 'qa_resp_acopio',
      rol: 'responsable_acopio',
      roleId: 'role-resp',
      centroAcopioId: 'ca-hcb',
      centroAcopioIds: ['ca-hcb'],
      centroAcopio: { id: 'ca-hcb', nombre: 'Huancabamba', codigo: '4172' },
      centrosAcopioAsignados: [{ centroAcopioId: 'ca-hcb', centroAcopio: { id: 'ca-hcb', nombre: 'Huancabamba', codigo: '4172' } }],
      estado: 'activo',
      ultimoAcceso: '2026-10-15T09:10:00.000Z',
      createdAt,
      updatedAt,
      permissions: DEFAULT_ROLE_PERMISSIONS.responsable_acopio,
    },
  ];

  // Planificaciones anuales para 2025 y 2026
  const planificaciones: any[] = [];
  const targetEstablecimientos = establecimientos.filter((e) => e.id !== 'est-chanka');
  const mainVacunas = vacunas;
  let planIdx = 1;
  for (const anio of [2025, 2026]) {
    for (const est of targetEstablecimientos) {
      for (const vac of mainVacunas) {
        const base = est.tipo === 'hospital' ? 40 : est.tipo === 'centro_salud' ? 20 : 8;
        const distribucionMensual = Array.from({ length: 12 }, (_, m) => base + ((m + planIdx) % 5) * 2);
        const metaAnual = distribucionMensual.reduce((a, b) => a + b, 0);
        planificaciones.push({
          id: `plan-${anio}-${planIdx++}`,
          establecimientoId: est.id,
          vacunaId: vac.id,
          anio,
          metaAnual,
          distribucionMensual,
          estado: 'aprobado',
          createdAt,
          updatedAt,
          establecimiento: {
            id: est.id,
            nombre: est.nombre,
            tipo: est.tipo,
            codigo: est.codigo,
            centroAcopioId: est.centroAcopioId,
          },
          vacuna: {
            id: vac.id,
            nombre: vac.nombre,
            tipo: vac.tipo,
            presentacion: vac.presentacion,
            dosisPorFrasco: vac.dosisPorFrasco,
          },
        });
      }
    }
  }

  // Movimientos mensuales basados en planificación
  const movimientos: any[] = [];
  let movIdx = 1;
  for (const plan of planificaciones) {
    for (let mes = 1; mes <= 12; mes++) {
      const entrega = plan.distribucionMensual[mes - 1] || 15;
      const saldoAnterior = Math.max(4, Math.round(entrega * 0.35));
      const salida = Math.max(0, Math.round((saldoAnterior + entrega) * 0.78));
      movimientos.push({
        id: `mov-${plan.anio}-${mes}-${movIdx++}`,
        establecimientoId: plan.establecimientoId,
        vacunaId: plan.vacunaId,
        mes,
        anio: plan.anio,
        saldoAnterior,
        transIngreso: 0,
        salida,
        transSalida: 0,
        entrega,
        entregaBase: entrega,
        observaciones: 'Distribución mensual programada',
        fechaMovimiento: `${plan.anio}-${String(mes).padStart(2, '0')}-05T08:00:00.000Z`,
        usuarioId: 'usr-admin',
        createdAt,
        updatedAt,
        establecimiento: plan.establecimiento,
        vacuna: plan.vacuna,
        usuario: {
          id: 'usr-admin',
          nombres: 'José Luis',
          apellidos: 'Quispe León',
          email: 'admin@saludapurimac.gob.pe',
        },
        entregasAdicionales: [],
        entregaBaseTieneVale: mes <= 10,
        valeNumeroEntregaBase: mes <= 10 ? `VALE-${plan.anio}-${String(mes).padStart(2, '0')}-001` : undefined,
      });
    }
  }

  const vales = [
    {
      id: 'vale-1',
      numero: 'VALE-2026-10-001',
      centroAcopioId: 'ca-tlv',
      mes: 10,
      anio: 2026,
      fechaGeneracion: '2026-10-04T09:30:00.000Z',
      estado: 'entregado',
      tipoVale: 'solo_base',
      totalVacunas: 420,
      totalEstablecimientos: 2,
      usuarioId: 'usr-admin',
      observaciones: 'Entrega regular mes de Octubre 2026 - Microred Talavera',
      createdAt: '2026-10-04T09:30:00.000Z',
      updatedAt: '2026-10-04T11:00:00.000Z',
      centroAcopio: { id: 'ca-tlv', nombre: 'Talavera', codigo: '4195' },
      usuario: { id: 'usr-admin', nombres: 'José Luis', apellidos: 'Quispe León' },
      detalles: [
        {
          id: 'vd-1',
          valeEntregaId: 'vale-1',
          establecimientoId: 'est-11',
          vacunaId: 'vac-penta',
          cantidadProgramada: 30,
          cantidadAdicional: 0,
          cantidadTotal: 30,
          createdAt: '2026-10-04T09:30:00.000Z',
          establecimiento: { id: 'est-11', nombre: 'C.S. TALAVERA', codigo: '4195' },
          vacuna: { id: 'vac-penta', nombre: 'Pentavalente', presentacion: 'Frasco unidosis', dosisPorFrasco: 1 },
        },
        {
          id: 'vd-2',
          valeEntregaId: 'vale-1',
          establecimientoId: 'est-11',
          vacunaId: 'vac-neumo',
          cantidadProgramada: 25,
          cantidadAdicional: 0,
          cantidadTotal: 25,
          createdAt: '2026-10-04T09:30:00.000Z',
          establecimiento: { id: 'est-11', nombre: 'C.S. TALAVERA', codigo: '4195' },
          vacuna: { id: 'vac-neumo', nombre: 'Neumococo', presentacion: 'Frasco unidosis', dosisPorFrasco: 1 },
        },
      ],
    },
    {
      id: 'vale-2',
      numero: 'VALE-2026-10-002',
      centroAcopioId: 'ca-hcb',
      mes: 10,
      anio: 2026,
      fechaGeneracion: '2026-10-06T14:15:00.000Z',
      estado: 'impreso',
      tipoVale: 'solo_base',
      totalVacunas: 315,
      totalEstablecimientos: 3,
      usuarioId: 'usr-admin',
      observaciones: 'Distribución mensual Huancabamba',
      createdAt: '2026-10-06T14:15:00.000Z',
      updatedAt: '2026-10-06T14:15:00.000Z',
      centroAcopio: { id: 'ca-hcb', nombre: 'Huancabamba', codigo: '4172' },
      usuario: { id: 'usr-admin', nombres: 'José Luis', apellidos: 'Quispe León' },
      detalles: [
        {
          id: 'vd-3',
          valeEntregaId: 'vale-2',
          establecimientoId: 'est-4',
          vacunaId: 'vac-bcg',
          cantidadProgramada: 20,
          cantidadAdicional: 0,
          cantidadTotal: 20,
          createdAt: '2026-10-06T14:15:00.000Z',
          establecimiento: { id: 'est-4', nombre: 'C.S. HUANCABAMBA', codigo: '4172' },
          vacuna: { id: 'vac-bcg', nombre: 'BCG', presentacion: 'Frasco 10 dosis', dosisPorFrasco: 10 },
        },
      ],
    },
  ];

  const kardex = [
    {
      id: 'kdx-1',
      tipo: 'vacuna',
      itemId: 'vac-penta',
      loteId: 'lv-3',
      tipoMovimiento: 'ingreso',
      cantidad: 4500,
      saldoAnterior: 0,
      saldoActual: 4500,
      establecimientoDestinoId: 'est-chanka',
      documento: 'PECOSA',
      numeroDocumento: 'PEC-00145-2026',
      observaciones: 'Ingreso trimestral CENARES - Almacén Central Chanka',
      usuarioId: 'usr-admin',
      fechaMovimiento: '2026-02-10T09:00:00.000Z',
      createdAt: '2026-02-10T09:00:00.000Z',
      item: { id: 'vac-penta', nombre: 'Pentavalente', tipo: 'Pentavalente', presentacion: 'Frasco unidosis' },
      lote: { id: 'lv-3', numero: '2853X019', fechaVencimiento: '2027-11-30T00:00:00.000Z', cantidadInicial: 4500, cantidadActual: 3650 },
      establecimientoDestino: { id: 'est-chanka', nombre: 'ALMACÉN (CHANKA)', tipo: 'hospital', codigo: 'CHANKA-EST-001' },
      usuario: { id: 'usr-admin', nombres: 'José Luis', apellidos: 'Quispe León' },
    },
    {
      id: 'kdx-2',
      tipo: 'vacuna',
      itemId: 'vac-penta',
      loteId: 'lv-3',
      tipoMovimiento: 'salida',
      cantidad: 850,
      saldoAnterior: 4500,
      saldoActual: 3650,
      establecimientoOrigenId: 'est-chanka',
      establecimientoDestinoId: 'est-11',
      documento: 'VALE',
      numeroDocumento: 'VALE-2026-10-001',
      observaciones: 'Entrega programada a Centro de Acopio Talavera',
      usuarioId: 'usr-admin',
      fechaMovimiento: '2026-10-04T09:35:00.000Z',
      createdAt: '2026-10-04T09:35:00.000Z',
      item: { id: 'vac-penta', nombre: 'Pentavalente', tipo: 'Pentavalente', presentacion: 'Frasco unidosis' },
      lote: { id: 'lv-3', numero: '2853X019', fechaVencimiento: '2027-11-30T00:00:00.000Z', cantidadInicial: 4500, cantidadActual: 3650 },
      establecimientoOrigen: { id: 'est-chanka', nombre: 'ALMACÉN (CHANKA)', tipo: 'hospital', codigo: 'CHANKA-EST-001' },
      establecimientoDestino: { id: 'est-11', nombre: 'C.S. TALAVERA', tipo: 'centro_salud', codigo: '4195' },
      usuario: { id: 'usr-admin', nombres: 'José Luis', apellidos: 'Quispe León' },
    },
    {
      id: 'kdx-3',
      tipo: 'jeringa',
      itemId: 'jer-1',
      loteId: 'lj-1',
      tipoMovimiento: 'ingreso',
      cantidad: 8000,
      saldoAnterior: 0,
      saldoActual: 8000,
      establecimientoDestinoId: 'est-chanka',
      documento: 'PECOSA',
      numeroDocumento: 'COMP-2-2026',
      observaciones: 'Ingreso de jeringas autoretráctiles 1cc 27G x 1/2"',
      usuarioId: 'usr-admin',
      fechaMovimiento: '2026-01-20T10:15:00.000Z',
      createdAt: '2026-01-20T10:15:00.000Z',
      item: { id: 'jer-1', nombre: 'Jeringa autoretractil 1cc 27 G x 1/2"', tipo: 'Jeringa autoretractil 1cc 27 G x 1/2"', capacidad: '1cc' },
      lote: { id: 'lj-1', numero: 'G220216', fechaVencimiento: '2027-08-31T00:00:00.000Z', cantidadInicial: 8000, cantidadActual: 6450 },
      establecimientoDestino: { id: 'est-chanka', nombre: 'ALMACÉN (CHANKA)', tipo: 'hospital', codigo: 'CHANKA-EST-001' },
      usuario: { id: 'usr-admin', nombres: 'José Luis', apellidos: 'Quispe León' },
    },
  ];

  const alertas = [
    {
      id: 'alrt-1',
      tipo: 'vencimiento',
      titulo: 'Lote próximo a vencer: Influenza Adulto (INFA26B)',
      descripcion: 'El lote INFA26B de Influenza Adulto (820 dosis) vence el 15/11/2026. Priorizar distribución en campaña.',
      nivel: 'warning',
      fechaCreacion: '2026-10-15T08:00:00.000Z',
      fechaVencimiento: '2026-11-15T00:00:00.000Z',
      leida: false,
      usuarioId: 'usr-admin',
      createdAt: '2026-10-15T08:00:00.000Z',
      updatedAt: '2026-10-15T08:00:00.000Z',
    },
    {
      id: 'alrt-2',
      tipo: 'stock_bajo',
      titulo: 'Reposición sugerida: BCG en C.S. Huancaray',
      descripcion: 'Disponibilidad menor a 1.5 meses de abastecimiento proyectado para el mes en curso.',
      nivel: 'info',
      fechaCreacion: '2026-10-14T14:20:00.000Z',
      leida: false,
      usuarioId: 'usr-admin',
      createdAt: '2026-10-14T14:20:00.000Z',
      updatedAt: '2026-10-14T14:20:00.000Z',
    },
    {
      id: 'alrt-3',
      tipo: 'sistema',
      titulo: 'Sincronización anual CENARES 2026 verificada',
      descripcion: 'Las metas trimestrales Q1-Q4 se encuentran conciliadas con el Almacén Central Chanka.',
      nivel: 'success',
      fechaCreacion: '2026-10-10T11:00:00.000Z',
      leida: true,
      usuarioId: 'usr-admin',
      createdAt: '2026-10-10T11:00:00.000Z',
      updatedAt: '2026-10-10T11:00:00.000Z',
    },
  ];

  const configuraciones = [
    { id: 'cfg-1', clave: 'sistema_nombre', valor: 'SIVAC - Sistema de Gestión de Vacunas', descripcion: 'Nombre del sistema', tipoDato: 'string', categoria: 'general', esPublico: true, createdAt, updatedAt },
    { id: 'cfg-2', clave: 'institucion_nombre', valor: 'DISA Apurímac II', descripcion: 'Nombre de la institución', tipoDato: 'string', categoria: 'general', esPublico: true, createdAt, updatedAt },
    { id: 'cfg-3', clave: 'sistema_version', valor: '1.0.0', descripcion: 'Versión del sistema', tipoDato: 'string', categoria: 'general', esPublico: true, createdAt, updatedAt },
    { id: 'cfg-4', clave: 'timezone', valor: 'America/Lima', descripcion: 'Zona horaria del sistema', tipoDato: 'string', categoria: 'general', esPublico: false, createdAt, updatedAt },
    { id: 'cfg-5', clave: 'stock_minimo_default', valor: '100', descripcion: 'Stock mínimo por defecto para alertas', tipoDato: 'number', categoria: 'alertas', esPublico: false, createdAt, updatedAt },
    { id: 'cfg-6', clave: 'dias_alerta_vencimiento', valor: '30', descripcion: 'Días antes del vencimiento para generar alerta', tipoDato: 'number', categoria: 'alertas', esPublico: false, createdAt, updatedAt },
    { id: 'cfg-7', clave: 'items_per_page', valor: '10', descripcion: 'Número de elementos por página por defecto', tipoDato: 'number', categoria: 'interfaz', esPublico: true, createdAt, updatedAt },
  ];

  const programacionCenares = vacunas.slice(0, 10).map((v, idx) => ({
    id: `cen-${idx + 1}`,
    vacunaId: v.id,
    anio: 2026,
    programadoQ1: 1200 + idx * 150,
    programadoQ2: 1400 + idx * 150,
    programadoQ3: 1350 + idx * 150,
    programadoQ4: 1250 + idx * 150,
    createdAt,
    updatedAt,
    vacuna: {
      id: v.id,
      nombre: v.nombre,
      tipo: v.tipo,
      presentacion: v.presentacion,
    },
  }));

  const permisosOperativosGlobales = {
    movimientos_edicion: {
      habilitado: false,
      programado: false,
      fechaActivacion: null,
      fechaDesactivacion: null,
      esGlobal: true,
    },
    planificacion_edicion: {
      habilitado: false,
      programado: false,
      fechaActivacion: null,
      fechaDesactivacion: null,
      esGlobal: true,
    },
  };

  const iciDemidRegistros = planificaciones
    .filter((p) => p.anio === 2026)
    .map((p, idx) => {
      const totalDistribu = p.distribucionMensual.slice(0, 10).reduce((a: number, b: number) => a + b, 0);
      const stockFin = Math.max(10, Math.round((p.distribucionMensual[9] || 15) * 1.4));
      return {
        id: `ici-2026-${idx + 1}`,
        establecimientoId: p.establecimientoId,
        vacunaId: p.vacunaId,
        anio: 2026,
        distribucionMensual: p.distribucionMensual,
        mesesDisponibles: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        totalDistribu,
        stockFin,
        cpma: Math.max(8, Math.round(p.metaAnual / 12)),
        rotacion: 1.2,
        disponibilidad: '1.8 meses',
        situacion: 'Normostock',
        createdAt,
        updatedAt,
        establecimiento: p.establecimiento,
        vacuna: p.vacuna,
      };
    });

  return {
    redes,
    microredes,
    centrosAcopio,
    establecimientos,
    vacunas,
    jeringas,
    lotesVacunas,
    lotesJeringas,
    usuarios,
    roles,
    permissions,
    planificaciones,
    movimientos,
    vales,
    kardex,
    alertas,
    configuraciones,
    programacionCenares,
    permisosOperativosGlobales,
    iciDemidRegistros,
  };
}

const store = createInitialStore();

function readJsonBody(req: MockReq): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += String(chunk ?? '');
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function sendJson(res: MockRes, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function paginate<T>(items: T[], pageParam?: string | null, limitParam?: string | null) {
  const page = Math.max(1, Number(pageParam) || 1);
  const limit = Math.max(1, Number(limitParam) || 50);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

function getUserFromAuthHeader(req: MockReq) {
  const rawAuth = req.headers.authorization;
  const auth = Array.isArray(rawAuth) ? rawAuth[0] || '' : rawAuth || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (token.startsWith('mock-jwt-token-')) {
    const userId = token.replace('mock-jwt-token-', '');
    const found = store.usuarios.find((u) => u.id === userId);
    if (found) return found;
  }
  return store.usuarios[0];
}

function buildDashboardData() {
  const colors = ['#0e9f8e', '#0284c7', '#2563eb', '#059669', '#d97706', '#dc2626', '#4f46e5', '#0891b2'];
  const now = new Date();
  const currentYear = 2026;
  const currentMonth = 10; // Octubre 2026 (mes operativo activo en el store)
  const limitSoon = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);

  const availableLots = store.lotesVacunas.filter((l) => l.estado === 'disponible');
  const totalStock = availableLots.reduce((acc, l) => acc + l.cantidadActual, 0);

  // Calcular stock real por vacuna a partir de lotes y planificación mensual
  const vacunasConLotes = store.vacunas.filter((v) =>
    availableLots.some((l) => l.vacunaId === v.id)
  );

  const stockPorVacuna = vacunasConLotes.map((v, idx) => {
    const lotesDeVacuna = availableLots.filter((l) => l.vacunaId === v.id);
    const stockVac = lotesDeVacuna.reduce((acc, l) => acc + l.cantidadActual, 0);
    const inicialVac = lotesDeVacuna.reduce((acc, l) => acc + l.cantidadInicial, 0);

    // Meta mensual real sumada de las planificaciones 2026 para esta vacuna
    const planesVacuna = store.planificaciones.filter(
      (p) => p.anio === currentYear && p.vacunaId === v.id
    );
    const metaAnualVacuna = planesVacuna.reduce((acc, p) => acc + (p.metaAnual || 0), 0);
    const stockMinimo = Math.max(300, metaAnualVacuna > 0 ? Math.round(metaAnualVacuna * 0.45) : Math.round(inicialVac * 0.2));

    const proximosVencer = lotesDeVacuna.filter((l) => {
      const fv = new Date(l.fechaVencimiento);
      return fv >= now && fv <= limitSoon;
    }).length;

    const estado: 'critico' | 'bajo' | 'normal' =
      stockVac <= stockMinimo * 0.5 || proximosVencer > 0 && stockVac <= stockMinimo
        ? 'critico'
        : stockVac <= stockMinimo
        ? 'bajo'
        : 'normal';

    return {
      vacunaId: v.id,
      vacunaNombre: v.nombre,
      presentacion: v.presentacion,
      stockTotal: stockVac,
      stockMinimo,
      lotesActivos: lotesDeVacuna.length,
      proximosVencer,
      estado,
      porcentaje: Math.round((stockVac / Math.max(1, totalStock)) * 100),
      color: colors[idx % colors.length],
    };
  });

  // Movimientos mensuales reales de los 12 meses del año en curso calculados desde store.movimientos
  const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const movimientosMensuales = mesesNombres.map((mesNombre, idx) => {
    const mesNum = idx + 1;
    const movsMes = store.movimientos.filter(
      (m) => m.anio === currentYear && m.mes === mesNum
    );
    const entregas = movsMes.reduce((acc, m) => acc + (m.entrega || 0), 0);
    const recepciones = movsMes.reduce((acc, m) => acc + (m.salida || 0), 0);
    const transferencias = movsMes.reduce(
      (acc, m) => acc + (m.transIngreso || 0) + (m.transSalida || 0),
      0
    );
    const saldo = movsMes.reduce(
      (acc, m) => acc + Math.max(0, (m.saldoAnterior || 0) + (m.entrega || 0) - (m.salida || 0)),
      0
    );
    return {
      mes: mesNombre,
      mesNumero: mesNum,
      entregas,
      recepciones,
      transferencias,
      saldo,
    };
  });

  // Estado real por Centro de Acopio calculado según sus establecimientos y movimientos
  const centrosAcopioStatus = store.centrosAcopio.map((ca) => {
    const estsDelCentro = store.establecimientos.filter((e) => e.centroAcopioId === ca.id);
    const estIds = new Set(estsDelCentro.map((e) => e.id));
    const movsCentroMes = store.movimientos.filter(
      (m) => m.anio === currentYear && m.mes === currentMonth && estIds.has(m.establecimientoId)
    );
    const stockCentro =
      ca.id === 'ca-chanka'
        ? totalStock
        : movsCentroMes.reduce(
            (acc, m) => acc + (m.saldoAnterior || 0) + (m.entrega || 0),
            0
          );
    const alertasCentro = store.alertas.filter(
      (a) => !a.leida && a.titulo.toLowerCase().includes(ca.nombre.toLowerCase())
    ).length;

    const estado: 'activo' | 'alerta' | 'critico' =
      alertasCentro > 0 ? 'alerta' : 'activo';

    return {
      id: ca.id,
      codigo: ca.codigo,
      nombre: ca.nombre,
      responsable: ca.responsable,
      establecimientos: estsDelCentro.length,
      stockTotal: stockCentro,
      alertas: alertasCentro,
      estado,
    };
  });

  const alertasRecientes = store.alertas.map((a) => ({
    id: a.id,
    tipo: a.tipo,
    nivel: a.nivel,
    mensaje: a.titulo,
    descripcion: a.descripcion,
    fechaCreacion: a.fechaCreacion,
    establecimiento: a.titulo.includes('Huancaray') ? 'C.S. HUANCARAY' : 'ALMACÉN (CHANKA)',
  }));

  const actividadReciente = [
    {
      id: 'act-1',
      tipo: 'vale_generado',
      descripcion: 'Vale de entrega VALE-2026-10-001 generado para Centro de Acopio Talavera',
      fecha: '2026-10-16T14:30:00.000Z',
      usuario: 'José Luis Quispe León',
      establecimiento: 'C.S. TALAVERA',
    },
    {
      id: 'act-2',
      tipo: 'lote_recibido',
      descripcion: 'Recepción de lote 2853X019 (Pentavalente - 4,500 dosis) vía PECOSA-00145',
      fecha: '2026-10-15T10:15:00.000Z',
      usuario: 'José Luis Quispe León',
      establecimiento: 'ALMACÉN (CHANKA)',
    },
    {
      id: 'act-3',
      tipo: 'movimiento_registrado',
      descripcion: 'Actualización de entregas mensuales Octubre 2026 - Microred Huancabamba',
      fecha: '2026-10-14T16:45:00.000Z',
      usuario: 'María Elena Cárdenas Palomino',
      establecimiento: 'C.S. HUANCABAMBA',
    },
    {
      id: 'act-4',
      tipo: 'vale_generado',
      descripcion: 'Vale de entrega VALE-2026-10-002 impreso para Centro de Acopio Huancabamba',
      fecha: '2026-10-14T11:20:00.000Z',
      usuario: 'José Luis Quispe León',
      establecimiento: 'C.S. HUANCABAMBA',
    },
    {
      id: 'act-5',
      tipo: 'lote_recibido',
      descripcion: 'Ingreso de jeringas autoretráctiles 1cc 27G x 1/2" (Lote G220216)',
      fecha: '2026-10-13T09:10:00.000Z',
      usuario: 'José Luis Quispe León',
      establecimiento: 'ALMACÉN (CHANKA)',
    },
    {
      id: 'act-6',
      tipo: 'movimiento_registrado',
      descripcion: 'Conciliación de saldos de cadena de frío en C.S. Andahuaylas',
      fecha: '2026-10-12T17:05:00.000Z',
      usuario: 'María Elena Cárdenas Palomino',
      establecimiento: 'C.S. ANDAHUAYLAS',
    },
  ];

  const movsMesActual = store.movimientos.filter(
    (m) => m.anio === currentYear && m.mes === currentMonth
  );
  const entregasMesActual = movsMesActual.reduce((acc, m) => acc + (m.entrega || 0), 0);
  const salidasMesActual = movsMesActual.reduce((acc, m) => acc + (m.salida || 0), 0);

  const lotesCriticosCount = availableLots.filter(
    (l) => l.cantidadActual <= l.cantidadInicial * 0.2
  ).length;
  const lotesPorVencerCount = availableLots.filter((l) => {
    const fv = new Date(l.fechaVencimiento);
    return fv >= now && fv <= limitSoon;
  }).length;

  // Resumen real de Planificación Anual 2026
  const planesAnioActual = store.planificaciones.filter((p) => p.anio === currentYear);
  const totalDosisProgramadasAnio = planesAnioActual.reduce(
    (acc, p) => acc + (p.metaAnual || 0),
    0
  );
  const movsHastaMesActual = store.movimientos.filter(
    (m) => m.anio === currentYear && m.mes <= currentMonth
  );
  const totalDosisEjecutadasAnio = movsHastaMesActual.reduce(
    (acc, m) => acc + (m.entrega || 0),
    0
  );
  const totalDosisPendientesAnio = Math.max(
    0,
    totalDosisProgramadasAnio - totalDosisEjecutadasAnio
  );
  const porcentajeAvanceAnual =
    totalDosisProgramadasAnio > 0
      ? Math.min(100, Math.round((totalDosisEjecutadasAnio / totalDosisProgramadasAnio) * 100))
      : 0;

  const estadisticas = {
    totalVacunas: store.vacunas.filter((v) => v.estado === 'activo').length,
    totalJeringas: store.jeringas.filter((j) => j.estado === 'activo').length,
    totalEstablecimientos: store.establecimientos.filter((e) => e.estado === 'activo').length,
    totalUsuarios: store.usuarios.filter((u) => u.estado === 'activo').length,
    centrosAcopio: store.centrosAcopio.filter((c) => c.estado === 'activo').length,
    lotesActivos: availableLots.length,
    stockTotalVacunas: totalStock,
    alertasPendientes: store.alertas.filter((a) => !a.leida).length,
    stockCritico: lotesCriticosCount,
    vencimientoProximo: lotesPorVencerCount,
    entregasMes: entregasMesActual,
    dosisAplicadasMes: salidasMesActual,
    movimientosUltimoMes: movsMesActual.length,
    coberturaRegional: porcentajeAvanceAnual,
    planificacionResumen: {
      anio: currentYear,
      registrosActivos: planesAnioActual.length,
      dosisProgramadas: totalDosisProgramadasAnio,
      dosisEjecutadas: totalDosisEjecutadasAnio,
      dosisPendientes: totalDosisPendientesAnio,
      porcentajeAvance: porcentajeAvanceAnual,
    },
    ultimaActualizacion: nowIso(),
  };

  return {
    estadisticas,
    movimientosMensuales,
    stockPorVacuna,
    centrosAcopio: centrosAcopioStatus,
    alertasRecientes,
    actividadReciente,
  };
}

export function sivacMockApiPlugin(): Plugin {
  return {
    name: 'sivac-mock-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = (req.url || '').replace(/\?\?+/g, '?');
        if (!rawUrl.startsWith('/api') && rawUrl !== '/health') {
          return next();
        }

        const parsedUrl = new URL(rawUrl, 'http://localhost:3000');
        const pathname = parsedUrl.pathname.replace(/\/+$/, '') || '/';
        const params = parsedUrl.searchParams;
        const method = (req.method || 'GET').toUpperCase();

        // Health
        if (pathname === '/health' || pathname === '/api/health') {
          return sendJson(res, 200, {
            success: true,
            message: 'SIVAC API operativa',
            data: { status: 'healthy', database: 'connected', timestamp: nowIso() },
            timestamp: nowIso(),
          });
        }

        // Auth
        if (pathname === '/api/auth/login' && method === 'POST') {
          const body = await readJsonBody(req);
          const identifier = String(body.usuario || '').trim().toLowerCase();
          let user = store.usuarios.find(
            (u) => u.usuario.toLowerCase() === identifier || u.email.toLowerCase() === identifier
          );
          if (!user) {
            user = store.usuarios[0];
          }
          user.ultimoAcceso = nowIso();
          const rolePerms = DEFAULT_ROLE_PERMISSIONS[user.rol] || ['dashboard:read'];
          const authUser = {
            ...user,
            permissions: user.permissions || rolePerms,
          };
          return sendJson(res, 200, {
            success: true,
            message: 'Inicio de sesión exitoso',
            data: {
              user: authUser,
              token: `mock-jwt-token-${authUser.id}`,
              refreshToken: `mock-refresh-token-${authUser.id}`,
              expiresIn: '24h',
            },
            timestamp: nowIso(),
          });
        }

        if (pathname === '/api/auth/verify' && method === 'GET') {
          const user = getUserFromAuthHeader(req);
          return sendJson(res, 200, {
            success: true,
            data: { authenticated: true, user },
            timestamp: nowIso(),
          });
        }

        if (pathname === '/api/auth/profile' && method === 'GET') {
          const user = getUserFromAuthHeader(req);
          return sendJson(res, 200, {
            success: true,
            data: user,
            timestamp: nowIso(),
          });
        }

        if (pathname === '/api/auth/refresh' && method === 'POST') {
          const user = getUserFromAuthHeader(req);
          return sendJson(res, 200, {
            success: true,
            data: {
              accessToken: `mock-jwt-token-${user.id}`,
              refreshToken: `mock-refresh-token-${user.id}`,
              expiresIn: '24h',
            },
            timestamp: nowIso(),
          });
        }

        if (pathname === '/api/auth/logout' || pathname === '/api/auth/change-password') {
          return sendJson(res, 200, {
            success: true,
            message: 'Operación completada exitosamente',
            timestamp: nowIso(),
          });
        }

        // Dashboard
        if (pathname.startsWith('/api/dashboard')) {
          const dash = buildDashboardData();
          if (pathname === '/api/dashboard') {
            return sendJson(res, 200, { success: true, data: dash, timestamp: nowIso() });
          }
          if (pathname === '/api/dashboard/estadisticas') {
            return sendJson(res, 200, { success: true, data: dash.estadisticas, timestamp: nowIso() });
          }
          if (pathname === '/api/dashboard/movimientos-mensuales') {
            return sendJson(res, 200, { success: true, data: dash.movimientosMensuales, timestamp: nowIso() });
          }
          if (pathname === '/api/dashboard/stock-por-vacuna') {
            return sendJson(res, 200, { success: true, data: dash.stockPorVacuna, timestamp: nowIso() });
          }
          if (pathname === '/api/dashboard/centros-acopio-status') {
            return sendJson(res, 200, { success: true, data: dash.centrosAcopio, timestamp: nowIso() });
          }
          if (pathname === '/api/dashboard/centros-acopio') {
            const paged = paginate(dash.centrosAcopio, params.get('page'), params.get('limit') || '5');
            return sendJson(res, 200, { success: true, data: paged, timestamp: nowIso() });
          }
          if (pathname === '/api/dashboard/alertas-recientes') {
            return sendJson(res, 200, { success: true, data: dash.alertasRecientes, timestamp: nowIso() });
          }
          if (pathname === '/api/dashboard/alertas') {
            const paged = paginate(dash.alertasRecientes, params.get('page'), params.get('limit') || '3');
            return sendJson(res, 200, { success: true, data: paged, timestamp: nowIso() });
          }
          if (pathname === '/api/dashboard/actividad-reciente') {
            return sendJson(res, 200, { success: true, data: dash.actividadReciente, timestamp: nowIso() });
          }
          if (pathname === '/api/dashboard/actividad') {
            const paged = paginate(dash.actividadReciente, params.get('page'), params.get('limit') || '5');
            return sendJson(res, 200, { success: true, data: paged, timestamp: nowIso() });
          }
        }

        // Permisos Operativos
        if (pathname.startsWith('/api/permisos-operativos')) {
          if (pathname === '/api/permisos-operativos/mis-permisos') {
            const user = getUserFromAuthHeader(req);
            const isAdmin = user.rol === 'administrador' || user.rol === 'coordinador';
            return sendJson(res, 200, {
              success: true,
              data: {
                movimientos_edicion: isAdmin || store.permisosOperativosGlobales.movimientos_edicion.habilitado,
                planificacion_edicion: isAdmin || store.permisosOperativosGlobales.planificacion_edicion.habilitado,
              },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/permisos-operativos/toggle' && method === 'POST') {
            const body = await readJsonBody(req);
            if (body.tipo === 'movimientos_edicion' || body.tipo === 'planificacion_edicion') {
              store.permisosOperativosGlobales[body.tipo as 'movimientos_edicion' | 'planificacion_edicion'].habilitado = !!body.habilitado;
            }
            return sendJson(res, 200, { success: true, data: {}, timestamp: nowIso() });
          }
          if (pathname === '/api/permisos-operativos/procesar-programados' && method === 'POST') {
            return sendJson(res, 200, { success: true, data: { activados: 0, desactivados: 0 }, timestamp: nowIso() });
          }
          const responsables = store.usuarios
            .filter((u) => u.rol === 'responsable_acopio')
            .map((u) => ({
              id: u.id,
              nombres: u.nombres,
              apellidos: u.apellidos,
              usuario: u.usuario,
              email: u.email,
              estado: u.estado,
              centroAcopio: u.centroAcopio || null,
              centrosAcopioAsignados: u.centrosAcopioAsignados || [],
              permisos: store.permisosOperativosGlobales,
            }));
          return sendJson(res, 200, {
            success: true,
            data: {
              usuarios: responsables,
              globales: store.permisosOperativosGlobales,
            },
            timestamp: nowIso(),
          });
        }

        // Redes
        if (pathname.startsWith('/api/redes')) {
          if (pathname === '/api/redes' && method === 'GET') {
            let list = [...store.redes];
            const search = (params.get('search') || '').toLowerCase();
            const estado = params.get('estado');
            if (estado && estado !== 'todos') list = list.filter((r) => r.estado === estado);
            if (search) list = list.filter((r) => r.nombre.toLowerCase().includes(search) || (r.codigo || '').toLowerCase().includes(search));
            const paged = paginate(list, params.get('page'), params.get('limit'));
            return sendJson(res, 200, { success: true, data: paged.data, pagination: paged.pagination, timestamp: nowIso() });
          }
          if (pathname === '/api/redes' && method === 'POST') {
            const body = await readJsonBody(req);
            const created = {
              id: `red-${Date.now()}`,
              nombre: body.nombre || 'NUEVA RED',
              codigo: body.codigo || 'NRD',
              descripcion: body.descripcion || '',
              estado: 'activo' as const,
              createdAt: nowIso(),
              updatedAt: nowIso(),
              _count: { microredes: 0, centrosAcopio: 0, establecimientos: 0 },
            };
            store.redes.push(created);
            return sendJson(res, 201, { success: true, data: created, timestamp: nowIso() });
          }
          const id = pathname.split('/').pop()!;
          const existingIdx = store.redes.findIndex((r) => r.id === id);
          if (method === 'GET' && existingIdx >= 0) {
            return sendJson(res, 200, { success: true, data: store.redes[existingIdx], timestamp: nowIso() });
          }
          if ((method === 'PUT' || method === 'PATCH') && existingIdx >= 0) {
            const body = await readJsonBody(req);
            store.redes[existingIdx] = { ...store.redes[existingIdx], ...body, updatedAt: nowIso() };
            return sendJson(res, 200, { success: true, data: store.redes[existingIdx], timestamp: nowIso() });
          }
          if (method === 'DELETE' && existingIdx >= 0) {
            store.redes.splice(existingIdx, 1);
            return sendJson(res, 200, { success: true, data: true, timestamp: nowIso() });
          }
        }

        // Microredes
        if (pathname.startsWith('/api/microredes')) {
          if (pathname.startsWith('/api/microredes/red/')) {
            const redId = pathname.split('/').pop()!;
            const list = store.microredes.filter((m) => m.redId === redId);
            return sendJson(res, 200, { success: true, data: list, timestamp: nowIso() });
          }
          if (pathname === '/api/microredes' && method === 'GET') {
            let list = [...store.microredes];
            const redId = params.get('redId');
            const estado = params.get('estado');
            const search = (params.get('search') || '').toLowerCase();
            if (redId) list = list.filter((m) => m.redId === redId);
            if (estado && estado !== 'todos') list = list.filter((m) => m.estado === estado);
            if (search) list = list.filter((m) => m.nombre.toLowerCase().includes(search));
            const paged = paginate(list, params.get('page'), params.get('limit'));
            return sendJson(res, 200, { success: true, data: paged.data, pagination: paged.pagination, timestamp: nowIso() });
          }
          if (pathname === '/api/microredes' && method === 'POST') {
            const body = await readJsonBody(req);
            const created = {
              id: `mr-${Date.now()}`,
              nombre: body.nombre,
              codigo: body.codigo || 'MR',
              redId: body.redId || 'red-jma',
              estado: 'activo' as const,
              createdAt: nowIso(),
              updatedAt: nowIso(),
              red: store.redes.find((r) => r.id === body.redId) || store.redes[0],
              _count: { centrosAcopio: 0, establecimientos: 0 },
            };
            store.microredes.push(created);
            return sendJson(res, 201, { success: true, data: created, timestamp: nowIso() });
          }
          const id = pathname.split('/').pop()!;
          const idx = store.microredes.findIndex((m) => m.id === id);
          if (idx >= 0) {
            if (method === 'GET') return sendJson(res, 200, { success: true, data: store.microredes[idx], timestamp: nowIso() });
            if (method === 'PUT' || method === 'PATCH') {
              const body = await readJsonBody(req);
              store.microredes[idx] = { ...store.microredes[idx], ...body, updatedAt: nowIso() };
              return sendJson(res, 200, { success: true, data: store.microredes[idx], timestamp: nowIso() });
            }
            if (method === 'DELETE') {
              store.microredes.splice(idx, 1);
              return sendJson(res, 200, { success: true, data: true, timestamp: nowIso() });
            }
          }
        }

        // Centros de Acopio
        if (pathname.startsWith('/api/centros-acopio')) {
          if (pathname.startsWith('/api/centros-acopio/microred/')) {
            const mrId = pathname.split('/').pop()!;
            return sendJson(res, 200, {
              success: true,
              data: store.centrosAcopio.filter((c) => c.microredId === mrId),
              timestamp: nowIso(),
            });
          }
          if (pathname.startsWith('/api/centros-acopio/red/')) {
            const redId = pathname.split('/').pop()!;
            return sendJson(res, 200, {
              success: true,
              data: store.centrosAcopio.filter((c) => c.microred?.redId === redId),
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/centros-acopio' && method === 'GET') {
            let list = [...store.centrosAcopio];
            const microredId = params.get('microredId');
            const redId = params.get('redId');
            const estado = params.get('estado');
            const search = (params.get('search') || '').toLowerCase();
            if (microredId) list = list.filter((c) => c.microredId === microredId);
            if (redId) list = list.filter((c) => c.microred?.redId === redId);
            if (estado && estado !== 'todos') list = list.filter((c) => c.estado === estado);
            if (search) list = list.filter((c) => c.nombre.toLowerCase().includes(search) || (c.codigo || '').toLowerCase().includes(search));
            const paged = paginate(list, params.get('page'), params.get('limit'));
            return sendJson(res, 200, { success: true, data: paged.data, pagination: paged.pagination, timestamp: nowIso() });
          }
          if (pathname === '/api/centros-acopio' && method === 'POST') {
            const body = await readJsonBody(req);
            const created = {
              id: `ca-${Date.now()}`,
              nombre: body.nombre,
              codigo: body.codigo || `CA-${Date.now().toString().slice(-3)}`,
              microredId: body.microredId || 'mr-sin',
              direccion: body.direccion || 'Apurímac',
              responsable: body.responsable || 'Responsable',
              telefono: body.telefono || '',
              estado: 'activo' as const,
              createdAt: nowIso(),
              updatedAt: nowIso(),
              microred: store.microredes.find((m) => m.id === body.microredId) || store.microredes[0],
              _count: { establecimientos: 0 },
            };
            store.centrosAcopio.push(created);
            return sendJson(res, 201, { success: true, data: created, timestamp: nowIso() });
          }
          const id = pathname.split('/').pop()!;
          const idx = store.centrosAcopio.findIndex((c) => c.id === id);
          if (idx >= 0) {
            if (method === 'GET') return sendJson(res, 200, { success: true, data: store.centrosAcopio[idx], timestamp: nowIso() });
            if (method === 'PUT' || method === 'PATCH') {
              const body = await readJsonBody(req);
              store.centrosAcopio[idx] = { ...store.centrosAcopio[idx], ...body, updatedAt: nowIso() };
              return sendJson(res, 200, { success: true, data: store.centrosAcopio[idx], timestamp: nowIso() });
            }
            if (method === 'DELETE') {
              store.centrosAcopio.splice(idx, 1);
              return sendJson(res, 200, { success: true, data: true, timestamp: nowIso() });
            }
          }
        }

        // Establecimientos
        if (pathname.startsWith('/api/establecimientos')) {
          if (pathname === '/api/establecimientos/centros-acopio') {
            return sendJson(res, 200, { success: true, data: store.centrosAcopio, timestamp: nowIso() });
          }
          if (pathname.startsWith('/api/establecimientos/centro-acopio/')) {
            const caId = pathname.split('/').pop()!;
            return sendJson(res, 200, {
              success: true,
              data: store.establecimientos.filter((e) => e.centroAcopioId === caId),
              timestamp: nowIso(),
            });
          }
          if (pathname.startsWith('/api/establecimientos/validate-codigo/')) {
            return sendJson(res, 200, { success: true, data: { available: true }, timestamp: nowIso() });
          }
          if (pathname === '/api/establecimientos' && method === 'GET') {
            let list = [...store.establecimientos];
            const tipo = params.get('tipo');
            const estado = params.get('estado');
            const centroAcopioId = params.get('centroAcopioId');
            const microredId = params.get('microredId');
            const redId = params.get('redId');
            const search = (params.get('search') || '').toLowerCase();
            if (tipo && tipo !== 'todos') list = list.filter((e) => e.tipo === tipo);
            if (estado && estado !== 'todos') list = list.filter((e) => e.estado === estado);
            if (centroAcopioId) list = list.filter((e) => e.centroAcopioId === centroAcopioId);
            if (microredId) list = list.filter((e) => e.centroAcopio?.microredId === microredId);
            if (redId) list = list.filter((e) => e.centroAcopio?.microred?.redId === redId);
            if (search) {
              list = list.filter(
                (e) => e.nombre.toLowerCase().includes(search) || e.codigo.toLowerCase().includes(search)
              );
            }
            const limitParam = params.get('noPagination') === 'true' ? String(list.length || 100) : params.get('limit');
            const paged = paginate(list, params.get('page'), limitParam);
            return sendJson(res, 200, {
              success: true,
              message: 'Establecimientos obtenidos',
              data: paged.data,
              pagination: paged.pagination,
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/establecimientos' && method === 'POST') {
            const body = await readJsonBody(req);
            const ca = store.centrosAcopio.find((c) => c.id === body.centroAcopioId) || store.centrosAcopio[0];
            const created = {
              id: `est-${Date.now()}`,
              nombre: body.nombre,
              tipo: body.tipo || 'puesto_salud',
              codigo: body.codigo || `EST-${Date.now().toString().slice(-3)}`,
              centroAcopioId: ca.id,
              direccion: body.direccion || 'Apurímac',
              responsable: body.responsable || 'Responsable',
              telefono: body.telefono || '',
              estado: 'activo' as const,
              createdAt: nowIso(),
              updatedAt: nowIso(),
              centroAcopio: ca,
            };
            store.establecimientos.push(created);
            return sendJson(res, 201, { success: true, data: created, timestamp: nowIso() });
          }
          const parts = pathname.split('/');
          const id = parts[3];
          const idx = store.establecimientos.findIndex((e) => e.id === id);
          if (idx >= 0) {
            if (method === 'GET') return sendJson(res, 200, { success: true, data: store.establecimientos[idx], timestamp: nowIso() });
            if (method === 'PUT' || method === 'PATCH') {
              const body = await readJsonBody(req);
              store.establecimientos[idx] = { ...store.establecimientos[idx], ...body, updatedAt: nowIso() };
              return sendJson(res, 200, { success: true, data: store.establecimientos[idx], timestamp: nowIso() });
            }
            if (method === 'DELETE') {
              store.establecimientos.splice(idx, 1);
              return sendJson(res, 200, { success: true, timestamp: nowIso() });
            }
          }
        }

        // Vacunas
        if (pathname.startsWith('/api/vacunas')) {
          if (pathname === '/api/vacunas/activas') {
            return sendJson(res, 200, {
              success: true,
              data: store.vacunas.filter((v) => v.estado === 'activo'),
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/vacunas/stats/stock') {
            return sendJson(res, 200, {
              success: true,
              data: {
                totalVacunas: store.vacunas.length,
                vacunasActivas: store.vacunas.filter((v) => v.estado === 'activo').length,
                stockTotal: store.lotesVacunas.reduce((s, l) => s + l.cantidadActual, 0),
              },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/vacunas' && method === 'GET') {
            let list = [...store.vacunas];
            const estado = params.get('estado');
            const search = (params.get('search') || '').toLowerCase();
            if (estado && estado !== 'todos') list = list.filter((v) => v.estado === estado);
            if (search) list = list.filter((v) => v.nombre.toLowerCase().includes(search) || v.tipo.toLowerCase().includes(search));
            const paged = paginate(list, params.get('page'), params.get('limit'));
            return sendJson(res, 200, {
              success: true,
              message: 'Vacunas obtenidas',
              data: paged.data,
              pagination: paged.pagination,
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/vacunas' && method === 'POST') {
            const body = await readJsonBody(req);
            const created: any = {
              id: `vac-${Date.now()}`,
              codigo: body.codigo || `VAC-${Date.now().toString().slice(-3)}`,
              nombre: body.nombre,
              tipo: body.tipo || 'Vacuna',
              presentacion: body.presentacion || 'Frasco unidosis',
              dosisPorFrasco: Number(body.dosisPorFrasco) || 1,
              tiempoVidaUtil: Number(body.tiempoVidaUtil) || 1095,
              temperaturaAlmacenamiento: body.temperaturaAlmacenamiento || '2°C a 8°C',
              estado: 'activo',
              createdAt: nowIso(),
              updatedAt: nowIso(),
              lotes: [],
              _count: { lotes: 0, planificaciones: 0, movimientos: 0 },
            };
            store.vacunas.push(created);
            return sendJson(res, 201, { success: true, data: created, timestamp: nowIso() });
          }
          const id = pathname.split('/')[3];
          const idx = store.vacunas.findIndex((v) => v.id === id);
          if (idx >= 0) {
            if (method === 'GET') return sendJson(res, 200, { success: true, data: store.vacunas[idx], timestamp: nowIso() });
            if (method === 'PUT' || method === 'PATCH') {
              const body = await readJsonBody(req);
              store.vacunas[idx] = { ...store.vacunas[idx], ...body, updatedAt: nowIso() };
              return sendJson(res, 200, { success: true, data: store.vacunas[idx], timestamp: nowIso() });
            }
            if (method === 'DELETE') {
              store.vacunas.splice(idx, 1);
              return sendJson(res, 200, { success: true, timestamp: nowIso() });
            }
          }
        }

        // Jeringas
        if (pathname.startsWith('/api/jeringas')) {
          if (pathname === '/api/jeringas/activas') {
            return sendJson(res, 200, {
              success: true,
              data: store.jeringas.filter((j) => j.estado === 'activo'),
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/jeringas/stats') {
            return sendJson(res, 200, {
              success: true,
              data: {
                total: store.jeringas.length,
                activas: store.jeringas.filter((j) => j.estado === 'activo').length,
                inactivas: store.jeringas.filter((j) => j.estado !== 'activo').length,
                stockTotal: store.lotesJeringas.reduce((s, l) => s + l.cantidadActual, 0),
              },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/jeringas' && method === 'GET') {
            let list = [...store.jeringas];
            const estado = params.get('estado');
            const search = (params.get('search') || '').toLowerCase();
            if (estado && estado !== 'todos') list = list.filter((j) => j.estado === estado);
            if (search) list = list.filter((j) => j.tipo.toLowerCase().includes(search) || j.capacidad.toLowerCase().includes(search));
            const paged = paginate(list, params.get('page'), params.get('limit'));
            return sendJson(res, 200, {
              success: true,
              message: 'Jeringas obtenidas',
              data: paged.data,
              pagination: paged.pagination,
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/jeringas' && method === 'POST') {
            const body = await readJsonBody(req);
            const created: any = {
              id: `jer-${Date.now()}`,
              tipo: body.tipo,
              capacidad: body.capacidad || '1cc',
              color: body.color || 'Azul',
              estado: 'activo',
              createdAt: nowIso(),
              updatedAt: nowIso(),
              lotes: [],
              _count: { lotes: 0 },
            };
            store.jeringas.push(created);
            return sendJson(res, 201, { success: true, data: created, timestamp: nowIso() });
          }
          const id = pathname.split('/')[3];
          const idx = store.jeringas.findIndex((j) => j.id === id);
          if (idx >= 0) {
            if (method === 'GET') return sendJson(res, 200, { success: true, data: store.jeringas[idx], timestamp: nowIso() });
            if (method === 'PUT' || method === 'PATCH') {
              const body = await readJsonBody(req);
              store.jeringas[idx] = { ...store.jeringas[idx], ...body, updatedAt: nowIso() };
              return sendJson(res, 200, { success: true, data: store.jeringas[idx], timestamp: nowIso() });
            }
            if (method === 'DELETE') {
              store.jeringas.splice(idx, 1);
              return sendJson(res, 200, { success: true, timestamp: nowIso() });
            }
          }
        }

        // Lotes Vacunas
        if (pathname.startsWith('/api/lotes-vacunas')) {
          if (pathname === '/api/lotes-vacunas/stats') {
            return sendJson(res, 200, {
              success: true,
              data: {
                total: store.lotesVacunas.length,
                disponibles: store.lotesVacunas.filter((l) => l.estado === 'disponible').length,
                vencidos: store.lotesVacunas.filter((l) => l.estado === 'vencido').length,
                agotados: store.lotesVacunas.filter((l) => l.estado === 'agotado').length,
                porVencer: 1,
                stockTotal: store.lotesVacunas.reduce((s, l) => s + l.cantidadActual, 0),
              },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/lotes-vacunas/disponibles') {
            return sendJson(res, 200, {
              success: true,
              data: store.lotesVacunas.filter((l) => l.estado === 'disponible'),
              timestamp: nowIso(),
            });
          }
          if (pathname.startsWith('/api/lotes-vacunas/vacuna/')) {
            const vacId = pathname.split('/').pop()!;
            return sendJson(res, 200, {
              success: true,
              data: store.lotesVacunas.filter((l) => l.vacunaId === vacId),
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/lotes-vacunas' && method === 'GET') {
            let list = [...store.lotesVacunas];
            const vacunaId = params.get('vacunaId');
            const estado = params.get('estado');
            const search = (params.get('search') || '').toLowerCase();
            if (vacunaId) list = list.filter((l) => l.vacunaId === vacunaId);
            if (estado && estado !== 'todos') list = list.filter((l) => l.estado === estado);
            if (search) list = list.filter((l) => l.numero.toLowerCase().includes(search) || (l.vacuna?.nombre || '').toLowerCase().includes(search));
            const paged = paginate(list, params.get('page'), params.get('limit'));
            return sendJson(res, 200, {
              success: true,
              message: 'Lotes de vacunas obtenidos',
              data: paged.data,
              pagination: paged.pagination,
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/lotes-vacunas' && method === 'POST') {
            const body = await readJsonBody(req);
            const vac = store.vacunas.find((v) => v.id === body.vacunaId) || store.vacunas[0];
            const created = {
              id: `lv-${Date.now()}`,
              numero: body.numero,
              vacunaId: vac.id,
              fechaIngreso: body.fechaIngreso || nowIso(),
              fechaVencimiento: body.fechaVencimiento || '2027-12-31T00:00:00.000Z',
              formaIngreso: body.formaIngreso || '1° TRIMESTRE',
              comprobanteClase: body.comprobanteClase || 'PECOSA',
              numeroComprobante: body.numeroComprobante || 'PEC-2026',
              cantidadInicial: Number(body.cantidadInicial) || 100,
              cantidadActual: Number(body.cantidadActual ?? body.cantidadInicial) || 100,
              estado: 'disponible',
              observaciones: body.observaciones || '',
              createdAt: nowIso(),
              updatedAt: nowIso(),
              vacuna: { id: vac.id, nombre: vac.nombre, tipo: vac.tipo, presentacion: vac.presentacion },
            };
            store.lotesVacunas.unshift(created);
            return sendJson(res, 201, { success: true, data: created, timestamp: nowIso() });
          }
          const id = pathname.split('/')[3];
          const idx = store.lotesVacunas.findIndex((l) => l.id === id);
          if (idx >= 0) {
            if (method === 'GET') return sendJson(res, 200, { success: true, data: store.lotesVacunas[idx], timestamp: nowIso() });
            if (method === 'PUT' || method === 'PATCH') {
              const body = await readJsonBody(req);
              store.lotesVacunas[idx] = { ...store.lotesVacunas[idx], ...body, updatedAt: nowIso() };
              return sendJson(res, 200, { success: true, data: store.lotesVacunas[idx], timestamp: nowIso() });
            }
            if (method === 'DELETE') {
              store.lotesVacunas.splice(idx, 1);
              return sendJson(res, 200, { success: true, timestamp: nowIso() });
            }
          }
        }

        // Lotes Jeringas
        if (pathname.startsWith('/api/lotes-jeringas')) {
          if (pathname === '/api/lotes-jeringas/stats') {
            return sendJson(res, 200, {
              success: true,
              data: {
                total: store.lotesJeringas.length,
                disponibles: store.lotesJeringas.filter((l) => l.estado === 'disponible').length,
                agotados: store.lotesJeringas.filter((l) => l.estado === 'agotado').length,
                stockBajo: 0,
                stockTotal: store.lotesJeringas.reduce((s, l) => s + l.cantidadActual, 0),
              },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/lotes-jeringas/disponibles') {
            return sendJson(res, 200, {
              success: true,
              data: store.lotesJeringas.filter((l) => l.estado === 'disponible'),
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/lotes-jeringas' && method === 'GET') {
            let list = [...store.lotesJeringas];
            const jeringaId = params.get('jeringaId');
            const estado = params.get('estado');
            const search = (params.get('search') || '').toLowerCase();
            if (jeringaId) list = list.filter((l) => l.jeringaId === jeringaId);
            if (estado && estado !== 'todos') list = list.filter((l) => l.estado === estado);
            if (search) list = list.filter((l) => l.numero.toLowerCase().includes(search));
            const paged = paginate(list, params.get('page'), params.get('limit'));
            return sendJson(res, 200, {
              success: true,
              message: 'Lotes de jeringas obtenidos',
              data: paged.data,
              pagination: paged.pagination,
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/lotes-jeringas' && method === 'POST') {
            const body = await readJsonBody(req);
            const jer = store.jeringas.find((j) => j.id === body.jeringaId) || store.jeringas[0];
            const created = {
              id: `lj-${Date.now()}`,
              numero: body.numero,
              jeringaId: jer.id,
              fechaIngreso: body.fechaIngreso || nowIso(),
              fechaVencimiento: body.fechaVencimiento || '2028-12-31T00:00:00.000Z',
              formaIngreso: body.formaIngreso || '1° TRIMESTRE',
              comprobanteClase: body.comprobanteClase || 'PECOSA',
              numeroComprobante: body.numeroComprobante || 'COMP-2026',
              cantidadInicial: Number(body.cantidadInicial) || 500,
              cantidadActual: Number(body.cantidadActual ?? body.cantidadInicial) || 500,
              estado: 'disponible',
              observaciones: body.observaciones || '',
              createdAt: nowIso(),
              updatedAt: nowIso(),
              jeringa: { id: jer.id, tipo: jer.tipo, capacidad: jer.capacidad, color: jer.color },
            };
            store.lotesJeringas.unshift(created);
            return sendJson(res, 201, { success: true, data: created, timestamp: nowIso() });
          }
          const id = pathname.split('/')[3];
          const idx = store.lotesJeringas.findIndex((l) => l.id === id);
          if (idx >= 0) {
            if (method === 'GET') return sendJson(res, 200, { success: true, data: store.lotesJeringas[idx], timestamp: nowIso() });
            if (method === 'PUT' || method === 'PATCH') {
              const body = await readJsonBody(req);
              store.lotesJeringas[idx] = { ...store.lotesJeringas[idx], ...body, updatedAt: nowIso() };
              return sendJson(res, 200, { success: true, data: store.lotesJeringas[idx], timestamp: nowIso() });
            }
            if (method === 'DELETE') {
              store.lotesJeringas.splice(idx, 1);
              return sendJson(res, 200, { success: true, timestamp: nowIso() });
            }
          }
        }

        // Configuracion Jeringa Vacuna
        if (pathname.startsWith('/api/configuracion-jeringa-vacuna')) {
          if (pathname === '/api/configuracion-jeringa-vacuna/calcular') {
            const cantidad = Number(params.get('cantidadVacunas')) || 10;
            const jer = store.jeringas[1];
            return sendJson(res, 200, {
              success: true,
              data: [
                {
                  jeringaId: jer.id,
                  cantidad,
                  multiplicador: 1,
                  prioridad: 1,
                  origen: 'defecto',
                  jeringa: { id: jer.id, tipo: jer.tipo, capacidad: jer.capacidad, color: jer.color },
                },
              ],
              message: 'Cálculo realizado',
            });
          }
          return sendJson(res, 200, {
            success: true,
            data: [],
            timestamp: nowIso(),
          });
        }

        // Usuarios
        if (pathname.startsWith('/api/usuarios')) {
          if (pathname === '/api/usuarios/activos') {
            return sendJson(res, 200, {
              success: true,
              data: store.usuarios.filter((u) => u.estado === 'activo'),
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/usuarios/stats') {
            return sendJson(res, 200, {
              success: true,
              data: {
                total: store.usuarios.length,
                activos: store.usuarios.filter((u) => u.estado === 'activo').length,
                inactivos: store.usuarios.filter((u) => u.estado !== 'activo').length,
                porRol: {
                  administrador: store.usuarios.filter((u) => u.rol === 'administrador').length,
                  coordinador: store.usuarios.filter((u) => u.rol === 'coordinador').length,
                  responsable_acopio: store.usuarios.filter((u) => u.rol === 'responsable_acopio').length,
                  operador: store.usuarios.filter((u) => u.rol === 'operador').length,
                },
              },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/usuarios' && method === 'GET') {
            let list = [...store.usuarios];
            const rol = params.get('rol');
            const estado = params.get('estado');
            const search = (params.get('search') || '').toLowerCase();
            if (rol && rol !== 'todos') list = list.filter((u) => u.rol === rol);
            if (estado && estado !== 'todos') list = list.filter((u) => u.estado === estado);
            if (search) {
              list = list.filter(
                (u) =>
                  u.nombres.toLowerCase().includes(search) ||
                  u.apellidos.toLowerCase().includes(search) ||
                  u.usuario.toLowerCase().includes(search) ||
                  u.email.toLowerCase().includes(search)
              );
            }
            const paged = paginate(list, params.get('page'), params.get('limit'));
            return sendJson(res, 200, {
              success: true,
              message: 'Usuarios obtenidos',
              data: paged.data,
              pagination: paged.pagination,
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/usuarios' && method === 'POST') {
            const body = await readJsonBody(req);
            const ca = store.centrosAcopio.find((c) => c.id === body.centroAcopioId);
            const created: any = {
              id: `usr-${Date.now()}`,
              nombres: body.nombres,
              apellidos: body.apellidos,
              email: body.email,
              usuario: body.usuario,
              rol: body.rol || 'operador',
              centroAcopioId: ca?.id,
              centroAcopioIds: ca ? [ca.id] : [],
              centroAcopio: ca ? { id: ca.id, nombre: ca.nombre, codigo: ca.codigo || '' } : undefined,
              centrosAcopioAsignados: ca
                ? [{ centroAcopioId: ca.id, centroAcopio: { id: ca.id, nombre: ca.nombre, codigo: ca.codigo || '' } }]
                : [],
              estado: 'activo',
              createdAt: nowIso(),
              updatedAt: nowIso(),
              permissions: DEFAULT_ROLE_PERMISSIONS[body.rol || 'operador'] || ['dashboard:read'],
            };
            store.usuarios.push(created);
            return sendJson(res, 201, { success: true, data: created, timestamp: nowIso() });
          }
          const parts = pathname.split('/');
          const id = parts[3];
          const idx = store.usuarios.findIndex((u) => u.id === id);
          if (idx >= 0) {
            if (parts[4] === 'change-password') {
              return sendJson(res, 200, { success: true, timestamp: nowIso() });
            }
            if (parts[4] === 'estado' && method === 'PATCH') {
              const body = await readJsonBody(req);
              store.usuarios[idx] = { ...store.usuarios[idx], estado: body.estado, updatedAt: nowIso() };
              return sendJson(res, 200, { success: true, data: store.usuarios[idx], timestamp: nowIso() });
            }
            if (method === 'GET') return sendJson(res, 200, { success: true, data: store.usuarios[idx], timestamp: nowIso() });
            if (method === 'PUT' || method === 'PATCH') {
              const body = await readJsonBody(req);
              store.usuarios[idx] = { ...store.usuarios[idx], ...body, updatedAt: nowIso() };
              return sendJson(res, 200, { success: true, data: store.usuarios[idx], timestamp: nowIso() });
            }
            if (method === 'DELETE') {
              store.usuarios.splice(idx, 1);
              return sendJson(res, 200, { success: true, timestamp: nowIso() });
            }
          }
        }

        // Roles
        if (pathname.startsWith('/api/roles')) {
          if (pathname === '/api/roles/stats') {
            return sendJson(res, 200, {
              success: true,
              data: {
                total: store.roles.length,
                activos: store.roles.length,
                inactivos: 0,
                porDefecto: 4,
                personalizados: Math.max(0, store.roles.length - 4),
                conUsuarios: 4,
              },
              timestamp: nowIso(),
            });
          }
          if (pathname.startsWith('/api/roles/codigo/')) {
            const codigo = pathname.split('/').pop()!;
            const role = store.roles.find((r) => r.codigo === codigo) || store.roles[0];
            return sendJson(res, 200, { success: true, data: role, timestamp: nowIso() });
          }
          if (pathname === '/api/roles' && method === 'GET') {
            return sendJson(res, 200, {
              success: true,
              data: { roles: store.roles, total: store.roles.length },
              timestamp: nowIso(),
            });
          }
          const parts = pathname.split('/');
          const id = parts[3];
          const role = store.roles.find((r) => r.id === id);
          if (role) {
            if (parts[4] === 'permissions') {
              if (method === 'GET') {
                return sendJson(res, 200, { success: true, data: role.permissions || [], timestamp: nowIso() });
              }
              return sendJson(res, 200, { success: true, timestamp: nowIso() });
            }
            return sendJson(res, 200, { success: true, data: role, timestamp: nowIso() });
          }
        }

        // Permissions
        if (pathname.startsWith('/api/permissions')) {
          if (pathname === '/api/permissions/stats') {
            return sendJson(res, 200, {
              success: true,
              data: {
                total: store.permissions.length,
                activos: store.permissions.length,
                inactivos: 0,
                porCategoria: { Dashboard: 1, Establecimientos: 4, Inventario: 3, Operaciones: 2, Planificación: 3, Seguridad: 4 },
                porRecurso: {},
                asignados: store.permissions.length,
              },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/permissions/grouped') {
            const grouped: Record<string, any[]> = {};
            for (const p of store.permissions) {
              grouped[p.categoria] = grouped[p.categoria] || [];
              grouped[p.categoria].push(p);
            }
            return sendJson(res, 200, { success: true, data: grouped, timestamp: nowIso() });
          }
          if (pathname === '/api/permissions/categorias') {
            return sendJson(res, 200, {
              success: true,
              data: Array.from(new Set(store.permissions.map((p) => p.categoria))),
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/permissions/recursos') {
            return sendJson(res, 200, {
              success: true,
              data: Array.from(new Set(store.permissions.map((p) => p.recurso))),
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/permissions/acciones') {
            return sendJson(res, 200, {
              success: true,
              data: Array.from(new Set(store.permissions.map((p) => p.accion))),
              timestamp: nowIso(),
            });
          }
          return sendJson(res, 200, {
            success: true,
            data: { permissions: store.permissions, total: store.permissions.length },
            timestamp: nowIso(),
          });
        }

        // Permisos Operativos
        if (pathname.startsWith('/api/permisos-operativos')) {
          if (pathname === '/api/permisos-operativos/mis-permisos') {
            return sendJson(res, 200, {
              success: true,
              data: {
                movimientos_edicion: true,
                planificacion_edicion: true,
              },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/permisos-operativos/toggle' && method === 'POST') {
            const body = await readJsonBody(req);
            const tipo = body.tipo === 'planificacion_edicion' ? 'planificacion_edicion' : 'movimientos_edicion';
            store.permisosOperativosGlobales[tipo] = {
              ...store.permisosOperativosGlobales[tipo],
              habilitado: Boolean(body.habilitado),
              programado: Boolean(body.programado),
              fechaActivacion: body.fechaActivacion || null,
              fechaDesactivacion: body.fechaDesactivacion || null,
            };
            return sendJson(res, 200, { success: true, data: store.permisosOperativosGlobales[tipo], timestamp: nowIso() });
          }
          if (pathname === '/api/permisos-operativos/procesar-programados' && method === 'POST') {
            return sendJson(res, 200, {
              success: true,
              data: { activados: 0, desactivados: 0 },
              timestamp: nowIso(),
            });
          }
          const responsables = store.usuarios
            .filter((u) => u.rol === 'responsable_acopio')
            .map((u: any) => ({
              id: u.id,
              nombres: u.nombres,
              apellidos: u.apellidos,
              usuario: u.usuario,
              email: u.email,
              estado: u.estado,
              centroAcopio: u.centroAcopio || null,
              centrosAcopioAsignados: u.centrosAcopioAsignados || [],
              permisos: {
                movimientos_edicion: { ...store.permisosOperativosGlobales.movimientos_edicion },
                planificacion_edicion: { ...store.permisosOperativosGlobales.planificacion_edicion },
              },
            }));
          return sendJson(res, 200, {
            success: true,
            data: {
              usuarios: responsables,
              globales: store.permisosOperativosGlobales,
            },
            timestamp: nowIso(),
          });
        }

        // Planificación
        if (pathname.startsWith('/api/planificacion')) {
          if (pathname === '/api/planificacion/anios-disponibles') {
            return sendJson(res, 200, {
              success: true,
              data: { anios: [2025, 2026], anioActual: 2026 },
              timestamp: nowIso(),
            });
          }
          if (pathname.startsWith('/api/planificacion/verificar-existencia/')) {
            const parts = pathname.split('/');
            const estId = parts[4];
            const vacId = parts[5];
            const anio = Number(parts[6]) || 2026;
            const found = store.planificaciones.find(
              (p) => p.establecimientoId === estId && p.vacunaId === vacId && p.anio === anio
            );
            return sendJson(res, 200, {
              success: true,
              data: {
                existe: true,
                planificacion: found || store.planificaciones[0],
              },
              timestamp: nowIso(),
            });
          }
          if (pathname.startsWith('/api/planificacion/verificar-disponibilidad/')) {
            const parts = pathname.split('/');
            const estId = parts[4];
            const vacId = parts[5];
            const mes = Number(parts[6]) || 10;
            const anio = Number(parts[7]) || 2026;
            const found = store.planificaciones.find(
              (p) => p.establecimientoId === estId && p.vacunaId === vacId && p.anio === anio
            );
            const dist = found?.distribucionMensual || Array(12).fill(20);
            const detallesPorMes = dist.map((cantidad: number, idx: number) => ({
              mes: idx + 1,
              nombreMes: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][idx],
              cantidadPlanificada: cantidad,
              esPosterior: idx + 1 > mes,
            }));
            const disponibilidadRestante = detallesPorMes
              .filter((d: any) => d.mes >= mes)
              .reduce((acc: number, d: any) => acc + d.cantidadPlanificada, 0) + 500;
            return sendJson(res, 200, {
              success: true,
              data: {
                tieneDisponibilidad: true,
                disponibilidadRestante,
                detallesPorMes,
              },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/planificacion/sincronizar-entrega-base' && method === 'POST') {
            const body = await readJsonBody(req);
            const found = store.planificaciones.find(
              (p) =>
                p.establecimientoId === body.establecimientoId &&
                p.vacunaId === body.vacunaId &&
                p.anio === Number(body.anio)
            );
            if (found && body.mes >= 1 && body.mes <= 12) {
              found.distribucionMensual[body.mes - 1] = Number(body.nuevaCantidad) || 0;
              found.metaAnual = found.distribucionMensual.reduce((a: number, b: number) => a + b, 0);
              found.updatedAt = nowIso();
            }
            return sendJson(res, 200, {
              success: true,
              data: {
                planificacionActualizada: true,
                mesesAfectados: [Number(body.mes) || 10],
                distribucionAnterior: found?.distribucionMensual || [],
                distribucionNueva: found?.distribucionMensual || [],
                metaAnualAnterior: found?.metaAnual || 240,
                metaAnualNueva: found?.metaAnual || 240,
              },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/planificacion/sincronizar-entrega-adicional' && method === 'POST') {
            const body = await readJsonBody(req);
            return sendJson(res, 200, {
              success: true,
              data: {
                planificacionActualizada: true,
                mesesAfectados: [Number(body.mes) || 10],
                distribucionAnterior: [],
                distribucionNueva: [],
                detallesRedistribucion: [],
              },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/planificacion/stats' || pathname === '/api/planificacion/estadisticas') {
            return sendJson(res, 200, {
              success: true,
              data: {
                totalPlanificaciones: store.planificaciones.length,
                planificacionesPorEstado: {
                  borrador: 0,
                  aprobado: store.planificaciones.length,
                  ejecutado: 0,
                },
                totalMetaAnual: store.planificaciones.reduce((s, p) => s + p.metaAnual, 0),
                promedioMetaPorEstablecimiento: 240,
                vacunasMasPlanificadas: [],
                establecimientosConMasPlanificaciones: [],
              },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/planificacion/sincronizar-movimientos' && method === 'POST') {
            return sendJson(res, 200, {
              success: true,
              data: { creados: 0, actualizados: 12, eliminados: 0, errores: [] },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/planificacion' && method === 'GET') {
            let list = [...store.planificaciones];
            const anio = Number(params.get('anio'));
            const vacunaId = params.get('vacunaId');
            const establecimientoId = params.get('establecimientoId');
            const centroAcopioId = params.get('centroAcopioId');
            if (anio) list = list.filter((p) => p.anio === anio);
            if (vacunaId) list = list.filter((p) => p.vacunaId === vacunaId);
            if (establecimientoId) list = list.filter((p) => p.establecimientoId === establecimientoId);
            if (centroAcopioId) list = list.filter((p) => p.establecimiento.centroAcopioId === centroAcopioId);
            const paged = paginate(list, params.get('page'), params.get('limit') || '500');
            return sendJson(res, 200, {
              success: true,
              data: { planificaciones: paged.data, pagination: paged.pagination },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/planificacion' && method === 'POST') {
            const body = await readJsonBody(req);
            const est = store.establecimientos.find((e) => e.id === body.establecimientoId) || store.establecimientos[1];
            const vac = store.vacunas.find((v) => v.id === body.vacunaId) || store.vacunas[0];
            const created = {
              id: `plan-${Date.now()}`,
              establecimientoId: est.id,
              vacunaId: vac.id,
              anio: Number(body.anio) || 2026,
              metaAnual: Number(body.metaAnual) || 120,
              distribucionMensual: body.distribucionMensual || Array(12).fill(10),
              estado: body.estado || 'aprobado',
              createdAt: nowIso(),
              updatedAt: nowIso(),
              establecimiento: { id: est.id, nombre: est.nombre, tipo: est.tipo, codigo: est.codigo, centroAcopioId: est.centroAcopioId },
              vacuna: { id: vac.id, nombre: vac.nombre, tipo: vac.tipo, presentacion: vac.presentacion, dosisPorFrasco: vac.dosisPorFrasco },
            };
            store.planificaciones.push(created);
            return sendJson(res, 201, { success: true, data: created, timestamp: nowIso() });
          }
          const id = pathname.split('/')[3];
          const idx = store.planificaciones.findIndex((p) => p.id === id);
          if (idx >= 0 && (method === 'PUT' || method === 'PATCH')) {
            const body = await readJsonBody(req);
            store.planificaciones[idx] = { ...store.planificaciones[idx], ...body, updatedAt: nowIso() };
            return sendJson(res, 200, { success: true, data: store.planificaciones[idx], timestamp: nowIso() });
          }
          if (idx >= 0 && method === 'DELETE') {
            store.planificaciones.splice(idx, 1);
            return sendJson(res, 200, { success: true, timestamp: nowIso() });
          }
        }

        // Movimientos
        if (pathname.startsWith('/api/movimientos')) {
          if (pathname === '/api/movimientos/anios-disponibles') {
            return sendJson(res, 200, {
              success: true,
              data: { anios: [2025, 2026], anioActual: 2026 },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/movimientos/stats' || pathname === '/api/movimientos/estadisticas') {
            return sendJson(res, 200, {
              success: true,
              data: {
                resumen: { totalMovimientos: store.movimientos.length, totalEntregas: 14500, anio: 2026 },
                movimientosPorMes: Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, cantidad: 45, entregas: 1200 })),
                entregasPorVacuna: [],
                movimientosPorEstablecimiento: [],
              },
              timestamp: nowIso(),
            });
          }
          if (pathname.startsWith('/api/movimientos/stock-disponible')) {
            const vacunaId = params.get('vacunaId') || store.vacunas[0]?.id;
            const mes = Number(params.get('mes')) || 10;
            const anio = Number(params.get('anio')) || 2026;
            const lotesVacuna = store.lotesVacunas.filter(
              (l) => l.vacunaId === vacunaId && l.estado === 'disponible'
            );
            const stockActual = lotesVacuna.reduce((s, l) => s + l.cantidadActual, 0);
            const stockInicialOriginal = lotesVacuna.reduce((s, l) => s + l.cantidadInicial, 0) || 1200;
            const movsPeriodo = store.movimientos.filter(
              (m) => m.vacunaId === vacunaId && m.mes === mes && m.anio === anio
            );
            const totalEntregas = movsPeriodo.reduce((s, m) => s + (Number(m.entrega) || 0), 0);
            const ingresosLotesDelMes = Math.round(stockInicialOriginal * 0.15);
            const stockInicialHistorico = Math.max(stockActual + totalEntregas, stockInicialOriginal);
            const stockDisponible = stockInicialHistorico - totalEntregas;
            const estado: 'bueno' | 'medio' | 'critico' =
              stockDisponible < 0 ? 'critico' : stockDisponible < 250 ? 'medio' : 'bueno';

            return sendJson(res, 200, {
              success: true,
              data: {
                stockInicialHistorico,
                stockInicialOriginal,
                ingresosLotesDelMes,
                fechaCapturaStockInicial: `${anio}-${String(mes).padStart(2, '0')}-01T08:00:00.000Z`,
                stockActual,
                totalEntregas,
                stockDisponible,
                estado,
                tieneHistorialInicial: true,
                lotes: lotesVacuna.map((l) => ({
                  id: l.id,
                  numero: l.numero,
                  cantidadActual: l.cantidadActual,
                  fechaVencimiento: l.fechaVencimiento,
                  estado: l.estado,
                })),
              },
              timestamp: nowIso(),
            });
          }
          if (pathname.startsWith('/api/movimientos/progreso-vales')) {
            const vacunaId = params.get('vacunaId') || store.vacunas[0]?.id;
            const mes = Number(params.get('mes')) || 10;
            const anio = Number(params.get('anio')) || 2026;
            const centroAcopioId = params.get('centroAcopioId');

            let movs = store.movimientos.filter(
              (m) => m.vacunaId === vacunaId && m.mes === mes && m.anio === anio && (Number(m.entrega) || 0) > 0
            );
            if (centroAcopioId && centroAcopioId !== 'todos') {
              movs = movs.filter((m) => m.establecimiento?.centroAcopioId === centroAcopioId);
            }

            const totalEstablecimientosConEntregas = movs.length;
            const conVale = movs.filter((m) => m.entregaBaseTieneVale);
            const pendientes = movs.filter((m) => !m.entregaBaseTieneVale);
            const establecimientosConValeCompleto = conVale.length;
            const porcentajeProgreso =
              totalEstablecimientosConEntregas > 0
                ? Math.round((establecimientosConValeCompleto / totalEstablecimientosConEntregas) * 100)
                : 0;
            const totalEntregas = movs.reduce((s, m) => s + (Number(m.entrega) || 0), 0);

            const groupedMap = new Map<string, any>();
            for (const m of pendientes) {
              const caId = m.establecimiento?.centroAcopioId || 'ca-chanka';
              const ca = store.centrosAcopio.find((c) => c.id === caId) || store.centrosAcopio[0];
              if (!groupedMap.has(ca.id)) {
                groupedMap.set(ca.id, {
                  centroAcopio: { id: ca.id, nombre: ca.nombre, codigo: ca.codigo || '' },
                  establecimientos: [],
                  totalPendientes: 0,
                });
              }
              const group = groupedMap.get(ca.id);
              group.establecimientos.push({
                id: m.establecimientoId,
                nombre: m.establecimiento?.nombre || 'Establecimiento',
                codigo: m.establecimiento?.codigo || '',
                tipoEntregaPendiente: 'base',
                cantidadEntregaBase: Number(m.entregaBase ?? m.entrega) || 0,
                entregasAdicionalesPendientes: 0,
                totalCantidadPendiente: Number(m.entrega) || 0,
              });
              group.totalPendientes += 1;
            }

            const estado: 'sin_vales' | 'en_progreso' | 'completo' =
              totalEstablecimientosConEntregas === 0 || establecimientosConValeCompleto === 0
                ? 'sin_vales'
                : establecimientosConValeCompleto >= totalEstablecimientosConEntregas
                ? 'completo'
                : 'en_progreso';

            return sendJson(res, 200, {
              success: true,
              data: {
                totalEstablecimientosConEntregas,
                establecimientosConValeCompleto,
                porcentajeProgreso,
                estado,
                totalEntregas,
                establecimientosPendientes: Array.from(groupedMap.values()),
              },
              timestamp: nowIso(),
            });
          }
          if (pathname.startsWith('/api/movimientos/progreso-entregas')) {
            return sendJson(res, 200, {
              success: true,
              data: { totalProgramado: 480, totalEntregado: 420, porcentaje: 87.5, estado: 'en_progreso' },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/movimientos/actualizar-stock-siguiente-mes' && method === 'POST') {
            const body = await readJsonBody(req);
            const mes = Number(body.mes) || 10;
            const anio = Number(body.anio) || 2026;
            const mesSiguiente = mes === 12 ? 1 : mes + 1;
            const anioSiguiente = mes === 12 ? anio + 1 : anio;
            const lotesVacuna = store.lotesVacunas.filter((l) => l.vacunaId === body.vacunaId);
            const stockActual = lotesVacuna.reduce((s, l) => s + l.cantidadActual, 0);
            const entregas = store.movimientos
              .filter((m) => m.vacunaId === body.vacunaId && m.mes === mes && m.anio === anio)
              .reduce((s, m) => s + (Number(m.entrega) || 0), 0);
            return sendJson(res, 200, {
              success: true,
              data: {
                mesActual: {
                  mes,
                  anio,
                  stockInicial: stockActual + entregas,
                  entregas,
                  disponible: stockActual,
                },
                mesSiguiente: {
                  mes: mesSiguiente,
                  anio: anioSiguiente,
                  stockInicialRegistrado: stockActual,
                },
                mensaje: 'Stock inicial del siguiente mes actualizado correctamente',
              },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/movimientos/sincronizar-saldo-anterior' && method === 'POST') {
            return sendJson(res, 200, {
              success: true,
              data: { actualizado: true, stockCalculado: 45 },
              timestamp: nowIso(),
            });
          }
          if (pathname.startsWith('/api/movimientos/ajuste-entregas/verificar/')) {
            return sendJson(res, 200, {
              success: true,
              data: { disponible: true, motivo: null },
              timestamp: nowIso(),
            });
          }
          if (pathname.startsWith('/api/movimientos/ajuste-entregas/datos/')) {
            const parts = pathname.split('/');
            const vacunaId = parts[5];
            const mes = Number(parts[6]) || 10;
            const anio = Number(parts[7]) || 2026;
            const vac = store.vacunas.find((v) => v.id === vacunaId) || store.vacunas[0];
            return sendJson(res, 200, {
              success: true,
              data: {
                vacunaId: vac.id,
                vacunaNombre: vac.nombre,
                mes,
                anio,
                mesEntrega: mes === 12 ? 1 : mes + 1,
                anioEntrega: mes === 12 ? anio + 1 : anio,
                stockInicial: 1000,
                totalEntregas: 1100,
                deficit: 100,
                centrosAcopio: [],
                establecimientosAjustables: 5,
                establecimientosBloqueados: 0,
                puedeAjustar: true,
                motivoNoPuedeAjustar: null,
              },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/movimientos/ajuste-entregas/calcular-opciones' && method === 'POST') {
            return sendJson(res, 200, {
              success: true,
              data: [],
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/movimientos/ajuste-entregas/ejecutar' && method === 'POST') {
            return sendJson(res, 200, {
              success: true,
              data: { movimientosActualizados: 5, mensaje: 'Ajuste aplicado correctamente' },
              timestamp: nowIso(),
            });
          }
          if (pathname.startsWith('/api/movimientos/entregas-adicionales/')) {
            const entregaId = pathname.split('/')[4];
            if (method === 'PUT' || method === 'PATCH') {
              const body = await readJsonBody(req);
              for (const mov of store.movimientos) {
                const idx = (mov.entregasAdicionales || []).findIndex((ea: any) => ea.id === entregaId);
                if (idx >= 0) {
                  mov.entregasAdicionales[idx] = {
                    ...mov.entregasAdicionales[idx],
                    cantidad: Number(body.cantidad) || 0,
                    motivo: body.motivo ?? mov.entregasAdicionales[idx].motivo,
                    updatedAt: nowIso(),
                  };
                  const sumaAdicionales = mov.entregasAdicionales.reduce(
                    (s: number, ea: any) => s + (Number(ea.cantidad) || 0),
                    0
                  );
                  mov.entrega = (Number(mov.entregaBase) || 0) + sumaAdicionales;
                  mov.updatedAt = nowIso();
                  return sendJson(res, 200, {
                    success: true,
                    data: mov.entregasAdicionales[idx],
                    timestamp: nowIso(),
                  });
                }
              }
            }
            if (method === 'DELETE') {
              for (const mov of store.movimientos) {
                const idx = (mov.entregasAdicionales || []).findIndex((ea: any) => ea.id === entregaId);
                if (idx >= 0) {
                  mov.entregasAdicionales.splice(idx, 1);
                  const sumaAdicionales = mov.entregasAdicionales.reduce(
                    (s: number, ea: any) => s + (Number(ea.cantidad) || 0),
                    0
                  );
                  mov.entrega = (Number(mov.entregaBase) || 0) + sumaAdicionales;
                  mov.updatedAt = nowIso();
                  return sendJson(res, 200, { success: true, timestamp: nowIso() });
                }
              }
            }
          }
          if (pathname === '/api/movimientos' && method === 'GET') {
            let list = [...store.movimientos];
            const anio = Number(params.get('anio'));
            const mes = Number(params.get('mes'));
            const vacunaId = params.get('vacunaId');
            const establecimientoId = params.get('establecimientoId');
            const centroAcopioId = params.get('centroAcopioId');
            if (anio) list = list.filter((m) => m.anio === anio);
            if (mes) list = list.filter((m) => m.mes === mes);
            if (vacunaId) list = list.filter((m) => m.vacunaId === vacunaId);
            if (establecimientoId) list = list.filter((m) => m.establecimientoId === establecimientoId);
            if (centroAcopioId && centroAcopioId !== 'todos') {
              list = list.filter((m) => m.establecimiento.centroAcopioId === centroAcopioId);
            }
            return sendJson(res, 200, {
              success: true,
              data: { movimientos: list, total: list.length },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/movimientos' && method === 'POST') {
            const body = await readJsonBody(req);
            const est = store.establecimientos.find((e) => e.id === body.establecimientoId) || store.establecimientos[1];
            const vac = store.vacunas.find((v) => v.id === body.vacunaId) || store.vacunas[0];
            const usr = store.usuarios[0];
            const entregaVal = Number(body.entrega) || 0;
            const created = {
              id: `mov-${Date.now()}`,
              establecimientoId: est.id,
              vacunaId: vac.id,
              mes: Number(body.mes) || 10,
              anio: Number(body.anio) || 2026,
              saldoAnterior: Number(body.saldoAnterior) || 0,
              transIngreso: Number(body.transIngreso) || 0,
              salida: Number(body.salida) || 0,
              transSalida: Number(body.transSalida) || 0,
              entrega: entregaVal,
              entregaBase: entregaVal,
              observaciones: body.observaciones || '',
              fechaMovimiento: nowIso(),
              usuarioId: usr.id,
              createdAt: nowIso(),
              updatedAt: nowIso(),
              establecimiento: {
                id: est.id,
                nombre: est.nombre,
                tipo: est.tipo,
                codigo: est.codigo,
                centroAcopioId: est.centroAcopioId,
              },
              vacuna: {
                id: vac.id,
                nombre: vac.nombre,
                tipo: vac.tipo,
                presentacion: vac.presentacion,
                dosisPorFrasco: vac.dosisPorFrasco,
              },
              usuario: {
                id: usr.id,
                nombres: usr.nombres,
                apellidos: usr.apellidos,
                email: usr.email,
              },
              entregasAdicionales: [],
              entregaBaseTieneVale: false,
            };
            store.movimientos.push(created);
            return sendJson(res, 201, { success: true, data: created, timestamp: nowIso() });
          }
          const parts = pathname.split('/');
          const id = parts[3];
          const idx = store.movimientos.findIndex((m) => m.id === id);
          if (idx >= 0) {
            if (parts[4] === 'entregas-adicionales' && method === 'POST') {
              const body = await readJsonBody(req);
              const mov = store.movimientos[idx];
              mov.entregasAdicionales = mov.entregasAdicionales || [];
              const nuevaEntrega = {
                id: `ea-${Date.now()}`,
                movimientoVacunaId: mov.id,
                numeroEntrega: Number(body.numeroEntrega) || (mov.entregasAdicionales.length + 2 as 2 | 3),
                cantidad: Number(body.cantidad) || 0,
                fechaEntrega: body.fechaEntrega || nowIso(),
                motivo: body.motivo || 'Demanda adicional',
                usuarioId: body.usuarioId || store.usuarios[0].id,
                tieneVale: false,
                createdAt: nowIso(),
                updatedAt: nowIso(),
              };
              mov.entregasAdicionales.push(nuevaEntrega);
              const sumaAdicionales = mov.entregasAdicionales.reduce(
                (s: number, ea: any) => s + (Number(ea.cantidad) || 0),
                0
              );
              mov.entrega = (Number(mov.entregaBase) || 0) + sumaAdicionales;
              mov.updatedAt = nowIso();
              return sendJson(res, 201, { success: true, data: nuevaEntrega, timestamp: nowIso() });
            }
            if (method === 'GET') {
              return sendJson(res, 200, { success: true, data: store.movimientos[idx], timestamp: nowIso() });
            }
            if (method === 'PUT' || method === 'PATCH') {
              const body = await readJsonBody(req);
              const current = store.movimientos[idx];
              const nextEntregaBase =
                body.entregaBase !== undefined
                  ? Number(body.entregaBase)
                  : body.entrega !== undefined
                  ? Number(body.entrega)
                  : current.entregaBase;
              const sumaAdicionales = (current.entregasAdicionales || []).reduce(
                (s: number, ea: any) => s + (Number(ea.cantidad) || 0),
                0
              );
              store.movimientos[idx] = {
                ...current,
                ...body,
                entregaBase: nextEntregaBase,
                entrega: nextEntregaBase + sumaAdicionales,
                updatedAt: nowIso(),
              };
              return sendJson(res, 200, { success: true, data: store.movimientos[idx], timestamp: nowIso() });
            }
            if (method === 'DELETE') {
              store.movimientos.splice(idx, 1);
              return sendJson(res, 200, { success: true, timestamp: nowIso() });
            }
          }
        }

        // Entregas Adicionales
        if (pathname.startsWith('/api/entregas-adicionales')) {
          return sendJson(res, 200, { success: true, data: [], timestamp: nowIso() });
        }

        // Vales
        if (pathname.startsWith('/api/vales')) {
          if (pathname === '/api/vales/stats') {
            return sendJson(res, 200, {
              success: true,
              data: {
                totalVales: store.vales.length,
                generados: store.vales.filter((v) => v.estado === 'generado').length,
                impresos: store.vales.filter((v) => v.estado === 'impreso').length,
                entregados: store.vales.filter((v) => v.estado === 'entregado').length,
                totalVacunasEntregadas: store.vales.reduce((s, v) => s + (v.totalVacunas || 0), 0),
              },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/vales/verificar-existentes') {
            return sendJson(res, 200, {
              success: true,
              data: {
                existenVales: false,
                valesEncontrados: [],
                puedeProceder: true,
              },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/vales/calcular-impacto' && method === 'POST') {
            const body = await readJsonBody(req);
            const anterior = Number(body.cantidadAnterior) || 0;
            const nueva = Number(body.cantidadNueva) || 0;
            return sendJson(res, 200, {
              success: true,
              data: {
                establecimiento: { id: body.establecimientoId, nombre: 'Establecimiento', codigo: '' },
                vacuna: { id: body.vacunaId, nombre: 'Vacuna', presentacion: 'Frasco', dosisPorFrasco: 1 },
                cambioVacunas: {
                  cantidadAnterior: anterior,
                  cantidadNueva: nueva,
                  diferencia: nueva - anterior,
                  frascosAnteriores: anterior,
                  frascosNuevos: nueva,
                  diferenciaFrascos: nueva - anterior,
                },
                cambioJeringas: [],
                stockLotes: { vacunas: [], jeringas: [] },
                valesAfectados: [],
                advertencias: [],
                puedeProceder: true,
              },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/vales/vista-previa') {
            const centroAcopioId = params.get('centroAcopioId') || store.centrosAcopio[1]?.id;
            const mes = Number(params.get('mes')) || 10;
            const anio = Number(params.get('anio')) || 2026;
            const ca = store.centrosAcopio.find((c) => c.id === centroAcopioId) || store.centrosAcopio[1];
            const ests = store.establecimientos.filter((e) => e.centroAcopioId === ca.id);
            const movs = store.movimientos.filter(
              (m) => m.mes === mes && m.anio === anio && m.establecimiento?.centroAcopioId === ca.id && (Number(m.entrega) || 0) > 0
            );
            const previewEsts = ests.slice(0, 6).map((est) => {
              const estMovs = movs.filter((m) => m.establecimientoId === est.id).slice(0, 5);
              const vacunasItems = estMovs.map((m) => {
                const lote = store.lotesVacunas.find((l) => l.vacunaId === m.vacunaId) || store.lotesVacunas[0];
                const cant = Number(m.entrega) || 20;
                return {
                  vacuna: m.vacuna,
                  cantidadProgramada: cant,
                  cantidadAdicional: 0,
                  cantidadTotal: cant,
                  frascos: Math.ceil(cant / (m.vacuna?.dosisPorFrasco || 1)),
                  loteAsignado: {
                    id: lote.id,
                    numero: lote.numero,
                    fechaVencimiento: lote.fechaVencimiento,
                    cantidadDisponible: lote.cantidadActual,
                  },
                  tieneStockSuficiente: true,
                };
              });
              const totalEstVac = vacunasItems.reduce((s, vi) => s + vi.cantidadTotal, 0);
              return {
                establecimiento: est,
                vacunas: vacunasItems,
                jeringas: [
                  {
                    jeringa: store.jeringas[0],
                    cantidadRequerida: totalEstVac,
                    loteAsignado: {
                      id: store.lotesJeringas[0].id,
                      numero: store.lotesJeringas[0].numero,
                      fechaVencimiento: store.lotesJeringas[0].fechaVencimiento,
                      cantidadDisponible: store.lotesJeringas[0].cantidadActual,
                    },
                    tieneStockSuficiente: true,
                    origenCalculo: 'defecto' as const,
                    multiplicadorUsado: 1,
                    vacunaAsociada: 'General',
                  },
                ],
                totalVacunas: totalEstVac,
                totalJeringas: totalEstVac,
              };
            });
            const totalVacunas = previewEsts.reduce((s, e) => s + e.totalVacunas, 0);
            return sendJson(res, 200, {
              success: true,
              data: {
                centroAcopio: ca,
                mes,
                anio,
                establecimientos: previewEsts,
                resumen: {
                  totalEstablecimientos: previewEsts.length,
                  totalVacunas,
                  totalJeringas: totalVacunas,
                  vacunasSinStock: [],
                  jeringasSinStock: [],
                  puedeGenerar: true,
                },
              },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/vales/generar' && method === 'POST') {
            const body = await readJsonBody(req);
            const ca = store.centrosAcopio.find((c) => c.id === body.centroAcopioId) || store.centrosAcopio[1];
            const mes = Number(body.mes) || 10;
            const anio = Number(body.anio) || 2026;
            const created = {
              id: `vale-${Date.now()}`,
              numero: `VALE-${anio}-${String(mes).padStart(2, '0')}-00${store.vales.length + 1}`,
              centroAcopioId: ca.id,
              mes,
              anio,
              fechaGeneracion: nowIso(),
              estado: 'generado',
              tipoVale: body.tipoVale || 'solo_base',
              totalVacunas: 280,
              totalEstablecimientos: 3,
              usuarioId: store.usuarios[0].id,
              observaciones: body.observaciones || `Distribución mensual ${ca.nombre}`,
              createdAt: nowIso(),
              updatedAt: nowIso(),
              centroAcopio: { id: ca.id, nombre: ca.nombre, codigo: ca.codigo || '' },
              usuario: { id: store.usuarios[0].id, nombres: store.usuarios[0].nombres, apellidos: store.usuarios[0].apellidos },
              detalles: [],
            };
            store.vales.unshift(created as any);
            store.movimientos.forEach((m) => {
              if (m.mes === mes && m.anio === anio && m.establecimiento?.centroAcopioId === ca.id) {
                m.entregaBaseTieneVale = true;
                m.valeNumeroEntregaBase = created.numero;
              }
            });
            return sendJson(res, 201, { success: true, data: created, timestamp: nowIso() });
          }
          if (pathname === '/api/vales' && method === 'GET') {
            let list = [...store.vales];
            const centroAcopioId = params.get('centroAcopioId');
            const mes = Number(params.get('mes'));
            const anio = Number(params.get('anio'));
            const estado = params.get('estado');
            const search = (params.get('search') || '').toLowerCase();
            if (centroAcopioId && centroAcopioId !== 'todos') list = list.filter((v) => v.centroAcopioId === centroAcopioId);
            if (mes) list = list.filter((v) => v.mes === mes);
            if (anio) list = list.filter((v) => v.anio === anio);
            if (estado && estado !== 'todos') list = list.filter((v) => v.estado === estado);
            if (search) {
              list = list.filter(
                (v) =>
                  v.numero.toLowerCase().includes(search) ||
                  v.centroAcopio?.nombre?.toLowerCase().includes(search)
              );
            }
            return sendJson(res, 200, {
              success: true,
              data: { vales: list, total: list.length },
              timestamp: nowIso(),
            });
          }
          const parts = pathname.split('/');
          const id = parts[3];
          const found = store.vales.find((v) => v.id === id);
          if (found) {
            if (parts[4] === 'estado' && (method === 'PATCH' || method === 'PUT')) {
              const body = await readJsonBody(req);
              found.estado = body.estado || found.estado;
              found.updatedAt = nowIso();
              return sendJson(res, 200, { success: true, data: found, timestamp: nowIso() });
            }
            if (method === 'DELETE') {
              const idx = store.vales.findIndex((v) => v.id === id);
              if (idx >= 0) store.vales.splice(idx, 1);
              return sendJson(res, 200, { success: true, timestamp: nowIso() });
            }
            return sendJson(res, 200, { success: true, data: found, timestamp: nowIso() });
          }
          return sendJson(res, 200, { success: true, data: { vales: store.vales, total: store.vales.length }, timestamp: nowIso() });
        }

        // Kardex
        if (pathname.startsWith('/api/kardex')) {
          if (pathname === '/api/kardex/estadisticas') {
            return sendJson(res, 200, {
              success: true,
              data: {
                totalMovimientos: store.kardex.length,
                totalIngresos: 2,
                totalSalidas: 1,
                totalTransferencias: 0,
                totalAjustes: 0,
                saldoActualTotal: store.lotesVacunas.reduce((s, l) => s + l.cantidadActual, 0),
                movimientosPorTipo: [
                  { tipo: 'ingreso', cantidad: 2 },
                  { tipo: 'salida', cantidad: 1 },
                ],
                movimientosPorMes: [
                  { mes: '2026-02', ingresos: 4500, salidas: 0, transferencias: 0, ajustes: 0 },
                  { mes: '2026-10', ingresos: 0, salidas: 850, transferencias: 0, ajustes: 0 },
                ],
              },
              timestamp: nowIso(),
            });
          }
          return sendJson(res, 200, {
            success: true,
            message: 'Movimientos de kardex obtenidos',
            data: { movimientos: store.kardex, total: store.kardex.length },
            timestamp: nowIso(),
          });
        }

        // Alertas
        if (pathname.startsWith('/api/alertas')) {
          if (pathname === '/api/alertas/stream' && method === 'GET') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.write('event: connected\ndata: {"status":"ok"}\n\n');
            return;
          }

          if (pathname === '/api/alertas/stats' && method === 'GET') {
            const now = new Date();
            const proximo = new Date();
            proximo.setDate(now.getDate() + 7);

            const porTipo = {
              vencimiento: store.alertas.filter((a) => a.tipo === 'vencimiento').length,
              stock_bajo: store.alertas.filter((a) => a.tipo === 'stock_bajo').length,
              discrepancia: store.alertas.filter((a) => a.tipo === 'discrepancia').length,
              sistema: store.alertas.filter((a) => a.tipo === 'sistema').length,
            };
            const porNivel = {
              info: store.alertas.filter((a) => a.nivel === 'info').length,
              warning: store.alertas.filter((a) => a.nivel === 'warning').length,
              error: store.alertas.filter((a) => a.nivel === 'error').length,
              success: store.alertas.filter((a) => a.nivel === 'success').length,
            };

            return sendJson(res, 200, {
              success: true,
              data: {
                total: store.alertas.length,
                porTipo,
                porNivel,
                noLeidas: store.alertas.filter((a) => !a.leida).length,
                vencidas: store.alertas.filter((a) => a.fechaVencimiento && new Date(a.fechaVencimiento) < now).length,
                proximasVencer: store.alertas.filter(
                  (a) => a.fechaVencimiento && new Date(a.fechaVencimiento) >= now && new Date(a.fechaVencimiento) <= proximo,
                ).length,
              },
              timestamp: nowIso(),
            });
          }

          if (pathname === '/api/alertas/no-leidas' && method === 'GET') {
            return sendJson(res, 200, {
              success: true,
              data: store.alertas.filter((a) => !a.leida),
              timestamp: nowIso(),
            });
          }

          if (pathname === '/api/alertas/leer-multiples' && method === 'PUT') {
            const body = await readJsonBody(req);
            const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];
            const idSet = new Set(ids);
            let count = 0;
            store.alertas.forEach((alerta) => {
              if (idSet.has(alerta.id)) {
                alerta.leida = true;
                alerta.updatedAt = nowIso();
                count += 1;
              }
            });
            return sendJson(res, 200, {
              success: true,
              data: { count },
              message: `${count} alertas marcadas como leídas`,
              timestamp: nowIso(),
            });
          }

          if ((pathname === '/api/alertas/limpiar-resueltas' || pathname === '/api/alertas/limpiar-antiguas') && method === 'DELETE') {
            const beforeCount = store.alertas.length;
            store.alertas = store.alertas.filter((a) => !a.leida);
            const eliminadas = beforeCount - store.alertas.length;
            return sendJson(res, 200, {
              success: true,
              data: { eliminadas, count: eliminadas },
              message: `Se eliminaron ${eliminadas} alertas atendidas`,
              timestamp: nowIso(),
            });
          }

          if (pathname === '/api/alertas/generar-automaticas' && method === 'POST') {
            const body = await readJsonBody(req);
            const diasAnticipacion = Number(body?.diasAnticipacion ?? 30);
            const stockMinimo = Number(body?.stockMinimo ?? body?.porcentajeMinimo ?? 100);
            const ahora = new Date();
            const limiteVenc = new Date();
            limiteVenc.setDate(ahora.getDate() + diasAnticipacion);

            let alertasVencimiento = 0;
            let alertasStockBajo = 0;
            const detalles: string[] = [];

            for (const lote of store.lotesVacunas) {
              const fechaVenc = new Date(lote.fechaVencimiento);
              const vacNombre = lote.vacuna?.nombre || 'Vacuna';
              if (fechaVenc <= limiteVenc && lote.cantidadActual > 0) {
                const titulo = `Lote próximo a vencer: ${vacNombre} (${lote.numero})`;
                const yaExiste = store.alertas.some((a) => a.titulo === titulo && !a.leida);
                if (!yaExiste) {
                  const ts = nowIso();
                  store.alertas.unshift({
                    id: `alrt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                    tipo: 'vencimiento',
                    titulo,
                    descripcion: `El lote ${lote.numero} de ${vacNombre} (${lote.cantidadActual} dosis) vence el ${fechaVenc.toLocaleDateString('es-PE')}. Priorizar distribución FEFO.`,
                    nivel: fechaVenc < ahora ? 'error' : 'warning',
                    fechaCreacion: ts,
                    fechaVencimiento: lote.fechaVencimiento,
                    leida: false,
                    usuarioId: 'usr-admin',
                    createdAt: ts,
                    updatedAt: ts,
                  });
                  alertasVencimiento += 1;
                  detalles.push(titulo);
                }
              }

              if (lote.cantidadActual > 0 && lote.cantidadActual <= stockMinimo) {
                const titulo = `Stock crítico: ${vacNombre} (Lote ${lote.numero})`;
                const yaExiste = store.alertas.some((a) => a.titulo === titulo && !a.leida);
                if (!yaExiste) {
                  const ts = nowIso();
                  store.alertas.unshift({
                    id: `alrt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                    tipo: 'stock_bajo',
                    titulo,
                    descripcion: `Saldo disponible de ${lote.cantidadActual} dosis para ${vacNombre} (umbral configurado: ${stockMinimo} dosis).`,
                    nivel: lote.cantidadActual <= Math.floor(stockMinimo / 2) ? 'error' : 'warning',
                    fechaCreacion: ts,
                    leida: false,
                    usuarioId: 'usr-admin',
                    createdAt: ts,
                    updatedAt: ts,
                  });
                  alertasStockBajo += 1;
                  detalles.push(titulo);
                }
              }
            }

            const alertasGeneradas = alertasVencimiento + alertasStockBajo;
            return sendJson(res, 200, {
              success: true,
              data: {
                alertasGeneradas,
                alertasVencimiento,
                alertasStockBajo,
                detalles: detalles.length > 0 ? detalles : ['Inventario verificado con los umbrales actuales'],
              },
              timestamp: nowIso(),
            });
          }

          if (pathname === '/api/alertas' && method === 'GET') {
            let list = [...store.alertas];
            const tipo = params.get('tipo');
            const nivel = params.get('nivel');
            const leida = params.get('leida');
            const search = params.get('search')?.toLowerCase().trim();

            if (tipo && tipo !== 'todos') list = list.filter((a) => a.tipo === tipo);
            if (nivel && nivel !== 'todos') list = list.filter((a) => a.nivel === nivel);
            if (leida === 'true') list = list.filter((a) => a.leida === true);
            if (leida === 'false') list = list.filter((a) => a.leida === false);
            if (search) {
              list = list.filter(
                (a) =>
                  a.titulo.toLowerCase().includes(search) ||
                  a.descripcion.toLowerCase().includes(search),
              );
            }

            return sendJson(res, 200, {
              success: true,
              data: { alertas: list, total: list.length },
              timestamp: nowIso(),
            });
          }

          if (pathname === '/api/alertas' && method === 'POST') {
            const body = await readJsonBody(req);
            const ts = nowIso();
            const nuevaAlerta = {
              id: `alrt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              tipo: body?.tipo || 'sistema',
              titulo: body?.titulo || 'Alerta del sistema',
              descripcion: body?.descripcion || '',
              nivel: body?.nivel || 'info',
              fechaCreacion: ts,
              ...(body?.fechaVencimiento ? { fechaVencimiento: body.fechaVencimiento } : {}),
              leida: false,
              usuarioId: body?.usuarioId || 'usr-admin',
              createdAt: ts,
              updatedAt: ts,
            };
            store.alertas.unshift(nuevaAlerta);
            return sendJson(res, 201, {
              success: true,
              data: nuevaAlerta,
              message: 'Alerta creada exitosamente',
              timestamp: ts,
            });
          }

          const parts = pathname.split('/');
          const id = parts[3];
          const idx = store.alertas.findIndex((a) => a.id === id);

          if (idx >= 0) {
            if (parts[4] === 'leer' && method === 'PUT') {
              store.alertas[idx] = {
                ...store.alertas[idx],
                leida: true,
                updatedAt: nowIso(),
              };
              return sendJson(res, 200, {
                success: true,
                data: store.alertas[idx],
                timestamp: nowIso(),
              });
            }

            if (!parts[4] && method === 'GET') {
              return sendJson(res, 200, {
                success: true,
                data: store.alertas[idx],
                timestamp: nowIso(),
              });
            }

            if (!parts[4] && method === 'PUT') {
              const body = await readJsonBody(req);
              store.alertas[idx] = {
                ...store.alertas[idx],
                ...(body?.tipo !== undefined ? { tipo: body.tipo } : {}),
                ...(body?.titulo !== undefined ? { titulo: body.titulo } : {}),
                ...(body?.descripcion !== undefined ? { descripcion: body.descripcion } : {}),
                ...(body?.nivel !== undefined ? { nivel: body.nivel } : {}),
                ...(body?.leida !== undefined ? { leida: Boolean(body.leida) } : {}),
                updatedAt: nowIso(),
              };
              return sendJson(res, 200, {
                success: true,
                data: store.alertas[idx],
                message: 'Alerta actualizada exitosamente',
                timestamp: nowIso(),
              });
            }

            if (!parts[4] && method === 'DELETE') {
              store.alertas.splice(idx, 1);
              return sendJson(res, 200, {
                success: true,
                data: null,
                message: 'Alerta eliminada exitosamente',
                timestamp: nowIso(),
              });
            }
          }
        }

        // Configuración
        if (pathname.startsWith('/api/configuracion')) {
          if (pathname === '/api/configuracion/public') {
            return sendJson(res, 200, {
              success: true,
              data: store.configuraciones.filter((c) => c.esPublico),
              timestamp: nowIso(),
            });
          }
          if (pathname.startsWith('/api/configuracion/categoria/')) {
            const cat = pathname.split('/').pop()!;
            return sendJson(res, 200, {
              success: true,
              data: store.configuraciones.filter((c) => c.categoria === cat),
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/configuracion' && method === 'GET') {
            return sendJson(res, 200, {
              success: true,
              data: store.configuraciones,
              timestamp: nowIso(),
            });
          }
          const clave = pathname.split('/')[3];
          const found = store.configuraciones.find((c) => c.clave === clave);
          if (found) {
            if (method === 'PUT') {
              const body = await readJsonBody(req);
              found.valor = String(body.valor ?? found.valor);
              found.updatedAt = nowIso();
            }
            return sendJson(res, 200, { success: true, data: found, timestamp: nowIso() });
          }
        }

        // Programación Anual CENARES
        if (pathname.startsWith('/api/programacion-anual-cenares')) {
          if (pathname.endsWith('/exportar') && method === 'POST') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="Programacion_CENARES_2026.xlsx"');
            res.end(Buffer.from('PK\x03\x04SIVAC_EXCEL_EXPORT_CENARES'));
            return;
          }

          if (pathname.endsWith('/sincronizar-saldos') && method === 'POST') {
            const totalItems = store.vacunas.length + store.jeringas.length;
            return sendJson(res, 200, {
              success: true,
              data: {
                saldosCalculados: totalItems,
                detalles: store.vacunas.slice(0, 5).map((v) => ({
                  id: v.id,
                  nombre: v.nombre,
                  tipo: 'vacuna',
                  saldoAnterior: 420,
                })),
              },
              timestamp: nowIso(),
            });
          }

          if (pathname.includes('/tabla/')) {
            const anioParam = Number(pathname.split('/').pop()) || 2026;
            const vacunaItems = store.vacunas.map((v, idx) => {
              const progRecord = store.programacionCenares.find(
                (p: any) => p.vacunaId === v.id && Number(p.anio) === anioParam,
              );
              const q1 = progRecord ? Number(progRecord.programadoQ1) : 1100 + idx * 90;
              const q2 = progRecord ? Number(progRecord.programadoQ2) : 1250 + idx * 80;
              const q3 = progRecord ? Number(progRecord.programadoQ3) : 1200 + idx * 85;
              const q4 = progRecord ? Number(progRecord.programadoQ4) : 1150 + idx * 75;
              const saldoAnterior = 320 + (idx % 5) * 65;
              const entregas = {
                q1: Math.round(q1 * 0.96),
                q2: Math.round(q2 * 0.94),
                q3: Math.round(q3 * 0.92),
                q4: Math.round(q4 * 0.85),
              };
              const consumo = {
                q1: Math.round(entregas.q1 * 0.88),
                q2: Math.round(entregas.q2 * 0.9),
                q3: Math.round(entregas.q3 * 0.89),
                q4: Math.round(entregas.q4 * 0.82),
              };
              const s1 = saldoAnterior + entregas.q1 - consumo.q1;
              const s2 = s1 + entregas.q2 - consumo.q2;
              const s3 = s2 + entregas.q3 - consumo.q3;
              const s4 = s3 + entregas.q4 - consumo.q4;

              return {
                id: v.id,
                tipo: 'vacuna' as const,
                descripcion: `${v.nombre} (${v.presentacion})`,
                saldoAnterior,
                programacion: {
                  id: progRecord?.id || `cen-v-${v.id}`,
                  q1,
                  q2,
                  q3,
                  q4,
                },
                entregas,
                consumo,
                saldos: { q1: s1, q2: s2, q3: s3, q4: s4 },
              };
            });

            const jeringaItems = store.jeringas.map((j, idx) => {
              const progRecord = store.programacionCenares.find(
                (p: any) => p.jeringaId === j.id && Number(p.anio) === anioParam,
              );
              const q1 = progRecord ? Number(progRecord.programadoQ1) : 2400 + idx * 300;
              const q2 = progRecord ? Number(progRecord.programadoQ2) : 2600 + idx * 300;
              const q3 = progRecord ? Number(progRecord.programadoQ3) : 2500 + idx * 250;
              const q4 = progRecord ? Number(progRecord.programadoQ4) : 2300 + idx * 250;
              const saldoAnterior = 850 + idx * 140;
              const entregas = {
                q1: Math.round(q1 * 0.98),
                q2: Math.round(q2 * 0.95),
                q3: Math.round(q3 * 0.93),
                q4: Math.round(q4 * 0.88),
              };
              const consumo = {
                q1: Math.round(entregas.q1 * 0.91),
                q2: Math.round(entregas.q2 * 0.92),
                q3: Math.round(entregas.q3 * 0.9),
                q4: Math.round(entregas.q4 * 0.86),
              };
              const s1 = saldoAnterior + entregas.q1 - consumo.q1;
              const s2 = s1 + entregas.q2 - consumo.q2;
              const s3 = s2 + entregas.q3 - consumo.q3;
              const s4 = s3 + entregas.q4 - consumo.q4;

              return {
                id: j.id,
                tipo: 'jeringa' as const,
                descripcion: `${j.tipo} (${j.capacidad})`,
                saldoAnterior,
                programacion: {
                  id: progRecord?.id || `cen-j-${j.id}`,
                  q1,
                  q2,
                  q3,
                  q4,
                },
                entregas,
                consumo,
                saldos: { q1: s1, q2: s2, q3: s3, q4: s4 },
              };
            });

            return sendJson(res, 200, {
              success: true,
              data: {
                anio: anioParam,
                items: [...vacunaItems, ...jeringaItems],
              },
              timestamp: nowIso(),
            });
          }

          if (method === 'GET') {
            const vacunaId = params.get('vacunaId');
            const jeringaId = params.get('jeringaId');
            const anio = Number(params.get('anio'));
            let list = [...store.programacionCenares] as any[];
            if (anio) list = list.filter((p) => Number(p.anio) === anio);
            if (vacunaId) list = list.filter((p) => p.vacunaId === vacunaId);
            if (jeringaId) list = list.filter((p) => p.jeringaId === jeringaId);
            return sendJson(res, 200, {
              success: true,
              data: list,
              timestamp: nowIso(),
            });
          }

          if (method === 'POST') {
            const body = await readJsonBody(req);
            const created = {
              id: `cen-${Date.now()}`,
              anio: Number(body.anio) || 2026,
              vacunaId: body.vacunaId,
              jeringaId: body.jeringaId,
              programadoQ1: Number(body.programadoQ1) || 0,
              programadoQ2: Number(body.programadoQ2) || 0,
              programadoQ3: Number(body.programadoQ3) || 0,
              programadoQ4: Number(body.programadoQ4) || 0,
              createdAt: nowIso(),
              updatedAt: nowIso(),
            };
            (store.programacionCenares as any[]).push(created);
            return sendJson(res, 201, { success: true, data: created, timestamp: nowIso() });
          }

          if (method === 'PUT') {
            const id = pathname.split('/').pop();
            const body = await readJsonBody(req);
            const idx = (store.programacionCenares as any[]).findIndex((p) => p.id === id);
            if (idx >= 0) {
              store.programacionCenares[idx] = {
                ...store.programacionCenares[idx],
                ...(body.programadoQ1 !== undefined ? { programadoQ1: Number(body.programadoQ1) } : {}),
                ...(body.programadoQ2 !== undefined ? { programadoQ2: Number(body.programadoQ2) } : {}),
                ...(body.programadoQ3 !== undefined ? { programadoQ3: Number(body.programadoQ3) } : {}),
                ...(body.programadoQ4 !== undefined ? { programadoQ4: Number(body.programadoQ4) } : {}),
                updatedAt: nowIso(),
              };
              return sendJson(res, 200, {
                success: true,
                data: store.programacionCenares[idx],
                timestamp: nowIso(),
              });
            }
          }

          return sendJson(res, 200, {
            success: true,
            data: store.programacionCenares,
            timestamp: nowIso(),
          });
        }

        // ICI-DEMID
        if (pathname.startsWith('/api/ici-demid')) {
          if (pathname === '/api/ici-demid/anios-disponibles') {
            return sendJson(res, 200, {
              success: true,
              data: { anios: [2026, 2025] },
              timestamp: nowIso(),
            });
          }
          let list = [...(store.iciDemidRegistros || [])];
          const anio = Number(params.get('anio'));
          const vacunaId = params.get('vacunaId');
          const centroAcopioId = params.get('centroAcopioId');
          const establecimientoId = params.get('establecimientoId');
          if (anio) list = list.filter((r) => r.anio === anio);
          if (vacunaId && vacunaId !== 'todos') list = list.filter((r) => r.vacunaId === vacunaId);
          if (centroAcopioId && centroAcopioId !== 'todos') list = list.filter((r) => r.establecimiento?.centroAcopioId === centroAcopioId);
          if (establecimientoId && establecimientoId !== 'todos') list = list.filter((r) => r.establecimientoId === establecimientoId);
          const paged = paginate(list, params.get('page'), params.get('limit') || '500');
          return sendJson(res, 200, {
            success: true,
            data: {
              registros: paged.data,
              total: list.length,
              pagination: paged.pagination,
            },
            timestamp: nowIso(),
          });
        }

        // Reportes
        if (pathname.startsWith('/api/reportes')) {
          if (pathname.includes('/export') || pathname.endsWith('/exportar')) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="Reporte_SIVAC.xlsx"');
            res.end(Buffer.from('PK\x03\x04SIVAC_REPORT_EXPORT'));
            return;
          }

          if (pathname.includes('/estadisticas')) {
            return sendJson(res, 200, {
              success: true,
              data: {
                reportesGeneradosHoy: 6,
                reportesProgramados: 2,
                formatosDisponibles: ['excel', 'pdf', 'csv'],
                ultimaExportacion: nowIso(),
              },
              timestamp: nowIso(),
            });
          }

          if (pathname.includes('/stock-actual')) {
            const vacunaId = params.get('vacunaId');
            let vacunasList = [...store.vacunas];
            if (vacunaId) {
              vacunasList = vacunasList.filter((v) => v.id === vacunaId);
            }
            const nowMs = Date.now();
            const items = vacunasList.map((v) => {
              const lotes = store.lotesVacunas.filter((l) => l.vacunaId === v.id);
              const stockTotal = lotes.reduce((s, l) => s + l.cantidadActual, 0);
              const mappedLotes = lotes.map((l) => {
                const diasParaVencer = Math.max(
                  1,
                  Math.ceil((new Date(l.fechaVencimiento).getTime() - nowMs) / (1000 * 60 * 60 * 24)),
                );
                return {
                  id: l.id,
                  numero: l.numero,
                  cantidadActual: l.cantidadActual,
                  fechaVencimiento: l.fechaVencimiento,
                  estado: l.estado,
                  diasParaVencer,
                };
              });
              const lotesPorVencer = mappedLotes.filter((l) => l.diasParaVencer <= 90).length;
              return {
                vacunaId: v.id,
                vacunaNombre: v.nombre,
                vacunaTipo: v.tipo,
                presentacion: v.presentacion,
                stockTotal,
                totalLotes: lotes.length,
                lotesDisponibles: lotes.filter((l) => l.cantidadActual > 0).length,
                lotesPorVencer,
                ultimaActualizacion: nowIso(),
                lotes: mappedLotes,
              };
            });
            return sendJson(res, 200, { success: true, data: items, timestamp: nowIso() });
          }

          if (pathname.includes('/stock-critico')) {
            const vacunaId = params.get('vacunaId');
            let vacunasList = [...store.vacunas];
            if (vacunaId) {
              vacunasList = vacunasList.filter((v) => v.id === vacunaId);
            }
            const items = vacunasList
              .map((v, idx) => {
                const lotes = store.lotesVacunas.filter((l) => l.vacunaId === v.id);
                const rawTotal = lotes.reduce((s, l) => s + l.cantidadActual, 0);
                const stockMinimo = 1800 + (idx % 4) * 400;
                const stockTotal = idx < 5 ? Math.min(rawTotal, Math.round(stockMinimo * (0.35 + idx * 0.12))) : rawTotal;
                const porcentajeCritico = Math.round((stockTotal / stockMinimo) * 100);
                const nivelCriticidad =
                  porcentajeCritico <= 45 ? ('critico' as const) : ('bajo' as const);
                return {
                  vacunaId: v.id,
                  vacunaNombre: v.nombre,
                  vacunaTipo: v.tipo,
                  presentacion: v.presentacion,
                  stockTotal,
                  stockMinimo,
                  porcentajeCritico,
                  nivelCriticidad,
                  recomendacionAccion:
                    nivelCriticidad === 'critico'
                      ? 'Solicitar abastecimiento urgente a CENARES'
                      : 'Programar reposición en próximo despacho',
                  totalLotes: lotes.length,
                  lotesDisponibles: lotes.length,
                  lotesPorVencer: 0,
                  ultimaActualizacion: nowIso(),
                  lotes: [],
                };
              })
              .filter((item) => item.stockTotal < item.stockMinimo);
            return sendJson(res, 200, { success: true, data: items, timestamp: nowIso() });
          }

          if (pathname.includes('/proximos-vencimientos') || pathname.includes('/vencimientos')) {
            const vacunaId = params.get('vacunaId');
            const nowMs = Date.now();
            const items = store.lotesVacunas
              .filter((l) => !vacunaId || l.vacunaId === vacunaId)
              .slice(0, 8)
              .map((l, idx) => {
                const rawDias = Math.ceil((new Date(l.fechaVencimiento).getTime() - nowMs) / (1000 * 60 * 60 * 24));
                const diasParaVencer = idx < 4 ? 14 + idx * 16 : Math.max(25, rawDias);
                const expDate = new Date(nowMs + diasParaVencer * 24 * 60 * 60 * 1000).toISOString();
                const nivelUrgencia =
                  diasParaVencer <= 20
                    ? ('inmediato' as const)
                    : diasParaVencer <= 45
                      ? ('urgente' as const)
                      : ('atencion' as const);
                return {
                  loteId: l.id,
                  numeroLote: l.numero,
                  vacunaId: l.vacunaId,
                  vacunaNombre: l.vacuna?.nombre || 'Biológico',
                  vacunaTipo: l.vacuna?.tipo || 'Vacuna',
                  cantidadActual: l.cantidadActual,
                  fechaVencimiento: expDate,
                  diasParaVencer,
                  nivelUrgencia,
                  establecimientosAfectados: [
                    { id: 'est-chanka', nombre: 'ALMACÉN CENTRAL CHANKA', cantidadAsignada: l.cantidadActual },
                  ],
                };
              })
              .sort((a, b) => a.diasParaVencer - b.diasParaVencer);
            return sendJson(res, 200, { success: true, data: items, timestamp: nowIso() });
          }

          if (pathname.includes('/lotes-vencidos')) {
            const vacunaId = params.get('vacunaId');
            const seedExpired = [
              {
                loteId: 'lv-exp-1',
                numeroLote: '2409A112',
                vacunaId: store.vacunas[0]?.id || 'vac-bcg',
                vacunaNombre: store.vacunas[0]?.nombre || 'BCG',
                vacunaTipo: store.vacunas[0]?.tipo || 'Liofilizada',
                cantidadActual: 40,
                fechaVencimiento: '2026-08-31T00:00:00.000Z',
                diasVencido: 48,
                nivelCriticidad: 'critico' as const,
                valorPerdido: 520,
                establecimientosAfectados: [
                  { id: 'est-chanka', nombre: 'ALMACÉN CENTRAL CHANKA', cantidadAsignada: 40 },
                ],
              },
              {
                loteId: 'lv-exp-2',
                numeroLote: 'INFA25X',
                vacunaId: store.vacunas[4]?.id || 'vac-infl-ad',
                vacunaNombre: store.vacunas[4]?.nombre || 'Influenza Adulto',
                vacunaTipo: store.vacunas[4]?.tipo || 'Suspensión',
                cantidadActual: 65,
                fechaVencimiento: '2026-09-15T00:00:00.000Z',
                diasVencido: 33,
                nivelCriticidad: 'muy_critico' as const,
                valorPerdido: 975,
                establecimientosAfectados: [
                  { id: 'est-11', nombre: 'C.S. TALAVERA', cantidadAsignada: 65 },
                ],
              },
            ].filter((item) => !vacunaId || item.vacunaId === vacunaId);
            return sendJson(res, 200, { success: true, data: seedExpired, timestamp: nowIso() });
          }

          if (pathname.includes('/kardex-detallado')) {
            const items = store.kardex.map((k: any) => ({
              id: k.id,
              fecha: k.fechaMovimiento,
              tipo: k.tipo,
              itemNombre: k.item?.nombre || 'Biológico',
              loteNumero: k.lote?.numero || 'S/L',
              tipoMovimiento: k.tipoMovimiento,
              cantidad: k.cantidad,
              saldoAnterior: k.saldoAnterior,
              saldoActual: k.saldoActual,
              establecimientoOrigen: k.establecimientoOrigen?.nombre,
              establecimientoDestino: k.establecimientoDestino?.nombre,
              documento: k.documento,
              numeroDocumento: k.numeroDocumento,
              observaciones: k.observaciones,
              usuario: `${k.usuario?.nombres || ''} ${k.usuario?.apellidos || ''}`.trim(),
            }));
            return sendJson(res, 200, { success: true, data: items, timestamp: nowIso() });
          }

          if (pathname.includes('/movimientos-mensuales')) {
            const centroAcopioId = params.get('centroAcopioId');
            const vacunaId = params.get('vacunaId');
            let movs = [...store.movimientos];
            if (centroAcopioId && centroAcopioId !== 'todos') {
              movs = movs.filter((m) => m.establecimiento?.centroAcopioId === centroAcopioId);
            }
            if (vacunaId && vacunaId !== 'todas') {
              movs = movs.filter((m) => m.vacunaId === vacunaId);
            }
            const items = movs.map((m) => ({
              establecimientoId: m.establecimientoId,
              establecimientoNombre: m.establecimiento?.nombre || 'Establecimiento',
              vacunaId: m.vacunaId,
              vacunaNombre: m.vacuna?.nombre || 'Vacuna',
              mes: m.mes,
              anio: m.anio,
              saldoAnterior: m.saldoAnterior || 0,
              transIngreso: m.transIngreso || 0,
              salida: m.salida || 0,
              transSalida: m.transSalida || 0,
              entrega: m.entrega || 0,
              saldoFinal: m.saldo || 0,
              consumoTotal: (m.salida || 0) + (m.transSalida || 0),
              eficienciaDistribucion: 94,
              fechaUltimaActualizacion: m.updatedAt || nowIso(),
            }));
            return sendJson(res, 200, { success: true, data: items, timestamp: nowIso() });
          }

          if (pathname.includes('/planificacion/programacion-anual')) {
            const anio = Number(params.get('anio')) || 2026;
            const vacunaId = params.get('vacunaId');
            const centroAcopioId = params.get('centroAcopioId');
            let plans = store.planificaciones.filter((p) => Number(p.anio) === anio);
            if (vacunaId && vacunaId !== 'todas') {
              plans = plans.filter((p) => p.vacunaId === vacunaId);
            }
            if (centroAcopioId && centroAcopioId !== 'todos') {
              plans = plans.filter((p) => p.establecimiento?.centroAcopioId === centroAcopioId);
            }
            const items = plans.map((p) => ({
              establecimiento: {
                id: p.establecimientoId,
                nombre: p.establecimiento?.nombre || 'Establecimiento',
                codigo: p.establecimiento?.codigo || '0000',
                tipo: p.establecimiento?.tipo || 'centro_salud',
                centroAcopio: p.establecimiento?.centroAcopio?.nombre,
              },
              vacuna: {
                id: p.vacunaId,
                nombre: p.vacuna?.nombre || 'Vacuna',
                tipo: p.vacuna?.tipo || 'Vacuna',
                presentacion: p.vacuna?.presentacion || 'Frasco',
              },
              metaAnual: p.metaAnual,
              distribucionMensual: p.distribucionMensual,
              estado: p.estado || 'activo',
              fechaCreacion: p.createdAt,
              fechaActualizacion: p.updatedAt,
              observaciones: p.observaciones,
            }));
            return sendJson(res, 200, { success: true, data: items, timestamp: nowIso() });
          }

          return sendJson(res, 200, { success: true, data: [], timestamp: nowIso() });
        }

        // SiBot Chat
        if (pathname === '/api/sibot/chat' && method === 'POST') {
          const body = await readJsonBody(req);
          const rawMsg = String(body?.messages?.[body.messages.length - 1]?.content || '');
          const q = rawMsg.toLowerCase();
          const totalDosis = store.lotesVacunas.reduce((s, l) => s + l.cantidadActual, 0);
          const totalJeringas = store.lotesJeringas.reduce((s, l) => s + l.cantidadActual, 0);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');

          // 1. Consultas de gráficos / evolución / comparativas visuales
          if (q.includes('gráfico') || q.includes('grafico') || q.includes('evolución') || q.includes('comparando')) {
            const topVacunas = store.vacunas.slice(0, 7).map((v) => {
              const dosis = store.lotesVacunas
                .filter((l) => l.vacunaId === v.id)
                .reduce((acc, l) => acc + l.cantidadActual, 0);
              return { name: v.nombre, value: dosis };
            });

            const chartJson = JSON.stringify({
              type: 'bar',
              title: 'Stock disponible por biológico (dosis)',
              xKey: 'name',
              yKey: 'value',
              data: topVacunas,
            });

            res.end(
              `### Análisis Visual de Disponibilidad\n\n` +
                `Actualmente el Almacén Central registra **${totalDosis.toLocaleString('es-PE')} dosis** activas. ` +
                `Los biológicos con mayor volumen son **Pentavalente** (\`3,650\` dosis), **IPV** (\`2,980\` dosis) y **Neumococo** (\`2,740\` dosis).\n\n` +
                `\`\`\`chart:bar\n${chartJson}\n\`\`\`\n\n` +
                `---\n**Sugerencias:**\n` +
                `- Muestra la distribución actual de stock de vacunas agrupada por centro de acopio en una tabla.\n` +
                `- ¿Cuáles son los lotes próximos a vencer en los siguientes 60 días?`
            );
            return;
          }

          // 2. Consultas por Centro de Acopio / Redes / Establecimientos
          if (q.includes('centro de acopio') || q.includes('centros de acopio') || q.includes('red') || q.includes('establecimiento')) {
            const rows = store.centrosAcopio.slice(0, 7).map((ca, idx) => {
              const asignado = idx === 0 ? totalDosis : Math.round(1450 - idx * 140);
              const eessCount = store.establecimientos.filter((e) => e.centroAcopioId === ca.id).length;
              const estado = idx === 0 ? 'Almacén Central' : 'Abastecido';
              return `| ${ca.nombre} | \`${ca.codigo}\` | ${eessCount} EESS | ${asignado.toLocaleString('es-PE')} | ${estado} |`;
            });

            res.end(
              `### Distribución de Stock por Centro de Acopio\n\n` +
                `Consolidado operativo en los **${store.centrosAcopio.length} centros de acopio** vinculados a las redes **José María Arguedas** y **Sondor**:\n\n` +
                `| Centro de Acopio | Código | Cobertura | Dosis Activas | Estado |\n` +
                `| :--- | :--- | :---: | ---: | :--- |\n` +
                `${rows.join('\n')}\n\n` +
                `- **Concentración Regional:** El \`ALMACÉN (CHANKA)\` concentra el stock de reserva estratégica con **${totalDosis.toLocaleString('es-PE')} dosis**.\n` +
                `- **Despacho Prioritario:** Se recomienda priorizar la rotación del lote \`INFA26B\` hacia los centros de salud de mayor demanda.\n\n` +
                `---\n**Sugerencias:**\n` +
                `- Muestra un gráfico de barras con el stock actual de las principales vacunas.\n` +
                `- ¿Cuáles son los lotes de vacunas próximos a vencer?`
            );
            return;
          }

          // 3. Consultas de vencimientos / FEFO / alertas / críticos
          if (q.includes('vencer') || q.includes('vencimiento') || q.includes('fefo') || q.includes('alerta') || q.includes('crítico') || q.includes('critico')) {
            const sortedLotes = [...store.lotesVacunas]
              .sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento))
              .slice(0, 6);

            const rows = sortedLotes.map((l) => {
              const vacName = l.vacuna?.nombre || 'Biológico';
              const fecha = l.fechaVencimiento.slice(0, 10);
              const prioridad = l.numero === 'INFA26B' ? 'Alta (FEFO)' : 'Normal';
              return `| ${vacName} | \`${l.numero}\` | ${l.cantidadActual.toLocaleString('es-PE')} | ${fecha} | ${prioridad} |`;
            });

            res.end(
              `### Control FEFO y Lotes Próximos a Vencer\n\n` +
                `Se identificaron **${store.lotesVacunas.length} lotes activos** en cadena de frío, ordenados por prioridad de salida:\n\n` +
                `| Biológico | Lote | Saldo (Dosis) | Vencimiento | Prioridad |\n` +
                `| :--- | :--- | ---: | :---: | :--- |\n` +
                `${rows.join('\n')}\n\n` +
                `- **Acción Inmediata:** El lote \`INFA26B\` (Influenza Adulto, **820 dosis**) vence el \`2026-11-15\` y debe despacharse en el siguiente vale mensual.\n\n` +
                `---\n**Sugerencias:**\n` +
                `- Muestra la distribución actual de stock de vacunas agrupada por centro de acopio en una tabla.\n` +
                `- ¿Cuál es el stock actual de jeringas descartables por medida?`
            );
            return;
          }

          // 4. Consultas de Jeringas / Diluyentes
          if (q.includes('jeringa')) {
            const rows = store.lotesJeringas.map((lj) => {
              const tipo = lj.jeringa?.tipo || 'Jeringa descartable';
              const cap = lj.jeringa?.capacidad || '1cc';
              return `| ${tipo} | \`${lj.numero}\` | ${cap} | ${lj.cantidadActual.toLocaleString('es-PE')} | ${lj.fechaVencimiento.slice(0, 10)} |`;
            });

            res.end(
              `### Disponibilidad de Jeringas e Insumos\n\n` +
                `El inventario complementario cuenta con **${totalJeringas.toLocaleString('es-PE')} unidades** distribuidas en **${store.lotesJeringas.length} lotes activos**:\n\n` +
                `| Especificación | Lote | Capacidad | Saldo Actual | Vencimiento |\n` +
                `| :--- | :--- | :---: | ---: | :---: |\n` +
                `${rows.join('\n')}\n\n` +
                `- **Cobertura Operativa:** La relación actual entre jeringas autorretráctiles de \`1cc\` y dosis de biológicos está balanceada al **100%**.\n\n` +
                `\`\`\`kardex\n` +
                `RELACIÓN_INSUMO = Jeringas_1cc (${totalJeringas.toLocaleString('es-PE')}) / Dosis_Activas (${totalDosis.toLocaleString('es-PE')})\n` +
                `ESTADO_CADENA   = BALANCEADO (Factor >= 1.00)\n` +
                `\`\`\`\n\n` +
                `---\n**Sugerencias:**\n` +
                `- ¿Cuántas vacunas y jeringas tenemos disponibles en stock global actualmente? Muestra una tabla detallada.\n` +
                `- Lista los lotes con vencimiento más cercano ordenados por prioridad.`
            );
            return;
          }

          // 5. Respuesta ejecutiva con tabla, lista y bloque de resumen técnico
          const topLotes = store.lotesVacunas.slice(0, 7).map((l) => {
            const nombre = l.vacuna?.nombre || 'Vacuna';
            const pres = l.vacuna?.presentacion || 'Frasco';
            return `| ${nombre} | \`${l.numero}\` | ${pres} | ${l.cantidadActual.toLocaleString('es-PE')} | ${l.fechaVencimiento.slice(0, 10)} |`;
          });

          res.end(
            `### Balance Consolidado de Biológicos — SIVAC\n\n` +
              `El sistema registra **${totalDosis.toLocaleString('es-PE')} dosis de vacunas** (${store.lotesVacunas.length} lotes) y **${totalJeringas.toLocaleString('es-PE')} jeringas** disponibles en almacén:\n\n` +
              `| Biológico | Lote Activo | Presentación | Dosis Disponibles | Vencimiento |\n` +
              `| :--- | :--- | :--- | ---: | :---: |\n` +
              `${topLotes.join('\n')}\n\n` +
              `- **Cobertura Territorial:** **${store.redes.length} Redes**, **${store.microredes.length} Microredes** y **${store.centrosAcopio.length} Centros de Acopio** operativos.\n` +
              `- **Prioridad FEFO:** Lote \`INFA26B\` (Influenza Adulto, **820 dosis**) con vencimiento el \`2026-11-15\`.\n\n` +
              `\`\`\`auditoria-lotes\n` +
              `ALMACEN_CENTRAL : CHANKA-001 (${totalDosis.toLocaleString('es-PE')} dosis | ${store.lotesVacunas.length} lotes)\n` +
              `ALERTA_FEFO     : Lote INFA26B -> Vence 2026-11-15 (820 dosis)\n` +
              `\`\`\`\n\n` +
              `---\n**Sugerencias:**\n` +
              `- Muestra la distribución actual de stock de vacunas agrupada por centro de acopio en una tabla.\n` +
              `- Muestra un gráfico de barras con el stock actual de las principales vacunas.`
          );
          return;
        }

        // Fallback for any other /api endpoint
        return sendJson(res, 200, {
          success: true,
          message: 'OK',
          data: [],
          pagination: { page: 1, limit: 50, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
          timestamp: nowIso(),
        });
      });
    },
  };
}
