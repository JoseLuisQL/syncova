import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Package } from 'lucide-react';
import GestionLotes from './GestionLotes';
import NuevoIngreso from './NuevoIngreso';
import { useLotesVacunas } from '../../hooks/useLotesVacunas';
import { useVacunas } from '../../hooks/useVacunas';
import { CreateLoteVacunaDto, Lote } from '../../types';
import { useToastContext } from '../../contexts/ToastContext';
import { PageHeader, ErrorAlert, LoadingSpinner } from './components/SharedComponents';
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
    applyFilters,
  } = useLotesVacunas();

  const { vacunasActivas, loadVacunasActivas, isLoadingActivas: isLoadingVacunas } = useVacunas();

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

  const handleNuevoLote = useCallback(async (tipo: 'vacuna' | 'jeringa', data: Lote) => {
    if (tipo !== 'vacuna') {
      toast.error('Error: Tipo de lote incorrecto');
      return;
    }

    try {
      const loteData: CreateLoteVacunaDto = {
        numero: data.numero,
        vacunaId: data.vacunaId,
        fechaIngreso: data.fechaIngreso.toISOString(),
        fechaVencimiento: data.fechaVencimiento.toISOString(),
        formaIngreso: data.formaIngreso,
        comprobanteClase: data.comprobanteClase,
        numeroComprobante: data.numeroComprobante,
        cantidadInicial: data.cantidadInicial,
        cantidadActual: data.cantidadInicial,
        observaciones: data.observaciones || undefined
      };

      const success = await createLote(loteData);

      if (success) {
        toast.success('Lote creado', 'El lote de vacuna se creo exitosamente');
        setShowNuevoIngreso(false);
      } else {
        toast.error('Error al crear', createError || 'Error al crear el lote de vacuna');
      }
    } catch {
      toast.error('Error inesperado', 'Error inesperado al crear el lote');
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

  const handleApplyFilters = useCallback(async (filters: Record<string, string>) => {
    if (applyFilters) {
      await applyFilters(filters);
    }
  }, [applyFilters]);

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
    <div className="p-5 sm:p-6">
      <PageHeader
        title="Lotes de Vacunas"
        subtitle="Gestion de lotes de vacunas del inventario"
        icon={Package}
        action={{
          label: 'Nuevo Lote',
          onClick: handleOpenNuevoIngreso,
          icon: Plus,
          isLoading: isCreating,
        }}
      />

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
    </div>
  );
};

export default LotesVacunasPage;
