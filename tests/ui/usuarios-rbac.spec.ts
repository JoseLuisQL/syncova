import { expect, test, type APIRequestContext } from '@playwright/test';

const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || 'http://192.168.18.20:3001/api';
const adminCredentials = {
  usuario: 'admin',
  password: 'Admin123@',
};
const responsableFixture = {
  nombres: 'QA',
  apellidos: 'Responsable Acopio',
  email: 'qa.resp.acopio@saludapurimac.gob.pe',
  usuario: 'qa_resp_acopio',
  password: 'RespAcopio123!',
  rol: 'responsable_acopio',
};

interface ApiUserSummary {
  id: string;
  usuario: string;
}

async function loginByApi(request: APIRequestContext, credentials: { usuario: string; password: string }) {
  const response = await request.post(`${apiBaseUrl}/auth/login`, {
    data: credentials,
  });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.success).toBeTruthy();
  return body.data.token as string;
}

async function ensureResponsableFixture(request: APIRequestContext) {
  const adminToken = await loginByApi(request, adminCredentials);

  const centrosResponse = await request.get(`${apiBaseUrl}/centros-acopio?estado=activo&limit=1`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const centrosBody = await centrosResponse.json();
  const centro = centrosBody.data?.[0];
  expect(centro?.id).toBeTruthy();

  const usuariosResponse = await request.get(`${apiBaseUrl}/usuarios?search=${responsableFixture.usuario}&limit=10`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const usuariosBody = await usuariosResponse.json();
  const existente = ((usuariosBody.data || []) as ApiUserSummary[]).find(
    (usuario) => usuario.usuario === responsableFixture.usuario,
  );

  if (!existente) {
    const createResponse = await request.post(`${apiBaseUrl}/usuarios`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        ...responsableFixture,
        centroAcopioId: centro.id,
      },
    });
    expect(createResponse.ok()).toBeTruthy();
    return;
  }

  const updateResponse = await request.put(`${apiBaseUrl}/usuarios/${existente.id}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: {
      nombres: responsableFixture.nombres,
      apellidos: responsableFixture.apellidos,
      email: responsableFixture.email,
      usuario: responsableFixture.usuario,
      rol: responsableFixture.rol,
      centroAcopioId: centro.id,
      estado: 'activo',
    },
  });

  expect(updateResponse.ok()).toBeTruthy();
}

test.beforeAll(async ({ request }) => {
  await ensureResponsableFixture(request);
});

test('admin ve el módulo de usuarios rediseñado y los roles por defecto quedan protegidos', async ({ page }, testInfo) => {
  await page.goto('/usuarios');
  await page.getByLabel('Usuario o Email *').fill(adminCredentials.usuario);
  await page.getByLabel('Contraseña *').fill(adminCredentials.password);
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  await expect(page).toHaveURL(/\/usuarios\/usuarios$/);
  await expect(page.getByRole('heading', { name: 'Usuarios', exact: true })).toBeVisible();
  await expect(page.getByText('Cuentas y auditoría operativa')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Nuevo usuario' })).toBeVisible();

  await page.goto('/usuarios/roles');
  await expect(page.locator('tbody').getByText('Sistema', { exact: true }).first()).toBeVisible();
  await expect(page.getByTitle('Rol protegido del sistema').first()).toBeDisabled();

  await page.screenshot({ path: testInfo.outputPath('usuarios-admin.png'), fullPage: true });
});

test('responsable_acopio queda restringido a dashboard, movimientos y planificación en modo solo lectura', async ({ page }, testInfo) => {
  await page.goto('/dashboard');
  await page.getByLabel('Usuario o Email *').fill(responsableFixture.usuario);
  await page.getByLabel('Contraseña *').fill(responsableFixture.password);
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  const sidebar = page.getByRole('navigation', { name: 'Menu principal' });
  await expect(sidebar.getByRole('button', { name: 'Dashboard', exact: true })).toBeVisible();
  await expect(sidebar.getByRole('button', { name: 'Movimientos', exact: true })).toBeVisible();
  await expect(sidebar.getByRole('button', { name: 'Planificación', exact: true })).toBeVisible();
  await expect(sidebar.getByRole('button', { name: 'Usuarios', exact: true })).toHaveCount(0);
  await expect(sidebar.getByRole('button', { name: 'Inventario', exact: true })).toHaveCount(0);

  await page.goto('/movimientos');
  await expect(page.getByText('Vista restringida para responsable de acopio')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Vales' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Exportar' })).toHaveCount(0);
  await expect(page.locator('input[type="number"]')).toHaveCount(0);

  await page.goto('/planificacion');
  await expect(page.getByText('modo solo lectura')).toBeVisible();
  await expect(page.getByText('Guardar Programación')).toHaveCount(0);
  await expect(page.getByText('Sincronizar')).toHaveCount(0);

  await page.goto('/usuarios/usuarios');
  await expect(page.getByText('Acceso Denegado')).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath('responsable-acopio.png'), fullPage: true });
});
