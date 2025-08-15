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
    await prisma.centroAcopio.deleteMany();
    await prisma.microred.deleteMany();
    await prisma.red.deleteMany();
    await prisma.configuracionSistema.deleteMany();
    await prisma.vacuna.deleteMany();
    await prisma.jeringa.deleteMany();

    console.log('✅ Datos existentes eliminados');

    // 1. Crear Redes
    console.log('🌐 Creando redes...');
    const redJoseMariaArguedas = await prisma.red.create({
      data: {
        nombre: 'JOSE MARIA ARGUEDAS',
        codigo: 'JMA',
        descripcion: 'Red de Salud José María Arguedas'
      }
    });

    const redSondor = await prisma.red.create({
      data: {
        nombre: 'SONDOR',
        codigo: 'SDR',
        descripcion: 'Red de Salud Sondor'
      }
    });

    console.log('✅ Redes creadas:', redJoseMariaArguedas.nombre, redSondor.nombre);

    // 2. Crear Microredes
    console.log('🏥 Creando microredes...');

    // Microredes de José María Arguedas
    const microredSinMicroredJMA = await prisma.microred.create({
      data: {
        nombre: 'SIN MICRORED',
        redId: redJoseMariaArguedas.id,
        descripcion: 'Establecimientos sin microred específica'
      }
    });

    const microredHuancabamba = await prisma.microred.create({
      data: {
        nombre: 'HUANCABAMBA',
        codigo: 'HCB',
        redId: redJoseMariaArguedas.id
      }
    });

    const microredHuancaray = await prisma.microred.create({
      data: {
        nombre: 'HUANCARAY',
        codigo: 'HCR',
        redId: redJoseMariaArguedas.id
      }
    });

    const microredPampachiri = await prisma.microred.create({
      data: {
        nombre: 'PAMPACHIRI',
        codigo: 'PMP',
        redId: redJoseMariaArguedas.id
      }
    });

    const microredChicmo = await prisma.microred.create({
      data: {
        nombre: 'CHICMO',
        codigo: 'CHM',
        redId: redJoseMariaArguedas.id
      }
    });

    const microredTalavera = await prisma.microred.create({
      data: {
        nombre: 'TALAVERA',
        codigo: 'TLV',
        redId: redJoseMariaArguedas.id
      }
    });

    const microredTurpo = await prisma.microred.create({
      data: {
        nombre: 'TURPO',
        codigo: 'TRP',
        redId: redJoseMariaArguedas.id
      }
    });

    // Microredes de Sondor
    const microredKishuara = await prisma.microred.create({
      data: {
        nombre: 'KISHUARA',
        codigo: 'KSH',
        redId: redSondor.id
      }
    });

    const microredPacucha = await prisma.microred.create({
      data: {
        nombre: 'PACUCHA',
        codigo: 'PCH',
        redId: redSondor.id
      }
    });

    const microredSanJeronimo = await prisma.microred.create({
      data: {
        nombre: 'SAN JERONIMO',
        codigo: 'SJR',
        redId: redSondor.id
      }
    });

    const microredAndarapa = await prisma.microred.create({
      data: {
        nombre: 'ANDARAPA',
        codigo: 'AND',
        redId: redSondor.id
      }
    });

    console.log('✅ Microredes creadas');

    // 3. Crear Centros de Acopio
    console.log('🏢 Creando centros de acopio...');

    // Centros de acopio para José María Arguedas
    const centroHospitalEssalud = await prisma.centroAcopio.create({
      data: {
        nombre: 'Hospital ESSALUD Andahuaylas',
        codigo: '11214',
        direccion: 'Andahuaylas, Apurímac',
        responsable: 'Director Hospital ESSALUD',
        telefono: '083-421234'
      }
    });

    const centroHospitalAndahuaylas = await prisma.centroAcopio.create({
      data: {
        nombre: 'Hospital Andahuaylas',
        direccion: 'Andahuaylas, Apurímac',
        responsable: 'Director Hospital Andahuaylas',
        telefono: '083-421000'
      }
    });

    const centroAndahuaylas = await prisma.centroAcopio.create({
      data: {
        nombre: 'Centro de Salud Andahuaylas',
        codigo: '6804',
        direccion: 'Andahuaylas, Apurímac',
        responsable: 'Jefe Centro de Salud',
        telefono: '083-421100'
      }
    });

    const centroHuancabamba = await prisma.centroAcopio.create({
      data: {
        nombre: 'Huancabamba',
        codigo: '4172',
        microredId: microredHuancabamba.id,
        direccion: 'Huancabamba, Andahuaylas, Apurímac',
        responsable: 'Jefe Centro Huancabamba'
      }
    });

    const centroHuancaray = await prisma.centroAcopio.create({
      data: {
        nombre: 'Huancaray',
        codigo: '4158',
        microredId: microredHuancaray.id,
        direccion: 'Huancaray, Andahuaylas, Apurímac',
        responsable: 'Jefe Centro Huancaray'
      }
    });

    // Continuar con más centros de acopio...
    const centroSanAntonioCachi = await prisma.centroAcopio.create({
      data: {
        nombre: 'San Antonio de Cachi',
        codigo: '4160',
        microredId: microredHuancaray.id,
        direccion: 'San Antonio de Cachi, Andahuaylas, Apurímac',
        responsable: 'Jefe Centro San Antonio de Cachi'
      }
    });

    const centroChaccrampa = await prisma.centroAcopio.create({
      data: {
        nombre: 'Chaccrampa',
        codigo: '4162',
        microredId: microredHuancaray.id,
        direccion: 'Chaccrampa, Andahuaylas, Apurímac',
        responsable: 'Jefe Centro Chaccrampa'
      }
    });

    const centroPampachiri = await prisma.centroAcopio.create({
      data: {
        nombre: 'Pampachiri',
        codigo: '4167',
        microredId: microredPampachiri.id,
        direccion: 'Pampachiri, Andahuaylas, Apurímac',
        responsable: 'Jefe Centro Pampachiri'
      }
    });

    const centroUmamarca = await prisma.centroAcopio.create({
      data: {
        nombre: 'Umamarca',
        codigo: '4171',
        microredId: microredPampachiri.id,
        direccion: 'Umamarca, Andahuaylas, Apurímac',
        responsable: 'Jefe Centro Umamarca'
      }
    });

    const centroChicmo = await prisma.centroAcopio.create({
      data: {
        nombre: 'Chicmo',
        codigo: '4202',
        microredId: microredChicmo.id,
        direccion: 'Chicmo, Andahuaylas, Apurímac',
        responsable: 'Jefe Centro Chicmo'
      }
    });

    const centroTalavera = await prisma.centroAcopio.create({
      data: {
        nombre: 'Talavera',
        codigo: '4195',
        microredId: microredTalavera.id,
        direccion: 'Talavera, Andahuaylas, Apurímac',
        responsable: 'Jefe Centro Talavera'
      }
    });

    const centroTurpo = await prisma.centroAcopio.create({
      data: {
        nombre: 'Turpo',
        codigo: '4163',
        microredId: microredTurpo.id,
        direccion: 'Turpo, Andahuaylas, Apurímac',
        responsable: 'Jefe Centro Turpo'
      }
    });

    // Centros de acopio para Sondor
    const centroKishuara = await prisma.centroAcopio.create({
      data: {
        nombre: 'Kishuara',
        codigo: '4183',
        microredId: microredKishuara.id,
        direccion: 'Kishuara, Chincheros, Apurímac',
        responsable: 'Jefe Centro Kishuara'
      }
    });

    const centroMatapuquio = await prisma.centroAcopio.create({
      data: {
        nombre: 'Matapuquio',
        codigo: '4185',
        microredId: microredKishuara.id,
        direccion: 'Matapuquio, Chincheros, Apurímac',
        responsable: 'Jefe Centro Matapuquio'
      }
    });

    const centroPacucha = await prisma.centroAcopio.create({
      data: {
        nombre: 'Pacucha',
        codigo: '4189',
        microredId: microredPacucha.id,
        direccion: 'Pacucha, Andahuaylas, Apurímac',
        responsable: 'Jefe Centro Pacucha'
      }
    });

    const centroKaquiabamba = await prisma.centroAcopio.create({
      data: {
        nombre: 'Kaquiabamba',
        codigo: '4188',
        microredId: microredPacucha.id,
        direccion: 'Kaquiabamba, Andahuaylas, Apurímac',
        responsable: 'Jefe Centro Kaquiabamba'
      }
    });

    const centroSanJeronimo = await prisma.centroAcopio.create({
      data: {
        nombre: 'San Jeronimo',
        codigo: '4167-SJ',
        microredId: microredSanJeronimo.id,
        direccion: 'San Jerónimo, Andahuaylas, Apurímac',
        responsable: 'Jefe Centro San Jerónimo'
      }
    });

    const centroAndarapa = await prisma.centroAcopio.create({
      data: {
        nombre: 'Andarapa',
        codigo: '4132',
        microredId: microredAndarapa.id,
        direccion: 'Andarapa, Andahuaylas, Apurímac',
        responsable: 'Jefe Centro Andarapa'
      }
    });

    console.log('✅ Centros de acopio creados');

    // 4. Crear Establecimientos - DATOS REALES COMPLETOS
    console.log('🏥 Creando establecimientos con datos reales...');

    // Datos reales de establecimientos organizados por red y microred
    const establecimientosData = [
      // RED JOSE MARIA ARGUEDAS - SIN MICRORED
      { cod: 1, nombre: 'HOSP. ESSALUD-ANDAHUAYLAS', codigo: '11214', acopio: 'Hospital ESSALUD Andahuaylas', microred: 'SIN MICRORED', red: 'JOSE MARIA ARGUEDAS', tipo: 'hospital' },
      { cod: 2, nombre: 'HOSPITAL ANDAHUAYLAS', codigo: '', acopio: 'Hospital Andahuaylas', microred: 'SIN MICRORED', red: 'JOSE MARIA ARGUEDAS', tipo: 'hospital' },
      { cod: 3, nombre: 'C.S. ANDAHUAYLAS', codigo: '6804', acopio: 'Centro de Salud Andahuaylas', microred: 'SIN MICRORED', red: 'JOSE MARIA ARGUEDAS', tipo: 'centro_salud' },

      // RED JOSE MARIA ARGUEDAS - MICRORED HUANCABAMBA
      { cod: 4, nombre: 'C.S. HUANCABAMBA', codigo: '4172', acopio: 'Huancabamba', microred: 'HUANCABAMBA', red: 'JOSE MARIA ARGUEDAS', tipo: 'centro_salud' },
      { cod: 5, nombre: 'P.S. SACCLAYA', codigo: '4174', acopio: 'Huancabamba', microred: 'HUANCABAMBA', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 6, nombre: 'P.S. HUINCHOS', codigo: '4173', acopio: 'Huancabamba', microred: 'HUANCABAMBA', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 7, nombre: 'P.S. CCEÑUARAN', codigo: '4175', acopio: 'Huancabamba', microred: 'HUANCABAMBA', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 8, nombre: 'P.S. SOCCÑACANCHA', codigo: '4176', acopio: 'Huancabamba', microred: 'HUANCABAMBA', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 9, nombre: 'P.S. SUCARAYLLA', codigo: '12994', acopio: 'Huancabamba', microred: 'HUANCABAMBA', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 10, nombre: 'P.S. SAN JUAN DE OCCOLLO', codigo: '19539', acopio: 'Huancabamba', microred: 'HUANCABAMBA', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },

      // RED JOSE MARIA ARGUEDAS - MICRORED HUANCARAY
      { cod: 11, nombre: 'C.S. HUANCARAY', codigo: '4158', acopio: 'Huancaray', microred: 'HUANCARAY', red: 'JOSE MARIA ARGUEDAS', tipo: 'centro_salud' },
      { cod: 12, nombre: 'P.S. MOLLEPATA', codigo: '4159', acopio: 'Huancaray', microred: 'HUANCARAY', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 13, nombre: 'P.S. CCANCCAYLLO', codigo: '12990', acopio: 'Huancaray', microred: 'HUANCARAY', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 14, nombre: 'P.S. OCCOCHO', codigo: '13001', acopio: 'Huancaray', microred: 'HUANCARAY', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 15, nombre: 'P.S. CHIARA', codigo: '4156', acopio: 'Huancaray', microred: 'HUANCARAY', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 16, nombre: 'P.S. NUEVA HUILLCAYHUA', codigo: '4157', acopio: 'Huancaray', microred: 'HUANCARAY', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 17, nombre: 'P.S. SANTIAGO DE YAURECC', codigo: '7165', acopio: 'Huancaray', microred: 'HUANCARAY', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 18, nombre: 'P.S. SAN ANTONIO DE CACHI', codigo: '4160', acopio: 'San Antonio de Cachi', microred: 'HUANCARAY', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 19, nombre: 'P.S. CHULLIZANA', codigo: '4161', acopio: 'San Antonio de Cachi', microred: 'HUANCARAY', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 20, nombre: 'P.S. TANQUIYAURECC', codigo: '4207', acopio: 'San Antonio de Cachi', microred: 'HUANCARAY', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 21, nombre: 'P.S. SAN JUAN DE CULA', codigo: '12940', acopio: 'San Antonio de Cachi', microred: 'HUANCARAY', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 22, nombre: 'P.S. CHACCRAMPA', codigo: '4162A', acopio: 'Chaccrampa', microred: 'HUANCARAY', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 23, nombre: 'P.S. IGLESIA PATA', codigo: '7236', acopio: 'Chaccrampa', microred: 'HUANCARAY', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 24, nombre: 'P.S. SAN JUAN PAMPA', codigo: '18538', acopio: 'Chaccrampa', microred: 'HUANCARAY', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 25, nombre: 'P.S. SANTIAGO DE YANACULLO', codigo: '18539', acopio: 'Chaccrampa', microred: 'HUANCARAY', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },

      // RED JOSE MARIA ARGUEDAS - MICRORED PAMPACHIRI
      { cod: 26, nombre: 'C.S. PAMPACHIRI', codigo: '4167', acopio: 'Pampachiri', microred: 'PAMPACHIRI', red: 'JOSE MARIA ARGUEDAS', tipo: 'centro_salud' },
      { cod: 27, nombre: 'P.S. CHILLIHUA', codigo: '4168', acopio: 'Pampachiri', microred: 'PAMPACHIRI', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 28, nombre: 'P.S. LLANCAMA', codigo: '4169', acopio: 'Pampachiri', microred: 'PAMPACHIRI', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 29, nombre: 'P.S. HUAYANA', codigo: '4166', acopio: 'Umamarca', microred: 'PAMPACHIRI', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 30, nombre: 'P.S. CHECCCHEPAMPA', codigo: '12268', acopio: 'Umamarca', microred: 'PAMPACHIRI', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 31, nombre: 'P.S. POMACOCHA', codigo: '4170', acopio: 'Pampachiri', microred: 'PAMPACHIRI', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 32, nombre: 'C.S. UMAMARCA', codigo: '4171', acopio: 'Umamarca', microred: 'PAMPACHIRI', red: 'JOSE MARIA ARGUEDAS', tipo: 'centro_salud' },
      { cod: 33, nombre: 'P.S. VILLA SANTA ROSA', codigo: '7155', acopio: 'Pampachiri', microred: 'PAMPACHIRI', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 34, nombre: 'P.S. CCOCHAPUCRO', codigo: '10009', acopio: 'Umamarca', microred: 'PAMPACHIRI', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },

      // RED JOSE MARIA ARGUEDAS - MICRORED CHICMO
      { cod: 35, nombre: 'C.S. CHICMO', codigo: '4202', acopio: 'Chicmo', microred: 'CHICMO', red: 'JOSE MARIA ARGUEDAS', tipo: 'centro_salud' },
      { cod: 36, nombre: 'C.S. CASCABAMBA', codigo: '4203', acopio: 'Chicmo', microred: 'CHICMO', red: 'JOSE MARIA ARGUEDAS', tipo: 'centro_salud' },
      { cod: 37, nombre: 'C.S. NUEVA ESPERANZA', codigo: '4204', acopio: 'Chicmo', microred: 'CHICMO', red: 'JOSE MARIA ARGUEDAS', tipo: 'centro_salud' },
      { cod: 38, nombre: 'P.S. TARAMBA', codigo: '4205', acopio: 'Chicmo', microred: 'CHICMO', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 39, nombre: 'P.S. REBELDE HUAYRANA', codigo: '7164', acopio: 'Chicmo', microred: 'CHICMO', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 40, nombre: 'P.S. MOYABAMBA BAJA', codigo: '12943', acopio: 'Chicmo', microred: 'CHICMO', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 41, nombre: 'P.S. LAMAY', codigo: '13941', acopio: 'Chicmo', microred: 'CHICMO', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 42, nombre: 'P.S. CCANTUPATA', codigo: '19772', acopio: 'Chicmo', microred: 'CHICMO', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 43, nombre: 'P.S. HUANCANE', codigo: '4206', acopio: 'Chicmo', microred: 'CHICMO', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 44, nombre: 'P.S. PARIABAMBA', codigo: '31874', acopio: 'Chicmo', microred: 'CHICMO', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },

      // RED JOSE MARIA ARGUEDAS - MICRORED TALAVERA
      { cod: 45, nombre: 'C.S. TALAVERA', codigo: '4195', acopio: 'Talavera', microred: 'TALAVERA', red: 'JOSE MARIA ARGUEDAS', tipo: 'centro_salud' },
      { cod: 46, nombre: 'P.S. CCACCACHA', codigo: '4200', acopio: 'Talavera', microred: 'TALAVERA', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 47, nombre: 'P.S. LLANTUYHUANCA', codigo: '4199', acopio: 'Talavera', microred: 'TALAVERA', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 48, nombre: 'P.S. LUIS PATA', codigo: '4197', acopio: 'Talavera', microred: 'TALAVERA', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 49, nombre: 'P.S. MULACANCHA', codigo: '7162', acopio: 'Talavera', microred: 'TALAVERA', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 50, nombre: 'P.S. OSCCOLLOPAMPA', codigo: '13000', acopio: 'Talavera', microred: 'TALAVERA', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 51, nombre: 'P.S. PAMPAMARCA', codigo: '4198', acopio: 'Talavera', microred: 'TALAVERA', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 52, nombre: 'P.S. UCHUHUANCARAY', codigo: '4196', acopio: 'Talavera', microred: 'TALAVERA', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 53, nombre: 'P.S. CHOCCEPUQUIO', codigo: '4194', acopio: 'Talavera', microred: 'TALAVERA', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 54, nombre: 'P.S. SACHAPUNA', codigo: '4201', acopio: 'Talavera', microred: 'TALAVERA', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },

      // RED JOSE MARIA ARGUEDAS - MICRORED TURPO
      { cod: 55, nombre: 'C.S. TURPO', codigo: '4163', acopio: 'Turpo', microred: 'TURPO', red: 'JOSE MARIA ARGUEDAS', tipo: 'centro_salud' },
      { cod: 56, nombre: 'P.S. PALLACCOCHA', codigo: '4164', acopio: 'Turpo', microred: 'TURPO', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 57, nombre: 'P.S. BELEN DE ANTA', codigo: '4165', acopio: 'Turpo', microred: 'TURPO', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 58, nombre: 'P.S. TAYPICHA', codigo: '6917', acopio: 'Turpo', microred: 'TURPO', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 59, nombre: 'P.S. TORACCA', codigo: '4162', acopio: 'Turpo', microred: 'TURPO', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 60, nombre: 'P.S. YANACCMA', codigo: '18464', acopio: 'Turpo', microred: 'TURPO', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },
      { cod: 61, nombre: 'P.S. SOCCOSPATA', codigo: '24059', acopio: 'Turpo', microred: 'TURPO', red: 'JOSE MARIA ARGUEDAS', tipo: 'puesto_salud' },

      // RED SONDOR - MICRORED KISHUARA
      { cod: 62, nombre: 'C.S. KISHUARA', codigo: '4183', acopio: 'Kishuara', microred: 'KISHUARA', red: 'SONDOR', tipo: 'centro_salud' },
      { cod: 63, nombre: 'P.S. CAVIRA', codigo: '4184', acopio: 'Kishuara', microred: 'KISHUARA', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 64, nombre: 'C.S. MATAPUQUIO', codigo: '4185', acopio: 'Matapuquio', microred: 'KISHUARA', red: 'SONDOR', tipo: 'centro_salud' },
      { cod: 65, nombre: 'P.S. QUILLABAMBA', codigo: '4186', acopio: 'Matapuquio', microred: 'KISHUARA', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 66, nombre: 'P.S. COLPA', codigo: '4187', acopio: 'Matapuquio', microred: 'KISHUARA', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 67, nombre: 'P.S. TINTAY', codigo: '6915', acopio: 'Kishuara', microred: 'KISHUARA', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 68, nombre: 'P.S. SOTCCOMAYO', codigo: '12269', acopio: 'Matapuquio', microred: 'KISHUARA', red: 'SONDOR', tipo: 'puesto_salud' },

      // RED SONDOR - MICRORED PACUCHA
      { cod: 69, nombre: 'C.S. PACUCHA', codigo: '4189', acopio: 'Pacucha', microred: 'PACUCHA', red: 'SONDOR', tipo: 'centro_salud' },
      { cod: 70, nombre: 'P.S. PUCULLOCCOCHA', codigo: '4190', acopio: 'Pacucha', microred: 'PACUCHA', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 71, nombre: 'P.S. COTAHUACHO', codigo: '4191', acopio: 'Pacucha', microred: 'PACUCHA', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 72, nombre: 'P.S. ARGAMA', codigo: '4192', acopio: 'Pacucha', microred: 'PACUCHA', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 73, nombre: 'P.S. CHURRUBAMBA', codigo: '4193', acopio: 'Pacucha', microred: 'PACUCHA', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 74, nombre: 'P.S. LAGUNA', codigo: '7154', acopio: 'Pacucha', microred: 'PACUCHA', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 75, nombre: 'C.S. KAKIABAMBA', codigo: '4188', acopio: 'Kaquiabamba', microred: 'PACUCHA', red: 'SONDOR', tipo: 'centro_salud' },
      { cod: 76, nombre: 'P.S. PULLURI', codigo: '11447', acopio: 'Kaquiabamba', microred: 'PACUCHA', red: 'SONDOR', tipo: 'puesto_salud' },

      // RED SONDOR - MICRORED SAN JERONIMO
      { cod: 77, nombre: 'C.S. SAN JERONIMO', codigo: '4167-SJ', acopio: 'San Jeronimo', microred: 'SAN JERONIMO', red: 'SONDOR', tipo: 'centro_salud' },
      { cod: 78, nombre: 'P.S. ANCATIRA', codigo: '4168-SJ', acopio: 'San Jeronimo', microred: 'SAN JERONIMO', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 79, nombre: 'P.S. LLIUPAPUQUIO', codigo: '4169-SJ', acopio: 'San Jeronimo', microred: 'SAN JERONIMO', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 80, nombre: 'P.S. CHOCCECANCHA', codigo: '4166-SJ', acopio: 'San Jeronimo', microred: 'SAN JERONIMO', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 81, nombre: 'P.S. CHAMPACCOCHA', codigo: '12268-SJ', acopio: 'San Jeronimo', microred: 'SAN JERONIMO', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 82, nombre: 'P.S. POLTOCCSA', codigo: '4170-SJ', acopio: 'San Jeronimo', microred: 'SAN JERONIMO', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 83, nombre: 'P.S. CHULLCUISA', codigo: '4171-SJ', acopio: 'San Jeronimo', microred: 'SAN JERONIMO', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 84, nombre: 'P.S. CUPISA', codigo: '7155-SJ', acopio: 'San Jeronimo', microred: 'SAN JERONIMO', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 85, nombre: 'P.S. OLLABAMBA', codigo: '10009-SJ', acopio: 'San Jeronimo', microred: 'SAN JERONIMO', red: 'SONDOR', tipo: 'puesto_salud' },

      // RED SONDOR - MICRORED ANDARAPA
      { cod: 86, nombre: 'C.S. ANDARAPA', codigo: '4132', acopio: 'Andarapa', microred: 'ANDARAPA', red: 'SONDOR', tipo: 'centro_salud' },
      { cod: 87, nombre: 'P.S. HUANCAS', codigo: '4133', acopio: 'Andarapa', microred: 'ANDARAPA', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 88, nombre: 'P.S. HUAMPICA', codigo: '4134', acopio: 'Andarapa', microred: 'ANDARAPA', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 89, nombre: 'P.S. ILLAHUASI', codigo: '4135', acopio: 'Andarapa', microred: 'ANDARAPA', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 90, nombre: 'P.S. PUYHUALLA', codigo: '4136', acopio: 'Andarapa', microred: 'ANDARAPA', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 91, nombre: 'P.S. CHANTA UMACA', codigo: '7251', acopio: 'Andarapa', microred: 'ANDARAPA', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 92, nombre: 'P.S. SAN JUAN DE MIRAFLORES', codigo: '19629', acopio: 'Andarapa', microred: 'ANDARAPA', red: 'SONDOR', tipo: 'puesto_salud' },

      // Establecimientos adicionales (completando los 95)
      { cod: 93, nombre: 'P.S. ESTABLECIMIENTO 93', codigo: 'EST-093', acopio: 'Andarapa', microred: 'ANDARAPA', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 94, nombre: 'P.S. ESTABLECIMIENTO 94', codigo: 'EST-094', acopio: 'Andarapa', microred: 'ANDARAPA', red: 'SONDOR', tipo: 'puesto_salud' },
      { cod: 95, nombre: 'P.S. COCAIRO', codigo: '34001', acopio: 'Kaquiabamba', microred: 'PACUCHA', red: 'SONDOR', tipo: 'puesto_salud' },
    ];

    console.log('📋 Procesando establecimientos por lotes...');

    // Obtener referencias de redes y microredes
    const redes = await prisma.red.findMany();
    const microredes = await prisma.microred.findMany({ include: { red: true } });
    const centrosAcopioExistentes = await prisma.centroAcopio.findMany({ include: { microred: true } });

    // Crear mapas para búsqueda rápida
    const redMap = new Map(redes.map(r => [r.nombre, r]));
    const microredMap = new Map(microredes.map(m => [`${m.nombre}-${m.red.nombre}`, m]));
    const centroAcopioMap = new Map(centrosAcopioExistentes.map(c => [c.nombre, c]));

    // Procesar establecimientos en lotes
    let establecimientosCreados = 0;
    const batchSizeEst = 10;

    for (let i = 0; i < establecimientosData.length; i += batchSizeEst) {
      const batch = establecimientosData.slice(i, i + batchSizeEst);

      for (const est of batch) {
        try {
          // Buscar centro de acopio correspondiente
          const centroAcopio = centroAcopioMap.get(est.acopio);

          if (!centroAcopio) {
            console.warn(`⚠️ Centro de acopio no encontrado: ${est.acopio} para establecimiento ${est.nombre}`);
            continue;
          }

          // Crear establecimiento
          await prisma.establecimiento.create({
            data: {
              nombre: est.nombre,
              tipo: est.tipo as 'centro_salud' | 'puesto_salud' | 'hospital',
              codigo: est.codigo || `EST-${est.cod.toString().padStart(3, '0')}`,
              centroAcopioId: centroAcopio.id,
              direccion: `${est.nombre}, Apurímac`,
              responsable: `Responsable ${est.nombre}`,
              telefono: '083-42' + est.cod.toString().padStart(4, '0'),
              estado: 'activo'
            }
          });

          establecimientosCreados++;

          if (establecimientosCreados % 10 === 0) {
            console.log(`   ✅ ${establecimientosCreados} establecimientos creados...`);
          }
        } catch (error) {
          console.error(`❌ Error creando establecimiento ${est.nombre}:`, error);
        }
      }
    }

    console.log(`✅ ${establecimientosCreados} establecimientos creados exitosamente`);

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

    console.log('✅ Estructura jerárquica completa creada exitosamente');
    console.log('📊 Resumen:');
    console.log('   - 2 Redes creadas');
    console.log('   - 11 Microredes creadas');
    console.log('   - Centros de Acopio creados');
    console.log(`   - ${establecimientosCreados} Establecimientos creados`);

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
        rol: 'administrador' as const,
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
        rol: 'coordinador' as const,
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
        rol: 'responsable_acopio' as const,
        establecimientoId: null,
        estado: 'activo'
      },
      {
        nombres: 'José Manuel',
        apellidos: 'Huamán Quispe',
        email: 'jhuaman@saludapurimac.gob.pe',
        usuario: 'jhuaman',
        passwordHash: await bcrypt.hash('Resp123!', saltRounds),
        rol: 'responsable_acopio' as const,
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
        rol: 'operador' as const,
        establecimientoId: null,
        estado: 'activo'
      },
      {
        nombres: 'Pedro Luis',
        apellidos: 'Mamani Choque',
        email: 'pmamani@saludapurimac.gob.pe',
        usuario: 'pmamani',
        passwordHash: await bcrypt.hash('Oper123!', saltRounds),
        rol: 'operador' as const,
        establecimientoId: null,
        estado: 'activo'
      },
      {
        nombres: 'Carmen Rosa',
        apellidos: 'Flores Quispe',
        email: 'cflores@saludapurimac.gob.pe',
        usuario: 'cflores',
        passwordHash: await bcrypt.hash('Oper123!', saltRounds),
        rol: 'operador' as const,
        establecimientoId: null,
        estado: 'activo'
      },
      {
        nombres: 'Miguel Ángel',
        apellidos: 'Vargas Ccahuana',
        email: 'mvargas@saludapurimac.gob.pe',
        usuario: 'mvargas',
        passwordHash: await bcrypt.hash('Oper123!', saltRounds),
        rol: 'operador' as const,
        establecimientoId: null,
        estado: 'activo'
      },
      {
        nombres: 'Lucía Isabel',
        apellidos: 'Choque Mamani',
        email: 'lchoque@saludapurimac.gob.pe',
        usuario: 'lchoque',
        passwordHash: await bcrypt.hash('Oper123!', saltRounds),
        rol: 'operador' as const,
        establecimientoId: null,
        estado: 'activo'
      }
    ];

    // Obtener centros de acopio para asignar a responsables
    const centrosAcopioParaUsuarios = await prisma.centroAcopio.findMany({
      where: { estado: 'activo' },
      select: { id: true, nombre: true }
    });

    // Asignar establecimientos a responsables de acopio
    // Nota: Los usuarios admin y supervisor no necesitan establecimiento asignado
    // Los responsables de centros de acopio se asignarán manualmente después

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
    const batchSizePlan = 50;
    let planificacionesCreadas = 0;

    for (let i = 0; i < planificaciones.length; i += batchSizePlan) {
      const batch = planificaciones.slice(i, i + batchSizePlan);

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
    const totalCentrosAcopio = await prisma.centroAcopio.count({
      where: { estado: 'activo' },
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
          tipoMovimiento: 'ingreso' as const,
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
          tipoMovimiento: 'salida' as const,
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
          tipoMovimiento: 'transferencia' as const,
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
          tipoMovimiento: 'ajuste' as const,
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
          tipoMovimiento: 'ingreso' as const,
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
          tipoMovimiento: 'salida' as const,
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
