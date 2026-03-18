import React, { useMemo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import GestionJeringas from './GestionJeringas';
import GestionVacunas from './GestionVacunas';
import LotesVacunasPage from './LotesVacunasPage';
import LotesJeringasPage from './LotesJeringasPage';
import ConfiguracionJeringas from './ConfiguracionJeringas';
import { InventoryShell } from './components';
import { INVENTORY_SECTIONS } from './constants';
import { usePermissions } from '../../hooks/usePermissions';
import { useCurrentRoute } from '../../hooks/useRouting';

const Inventario: React.FC = () => {
  const { currentSubModule } = useCurrentRoute();
  const { canAccessSection } = usePermissions();

  const allowedSections = useMemo(
    () => INVENTORY_SECTIONS.filter((section) => canAccessSection('inventario', section.id)),
    [canAccessSection],
  );

  const firstSection = allowedSections[0]?.id || 'vacunas';
  const activeSection = (currentSubModule as typeof INVENTORY_SECTIONS[number]['id'] | null) || firstSection;

  return (
    <InventoryShell activeSection={activeSection}>
      <Routes>
        <Route path="/" element={<Navigate to={firstSection} replace />} />
        <Route path="vacunas" element={<GestionVacunas />} />
        <Route path="jeringas" element={<GestionJeringas />} />
        <Route path="lotes-vacunas" element={<LotesVacunasPage />} />
        <Route path="lotes-jeringas" element={<LotesJeringasPage />} />
        <Route path="configuracion-jeringas" element={<ConfiguracionJeringas />} />
      </Routes>
    </InventoryShell>
  );
};

export default Inventario;
