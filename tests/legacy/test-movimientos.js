async function login() {
  try {
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario: 'admin',
        password: 'Admin123@'
      })
    });

    const loginResult = await loginResponse.json();
    console.log('Login Response:', JSON.stringify(loginResult, null, 2));

    if (loginResult.success && loginResult.data.token) {
      return loginResult.data.token;
    }
    return null;
  } catch (error) {
    console.error('Login Error:', error);
    return null;
  }
}

async function testMovimientos() {
  try {
    // First login to get token
    const token = await login();
    if (!token) {
      console.log('Failed to get authentication token');
      return;
    }

    console.log('Testing with token:', token.substring(0, 20) + '...');

    const response = await fetch('http://localhost:3001/api/reportes/movimientos-por-eess', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fechaInicio: '2025-09-01',
        fechaFin: '2025-09-16'
      })
    });

    const result = await response.json();
    console.log('Movimientos Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testMovimientos();
