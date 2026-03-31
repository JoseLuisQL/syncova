import React, { memo, useCallback, useMemo, useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { useAlertas } from '../../hooks/useAlertas';
import { useToastContext } from '../../contexts/ToastContext';
import { AlertActionDialog, AlertSectionCard, AlertasFilters, AlertasList, LoadingSpinner, NuevaAlertaModal } from './components';
import { Alerta } from '../../types';

interface GestionAlertasProps {
  onRefresh?: () => void;
}

const GestionAlertas: React.FC<GestionAlertasProps> = memo(({ onRefresh }) => {
  const {
    alertas,
    isLoading,
    createAlerta,
    updateAlerta,
    deleteAlerta,
    markAsRead,
    markMultipleAsRead,
    isCreating,
  } = useAlertas();
  const { toast } = useToastContext();

  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroNivel, setFiltroNivel] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlertas, setSelectedAlertas] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteState, setDeleteState] = useState<{ mode: 'single' | 'multiple'; alerta?: Alerta | null } | null>(null);

  const alertasFiltradas = useMemo(
    () =>
      alertas.filter((alerta) => {
        const matchesSearch =
          alerta.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alerta.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTipo = filtroTipo === 'todos' || alerta.tipo === filtroTipo;
        const matchesNivel = filtroNivel === 'todos' || alerta.nivel === filtroNivel;
        const matchesEstado =
          filtroEstado === 'todos' ||
          (filtroEstado === 'leidas' && alerta.leida) ||
          (filtroEstado === 'no_leidas' && !alerta.leida);

        return matchesSearch && matchesTipo && matchesNivel && matchesEstado;
      }),
    [alertas, filtroEstado, filtroNivel, filtroTipo, searchTerm],
  );

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedAlertas((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedAlertas(alertasFiltradas.map((alerta) => alerta.id));
  }, [alertasFiltradas]);

  const handleDeselectAll = useCallback(() => {
    setSelectedAlertas([]);
  }, []);

  const handleMarcarLeida = useCallback(async (id: string) => {
    try {
      await markAsRead(id);
      toast.success('Alerta actualizada', 'La alerta fue marcada como leída.', { duration: 2500 });
      onRefresh?.();
    } catch (error) {
      console.error('Error al marcar como leída:', error);
      toast.error('No se pudo actualizar', 'Hubo un problema al marcar la alerta.', { duration: 3500 });
    }
  }, [markAsRead, onRefresh, toast]);

  const handleMarcarNoLeida = useCallback(async (id: string) => {
    try {
      await updateAlerta(id, { leida: false });
      toast.success('Alerta actualizada', 'La alerta volvió a estado pendiente.', { duration: 2500 });
      onRefresh?.();
    } catch (error) {
      console.error('Error al marcar como no leída:', error);
      toast.error('No se pudo actualizar', 'Hubo un problema al cambiar el estado.', { duration: 3500 });
    }
  }, [onRefresh, toast, updateAlerta]);

  const handleEliminarRequest = useCallback((id: string) => {
    const alerta = alertas.find((item) => item.id === id) || null;
    setDeleteState({ mode: 'single', alerta });
  }, [alertas]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteState) return;

    try {
      if (deleteState.mode === 'single' && deleteState.alerta) {
        await deleteAlerta(deleteState.alerta.id);
        toast.success('Alerta eliminada', 'La alerta se eliminó correctamente.', { duration: 2500 });
      } else if (deleteState.mode === 'multiple') {
        await Promise.all(selectedAlertas.map((id) => deleteAlerta(id)));
        toast.success('Alertas eliminadas', `Se eliminaron ${selectedAlertas.length} alertas.`, { duration: 2500 });
        setSelectedAlertas([]);
      }

      setDeleteState(null);
      onRefresh?.();
    } catch (error) {
      console.error('Error al eliminar alertas:', error);
      toast.error('No se pudo eliminar', 'Hubo un problema al eliminar las alertas seleccionadas.', { duration: 3500 });
    }
  }, [deleteAlerta, deleteState, onRefresh, selectedAlertas, toast]);

  const handleMarcarSeleccionadasLeidas = useCallback(async () => {
    try {
      await markMultipleAsRead(selectedAlertas);
      setSelectedAlertas([]);
      toast.success('Alertas actualizadas', 'Las alertas seleccionadas fueron marcadas como leídas.', { duration: 2500 });
      onRefresh?.();
    } catch (error) {
      console.error('Error al marcar como leídas:', error);
      toast.error('No se pudo actualizar', 'Hubo un problema al procesar la selección.', { duration: 3500 });
    }
  }, [markMultipleAsRead, onRefresh, selectedAlertas, toast]);

  const handleEliminarSeleccionadas = useCallback(() => {
    setDeleteState({ mode: 'multiple', alerta: null });
  }, []);

  const handleCrearAlerta = useCallback(async (data: {
    tipo: string;
    nivel: string;
    titulo: string;
    descripcion: string;
  }) => {
    try {
      await createAlerta({
        tipo: data.tipo as 'vencimiento' | 'stock_bajo' | 'discrepancia' | 'sistema',
        nivel: data.nivel as 'error' | 'warning' | 'info' | 'success',
        titulo: data.titulo,
        descripcion: data.descripcion,
      });
      setShowModal(false);
      toast.success('Alerta creada', 'La nueva alerta ya está disponible en la lista.', { duration: 2500 });
      onRefresh?.();
    } catch (error) {
      console.error('Error al crear alerta:', error);
      toast.error('No se pudo crear', 'Verifica los datos e inténtalo nuevamente.', { duration: 3500 });
    }
  }, [createAlerta, onRefresh, toast]);

  return (
    <AlertSectionCard>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">Gestión de alertas</h2>
            <p className="mt-1 text-sm text-zinc-500">Filtra, revisa y opera alertas activas sin salir del módulo.</p>
          </div>
          <button type="button" onClick={() => setShowModal(true)} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-teal-700 hover:to-cyan-800">
            <Plus className="h-4 w-4" weight="bold" />
            Nueva alerta
          </button>
        </div>

        <AlertasFilters
          searchTerm={searchTerm}
          filtroTipo={filtroTipo}
          filtroNivel={filtroNivel}
          filtroEstado={filtroEstado}
          onSearchChange={setSearchTerm}
          onTipoChange={setFiltroTipo}
          onNivelChange={setFiltroNivel}
          onEstadoChange={setFiltroEstado}
        />

        {isLoading && alertas.length === 0 ? (
          <LoadingSpinner message="Cargando alertas..." />
        ) : (
          <AlertasList
            alertas={alertasFiltradas}
            selectedAlertas={selectedAlertas}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onMarcarLeida={handleMarcarLeida}
            onMarcarNoLeida={handleMarcarNoLeida}
            onEliminar={handleEliminarRequest}
            onMarcarSeleccionadasLeidas={handleMarcarSeleccionadasLeidas}
            onEliminarSeleccionadas={handleEliminarSeleccionadas}
            isLoading={isLoading}
          />
        )}
      </div>

      <NuevaAlertaModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCrear={handleCrearAlerta}
        isCreating={isCreating}
      />

      <AlertActionDialog
        isOpen={Boolean(deleteState)}
        title={deleteState?.mode === 'multiple' ? 'Eliminar alertas seleccionadas' : 'Eliminar alerta'}
        description={deleteState?.mode === 'multiple'
          ? `Se eliminarán ${selectedAlertas.length} alertas seleccionadas. Esta acción no se puede deshacer.`
          : `Se eliminará "${deleteState?.alerta?.titulo || 'la alerta seleccionada'}". Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteState(null)}
        confirmLabel="Eliminar"
      />
    </AlertSectionCard>
  );
});

GestionAlertas.displayName = 'GestionAlertas';

export default GestionAlertas;
 