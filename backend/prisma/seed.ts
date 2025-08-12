import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeder de SIVAC...');

  try {
    // Limpiar datos existentes (opcional, comentar en producción)
    console.log('🧹 Limpiando datos existentes...');

    // Eliminar en orden correcto para evitar violaciones de clave foránea
    await prisma.kardex.deleteMany();
    await prisma.valeDetalle.deleteMany();
    await prisma.valeEntrega.deleteMany();
    await prisma.entregaAdicional.deleteMany();
    await prisma.movimientoVacuna.deleteMany();
    await prisma.planificacionAnual.deleteMany();
    await prisma.loteJeringa.deleteMany();
    await prisma.loteVacuna.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.establecimiento.deleteMany();
    await prisma.configuracionSistema.deleteMany();
    await prisma.vacuna.deleteMany();
    await prisma.jeringa.deleteMany();

    // Insertar configuraciones básicas del sistema
    console.log('⚙️ Insertando configuraciones del sistema...');
    
    const configuraciones = [
      // Configuraciones generales
      {
        clave: 'sistema_nombre',
        valor: 'SIVAC - Sistema de Gestión de Vacunas',
        descripcion: 'Nombre del sistema',
        tipoDato: 'string',
        categoria: 'general',
        esPublico: true,
      },
      {
        clave: 'institucion_nombre',
        valor: 'DIRESA Apurímac II',
        descripcion: 'Nombre de la institución',
        tipoDato: 'string',
        categoria: 'general',
        esPublico: true,
      },
      {
        clave: 'sistema_version',
        valor: '1.0.0',
        descripcion: 'Versión del sistema',
        tipoDato: 'string',
        categoria: 'general',
        esPublico: true,
      },
      {
        clave: 'timezone',
        valor: 'America/Lima',
        descripcion: 'Zona horaria del sistema',
        tipoDato: 'string',
        categoria: 'general',
        esPublico: false,
      },
      
      // Configuraciones de alertas
      {
        clave: 'stock_minimo_default',
        valor: '100',
        descripcion: 'Stock mínimo por defecto para alertas',
        tipoDato: 'number',
        categoria: 'alertas',
        esPublico: false,
      },
      {
        clave: 'dias_alerta_vencimiento',
        valor: '30',
        descripcion: 'Días antes del vencimiento para generar alerta',
        tipoDato: 'number',
        categoria: 'alertas',
        esPublico: false,
      },
      {
        clave: 'alertas_email_enabled',
        valor: 'false',
        descripcion: 'Habilitar alertas por email',
        tipoDato: 'boolean',
        categoria: 'alertas',
        esPublico: false,
      },
      
      // Configuraciones de reportes
      {
        clave: 'reportes_max_registros',
        valor: '10000',
        descripcion: 'Máximo número de registros en reportes',
        tipoDato: 'number',
        categoria: 'reportes',
        esPublico: false,
      },
      {
        clave: 'reportes_cache_duration',
        valor: '300',
        descripcion: 'Duración del cache de reportes en segundos',
        tipoDato: 'number',
        categoria: 'reportes',
        esPublico: false,
      },
      
      // Configuraciones de seguridad
      {
        clave: 'session_timeout',
        valor: '1440',
        descripcion: 'Tiempo de expiración de sesión en minutos',
        tipoDato: 'number',
        categoria: 'seguridad',
        esPublico: false,
      },
      {
        clave: 'max_login_attempts',
        valor: '5',
        descripcion: 'Máximo número de intentos de login',
        tipoDato: 'number',
        categoria: 'seguridad',
        esPublico: false,
      },
      {
        clave: 'password_min_length',
        valor: '8',
        descripcion: 'Longitud mínima de contraseña',
        tipoDato: 'number',
        categoria: 'seguridad',
        esPublico: true,
      },
      
      // Configuraciones de interfaz
      {
        clave: 'items_per_page',
        valor: '10',
        descripcion: 'Número de elementos por página por defecto',
        tipoDato: 'number',
        categoria: 'interfaz',
        esPublico: true,
      },
      {
        clave: 'theme_default',
        valor: 'light',
        descripcion: 'Tema por defecto de la interfaz',
        tipoDato: 'string',
        categoria: 'interfaz',
        esPublico: true,
      },
      {
        clave: 'language_default',
        valor: 'es',
        descripcion: 'Idioma por defecto del sistema',
        tipoDato: 'string',
        categoria: 'interfaz',
        esPublico: true,
      },
      
      // Configuraciones de backup
      {
        clave: 'backup_enabled',
        valor: 'false',
        descripcion: 'Habilitar backups automáticos',
        tipoDato: 'boolean',
        categoria: 'backup',
        esPublico: false,
      },
      {
        clave: 'backup_schedule',
        valor: '0 2 * * *',
        descripcion: 'Programación de backups (cron)',
        tipoDato: 'string',
        categoria: 'backup',
        esPublico: false,
      },
      {
        clave: 'backup_retention_days',
        valor: '30',
        descripcion: 'Días de retención de backups',
        tipoDato: 'number',
        categoria: 'backup',
        esPublico: false,
      },
      
      // Configuraciones de notificaciones
      {
        clave: 'notifications_enabled',
        valor: 'true',
        descripcion: 'Habilitar notificaciones del sistema',
        tipoDato: 'boolean',
        categoria: 'notificaciones',
        esPublico: false,
      },
      {
        clave: 'email_from',
        valor: 'noreply@saludapurimac.gob.pe',
        descripcion: 'Email remitente para notificaciones',
        tipoDato: 'string',
        categoria: 'notificaciones',
        esPublico: false,
      },
      
      // Configuraciones de API
      {
        clave: 'api_rate_limit',
        valor: '100',
        descripcion: 'Límite de requests por ventana de tiempo',
        tipoDato: 'number',
        categoria: 'api',
        esPublico: false,
      },
      {
        clave: 'api_rate_window',
        valor: '900000',
        descripcion: 'Ventana de tiempo para rate limiting en ms',
        tipoDato: 'number',
        categoria: 'api',
        esPublico: false,
      },
    ];

    for (const config of configuraciones) {
      await prisma.configuracionSistema.create({
        data: config,
      });
    }

    console.log(`✅ ${configuraciones.length} configuraciones insertadas`);

    // Insertar establecimientos de prueba
    console.log('🏥 Insertando establecimientos de prueba...');

    // Crear centros de acopio
    const centroAcopio1 = await prisma.establecimiento.create({
      data: {
        nombre: 'Centro de Acopio Abancay',
        tipo: 'centro_acopio',
        codigo: 'CA-001',
        direccion: 'Av. Arenas 121, Abancay, Apurímac',
        responsable: 'Dr. Carlos Mendoza Quispe',
        telefono: '083-321456',
        estado: 'activo'
      }
    });

    const centroAcopio2 = await prisma.establecimiento.create({
      data: {
        nombre: 'Centro de Acopio Andahuaylas',
        tipo: 'centro_acopio',
        codigo: 'CA-002',
        direccion: 'Jr. Ramón Castilla 234, Andahuaylas, Apurímac',
        responsable: 'Dra. María Elena Vargas',
        telefono: '083-421789',
        estado: 'activo'
      }
    });

    // Crear centros de salud
    const centroSalud1 = await prisma.establecimiento.create({
      data: {
        nombre: 'Centro de Salud Tamburco',
        tipo: 'centro_salud',
        codigo: 'CS-001',
        centroAcopioId: centroAcopio1.id,
        direccion: 'Av. Los Chankas 456, Tamburco, Abancay',
        responsable: 'Enf. Ana Lucia Torres',
        telefono: '083-325678',
        estado: 'activo'
      }
    });

    const centroSalud2 = await prisma.establecimiento.create({
      data: {
        nombre: 'Centro de Salud Circa',
        tipo: 'centro_salud',
        codigo: 'CS-002',
        centroAcopioId: centroAcopio1.id,
        direccion: 'Plaza Principal s/n, Circa, Abancay',
        responsable: 'Lic. Roberto Huamán',
        telefono: '083-327890',
        estado: 'activo'
      }
    });

    // Crear puestos de salud
    const puestoSalud1 = await prisma.establecimiento.create({
      data: {
        nombre: 'Puesto de Salud Illanya',
        tipo: 'puesto_salud',
        codigo: 'PS-001',
        centroAcopioId: centroAcopio1.id,
        direccion: 'Comunidad de Illanya, Abancay',
        responsable: 'Tec. Enf. Carmen Quispe',
        telefono: '983-456789',
        estado: 'activo'
      }
    });

    const puestoSalud2 = await prisma.establecimiento.create({
      data: {
        nombre: 'Puesto de Salud Patibamba',
        tipo: 'puesto_salud',
        codigo: 'PS-002',
        centroAcopioId: centroAcopio1.id,
        direccion: 'Comunidad de Patibamba, Abancay',
        responsable: 'Tec. Enf. Luis Ccahuana',
        telefono: '983-567890',
        estado: 'activo'
      }
    });

    const puestoSalud3 = await prisma.establecimiento.create({
      data: {
        nombre: 'Puesto de Salud San Jerónimo',
        tipo: 'puesto_salud',
        codigo: 'PS-003',
        centroAcopioId: centroAcopio2.id,
        direccion: 'Plaza de Armas, San Jerónimo, Andahuaylas',
        responsable: 'Enf. Patricia Rojas',
        telefono: '983-678901',
        estado: 'activo'
      }
    });

    // Crear un establecimiento inactivo para pruebas
    await prisma.establecimiento.create({
      data: {
        nombre: 'Puesto de Salud Huancaray (Inactivo)',
        tipo: 'puesto_salud',
        codigo: 'PS-004',
        centroAcopioId: centroAcopio2.id,
        direccion: 'Comunidad de Huancaray, Andahuaylas',
        responsable: 'Tec. Enf. Miguel Flores',
        telefono: '983-789012',
        estado: 'inactivo'
      }
    });

    console.log('✅ 8 establecimientos insertados');

    // Insertar vacunas del esquema nacional
    console.log('💉 Insertando catálogo de vacunas...');

    const vacunas = [
      // Vacunas del esquema regular
      {
        nombre: 'BCG',
        tipo: 'Antituberculosa',
        presentacion: 'Frasco multidosis',
        dosisPorFrasco: 10,
        tiempoVidaUtil: 1825, // 5 años
        temperaturaAlmacenamiento: '2°C a 8°C',
        estado: 'activo'
      },
      {
        nombre: 'HVB Pediátrico',
        tipo: 'Hepatitis B',
        presentacion: 'Frasco unidosis',
        dosisPorFrasco: 1,
        tiempoVidaUtil: 1095, // 3 años
        temperaturaAlmacenamiento: '2°C a 8°C',
        estado: 'activo'
      },
      {
        nombre: 'HVB Adulto',
        tipo: 'Hepatitis B',
        presentacion: 'Frasco unidosis',
        dosisPorFrasco: 1,
        tiempoVidaUtil: 1095, // 3 años
        temperaturaAlmacenamiento: '2°C a 8°C',
        estado: 'activo'
      },
      {
        nombre: 'Pentavalente',
        tipo: 'Combinada',
        presentacion: 'Frasco unidosis',
        dosisPorFrasco: 1,
        tiempoVidaUtil: 1095, // 3 años
        temperaturaAlmacenamiento: '2°C a 8°C',
        estado: 'activo'
      },
      {
        nombre: 'Polio IPV',
        tipo: 'Antipoliomielítica',
        presentacion: 'Frasco unidosis',
        dosisPorFrasco: 1,
        tiempoVidaUtil: 1095, // 3 años
        temperaturaAlmacenamiento: '2°C a 8°C',
        estado: 'activo'
      },
      {
        nombre: 'Polio bOPV',
        tipo: 'Antipoliomielítica',
        presentacion: 'Frasco multidosis',
        dosisPorFrasco: 20,
        tiempoVidaUtil: 730, // 2 años
        temperaturaAlmacenamiento: '2°C a 8°C',
        estado: 'activo'
      },
      {
        nombre: 'Rotavirus',
        tipo: 'Antirrotavirus',
        presentacion: 'Frasco unidosis',
        dosisPorFrasco: 1,
        tiempoVidaUtil: 1095, // 3 años
        temperaturaAlmacenamiento: '2°C a 8°C',
        estado: 'activo'
      },
      {
        nombre: 'Neumococo',
        tipo: 'Antineumocócica',
        presentacion: 'Frasco unidosis',
        dosisPorFrasco: 1,
        tiempoVidaUtil: 1095, // 3 años
        temperaturaAlmacenamiento: '2°C a 8°C',
        estado: 'activo'
      },
      {
        nombre: 'SPR',
        tipo: 'Triple viral',
        presentacion: 'Frasco multidosis',
        dosisPorFrasco: 10,
        tiempoVidaUtil: 730, // 2 años
        temperaturaAlmacenamiento: '2°C a 8°C',
        estado: 'activo'
      },
      {
        nombre: 'Varicela',
        tipo: 'Antivaricela',
        presentacion: 'Frasco unidosis',
        dosisPorFrasco: 1,
        tiempoVidaUtil: 730, // 2 años
        temperaturaAlmacenamiento: '2°C a 8°C',
        estado: 'activo'
      },
      {
        nombre: 'Influenza Pediátrica',
        tipo: 'Antiinfluenza',
        presentacion: 'Frasco multidosis',
        dosisPorFrasco: 10,
        tiempoVidaUtil: 365, // 1 año
        temperaturaAlmacenamiento: '2°C a 8°C',
        estado: 'activo'
      },
      {
        nombre: 'Influenza Adulto',
        tipo: 'Antiinfluenza',
        presentacion: 'Frasco multidosis',
        dosisPorFrasco: 10,
        tiempoVidaUtil: 365, // 1 año
        temperaturaAlmacenamiento: '2°C a 8°C',
        estado: 'activo'
      },
      {
        nombre: 'DT Adulto',
        tipo: 'Antidiftérica-Antitetánica',
        presentacion: 'Frasco multidosis',
        dosisPorFrasco: 10,
        tiempoVidaUtil: 1095, // 3 años
        temperaturaAlmacenamiento: '2°C a 8°C',
        estado: 'activo'
      },
      {
        nombre: 'dT Adulto',
        tipo: 'Antidiftérica-Antitetánica',
        presentacion: 'Frasco multidosis',
        dosisPorFrasco: 10,
        tiempoVidaUtil: 1095, // 3 años
        temperaturaAlmacenamiento: '2°C a 8°C',
        estado: 'activo'
      },
      {
        nombre: 'Fiebre Amarilla',
        tipo: 'Antiamarílica',
        presentacion: 'Frasco multidosis',
        dosisPorFrasco: 5,
        tiempoVidaUtil: 1095, // 3 años
        temperaturaAlmacenamiento: '2°C a 8°C',
        estado: 'activo'
      },
      // Vacunas especiales
      {
        nombre: 'COVID-19 Pfizer',
        tipo: 'Anti-SARS-CoV-2',
        presentacion: 'Frasco multidosis',
        dosisPorFrasco: 6,
        tiempoVidaUtil: 270, // 9 meses
        temperaturaAlmacenamiento: '-70°C a -80°C',
        estado: 'activo'
      },
      {
        nombre: 'COVID-19 AstraZeneca',
        tipo: 'Anti-SARS-CoV-2',
        presentacion: 'Frasco multidosis',
        dosisPorFrasco: 10,
        tiempoVidaUtil: 180, // 6 meses
        temperaturaAlmacenamiento: '2°C a 8°C',
        estado: 'activo' as const
      }
    ];

    // Corregir tipos de estado
    const vacunasCorregidas = vacunas.map(vacuna => ({
      ...vacuna,
      estado: 'activo' as const
    }));

    await prisma.vacuna.createMany({
      data: vacunasCorregidas
    });

    console.log(`✅ ${vacunas.length} vacunas insertadas`);

    // Insertar catálogo de jeringas
    console.log('💉 Insertando catálogo de jeringas...');

    const jeringas = [
      // Jeringas desechables
      {
        tipo: 'Desechable',
        capacidad: '0.5ml',
        color: 'Transparente',
        estado: 'activo'
      },
      {
        tipo: 'Desechable',
        capacidad: '1ml',
        color: 'Transparente',
        estado: 'activo'
      },
      {
        tipo: 'Desechable',
        capacidad: '2ml',
        color: 'Transparente',
        estado: 'activo'
      },
      {
        tipo: 'Desechable',
        capacidad: '3ml',
        color: 'Transparente',
        estado: 'activo'
      },
      {
        tipo: 'Desechable',
        capacidad: '5ml',
        color: 'Transparente',
        estado: 'activo'
      },
      {
        tipo: 'Desechable',
        capacidad: '10ml',
        color: 'Transparente',
        estado: 'activo'
      },
      {
        tipo: 'Desechable',
        capacidad: '20ml',
        color: 'Transparente',
        estado: 'activo'
      },
      // Jeringas autoretraíbles
      {
        tipo: 'Autoretraíble',
        capacidad: '0.5ml',
        color: 'Azul',
        estado: 'activo'
      },
      {
        tipo: 'Autoretraíble',
        capacidad: '1ml',
        color: 'Azul',
        estado: 'activo'
      },
      {
        tipo: 'Autoretraíble',
        capacidad: '3ml',
        color: 'Azul',
        estado: 'activo'
      },
      {
        tipo: 'Autoretraíble',
        capacidad: '5ml',
        color: 'Azul',
        estado: 'activo'
      },
      // Jeringas de seguridad
      {
        tipo: 'De seguridad',
        capacidad: '1ml',
        color: 'Verde',
        estado: 'activo'
      },
      {
        tipo: 'De seguridad',
        capacidad: '3ml',
        color: 'Verde',
        estado: 'activo'
      },
      {
        tipo: 'De seguridad',
        capacidad: '5ml',
        color: 'Verde',
        estado: 'activo'
      },
      // Jeringas para insulina
      {
        tipo: 'Para insulina',
        capacidad: '0.5ml',
        color: 'Naranja',
        estado: 'activo'
      },
      {
        tipo: 'Para insulina',
        capacidad: '1ml',
        color: 'Naranja',
        estado: 'activo'
      },
      // Jeringas tuberculina
      {
        tipo: 'Tuberculina',
        capacidad: '1ml',
        color: 'Amarillo',
        estado: 'activo'
      },
      // Jeringas especiales con otros colores
      {
        tipo: 'Desechable',
        capacidad: '1ml',
        color: 'Rojo',
        estado: 'activo'
      },
      {
        tipo: 'Desechable',
        capacidad: '3ml',
        color: 'Morado',
        estado: 'activo'
      }
    ];

    // Corregir tipos de estado para jeringas
    const jeringasCorregidas = jeringas.map(jeringa => ({
      ...jeringa,
      estado: 'activo' as const
    }));

    await prisma.jeringa.createMany({
      data: jeringasCorregidas
    });

    console.log(`✅ ${jeringas.length} jeringas insertadas`);

    // Insertar lotes de vacunas
    console.log('📦 Insertando lotes de vacunas...');

    // Obtener las vacunas creadas para referenciarlas
    const vacunasCreadas = await prisma.vacuna.findMany({
      select: { id: true, nombre: true }
    });

    const lotesVacunas: any[] = [];
    let loteCounter = 1;

    // Crear lotes para cada vacuna
    for (let i = 0; i < vacunasCreadas.length; i++) {
      const vacuna = vacunasCreadas[i];
      const vacunaPrefix = vacuna.nombre.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');

      // Lote 1: Disponible con buen stock
      lotesVacunas.push({
        numero: `LT-${vacunaPrefix}-2025-${(loteCounter++).toString().padStart(3, '0')}`,
        vacunaId: vacuna.id,
        fechaIngreso: new Date('2025-01-15'),
        fechaVencimiento: new Date('2025-12-31'),
        formaIngreso: 'PRIMER_TRIMESTRE' as const,
        comprobanteClase: 'PECOSA' as const,
        numeroComprobante: `PEC-2025-${Math.floor(Math.random() * 9000 + 1000)}`,
        cantidadInicial: 1000,
        cantidadActual: 850,
        estado: 'disponible' as const,
        observaciones: 'Lote en perfecto estado, almacenado correctamente'
      });

      // Lote 2: Disponible con stock medio
      lotesVacunas.push({
        numero: `LT-${vacunaPrefix}-2025-${(loteCounter++).toString().padStart(3, '0')}`,
        vacunaId: vacuna.id,
        fechaIngreso: new Date('2025-02-10'),
        fechaVencimiento: new Date('2026-02-28'),
        formaIngreso: 'PRIMER_TRIMESTRE' as const,
        comprobanteClase: 'GUIA' as const,
        numeroComprobante: `GUI-2025-${Math.floor(Math.random() * 9000 + 1000)}`,
        cantidadInicial: 500,
        cantidadActual: 200,
        estado: 'disponible' as const,
        observaciones: 'Lote con rotación normal'
      });

      // Lote 3: Próximo a vencer
      lotesVacunas.push({
        numero: `LT-${vacunaPrefix}-2024-${(loteCounter++).toString().padStart(3, '0')}`,
        vacunaId: vacuna.id,
        fechaIngreso: new Date('2024-03-20'),
        fechaVencimiento: new Date('2025-08-15'), // Próximo a vencer
        formaIngreso: 'PRIMER_TRIMESTRE' as const,
        comprobanteClase: 'PECOSA' as const,
        numeroComprobante: `PEC-2024-${Math.floor(Math.random() * 9000 + 1000)}`,
        cantidadInicial: 750,
        cantidadActual: 120,
        estado: 'disponible' as const,
        observaciones: 'Priorizar uso - próximo a vencer'
      });

      // Lote 4: Agotado
      lotesVacunas.push({
        numero: `LT-${vacunaPrefix}-2024-${(loteCounter++).toString().padStart(3, '0')}`,
        vacunaId: vacuna.id,
        fechaIngreso: new Date('2024-12-01'),
        fechaVencimiento: new Date('2025-11-30'),
        formaIngreso: 'CUARTO_TRIMESTRE' as const,
        comprobanteClase: 'TRASLADO' as const,
        numeroComprobante: `TRA-2024-${Math.floor(Math.random() * 9000 + 1000)}`,
        cantidadInicial: 300,
        cantidadActual: 0,
        estado: 'agotado' as const,
        observaciones: 'Lote completamente distribuido'
      });

      // Lote 5: Vencido (solo para algunas vacunas)
      if (i % 2 === 0) { // Cada segunda vacuna tendrá un lote vencido
        lotesVacunas.push({
          numero: `LT-${vacunaPrefix}-2023-${(loteCounter++).toString().padStart(3, '0')}`,
          vacunaId: vacuna.id,
          fechaIngreso: new Date('2023-06-15'),
          fechaVencimiento: new Date('2024-12-31'), // Ya vencido
          formaIngreso: 'SEGUNDO_TRIMESTRE' as const,
          comprobanteClase: 'OTROS' as const,
          numeroComprobante: `OTR-2023-${Math.floor(Math.random() * 9000 + 1000)}`,
          cantidadInicial: 200,
          cantidadActual: 45,
          estado: 'vencido' as const,
          observaciones: 'Lote vencido - pendiente de disposición final'
        });
      }
    }

    await prisma.loteVacuna.createMany({
      data: lotesVacunas
    });

    console.log(`✅ ${lotesVacunas.length} lotes de vacunas insertados`);

    // Insertar lotes de jeringas
    console.log('💉 Insertando lotes de jeringas...');

    const lotesJeringas: any[] = [];
    const formasIngreso = ['PRIMER_TRIMESTRE', 'SEGUNDO_TRIMESTRE', 'TERCER_TRIMESTRE', 'CUARTO_TRIMESTRE'] as const;
    const comprobantesClase = ['PECOSA', 'GUIA', 'TRASLADO', 'OTROS'] as const;

    // Obtener jeringas de la base de datos
    const jeringasFromDB = await prisma.jeringa.findMany({
      where: { estado: 'activo' },
      orderBy: { createdAt: 'asc' }
    });

    // Crear lotes para cada jeringa
    for (let i = 0; i < jeringasFromDB.length; i++) {
      const jeringa = jeringasFromDB[i];
      const numLotes = Math.floor(Math.random() * 4) + 2; // 2-5 lotes por jeringa

      for (let j = 0; j < numLotes; j++) {
        const fechaIngreso = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        const cantidadInicial = Math.floor(Math.random() * 5000) + 1000; // 1000-6000 unidades
        const cantidadActual = Math.floor(Math.random() * cantidadInicial);

        // Fecha de vencimiento opcional (70% de probabilidad)
        let fechaVencimiento: Date | null = null;
        if (Math.random() > 0.3) {
          fechaVencimiento = new Date(fechaIngreso);
          fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + Math.floor(Math.random() * 3) + 2); // 2-4 años
        }

        // Determinar estado
        let estado = 'disponible';
        if (cantidadActual === 0) {
          estado = 'agotado';
        } else if (fechaVencimiento && fechaVencimiento < new Date()) {
          estado = 'vencido';
        }

        lotesJeringas.push({
          numero: `LJ-${jeringa.tipo.substring(0, 3).toUpperCase()}-${(i + 1).toString().padStart(3, '0')}-${(j + 1).toString().padStart(2, '0')}`,
          jeringaId: jeringa.id,
          fechaIngreso,
          fechaVencimiento,
          formaIngreso: formasIngreso[Math.floor(Math.random() * formasIngreso.length)],
          comprobanteClase: comprobantesClase[Math.floor(Math.random() * comprobantesClase.length)],
          numeroComprobante: `${Math.floor(Math.random() * 9000) + 1000}-${new Date().getFullYear()}`,
          cantidadInicial,
          cantidadActual,
          estado: estado as any,
          observaciones: estado === 'vencido' ? 'Lote vencido - pendiente de disposición final' :
                        estado === 'agotado' ? 'Stock agotado - requiere reposición' :
                        cantidadActual < cantidadInicial * 0.2 ? 'Stock bajo - programar reposición' : null
        });
      }
    }

    await prisma.loteJeringa.createMany({
      data: lotesJeringas
    });

    console.log(`✅ ${lotesJeringas.length} lotes de jeringas insertados`);

    // Insertar usuarios del sistema
    console.log('👥 Insertando usuarios del sistema...');

    // Importar bcrypt para encriptar contraseñas
    const bcrypt = require('bcrypt');
    const saltRounds = 12;

    const usuarios = [
      // Administrador del sistema
      {
        nombres: 'Luis Alberto',
        apellidos: 'Quispe Mamani',
        email: 'admin@saludapurimac.gob.pe',
        usuario: 'admin',
        passwordHash: await bcrypt.hash('Admin123!', saltRounds),
        rol: 'administrador',
        establecimientoId: null,
        estado: 'activo'
      },
      // Coordinador regional
      {
        nombres: 'María Elena',
        apellidos: 'Rodríguez Vargas',
        email: 'coordinadora@saludapurimac.gob.pe',
        usuario: 'mrodriguez',
        passwordHash: await bcrypt.hash('Coord123!', saltRounds),
        rol: 'coordinador',
        establecimientoId: null,
        estado: 'activo'
      },
      // Responsables de acopio
      {
        nombres: 'Carlos Alberto',
        apellidos: 'Mendoza López',
        email: 'cmendoza@saludapurimac.gob.pe',
        usuario: 'cmendoza',
        passwordHash: await bcrypt.hash('Resp123!', saltRounds),
        rol: 'responsable_acopio',
        establecimientoId: null, // Se asignará después de obtener el ID del centro de acopio
        estado: 'activo'
      },
      {
        nombres: 'Ana Patricia',
        apellidos: 'García Huamán',
        email: 'agarcia@saludapurimac.gob.pe',
        usuario: 'agarcia',
        passwordHash: await bcrypt.hash('Resp123!', saltRounds),
        rol: 'responsable_acopio',
        establecimientoId: null,
        estado: 'activo'
      },
      {
        nombres: 'José Manuel',
        apellidos: 'Huamán Quispe',
        email: 'jhuaman@saludapurimac.gob.pe',
        usuario: 'jhuaman',
        passwordHash: await bcrypt.hash('Resp123!', saltRounds),
        rol: 'responsable_acopio',
        establecimientoId: null,
        estado: 'activo'
      },
      // Operadores
      {
        nombres: 'Rosa María',
        apellidos: 'Condori Apaza',
        email: 'rcondori@saludapurimac.gob.pe',
        usuario: 'rcondori',
        passwordHash: await bcrypt.hash('Oper123!', saltRounds),
        rol: 'operador',
        establecimientoId: null,
        estado: 'activo'
      },
      {
        nombres: 'Pedro Luis',
        apellidos: 'Mamani Choque',
        email: 'pmamani@saludapurimac.gob.pe',
        usuario: 'pmamani',
        passwordHash: await bcrypt.hash('Oper123!', saltRounds),
        rol: 'operador',
        establecimientoId: null,
        estado: 'activo'
      },
      {
        nombres: 'Carmen Rosa',
        apellidos: 'Flores Quispe',
        email: 'cflores@saludapurimac.gob.pe',
        usuario: 'cflores',
        passwordHash: await bcrypt.hash('Oper123!', saltRounds),
        rol: 'operador',
        establecimientoId: null,
        estado: 'activo'
      },
      {
        nombres: 'Miguel Ángel',
        apellidos: 'Vargas Ccahuana',
        email: 'mvargas@saludapurimac.gob.pe',
        usuario: 'mvargas',
        passwordHash: await bcrypt.hash('Oper123!', saltRounds),
        rol: 'operador',
        establecimientoId: null,
        estado: 'activo'
      },
      {
        nombres: 'Lucía Isabel',
        apellidos: 'Choque Mamani',
        email: 'lchoque@saludapurimac.gob.pe',
        usuario: 'lchoque',
        passwordHash: await bcrypt.hash('Oper123!', saltRounds),
        rol: 'operador',
        establecimientoId: null,
        estado: 'activo'
      }
    ];

    // Obtener centros de acopio para asignar a responsables
    const centrosAcopio = await prisma.establecimiento.findMany({
      where: { tipo: 'centro_acopio' },
      select: { id: true, nombre: true }
    });

    // Asignar establecimientos a responsables de acopio
    if (centrosAcopio.length >= 3) {
      (usuarios[2] as any).establecimientoId = centrosAcopio[0].id; // Carlos - Abancay
      (usuarios[3] as any).establecimientoId = centrosAcopio[1].id; // Ana - Andahuaylas
      (usuarios[4] as any).establecimientoId = centrosAcopio[2].id; // José - Chincheros
    }

    // Crear usuarios
    for (const usuario of usuarios) {
      await prisma.usuario.create({
        data: usuario
      });
    }

    console.log(`✅ ${usuarios.length} usuarios insertados`);

    // Insertar planificaciones anuales para 2025
    console.log('📅 Insertando planificaciones anuales para 2025...');

    // Obtener vacunas y establecimientos para planificación
    const vacunasParaPlanificacion = await prisma.vacuna.findMany({
      where: { estado: 'activo' },
      select: { id: true, nombre: true }
    });

    const establecimientosParaPlanificacion = await prisma.establecimiento.findMany({
      where: {
        estado: 'activo',
        tipo: { in: ['centro_salud', 'puesto_salud'] } // Solo centros y puestos de salud
      },
      select: { id: true, nombre: true, tipo: true, centroAcopioId: true }
    });

    const planificaciones: any[] = [];

    // Datos base para distribución mensual por tipo de vacuna
    const distribucionesBase = {
      'BCG': [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12], // Uniforme
      'Pentavalente': [15, 18, 20, 22, 18, 15, 12, 10, 15, 18, 20, 17], // Estacional
      'HVB Pediátrico': [8, 10, 12, 15, 12, 10, 8, 6, 8, 10, 12, 9], // Estacional
      'Neumococo': [10, 12, 15, 18, 15, 12, 10, 8, 10, 12, 15, 13], // Estacional
      'Rotavirus': [6, 8, 10, 12, 10, 8, 6, 4, 6, 8, 10, 8], // Estacional
      'IPV': [4, 5, 6, 7, 6, 5, 4, 3, 4, 5, 6, 5], // Estacional
      'SPR': [20, 25, 30, 35, 30, 25, 20, 15, 20, 25, 30, 25], // Campañas
      'DPT': [8, 10, 12, 15, 12, 10, 8, 6, 8, 10, 12, 9], // Estacional
      'Influenza': [5, 8, 15, 25, 30, 20, 10, 5, 8, 15, 20, 15], // Campaña estacional
      'Hepatitis B Adulto': [3, 4, 5, 6, 5, 4, 3, 2, 3, 4, 5, 4] // Uniforme bajo
    };

    // Factores de multiplicación por tipo de establecimiento
    const factoresPorTipo = {
      'centro_salud': 1.0,
      'puesto_salud': 0.3
    };

    // Crear planificaciones para cada combinación vacuna-establecimiento
    for (const vacuna of vacunasParaPlanificacion) {
      const distribucionBase = distribucionesBase[vacuna.nombre] || [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];

      for (const establecimiento of establecimientosParaPlanificacion) {
        const factor = factoresPorTipo[establecimiento.tipo] || 1.0;

        // Aplicar factor y agregar variación aleatoria
        const distribucionMensual = distribucionBase.map((valor: number) => {
          const valorAjustado = Math.round(valor * factor);
          // Agregar variación del ±20%
          const variacion = Math.random() * 0.4 - 0.2; // -20% a +20%
          return Math.max(0, Math.round(valorAjustado * (1 + variacion)));
        });

        const metaAnual = distribucionMensual.reduce((sum: number, val: number) => sum + val, 0);

        // Solo crear planificación si la meta anual es mayor a 0
        if (metaAnual > 0) {
          planificaciones.push({
            establecimientoId: establecimiento.id,
            vacunaId: vacuna.id,
            anio: 2025,
            metaAnual,
            distribucionMensual,
            estado: 'aprobado' // La mayoría aprobadas para el ejemplo
          });
        }
      }
    }

    // Insertar planificaciones en lotes
    const batchSize = 50;
    let planificacionesCreadas = 0;

    for (let i = 0; i < planificaciones.length; i += batchSize) {
      const batch = planificaciones.slice(i, i + batchSize);

      for (const planificacion of batch) {
        try {
          await prisma.planificacionAnual.create({
            data: planificacion
          });
          planificacionesCreadas++;
        } catch (error) {
          console.warn(`⚠️ Error al crear planificación para establecimiento ${planificacion.establecimientoId} y vacuna ${planificacion.vacunaId}:`, error);
        }
      }
    }

    console.log(`✅ ${planificacionesCreadas} planificaciones anuales insertadas`);

    // FUNCIONALIDAD CLAVE: Generar movimientos de vacunas automáticamente desde planificaciones
    console.log('🔄 Generando movimientos de vacunas desde planificaciones...');

    // Obtener todas las planificaciones creadas
    const planificacionesCreadas_data = await prisma.planificacionAnual.findMany({
      where: { anio: 2025 },
      select: { id: true, establecimientoId: true, vacunaId: true, distribucionMensual: true }
    });

    // Obtener un usuario administrador para asignar a los movimientos
    const usuarioAdmin = await prisma.usuario.findFirst({
      where: { rol: 'administrador' }
    });

    if (!usuarioAdmin) {
      console.warn('⚠️ No se encontró usuario administrador para generar movimientos');
    } else {
      let movimientosCreados = 0;

      for (const planificacion of planificacionesCreadas_data) {
        try {
          // Generar movimientos para cada mes que tenga entrega > 0
          for (let mes = 1; mes <= 12; mes++) {
            const entregaMes = planificacion.distribucionMensual[mes - 1];

            if (entregaMes && entregaMes > 0) {
              await prisma.movimientoVacuna.create({
                data: {
                  establecimientoId: planificacion.establecimientoId,
                  vacunaId: planificacion.vacunaId,
                  mes: mes,
                  anio: 2025,
                  entrega: entregaMes,
                  usuarioId: usuarioAdmin.id,
                  fechaMovimiento: new Date(`2025-${mes.toString().padStart(2, '0')}-01`)
                }
              });
              movimientosCreados++;
            }
          }
        } catch (error) {
          console.warn(`⚠️ Error al generar movimientos para planificación ${planificacion.id}:`, error);
        }
      }

      console.log(`✅ ${movimientosCreados} movimientos de vacunas generados automáticamente`);
    }

    // Mostrar resumen
    const totalConfigs = await prisma.configuracionSistema.count();
    const publicConfigs = await prisma.configuracionSistema.count({
      where: { esPublico: true },
    });
    const totalEstablecimientos = await prisma.establecimiento.count();
    const totalCentrosAcopio = await prisma.establecimiento.count({
      where: { tipo: 'centro_acopio' },
    });
    const centrosSalud = await prisma.establecimiento.count({
      where: { tipo: 'centro_salud' },
    });
    const puestosSalud = await prisma.establecimiento.count({
      where: { tipo: 'puesto_salud' },
    });
    const totalVacunas = await prisma.vacuna.count();
    const vacunasActivas = await prisma.vacuna.count({
      where: { estado: 'activo' },
    });
    const totalJeringas = await prisma.jeringa.count();
    const jeringasActivas = await prisma.jeringa.count({
      where: { estado: 'activo' },
    });
    const totalUsuarios = await prisma.usuario.count();
    const usuariosActivos = await prisma.usuario.count({
      where: { estado: 'activo' },
    });
    const usuariosPorRol = await prisma.usuario.groupBy({
      by: ['rol'],
      _count: { rol: true }
    });
    const totalLotesVacunas = await prisma.loteVacuna.count();
    const lotesVacunasDisponibles = await prisma.loteVacuna.count({
      where: { estado: 'disponible' },
    });
    const lotesVacunasVencidos = await prisma.loteVacuna.count({
      where: { estado: 'vencido' },
    });
    const lotesVacunasAgotados = await prisma.loteVacuna.count({
      where: { estado: 'agotado' },
    });
    const totalLotesJeringas = await prisma.loteJeringa.count();
    const lotesJeringasDisponibles = await prisma.loteJeringa.count({
      where: { estado: 'disponible' },
    });
    const lotesJeringasVencidos = await prisma.loteJeringa.count({
      where: { estado: 'vencido' },
    });
    const lotesJeringasAgotados = await prisma.loteJeringa.count({
      where: { estado: 'agotado' },
    });
    const totalPlanificaciones = await prisma.planificacionAnual.count();
    const planificacionesAprobadas = await prisma.planificacionAnual.count({
      where: { estado: 'aprobado' },
    });
    const planificacionesBorrador = await prisma.planificacionAnual.count({
      where: { estado: 'borrador' },
    });

    // Insertar datos de prueba del Kardex
    console.log('\n📋 Insertando movimientos de kardex...');

    // Obtener algunos datos necesarios para el kardex
    const primeraVacuna = await prisma.vacuna.findFirst();
    const primerLoteVacuna = await prisma.loteVacuna.findFirst();
    const primeraJeringa = await prisma.jeringa.findFirst();
    const primerLoteJeringa = await prisma.loteJeringa.findFirst();
    const primerUsuario = await prisma.usuario.findFirst();
    const primerEstablecimiento = await prisma.establecimiento.findFirst();
    const segundoEstablecimiento = await prisma.establecimiento.findFirst({
      where: {
        NOT: {
          id: primerEstablecimiento?.id
        }
      }
    });

    if (primeraVacuna && primerLoteVacuna && primerUsuario && primerEstablecimiento) {
      // Movimientos de kardex para vacunas
      const movimientosKardexVacunas = [
        {
          tipo: 'vacuna',
          itemId: primeraVacuna.id,
          loteId: primerLoteVacuna.id,
          tipoMovimiento: 'ingreso',
          cantidad: 500,
          saldoAnterior: 0,
          saldoActual: 500,
          establecimientoDestinoId: primerEstablecimiento.id,
          documento: 'PECOSA',
          numeroDocumento: 'P-001-2024',
          observaciones: 'Ingreso inicial de lote BCG-2024-001',
          usuarioId: primerUsuario.id,
          fechaMovimiento: new Date('2024-01-15T08:30:00'),
        },
        {
          tipo: 'vacuna',
          itemId: primeraVacuna.id,
          loteId: primerLoteVacuna.id,
          tipoMovimiento: 'salida',
          cantidad: 50,
          saldoAnterior: 500,
          saldoActual: 450,
          establecimientoOrigenId: primerEstablecimiento.id,
          establecimientoDestinoId: segundoEstablecimiento?.id,
          documento: 'VALE',
          numeroDocumento: 'V-001-2024',
          observaciones: 'Entrega a establecimiento de salud',
          usuarioId: primerUsuario.id,
          fechaMovimiento: new Date('2024-01-20T14:15:00'),
        },
        {
          tipo: 'vacuna',
          itemId: primeraVacuna.id,
          loteId: primerLoteVacuna.id,
          tipoMovimiento: 'transferencia',
          cantidad: 25,
          saldoAnterior: 450,
          saldoActual: 425,
          establecimientoOrigenId: primerEstablecimiento.id,
          establecimientoDestinoId: segundoEstablecimiento?.id,
          documento: 'TRANSFERENCIA',
          numeroDocumento: 'T-001-2024',
          observaciones: 'Transferencia entre centros de acopio',
          usuarioId: primerUsuario.id,
          fechaMovimiento: new Date('2024-02-01T09:20:00'),
        },
        {
          tipo: 'vacuna',
          itemId: primeraVacuna.id,
          loteId: primerLoteVacuna.id,
          tipoMovimiento: 'ajuste',
          cantidad: -5,
          saldoAnterior: 425,
          saldoActual: 420,
          establecimientoOrigenId: primerEstablecimiento.id,
          documento: 'AJUSTE',
          numeroDocumento: 'A-001-2024',
          observaciones: 'Ajuste por diferencia de inventario',
          usuarioId: primerUsuario.id,
          fechaMovimiento: new Date('2024-02-05T16:30:00'),
        },
      ];

      for (const movimiento of movimientosKardexVacunas) {
        await prisma.kardex.create({
          data: movimiento,
        });
      }
    }

    if (primeraJeringa && primerLoteJeringa && primerUsuario && primerEstablecimiento) {
      // Movimientos de kardex para jeringas
      const movimientosKardexJeringas = [
        {
          tipo: 'jeringa',
          itemId: primeraJeringa.id,
          loteId: primerLoteJeringa.id,
          tipoMovimiento: 'ingreso',
          cantidad: 1000,
          saldoAnterior: 0,
          saldoActual: 1000,
          establecimientoDestinoId: primerEstablecimiento.id,
          documento: 'GUIA',
          numeroDocumento: 'G-001-2024',
          observaciones: 'Ingreso de jeringas 1ml',
          usuarioId: primerUsuario.id,
          fechaMovimiento: new Date('2024-01-18T11:00:00'),
        },
        {
          tipo: 'jeringa',
          itemId: primeraJeringa.id,
          loteId: primerLoteJeringa.id,
          tipoMovimiento: 'salida',
          cantidad: 100,
          saldoAnterior: 1000,
          saldoActual: 900,
          establecimientoOrigenId: primerEstablecimiento.id,
          establecimientoDestinoId: segundoEstablecimiento?.id,
          documento: 'VALE',
          numeroDocumento: 'V-002-2024',
          observaciones: 'Entrega de jeringas para campaña',
          usuarioId: primerUsuario.id,
          fechaMovimiento: new Date('2024-01-25T10:45:00'),
        },
      ];

      for (const movimiento of movimientosKardexJeringas) {
        await prisma.kardex.create({
          data: movimiento,
        });
      }
    }

    console.log('✅ Movimientos de kardex insertados exitosamente');

    console.log('\n📊 Resumen del seeder:');
    console.log(`   Total configuraciones: ${totalConfigs}`);
    console.log(`   Configuraciones públicas: ${publicConfigs}`);
    console.log(`   Configuraciones privadas: ${totalConfigs - publicConfigs}`);
    console.log(`   Total establecimientos: ${totalEstablecimientos}`);
    console.log(`   Centros de acopio: ${totalCentrosAcopio}`);
    console.log(`   Centros de salud: ${centrosSalud}`);
    console.log(`   Puestos de salud: ${puestosSalud}`);
    console.log(`   Total vacunas: ${totalVacunas}`);
    console.log(`   Vacunas activas: ${vacunasActivas}`);
    console.log(`   Total jeringas: ${totalJeringas}`);
    console.log(`   Jeringas activas: ${jeringasActivas}`);
    console.log(`   Total lotes de vacunas: ${totalLotesVacunas}`);
    console.log(`   Lotes vacunas disponibles: ${lotesVacunasDisponibles}`);
    console.log(`   Lotes vacunas vencidos: ${lotesVacunasVencidos}`);
    console.log(`   Lotes vacunas agotados: ${lotesVacunasAgotados}`);
    console.log(`   Total lotes de jeringas: ${totalLotesJeringas}`);
    console.log(`   Lotes jeringas disponibles: ${lotesJeringasDisponibles}`);
    console.log(`   Lotes jeringas vencidos: ${lotesJeringasVencidos}`);
    console.log(`   Lotes jeringas agotados: ${lotesJeringasAgotados}`);
    console.log(`   Total planificaciones: ${totalPlanificaciones}`);
    console.log(`   Planificaciones aprobadas: ${planificacionesAprobadas}`);
    console.log(`   Planificaciones borrador: ${planificacionesBorrador}`);
    console.log(`   Total usuarios: ${totalUsuarios}`);
    console.log(`   Usuarios activos: ${usuariosActivos}`);

    // Estadísticas del kardex
    const totalMovimientosKardex = await prisma.kardex.count();
    const movimientosIngreso = await prisma.kardex.count({
      where: { tipoMovimiento: 'ingreso' },
    });
    const movimientosSalida = await prisma.kardex.count({
      where: { tipoMovimiento: 'salida' },
    });
    const movimientosTransferencia = await prisma.kardex.count({
      where: { tipoMovimiento: 'transferencia' },
    });
    const movimientosAjuste = await prisma.kardex.count({
      where: { tipoMovimiento: 'ajuste' },
    });

    console.log(`   Total movimientos kardex: ${totalMovimientosKardex}`);
    console.log(`   Movimientos ingreso: ${movimientosIngreso}`);
    console.log(`   Movimientos salida: ${movimientosSalida}`);
    console.log(`   Movimientos transferencia: ${movimientosTransferencia}`);
    console.log(`   Movimientos ajuste: ${movimientosAjuste}`);

    // Mostrar usuarios por rol
    console.log('\n👥 Usuarios por rol:');
    usuariosPorRol.forEach(item => {
      console.log(`   ${item.rol}: ${item._count.rol} usuario(s)`);
    });

    // Mostrar configuraciones por categoría
    const categorias = await prisma.configuracionSistema.groupBy({
      by: ['categoria'],
      _count: {
        categoria: true,
      },
    });

    console.log('\n📂 Configuraciones por categoría:');
    categorias.forEach(cat => {
      console.log(`   ${cat.categoria}: ${cat._count.categoria}`);
    });

    console.log('\n🎉 Seeder completado exitosamente!');

  } catch (error) {
    console.error('❌ Error en el seeder:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error fatal en el seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
