import React, { useState } from 'react';
import { Plus, Package, AlertCircle, Loader2 } from 'lucide-react';
import GestionLotes from './GestionLotes';
import NuevoIngreso from './NuevoIngreso';
import { useLotesVacunas } from '../../hooks/useLotesVacunas';
import { useVacunas } from '../../hooks/useVacunas';
import { CreateLoteVacunaDto, Lote } from '../../types';
import { useToastContext } from '../../contexts/ToastContext';

/**
 * Página principal para gestión de lotes de vacunas
 * Integra completamente con el backend
 */
const LotesVacunasPage: React.FC = () => {
  const [showNuevoIngreso, setShowNuevoIngreso] = useState(false);
  const { toast } = useToastContext();

  // Hooks para gestión de datos
  const {
    lotes,
    stats,
    isLoading,
    isLoadingStats,
    error,
    createLote,
    updateLote,
    deleteLote,
    isCreating,
    isUpdating,
    isDeleting,
    createError,
    updateError,
    deleteError,
    refresh
  } = useLotesVacunas();

  const { vacunasActivas, loadVacunasActivas, isLoadingActivas: isLoadingVacunas } = useVacunas();

  // Cargar vacunas activas al montar el componente
  React.useEffect(() => {
    loadVacunasActivas();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Recargar vacunas activas cuando se abre el modal
  React.useEffect(() => {
    if (showNuevoIngreso) {
      console.log('🔄 Modal abierto, recargando vacunas activas...');
      loadVacunasActivas();
    }
  }, [showNuevoIngreso, loadVacunasActivas]);

  /**
   * Manejar creación de nuevo lote desde NuevoIngreso
   */
  const handleNuevoLote = async (tipo: 'vacuna' | 'jeringa', data: any) => {
    if (tipo !== 'vacuna') {
      toast.error('Error: Tipo de lote incorrecto');
      return;
    }

    try {
      // Convertir el formato de NuevoIngreso al DTO del backend
      const loteData: CreateLoteVacunaDto = {
        numero: data.numero,
        vacunaId: data.vacunaId,
        fechaIngreso: data.fechaIngreso.toISOString(),
        fechaVencimiento: data.fechaVencimiento.toISOString(),
        formaIngreso: data.formaIngreso,
        comprobanteClase: data.comprobanteClase,
        numeroComprobante: data.numeroComprobante,
        cantidadInicial: data.cantidadInicial,
        cantidadActual: data.cantidadInicial, // Al crear un lote, la cantidad actual es igual a la inicial
        observaciones: data.observaciones || undefined
      };

      console.log('📤 Enviando datos al backend:', JSON.stringify(loteData, null, 2));

      const success = await createLote(loteData);

      if (success) {
        toast.success('Lote creado', 'El lote de vacuna se creó exitosamente');
        setShowNuevoIngreso(false);
      } else {
        toast.error('Error al crear', createError || 'Error al crear el lote de vacuna');
      }
    } catch (error) {
      console.error('Error al crear lote:', error);
      toast.error('Error inesperado', 'Error inesperado al crear el lote');
    }
  };

  /**
   * Manejar actualización de lote
   */
  const handleUpdateLote = async (lote: Lote) => {
    try {
      const success = await updateLote(lote.id, {
        numero: lote.numero,
        fechaIngreso: lote.fechaIngreso.toISOString(),
        fechaVencimiento: lote.fechaVencimiento.toISOString(),
        formaIngreso: lote.formaIngreso,
        comprobanteClase: lote.comprobanteClase,
        numeroComprobante: lote.numeroComprobante,
        cantidadInicial: lote.cantidadInicial,
        cantidadActual: lote.cantidadActual,
        estado: lote.estado,
        observaciones: lote.observaciones || undefined
      });

      if (success) {
        toast.success('Lote actualizado', 'El lote se actualizó exitosamente');
      } else {
        toast.error('Error al actualizar', updateError || 'Error al actualizar el lote');
      }
    } catch (error) {
      console.error('Error al actualizar lote:', error);
      toast.error('Error inesperado', 'Error inesperado al actualizar el lote');
    }
  };

  /**
   * Manejar eliminación de lote
   */
  const handleDeleteLote = async (id: string) => {
    try {
      const success = await deleteLote(id);

      if (success) {
        toast.success('Lote eliminado', 'El lote se eliminó exitosamente');
      } else {
        toast.error('Error al eliminar', deleteError || 'Error al eliminar el lote');
      }
    } catch (error) {
      console.error('Error al eliminar lote:', error);
      toast.error('Error inesperado', 'Error inesperado al eliminar el lote');
    }
  };

  /**
   * Manejar aplicación de filtros
   */
  const handleApplyFilters = async (filters: any) => {
    console.log('🔍 Aplicando filtros en LotesVacunasPage:', filters);
    await applyFilters(filters);
  };

  // Mostrar error si hay problemas de conexión
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200 px-6 py-6">
          <div className="flex items-center space-x-4">
            <div className="bg-red-600 p-3 rounded-xl shadow-lg">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lotes de Vacunas</h1>
              <p className="text-red-600 mt-1">Error al cargar los datos</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center bg-white p-8 rounded-xl border border-gray-200 shadow-lg max-w-md">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar los datos</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={refresh}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar loading inicial
  if (isLoading && lotes.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-6 py-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lotes de Vacunas</h1>
              <p className="text-blue-600 mt-1">Cargando información...</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center bg-white p-8 rounded-xl border border-gray-200 shadow-lg">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Cargando lotes de vacunas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Premium */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lotes de Vacunas</h1>
            </div>
          </div>
          <button
            onClick={() => setShowNuevoIngreso(true)}
            disabled={isCreating}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Plus className="h-5 w-5 mr-2" />
            )}
            Nuevo Lote
          </button>
        </div>
      </div>

      {/* Content Area Premium */}
      <div className="max-w-full px-6 py-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <GestionLotes
            lotes={lotes}
            onUpdate={handleUpdateLote}
            onDelete={handleDeleteLote}
            tipo="vacuna"
            isLoading={isLoading}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            stats={stats}
            isLoadingStats={isLoadingStats}
            vacunas={vacunasActivas}
            jeringas={[]}
            onApplyFilters={handleApplyFilters}
            isLoadingVacunas={isLoadingVacunas}
            isLoadingJeringas={false}
          />
        </div>
      </div>

      {/* Modal de nuevo ingreso */}
      {showNuevoIngreso && (
        <NuevoIngreso
          onClose={() => setShowNuevoIngreso(false)}
          onSuccess={handleNuevoLote}
          vacunas={vacunasActivas}
          jeringas={[]} // No se usan para vacunas
          tipoFijo="vacuna" // Forzar tipo vacuna
          isLoadingVacunas={isLoadingVacunas}
          isLoadingJeringas={false}
        />
      )}
    </div>
  );
};

export default LotesVacunasPage;
