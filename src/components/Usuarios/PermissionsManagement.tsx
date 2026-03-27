import React from 'react';
import { Key } from '@phosphor-icons/react';

const PermissionsManagement: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
        <Key className="h-8 w-8 text-zinc-400" />
      </div>
      <p className="mt-4 text-base font-medium text-zinc-900">Permisos del sistema</p>
      <p className="mt-1 max-w-md text-center text-sm text-zinc-500">
        Los permisos son gestionados automáticamente por el sistema.
      </p>
    </div>
  );
};

export default PermissionsManagement;