// Test script to verify Kardex establishment fix
// Run this in the browser console on the Kardex page

async function testKardexEstablishmentsFix() {
    console.log('🧪 Testing Kardex Establishments Fix...');
    
    try {
        // Test 1: Check if establishments API is working
        console.log('📡 Testing establishments API...');
        const establishmentsResponse = await fetch('http://localhost:3001/api/establecimientos?noPagination=true');
        const establishmentsData = await establishmentsResponse.json();
        
        if (!establishmentsData.success || !establishmentsData.data) {
            console.error('❌ Establishments API failed:', establishmentsData);
            return false;
        }
        
        console.log('✅ Establishments API working:', establishmentsData.data.length, 'establishments found');
        
        // Test 2: Check if Kardex API returns establishment data
        console.log('📡 Testing Kardex API...');
        const kardexResponse = await fetch('http://localhost:3001/api/kardex?limit=5');
        const kardexData = await kardexResponse.json();
        
        if (!kardexData.success || !kardexData.data || !kardexData.data.movimientos) {
            console.error('❌ Kardex API failed:', kardexData);
            return false;
        }
        
        console.log('✅ Kardex API working:', kardexData.data.movimientos.length, 'movements found');
        
        // Test 3: Check if movements include establishment data
        const movements = kardexData.data.movimientos;
        const movementsWithEstablishments = movements.filter(m => 
            m.establecimientoOrigen || m.establecimientoDestino
        );
        
        console.log('🏥 Movements with establishment data:', movementsWithEstablishments.length, '/', movements.length);
        
        if (movementsWithEstablishments.length > 0) {
            const sampleMovement = movementsWithEstablishments[0];
            console.log('📋 Sample movement establishment data:', {
                origenId: sampleMovement.establecimientoOrigenId,
                origenData: sampleMovement.establecimientoOrigen,
                destinoId: sampleMovement.establecimientoDestinoId,
                destinoData: sampleMovement.establecimientoDestino
            });
        }
        
        // Test 4: Test establishment name resolution logic
        console.log('🔍 Testing establishment name resolution...');
        const establishments = establishmentsData.data;
        
        const getEstablecimientoNombre = (establecimientoId) => {
            if (!establecimientoId) return '-';
            const establecimiento = establishments.find(e => e.id === establecimientoId);
            return establecimiento?.nombre || 'Establecimiento no encontrado';
        };
        
        // Test with a sample movement
        if (movements.length > 0) {
            const testMovement = movements[0];
            
            const origenFromAPI = testMovement.establecimientoOrigen?.nombre;
            const origenFromLookup = getEstablecimientoNombre(testMovement.establecimientoOrigenId);
            const origenFinal = origenFromAPI || origenFromLookup;
            
            const destinoFromAPI = testMovement.establecimientoDestino?.nombre;
            const destinoFromLookup = getEstablecimientoNombre(testMovement.establecimientoDestinoId);
            const destinoFinal = destinoFromAPI || destinoFromLookup;
            
            console.log('🏥 Establishment resolution test:', {
                origen: {
                    fromAPI: origenFromAPI,
                    fromLookup: origenFromLookup,
                    final: origenFinal,
                    isResolved: origenFinal !== 'Establecimiento no encontrado'
                },
                destino: {
                    fromAPI: destinoFromAPI,
                    fromLookup: destinoFromLookup,
                    final: destinoFinal,
                    isResolved: destinoFinal !== 'Establecimiento no encontrado'
                }
            });
            
            const isFixed = (origenFinal !== 'Establecimiento no encontrado' || !testMovement.establecimientoOrigenId) &&
                           (destinoFinal !== 'Establecimiento no encontrado' || !testMovement.establecimientoDestinoId);
            
            if (isFixed) {
                console.log('✅ Kardex establishments fix is working correctly!');
                return true;
            } else {
                console.log('❌ Kardex establishments fix is not working properly');
                return false;
            }
        }
        
        console.log('⚠️ No movements found to test with');
        return true;
        
    } catch (error) {
        console.error('❌ Error testing Kardex establishments fix:', error);
        return false;
    }
}

// Test the frontend state if we're on the Kardex page
function testFrontendState() {
    console.log('🖥️ Testing frontend state...');
    
    // Check if we're on the Kardex page
    if (!window.location.pathname.includes('kardex')) {
        console.log('⚠️ Not on Kardex page, skipping frontend tests');
        return;
    }
    
    // Check if React components are loaded
    const kardexElements = document.querySelectorAll('[data-testid*="kardex"], .kardex, #kardex');
    console.log('🔍 Found Kardex elements:', kardexElements.length);
    
    // Check for movement details buttons
    const detailButtons = document.querySelectorAll('button[title*="detalle"], button[aria-label*="detalle"]');
    console.log('🔍 Found detail buttons:', detailButtons.length);
    
    if (detailButtons.length > 0) {
        console.log('💡 Try clicking a "Ver Detalles" button to test the modal');
    }
}

// Run the tests
console.log('🚀 Starting Kardex Establishments Fix Tests...');
testKardexEstablishmentsFix().then(success => {
    if (success) {
        console.log('🎉 All tests passed! The fix should be working.');
    } else {
        console.log('💥 Some tests failed. Check the errors above.');
    }
    
    testFrontendState();
});
