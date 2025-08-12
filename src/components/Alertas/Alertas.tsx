import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, AlertCircle, CheckCircle, Info, Clock, Filter, Search, Settings, Eye, EyeOff, Trash2, BookMarked as MarkAsRead, Plus, Download, RefreshCw, Calendar, Package, Building2, Users, Activity, TrendingUp, Zap, Shield, Target, FileText, Mail, Phone, MessageSquare, Volume2, VolumeX, Smartphone, Monitor, Globe, Archive, Star, Flag, ChevronDown, ChevronRight, X, Check, AlertOctagon, Thermometer, Battery, Wifi, Database, Server, HardDrive, Cpu, MemoryStick, Network, Lock, Unlock, Key, UserCheck, UserX, LogIn, LogOut, Upload, CloudOff, WifiOff, PowerOff, Power, Gauge, BarChart3, PieChart, LineChart, TrendingDown } from 'lucide-react';
import { mockAlertas, mockEstablecimientos, mockVacunas, mockLotes } from '../../data/mockData';
import { Alerta } from '../../types';

const Alertas: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alertas' | 'configuracion' | 'historial'>('dashboard');
  const [alertas, setAlertas] = useState<Alerta[]>(mockAlertas);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroNivel, setFiltroNivel] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModalConfig, setShowModalConfig] = useState(false);
  const [showModalNuevaAlerta, setShowModalNuevaAlerta] = useState(false);
  const [selectedAlertas, setSelectedAlertas] = useState<string[]>([]);
  const [configuracionAlertas, setConfiguracionAlertas] = useState({
    notificacionesEmail: true,
    notificacionesSMS: false,
    notificacionesPush: true,
    sonidoAlertas: true,
    alertasEscritorio: true,
    frecuenciaVerificacion: 5, // minutos
    diasRetencion: 30,
    alertasAutomaticas: {
      vencimiento: { activo: true, diasAnticipacion: 30 },
      stockBajo: { activo: true, porcentajeMinimo: 20 },
      temperaturaFuera: { activo: true, tolerancia: 1 },
      fallosConexion: { activo: true, intentosMaximos: 3 },
      accesosNoAutorizados: { activo: true, intentosMaximos: 5 },
      respaldoFallido: { activo: true },
      actualizacionesDisponibles: { activo: false },
      mantenimientoProgramado: { activo: true, horasAnticipacion: 24 }
    }
  });

  const tabs = [
    { id: 'dashboard', label: 'Dashboard de Alertas', icon: Activity },
    { id: 'alertas', label: 'Gestión de Alertas', icon: Bell },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
    { id: 'historial', label: 'Historial y Reportes', icon: FileText },
  ];

  // Generar alertas adicionales para demostración
  useEffect(() => {
    const alertasAdicionales: Alerta[] = [
      {
        id: '5',
        tipo: 'temperatura',
        titulo: 'Temperatura fuera de rango',
        descripcion: 'La temperatura del refrigerador principal está en 10°C (fuera del rango 2-8°C)',
        nivel: 'error',
        fechaCreacion: new Date('2024-12-15T14:30:00'),
        leida: false,
        parametros: { temperatura: 10, rangoMin: 2, rangoMax: 8, equipoId: 'REF-001' },
      },
      {
        id: '6',
        tipo: 'conexion',
        titulo: 'Fallo de conexión',
        descripcion: 'Se perdió la conexión con el sensor de temperatura del C.S. Andahuaylas',
        nivel: 'warning',
        fechaCreacion: new Date('2024-12-15T13:45:00'),
        leida: false,
        usuarioId: '3',
        parametros: { establecimientoId: '9', sensorId: 'TEMP-002', ultimaConexion: '2024-12-15T13:30:00' },
      },
      {
        id: '7',
        tipo: 'seguridad',
        titulo: 'Intento de acceso no autorizado',
        descripcion: 'Se detectaron 3 intentos fallidos de acceso desde IP 192.168.1.100',
        nivel: 'error',
        fechaCreacion: new Date('2024-12-15T12:15:00'),
        leida: true,
        parametros: { ip: '192.168.1.100', intentos: 3, ultimoIntento: '2024-12-15T12:10:00' },
      },
      {
        id: '8',
        tipo: 'mantenimiento',
        titulo: 'Mantenimiento programado',
        descripcion: 'Mantenimiento del servidor programado para mañana a las 02:00 AM',
        nivel: 'info',
        fechaCreacion: new Date('2024-12-15T10:00:00'),
        leida: false,
        parametros: { fechaMantenimiento: '2024-12-16T02:00:00', duracionEstimada: 120 },
      },
      {
        id: '9',
        tipo: 'backup',
        titulo: 'Respaldo completado exitosamente',
        descripcion: 'El respaldo automático diario se completó correctamente (2.3 GB)',
        nivel: 'success',
        fechaCreacion: new Date('2024-12-15T03:00:00'),
        leida: true,
        parametros: { tamaño: '2.3 GB', duracion: '45 minutos', ubicacion: 'backup-server-01' },
      },
      {
        id: '10',
        tipo: 'actualizacion',
        titulo: 'Actualización disponible',
        descripcion: 'Nueva versión del sistema disponible: v2.1.0 con mejoras de seguridad',
        nivel: 'info',
        fechaCreacion: new Date('2024-12-14T16:00:00'),
        leida: false,
        parametros: { version: 'v2.1.0', tamaño: '156 MB', criticidad: 'media' },
      },
      {
        id: '11',
        tipo: 'rendimiento',
        titulo: 'Alto uso de CPU',
        descripcion: 'El servidor principal está utilizando 85% de CPU durante los últimos 15 minutos',
        nivel: 'warning',
        fechaCreacion: new Date('2024-12-15T15:45:00'),
        leida: false,
        parametros: { cpuUsage: 85, duracion: 15, servidor: 'SRV-PRINCIPAL' },
      },
      {
        id: '12',
        tipo: 'usuario',
        titulo: 'Nuevo usuario registrado',
        descripcion: 'Se registró un nuevo usuario: Dr. Roberto Sánchez (C.S. Chincheros)',
        nivel: 'info',
        fechaCreacion: new Date('2024-12-15T11:30:00'),
        leida: true,
        usuarioId: '4',
        parametros: { nuevoUsuario: 'Dr. Roberto Sánchez', establecimiento: 'C.S. Chincheros' },
      }
    ];

    setAlertas(prev => [...prev, ...alertasAdicionales]);
  }, []);

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

  const estadisticasAlertas = {
    total: alertas.length,
    noLeidas: alertas.filter(a => !a.leida).length,
    criticas: alertas.filter(a => a.nivel === 'error').length,
    advertencias: alertas.filter(a => a.nivel === 'warning').length,
    informativas: alertas.filter(a => a.nivel === 'info').length,
    exitosas: alertas.filter(a => a.nivel === 'success').length,
    hoy: alertas.filter(a => {
      const hoy = new Date();
      const fechaAlerta = new Date(a.fechaCreacion);
      return fechaAlerta.toDateString() === hoy.toDateString();
    }).length
  };

  const tiposAlerta = [
    { id: 'vencimiento', label: 'Vencimientos', icon: Clock, color: 'text-orange-600' },
    { id: 'stock_bajo', label: 'Stock Bajo', icon: Package, color: 'text-red-600' },
    { id: 'temperatura', label: 'Temperatura', icon: Thermometer, color: 'text-blue-600' },
    { id: 'conexion', label: 'Conexión', icon: Wifi, color: 'text-purple-600' },
    { id: 'seguridad', label: 'Seguridad', icon: Shield, color: 'text-red-600' },
    { id: 'sistema', label: 'Sistema', icon: Monitor, color: 'text-green-600' },
    { id: 'mantenimiento', label: 'Mantenimiento', icon: Settings, color: 'text-yellow-600' },
    { id: 'backup', label: 'Respaldos', icon: Database, color: 'text-indigo-600' },
    { id: 'actualizacion', label: 'Actualizaciones', icon: Download, color: 'text-cyan-600' },
    { id: 'rendimiento', label: 'Rendimiento', icon: Gauge, color: 'text-orange-600' },
    { id: 'usuario', label: 'Usuarios', icon: Users, color: 'text-green-600' },
    { id: 'discrepancia', label: 'Discrepancias', icon: AlertTriangle, color: 'text-yellow-600' },
  ];

  const nivelesAlerta = [
    { id: 'error', label: 'Críticas', icon: AlertOctagon, color: 'text-red-600', bgColor: 'bg-red-100' },
    { id: 'warning', label: 'Advertencias', icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { id: 'info', label: 'Informativas', icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { id: 'success', label: 'Exitosas', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  ];

  const marcarComoLeida = (alertaId: string) => {
    setAlertas(prev => prev.map(alerta => 
      alerta.id === alertaId ? { ...alerta, leida: true } : alerta
    ));
  };

  const marcarComoNoLeida = (alertaId: string) => {
    setAlertas(prev => prev.map(alerta => 
      alerta.id === alertaId ? { ...alerta, leida: false } : alerta
    ));
  };

  const eliminarAlerta = (alertaId: string) => {
    if (window.confirm('¿Está seguro de eliminar esta alerta?')) {
      setAlertas(prev => prev.filter(alerta => alerta.id !== alertaId));
    }
  };

  const marcarSeleccionadasComoLeidas = () => {
    setAlertas(prev => prev.map(alerta => 
      selectedAlertas.includes(alerta.id) ? { ...alerta, leida: true } : alerta
    ));
    setSelectedAlertas([]);
  };

  const eliminarSeleccionadas = () => {
    if (window.confirm(`¿Está seguro de eliminar ${selectedAlertas.length} alertas seleccionadas?`)) {
      setAlertas(prev => prev.filter(alerta => !selectedAlertas.includes(alerta.id)));
      setSelectedAlertas([]);
    }
  };

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

  const formatearFecha = (fecha: Date) => {
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (minutos < 1) return 'Hace un momento';
    if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (dias < 7) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    
    return fecha.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Sistema de Alertas y Notificaciones</h2>
          <p className="text-gray-600 mt-1">Monitoreo en tiempo real y gestión de alertas del sistema</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowModalNuevaAlerta(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Alerta
          </button>
          <button
            onClick={() => setShowModalConfig(true)}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </button>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
                {tab.id === 'alertas' && estadisticasAlertas.noLeidas > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {estadisticasAlertas.noLeidas}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && (
        <DashboardAlertas 
          estadisticas={estadisticasAlertas}
          alertasRecientes={alertas.slice(0, 5)}
          tiposAlerta={tiposAlerta}
          nivelesAlerta={nivelesAlerta}
          getIconoTipo={getIconoTipo}
          getColorTipo={getColorTipo}
          getIconoNivel={getIconoNivel}
          getColorNivel={getColorNivel}
          formatearFecha={formatearFecha}
        />
      )}
      
      {activeTab === 'alertas' && (
        <GestionAlertas 
          alertas={alertasFiltradas}
          filtroTipo={filtroTipo}
          setFiltroTipo={setFiltroTipo}
          filtroNivel={filtroNivel}
          setFiltroNivel={setFiltroNivel}
          filtroEstado={filtroEstado}
          setFiltroEstado={setFiltroEstado}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedAlertas={selectedAlertas}
          setSelectedAlertas={setSelectedAlertas}
          tiposAlerta={tiposAlerta}
          nivelesAlerta={nivelesAlerta}
          marcarComoLeida={marcarComoLeida}
          marcarComoNoLeida={marcarComoNoLeida}
          eliminarAlerta={eliminarAlerta}
          marcarSeleccionadasComoLeidas={marcarSeleccionadasComoLeidas}
          eliminarSeleccionadas={eliminarSeleccionadas}
          getIconoTipo={getIconoTipo}
          getColorTipo={getColorTipo}
          getIconoNivel={getIconoNivel}
          getColorNivel={getColorNivel}
          getBgColorNivel={getBgColorNivel}
          formatearFecha={formatearFecha}
        />
      )}
      
      {activeTab === 'configuracion' && (
        <ConfiguracionAlertas 
          configuracion={configuracionAlertas}
          setConfiguracion={setConfiguracionAlertas}
        />
      )}
      
      {activeTab === 'historial' && (
        <HistorialAlertas 
          alertas={alertas}
          tiposAlerta={tiposAlerta}
          nivelesAlerta={nivelesAlerta}
        />
      )}

      {/* Modal Nueva Alerta */}
      {showModalNuevaAlerta && (
        <NuevaAlertaModal
          onClose={() => setShowModalNuevaAlerta(false)}
          onCrear={(nuevaAlerta) => {
            setAlertas(prev => [nuevaAlerta, ...prev]);
            setShowModalNuevaAlerta(false);
          }}
          tiposAlerta={tiposAlerta}
          nivelesAlerta={nivelesAlerta}
        />
      )}

      {/* Modal Configuración */}
      {showModalConfig && (
        <ConfiguracionModal
          configuracion={configuracionAlertas}
          onClose={() => setShowModalConfig(false)}
          onGuardar={(config) => {
            setConfiguracionAlertas(config);
            setShowModalConfig(false);
          }}
        />
      )}
    </div>
  );
};

// Dashboard de Alertas
interface DashboardAlertasProps {
  estadisticas: any;
  alertasRecientes: Alerta[];
  tiposAlerta: any[];
  nivelesAlerta: any[];
  getIconoTipo: (tipo: string) => any;
  getColorTipo: (tipo: string) => string;
  getIconoNivel: (nivel: string) => any;
  getColorNivel: (nivel: string) => string;
  formatearFecha: (fecha: Date) => string;
}

const DashboardAlertas: React.FC<DashboardAlertasProps> = ({
  estadisticas,
  alertasRecientes,
  tiposAlerta,
  nivelesAlerta,
  getIconoTipo,
  getColorTipo,
  getIconoNivel,
  getColorNivel,
  formatearFecha,
}) => {
  return (
    <div className="space-y-6">
      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Alertas</p>
              <p className="text-3xl font-bold text-gray-900">{estadisticas.total}</p>
              <p className="text-sm text-gray-500 mt-1">Todas las alertas</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">No Leídas</p>
              <p className="text-3xl font-bold text-red-600">{estadisticas.noLeidas}</p>
              <p className="text-sm text-gray-500 mt-1">Requieren atención</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Críticas</p>
              <p className="text-3xl font-bold text-red-600">{estadisticas.criticas}</p>
              <p className="text-sm text-gray-500 mt-1">Nivel error</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertOctagon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hoy</p>
              <p className="text-3xl font-bold text-blue-600">{estadisticas.hoy}</p>
              <p className="text-sm text-gray-500 mt-1">Alertas de hoy</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por Nivel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución por Nivel</h3>
          <div className="space-y-4">
            {nivelesAlerta.map((nivel) => {
              const Icon = nivel.icon;
              const cantidad = estadisticas[nivel.id === 'error' ? 'criticas' : 
                                          nivel.id === 'warning' ? 'advertencias' :
                                          nivel.id === 'info' ? 'informativas' : 'exitosas'];
              const porcentaje = estadisticas.total > 0 ? (cantidad / estadisticas.total * 100).toFixed(1) : 0;
              
              return (
                <div key={nivel.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 ${nivel.bgColor} rounded-lg mr-3`}>
                      <Icon className={`h-4 w-4 ${nivel.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{nivel.label}</p>
                      <p className="text-sm text-gray-500">{cantidad} alertas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{porcentaje}%</p>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${nivel.color.replace('text-', 'bg-')}`}
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tipos de Alertas Más Frecuentes</h3>
          <div className="space-y-3">
            {tiposAlerta.slice(0, 6).map((tipo, index) => {
              const Icon = tipo.icon;
              return (
                <div key={tipo.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className={`h-4 w-4 ${tipo.color} mr-3`} />
                    <span className="text-sm font-medium text-gray-900">{tipo.label}</span>
                  </div>
                  <span className="text-sm text-gray-500">{Math.floor(Math.random() * 10) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alertas Recientes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Alertas Recientes</h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Ver todas
          </button>
        </div>
        <div className="space-y-4">
          {alertasRecientes.map((alerta) => {
            const IconoTipo = getIconoTipo(alerta.tipo);
            const IconoNivel = getIconoNivel(alerta.nivel);
            
            return (
              <div key={alerta.id} className={`flex items-start space-x-3 p-3 rounded-lg border ${
                !alerta.leida ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex-shrink-0">
                  <IconoNivel className={`h-5 w-5 ${getColorNivel(alerta.nivel)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${!alerta.leida ? 'text-gray-900' : 'text-gray-700'}`}>
                      {alerta.titulo}
                    </p>
                    <span className="text-xs text-gray-500">{formatearFecha(alerta.fechaCreacion)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alerta.descripcion}</p>
                  <div className="flex items-center mt-2">
                    <IconoTipo className={`h-3 w-3 ${getColorTipo(alerta.tipo)} mr-1`} />
                    <span className="text-xs text-gray-500 capitalize">{alerta.tipo.replace('_', ' ')}</span>
                  </div>
                </div>
                {!alerta.leida && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Estado del Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Estado del Sistema</h4>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Servidor Principal</span>
              <span className="text-sm font-medium text-green-600">Operativo</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Base de Datos</span>
              <span className="text-sm font-medium text-green-600">Operativo</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sensores IoT</span>
              <span className="text-sm font-medium text-yellow-600">2 Desconectados</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Rendimiento</h4>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CPU</span>
              <span className="text-sm font-medium text-green-600">45%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Memoria</span>
              <span className="text-sm font-medium text-green-600">62%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Disco</span>
              <span className="text-sm font-medium text-yellow-600">78%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Conectividad</h4>
            <Wifi className="h-4 w-4 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Internet</span>
              <span className="text-sm font-medium text-green-600">Estable</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Red Interna</span>
              <span className="text-sm font-medium text-green-600">Estable</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">VPN</span>
              <span className="text-sm font-medium text-green-600">Conectado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Gestión de Alertas
interface GestionAlertasProps {
  alertas: Alerta[];
  filtroTipo: string;
  setFiltroTipo: (tipo: string) => void;
  filtroNivel: string;
  setFiltroNivel: (nivel: string) => void;
  filtroEstado: string;
  setFiltroEstado: (estado: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedAlertas: string[];
  setSelectedAlertas: (alertas: string[]) => void;
  tiposAlerta: any[];
  nivelesAlerta: any[];
  marcarComoLeida: (id: string) => void;
  marcarComoNoLeida: (id: string) => void;
  eliminarAlerta: (id: string) => void;
  marcarSeleccionadasComoLeidas: () => void;
  eliminarSeleccionadas: () => void;
  getIconoTipo: (tipo: string) => any;
  getColorTipo: (tipo: string) => string;
  getIconoNivel: (nivel: string) => any;
  getColorNivel: (nivel: string) => string;
  getBgColorNivel: (nivel: string) => string;
  formatearFecha: (fecha: Date) => string;
}

const GestionAlertas: React.FC<GestionAlertasProps> = ({
  alertas,
  filtroTipo,
  setFiltroTipo,
  filtroNivel,
  setFiltroNivel,
  filtroEstado,
  setFiltroEstado,
  searchTerm,
  setSearchTerm,
  selectedAlertas,
  setSelectedAlertas,
  tiposAlerta,
  nivelesAlerta,
  marcarComoLeida,
  marcarComoNoLeida,
  eliminarAlerta,
  marcarSeleccionadasComoLeidas,
  eliminarSeleccionadas,
  getIconoTipo,
  getColorTipo,
  getIconoNivel,
  getColorNivel,
  getBgColorNivel,
  formatearFecha,
}) => {
  const toggleSeleccionAlerta = (alertaId: string) => {
    setSelectedAlertas(prev => 
      prev.includes(alertaId) 
        ? prev.filter(id => id !== alertaId)
        : [...prev, alertaId]
    );
  };

  const seleccionarTodas = () => {
    setSelectedAlertas(alertas.map(a => a.id));
  };

  const deseleccionarTodas = () => {
    setSelectedAlertas([]);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
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
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
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
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Alertas ({alertas.length})
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
          {alertas.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron alertas con los filtros aplicados</p>
            </div>
          ) : (
            alertas.map((alerta) => {
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
    </div>
  );
};

// Configuración de Alertas
interface ConfiguracionAlertasProps {
  configuracion: any;
  setConfiguracion: (config: any) => void;
}

const ConfiguracionAlertas: React.FC<ConfiguracionAlertasProps> = ({
  configuracion,
  setConfiguracion,
}) => {
  const actualizarConfiguracion = (campo: string, valor: any) => {
    setConfiguracion(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const actualizarAlertaAutomatica = (tipo: string, campo: string, valor: any) => {
    setConfiguracion(prev => ({
      ...prev,
      alertasAutomaticas: {
        ...prev.alertasAutomaticas,
        [tipo]: {
          ...prev.alertasAutomaticas[tipo],
          [campo]: valor
        }
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Configuración General */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frecuencia de verificación (minutos)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={configuracion.frecuenciaVerificacion}
              onChange={(e) => actualizarConfiguracion('frecuenciaVerificacion', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Días de retención de alertas
            </label>
            <input
              type="number"
              min="7"
              max="365"
              value={configuracion.diasRetencion}
              onChange={(e) => actualizarConfiguracion('diasRetencion', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Configuración de Notificaciones */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notificaciones</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Notificaciones por Email</p>
                <p className="text-sm text-gray-500">Recibir alertas por correo electrónico</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={configuracion.notificacionesEmail}
                onChange={(e) => actualizarConfiguracion('notificacionesEmail', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Smartphone className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Notificaciones SMS</p>
                <p className="text-sm text-gray-500">Recibir alertas críticas por SMS</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={configuracion.notificacionesSMS}
                onChange={(e) => actualizarConfiguracion('notificacionesSMS', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Notificaciones Push</p>
                <p className="text-sm text-gray-500">Notificaciones en el navegador</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={configuracion.notificacionesPush}
                onChange={(e) => actualizarConfiguracion('notificacionesPush', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Volume2 className="h-5 w-5 text-orange-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Sonido de Alertas</p>
                <p className="text-sm text-gray-500">Reproducir sonido para alertas críticas</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={configuracion.sonidoAlertas}
                onChange={(e) => actualizarConfiguracion('sonidoAlertas', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Monitor className="h-5 w-5 text-indigo-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Alertas de Escritorio</p>
                <p className="text-sm text-gray-500">Mostrar notificaciones en el escritorio</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={configuracion.alertasEscritorio}
                onChange={(e) => actualizarConfiguracion('alertasEscritorio', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Alertas Automáticas */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Alertas Automáticas</h3>
        <div className="space-y-6">
          {/* Vencimiento */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-orange-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Alertas de Vencimiento</p>
                  <p className="text-sm text-gray-500">Notificar cuando las vacunas estén próximas a vencer</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={configuracion.alertasAutomaticas.vencimiento.activo}
                  onChange={(e) => actualizarAlertaAutomatica('vencimiento', 'activo', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {configuracion.alertasAutomaticas.vencimiento.activo && (
              <div className="ml-8">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Días de anticipación
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={configuracion.alertasAutomaticas.vencimiento.diasAnticipacion}
                  onChange={(e) => actualizarAlertaAutomatica('vencimiento', 'diasAnticipacion', parseInt(e.target.value))}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Stock Bajo */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Alertas de Stock Bajo</p>
                  <p className="text-sm text-gray-500">Notificar cuando el stock esté por debajo del mínimo</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={configuracion.alertasAutomaticas.stockBajo.activo}
                  onChange={(e) => actualizarAlertaAutomatica('stockBajo', 'activo', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {configuracion.alertasAutomaticas.stockBajo.activo && (
              <div className="ml-8">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Porcentaje mínimo (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={configuracion.alertasAutomaticas.stockBajo.porcentajeMinimo}
                  onChange={(e) => actualizarAlertaAutomatica('stockBajo', 'porcentajeMinimo', parseInt(e.target.value))}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Temperatura */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Thermometer className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Alertas de Temperatura</p>
                  <p className="text-sm text-gray-500">Notificar cuando la temperatura esté fuera del rango</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={configuracion.alertasAutomaticas.temperaturaFuera.activo}
                  onChange={(e) => actualizarAlertaAutomatica('temperaturaFuera', 'activo', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {configuracion.alertasAutomaticas.temperaturaFuera.activo && (
              <div className="ml-8">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tolerancia (°C)
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={configuracion.alertasAutomaticas.temperaturaFuera.tolerancia}
                  onChange={(e) => actualizarAlertaAutomatica('temperaturaFuera', 'tolerancia', parseFloat(e.target.value))}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Seguridad */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Alertas de Seguridad</p>
                  <p className="text-sm text-gray-500">Notificar intentos de acceso no autorizados</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={configuracion.alertasAutomaticas.accesosNoAutorizados.activo}
                  onChange={(e) => actualizarAlertaAutomatica('accesosNoAutorizados', 'activo', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {configuracion.alertasAutomaticas.accesosNoAutorizados.activo && (
              <div className="ml-8">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intentos máximos
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={configuracion.alertasAutomaticas.accesosNoAutorizados.intentosMaximos}
                  onChange={(e) => actualizarAlertaAutomatica('accesosNoAutorizados', 'intentosMaximos', parseInt(e.target.value))}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-end space-x-3">
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Restablecer
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Guardar Configuración
        </button>
      </div>
    </div>
  );
};

// Historial de Alertas
interface HistorialAlertasProps {
  alertas: Alerta[];
  tiposAlerta: any[];
  nivelesAlerta: any[];
}

const HistorialAlertas: React.FC<HistorialAlertasProps> = ({
  alertas,
  tiposAlerta,
  nivelesAlerta,
}) => {
  const [filtroFecha, setFiltroFecha] = useState('7'); // días
  const [filtroTipoHistorial, setFiltroTipoHistorial] = useState('todos');

  const alertasFiltradas = alertas.filter(alerta => {
    const diasAtras = parseInt(filtroFecha);
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasAtras);
    
    const cumpleFecha = alerta.fechaCreacion >= fechaLimite;
    const cumpleTipo = filtroTipoHistorial === 'todos' || alerta.tipo === filtroTipoHistorial;
    
    return cumpleFecha && cumpleTipo;
  });

  const estadisticasHistorial = {
    totalPeriodo: alertasFiltradas.length,
    promedioDiario: Math.round(alertasFiltradas.length / parseInt(filtroFecha)),
    tipoMasFrecuente: tiposAlerta.reduce((max, tipo) => {
      const cantidad = alertasFiltradas.filter(a => a.tipo === tipo.id).length;
      return cantidad > max.cantidad ? { tipo: tipo.label, cantidad } : max;
    }, { tipo: '', cantidad: 0 }),
  };

  return (
    <div className="space-y-6">
      {/* Filtros de Historial */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
            <select
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">Último día</option>
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 3 meses</option>
              <option value="365">Último año</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Alerta</label>
            <select
              value={filtroTipoHistorial}
              onChange={(e) => setFiltroTipoHistorial(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los tipos</option>
              {tiposAlerta.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>{tipo.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas del Historial */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total en Período</p>
              <p className="text-3xl font-bold text-blue-600">{estadisticasHistorial.totalPeriodo}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Promedio Diario</p>
              <p className="text-3xl font-bold text-green-600">{estadisticasHistorial.promedioDiario}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tipo Más Frecuente</p>
              <p className="text-lg font-bold text-purple-600">{estadisticasHistorial.tipoMasFrecuente.tipo}</p>
              <p className="text-sm text-gray-500">{estadisticasHistorial.tipoMasFrecuente.cantidad} alertas</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Gráfico de Tendencias */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tendencia de Alertas</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Gráfico de tendencias de alertas por día</p>
            <p className="text-sm text-gray-400">Funcionalidad disponible en próxima versión</p>
          </div>
        </div>
      </div>

      {/* Distribución por Tipo */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución por Tipo de Alerta</h3>
        <div className="space-y-3">
          {tiposAlerta.map((tipo) => {
            const cantidad = alertasFiltradas.filter(a => a.tipo === tipo.id).length;
            const porcentaje = alertasFiltradas.length > 0 ? (cantidad / alertasFiltradas.length * 100).toFixed(1) : 0;
            const Icon = tipo.icon;
            
            return (
              <div key={tipo.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon className={`h-4 w-4 ${tipo.color} mr-3`} />
                  <span className="text-sm font-medium text-gray-900">{tipo.label}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{cantidad}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${tipo.color.replace('text-', 'bg-')}`}
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">{porcentaje}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Acciones de Exportación */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Exportar Historial</h3>
        <div className="flex space-x-4">
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Exportar a Excel
          </button>
          <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <FileText className="h-4 w-4 mr-2" />
            Exportar a PDF
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Mail className="h-4 w-4 mr-2" />
            Enviar Reporte
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal Nueva Alerta
interface NuevaAlertaModalProps {
  onClose: () => void;
  onCrear: (alerta: Alerta) => void;
  tiposAlerta: any[];
  nivelesAlerta: any[];
}

const NuevaAlertaModal: React.FC<NuevaAlertaModalProps> = ({
  onClose,
  onCrear,
  tiposAlerta,
  nivelesAlerta,
}) => {
  const [formData, setFormData] = useState({
    tipo: 'sistema',
    nivel: 'info',
    titulo: '',
    descripcion: '',
    usuarioId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nuevaAlerta: Alerta = {
      id: Date.now().toString(),
      tipo: formData.tipo as any,
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      nivel: formData.nivel as any,
      fechaCreacion: new Date(),
      leida: false,
      usuarioId: formData.usuarioId || undefined,
      parametros: {},
    };

    onCrear(nuevaAlerta);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full m-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Crear Nueva Alerta</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select
                  required
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {tiposAlerta.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>{tipo.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nivel *</label>
                <select
                  required
                  value={formData.nivel}
                  onChange={(e) => setFormData({...formData, nivel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {nivelesAlerta.map((nivel) => (
                    <option key={nivel.id} value={nivel.id}>{nivel.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input
                type="text"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Título descriptivo de la alerta"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
              <textarea
                required
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción detallada de la alerta"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario Responsable</label>
              <input
                type="text"
                value={formData.usuarioId}
                onChange={(e) => setFormData({...formData, usuarioId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ID del usuario responsable (opcional)"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Alerta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Modal Configuración
interface ConfiguracionModalProps {
  configuracion: any;
  onClose: () => void;
  onGuardar: (config: any) => void;
}

const ConfiguracionModal: React.FC<ConfiguracionModalProps> = ({
  configuracion,
  onClose,
  onGuardar,
}) => {
  const [config, setConfig] = useState(configuracion);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar(config);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuración Rápida de Alertas</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Configuración General</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frecuencia de verificación (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={config.frecuenciaVerificacion}
                      onChange={(e) => setConfig({...config, frecuenciaVerificacion: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Días de retención
                    </label>
                    <input
                      type="number"
                      min="7"
                      max="365"
                      value={config.diasRetencion}
                      onChange={(e) => setConfig({...config, diasRetencion: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Notificaciones</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.notificacionesEmail}
                      onChange={(e) => setConfig({...config, notificacionesEmail: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Notificaciones por Email</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.notificacionesPush}
                      onChange={(e) => setConfig({...config, notificacionesPush: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Notificaciones Push</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.sonidoAlertas}
                      onChange={(e) => setConfig({...config, sonidoAlertas: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Sonido de Alertas</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Guardar Configuración
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Alertas;