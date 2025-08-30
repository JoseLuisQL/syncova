import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  Network,
  GitBranch,
  Building2,
  Building,
  Home,
  ChevronRight,
  Plus,
  FolderOpen,
  Settings
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

// Configuración de secciones organizadas jerárquicamente
interface SectionConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  category: 'estructura' | 'gestion';
  description?: string;
}

const ESTABLISHMENT_SECTIONS: SectionConfig[] = [
  // Sección Estructura
  { 
    id: 'redes', 
    label: 'Redes', 
    icon: Network, 
    path: '/establecimientos/redes', 
    category: 'estructura',
    description: 'Redes de salud'
  },
  { 
    id: 'microredes', 
    label: 'Microredes', 
    icon: GitBranch, 
    path: '/establecimientos/microredes', 
    category: 'estructura',
    description: 'Agrupaciones territoriales'
  },
  
  // Sección Gestión
  { 
    id: 'centros-acopio', 
    label: 'Centros de Acopio', 
    icon: Building2, 
    path: '/establecimientos/centros-acopio', 
    category: 'gestion',
    description: 'Puntos de distribución'
  },
  { 
    id: 'establecimientos', 
    label: 'Establecimientos', 
    icon: Building, 
    path: '/establecimientos/establecimientos', 
    category: 'gestion',
    description: 'Centros de atención'
  }
];

const CATEGORY_CONFIG = {
  estructura: { label: 'Estructura Organizacional', icon: FolderOpen, color: 'blue' },
  gestion: { label: 'Gestión Operativa', icon: Settings, color: 'emerald' }
};

  // Agrupar secciones por categoría
  const sectionsByCategory = ESTABLISHMENT_SECTIONS.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, SectionConfig[]>);

  const getCurrentBreadcrumb = () => {
    // Encontrar el tab actual basado en currentSubModule
    const currentTabData = ESTABLISHMENT_SECTIONS.find(tab => tab.id === currentSubModule) || ESTABLISHMENT_SECTIONS[0];
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
            <currentTabData.icon className="w-4 h-4 mr-2" />
            {currentTabData.label}
          </span>
        </div>
      </li>
    );

    // Add navigation context if available
    const currentTabIndex = ESTABLISHMENT_SECTIONS.findIndex(tab => tab.id === currentSubModule);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Premium */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Establecimientos</h1>
                <p className="text-gray-600">Gestión integral de la estructura de salud</p>
              </div>
            </div>
            {/* Breadcrumbs */}
            <div className="hidden md:block">
              {getCurrentBreadcrumb()}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Premium */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6">
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(sectionsByCategory).map(([categoryKey, sections]) => {
              const category = CATEGORY_CONFIG[categoryKey as keyof typeof CATEGORY_CONFIG];
              const CategoryIcon = category.icon;
              
              return (
                <div key={categoryKey} className="relative group">
                  {/* Category Header */}
                  <div className={`flex items-center justify-center py-4 border-b-4 border-${category.color}-500 bg-${category.color}-50`}>
                    <CategoryIcon className={`h-5 w-5 text-${category.color}-600 mr-2`} />
                    <span className={`font-semibold text-${category.color}-800`}>{category.label}</span>
                  </div>
                  
                  {/* Section Buttons */}
                  <div className="bg-white">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      const isActive = currentSubModule === section.id || (!currentSubModule && section.id === 'redes');
                      
                      return (
                        <button
                          key={section.id}
                          onClick={() => navigateToModule('establecimientos', section.id)}
                          className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            isActive ? `bg-${category.color}-50 border-l-4 border-l-${category.color}-500` : ''
                          }`}
                        >
                          <Icon className={`h-4 w-4 mr-3 ${isActive ? `text-${category.color}-600` : 'text-gray-500'}`} />
                          <div className="flex-1">
                            <div className={`font-medium text-sm ${isActive ? `text-${category.color}-800` : 'text-gray-900'}`}>
                              {section.label}
                            </div>
                            <div className="text-xs text-gray-500">{section.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area Premium */}
      <div className="max-w-full px-6 py-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
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
    </div>
  );
};

export default EstablecimientosModule;
