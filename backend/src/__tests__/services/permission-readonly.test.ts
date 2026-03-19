import { PermissionService } from '@/services/PermissionService';

describe('PermissionService readonly catalog', () => {
  it('bloquea creación de permisos', async () => {
    const result = await PermissionService.create({
      nombre: 'Temporal',
      codigo: 'temporal:read',
      recurso: 'temporal',
      accion: 'read',
      categoria: 'Temporal',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('solo lectura');
  });

  it('bloquea actualización y cambio de estado del catálogo', async () => {
    const updateResult = await PermissionService.update('permission-1', { nombre: 'Nuevo nombre' });
    const stateResult = await PermissionService.changeEstado('permission-1', 'inactivo');

    expect(updateResult.success).toBe(false);
    expect(stateResult.success).toBe(false);
    expect(updateResult.error).toContain('solo lectura');
    expect(stateResult.error).toContain('solo lectura');
  });
});
