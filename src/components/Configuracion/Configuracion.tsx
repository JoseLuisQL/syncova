import React, { useState } from 'react';
import {
  Settings,
  Database,
  Shield,
  Bell,
  Link,
  RefreshCw,
  Server,
  Zap,
  Download,
  Upload,
  Save,
  RotateCcw,
  Building2,
  Eye,
  EyeOff,
  Key,
  Clock,
  FolderOpen,
  HardDrive,
  Mail,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  Lock,
  Activity,
  Monitor,
  FileText
} from 'lucide-react';

// Configuración de secciones organizadas jerárquicamente  
interface SectionConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  category: 'general' | 'seguridad' | 'sistema' | 'integraciones';
  description?: string;
}

const CONFIG_SECTIONS: SectionConfig[] = [
  // Sección General
  { 
    id: 'general', 
    label: 'Configuración General', 
    icon: Settings, 
    path: '/configuracion/general', 
    category: 'general',
    description: 'Información básica del sistema'
  },
  { 
    id: 'notificaciones', 
    label: 'Notificaciones', 
    icon: Bell, 
    path: '/configuracion/notificaciones', 
    category: 'general',
    description: 'Alertas y comunicaciones'
  },
  
  // Sección Seguridad
  { 
    id: 'seguridad', 
    label: 'Políticas de Seguridad', 
    icon: Shield, 
    path: '/configuracion/seguridad', 
    category: 'seguridad',
    description: 'Control de acceso y autenticación'
  },
  { 
    id: 'respaldos', 
    label: 'Respaldos y Recuperación', 
    icon: Database, 
    path: '/configuracion/respaldos', 
    category: 'seguridad',
    description: 'Copias de seguridad automáticas'
  },
  
  // Sección Sistema
  { 
    id: 'sistema', 
    label: 'Configuración del Sistema', 
    icon: Server, 
    path: '/configuracion/sistema', 
    category: 'sistema',
    description: 'Parámetros de funcionamiento'
  },
  { 
    id: 'mantenimiento', 
    label: 'Mantenimiento', 
    icon: RefreshCw, 
    path: '/configuracion/mantenimiento', 
    category: 'sistema',
    description: 'Tareas de mantenimiento programadas'
  },
  
  // Sección Integraciones
  { 
    id: 'integraciones', 
    label: 'APIs y Servicios', 
    icon: Link, 
    path: '/configuracion/integraciones', 
    category: 'integraciones',
    description: 'Conexiones con sistemas externos'
  },
  { 
    id: 'avanzado', 
    label: 'Configuración Avanzada', 
    icon: Zap, 
    path: '/configuracion/avanzado', 
    category: 'integraciones',
    description: 'Configuraciones técnicas especializadas'
  }
];

const CATEGORY_CONFIG = {
  general: { label: 'Configuración General', icon: FolderOpen, color: 'blue' },
  seguridad: { label: 'Seguridad y Respaldos', icon: Shield, color: 'emerald' },
  sistema: { label: 'Sistema y Mantenimiento', icon: Server, color: 'purple' },
  integraciones: { label: 'Integraciones y Avanzado', icon: Link, color: 'amber' }
};

