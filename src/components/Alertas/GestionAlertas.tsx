import React, { useState, useMemo, useCallback, memo } from 'react';
import { Plus } from 'lucide-react';
import { useAlertas } from '../../hooks/useAlertas';
import { COMPONENT_STYLES } from './constants';
import { AlertasFilters, AlertasList, NuevaAlertaModal, LoadingSpinner } from './components';

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
    loadAlertas,
  } = useAlertas();

  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroNivel, setFiltroNivel] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlertas, setSelectedAlertas] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  const alertasFiltradas = useMemo(() => {
    return alertas.filter(alerta => {
      const matchesSearch = alerta.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alerta.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTipo = filtroTipo === 'todos' || alerta.tipo === filtroTipo;
      const matchesNivel = filtroNivel === 'todos' || alerta.nivel === filtroNivel;
      const matchesEstado = filtroEstado === 'todos' ||
                           (filtroEstado === 'leidas' && alerta.leida) ||
                           (filtroEstado === 'no_leidas' && !alerta.leida);

      return matchesSearch && matchesTipo && matchesNivel && matchesEstado;
    });
  }, [alertas, searchTerm, filtroTipo, filtroNivel, filtroEstado]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedAlertas(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedAlertas(alertasFiltradas.map(a => a.id));
  }, [alertasFiltradas]);

  const handleDeselectAll = useCallback(() => {
    setSelectedAlertas([]);
  }, []);

  const handleMarcarLeida = useCallback(async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Error al marcar como leida:', error);
    }
  }, [markAsRead]);

  const handleMarcarNoLeida = useCallback(async (id: string) => {
    try {
      await updateAlerta(id, { leida: false });
    } catch (error) {
      console.error('Error al marcar como no leida:', error);
    }
  }, [updateAlerta]);

  const handleEliminar = useCallback(async (id: string) => {
    if (window.confirm('Esta seguro de eliminar esta alerta?')) {
      try {
        await deleteAlerta(id);
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  }, [deleteAlerta]);

  const handleMarcarSeleccionadasLeidas = useCallback(async () => {
    try {
      await markMultipleAsRead(selectedAlertas);
      setSelectedAlertas([]);
    } catch (error) {
      console.error('Error al marcar como leidas:', error);
    }
  }, [selectedAlertas, markMultipleAsRead]);

  const handleEliminarSeleccionadas = useCallback(async () => {
    if (window.confirm(`Esta seguro de eliminar ${selectedAlertas.length} alertas?`)) {
      try {
        await Promise.all(selectedAlertas.map(id => deleteAlerta(id)));
        setSelectedAlertas([]);
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  }, [selectedAlertas, deleteAlerta]);

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
      await loadAlertas();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error al crear alerta:', error);
    }
  }, [createAlerta, loadAlertas, onRefresh]);

  if (isLoading && alertas.length === 0) {
    return (
      <div className="p-6">
        <LoadingSpinner message="Cargando alertas..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Gestion de Alertas</h2>
          <p className="text-sm text-gray-600">Administra y monitorea las alertas del sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className={COMPONENT_STYLES.button.primary}
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Alerta</span>
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

      <AlertasList
        alertas={alertasFiltradas}
        selectedAlertas={selectedAlertas}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onMarcarLeida={handleMarcarLeida}
        onMarcarNoLeida={handleMarcarNoLeida}
        onEliminar={handleEliminar}
        onMarcarSeleccionadasLeidas={handleMarcarSeleccionadasLeidas}
        onEliminarSeleccionadas={handleEliminarSeleccionadas}
      />

      <NuevaAlertaModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCrear={handleCrearAlerta}
        isCreating={isCreating}
      />
    </div>
  );
});

GestionAlertas.displayName = 'GestionAlertas';

export default GestionAlertas;
