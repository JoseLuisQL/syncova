// Test script to verify collection center loading functionality
// This script can be run in the browser console to test the fix

console.log('Testing collection center loading...');

// Test the EstablecimientoService.getCentrosAcopio() function
async function testCentrosAcopioLoading() {
  try {
    // This would normally be imported, but for testing we'll access it from window
    if (typeof EstablecimientoService !== 'undefined') {
      const centros = await EstablecimientoService.getCentrosAcopio();
      console.log('Collection centers loaded:', centros);
      console.log('Number of centers:', centros.length);
      
      // Check if the objects have the correct CentroAcopio structure
      if (centros.length > 0) {
        const firstCenter = centros[0];
        console.log('First center structure:', firstCenter);
        console.log('Has id:', !!firstCenter.id);
        console.log('Has nombre:', !!firstCenter.nombre);
        console.log('Has direccion:', !!firstCenter.direccion);
        console.log('Has responsable:', !!firstCenter.responsable);
        console.log('Has estado:', !!firstCenter.estado);
        
        // Check that it doesn't have Establecimiento-specific properties
        console.log('Does NOT have tipo (good):', !firstCenter.tipo);
        console.log('Does NOT have centroAcopioId (good):', !firstCenter.centroAcopioId);
      }
      
      return centros;
    } else {
      console.error('EstablecimientoService not available');
      return null;
    }
  } catch (error) {
    console.error('Error loading collection centers:', error);
    return null;
  }
}

// Test the useEstablecimientos hook behavior
function testHookBehavior() {
  console.log('Testing hook behavior...');
  
  // Check if the hook is properly typed
  console.log('This test should be run within a React component that uses useEstablecimientos');
  console.log('The centrosAcopio state should now be typed as CentroAcopio[] instead of Establecimiento[]');
}

// Run tests
console.log('=== Collection Center Loading Test ===');
testCentrosAcopioLoading().then(result => {
  if (result) {
    console.log('✅ Collection centers loaded successfully');
  } else {
    console.log('❌ Failed to load collection centers');
  }
});

testHookBehavior();

console.log('=== Test completed ===');
console.log('To verify the fix:');
console.log('1. Navigate to the Planificación por Vacuna module');
console.log('2. Check that the Centro de Acopio dropdown shows actual collection centers');
console.log('3. Verify that selecting a center filters the data correctly');
console.log('4. Check browser console for any TypeScript errors');