const Configuracion: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('general');

  // Estados para configuraciones simplificadas
  const [configuraciones, setConfiguraciones] = useState({
    // Configuraciones Generales (simplificado)
    general: {
      nombreSistema: 'SIVAC - Sistema de Gestión de Vacunas',
      nombreInstitucion: 'DISA Apurímac II',
      direccion: 'Jr. Lima 123, Andahuaylas, Apurímac',
      telefono: '+51 983 456 789',
      email: 'contacto@saludapurimac.gob.pe',
      timezone: 'America/Lima',
      idioma: 'es',
      formatoFecha: 'DD/MM/YYYY'
    },
    // Configuraciones del Sistema (simplificado)
    sistema: {
      versionSistema: '2.1.0',
      entornoEjecucion: 'produccion',
      maxUsuariosConcurrentes: 50,
      tiempoSesion: 480, // minutos
      autoGuardado: true,
      cacheDatos: true
    },
    // Configuraciones de Seguridad (simplificado)
    seguridad: {
      autenticacionDosFactor: false,
      longitudMinimaPassword: 8,
      complejidadPassword: true,
      expiracionPassword: 90, // días
      intentosMaximoLogin: 5,
      encriptacionDatos: true,
      auditoriaSesiones: true
    },
    // Configuraciones de Notificaciones (simplificado)
    notificaciones: {
      emailHabilitado: true,
      alertasStock: true,
      alertasVencimiento: true,
      notificacionesUsuarios: true,
      frecuenciaAlertas: 'diaria'
    },
    // Configuraciones de Integraciones (simplificado)
    integraciones: {
      apiHisMinsa: {
        habilitado: false,
        url: '',
        apiKey: ''
      },
      siga: {
        habilitado: false,
        servidor: '',
        puerto: 443
      }
    },
    // Configuraciones de Respaldos (simplificado)
    respaldos: {
      automatico: true,
      frecuencia: 'diaria',
      hora: '02:00',
      retencionDias: 30,
      ubicacionRespaldo: '/backups'
    },
    // Configuraciones de Mantenimiento (simplificado)
    mantenimiento: {
      limpiezaAutomatica: true,
      optimizacionBD: 'semanal',
      limpiezaLogs: true,
      monitoreoCPU: true
    },
    // Configuraciones Avanzadas (simplificado)
    avanzado: {
      modoDebug: false,
      nivelLog: 'info',
      compresionDatos: true,
      conexionesBDMaximas: 20
    }
  });

  // Agrupar secciones por categoría
  const sectionsByCategory = CONFIG_SECTIONS.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, SectionConfig[]>);

  const handleSaveConfiguration = (seccion: string) => {
    console.log(`Guardando configuración de ${seccion}:`, configuraciones[seccion as keyof typeof configuraciones]);
    // Simular guardado exitoso
    alert(`✅ Configuración de ${seccion} guardada exitosamente`);
  };

  const handleResetConfiguration = (seccion: string) => {
    if (window.confirm(`¿Está seguro de restablecer la configuración de ${seccion} a los valores por defecto?`)) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Premium */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
                <p className="text-gray-600">Administración centralizada de configuraciones SIVAC</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleImportConfiguration}
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </button>
              <button
                onClick={handleExportConfiguration}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Premium */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6">
          <div className="grid grid-cols-4 gap-1">
            {Object.entries(sectionsByCategory).map(([categoryKey, sections]) => {
              const category = CATEGORY_CONFIG[categoryKey as keyof typeof CATEGORY_CONFIG];
              const CategoryIcon = category.icon;
              
              return (
                <div key={categoryKey} className="relative group">
                  {/* Category Header */}
                  <div className={`flex items-center justify-center py-4 border-b-4 border-${category.color}-500 bg-${category.color}-50`}>
                    <CategoryIcon className={`h-5 w-5 text-${category.color}-600 mr-2`} />
                    <span className={`font-semibold text-${category.color}-800`}>{category.label}</span>
                  </div>
                  
                  {/* Section Buttons */}
                  <div className="bg-white">
                    {sections.map((section) => {
                      const SectionIcon = section.icon;
                      const isActive = activeSection === section.id;
                      
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full px-4 py-3 text-left border-r border-gray-200 transition-colors ${
                            isActive
                              ? `bg-${category.color}-100 text-${category.color}-800 border-l-4 border-l-${category.color}-500`
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <div className="flex items-center">
                            <SectionIcon className={`h-4 w-4 mr-3 ${isActive ? `text-${category.color}-600` : 'text-gray-400'}`} />
                            <div>
                              <div className="text-sm font-medium">{section.label}</div>
                              <div className="text-xs text-gray-500 mt-1">{section.description}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area Premium */}
      <div className="max-w-full px-6 py-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {activeSection === 'general' && (
            <ConfiguracionGeneral 
              config={configuraciones.general}
              onUpdate={(campo, valor) => updateConfiguration('general', campo, valor)}
              onSave={() => handleSaveConfiguration('general')}
              onReset={() => handleResetConfiguration('general')}
            />
          )}
          
          {activeSection === 'sistema' && (
            <ConfiguracionSistema 
              config={configuraciones.sistema}
              onUpdate={(campo, valor) => updateConfiguration('sistema', campo, valor)}
              onSave={() => handleSaveConfiguration('sistema')}
              onReset={() => handleResetConfiguration('sistema')}
            />
          )}
          
          {activeSection === 'seguridad' && (
            <ConfiguracionSeguridad 
              config={configuraciones.seguridad}
              onUpdate={(campo, valor) => updateConfiguration('seguridad', campo, valor)}
              onSave={() => handleSaveConfiguration('seguridad')}
              onReset={() => handleResetConfiguration('seguridad')}
            />
          )}
          
          {activeSection === 'notificaciones' && (
            <ConfiguracionNotificaciones 
              config={configuraciones.notificaciones}
              onUpdate={(campo, valor) => updateConfiguration('notificaciones', campo, valor)}
              onSave={() => handleSaveConfiguration('notificaciones')}
              onReset={() => handleResetConfiguration('notificaciones')}
            />
          )}
          
          {activeSection === 'integraciones' && (
            <ConfiguracionIntegraciones
              config={configuraciones.integraciones}
              onUpdateNested={(subseccion, campo, valor) => updateNestedConfiguration('integraciones', subseccion, campo, valor)}
              onSave={() => handleSaveConfiguration('integraciones')}
              onReset={() => handleResetConfiguration('integraciones')}
            />
          )}
          
          {activeSection === 'respaldos' && (
            <ConfiguracionRespaldos 
              config={configuraciones.respaldos}
              onUpdate={(campo, valor) => updateConfiguration('respaldos', campo, valor)}
              onSave={() => handleSaveConfiguration('respaldos')}
              onReset={() => handleResetConfiguration('respaldos')}
            />
          )}
          
          {activeSection === 'mantenimiento' && (
            <ConfiguracionMantenimiento 
              config={configuraciones.mantenimiento}
              onUpdate={(campo, valor) => updateConfiguration('mantenimiento', campo, valor)}
              onSave={() => handleSaveConfiguration('mantenimiento')}
              onReset={() => handleResetConfiguration('mantenimiento')}
            />
          )}
          
          {activeSection === 'avanzado' && (
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

// Componente de Configuración General (Simplificado)
interface ConfiguracionGeneralProps {
  config: any;
  onUpdate: (campo: string, valor: any) => void;
  onSave: () => void;
  onReset: () => void;
}

const ConfiguracionGeneral: React.FC<ConfiguracionGeneralProps> = ({ config, onUpdate, onSave, onReset }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Header de sección */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Información General</h3>
            <p className="text-sm text-gray-600">Configuración básica de la institución y sistema</p>
          </div>
        </div>
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
            Guardar
          </button>
        </div>
      </div>

      {/* Formulario simplificado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del Sistema */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Monitor className="h-4 w-4 mr-2 text-blue-600" />
            Información del Sistema
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Sistema</label>
            <input
              type="text"
              value={config.nombreSistema}
              onChange={(e) => onUpdate('nombreSistema', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Zona Horaria</label>
            <select
              value={config.timezone}
              onChange={(e) => onUpdate('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="America/Lima">Lima (UTC-5)</option>
              <option value="America/Bogota">Bogotá (UTC-5)</option>
              <option value="America/Mexico_City">México (UTC-6)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Formato de Fecha</label>
            <select
              value={config.formatoFecha}
              onChange={(e) => onUpdate('formatoFecha', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>

        {/* Información de la Institución */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Building2 className="h-4 w-4 mr-2 text-emerald-600" />
            Información de la Institución
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Institución</label>
            <input
              type="text"
              value={config.nombreInstitucion}
              onChange={(e) => onUpdate('nombreInstitucion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
            <input
              type="text"
              value={config.direccion}
              onChange={(e) => onUpdate('direccion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <input
                type="text"
                value={config.telefono}
                onChange={(e) => onUpdate('telefono', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => onUpdate('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Configuración del Sistema (Simplificado)
interface ConfiguracionSistemaProps {
  config: any;
  onUpdate: (campo: string, valor: any) => void;
  onSave: () => void;
  onReset: () => void;
}

const ConfiguracionSistema: React.FC<ConfiguracionSistemaProps> = ({ config, onUpdate, onSave, onReset }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Header de sección */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Server className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Configuración del Sistema</h3>
            <p className="text-sm text-gray-600">Parámetros de funcionamiento y rendimiento</p>
          </div>
        </div>
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
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </button>
        </div>
      </div>

      {/* Información del Sistema */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center mb-3">
          <Info className="h-5 w-5 text-blue-600 mr-2" />
          <h4 className="font-medium text-gray-900">Estado del Sistema</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-sm text-gray-600">Versión</div>
            <div className="font-semibold text-gray-900">{config.versionSistema}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-sm text-gray-600">Entorno</div>
            <div className="font-semibold text-gray-900 capitalize">{config.entornoEjecucion}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-sm text-gray-600">Usuarios Máximos</div>
            <div className="font-semibold text-gray-900">{config.maxUsuariosConcurrentes}</div>
          </div>
        </div>
      </div>

      {/* Configuraciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Clock className="h-4 w-4 mr-2 text-purple-600" />
            Configuraciones de Sesión
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiempo de Sesión (minutos)
            </label>
            <input
              type="number"
              value={config.tiempoSesion}
              onChange={(e) => onUpdate('tiempoSesion', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              min="1"
              max="1440"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Auto-guardado</label>
              <p className="text-xs text-gray-500">Guardar cambios automáticamente</p>
            </div>
            <button
              onClick={() => onUpdate('autoGuardado', !config.autoGuardado)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.autoGuardado ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.autoGuardado ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <HardDrive className="h-4 w-4 mr-2 text-purple-600" />
            Optimización de Datos
          </h4>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Cache de Datos</label>
              <p className="text-xs text-gray-500">Acelerar consultas frecuentes</p>
            </div>
            <button
              onClick={() => onUpdate('cacheDatos', !config.cacheDatos)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.cacheDatos ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.cacheDatos ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Configuración de Seguridad (Simplificado)
interface ConfiguracionSeguridadProps {
  config: any;
  onUpdate: (campo: string, valor: any) => void;
  onSave: () => void;
  onReset: () => void;
}

const ConfiguracionSeguridad: React.FC<ConfiguracionSeguridadProps> = ({ config, onUpdate, onSave, onReset }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Header de sección */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Shield className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Políticas de Seguridad</h3>
            <p className="text-sm text-gray-600">Configuración de acceso y autenticación</p>
          </div>
        </div>
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
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Políticas de Contraseña */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Key className="h-4 w-4 mr-2 text-emerald-600" />
            Políticas de Contraseña
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longitud Mínima
            </label>
            <input
              type="number"
              value={config.longitudMinimaPassword}
              onChange={(e) => onUpdate('longitudMinimaPassword', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              min="6"
              max="20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiración (días)
            </label>
            <input
              type="number"
              value={config.expiracionPassword}
              onChange={(e) => onUpdate('expiracionPassword', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              min="30"
              max="365"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Complejidad Requerida</label>
              <p className="text-xs text-gray-500">Mayúsculas, números y símbolos</p>
            </div>
            <button
              onClick={() => onUpdate('complejidadPassword', !config.complejidadPassword)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.complejidadPassword ? 'bg-emerald-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.complejidadPassword ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Control de Acceso */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Lock className="h-4 w-4 mr-2 text-emerald-600" />
            Control de Acceso
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intentos Máximos de Login
            </label>
            <input
              type="number"
              value={config.intentosMaximoLogin}
              onChange={(e) => onUpdate('intentosMaximoLogin', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              min="3"
              max="10"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Autenticación de Dos Factores</label>
              <p className="text-xs text-gray-500">Verificación adicional por SMS/Email</p>
            </div>
            <button
              onClick={() => onUpdate('autenticacionDosFactor', !config.autenticacionDosFactor)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.autenticacionDosFactor ? 'bg-emerald-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.autenticacionDosFactor ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Auditoría de Sesiones</label>
              <p className="text-xs text-gray-500">Registrar actividad de usuarios</p>
            </div>
            <button
              onClick={() => onUpdate('auditoriaSesiones', !config.auditoriaSesiones)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.auditoriaSesiones ? 'bg-emerald-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.auditoriaSesiones ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Configuración de Notificaciones (Simplificado)
interface ConfiguracionNotificacionesProps {
  config: any;
  onUpdate: (campo: string, valor: any) => void;
  onSave: () => void;
  onReset: () => void;
}

const ConfiguracionNotificaciones: React.FC<ConfiguracionNotificacionesProps> = ({ config, onUpdate, onSave, onReset }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Header de sección */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Configuración de Notificaciones</h3>
            <p className="text-sm text-gray-600">Alertas y comunicaciones del sistema</p>
          </div>
        </div>
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
            Guardar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuraciones de Email */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Mail className="h-4 w-4 mr-2 text-blue-600" />
            Notificaciones por Email
          </h4>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Email Habilitado</label>
              <p className="text-xs text-gray-500">Enviar notificaciones por correo</p>
            </div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frecuencia de Alertas
            </label>
            <select
              value={config.frecuenciaAlertas}
              onChange={(e) => onUpdate('frecuenciaAlertas', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="inmediata">Inmediata</option>
              <option value="diaria">Diaria</option>
              <option value="semanal">Semanal</option>
            </select>
          </div>
        </div>

        {/* Tipos de Alertas */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
            Tipos de Alertas
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Alertas de Stock</label>
                <p className="text-xs text-gray-500">Niveles bajos de inventario</p>
              </div>
              <button
                onClick={() => onUpdate('alertasStock', !config.alertasStock)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.alertasStock ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.alertasStock ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Alertas de Vencimiento</label>
                <p className="text-xs text-gray-500">Vacunas próximas a vencer</p>
              </div>
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

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Notificaciones de Usuarios</label>
                <p className="text-xs text-gray-500">Actividad de usuarios del sistema</p>
              </div>
              <button
                onClick={() => onUpdate('notificacionesUsuarios', !config.notificacionesUsuarios)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.notificacionesUsuarios ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.notificacionesUsuarios ? 'translate-x-6' : 'translate-x-1'
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

// Componente de Configuración de Integraciones (Simplificado)
interface ConfiguracionIntegracionesProps {
  config: any;
  onUpdateNested: (subseccion: string, campo: string, valor: any) => void;
  onSave: () => void;
  onReset: () => void;
}

const ConfiguracionIntegraciones: React.FC<ConfiguracionIntegracionesProps> = ({ config, onUpdateNested, onSave, onReset }) => {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="p-6 space-y-6">
      {/* Header de sección */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-100 p-2 rounded-lg">
            <Link className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">APIs y Servicios Externos</h3>
            <p className="text-sm text-gray-600">Configuración de integraciones con sistemas externos</p>
          </div>
        </div>
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
            className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API HIS MINSA */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Database className="h-4 w-4 mr-2 text-amber-600" />
            API HIS MINSA
          </h4>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Integración Habilitada</label>
              <p className="text-xs text-gray-500">Conectar con sistema HIS MINSA</p>
            </div>
            <button
              onClick={() => onUpdateNested('apiHisMinsa', 'habilitado', !config.apiHisMinsa.habilitado)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.apiHisMinsa.habilitado ? 'bg-amber-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.apiHisMinsa.habilitado ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {config.apiHisMinsa.habilitado && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL del Servicio</label>
                <input
                  type="text"
                  value={config.apiHisMinsa.url}
                  onChange={(e) => onUpdateNested('apiHisMinsa', 'url', e.target.value)}
                  placeholder="https://api.hisminsa.gob.pe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={config.apiHisMinsa.apiKey}
                    onChange={(e) => onUpdateNested('apiHisMinsa', 'apiKey', e.target.value)}
                    placeholder="Ingrese su API Key"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showApiKey ? (
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

        {/* Sistema SIGA */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Server className="h-4 w-4 mr-2 text-amber-600" />
            Sistema SIGA
          </h4>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Integración Habilitada</label>
              <p className="text-xs text-gray-500">Conectar con sistema administrativo</p>
            </div>
            <button
              onClick={() => onUpdateNested('siga', 'habilitado', !config.siga.habilitado)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.siga.habilitado ? 'bg-amber-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.siga.habilitado ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {config.siga.habilitado && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Servidor</label>
                <input
                  type="text"
                  value={config.siga.servidor}
                  onChange={(e) => onUpdateNested('siga', 'servidor', e.target.value)}
                  placeholder="servidor.siga.gob.pe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Puerto</label>
                <input
                  type="number"
                  value={config.siga.puerto}
                  onChange={(e) => onUpdateNested('siga', 'puerto', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  min="1"
                  max="65535"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de Configuración de Respaldos (Simplificado)
interface ConfiguracionRespaldosProps {
  config: any;
  onUpdate: (campo: string, valor: any) => void;
  onSave: () => void;
  onReset: () => void;
}

const ConfiguracionRespaldos: React.FC<ConfiguracionRespaldosProps> = ({ config, onUpdate, onSave, onReset }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Header de sección */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Database className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Respaldos y Recuperación</h3>
            <p className="text-sm text-gray-600">Configuración de copias de seguridad automáticas</p>
          </div>
        </div>
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
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración de Respaldos */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
            Programación de Respaldos
          </h4>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Respaldo Automático</label>
              <p className="text-xs text-gray-500">Programar respaldos regulares</p>
            </div>
            <button
              onClick={() => onUpdate('automatico', !config.automatico)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.automatico ? 'bg-emerald-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.automatico ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia</label>
            <select
              value={config.frecuencia}
              onChange={(e) => onUpdate('frecuencia', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={!config.automatico}
            >
              <option value="diaria">Diaria</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Ejecución</label>
            <input
              type="time"
              value={config.hora}
              onChange={(e) => onUpdate('hora', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={!config.automatico}
            />
          </div>
        </div>

        {/* Configuración de Retención */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <HardDrive className="h-4 w-4 mr-2 text-emerald-600" />
            Retención y Almacenamiento
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retención (días)
            </label>
            <input
              type="number"
              value={config.retencionDias}
              onChange={(e) => onUpdate('retencionDias', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              min="7"
              max="365"
            />
            <p className="text-xs text-gray-500 mt-1">
              Los respaldos se eliminan automáticamente después de este período
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación de Respaldo</label>
            <input
              type="text"
              value={config.ubicacionRespaldo}
              onChange={(e) => onUpdate('ubicacionRespaldo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="/var/backups"
            />
          </div>

          {/* Estado del último respaldo */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Estado del Último Respaldo</h5>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-gray-600">Completado exitosamente</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Último respaldo: {new Date().toLocaleDateString()} a las 02:00
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Configuración de Mantenimiento (Simplificado)
interface ConfiguracionMantenimientoProps {
  config: any;
  onUpdate: (campo: string, valor: any) => void;
  onSave: () => void;
  onReset: () => void;
}

const ConfiguracionMantenimiento: React.FC<ConfiguracionMantenimientoProps> = ({ config, onUpdate, onSave, onReset }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Header de sección */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <RefreshCw className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Mantenimiento del Sistema</h3>
            <p className="text-sm text-gray-600">Tareas automáticas de optimización y limpieza</p>
          </div>
        </div>
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
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tareas de Limpieza */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <HardDrive className="h-4 w-4 mr-2 text-purple-600" />
            Limpieza Automática
          </h4>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Limpieza Automática</label>
              <p className="text-xs text-gray-500">Limpiar archivos temporales</p>
            </div>
            <button
              onClick={() => onUpdate('limpiezaAutomatica', !config.limpiezaAutomatica)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.limpiezaAutomatica ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.limpiezaAutomatica ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Limpieza de Logs</label>
              <p className="text-xs text-gray-500">Eliminar logs antiguos</p>
            </div>
            <button
              onClick={() => onUpdate('limpiezaLogs', !config.limpiezaLogs)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.limpiezaLogs ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.limpiezaLogs ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Optimización */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Activity className="h-4 w-4 mr-2 text-purple-600" />
            Optimización
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Optimización de BD</label>
            <select
              value={config.optimizacionBD}
              onChange={(e) => onUpdate('optimizacionBD', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="diaria">Diaria</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Monitoreo de CPU</label>
              <p className="text-xs text-gray-500">Alertas de rendimiento</p>
            </div>
            <button
              onClick={() => onUpdate('monitoreoCPU', !config.monitoreoCPU)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.monitoreoCPU ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.monitoreoCPU ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Configuración Avanzada (Simplificado)
interface ConfiguracionAvanzadaProps {
  config: any;
  onUpdate: (campo: string, valor: any) => void;
  onSave: () => void;
  onReset: () => void;
}

const ConfiguracionAvanzada: React.FC<ConfiguracionAvanzadaProps> = ({ config, onUpdate, onSave, onReset }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Header de sección */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-100 p-2 rounded-lg">
            <Zap className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Configuración Avanzada</h3>
            <p className="text-sm text-gray-600">Configuraciones técnicas especializadas</p>
          </div>
        </div>
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
            className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuraciones de Debug */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <FileText className="h-4 w-4 mr-2 text-amber-600" />
            Debug y Logs
          </h4>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Modo Debug</label>
              <p className="text-xs text-gray-500">Información detallada de errores</p>
            </div>
            <button
              onClick={() => onUpdate('modoDebug', !config.modoDebug)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.modoDebug ? 'bg-amber-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.modoDebug ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de Log</label>
            <select
              value={config.nivelLog}
              onChange={(e) => onUpdate('nivelLog', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>
        </div>

        {/* Configuraciones de Base de Datos */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Database className="h-4 w-4 mr-2 text-amber-600" />
            Base de Datos
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conexiones Máximas
            </label>
            <input
              type="number"
              value={config.conexionesBDMaximas}
              onChange={(e) => onUpdate('conexionesBDMaximas', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              min="5"
              max="100"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Compresión de Datos</label>
              <p className="text-xs text-gray-500">Reducir uso de ancho de banda</p>
            </div>
            <button
              onClick={() => onUpdate('compresionDatos', !config.compresionDatos)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.compresionDatos ? 'bg-amber-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.compresionDatos ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Advertencia */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h5 className="text-sm font-medium text-amber-800">Configuraciones Avanzadas</h5>
            <p className="text-sm text-amber-700 mt-1">
              Estas configuraciones afectan el funcionamiento técnico del sistema. 
              Modifique solo si comprende completamente las implicaciones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;