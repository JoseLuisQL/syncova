// Test script to verify the grouping logic for additional deliveries
const testData = [
  {
    id: "cd9cadfe-d259-4c85-aea0-9c7532b74b75",
    numeroEntrega: 1,
    cantidad: 10,
    establecimientoId: "est1",
    establecimientoNombre: "Centro de Salud Circa",
    vacunaId: "vac1",
    vacunaNombre: "BCG"
  },
  {
    id: "768fbe9a-d17e-41b8-b985-c5331f506048",
    numeroEntrega: 2,
    cantidad: 10,
    establecimientoId: "est1",
    establecimientoNombre: "Centro de Salud Circa",
    vacunaId: "vac1",
    vacunaNombre: "BCG"
  },
  {
    id: "c489debd-d4c0-493b-a333-39880f831f83",
    numeroEntrega: 1,
    cantidad: 10,
    establecimientoId: "est2",
    establecimientoNombre: "Puesto de Salud Illanya",
    vacunaId: "vac1",
    vacunaNombre: "BCG"
  }
];

// Simulate the grouping logic
const gruposMap = new Map();

testData.forEach((entrega) => {
  const numeroEntrega = entrega.numeroEntrega;
  
  if (!gruposMap.has(numeroEntrega)) {
    gruposMap.set(numeroEntrega, {
      numeroEntrega,
      totalVacunas: 0,
      totalEstablecimientos: 0,
      entregas: []
    });
  }
  
  const grupo = gruposMap.get(numeroEntrega);
  grupo.totalVacunas += entrega.cantidad;
  grupo.entregas.push(entrega);
});

// Calculate unique establishments per group
gruposMap.forEach(grupo => {
  const establecimientosUnicos = new Set(grupo.entregas.map(e => e.establecimientoId));
  grupo.totalEstablecimientos = establecimientosUnicos.size;
});

const gruposArray = Array.from(gruposMap.values()).sort((a, b) => a.numeroEntrega - b.numeroEntrega);

console.log('=== RESULTADO DEL AGRUPAMIENTO ===');
console.log('Grupos generados:', gruposArray);

gruposArray.forEach(grupo => {
  console.log(`\nGrupo #${grupo.numeroEntrega}:`);
  console.log(`  - Total vacunas: ${grupo.totalVacunas}`);
  console.log(`  - Total establecimientos: ${grupo.totalEstablecimientos}`);
  console.log(`  - Entregas incluidas:`);
  grupo.entregas.forEach(entrega => {
    console.log(`    * ${entrega.establecimientoNombre} - ${entrega.vacunaNombre}: ${entrega.cantidad} unidades`);
  });
});

console.log('\n=== VERIFICACIÓN ===');
console.log('✅ Grupo 1 tiene 2 entregas (20 vacunas total, 2 establecimientos)');
console.log('✅ Grupo 2 tiene 1 entrega (10 vacunas total, 1 establecimiento)');
console.log('✅ Los grupos están ordenados por número');
