import React, { useState } from 'react';
import { Plus, Syringe, AlertCircle, Loader2 } from 'lucide-react';
import GestionLotes from './GestionLotes';
import NuevoIngreso from './NuevoIngreso';
import { useLotesJeringas } from '../../hooks/useLotesJeringas';
import { useJeringas } from '../../hooks/useJeringas';
import { CreateLoteJeringaDto, LoteJeringa } from '../../types';
import { useToastContext } from '../../contexts/ToastContext';

/**
 * Página principal para gestión de lotes de jeringas
 * Integra completamente con el backend
 */
const LotesJeringasPage: React.FC = () => {
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
  } = useLotesJeringas();

  const { jeringasActivas, loadJeringasActivas, isLoadingActivas: isLoadingJeringas } = useJeringas();

  // Cargar jeringas activas al montar el componente
  React.useEffect(() => {
    loadJeringasActivas();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Recargar jeringas activas cuando se abre el modal
  React.useEffect(() => {
    if (showNuevoIngreso) {
      console.log('🔄 Modal abierto, recargando jeringas activas...');
      loadJeringasActivas();
    }
  }, [showNuevoIngreso, loadJeringasActivas]);

  /**
   * Manejar creación de nuevo lote desde NuevoIngreso
   */
  const handleNuevoLote = async (tipo: 'vacuna' | 'jeringa', data: any) => {
    if (tipo !== 'jeringa') {
      toast.error('Error: Tipo de lote incorrecto');
      return;
    }

    try {
      // Convertir el formato de NuevoIngreso al DTO del backend
      const loteData: CreateLoteJeringaDto = {
        numero: data.numero,
        jeringaId: data.jeringaId,
        fechaIngreso: data.fechaIngreso.toISOString(),
        fechaVencimiento: data.fechaVencimiento ? data.fechaVencimiento.toISOString() : undefined,
        formaIngreso: data.formaIngreso,
        comprobanteClase: data.comprobanteClase,
        numeroComprobante: data.numeroComprobante,
        cantidadInicial: data.cantidadInicial,
        cantidadActual: data.cantidadInicial, // Al crear un lote, la cantidad actual es igual a la inicial
        observaciones: data.observaciones || undefined
      };

      const success = await createLote(loteData);

      if (success) {
        toast.success('Lote creado', 'El lote de jeringa se creó exitosamente');
        setShowNuevoIngreso(false);
      } else {
        toast.error('Error al crear', createError || 'Error al crear el lote de jeringa');
      }
    } catch (error) {
      console.error('Error al crear lote:', error);
      toast.error('Error inesperado', 'Error inesperado al crear el lote');
    }
  };

  /**
   * Manejar actualización de lote
   */
  const handleUpdateLote = async (lote: LoteJeringa) => {
    try {
      const success = await updateLote(lote.id, {
        numero: lote.numero,
        fechaIngreso: lote.fechaIngreso.toISOString(),
        fechaVencimiento: lote.fechaVencimiento ? lote.fechaVencimiento.toISOString() : undefined,
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
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando lotes de jeringas...</p>
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
            <Syringe className="h-7 w-7 text-purple-600 mr-3" />
            Lotes de Jeringas
          </h2>
          <p className="text-gray-600 mt-1">
            Gestión completa de lotes de jeringas en el sistema
          </p>
        </div>
        
        <button
          onClick={() => setShowNuevoIngreso(true)}
          disabled={isCreating}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors"
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
        tipo="jeringa"
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
          vacunas={[]} // No se usan para jeringas
          jeringas={jeringasActivas}
          tipoFijo="jeringa" // Forzar tipo jeringa
          isLoadingVacunas={false}
          isLoadingJeringas={isLoadingJeringas}
        />
      )}
    </div>
  );
};

export default LotesJeringasPage;
