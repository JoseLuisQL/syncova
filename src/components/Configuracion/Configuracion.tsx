import React, { useState } from 'react';
import {
  Settings,
  Database,
  Shield,
  Bell,
  Mail,
  Thermometer,
  Calendar,
  FileText,
  Users,
  Building2,
  Package,
  Download,
  Upload,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  EyeOff,
  Key,
  Lock,
  Unlock,
  Server,
  HardDrive,
  Wifi,
  Monitor,
  Clock,
  Globe,
  Smartphone,
  Printer,
  Camera,
  Zap,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  Target,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  RotateCcw,
  Power,
  Pause,
  Play,
  StopCircle,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Palette,
  Type,
  Layout,
  Grid,
  List,
  Maximize,
  Minimize,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  HelpCircle,
  BookOpen,
  MessageSquare,
  Phone,
  MapPin,
  Link,
  QrCode,
  Scan,
  Fingerprint,
  CreditCard,
  Wallet,
  DollarSign,
  Euro,
  PoundSterling,
  Percent,
  Calculator,
  Ruler,
  Weight,
  Gauge,
  Speedometer,
  Timer,
  Stopwatch,
  Hourglass,
  CloudUpload,
  CloudDownload,
  Cloud,
  CloudOff,
  Folder,
  FolderOpen,
  File,
  FileCheck,
  FilePlus,
  FileX,
  Archive,
  Paperclip,
  Tag,
  Tags,
  Bookmark,
  Star,
  Heart,
  ThumbsUp,
  Flag,
  Award,
  Trophy,
  Medal,
  Gift,
  Crown,
  Diamond,
  Gem,
  Coins,
  Banknote,
  Receipt,
  ShoppingCart,
  ShoppingBag,
  Store,
  Storefront,
  Home,
  Office,
  Factory,
  Warehouse,
  Truck,
  Car,
  Bus,
  Train,
  Plane,
  Ship,
  Bike,
  Scooter,
  Fuel,
  Battery,
  BatteryLow,
  Plug,
  Cable,
  Usb,
  HardDisk,
  MemoryStick,
  SdCard,
  Cpu,
  Microchip,
  CircuitBoard,
  Router,
  Modem,
  Antenna,
  Signal,
  SignalHigh,
  SignalLow,
  SignalZero,
  Radio,
  Tv,
  Speaker,
  Headphones,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Image,
  Images,
  Film,
  Music,
  Music2,
  Music3,
  Music4,
  Disc,
  Disc2,
  Disc3,
  PlayCircle,
  PauseCircle,
  Square,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Repeat,
  Repeat1,
  Shuffle,
  Volume,
  Volume1,
  VolumeX as VolumeOff,
  Brightness,
  BrightnessDown,
  BrightnessUp,
  Contrast,
  Saturation,
  Hue,
  Layers,
  Layers2,
  Layers3,
  Move,
  Move3d,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Scissors,
  PaintBucket,
  Brush,
  Pen,
  PenTool,
  Pencil,
  Eraser,
  Highlighter,
  Marker,
  Stamp,
  Sticker,
  Shapes,
  Circle,
  Square as SquareShape,
  Triangle,
  Hexagon,
  Octagon,
  Pentagon,
  Star as StarShape,
  Heart as HeartShape,
  Diamond as DiamondShape,
  Spade,
  Club,
  Hash,
  AtSign,
  Ampersand,
  Asterisk,
  Slash,
  Backslash,
  Pipe,
  Tilde,
  Caret,
  Underscore,
  Minus,
  Equal,
  Plus as PlusSign,
  Divide,
  Multiply,
  Infinity,
  Pi,
  Sigma,
  Alpha,
  Beta,
  Gamma,
  Delta,
  Omega,
  Mu,
  Lambda,
  Theta,
  Phi,
  Psi,
  Chi,
  Rho,
  Tau,
  Epsilon,
  Zeta,
  Eta,
  Iota,
  Kappa,
  Nu,
  Xi,
  Omicron,
  Upsilon,
} from 'lucide-react';

