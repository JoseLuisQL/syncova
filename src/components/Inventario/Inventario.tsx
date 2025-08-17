import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Plus, Search, Package, Syringe, AlertTriangle, CheckCircle, Clock, FileText, Settings, Edit, Trash2, Link } from 'lucide-react';
import { Vacuna, Lote, Jeringa, LoteJeringa } from '../../types';
import NuevoIngreso from './NuevoIngreso';
import LotesVacunasPage from './LotesVacunasPage';
import LotesJeringasPage from './LotesJeringasPage';
import GestionVacunas from './GestionVacunas';
import GestionJeringas from './GestionJeringas';
import ConfiguracionJeringas from './ConfiguracionJeringas';
import { useVacunas } from '../../hooks/useVacunas';
import { useJeringas } from '../../hooks/useJeringas';
import { useAppNavigation, useCurrentRoute } from '../../hooks/useRouting';

// Utility functions moved outside component scope
const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'disponible': return 'bg-green-100 text-green-800';
    case 'vencido': return 'bg-red-100 text-red-800';
    case 'agotado': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getEstadoIcon = (estado: string) => {
  switch (estado) {
    case 'disponible': return CheckCircle;
    case 'vencido': return AlertTriangle;
    case 'agotado': return Clock;
    default: return Clock;
  }
};

const getDaysToExpire = (fechaVencimiento: Date) => {
  const today = new Date();
  const diffTime = fechaVencimiento.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const Inventario: React.FC = () => {
  const { navigateToModule } = useAppNavigation();
  const { currentSubModule } = useCurrentRoute();
  const [searchTerm, setSearchTerm] = useState('');
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

  const tabs = [
    { id: 'vacunas', label: 'Catálogo de Vacunas', icon: Package, path: '/inventario/vacunas' },
    { id: 'jeringas', label: 'Catálogo de Jeringas', icon: Syringe, path: '/inventario/jeringas' },
    { id: 'lotes-vacunas', label: 'Lotes de Vacunas', icon: Package, path: '/inventario/lotes-vacunas' },
    { id: 'lotes-jeringas', label: 'Lotes de Jeringas', icon: Syringe, path: '/inventario/lotes-jeringas' },
    { id: 'configuracion-jeringas', label: 'Configuración Jeringas', icon: Link, path: '/inventario/configuracion-jeringas' },
    { id: 'recepcion', label: 'Nuevo Ingreso', icon: Plus, path: '/inventario/recepcion' },
  ];

  // Los handlers ahora son manejados por las páginas individuales
  const handleNuevoIngresoSuccess = (tipo: 'vacuna' | 'jeringa', data: any) => {
    // Las páginas individuales manejan la actualización de datos
    console.log('Nuevo ingreso exitoso:', tipo, data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestión de Inventario</h2>
          <p className="text-gray-600 mt-1">Control integral de vacunas, jeringas y recepción de lotes</p>
        </div>
        <button 
          onClick={() => setShowNuevoIngreso(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Ingreso
        </button>
      </div>

      {/* Stats Cards - Ahora las estadísticas se muestran en cada página individual */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sistema de Gestión de Inventario SIVAC</h3>
          <p className="text-gray-600">
            Gestione de manera integral vacunas, jeringas y sus respectivos lotes con control completo de stock y vencimientos
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentSubModule === tab.id || (!currentSubModule && tab.id === 'vacunas');
            return (
              <button
                key={tab.id}
                onClick={() => navigateToModule('inventario', tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Routes Content */}
      <Routes>
        <Route path="/" element={<Navigate to="vacunas" replace />} />
        <Route path="vacunas" element={<GestionVacunas />} />
        <Route path="jeringas" element={<GestionJeringas />} />
        <Route path="lotes-vacunas" element={<LotesVacunasPage />} />
        <Route path="lotes-jeringas" element={<LotesJeringasPage />} />
        <Route path="configuracion-jeringas" element={<ConfiguracionJeringas />} />
        <Route path="recepcion" element={<RecepcionTab onNuevoIngreso={() => setShowNuevoIngreso(true)} />} />
      </Routes>

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

// Recepción Tab
interface RecepcionTabProps {
  onNuevoIngreso: () => void;
}

const RecepcionTab: React.FC<RecepcionTabProps> = ({ onNuevoIngreso }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nuevo Ingreso de Inventario</h3>
        <p className="text-gray-600 mb-6">
          Registre la recepción de nuevos lotes de vacunas y jeringas de manera rápida y sencilla.
        </p>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={onNuevoIngreso}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="h-5 w-5 inline mr-2" />
            Nuevo Ingreso
          </button>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">✅ Proceso Simplificado:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Selección rápida de tipo (Vacuna/Jeringa)</li>
              <li>• Formulario intuitivo paso a paso</li>
              <li>• Validaciones automáticas</li>
              <li>• Generación automática de códigos</li>
              <li>• Confirmación visual de ingreso</li>
            </ul>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">🔄 Controles Automáticos:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Validación de fechas de vencimiento</li>
              <li>• Verificación de lotes duplicados</li>
              <li>• Cálculo automático de stock</li>
              <li>• Generación de alertas</li>
              <li>• Registro en historial (Kardex)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventario;