import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  Network,
  GitBranch,
  Building2,
  Building,
  Home,
  ChevronRight
} from 'lucide-react';
import Establecimientos from './Establecimientos';
import Redes from '../Redes/Redes';
import Microredes from '../Microredes/Microredes';
import CentrosAcopio from '../CentrosAcopio/CentrosAcopio';
import { useAppNavigation, useCurrentRoute, useUrlState } from '../../hooks/useRouting';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`establecimientos-tabpanel-${index}`}
      aria-labelledby={`establecimientos-tab-${index}`}
      {...other}
    >
      {value === index && (
        <div className="py-6">
          {children}
        </div>
      )}
    </div>
  );
}

const EstablecimientosModule: React.FC = () => {
  const { navigateToModule } = useAppNavigation();
  const { currentSubModule, searchParams } = useCurrentRoute();

  // Estado de navegación sincronizado con URL
  const [navigationState, setNavigationState] = useState({
    selectedRedId: '',
    selectedRedNombre: '',
    selectedMicroredId: '',
    selectedMicroredNombre: '',
    selectedCentroAcopioId: '',
    selectedCentroAcopioNombre: ''
  });

  // Sincronizar estado con parámetros de URL
  useEffect(() => {
    const redId = searchParams.get('redId') || '';
    const redNombre = searchParams.get('redNombre') || '';
    const microredId = searchParams.get('microredId') || '';
    const microredNombre = searchParams.get('microredNombre') || '';
    const centroAcopioId = searchParams.get('centroAcopioId') || '';
    const centroAcopioNombre = searchParams.get('centroAcopioNombre') || '';

    setNavigationState({
      selectedRedId: redId,
      selectedRedNombre: redNombre,
      selectedMicroredId: microredId,
      selectedMicroredNombre: microredNombre,
      selectedCentroAcopioId: centroAcopioId,
      selectedCentroAcopioNombre: centroAcopioNombre
    });
  }, [searchParams]);

  // Navigation handlers
  const handleNavigateToMicroredes = (redId: string, redNombre: string) => {
    const params = {
      redId,
      redNombre
    };
    navigateToModule('establecimientos', 'microredes', params);
  };

  const handleNavigateToCentrosAcopio = (microredId: string, microredNombre: string) => {
    const params = {
      redId: navigationState.selectedRedId,
      redNombre: navigationState.selectedRedNombre,
      microredId,
      microredNombre
    };
    navigateToModule('establecimientos', 'centros-acopio', params);
  };

  const handleNavigateToEstablecimientos = (centroAcopioId: string, centroAcopioNombre: string) => {
    const params = {
      redId: navigationState.selectedRedId,
      redNombre: navigationState.selectedRedNombre,
      microredId: navigationState.selectedMicroredId,
      microredNombre: navigationState.selectedMicroredNombre,
      centroAcopioId,
      centroAcopioNombre
    };
    navigateToModule('establecimientos', 'establecimientos', params);
  };

  const tabs = [
    {
      id: 'redes',
      label: 'Redes',
      icon: <Network className="w-5 h-5" />,
      description: 'Gestión de redes de salud',
      path: '/establecimientos/redes'
    },
    {
      id: 'microredes',
      label: 'Microredes',
      icon: <GitBranch className="w-5 h-5" />,
      description: 'Gestión de microredes',
      path: '/establecimientos/microredes'
    },
    {
      id: 'centros-acopio',
      label: 'Centros de Acopio',
      icon: <Building2 className="w-5 h-5" />,
      description: 'Gestión de centros de acopio',
      path: '/establecimientos/centros-acopio'
    },
    {
      id: 'establecimientos',
      label: 'Establecimientos',
      icon: <Building className="w-5 h-5" />,
      description: 'Gestión de establecimientos de salud',
      path: '/establecimientos/establecimientos'
    }
  ];

  const getCurrentBreadcrumb = () => {
    // Encontrar el tab actual basado en currentSubModule
    const currentTabData = tabs.find(tab => tab.id === currentSubModule) || tabs[0];
    const breadcrumbItems = [];

    // Always start with the module home
    breadcrumbItems.push(
      <li key="home" className="inline-flex items-center">
        <button
          onClick={() => {
            navigateToModule('establecimientos', 'redes');
            setNavigationState({
              selectedRedId: '',
              selectedRedNombre: '',
              selectedMicroredId: '',
              selectedMicroredNombre: '',
              selectedCentroAcopioId: '',
              selectedCentroAcopioNombre: ''
            });
          }}
          className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
        >
          <Home className="w-4 h-4 mr-2" />
          Establecimientos
        </button>
      </li>
    );

    // Add current tab
    breadcrumbItems.push(
      <li key="current">
        <div className="flex items-center">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 flex items-center">
            {React.cloneElement(currentTabData.icon, { className: 'w-4 h-4 mr-2' })}
            {currentTabData.label}
          </span>
        </div>
      </li>
    );

    // Add navigation context if available
    const currentTabIndex = tabs.findIndex(tab => tab.id === currentSubModule);

    if (navigationState.selectedRedNombre && currentTabIndex >= 1) {
      breadcrumbItems.splice(-1, 0,
        <li key="red">
          <div className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => navigateToModule('establecimientos', 'redes')}
              className="ml-1 text-sm font-medium text-blue-600 hover:text-blue-800 md:ml-2"
            >
              Red: {navigationState.selectedRedNombre}
            </button>
          </div>
        </li>
      );
    }

    if (navigationState.selectedMicroredNombre && currentTabIndex >= 2) {
      breadcrumbItems.splice(-1, 0,
        <li key="microred">
          <div className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => navigateToModule('establecimientos', 'microredes')}
              className="ml-1 text-sm font-medium text-blue-600 hover:text-blue-800 md:ml-2"
            >
              Microred: {navigationState.selectedMicroredNombre}
            </button>
          </div>
        </li>
      );
    }

    if (navigationState.selectedCentroAcopioNombre && currentTabIndex >= 3) {
      breadcrumbItems.splice(-1, 0,
        <li key="centro">
          <div className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => navigateToModule('establecimientos', 'centros-acopio')}
              className="ml-1 text-sm font-medium text-blue-600 hover:text-blue-800 md:ml-2"
            >
              Centro: {navigationState.selectedCentroAcopioNombre}
            </button>
          </div>
        </li>
      );
    }

    return (
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          {breadcrumbItems}
        </ol>
      </nav>
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Módulo de Establecimientos
        </h1>
        <p className="text-gray-600 mb-4">
          Gestión integral de la estructura jerárquica de salud: redes, microredes, centros de acopio y establecimientos.
        </p>

        {/* Breadcrumbs */}
        {getCurrentBreadcrumb()}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = currentSubModule === tab.id || (!currentSubModule && tab.id === 'redes');
              return (
                <button
                  key={tab.id}
                  onClick={() => navigateToModule('establecimientos', tab.id)}
                  className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex flex-col items-center">
                    <div className="mb-2">
                      {React.cloneElement(tab.icon, {
                        className: `w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-400'}`
                      })}
                    </div>
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Routes Content */}
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

      {/* Information Panel */}
      <div className="bg-gray-50 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Información del Módulo
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <Network className="w-4 h-4 mr-2" />
            Redes de Salud
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
            <GitBranch className="w-4 h-4 mr-2" />
            Microredes
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            <Building2 className="w-4 h-4 mr-2" />
            Centros de Acopio
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
            <Building className="w-4 h-4 mr-2" />
            Establecimientos
          </span>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Estructura Jerárquica:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Redes:</strong> Organizan los servicios de salud a nivel regional</li>
            <li><strong>Microredes:</strong> Agrupan establecimientos por proximidad geográfica</li>
            <li><strong>Centros de Acopio:</strong> Puntos estratégicos para distribución de insumos</li>
            <li><strong>Establecimientos:</strong> Centros de salud, puestos de salud y hospitales</li>
          </ul>
          <p className="mt-4">
            <strong>Flujo de Trabajo:</strong> Cree primero las redes, luego las microredes, después los centros de acopio y finalmente los establecimientos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EstablecimientosModule;
