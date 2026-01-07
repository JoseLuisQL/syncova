const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn']
});

async function testEndpointDirect() {
  try {
    console.log('🔍 TESTING VOUCHER VERIFICATION ENDPOINT DIRECTLY\n');

    // Get existing voucher details
    const existingVoucher = await prisma.valeEntrega.findFirst({
      where: { estado: 'generado' },
      include: {
        detalles: {
          include: {
            establecimiento: {
              select: { id: true, nombre: true }
            },
            vacuna: {
              select: { id: true, nombre: true }
            }
          }
        }
      }
    });

    if (!existingVoucher || !existingVoucher.detalles.length) {
      console.log('❌ No se encontró vale con detalles para probar');
      return;
    }

    const firstDetail = existingVoucher.detalles[0];
    console.log(`📄 Vale encontrado: ${existingVoucher.numero}`);
    console.log(`   Establecimiento: ${firstDetail.establecimiento.nombre} (${firstDetail.establecimientoId})`);
    console.log(`   Vacuna: ${firstDetail.vacuna.nombre} (${firstDetail.vacunaId})`);
    console.log(`   Período: ${existingVoucher.mes}/${existingVoucher.anio}`);

    // Test using PowerShell Invoke-RestMethod
    const baseUrl = 'http://localhost:3001/api/vales/verificar-existencia';
    const params = `establecimientoId=${firstDetail.establecimientoId}&vacunaId=${firstDetail.vacunaId}&mes=${existingVoucher.mes}&anio=${existingVoucher.anio}`;
    const fullUrl = `${baseUrl}?${params}`;

    console.log(`\n🌐 Probando endpoint: ${fullUrl}`);

    // Create PowerShell command
    const psCommand = `try { 
      $response = Invoke-RestMethod -Uri "${fullUrl}" -Method GET
      Write-Host "SUCCESS: $($response | ConvertTo-Json -Depth 10)"
    } catch { 
      Write-Host "ERROR: $($_.Exception.Message)"
      Write-Host "STATUS: $($_.Exception.Response.StatusCode)"
    }`;

    console.log('\n🔍 Ejecutando consulta...');

    // Execute the PowerShell command
    const { spawn } = require('child_process');
    
    return new Promise((resolve) => {
      const ps = spawn('powershell', ['-Command', psCommand], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      ps.stdout.on('data', (data) => {
        output += data.toString();
      });

      ps.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ps.on('close', (code) => {
        console.log('\n📋 RESULTADO:');
        if (output) {
          console.log(output);
        }
        if (errorOutput) {
          console.log('Error output:', errorOutput);
        }
        console.log(`Exit code: ${code}`);
        resolve();
      });
    });

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEndpointDirect();
