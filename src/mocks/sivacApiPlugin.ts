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

  const lotesVacunas = [
    { id: 'lv-1', numero: '0363G101', vacunaId: 'vac-bcg', fechaIngreso: '2026-01-15T00:00:00.000Z', fechaVencimiento: '2027-08-31T00:00:00.000Z', formaIngreso: '1° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'PEC-00112-2026', cantidadInicial: 600, cantidadActual: 480, estado: 'disponible', observaciones: 'Lote habilitado para uso' },
    { id: 'lv-2', numero: '0344X006', vacunaId: 'vac-hvbp', fechaIngreso: '2026-01-15T00:00:00.000Z', fechaVencimiento: '2027-06-30T00:00:00.000Z', formaIngreso: '1° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'PEC-00113-2026', cantidadInicial: 1800, cantidadActual: 1420, estado: 'disponible', observaciones: 'Lote habilitado para uso' },
    { id: 'lv-3', numero: '2853X019', vacunaId: 'vac-penta', fechaIngreso: '2026-02-10T00:00:00.000Z', fechaVencimiento: '2027-11-30T00:00:00.000Z', formaIngreso: '1° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'PEC-00145-2026', cantidadInicial: 4500, cantidadActual: 3650, estado: 'disponible', observaciones: 'Lote habilitado para uso' },
    { id: 'lv-4', numero: 'AHBVC542AA', vacunaId: 'vac-neumo', fechaIngreso: '2026-02-12T00:00:00.000Z', fechaVencimiento: '2027-09-30T00:00:00.000Z', formaIngreso: '1° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'PEC-00148-2026', cantidadInicial: 3200, cantidadActual: 2740, estado: 'disponible', observaciones: 'Lote habilitado para uso' },
    { id: 'lv-5', numero: 'ROTA2026A', vacunaId: 'vac-rota', fechaIngreso: '2026-03-01T00:00:00.000Z', fechaVencimiento: '2027-05-31T00:00:00.000Z', formaIngreso: '1° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'PEC-00180-2026', cantidadInicial: 2400, cantidadActual: 1910, estado: 'disponible', observaciones: 'Lote habilitado para uso' },
    { id: 'lv-6', numero: 'SPR0158N', vacunaId: 'vac-spr1', fechaIngreso: '2026-03-10T00:00:00.000Z', fechaVencimiento: '2027-10-31T00:00:00.000Z', formaIngreso: '1° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'PEC-00201-2026', cantidadInicial: 3000, cantidadActual: 2490, estado: 'disponible', observaciones: 'Lote habilitado para uso' },
    { id: 'lv-7', numero: 'IPV9924A', vacunaId: 'vac-ipv', fechaIngreso: '2026-04-05T00:00:00.000Z', fechaVencimiento: '2027-12-31T00:00:00.000Z', formaIngreso: '2° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'PEC-00255-2026', cantidadInicial: 3500, cantidadActual: 2980, estado: 'disponible', observaciones: 'Lote habilitado para uso' },
    { id: 'lv-8', numero: 'VPH2026X', vacunaId: 'vac-vph', fechaIngreso: '2026-04-12T00:00:00.000Z', fechaVencimiento: '2028-03-31T00:00:00.000Z', formaIngreso: '2° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'PEC-00260-2026', cantidadInicial: 2800, cantidadActual: 2310, estado: 'disponible', observaciones: 'Campaña escolar VPH' },
    { id: 'lv-9', numero: 'INFA26B', vacunaId: 'vac-infa', fechaIngreso: '2026-05-01T00:00:00.000Z', fechaVencimiento: '2026-11-15T00:00:00.000Z', formaIngreso: '2° TRIMESTRE', comprobanteClase: 'PECOSA', numeroComprobante: 'PEC-00302-2026', cantidadInicial: 5000, cantidadActual: 820, estado: 'disponible', observaciones: 'Campaña invierno - próximo a vencer' },
  ].map((l) => {
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
  const mainVacunas = vacunas.slice(0, 8);
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

        // Planificación
        if (pathname.startsWith('/api/planificacion')) {
          if (pathname === '/api/planificacion/stats') {
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
            const paged = paginate(list, params.get('page'), params.get('limit') || '200');
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
        }

        // Movimientos
        if (pathname.startsWith('/api/movimientos')) {
          if (pathname === '/api/movimientos/stats') {
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
            const stockMap: Record<string, number> = {};
            for (const v of store.vacunas) {
              stockMap[v.id] = store.lotesVacunas
                .filter((l) => l.vacunaId === v.id)
                .reduce((s, l) => s + l.cantidadActual, 0) || 500;
            }
            return sendJson(res, 200, { success: true, data: stockMap, timestamp: nowIso() });
          }
          if (pathname.startsWith('/api/movimientos/progreso-entregas')) {
            return sendJson(res, 200, {
              success: true,
              data: { totalProgramado: 480, totalEntregado: 420, porcentaje: 87.5, estado: 'en_progreso' },
              timestamp: nowIso(),
            });
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
            if (centroAcopioId) list = list.filter((m) => m.establecimiento.centroAcopioId === centroAcopioId);
            return sendJson(res, 200, {
              success: true,
              data: { movimientos: list, total: list.length },
              timestamp: nowIso(),
            });
          }
          const id = pathname.split('/')[3];
          const idx = store.movimientos.findIndex((m) => m.id === id);
          if (idx >= 0 && (method === 'PUT' || method === 'PATCH')) {
            const body = await readJsonBody(req);
            store.movimientos[idx] = { ...store.movimientos[idx], ...body, updatedAt: nowIso() };
            return sendJson(res, 200, { success: true, data: store.movimientos[idx], timestamp: nowIso() });
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
                generados: 0,
                impresos: 1,
                entregados: 1,
                totalVacunasEntregadas: 735,
              },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/vales' && method === 'GET') {
            return sendJson(res, 200, {
              success: true,
              data: { vales: store.vales, total: store.vales.length },
              timestamp: nowIso(),
            });
          }
          const id = pathname.split('/')[3];
          const found = store.vales.find((v) => v.id === id);
          if (found) {
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
          if (pathname === '/api/alertas/stats') {
            return sendJson(res, 200, {
              success: true,
              data: {
                total: store.alertas.length,
                porTipo: { vencimiento: 1, stock_bajo: 1, discrepancia: 0, sistema: 1 },
                porNivel: { info: 1, warning: 1, error: 0, success: 1 },
                noLeidas: store.alertas.filter((a) => !a.leida).length,
                vencidas: 0,
                proximasVencer: 1,
              },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/alertas/no-leidas') {
            return sendJson(res, 200, {
              success: true,
              data: store.alertas.filter((a) => !a.leida),
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/alertas/generar-automaticas' && method === 'POST') {
            return sendJson(res, 200, {
              success: true,
              data: { alertasGeneradas: 2, alertasVencimiento: 1, alertasStockBajo: 1, detalles: ['Verificación completada'] },
              timestamp: nowIso(),
            });
          }
          if (pathname === '/api/alertas' && method === 'GET') {
            return sendJson(res, 200, {
              success: true,
              data: { alertas: store.alertas, total: store.alertas.length },
              timestamp: nowIso(),
            });
          }
          const parts = pathname.split('/');
          const id = parts[3];
          const idx = store.alertas.findIndex((a) => a.id === id);
          if (idx >= 0 && parts[4] === 'leer') {
            store.alertas[idx].leida = true;
            return sendJson(res, 200, { success: true, data: store.alertas[idx], timestamp: nowIso() });
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
          return sendJson(res, 200, {
            success: true,
            data: {
              registros: [],
              total: 0,
              pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
            },
            timestamp: nowIso(),
          });
        }

        // Reportes
        if (pathname.startsWith('/api/reportes')) {
          if (pathname.includes('/estadisticas')) {
            return sendJson(res, 200, {
              success: true,
              data: {
                reportesGeneradosHoy: 4,
                reportesProgramados: 2,
                formatosDisponibles: ['excel', 'pdf', 'csv'],
                ultimaExportacion: nowIso(),
              },
              timestamp: nowIso(),
            });
          }
          if (pathname.includes('/stock-actual')) {
            const items = store.vacunas.map((v) => {
              const lotes = store.lotesVacunas.filter((l) => l.vacunaId === v.id);
              const stockTotal = lotes.reduce((s, l) => s + l.cantidadActual, 0);
              return {
                vacunaId: v.id,
                vacunaNombre: v.nombre,
                vacunaTipo: v.tipo,
                presentacion: v.presentacion,
                stockTotal,
                totalLotes: lotes.length,
                lotesDisponibles: lotes.length,
                lotesPorVencer: 0,
                ultimaActualizacion: nowIso(),
                lotes: lotes.map((l) => ({
                  id: l.id,
                  numero: l.numero,
                  cantidadActual: l.cantidadActual,
                  fechaVencimiento: l.fechaVencimiento,
                  estado: l.estado,
                  diasParaVencer: 320,
                })),
              };
            });
            return sendJson(res, 200, { success: true, data: items, timestamp: nowIso() });
          }
          return sendJson(res, 200, { success: true, data: [], timestamp: nowIso() });
        }

        // SiBot Chat
        if (pathname === '/api/sibot/chat' && method === 'POST') {
          const body = await readJsonBody(req);
          const lastMsg = body?.messages?.[body.messages.length - 1]?.content || '';
          const totalDosis = store.lotesVacunas.reduce((s, l) => s + l.cantidadActual, 0);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(
            `### Resumen Operativo SIVAC — DISA Apurímac II\n\n` +
              `En respuesta a tu consulta${lastMsg ? ` (*"${lastMsg}"*)` : ''}:\n\n` +
              `- **Stock disponible en Almacén Central (Chanka):** ${totalDosis.toLocaleString('es-PE')} dosis activas distribuidas en **${store.lotesVacunas.length} lotes**.\n` +
              `- **Cobertura de Red:** **${store.redes.length} Redes de Salud** (José María Arguedas y Sondor), **${store.microredes.length} Microredes**, **${store.centrosAcopio.length} Centros de Acopio** y **${store.establecimientos.length} Establecimientos** activos.\n` +
              `- **Alerta Prioritaria:** Lote \`INFA26B\` (Influenza Adulto, 820 dosis) con vencimiento próximo (15/11/2026).`
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
