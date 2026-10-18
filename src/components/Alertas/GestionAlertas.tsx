import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertActionDialog,
  AlertSectionCard,
  AlertasFilters,
  AlertasList,
  LoadingSpinner,
} from './components';
import { SortOrderAlerta } from './components/AlertasFilters';
import { Alerta } from '../../types';
import { NIVELES_ALERTA } from './constants';

interface GestionAlertasProps {
  alertas: Alerta[];
  isLoading?: boolean;
  initialFilter?: {
    tipo?: string;
    nivel?: string;
    estado?: string;
  } | null;
  onClearInitialFilter?: () => void;
  onMarcarLeida: (id: string) => Promise<void>;
  onMarcarNoLeida: (id: string) => Promise<void>;
  onEliminar: (id: string) => Promise<void>;
  onMarcarMultiplesLeidas: (ids: string[]) => Promise<void>;
  onMarcarMultiplesNoLeidas?: (ids: string[]) => Promise<void>;
  onEliminarMultiples: (ids: string[]) => Promise<void>;
  onInspect?: (alerta: Alerta) => void;
  onGenerarAutomaticas?: () => void;
}

const GestionAlertas: React.FC<GestionAlertasProps> = memo(({
  alertas,
  isLoading = false,
  initialFilter,
  onClearInitialFilter,
  onMarcarLeida,
  onMarcarNoLeida,
  onEliminar,
  onMarcarMultiplesLeidas,
  onMarcarMultiplesNoLeidas,
  onEliminarMultiples,
  onInspect,
  onGenerarAutomaticas,
}) => {
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroNivel, setFiltroNivel] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOrderAlerta>('recientes');
  const [selectedAlertas, setSelectedAlertas] = useState<string[]>([]);
  const [deleteState, setDeleteState] = useState<{ mode: 'single' | 'multiple'; alerta?: Alerta | null } | null>(null);

  useEffect(() => {
    if (!initialFilter) return;
    setFiltroTipo(initialFilter.tipo || 'todos');
    setFiltroNivel(initialFilter.nivel || 'todos');
    setFiltroEstado(initialFilter.estado || 'todos');
    onClearInitialFilter?.();
  }, [initialFilter, onClearInitialFilter]);

  const counts = useMemo(
    () => ({
      total: alertas.length,
      noLeidas: alertas.filter((a) => !a.leida).length,
      leidas: alertas.filter((a) => a.leida).length,
    }),
    [alertas],
  );

  const alertasFiltradas = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const filtered = alertas.filter((alerta) => {
      const matchesSearch =
        !q ||
        alerta.titulo.toLowerCase().includes(q) ||
        alerta.descripcion.toLowerCase().includes(q) ||
        alerta.tipo.toLowerCase().includes(q);
      const matchesTipo = filtroTipo === 'todos' || alerta.tipo === filtroTipo;
      const matchesNivel = filtroNivel === 'todos' || alerta.nivel === filtroNivel;
      const matchesEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'leidas' && alerta.leida) ||
        (filtroEstado === 'no_leidas' && !alerta.leida);

      return matchesSearch && matchesTipo && matchesNivel && matchesEstado;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'severidad') {
        const prioA = NIVELES_ALERTA.find((n) => n.id === a.nivel)?.priority || 0;
        const prioB = NIVELES_ALERTA.find((n) => n.id === b.nivel)?.priority || 0;
        if (prioB !== prioA) return prioB - prioA;
      } else if (sortBy === 'vencimiento') {
        const vencA = a.fechaVencimiento ? new Date(a.fechaVencimiento).getTime() : Number.MAX_SAFE_INTEGER;
        const vencB = b.fechaVencimiento ? new Date(b.fechaVencimiento).getTime() : Number.MAX_SAFE_INTEGER;
        if (vencA !== vencB) return vencA - vencB;
      }
      return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
    });
  }, [alertas, filtroEstado, filtroNivel, filtroTipo, searchTerm, sortBy]);

  useEffect(() => {
    const visibleIds = new Set(alertasFiltradas.map((a) => a.id));
    setSelectedAlertas((prev) => {
      const next = prev.filter((id) => visibleIds.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [alertasFiltradas]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedAlertas((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedAlertas(alertasFiltradas.map((alerta) => alerta.id));
  }, [alertasFiltradas]);

  const handleDeselectAll = useCallback(() => {
    setSelectedAlertas([]);
  }, []);

  const handleEliminarRequest = useCallback(
    (id: string) => {
      const alerta = alertas.find((item) => item.id === id) || null;
      setDeleteState({ mode: 'single', alerta });
    },
    [alertas],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteState) return;

    if (deleteState.mode === 'single' && deleteState.alerta) {
      await onEliminar(deleteState.alerta.id);
      setSelectedAlertas((prev) => prev.filter((id) => id !== deleteState.alerta?.id));
    } else if (deleteState.mode === 'multiple') {
      await onEliminarMultiples(selectedAlertas);
      setSelectedAlertas([]);
    }

    setDeleteState(null);
  }, [deleteState, onEliminar, onEliminarMultiples, selectedAlertas]);

  const handleMarcarSeleccionadasLeidas = useCallback(async () => {
    if (selectedAlertas.length === 0) return;
    await onMarcarMultiplesLeidas(selectedAlertas);
    setSelectedAlertas([]);
  }, [onMarcarMultiplesLeidas, selectedAlertas]);

  const handleMarcarSeleccionadasNoLeidas = useCallback(async () => {
    if (selectedAlertas.length === 0 || !onMarcarMultiplesNoLeidas) return;
    await onMarcarMultiplesNoLeidas(selectedAlertas);
    setSelectedAlertas([]);
  }, [onMarcarMultiplesNoLeidas, selectedAlertas]);

  const handleEliminarSeleccionadas = useCallback(() => {
    setDeleteState({ mode: 'multiple', alerta: null });
  }, []);

  return (
    <AlertSectionCard>
      <div className="space-y-4">
        <AlertasFilters
          searchTerm={searchTerm}
          filtroTipo={filtroTipo}
          filtroNivel={filtroNivel}
          filtroEstado={filtroEstado}
          sortBy={sortBy}
          counts={counts}
          onSearchChange={setSearchTerm}
          onTipoChange={setFiltroTipo}
          onNivelChange={setFiltroNivel}
          onEstadoChange={setFiltroEstado}
          onSortChange={setSortBy}
        />

        {isLoading && alertas.length === 0 ? (
          <LoadingSpinner message="Cargando bandeja de alertas..." />
        ) : (
          <AlertasList
            alertas={alertasFiltradas}
            selectedAlertas={selectedAlertas}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onMarcarLeida={onMarcarLeida}
            onMarcarNoLeida={onMarcarNoLeida}
            onEliminar={handleEliminarRequest}
            onMarcarSeleccionadasLeidas={handleMarcarSeleccionadasLeidas}
            onMarcarSeleccionadasNoLeidas={handleMarcarSeleccionadasNoLeidas}
            onEliminarSeleccionadas={handleEliminarSeleccionadas}
            onInspect={onInspect}
            onEmptyAction={onGenerarAutomaticas}
            isLoading={isLoading}
          />
        )}
      </div>

      <AlertActionDialog
        isOpen={Boolean(deleteState)}
        title={deleteState?.mode === 'multiple' ? 'Eliminar alertas seleccionadas' : 'Eliminar alerta'}
        description={
          deleteState?.mode === 'multiple'
            ? `Se eliminarán permanentemente ${selectedAlertas.length} alertas seleccionadas. Esta acción no se puede deshacer.`
            : `Se eliminará permanentemente "${deleteState?.alerta?.titulo || 'la alerta seleccionada'}". Esta acción no se puede deshacer.`
        }
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteState(null)}
        confirmLabel="Eliminar"
      />
    </AlertSectionCard>
  );
});

GestionAlertas.displayName = 'GestionAlertas';

export default GestionAlertas;