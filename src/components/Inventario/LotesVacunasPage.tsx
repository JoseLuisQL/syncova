import React, { useCallback, useEffect, useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import GestionLotes from './GestionLotes';
import NuevoIngreso, { NuevoIngresoPayload, NuevoIngresoSubmitResult } from './NuevoIngreso';
import { useLotesVacunas } from '../../hooks/useLotesVacunas';
import { useVacunas } from '../../hooks/useVacunas';
import { CreateLoteVacunaDto, Lote } from '../../types';
import { useToastContext } from '../../contexts/ToastContext';
import { ErrorAlert, LoadingSpinner } from './components/SharedComponents';
import { COMPONENT_STYLES } from './constants';

const LotesVacunasPage: React.FC = () => {
  const [showNuevoIngreso, setShowNuevoIngreso] = useState(false);
  const { toast } = useToastContext();

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
    refresh,
  } = useLotesVacunas();

  const { vacunasActivas, loadVacunasActivas, isLoadingActivas: isLoadingVacunas } = useVacunas(undefined, { autoLoad: false });

  useEffect(() => {
    loadVacunasActivas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showNuevoIngreso) {
      loadVacunasActivas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNuevoIngreso]);

  const handleNuevoLote = useCallback(async (
    tipo: 'vacuna' | 'jeringa',
    data: NuevoIngresoPayload
  ): Promise<NuevoIngresoSubmitResult> => {
    if (tipo !== 'vacuna' || !('vacunaId' in data)) {
      return {
        success: false,
        error: 'Error: Tipo de lote incorrecto'
      };
    }

    try {
      const loteData: CreateLoteVacunaDto = {
        numero: data.numero,
        vacunaId: data.vacunaId,
        fechaIngreso: data.fechaIngreso,
        fechaVencimiento: data.fechaVencimiento,
        formaIngreso: data.formaIngreso,
        comprobanteClase: data.comprobanteClase,
        numeroComprobante: data.numeroComprobante,
        cantidadInicial: data.cantidadInicial,
        cantidadActual: data.cantidadInicial,
        observaciones: data.observaciones || undefined
      };

      const result = await createLote(loteData);

      if (result.success) {
        toast.success('Lote creado', 'El lote de vacuna se creo exitosamente');
        return { success: true };
      }

      return {
        success: false,
        error: result.error || createError || 'Error al crear el lote de vacuna'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error inesperado al crear el lote'
      };
    }
  }, [createLote, createError, toast]);

  const handleUpdateLote = useCallback(async (lote: Lote) => {
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
        toast.success('Lote actualizado', 'El lote se actualizo exitosamente');
      } else {
        toast.error('Error al actualizar', updateError || 'Error al actualizar el lote');
      }
    } catch {
      toast.error('Error inesperado', 'Error inesperado al actualizar el lote');
    }
  }, [updateLote, updateError, toast]);

  const handleDeleteLote = useCallback(async (id: string) => {
    try {
      const success = await deleteLote(id);

      if (success) {
        toast.success('Lote eliminado', 'El lote se elimino exitosamente');
      } else {
        toast.error('Error al eliminar', deleteError || 'Error al eliminar el lote');
      }
    } catch {
      toast.error('Error inesperado', 'Error inesperado al eliminar el lote');
    }
  }, [deleteLote, deleteError, toast]);

  const handleOpenNuevoIngreso = useCallback(() => {
    setShowNuevoIngreso(true);
  }, []);

  const handleCloseNuevoIngreso = useCallback(() => {
    setShowNuevoIngreso(false);
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <ErrorAlert message={error} onRetry={refresh} />
      </div>
    );
  }

  if (isLoading && lotes.length === 0) {
    return (
      <div className="p-6">
        <LoadingSpinner message="Cargando lotes de vacunas..." />
      </div>
    );
  }

  return (
    <section className={`${COMPONENT_STYLES.surface} p-4 sm:p-6`}>
      <div className="space-y-4">
        <GestionLotes
          lotes={lotes}
          onUpdate={handleUpdateLote}
          onDelete={handleDeleteLote}
          tipo="vacuna"
          toolbarActions={
            <button type="button" className={COMPONENT_STYLES.button.primary} onClick={handleOpenNuevoIngreso} disabled={isCreating}>
              <Plus className="h-4 w-4" weight="bold" />
              <span>Nuevo lote</span>
            </button>
          }
          isLoading={isLoading}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
          stats={stats}
          isLoadingStats={isLoadingStats}
          vacunas={vacunasActivas}
          jeringas={[]}
        />
      </div>

      {showNuevoIngreso && (
        <NuevoIngreso
          onClose={handleCloseNuevoIngreso}
          onSuccess={handleNuevoLote}
          vacunas={vacunasActivas}
          jeringas={[]}
          tipoFijo="vacuna"
          isLoadingVacunas={isLoadingVacunas}
          isLoadingJeringas={false}
        />
      )}
    </section>
  );
};

export default LotesVacunasPage;
