import { PrismaClient } from '@prisma/client';
import { DEFAULT_ROLE_PERMISSIONS } from '../src/config/defaultRolePermissions';

const prisma = new PrismaClient();

async function main() {
  const permissions = await prisma.permission.findMany({
    where: { estado: 'activo' },
    select: { id: true, codigo: true },
  });

  const permissionMap = new Map(permissions.map((permission) => [permission.codigo, permission.id]));
  const allPermissionIds = permissions.map((permission) => permission.id);

  for (const [roleCodigo, permissionCodes] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    const role = await prisma.role.findUnique({
      where: { codigo: roleCodigo },
      select: { id: true },
    });

    if (!role) {
      console.warn(`Rol no encontrado: ${roleCodigo}`);
      continue;
    }

    const permissionIds = permissionCodes.includes('*')
      ? allPermissionIds
      : permissionCodes
          .map((codigo) => permissionMap.get(codigo))
          .filter((value): value is string => Boolean(value));

    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: { roleId: role.id },
      });

      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId: role.id,
            permissionId,
          })),
        });
      }
    });

    console.log(`Sincronizado ${roleCodigo}: ${permissionIds.length} permisos`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