const Configuracion: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'sistema' | 'seguridad' | 'notificaciones' | 'integraciones' | 'respaldos' | 'mantenimiento' | 'avanzado'>('general');
  const [showPassword, setShowPassword] = useState(false);
  const [configuraciones, setConfiguraciones] = useState({
    // Configuraciones Generales
    general: {
      nombreSistema: 'SIVAC - Sistema de Gestión de Vacunas',
      nombreInstitucion: 'DIRESA Apurímac II',
      logoUrl: '',
      direccion: 'Jr. Lima 123, Andahuaylas, Apurímac',
      telefono: '+51 983 456 789',
      email: 'contacto@saludapurimac.gob.pe',
      sitioWeb: 'https://www.saludapurimac.gob.pe',
      timezone: 'America/Lima',
      idioma: 'es',
      moneda: 'PEN',
      formatoFecha: 'DD/MM/YYYY',
      formatoHora: '24h',
    },
    // Configuraciones del Sistema
    sistema: {
      versionSistema: '2.1.0',
      entornoEjecucion: 'produccion',
      modoMantenimiento: false,
      registroAuditoria: true,
      nivelLog: 'info',
      maxUsuariosConcurrentes: 50,
      tiempoSesion: 480, // minutos
      autoGuardado: true,
      intervalAutoGuardado: 5, // minutos
      compresionDatos: true,
      cacheDatos: true,
      tiempoCacheMinutos: 30,
    },
    // Configuraciones de Seguridad
    seguridad: {
      autenticacionDosFactor: false,
      longitudMinimaPassword: 8,
      complejidadPassword: true,
      expiracionPassword: 90, // días
      intentosMaximoLogin: 5,
      tiempoBloqueoMinutos: 30,
      sesionUnica: false,
      encriptacionDatos: true,
      auditoriaSesiones: true,
      notificacionAccesoSospechoso: true,
      ipPermitidas: '',
      horarioAcceso: {
        habilitado: false,
        horaInicio: '06:00',
        horaFin: '22:00',
        diasSemana: [1, 2, 3, 4, 5], // Lunes a Viernes
      },
    },
    // Configuraciones de Notificaciones
    notificaciones: {
      emailHabilitado: true,
      smsHabilitado: false,
      notificacionesWeb: true,
      alertasVencimiento: true,
      diasAvisoVencimiento: 30,
      alertasStockBajo: true,
      porcentajeStockBajo: 20,
      alertasDiscrepancias: true,
      notificacionesMantenimiento: true,
      frecuenciaReportes: 'semanal',
      horaEnvioReportes: '08:00',
      destinatariosReportes: ['coordinador@saludapurimac.gob.pe'],
    },
    // Configuraciones de Integraciones
    integraciones: {
      apiMinsa: {
        habilitado: false,
        url: 'https://api.minsa.gob.pe/v1',
        token: '',
        sincronizacionAutomatica: false,
        intervalSincronizacion: 60, // minutos
      },
      apiReniec: {
        habilitado: false,
        url: 'https://api.reniec.gob.pe/v1',
        token: '',
      },
      apiSunat: {
        habilitado: false,
        url: 'https://api.sunat.gob.pe/v1',
        token: '',
      },
      sistemaExterno: {
        habilitado: false,
        nombre: '',
        url: '',
        token: '',
        metodoAuth: 'bearer',
      },
    },
    // Configuraciones de Respaldos
    respaldos: {
      respaldoAutomatico: true,
      frecuenciaRespaldo: 'diario',
      horaRespaldo: '02:00',
      retencionDias: 30,
      ubicacionRespaldo: '/backups/sivac',
      compresionRespaldo: true,
      encriptacionRespaldo: true,
      notificarRespaldo: true,
      respaldoRemoto: false,
      servidorRemoto: '',
      credencialesRemotas: '',
    },
    // Configuraciones de Mantenimiento
    mantenimiento: {
      limpiezaAutomatica: true,
      frecuenciaLimpieza: 'semanal',
      diasRetencionLogs: 90,
      optimizacionBD: true,
      frecuenciaOptimizacion: 'mensual',
      verificacionIntegridad: true,
      actualizacionesAutomaticas: false,
      ventanaMantenimiento: {
        habilitado: true,
        horaInicio: '01:00',
        horaFin: '05:00',
        diasSemana: [0], // Domingo
      },
    },
    // Configuraciones Avanzadas
    avanzado: {
      modoDesarrollador: false,
      debugHabilitado: false,
      perfilRendimiento: false,
      metricsHabilitado: true,
      rateLimitingHabilitado: true,
      requestsPorMinuto: 100,
      conexionesBDMaximas: 20,
      timeoutConexionSegundos: 30,
      poolConexiones: true,
      cacheRedis: false,
      urlRedis: '',
      clusterHabilitado: false,
      nodosPrimarios: 1,
      nodosSecundarios: 0,
    },
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Settings, description: 'Configuración básica del sistema' },
    { id: 'sistema', label: 'Sistema', icon: Server, description: 'Parámetros de funcionamiento' },
    { id: 'seguridad', label: 'Seguridad', icon: Shield, description: 'Políticas de seguridad y acceso' },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell, description: 'Alertas y comunicaciones' },
    { id: 'integraciones', label: 'Integraciones', icon: Link, description: 'APIs y sistemas externos' },
    { id: 'respaldos', label: 'Respaldos', icon: Database, description: 'Copias de seguridad automáticas' },
    { id: 'mantenimiento', label: 'Mantenimiento', icon: RefreshCw, description: 'Tareas de mantenimiento' },
    { id: 'avanzado', label: 'Avanzado', icon: Zap, description: 'Configuraciones técnicas avanzadas' },
  ];

  const handleSaveConfiguration = (seccion: string) => {
    // Simular guardado de configuración
    console.log(`Guardando configuración de ${seccion}:`, configuraciones[seccion as keyof typeof configuraciones]);
    alert(`✅ Configuración de ${seccion} guardada exitosamente`);
  };

  const handleResetConfiguration = (seccion: string) => {
    if (window.confirm(`¿Está seguro de restablecer la configuración de ${seccion} a los valores por defecto?`)) {
      // Aquí se restablecerían los valores por defecto
      alert(`🔄 Configuración de ${seccion} restablecida a valores por defecto`);
    }
  };

  const handleExportConfiguration = () => {
    const dataStr = JSON.stringify(configuraciones, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `sivac-config-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportConfiguration = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const config = JSON.parse(e.target?.result as string);
            setConfiguraciones(config);
            alert('✅ Configuración importada exitosamente');
          } catch (error) {
            alert('❌ Error al importar la configuración. Verifique el formato del archivo.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const updateConfiguration = (seccion: string, campo: string, valor: any) => {
    setConfiguraciones(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion as keyof typeof prev],
        [campo]: valor
      }
    }));
  };

  const updateNestedConfiguration = (seccion: string, subseccion: string, campo: string, valor: any) => {
    setConfiguraciones(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion as keyof typeof prev],
        [subseccion]: {
          ...(prev[seccion as keyof typeof prev] as any)[subseccion],
          [campo]: valor
        }
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Configuración del Sistema</h2>
          <p className="text-gray-600 mt-1">Administre todas las configuraciones y parámetros del sistema SIVAC</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleImportConfiguration}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar Config
          </button>
          <button
            onClick={handleExportConfiguration}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Config
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div>{tab.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <ConfiguracionGeneral 
              config={configuraciones.general}
              onUpdate={(campo, valor) => updateConfiguration('general', campo, valor)}
              onSave={() => handleSaveConfiguration('general')}
              onReset={() => handleResetConfiguration('general')}
            />
          )}
          
          {activeTab === 'sistema' && (
            <ConfiguracionSistema 
              config={configuraciones.sistema}
              onUpdate={(campo, valor) => updateConfiguration('sistema', campo, valor)}
              onSave={() => handleSaveConfiguration('sistema')}
              onReset={() => handleResetConfiguration('sistema')}
            />
          )}
          
          {activeTab === 'seguridad' && (
            <ConfiguracionSeguridad 
              config={configuraciones.seguridad}
              onUpdate={(campo, valor) => updateConfiguration('seguridad', campo, valor)}
              onUpdateNested={(subseccion, campo, valor) => updateNestedConfiguration('seguridad', subseccion, campo, valor)}
              onSave={() => handleSaveConfiguration('seguridad')}
              onReset={() => handleResetConfiguration('seguridad')}
            />
          )}
          
          {activeTab === 'notificaciones' && (
            <ConfiguracionNotificaciones 
              config={configuraciones.notificaciones}
              onUpdate={(campo, valor) => updateConfiguration('notificaciones', campo, valor)}
              onSave={() => handleSaveConfiguration('notificaciones')}
              onReset={() => handleResetConfiguration('notificaciones')}
            />
          )}
          
          {activeTab === 'integraciones' && (
            <ConfiguracionIntegraciones 
              config={configuraciones.integraciones}
              onUpdateNested={(subseccion, campo, valor) => updateNestedConfiguration('integraciones', subseccion, campo, valor)}
              onSave={() => handleSaveConfiguration('integraciones')}
              onReset={() => handleResetConfiguration('integraciones')}
            />
          )}
          
          {activeTab === 'respaldos' && (
            <ConfiguracionRespaldos 
              config={configuraciones.respaldos}
              onUpdate={(campo, valor) => updateConfiguration('respaldos', campo, valor)}
              onSave={() => handleSaveConfiguration('respaldos')}
              onReset={() => handleResetConfiguration('respaldos')}
            />
          )}
          
          {activeTab === 'mantenimiento' && (
            <ConfiguracionMantenimiento 
              config={configuraciones.mantenimiento}
              onUpdate={(campo, valor) => updateConfiguration('mantenimiento', campo, valor)}
              onUpdateNested={(subseccion, campo, valor) => updateNestedConfiguration('mantenimiento', subseccion, campo, valor)}
              onSave={() => handleSaveConfiguration('mantenimiento')}
              onReset={() => handleResetConfiguration('mantenimiento')}
            />
          )}
          
          {activeTab === 'avanzado' && (
            <ConfiguracionAvanzada 
              config={configuraciones.avanzado}
              onUpdate={(campo, valor) => updateConfiguration('avanzado', campo, valor)}
              onSave={() => handleSaveConfiguration('avanzado')}
              onReset={() => handleResetConfiguration('avanzado')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de Configuración General
interface ConfiguracionGeneralProps {
  config: any;
  onUpdate: (campo: string, valor: any) => void;
  onSave: () => void;
  onReset: () => void;
}

const ConfiguracionGeneral: React.FC<ConfiguracionGeneralProps> = ({ config, onUpdate, onSave, onReset }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Configuración General</h3>
        <div className="flex space-x-3">
          <button
            onClick={onReset}
            className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restablecer
          </button>
          <button
            onClick={onSave}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del Sistema */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-600" />
            Información del Sistema
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Sistema
              </label>
              <input
                type="text"
                value={config.nombreSistema}
                onChange={(e) => onUpdate('nombreSistema', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Institución
              </label>
              <input
                type="text"
                value={config.nombreInstitucion}
                onChange={(e) => onUpdate('nombreInstitucion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL del Logo
              </label>
              <input
                type="url"
                value={config.logoUrl}
                onChange={(e) => onUpdate('logoUrl', e.target.value)}
                placeholder="https://ejemplo.com/logo.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Phone className="h-5 w-5 mr-2 text-green-600" />
            Información de Contacto
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <textarea
                value={config.direccion}
                onChange={(e) => onUpdate('direccion', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={config.telefono}
                onChange={(e) => onUpdate('telefono', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => onUpdate('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sitio Web
              </label>
              <input
                type="url"
                value={config.sitioWeb}
                onChange={(e) => onUpdate('sitioWeb', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Configuración Regional */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-purple-600" />
            Configuración Regional
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zona Horaria
              </label>
              <select
                value={config.timezone}
                onChange={(e) => onUpdate('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="America/Lima">América/Lima (UTC-5)</option>
                <option value="America/New_York">América/Nueva_York (UTC-5)</option>
                <option value="Europe/Madrid">Europa/Madrid (UTC+1)</option>
                <option value="Asia/Tokyo">Asia/Tokio (UTC+9)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma
              </label>
              <select
                value={config.idioma}
                onChange={(e) => onUpdate('idioma', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
                <option value="fr">Français</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moneda
              </label>
              <select
                value={config.moneda}
                onChange={(e) => onUpdate('moneda', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PEN">Sol Peruano (PEN)</option>
                <option value="USD">Dólar Americano (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">Libra Esterlina (GBP)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Formato de Fecha y Hora */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-orange-600" />
            Formato de Fecha y Hora
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato de Fecha
              </label>
              <select
                value={config.formatoFecha}
                onChange={(e) => onUpdate('formatoFecha', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (15/12/2024)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (12/15/2024)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-15)</option>
                <option value="DD-MM-YYYY">DD-MM-YYYY (15-12-2024)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato de Hora
              </label>
              <select
                value={config.formatoHora}
                onChange={(e) => onUpdate('formatoHora', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="24h">24 Horas (14:30)</option>
                <option value="12h">12 Horas (2:30 PM)</option>
              </select>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center">
                <Info className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800">
                  Vista previa: {new Date().toLocaleDateString('es-PE')} {new Date().toLocaleTimeString('es-PE')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Configuración del Sistema
interface ConfiguracionSistemaProps {
  config: any;
  onUpdate: (campo: string, valor: any) => void;
  onSave: () => void;
  onReset: () => void;
}

const ConfiguracionSistema: React.FC<ConfiguracionSistemaProps> = ({ config, onUpdate, onSave, onReset }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Configuración del Sistema</h3>
        <div className="flex space-x-3">
          <button
            onClick={onReset}
            className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restablecer
          </button>
          <button
            onClick={onSave}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del Sistema */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Server className="h-5 w-5 mr-2 text-blue-600" />
            Información del Sistema
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Versión del Sistema
              </label>
              <input
                type="text"
                value={config.versionSistema}
                onChange={(e) => onUpdate('versionSistema', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entorno de Ejecución
              </label>
              <select
                value={config.entornoEjecucion}
                onChange={(e) => onUpdate('entornoEjecucion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desarrollo">Desarrollo</option>
                <option value="pruebas">Pruebas</option>
                <option value="produccion">Producción</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Modo Mantenimiento
              </label>
              <button
                onClick={() => onUpdate('modoMantenimiento', !config.modoMantenimiento)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.modoMantenimiento ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.modoMantenimiento ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Configuración de Sesiones */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-green-600" />
            Configuración de Sesiones
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máximo Usuarios Concurrentes
              </label>
              <input
                type="number"
                value={config.maxUsuariosConcurrentes}
                onChange={(e) => onUpdate('maxUsuariosConcurrentes', parseInt(e.target.value))}
                min="1"
                max="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo de Sesión (minutos)
              </label>
              <input
                type="number"
                value={config.tiempoSesion}
                onChange={(e) => onUpdate('tiempoSesion', parseInt(e.target.value))}
                min="5"
                max="1440"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Registro de Auditoría
              </label>
              <button
                onClick={() => onUpdate('registroAuditoria', !config.registroAuditoria)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.registroAuditoria ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.registroAuditoria ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Configuración de Logs */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-purple-600" />
            Configuración de Logs
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Log
              </label>
              <select
                value={config.nivelLog}
                onChange={(e) => onUpdate('nivelLog', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Advertencia:</strong> El nivel Debug puede generar archivos de log muy grandes en producción.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuración de Rendimiento */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-orange-600" />
            Configuración de Rendimiento
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Auto Guardado
              </label>
              <button
                onClick={() => onUpdate('autoGuardado', !config.autoGuardado)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.autoGuardado ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.autoGuardado ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {config.autoGuardado && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intervalo Auto Guardado (minutos)
                </label>
                <input
                  type="number"
                  value={config.intervalAutoGuardado}
                  onChange={(e) => onUpdate('intervalAutoGuardado', parseInt(e.target.value))}
                  min="1"
                  max="60"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Compresión de Datos
              </label>
              <button
                onClick={() => onUpdate('compresionDatos', !config.compresionDatos)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.compresionDatos ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.compresionDatos ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Cache de Datos
              </label>
              <button
                onClick={() => onUpdate('cacheDatos', !config.cacheDatos)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.cacheDatos ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.cacheDatos ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {config.cacheDatos && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de Cache (minutos)
                </label>
                <input
                  type="number"
                  value={config.tiempoCacheMinutos}
                  onChange={(e) => onUpdate('tiempoCacheMinutos', parseInt(e.target.value))}
                  min="1"
                  max="1440"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Configuración de Seguridad
interface ConfiguracionSeguridadProps {
  config: any;
  onUpdate: (campo: string, valor: any) => void;
  onUpdateNested: (subseccion: string, campo: string, valor: any) => void;
  onSave: () => void;
  onReset: () => void;
}

const ConfiguracionSeguridad: React.FC<ConfiguracionSeguridadProps> = ({ config, onUpdate, onUpdateNested, onSave, onReset }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Configuración de Seguridad</h3>
        <div className="flex space-x-3">
          <button
            onClick={onReset}
            className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restablecer
          </button>
          <button
            onClick={onSave}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Políticas de Contraseñas */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Key className="h-5 w-5 mr-2 text-blue-600" />
            Políticas de Contraseñas
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitud Mínima de Contraseña
              </label>
              <input
                type="number"
                value={config.longitudMinimaPassword}
                onChange={(e) => onUpdate('longitudMinimaPassword', parseInt(e.target.value))}
                min="4"
                max="32"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Complejidad de Contraseña
              </label>
              <button
                onClick={() => onUpdate('complejidadPassword', !config.complejidadPassword)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.complejidadPassword ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.complejidadPassword ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiración de Contraseña (días)
              </label>
              <input
                type="number"
                value={config.expiracionPassword}
                onChange={(e) => onUpdate('expiracionPassword', parseInt(e.target.value))}
                min="0"
                max="365"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">0 = Sin expiración</p>
            </div>
            {config.complejidadPassword && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-sm text-blue-800">
                  <strong>Requisitos de complejidad:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Al menos una letra mayúscula</li>
                    <li>Al menos una letra minúscula</li>
                    <li>Al menos un número</li>
                    <li>Al menos un carácter especial</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Control de Acceso */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Lock className="h-5 w-5 mr-2 text-green-600" />
            Control de Acceso
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intentos Máximos de Login
              </label>
              <input
                type="number"
                value={config.intentosMaximoLogin}
                onChange={(e) => onUpdate('intentosMaximoLogin', parseInt(e.target.value))}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo de Bloqueo (minutos)
              </label>
              <input
                type="number"
                value={config.tiempoBloqueoMinutos}
                onChange={(e) => onUpdate('tiempoBloqueoMinutos', parseInt(e.target.value))}
                min="1"
                max="1440"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Sesión Única por Usuario
              </label>
              <button
                onClick={() => onUpdate('sesionUnica', !config.sesionUnica)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.sesionUnica ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.sesionUnica ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Autenticación de Dos Factores
              </label>
              <button
                onClick={() => onUpdate('autenticacionDosFactor', !config.autenticacionDosFactor)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.autenticacionDosFactor ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.autenticacionDosFactor ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Configuración de Datos */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-purple-600" />
            Protección de Datos
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Encriptación de Datos
              </label>
              <button
                onClick={() => onUpdate('encriptacionDatos', !config.encriptacionDatos)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.encriptacionDatos ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.encriptacionDatos ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Auditoría de Sesiones
              </label>
              <button
                onClick={() => onUpdate('auditoriaSesiones', !config.auditoriaSesiones)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.auditoriaSesiones ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.auditoriaSesiones ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Notificación Acceso Sospechoso
              </label>
              <button
                onClick={() => onUpdate('notificacionAccesoSospechoso', !config.notificacionAccesoSospechoso)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.notificacionAccesoSospechoso ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.notificacionAccesoSospechoso ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IPs Permitidas (separadas por comas)
              </label>
              <textarea
                value={config.ipPermitidas}
                onChange={(e) => onUpdate('ipPermitidas', e.target.value)}
                placeholder="192.168.1.1, 10.0.0.1, 172.16.0.1"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Dejar vacío para permitir todas las IPs</p>
            </div>
          </div>
        </div>

        {/* Horario de Acceso */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-orange-600" />
            Horario de Acceso
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Restricción de Horario
              </label>
              <button
                onClick={() => onUpdateNested('horarioAcceso', 'habilitado', !config.horarioAcceso.habilitado)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.horarioAcceso.habilitado ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.horarioAcceso.habilitado ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {config.horarioAcceso.habilitado && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de Inicio
                    </label>
                    <input
                      type="time"
                      value={config.horarioAcceso.horaInicio}
                      onChange={(e) => onUpdateNested('horarioAcceso', 'horaInicio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de Fin
                    </label>
                    <input
                      type="time"
                      value={config.horarioAcceso.horaFin}
                      onChange={(e) => onUpdateNested('horarioAcceso', 'horaFin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Días de la Semana
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          const diasActuales = [...config.horarioAcceso.diasSemana];
                          if (diasActuales.includes(index)) {
                            onUpdateNested('horarioAcceso', 'diasSemana', diasActuales.filter(d => d !== index));
                          } else {
                            onUpdateNested('horarioAcceso', 'diasSemana', [...diasActuales, index]);
                          }
                        }}
                        className={`px-2 py-1 text-xs rounded ${
                          config.horarioAcceso.diasSemana.includes(index)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {dia}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Configuración de Notificaciones
interface ConfiguracionNotificacionesProps {
  config: any;
  onUpdate: (campo: string, valor: any) => void;
  onSave: () => void;
  onReset: () => void;
}

const ConfiguracionNotificaciones: React.FC<ConfiguracionNotificacionesProps> = ({ config, onUpdate, onSave, onReset }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Configuración de Notificaciones</h3>
        <div className="flex space-x-3">
          <button
            onClick={onReset}
            className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restablecer
          </button>
          <button
            onClick={onSave}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Canales de Notificación */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-blue-600" />
            Canales de Notificación
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Notificaciones por Email
              </label>
              <button
                onClick={() => onUpdate('emailHabilitado', !config.emailHabilitado)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.emailHabilitado ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.emailHabilitado ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Notificaciones por SMS
              </label>
              <button
                onClick={() => onUpdate('smsHabilitado', !config.smsHabilitado)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.smsHabilitado ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.smsHabilitado ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Notificaciones Web
              </label>
              <button
                onClick={() => onUpdate('notificacionesWeb', !config.notificacionesWeb)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.notificacionesWeb ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.notificacionesWeb ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Alertas de Vencimiento */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
            Alertas de Vencimiento
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Alertas de Vencimiento
              </label>
              <button
                onClick={() => onUpdate('alertasVencimiento', !config.alertasVencimiento)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.alertasVencimiento ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.alertasVencimiento ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {config.alertasVencimiento && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días de Aviso Previo
                </label>
                <input
                  type="number"
                  value={config.diasAvisoVencimiento}
                  onChange={(e) => onUpdate('diasAvisoVencimiento', parseInt(e.target.value))}
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Alertas de Stock */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2 text-red-600" />
            Alertas de Stock
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Alertas de Stock Bajo
              </label>
              <button
                onClick={() => onUpdate('alertasStockBajo', !config.alertasStockBajo)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.alertasStockBajo ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.alertasStockBajo ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {config.alertasStockBajo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porcentaje de Stock Bajo (%)
                </label>
                <input
                  type="number"
                  value={config.porcentajeStockBajo}
                  onChange={(e) => onUpdate('porcentajeStockBajo', parseInt(e.target.value))}
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Alertas de Discrepancias
              </label>
              <button
                onClick={() => onUpdate('alertasDiscrepancias', !config.alertasDiscrepancias)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.alertasDiscrepancias ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.alertasDiscrepancias ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Reportes Automáticos */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-green-600" />
            Reportes Automáticos
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frecuencia de Reportes
              </label>
              <select
                value={config.frecuenciaReportes}
                onChange={(e) => onUpdate('frecuenciaReportes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="mensual">Mensual</option>
                <option value="trimestral">Trimestral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Envío
              </label>
              <input
                type="time"
                value={config.horaEnvioReportes}
                onChange={(e) => onUpdate('horaEnvioReportes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destinatarios (separados por comas)
              </label>
              <textarea
                value={config.destinatariosReportes.join(', ')}
                onChange={(e) => onUpdate('destinatariosReportes', e.target.value.split(',').map(email => email.trim()))}
                placeholder="email1@ejemplo.com, email2@ejemplo.com"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Notificaciones de Mantenimiento
              </label>
              <button
                onClick={() => onUpdate('notificacionesMantenimiento', !config.notificacionesMantenimiento)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.notificacionesMantenimiento ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.notificacionesMantenimiento ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Configuración de Integraciones
interface ConfiguracionIntegracionesProps {
  config: any;
  onUpdateNested: (subseccion: string, campo: string, valor: any) => void;
  onSave: () => void;
  onReset: () => void;
}

const ConfiguracionIntegraciones: React.FC<ConfiguracionIntegracionesProps> = ({ config, onUpdateNested, onSave, onReset }) => {
  const [showTokens, setShowTokens] = useState<{[key: string]: boolean}>({});

  const toggleTokenVisibility = (api: string) => {
    setShowTokens(prev => ({
      ...prev,
      [api]: !prev[api]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Configuración de Integraciones</h3>
        <div className="flex space-x-3">
          <button
            onClick={onReset}
            className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restablecer
          </button>
          <button
            onClick={onSave}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API MINSA */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-600" />
            API MINSA
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Integración Habilitada
              </label>
              <button
                onClick={() => onUpdateNested('apiMinsa', 'habilitado', !config.apiMinsa.habilitado)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.apiMinsa.habilitado ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.apiMinsa.habilitado ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {config.apiMinsa.habilitado && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de la API
                  </label>
                  <input
                    type="url"
                    value={config.apiMinsa.url}
                    onChange={(e) => onUpdateNested('apiMinsa', 'url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token de Acceso
                  </label>
                  <div className="relative">
                    <input
                      type={showTokens.apiMinsa ? "text" : "password"}
                      value={config.apiMinsa.token}
                      onChange={(e) => onUpdateNested('apiMinsa', 'token', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleTokenVisibility('apiMinsa')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showTokens.apiMinsa ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Sincronización Automática
                  </label>
                  <button
                    onClick={() => onUpdateNested('apiMinsa', 'sincronizacionAutomatica', !config.apiMinsa.sincronizacionAutomatica)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.apiMinsa.sincronizacionAutomatica ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.apiMinsa.sincronizacionAutomatica ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                {config.apiMinsa.sincronizacionAutomatica && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Intervalo de Sincronización (minutos)
                    </label>
                    <input
                      type="number"
                      value={config.apiMinsa.intervalSincronizacion}
                      onChange={(e) => onUpdateNested('apiMinsa', 'intervalSincronizacion', parseInt(e.target.value))}
                      min="5"
                      max="1440"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* API RENIEC */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-green-600" />
            API RENIEC
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Integración Habilitada
              </label>
              <button
                onClick={() => onUpdateNested('apiReniec', 'habilitado', !config.apiReniec.habilitado)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.apiReniec.habilitado ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.apiReniec.habilitado ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {config.apiReniec.habilitado && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de la API
                  </label>
                  <input
                    type="url"
                    value={config.apiReniec.url}
                    onChange={(e) => onUpdateNested('apiReniec', 'url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token de Acceso
                  </label>
                  <div className="relative">
                    <input
                      type={showTokens.apiReniec ? "text" : "password"}
                      value={config.apiReniec.token}
                      onChange={(e) => onUpdateNested('apiReniec', 'token', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleTokenVisibility('apiReniec')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showTokens.apiReniec ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* API SUNAT */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-purple-600" />
            API SUNAT
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Integración Habilitada
              </label>
              <button
                onClick={() => onUpdateNested('apiSunat', 'habilitado', !config.apiSunat.habilitado)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.apiSunat.habilitado ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.apiSunat.habilitado ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {config.apiSunat.habilitado && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de la API
                  </label>
                  <input
                    type="url"
                    value={config.apiSunat.url}
                    onChange={(e) => onUpdateNested('apiSunat', 'url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token de Acceso
                  </label>
                  <div className="relative">
                    <input
                      type={showTokens.apiSunat ? "text" : "password"}
                      value={config.apiSunat.token}
                      onChange={(e) => onUpdateNested('apiSunat', 'token', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleTokenVisibility('apiSunat')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showTokens.apiSunat ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sistema Externo */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Link className="h-5 w-5 mr-2 text-orange-600" />
            Sistema Externo
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Integración Habilitada
              </label>
              <button
                onClick={() => onUpdateNested('sistemaExterno', 'habilitado', !config.sistemaExterno.habilitado)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.sistemaExterno.habilitado ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.sistemaExterno.habilitado ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {config.sistemaExterno.habilitado && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Sistema
                  </label>
                  <input
                    type="text"
                    value={config.sistemaExterno.nombre}
                    onChange={(e) => onUpdateNested('sistemaExterno', 'nombre', e.target.value)}
                    placeholder="Ej: Sistema HIS"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de la API
                  </label>
                  <input
                    type="url"
                    value={config.sistemaExterno.url}
                    onChange={(e) => onUpdateNested('sistemaExterno', 'url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Autenticación
                  </label>
                  <select
                    value={config.sistemaExterno.metodoAuth}
                    onChange={(e) => onUpdateNested('sistemaExterno', 'metodoAuth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                    <option value="apikey">API Key</option>
                    <option value="oauth">OAuth 2.0</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token/Credenciales
                  </label>
                  <div className="relative">
                    <input
                      type={showTokens.sistemaExterno ? "text" : "password"}
                      value={config.sistemaExterno.token}
                      onChange={(e) => onUpdateNested('sistemaExterno', 'token', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleTokenVisibility('sistemaExterno')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showTokens.sistemaExterno ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Información de Seguridad */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Importante:</strong> Los tokens y credenciales se almacenan de forma encriptada. 
            Asegúrese de que las APIs externas estén configuradas correctamente y que los tokens tengan los permisos necesarios.
            Revise regularmente la validez de los tokens y renuévelos según las políticas de seguridad.
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Configuración de Respaldos
interface ConfiguracionRespaldosProps {
  config: any;
  onUpdate: (campo: string, valor: any) => void;
  onSave: () => void;
  onReset: () => void;
}

const ConfiguracionRespaldos: React.FC<ConfiguracionRespaldosProps> = ({ config, onUpdate, onSave, onReset }) => {
  const handleTestBackup = () => {
    alert('🔄 Iniciando prueba de respaldo...\n\nEsto puede tomar unos minutos.');
  };

  const handleRestoreBackup = () => {
    if (window.confirm('⚠️ ¿Está seguro de que desea restaurar desde un respaldo?\n\nEsta acción sobrescribirá los datos actuales.')) {
      alert('🔄 Proceso de restauración iniciado...');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Configuración de Respaldos</h3>
        <div className="flex space-x-3">
          <button
            onClick={handleTestBackup}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Play className="h-4 w-4 mr-2" />
            Probar Respaldo
          </button>
          <button
            onClick={handleRestoreBackup}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Restaurar
          </button>
          <button
            onClick={onReset}
            className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restablecer
          </button>
          <button
            onClick={onSave}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración Básica */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2 text-blue-600" />
            Configuración Básica
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Respaldo Automático
              </label>
              <button
                onClick={() => onUpdate('respaldoAutomatico', !config.respaldoAutomatico)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.respaldoAutomatico ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.respaldoAutomatico ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {config.respaldoAutomatico && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frecuencia de Respaldo
                  </label>
                  <select
                    value={config.frecuenciaRespaldo}
                    onChange={(e) => onUpdate('frecuenciaRespaldo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="diario">Diario</option>
                    <option value="semanal">Semanal</option>
                    <option value="mensual">Mensual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de Respaldo
                  </label>
                  <input
                    type="time"
                    value={config.horaRespaldo}
                    onChange={(e) => onUpdate('horaRespaldo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retención de Respaldos (días)
              </label>
              <input
                type="number"
                value={config.retencionDias}
                onChange={(e) => onUpdate('retencionDias', parseInt(e.target.value))}
                min="1"
                max="365"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Ubicación y Almacenamiento */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <HardDrive className="h-5 w-5 mr-2 text-green-600" />
            Ubicación y Almacenamiento
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación de Respaldo
              </label>
              <input
                type="text"
                value={config.ubicacionRespaldo}
                onChange={(e) => onUpdate('ubicacionRespaldo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Compresión de Respaldo
              </label>
              <button
                onClick={() => onUpdate('compresionRespaldo', !config.compresionRespaldo)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.compresionRespaldo ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.compresionRespaldo ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Encriptación de Respaldo
              </label>
              <button
                onClick={() => onUpdate('encriptacionRespaldo', !config.encriptacionRespaldo)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.encriptacionRespaldo ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.encriptacionRespaldo ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Notificar Respaldo Completado
              </label>
              <button
                onClick={() => onUpdate('notificarRespaldo', !config.notificarRespaldo)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.notificarRespaldo ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.notificarRespaldo ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Respaldo Remoto */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Cloud className="h-5 w-5 mr-2 text-purple-600" />
            Respaldo Remoto
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Respaldo Remoto Habilitado
              </label>
              <button
                onClick={() => onUpdate('respaldoRemoto', !config.respaldoRemoto)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.respaldoRemoto ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.respaldoRemoto ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {config.respaldoRemoto && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servidor Remoto
                  </label>
                  <input
                    type="text"
                    value={config.servidorRemoto}
                    onChange={(e) => onUpdate('servidorRemoto', e.target.value)}
                    placeholder="ftp://servidor.ejemplo.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credenciales Remotas
                  </label>
                  <input
                    type="password"
                    value={config.credencialesRemotas}
                    onChange={(e) => onUpdate('credencialesRemotas', e.target.value)}
                    placeholder="usuario:contraseña"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Estado de Respaldos */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-orange-600" />
            Estado de Respaldos
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Último Respaldo:</span>
              <span className="text-sm font-medium text-gray-900">15/12/2024 02:00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Estado:</span>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Exitoso
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Tamaño:</span>
              <span className="text-sm font-medium text-gray-900">2.4 GB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Próximo Respaldo:</span>
              <span className="text-sm font-medium text-gray-900">16/12/2024 02:00</span>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">Espacio Utilizado:</span>
                <span className="text-sm font-medium text-gray-900">68%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información de Seguridad */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Información:</strong> Los respaldos incluyen toda la base de datos, archivos de configuración y logs del sistema. 
            Se recomienda mantener al menos 7 días de respaldos para garantizar la recuperación ante fallos. 
            Los respaldos encriptados requieren la clave de encriptación para la restauración.
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Configuración de Mantenimiento
interface ConfiguracionMantenimientoProps {
  config: any;
  onUpdate: (campo: string, valor: any) => void;
  onUpdateNested: (subseccion: string, campo: string, valor: any) => void;
  onSave: () => void;
  onReset: () => void;
}

const ConfiguracionMantenimiento: React.FC<ConfiguracionMantenimientoProps> = ({ config, onUpdate, onUpdateNested, onSave, onReset }) => {
  const handleExecuteCleanup = () => {
    if (window.confirm('¿Está seguro de ejecutar la limpieza manual del sistema?')) {
      alert('🧹 Iniciando limpieza del sistema...\n\nEsto puede tomar unos minutos.');
    }
  };

  const handleOptimizeDatabase = () => {
    if (window.confirm('¿Está seguro de optimizar la base de datos?\n\nEsta operación puede tomar tiempo y afectar el rendimiento temporalmente.')) {
      alert('⚡ Iniciando optimización de la base de datos...');
    }
  };

  const handleCheckIntegrity = () => {
    alert('🔍 Iniciando verificación de integridad...\n\nRevisando consistencia de datos...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Configuración de Mantenimiento</h3>
        <div className="flex space-x-3">
          <button
            onClick={handleExecuteCleanup}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Limpiar Ahora
          </button>
          <button
            onClick={handleOptimizeDatabase}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Zap className="h-4 w-4 mr-2" />
            Optimizar BD
          </button>
          <button
            onClick={handleCheckIntegrity}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Verificar Integridad
          </button>
          <button
            onClick={onReset}
            className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restablecer
          </button>
          <button
            onClick={onSave}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Limpieza Automática */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 text-blue-600" />
            Limpieza Automática
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Limpieza Automática
              </label>
              <button
                onClick={() => onUpdate('limpiezaAutomatica', !config.limpiezaAutomatica)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.limpiezaAutomatica ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.limpiezaAutomatica ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {config.limpiezaAutomatica && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frecuencia de Limpieza
                </label>
                <select
                  value={config.frecuenciaLimpieza}
                  onChange={(e) => onUpdate('frecuenciaLimpieza', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="diario">Diario</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retención de Logs (días)
              </label>
              <input
                type="number"
                value={config.diasRetencionLogs}
                onChange={(e) => onUpdate('diasRetencionLogs', parseInt(e.target.value))}
                min="1"
                max="365"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Optimización de Base de Datos */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2 text-green-600" />
            Optimización de Base de Datos
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Optimización Automática
              </label>
              <button
                onClick={() => onUpdate('optimizacionBD', !config.optimizacionBD)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.optimizacionBD ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.optimizacionBD ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {config.optimizacionBD && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frecuencia de Optimización
                </label>
                <select
                  value={config.frecuenciaOptimizacion}
                  onChange={(e) => onUpdate('frecuenciaOptimizacion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral</option>
                </select>
              </div>
            )}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Verificación de Integridad
              </label>
              <button
                onClick={() => onUpdate('verificacionIntegridad', !config.verificacionIntegridad)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.verificacionIntegridad ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.verificacionIntegridad ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Actualizaciones */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Download className="h-5 w-5 mr-2 text-purple-600" />
            Actualizaciones del Sistema
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Actualizaciones Automáticas
              </label>
              <button
                onClick={() => onUpdate('actualizacionesAutomaticas', !config.actualizacionesAutomaticas)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.actualizacionesAutomaticas ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.actualizacionesAutomaticas ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Advertencia:</strong> Las actualizaciones automáticas pueden afectar la estabilidad del sistema. 
                  Se recomienda probar las actualizaciones en un entorno de pruebas primero.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ventana de Mantenimiento */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-orange-600" />
            Ventana de Mantenimiento
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Ventana de Mantenimiento
              </label>
              <button
                onClick={() => onUpdateNested('ventanaMantenimiento', 'habilitado', !config.ventanaMantenimiento.habilitado)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.ventanaMantenimiento.habilitado ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.ventanaMantenimiento.habilitado ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {config.ventanaMantenimiento.habilitado && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de Inicio
                    </label>
                    <input
                      type="time"
                      value={config.ventanaMantenimiento.horaInicio}
                      onChange={(e) => onUpdateNested('ventanaMantenimiento', 'horaInicio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de Fin
                    </label>
                    <input
                      type="time"
                      value={config.ventanaMantenimiento.horaFin}
                      onChange={(e) => onUpdateNested('ventanaMantenimiento', 'horaFin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Días de la Semana
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          const diasActuales = [...config.ventanaMantenimiento.diasSemana];
                          if (diasActuales.includes(index)) {
                            onUpdateNested('ventanaMantenimiento', 'diasSemana', diasActuales.filter(d => d !== index));
                          } else {
                            onUpdateNested('ventanaMantenimiento', 'diasSemana', [...diasActuales, index]);
                          }
                        }}
                        className={`px-2 py-1 text-xs rounded ${
                          config.ventanaMantenimiento.diasSemana.includes(index)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {dia}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Estado del Sistema */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-600" />
          Estado del Sistema
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <div className="text-sm text-gray-600">Tiempo de Actividad</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">2.1 GB</div>
            <div className="text-sm text-gray-600">Uso de Memoria</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">45%</div>
            <div className="text-sm text-gray-600">Uso de CPU</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">67%</div>
            <div className="text-sm text-gray-600">Uso de Disco</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Configuración Avanzada
interface ConfiguracionAvanzadaProps {
  config: any;
  onUpdate: (campo: string, valor: any) => void;
  onSave: () => void;
  onReset: () => void;
}

const ConfiguracionAvanzada: React.FC<ConfiguracionAvanzadaProps> = ({ config, onUpdate, onSave, onReset }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Configuración Avanzada</h3>
        <div className="flex space-x-3">
          <button
            onClick={onReset}
            className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restablecer
          </button>
          <button
            onClick={onSave}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* Advertencia */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
          <div className="text-sm text-red-800">
            <strong>⚠️ Advertencia:</strong> Esta sección contiene configuraciones técnicas avanzadas que pueden afectar 
            significativamente el rendimiento y estabilidad del sistema. Solo modifique estos valores si tiene 
            conocimientos técnicos avanzados o bajo supervisión del equipo de soporte técnico.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modo Desarrollador */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-blue-600" />
            Modo Desarrollador
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Modo Desarrollador
              </label>
              <button
                onClick={() => onUpdate('modoDesarrollador', !config.modoDesarrollador)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.modoDesarrollador ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.modoDesarrollador ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Debug Habilitado
              </label>
              <button
                onClick={() => onUpdate('debugHabilitado', !config.debugHabilitado)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.debugHabilitado ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.debugHabilitado ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Perfil de Rendimiento
              </label>
              <button
                onClick={() => onUpdate('perfilRendimiento', !config.perfilRendimiento)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.perfilRendimiento ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.perfilRendimiento ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {(config.modoDesarrollador || config.debugHabilitado) && (
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="text-sm text-yellow-800">
                  <strong>Nota:</strong> El modo desarrollador y debug pueden exponer información sensible 
                  y reducir el rendimiento. No usar en producción.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Métricas y Monitoreo */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
            Métricas y Monitoreo
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Métricas Habilitadas
              </label>
              <button
                onClick={() => onUpdate('metricsHabilitado', !config.metricsHabilitado)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.metricsHabilitado ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.metricsHabilitado ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Rate Limiting
              </label>
              <button
                onClick={() => onUpdate('rateLimitingHabilitado', !config.rateLimitingHabilitado)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.rateLimitingHabilitado ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.rateLimitingHabilitado ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {config.rateLimitingHabilitado && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requests por Minuto
                </label>
                <input
                  type="number"
                  value={config.requestsPorMinuto}
                  onChange={(e) => onUpdate('requestsPorMinuto', parseInt(e.target.value))}
                  min="10"
                  max="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Configuración de Base de Datos */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2 text-purple-600" />
            Configuración de Base de Datos
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conexiones Máximas
              </label>
              <input
                type="number"
                value={config.conexionesBDMaximas}
                onChange={(e) => onUpdate('conexionesBDMaximas', parseInt(e.target.value))}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeout de Conexión (segundos)
              </label>
              <input
                type="number"
                value={config.timeoutConexionSegundos}
                onChange={(e) => onUpdate('timeoutConexionSegundos', parseInt(e.target.value))}
                min="5"
                max="300"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Pool de Conexiones
              </label>
              <button
                onClick={() => onUpdate('poolConexiones', !config.poolConexiones)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.poolConexiones ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.poolConexiones ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Cache Redis */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Server className="h-5 w-5 mr-2 text-orange-600" />
            Cache Redis
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Cache Redis Habilitado
              </label>
              <button
                onClick={() => onUpdate('cacheRedis', !config.cacheRedis)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.cacheRedis ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.cacheRedis ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {config.cacheRedis && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de Redis
                </label>
                <input
                  type="text"
                  value={config.urlRedis}
                  onChange={(e) => onUpdate('urlRedis', e.target.value)}
                  placeholder="redis://localhost:6379"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Configuración de Cluster */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Wifi className="h-5 w-5 mr-2 text-red-600" />
            Configuración de Cluster
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Cluster Habilitado
              </label>
              <button
                onClick={() => onUpdate('clusterHabilitado', !config.clusterHabilitado)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.clusterHabilitado ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.clusterHabilitado ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {config.clusterHabilitado && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nodos Primarios
                  </label>
                  <input
                    type="number"
                    value={config.nodosPrimarios}
                    onChange={(e) => onUpdate('nodosPrimarios', parseInt(e.target.value))}
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nodos Secundarios
                  </label>
                  <input
                    type="number"
                    value={config.nodosSecundarios}
                    onChange={(e) => onUpdate('nodosSecundarios', parseInt(e.target.value))}
                    min="0"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Información del Sistema */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Monitor className="h-5 w-5 mr-2 text-indigo-600" />
            Información del Sistema
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Versión Node.js:</span>
              <span className="text-sm font-medium text-gray-900">v18.17.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Memoria Total:</span>
              <span className="text-sm font-medium text-gray-900">8 GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">CPU:</span>
              <span className="text-sm font-medium text-gray-900">4 cores</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Sistema Operativo:</span>
              <span className="text-sm font-medium text-gray-900">Linux Ubuntu 22.04</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Uptime:</span>
              <span className="text-sm font-medium text-gray-900">15 días, 8 horas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;