const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVouchers() {
  try {
    const vouchers = await prisma.valeEntrega.findMany({
      include: { centroAcopio: true },
      orderBy: { fechaGeneracion: 'desc' },
      take: 5
    });
    
    console.log('📋 Available vouchers:');
    vouchers.forEach(v => {
      console.log(`  - ${v.numero} (${v.estado}) - ${v.centroAcopio.nombre} - ${v.fechaGeneracion.toISOString().split('T')[0]}`);
    });
    
    if (vouchers.length > 0) {
      const kardex = await prisma.kardex.findMany({
        where: { numeroDocumento: vouchers[0].numero, tipo: 'vacuna' },
        take: 5,
        orderBy: { fechaMovimiento: 'asc' }
      });
      console.log(`\n📊 Kardex movements for ${vouchers[0].numero}: ${kardex.length}`);
      kardex.forEach((k, i) => {
        console.log(`  ${i+1}. Qty: ${k.cantidad}, Balance: ${k.saldoAnterior} → ${k.saldoActual}`);
      });
      
      // Check for the balance issue pattern
      if (kardex.length > 1) {
        const uniqueBalances = new Set(kardex.map(k => `${k.saldoAnterior}-${k.saldoActual}`));
        if (uniqueBalances.size === 1) {
          console.log('\n❌ BALANCE BUG DETECTED: All movements have identical balances!');
        } else {
          console.log('\n✅ Balances appear to be sequential');
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVouchers();
