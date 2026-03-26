import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CentrosAcopio from '../CentrosAcopio/CentrosAcopio';
import Microredes from '../Microredes/Microredes';
import Redes from '../Redes/Redes';
import { usePermissions } from '../../hooks/usePermissions';
import { useAppNavigation, useCurrentRoute } from '../../hooks/useRouting';
import Establecimientos from './Establecimientos';
import { SECTIONS_CONFIG, SectionConfig } from './constants';
import { EstablishmentsShell } from './components';

const EstablecimientosModule: React.FC = () => {
  const { navigateToModule } = useAppNavigation();
  const { currentSubModule, searchParams } = useCurrentRoute();
  const { canAccessSection } = usePermissions();

  const filteredSections = useMemo(
    () => SECTIONS_CONFIG.filter((section) => canAccessSection('establecimientos', section.id)) as SectionConfig[],
    [canAccessSection],
  );

  const [navigationState, setNavigationState] = useState({
    selectedRedId: '',
    selectedRedNombre: '',
    selectedMicroredId: '',
    selectedMicroredNombre: '',
    selectedCentroAcopioId: '',
    selectedCentroAcopioNombre: '',
  });

  useEffect(() => {
    setNavigationState({
      selectedRedId: searchParams.get('redId') || '',
      selectedRedNombre: searchParams.get('redNombre') || '',
      selectedMicroredId: searchParams.get('microredId') || '',
      selectedMicroredNombre: searchParams.get('microredNombre') || '',
      selectedCentroAcopioId: searchParams.get('centroAcopioId') || '',
      selectedCentroAcopioNombre: searchParams.get('centroAcopioNombre') || '',
    });
  }, [searchParams]);

  const handleNavigateToMicroredes = useCallback((redId: string, redNombre: string) => {
    navigateToModule('establecimientos', 'microredes', { redId, redNombre });
  }, [navigateToModule]);

  const handleNavigateToCentrosAcopio = useCallback((microredId: string, microredNombre: string) => {
    navigateToModule('establecimientos', 'centros-acopio', {
      redId: navigationState.selectedRedId,
      redNombre: navigationState.selectedRedNombre,
      microredId,
      microredNombre,
    });
  }, [navigateToModule, navigationState.selectedRedId, navigationState.selectedRedNombre]);

  const handleNavigateToEstablecimientos = useCallback((centroAcopioId: string, centroAcopioNombre: string) => {
    navigateToModule('establecimientos', 'establecimientos', {
      redId: navigationState.selectedRedId,
      redNombre: navigationState.selectedRedNombre,
      microredId: navigationState.selectedMicroredId,
      microredNombre: navigationState.selectedMicroredNombre,
      centroAcopioId,
      centroAcopioNombre,
    });
  }, [navigateToModule, navigationState]);

  const firstSection = filteredSections[0]?.id || 'redes';
  const activeSection = (currentSubModule as SectionConfig['id'] | null) || firstSection;

  return (
    <EstablishmentsShell activeSection={activeSection} sections={filteredSections}>
      <Routes>
        <Route path="/" element={<Navigate to={firstSection} replace />} />
        <Route path="redes" element={<Redes onNavigateToMicroredes={handleNavigateToMicroredes} />} />
        <Route
          path="microredes"
          element={
            <Microredes
              selectedRedId={navigationState.selectedRedId}
              selectedRedNombre={navigationState.selectedRedNombre}
              onNavigateToCentrosAcopio={handleNavigateToCentrosAcopio}
            />
          }
        />
        <Route
          path="centros-acopio"
          element={
            <CentrosAcopio
              selectedRedId={navigationState.selectedRedId}
              selectedRedNombre={navigationState.selectedRedNombre}
              selectedMicroredId={navigationState.selectedMicroredId}
              selectedMicroredNombre={navigationState.selectedMicroredNombre}
              onNavigateToEstablecimientos={handleNavigateToEstablecimientos}
            />
          }
        />
        <Route
          path="establecimientos"
          element={
            <Establecimientos
              selectedRedId={navigationState.selectedRedId}
              selectedRedNombre={navigationState.selectedRedNombre}
              selectedMicroredId={navigationState.selectedMicroredId}
              selectedMicroredNombre={navigationState.selectedMicroredNombre}
              selectedCentroAcopioId={navigationState.selectedCentroAcopioId}
              selectedCentroAcopioNombre={navigationState.selectedCentroAcopioNombre}
            />
          }
        />
      </Routes>
    </EstablishmentsShell>
  );
};

export default EstablecimientosModule;
 