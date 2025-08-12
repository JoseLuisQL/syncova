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

  // Mostrar error si hay problemas de conexión
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar los datos</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Mostrar loading inicial
  if (isLoading && lotes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando lotes de vacunas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de nuevo lote */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Package className="h-7 w-7 text-blue-600 mr-3" />
            Lotes de Vacunas
          </h2>
          <p className="text-gray-600 mt-1">
            Gestión completa de lotes de vacunas en el sistema
          </p>
        </div>
        
        <button
          onClick={() => setShowNuevoIngreso(true)}
          disabled={isCreating}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Nuevo Lote
        </button>
      </div>

      {/* Componente principal de gestión */}
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
      />

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
