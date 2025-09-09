import React, { useState } from 'react';
import {
  Bell,
  Search,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Check,
  X,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Package,
  Monitor
} from 'lucide-react';
import { Alerta } from '../../types';
import { useAlertas } from '../../hooks/useAlertas';
import NuevaAlertaModal from './NuevaAlertaModal';

interface GestionAlertasProps {
  // Props opcionales para compatibilidad
  onRefresh?: () => void;
}

const GestionAlertas: React.FC<GestionAlertasProps> = ({
  onRefresh,
}) => {
  // Usar el hook de alertas para obtener datos y operaciones CRUD
  const {
    alertas,
    isLoading,
    error,
    createAlerta,
    updateAlerta,
    deleteAlerta,
    markAsRead,
    markMultipleAsRead,
    isCreating,
    isUpdating,
    isDeleting,
    isMarkingAsRead,
    createError,
    updateError,
    deleteError,
    loadAlertas,
    markAsReadError
  } = useAlertas();
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroNivel, setFiltroNivel] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlertas, setSelectedAlertas] = useState<string[]>([]);
  const [showModalNuevaAlerta, setShowModalNuevaAlerta] = useState(false);

  const tiposAlerta = [
    { id: 'vencimiento', label: 'Vencimientos', icon: Clock, color: 'text-orange-600' },
    { id: 'stock_bajo', label: 'Stock Bajo', icon: Package, color: 'text-red-600' },
    { id: 'discrepancia', label: 'Discrepancias', icon: AlertTriangle, color: 'text-yellow-600' },
    { id: 'sistema', label: 'Sistema', icon: Monitor, color: 'text-blue-600' },
  ];

  const nivelesAlerta = [
    { id: 'error', label: 'Críticas', icon: AlertOctagon, color: 'text-red-600', bgColor: 'bg-red-100' },
    { id: 'warning', label: 'Advertencias', icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { id: 'info', label: 'Informativas', icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { id: 'success', label: 'Exitosas', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  ];

  // Filtrar alertas
  const alertasFiltradas = alertas.filter(alerta => {
    const matchesSearch = alerta.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alerta.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filtroTipo === 'todos' || alerta.tipo === filtroTipo;
    const matchesNivel = filtroNivel === 'todos' || alerta.nivel === filtroNivel;
    const matchesEstado = filtroEstado === 'todos' || 
                         (filtroEstado === 'leidas' && alerta.leida) ||
                         (filtroEstado === 'no_leidas' && !alerta.leida);
    
    return matchesSearch && matchesTipo && matchesNivel && matchesEstado;
  });

  const getIconoTipo = (tipo: string) => {
    const tipoInfo = tiposAlerta.find(t => t.id === tipo);
    return tipoInfo ? tipoInfo.icon : Bell;
  };

  const getColorTipo = (tipo: string) => {
    const tipoInfo = tiposAlerta.find(t => t.id === tipo);
    return tipoInfo ? tipoInfo.color : 'text-gray-600';
  };

  const getIconoNivel = (nivel: string) => {
    const nivelInfo = nivelesAlerta.find(n => n.id === nivel);
    return nivelInfo ? nivelInfo.icon : Info;
  };

  const getColorNivel = (nivel: string) => {
    const nivelInfo = nivelesAlerta.find(n => n.id === nivel);
    return nivelInfo ? nivelInfo.color : 'text-gray-600';
  };

  const getBgColorNivel = (nivel: string) => {
    const nivelInfo = nivelesAlerta.find(n => n.id === nivel);
    return nivelInfo ? nivelInfo.bgColor : 'bg-gray-100';
  };

  const formatearFecha = (fecha: Date | string) => {
    if (!fecha) return 'Fecha no disponible';

    // Convertir string a Date si es necesario
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;

    // Verificar que la fecha sea válida
    if (isNaN(fechaObj.getTime())) return 'Fecha inválida';

    const ahora = new Date();
    const diferencia = ahora.getTime() - fechaObj.getTime();
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (minutos < 1) return 'Hace un momento';
    if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (dias < 7) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;

    return fechaObj.toLocaleDateString();
  };

  const marcarComoLeida = async (alertaId: string) => {
    try {
      await markAsRead(alertaId);
      // El hook se encarga de actualizar el estado local
    } catch (error) {
      console.error('Error al marcar alerta como leída:', error);
      alert('Error al marcar la alerta como leída');
    }
  };

  const marcarComoNoLeida = async (alertaId: string) => {
    try {
      await updateAlerta(alertaId, { leida: false });
      // El hook se encarga de actualizar el estado local
    } catch (error) {
      console.error('Error al marcar alerta como no leída:', error);
      alert('Error al marcar la alerta como no leída');
    }
  };

  const eliminarAlerta = async (alertaId: string) => {
    if (window.confirm('¿Está seguro de eliminar esta alerta?')) {
      try {
        const success = await deleteAlerta(alertaId);
        if (!success) {
          alert('Error al eliminar la alerta');
        }
      } catch (error) {
        console.error('Error al eliminar alerta:', error);
        alert('Error al eliminar la alerta');
      }
    }
  };

  const toggleSeleccionAlerta = (alertaId: string) => {
    setSelectedAlertas(prev => 
      prev.includes(alertaId) 
        ? prev.filter(id => id !== alertaId)
        : [...prev, alertaId]
    );
  };

  const seleccionarTodas = () => {
    setSelectedAlertas(alertasFiltradas.map(a => a.id));
  };

  const deseleccionarTodas = () => {
    setSelectedAlertas([]);
  };

  const marcarSeleccionadasComoLeidas = async () => {
    try {
      const success = await markMultipleAsRead(selectedAlertas);
      if (success) {
        setSelectedAlertas([]);
      } else {
        alert('Error al marcar las alertas como leídas');
      }
    } catch (error) {
      console.error('Error al marcar alertas como leídas:', error);
      alert('Error al marcar las alertas como leídas');
    }
  };

  const eliminarSeleccionadas = async () => {
    if (window.confirm(`¿Está seguro de eliminar ${selectedAlertas.length} alertas seleccionadas?`)) {
      try {
        // Eliminar una por una (el backend no tiene endpoint para eliminación múltiple)
        const promises = selectedAlertas.map(id => deleteAlerta(id));
        await Promise.all(promises);
        setSelectedAlertas([]);
      } catch (error) {
        console.error('Error al eliminar alertas:', error);
        alert('Error al eliminar las alertas seleccionadas');
      }
    }
  };

  return (
    <div className="p-6">
      {/* Header con acciones */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestión de Alertas</h2>
          <p className="text-gray-600 mt-1">Administra y monitorea todas las alertas del sistema</p>
        </div>
        <button
          onClick={() => setShowModalNuevaAlerta(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Alerta
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar alertas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los tipos</option>
              {tiposAlerta.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>{tipo.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nivel</label>
            <select
              value={filtroNivel}
              onChange={(e) => setFiltroNivel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los niveles</option>
              {nivelesAlerta.map((nivel) => (
                <option key={nivel.id} value={nivel.id}>{nivel.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todas</option>
              <option value="no_leidas">No leídas</option>
              <option value="leidas">Leídas</option>
            </select>
          </div>
        </div>

        {/* Acciones en lote */}
        {selectedAlertas.length > 0 && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedAlertas.length} alerta{selectedAlertas.length > 1 ? 's' : ''} seleccionada{selectedAlertas.length > 1 ? 's' : ''}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={marcarSeleccionadasComoLeidas}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Marcar como leídas
              </button>
              <button
                onClick={eliminarSeleccionadas}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
              <button
                onClick={deseleccionarTodas}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Alertas */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            Alertas ({alertasFiltradas.length})
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={seleccionarTodas}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Seleccionar todas
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={deseleccionarTodas}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Deseleccionar todas
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {alertasFiltradas.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No se encontraron alertas</p>
              <p className="text-gray-400">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            alertasFiltradas.map((alerta) => {
              const IconoTipo = getIconoTipo(alerta.tipo);
              const IconoNivel = getIconoNivel(alerta.nivel);
              const isSelected = selectedAlertas.includes(alerta.id);
              
              return (
                <div
                  key={alerta.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !alerta.leida ? 'bg-blue-50' : ''
                  } ${isSelected ? 'bg-blue-100' : ''}`}
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSeleccionAlerta(alerta.id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    
                    <div className={`p-2 ${getBgColorNivel(alerta.nivel)} rounded-lg`}>
                      <IconoNivel className={`h-5 w-5 ${getColorNivel(alerta.nivel)}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className={`text-sm font-medium ${!alerta.leida ? 'text-gray-900' : 'text-gray-700'}`}>
                              {alerta.titulo}
                            </h4>
                            {!alerta.leida && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alerta.descripcion}</p>
                          
                          <div className="flex items-center space-x-4 mt-3">
                            <div className="flex items-center">
                              <IconoTipo className={`h-3 w-3 ${getColorTipo(alerta.tipo)} mr-1`} />
                              <span className="text-xs text-gray-500 capitalize">
                                {alerta.tipo.replace('_', ' ')}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatearFecha(alerta.fechaCreacion)}
                            </span>
                            {alerta.usuarioId && (
                              <span className="text-xs text-gray-500">
                                Usuario: {alerta.usuarioId}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {alerta.leida ? (
                            <button
                              onClick={() => marcarComoNoLeida(alerta.id)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Marcar como no leída"
                            >
                              <EyeOff className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => marcarComoLeida(alerta.id)}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="Marcar como leída"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => eliminarAlerta(alerta.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar alerta"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Nueva Alerta */}
      {showModalNuevaAlerta && (
        <NuevaAlertaModal
          onClose={() => setShowModalNuevaAlerta(false)}
          onCrear={async (alertaData) => {
            try {
              await createAlerta(alertaData);
              setShowModalNuevaAlerta(false);
              // Recargar las alertas para mostrar la nueva
              await loadAlertas();
              if (onRefresh) onRefresh();
            } catch (error) {
              console.error('Error al crear alerta:', error);
              // El error ya se maneja en el hook useAlertas
            }
          }}
          tiposAlerta={tiposAlerta}
          nivelesAlerta={nivelesAlerta}
        />
      )}
    </div>
  );
};

export default GestionAlertas;
