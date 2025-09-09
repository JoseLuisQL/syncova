"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciando seeder de SIVAC...');
    try {
        console.log('🧹 Limpiando datos existentes...');
        await prisma.usuario.deleteMany();
        await prisma.loteJeringa.deleteMany();
        await prisma.loteVacuna.deleteMany();
        await prisma.establecimiento.deleteMany();
        await prisma.configuracionSistema.deleteMany();
        await prisma.vacuna.deleteMany();
        await prisma.jeringa.deleteMany();
        console.log('⚙️ Insertando configuraciones del sistema...');
        const configuraciones = [
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
                valor: 'DISA Apurímac II',
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
        console.log('🏥 Insertando establecimientos de prueba...');
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
        console.log('💉 Insertando catálogo de vacunas...');
        const vacunas = [
            {
                nombre: 'BCG',
                tipo: 'Antituberculosa',
                presentacion: 'Frasco multidosis',
                dosisPorFrasco: 10,
                tiempoVidaUtil: 1825,
                temperaturaAlmacenamiento: '2°C a 8°C',
                estado: 'activo'
            },
            {
                nombre: 'HVB Pediátrico',
                tipo: 'Hepatitis B',
                presentacion: 'Frasco unidosis',
                dosisPorFrasco: 1,
                tiempoVidaUtil: 1095,
                temperaturaAlmacenamiento: '2°C a 8°C',
                estado: 'activo'
            },
            {
                nombre: 'HVB Adulto',
                tipo: 'Hepatitis B',
                presentacion: 'Frasco unidosis',
                dosisPorFrasco: 1,
                tiempoVidaUtil: 1095,
                temperaturaAlmacenamiento: '2°C a 8°C',
                estado: 'activo'
            },
            {
                nombre: 'Pentavalente',
                tipo: 'Combinada',
                presentacion: 'Frasco unidosis',
                dosisPorFrasco: 1,
                tiempoVidaUtil: 1095,
                temperaturaAlmacenamiento: '2°C a 8°C',
                estado: 'activo'
            },
            {
                nombre: 'Polio IPV',
                tipo: 'Antipoliomielítica',
                presentacion: 'Frasco unidosis',
                dosisPorFrasco: 1,
                tiempoVidaUtil: 1095,
                temperaturaAlmacenamiento: '2°C a 8°C',
                estado: 'activo'
            },
            {
                nombre: 'Polio bOPV',
                tipo: 'Antipoliomielítica',
                presentacion: 'Frasco multidosis',
                dosisPorFrasco: 20,
                tiempoVidaUtil: 730,
                temperaturaAlmacenamiento: '2°C a 8°C',
                estado: 'activo'
            },
            {
                nombre: 'Rotavirus',
                tipo: 'Antirrotavirus',
                presentacion: 'Frasco unidosis',
                dosisPorFrasco: 1,
                tiempoVidaUtil: 1095,
                temperaturaAlmacenamiento: '2°C a 8°C',
                estado: 'activo'
            },
            {
                nombre: 'Neumococo',
                tipo: 'Antineumocócica',
                presentacion: 'Frasco unidosis',
                dosisPorFrasco: 1,
                tiempoVidaUtil: 1095,
                temperaturaAlmacenamiento: '2°C a 8°C',
                estado: 'activo'
            },
            {
                nombre: 'SPR',
                tipo: 'Triple viral',
                presentacion: 'Frasco multidosis',
                dosisPorFrasco: 10,
                tiempoVidaUtil: 730,
                temperaturaAlmacenamiento: '2°C a 8°C',
                estado: 'activo'
            },
            {
                nombre: 'Varicela',
                tipo: 'Antivaricela',
                presentacion: 'Frasco unidosis',
                dosisPorFrasco: 1,
                tiempoVidaUtil: 730,
                temperaturaAlmacenamiento: '2°C a 8°C',
                estado: 'activo'
            },
            {
                nombre: 'Influenza Pediátrica',
                tipo: 'Antiinfluenza',
                presentacion: 'Frasco multidosis',
                dosisPorFrasco: 10,
                tiempoVidaUtil: 365,
                temperaturaAlmacenamiento: '2°C a 8°C',
                estado: 'activo'
            },
            {
                nombre: 'Influenza Adulto',
                tipo: 'Antiinfluenza',
                presentacion: 'Frasco multidosis',
                dosisPorFrasco: 10,
                tiempoVidaUtil: 365,
                temperaturaAlmacenamiento: '2°C a 8°C',
                estado: 'activo'
            },
            {
                nombre: 'DT Adulto',
                tipo: 'Antidiftérica-Antitetánica',
                presentacion: 'Frasco multidosis',
                dosisPorFrasco: 10,
                tiempoVidaUtil: 1095,
                temperaturaAlmacenamiento: '2°C a 8°C',
                estado: 'activo'
            },
            {
                nombre: 'dT Adulto',
                tipo: 'Antidiftérica-Antitetánica',
                presentacion: 'Frasco multidosis',
                dosisPorFrasco: 10,
                tiempoVidaUtil: 1095,
                temperaturaAlmacenamiento: '2°C a 8°C',
                estado: 'activo'
            },
            {
                nombre: 'Fiebre Amarilla',
                tipo: 'Antiamarílica',
                presentacion: 'Frasco multidosis',
                dosisPorFrasco: 5,
                tiempoVidaUtil: 1095,
                temperaturaAlmacenamiento: '2°C a 8°C',
                estado: 'activo'
            },
            {
                nombre: 'COVID-19 Pfizer',
                tipo: 'Anti-SARS-CoV-2',
                presentacion: 'Frasco multidosis',
                dosisPorFrasco: 6,
                tiempoVidaUtil: 270,
                temperaturaAlmacenamiento: '-70°C a -80°C',
                estado: 'activo'
            },
            {
                nombre: 'COVID-19 AstraZeneca',
                tipo: 'Anti-SARS-CoV-2',
                presentacion: 'Frasco multidosis',
                dosisPorFrasco: 10,
                tiempoVidaUtil: 180,
                temperaturaAlmacenamiento: '2°C a 8°C',
                estado: 'activo'
            }
        ];
        await prisma.vacuna.createMany({
            data: vacunas
        });
        console.log(`✅ ${vacunas.length} vacunas insertadas`);
        console.log('💉 Insertando catálogo de jeringas...');
        const jeringas = [
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
            {
                tipo: 'Tuberculina',
                capacidad: '1ml',
                color: 'Amarillo',
                estado: 'activo'
            },
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
        await prisma.jeringa.createMany({
            data: jeringas
        });
        console.log(`✅ ${jeringas.length} jeringas insertadas`);
        console.log('📦 Insertando lotes de vacunas...');
        const vacunasCreadas = await prisma.vacuna.findMany({
            select: { id: true, nombre: true }
        });
        const lotesVacunas = [];
        let loteCounter = 1;
        for (let i = 0; i < vacunasCreadas.length; i++) {
            const vacuna = vacunasCreadas[i];
            const vacunaPrefix = vacuna.nombre.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
            lotesVacunas.push({
                numero: `LT-${vacunaPrefix}-2025-${(loteCounter++).toString().padStart(3, '0')}`,
                vacunaId: vacuna.id,
                fechaIngreso: new Date('2025-01-15'),
                fechaVencimiento: new Date('2025-12-31'),
                formaIngreso: 'PRIMER_TRIMESTRE',
                comprobanteClase: 'PECOSA',
                numeroComprobante: `PEC-2025-${Math.floor(Math.random() * 9000 + 1000)}`,
                cantidadInicial: 1000,
                cantidadActual: 850,
                estado: 'disponible',
                observaciones: 'Lote en perfecto estado, almacenado correctamente'
            });
            lotesVacunas.push({
                numero: `LT-${vacunaPrefix}-2025-${(loteCounter++).toString().padStart(3, '0')}`,
                vacunaId: vacuna.id,
                fechaIngreso: new Date('2025-02-10'),
                fechaVencimiento: new Date('2026-02-28'),
                formaIngreso: 'PRIMER_TRIMESTRE',
                comprobanteClase: 'GUIA',
                numeroComprobante: `GUI-2025-${Math.floor(Math.random() * 9000 + 1000)}`,
                cantidadInicial: 500,
                cantidadActual: 200,
                estado: 'disponible',
                observaciones: 'Lote con rotación normal'
            });
            lotesVacunas.push({
                numero: `LT-${vacunaPrefix}-2024-${(loteCounter++).toString().padStart(3, '0')}`,
                vacunaId: vacuna.id,
                fechaIngreso: new Date('2024-03-20'),
                fechaVencimiento: new Date('2025-08-15'),
                formaIngreso: 'PRIMER_TRIMESTRE',
                comprobanteClase: 'PECOSA',
                numeroComprobante: `PEC-2024-${Math.floor(Math.random() * 9000 + 1000)}`,
                cantidadInicial: 750,
                cantidadActual: 120,
                estado: 'disponible',
                observaciones: 'Priorizar uso - próximo a vencer'
            });
            lotesVacunas.push({
                numero: `LT-${vacunaPrefix}-2024-${(loteCounter++).toString().padStart(3, '0')}`,
                vacunaId: vacuna.id,
                fechaIngreso: new Date('2024-12-01'),
                fechaVencimiento: new Date('2025-11-30'),
                formaIngreso: 'CUARTO_TRIMESTRE',
                comprobanteClase: 'TRASLADO',
                numeroComprobante: `TRA-2024-${Math.floor(Math.random() * 9000 + 1000)}`,
                cantidadInicial: 300,
                cantidadActual: 0,
                estado: 'agotado',
                observaciones: 'Lote completamente distribuido'
            });
            if (i % 2 === 0) {
                lotesVacunas.push({
                    numero: `LT-${vacunaPrefix}-2023-${(loteCounter++).toString().padStart(3, '0')}`,
                    vacunaId: vacuna.id,
                    fechaIngreso: new Date('2023-06-15'),
                    fechaVencimiento: new Date('2024-12-31'),
                    formaIngreso: 'SEGUNDO_TRIMESTRE',
                    comprobanteClase: 'OTROS',
                    numeroComprobante: `OTR-2023-${Math.floor(Math.random() * 9000 + 1000)}`,
                    cantidadInicial: 200,
                    cantidadActual: 45,
                    estado: 'vencido',
                    observaciones: 'Lote vencido - pendiente de disposición final'
                });
            }
        }
        await prisma.loteVacuna.createMany({
            data: lotesVacunas
        });
        console.log(`✅ ${lotesVacunas.length} lotes de vacunas insertados`);
        console.log('💉 Insertando lotes de jeringas...');
        const lotesJeringas = [];
        const formasIngreso = ['PRIMER_TRIMESTRE', 'SEGUNDO_TRIMESTRE', 'TERCER_TRIMESTRE', 'CUARTO_TRIMESTRE'];
        const comprobantesClase = ['PECOSA', 'GUIA', 'TRASLADO', 'OTROS'];
        const jeringasFromDB = await prisma.jeringa.findMany({
            where: { estado: 'activo' },
            orderBy: { createdAt: 'asc' }
        });
        for (let i = 0; i < jeringasFromDB.length; i++) {
            const jeringa = jeringasFromDB[i];
            const numLotes = Math.floor(Math.random() * 4) + 2;
            for (let j = 0; j < numLotes; j++) {
                const fechaIngreso = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
                const cantidadInicial = Math.floor(Math.random() * 5000) + 1000;
                const cantidadActual = Math.floor(Math.random() * cantidadInicial);
                let fechaVencimiento = null;
                if (Math.random() > 0.3) {
                    fechaVencimiento = new Date(fechaIngreso);
                    fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + Math.floor(Math.random() * 3) + 2);
                }
                let estado = 'disponible';
                if (cantidadActual === 0) {
                    estado = 'agotado';
                }
                else if (fechaVencimiento && fechaVencimiento < new Date()) {
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
                    estado,
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
        console.log('👥 Insertando usuarios del sistema...');
        const bcrypt = require('bcrypt');
        const saltRounds = 12;
        const usuarios = [
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
            {
                nombres: 'Carlos Alberto',
                apellidos: 'Mendoza López',
                email: 'cmendoza@saludapurimac.gob.pe',
                usuario: 'cmendoza',
                passwordHash: await bcrypt.hash('Resp123!', saltRounds),
                rol: 'responsable_acopio',
                establecimientoId: null,
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
        const centrosAcopio = await prisma.establecimiento.findMany({
            where: { tipo: 'centro_acopio' },
            select: { id: true, nombre: true }
        });
        if (centrosAcopio.length >= 3) {
            usuarios[2].establecimientoId = centrosAcopio[0].id;
            usuarios[3].establecimientoId = centrosAcopio[1].id;
            usuarios[4].establecimientoId = centrosAcopio[2].id;
        }
        for (const usuario of usuarios) {
            await prisma.usuario.create({
                data: usuario
            });
        }
        console.log(`✅ ${usuarios.length} usuarios insertados`);
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
        console.log(`   Total usuarios: ${totalUsuarios}`);
        console.log(`   Usuarios activos: ${usuariosActivos}`);
        console.log('\n👥 Usuarios por rol:');
        usuariosPorRol.forEach(item => {
            console.log(`   ${item.rol}: ${item._count.rol} usuario(s)`);
        });
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
    }
    catch (error) {
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
//# sourceMappingURL=seed.js.map