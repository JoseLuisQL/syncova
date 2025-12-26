import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Building2, Home, ChevronRight } from 'lucide-react';
import Establecimientos from './Establecimientos';
import Redes from '../Redes/Redes';
import Microredes from '../Microredes/Microredes';
import CentrosAcopio from '../CentrosAcopio/CentrosAcopio';
import { useAppNavigation, useCurrentRoute } from '../../hooks/useRouting';
import { SECTIONS_CONFIG, COMPONENT_STYLES } from './constants';

const EstablecimientosModule: React.FC = () => {
  const { navigateToModule } = useAppNavigation();
  const { currentSubModule, searchParams } = useCurrentRoute();
  const location = useLocation();

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

  const handleResetNavigation = useCallback(() => {
    navigateToModule('establecimientos', 'redes');
    setNavigationState({
      selectedRedId: '',
      selectedRedNombre: '',
      selectedMicroredId: '',
      selectedMicroredNombre: '',
      selectedCentroAcopioId: '',
      selectedCentroAcopioNombre: '',
    });
  }, [navigateToModule]);

  const activeSection = useMemo(() => 
    currentSubModule || 'redes',
  [currentSubModule]);

  const breadcrumbs = useMemo(() => {
    const items: Array<{ key: string; label: string; icon?: React.ComponentType<{ className?: string }>; onClick?: () => void }> = [
      { key: 'home', label: 'Establecimientos', icon: Home, onClick: handleResetNavigation },
    ];

    const currentSection = SECTIONS_CONFIG.find(s => s.id === activeSection);
    if (currentSection) {
      items.push({
        key: 'current',
        label: currentSection.label,
        icon: currentSection.icon,
      });
    }

    const sectionIndex = SECTIONS_CONFIG.findIndex(s => s.id === activeSection);

    if (navigationState.selectedRedNombre && sectionIndex >= 1) {
      items.splice(-1, 0, {
        key: 'red',
        label: `Red: ${navigationState.selectedRedNombre}`,
        onClick: () => navigateToModule('establecimientos', 'microredes', {
          redId: navigationState.selectedRedId,
          redNombre: navigationState.selectedRedNombre,
        }),
      });
    }

    if (navigationState.selectedMicroredNombre && sectionIndex >= 2) {
      items.splice(-1, 0, {
        key: 'microred',
        label: `Microred: ${navigationState.selectedMicroredNombre}`,
        onClick: () => navigateToModule('establecimientos', 'centros-acopio', {
          redId: navigationState.selectedRedId,
          redNombre: navigationState.selectedRedNombre,
          microredId: navigationState.selectedMicroredId,
          microredNombre: navigationState.selectedMicroredNombre,
        }),
      });
    }

    if (navigationState.selectedCentroAcopioNombre && sectionIndex >= 3) {
      items.splice(-1, 0, {
        key: 'centro',
        label: `Centro: ${navigationState.selectedCentroAcopioNombre}`,
      });
    }

    return items;
  }, [activeSection, navigationState, navigateToModule, handleResetNavigation]);

  return (
    <main className={COMPONENT_STYLES.pageBackground}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 shadow-lg">
                <Building2 className="h-7 w-7 text-white" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Gestion de Establecimientos
                </h1>
                <p className="text-sm text-gray-600 hidden sm:block">
                  Estructura organizacional del sistema de salud
                </p>
              </div>
            </div>

            {/* Breadcrumbs - Desktop */}
            <nav aria-label="Breadcrumb" className="hidden lg:block">
              <ol className="flex items-center gap-1">
                {breadcrumbs.map((item, index) => {
                  const Icon = item.icon;
                  const isLast = index === breadcrumbs.length - 1;

                  return (
                    <li key={item.key} className="flex items-center">
                      {index > 0 && (
                        <ChevronRight className="h-4 w-4 text-gray-400 mx-1" aria-hidden="true" />
                      )}
                      {item.onClick && !isLast ? (
                        <button
                          onClick={item.onClick}
                          className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium"
                        >
                          {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                          <span className="max-w-[120px] truncate">{item.label}</span>
                        </button>
                      ) : (
                        <span className={`flex items-center gap-1.5 text-sm ${isLast ? 'text-gray-500 font-normal' : 'text-gray-900 font-medium'}`}>
                          {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                          <span className="max-w-[120px] truncate">{item.label}</span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-100 sticky top-[73px] z-10" aria-label="Secciones">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {SECTIONS_CONFIG.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => navigateToModule('establecimientos', section.id)}
                  className={`${COMPONENT_STYLES.nav.tab} ${
                    isActive ? COMPONENT_STYLES.nav.tabActive : COMPONENT_STYLES.nav.tabInactive
                  } flex-shrink-0`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="whitespace-nowrap">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="redes" replace />} />
            <Route
              path="redes"
              element={<Redes onNavigateToMicroredes={handleNavigateToMicroredes} />}
            />
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
                  selectedCentroAcopioId={navigationState.selectedCentroAcopioId}
                  selectedCentroAcopioNombre={navigationState.selectedCentroAcopioNombre}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </main>
  );
};

export default EstablecimientosModule;
