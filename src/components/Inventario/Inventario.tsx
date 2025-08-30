import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Plus, Package, Syringe, FileText, Settings, FolderOpen, Archive } from 'lucide-react';
import NuevoIngreso from './NuevoIngreso';
import LotesVacunasPage from './LotesVacunasPage';
import LotesJeringasPage from './LotesJeringasPage';
import GestionVacunas from './GestionVacunas';
import GestionJeringas from './GestionJeringas';
import ConfiguracionJeringas from './ConfiguracionJeringas';
import { useVacunas } from '../../hooks/useVacunas';
import { useJeringas } from '../../hooks/useJeringas';
import { useAppNavigation, useCurrentRoute } from '../../hooks/useRouting';

// Configuración de secciones organizadas jerárquicamente
interface SectionConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  category: 'catalogos' | 'lotes' | 'gestion' | 'configuracion';
  description?: string;
}

const INVENTORY_SECTIONS: SectionConfig[] = [
  // Sección Catálogos
  { 
    id: 'vacunas', 
    label: 'Vacunas', 
    icon: Package, 
    path: '/inventario/vacunas', 
    category: 'catalogos'
  },
  { 
    id: 'jeringas', 
    label: 'Jeringas', 
    icon: Syringe, 
    path: '/inventario/jeringas', 
    category: 'catalogos'
  },
  
  // Sección Lotes
  { 
    id: 'lotes-vacunas', 
    label: 'Vacunas', 
    icon: Archive, 
    path: '/inventario/lotes-vacunas', 
    category: 'lotes'
  },
  { 
    id: 'lotes-jeringas', 
    label: 'Jeringas', 
    icon: Archive, 
    path: '/inventario/lotes-jeringas', 
    category: 'lotes'
  },
  
  // Sección Gestión
  { 
    id: 'recepcion', 
    label: 'Nuevo Ingreso', 
    icon: Plus, 
    path: '/inventario/recepcion', 
    category: 'gestion'
  },
  
  // Sección Configuración
  { 
    id: 'configuracion-jeringas', 
    label: 'Configuración', 
    icon: Settings, 
    path: '/inventario/configuracion-jeringas', 
    category: 'configuracion'
  }
];

const CATEGORY_CONFIG = {
  catalogos: { label: 'Catálogos', icon: FolderOpen, color: 'blue' },
  lotes: { label: 'Lotes', icon: Archive, color: 'emerald' },
  gestion: { label: 'Gestión', icon: FileText, color: 'purple' },
  configuracion: { label: 'Configuración', icon: Settings, color: 'amber' }
};

const Inventario: React.FC = () => {
  const { navigateToModule } = useAppNavigation();
  const { currentSubModule } = useCurrentRoute();
  const [showNuevoIngreso, setShowNuevoIngreso] = useState(false);

  // Hooks para cargar datos necesarios para el modal
  const { vacunasActivas, loadVacunasActivas, isLoadingActivas: isLoadingVacunas } = useVacunas();
  const { jeringasActivas, loadJeringasActivas, isLoadingActivas: isLoadingJeringas } = useJeringas();

  // Cargar datos cuando se abre el modal de nuevo ingreso
  React.useEffect(() => {
    if (showNuevoIngreso) {
      console.log('🔄 Modal de Nuevo Ingreso abierto, cargando datos...');
      loadVacunasActivas();
      loadJeringasActivas();
    }
  }, [showNuevoIngreso, loadVacunasActivas, loadJeringasActivas]);

  // Agrupar secciones por categoría
  const sectionsByCategory = INVENTORY_SECTIONS.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, SectionConfig[]>);

  // Los handlers ahora son manejados por las páginas individuales
  const handleNuevoIngresoSuccess = (tipo: 'vacuna' | 'jeringa', data: any) => {
    console.log('Nuevo ingreso exitoso:', tipo, data);
  };

  // Obtener la sección activa
  const getActiveSection = () => {
    return INVENTORY_SECTIONS.find(section => section.id === currentSubModule) || INVENTORY_SECTIONS[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Premium */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
              </div>
            </div>
            <button 
              onClick={() => setShowNuevoIngreso(true)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Ingreso
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Premium */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6">
          <div className="grid grid-cols-4 gap-1">
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
                      const isActive = currentSubModule === section.id || (!currentSubModule && section.id === 'vacunas');
                      
                      return (
                        <button
                          key={section.id}
                          onClick={() => navigateToModule('inventario', section.id)}
                          className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            isActive ? `bg-${category.color}-50 border-l-4 border-l-${category.color}-500` : ''
                          }`}
                        >
                          <Icon className={`h-4 w-4 mr-3 ${isActive ? `text-${category.color}-600` : 'text-gray-500'}`} />
                          <div className="flex-1">
                            <div className={`font-medium text-sm ${isActive ? `text-${category.color}-800` : 'text-gray-900'}`}>
                              {section.label}
                            </div>
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
            <Route path="/" element={<Navigate to="vacunas" replace />} />
            <Route path="vacunas" element={<GestionVacunas />} />
            <Route path="jeringas" element={<GestionJeringas />} />
            <Route path="lotes-vacunas" element={<LotesVacunasPage />} />
            <Route path="lotes-jeringas" element={<LotesJeringasPage />} />
            <Route path="configuracion-jeringas" element={<ConfiguracionJeringas />} />
            <Route path="recepcion" element={<RecepcionTab onNuevoIngreso={() => setShowNuevoIngreso(true)} />} />
          </Routes>
        </div>
      </div>

      {/* Modal de Nuevo Ingreso */}
      {showNuevoIngreso && (
        <NuevoIngreso
          onClose={() => setShowNuevoIngreso(false)}
          onSuccess={handleNuevoIngresoSuccess}
          vacunas={vacunasActivas}
          jeringas={jeringasActivas}
          isLoadingVacunas={isLoadingVacunas}
          isLoadingJeringas={isLoadingJeringas}
        />
      )}
    </div>
  );
};

// Recepción Tab Premium
interface RecepcionTabProps {
  onNuevoIngreso: () => void;
}

const RecepcionTab: React.FC<RecepcionTabProps> = ({ onNuevoIngreso }) => {
  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icono Principal */}
        <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-6 rounded-2xl inline-block mb-6">
          <Plus className="h-16 w-16 text-purple-600" />
        </div>
        
        {/* Título y Botón Principal */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Ingreso</h2>
        
        <button 
          onClick={onNuevoIngreso}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg font-semibold"
        >
          <Plus className="h-5 w-5 mr-3" />
          Registrar Nuevo Ingreso
        </button>
      </div>
    </div>
  );
};

export default Inventario;