import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useCurrentRoute } from '../../hooks/useRouting';
import Usuarios from './Usuarios';
import RolesManagement from './RolesManagement';
import PermissionsManagement from './PermissionsManagement';
import { SectionId, USER_SECTIONS } from './constants';
import UsersShell from './components/UsersShell';

const UsuariosModule: React.FC = () => {
  const { currentSubModule } = useCurrentRoute();
  const activeSection = (currentSubModule as SectionId | null) || 'usuarios';
  const firstSection = USER_SECTIONS[0]?.id || 'usuarios';

  return (
    <UsersShell activeSection={activeSection}>
      <Routes>
        <Route path="/" element={<Navigate to={firstSection} replace />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="roles" element={<RolesManagement />} />
        <Route path="permisos" element={<PermissionsManagement />} />
      </Routes>
    </UsersShell>
  );
};

export default UsuariosModule;
   