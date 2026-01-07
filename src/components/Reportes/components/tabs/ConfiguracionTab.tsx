import React, { useState } from 'react';
import {
  Clock,
  CheckCircle,
  Calendar,
  Mail,
  FileText,
  Edit,
  Trash2,
  Settings,
} from 'lucide-react';
import { COMPONENT_STYLES } from '../../constants';

interface ReporteProgramado {
  id: string;
  nombre: string;
  tipo: string;
  frecuencia: string;
  proximaEjecucion: Date;
  estado: string;
  destinatarios: string[];
  formato: string;
}

interface ConfiguracionTabProps {
  reportesProgramados: ReporteProgramado[];
  onReportesProgramadosChange: (reportes: ReporteProgramado[]) => void;
}

const ConfiguracionTab: React.FC<ConfiguracionTabProps> = ({
  reportesProgramados,
  onReportesProgramadosChange,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'programados' | 'configuracion'>('programados');
  
  const [configuracion, setConfiguracion] = useState({
    formatoFechaDefault: 'dd/mm/yyyy',
    idiomaDefault: 'es',
    tiempoRetencion: '12',
    compressionPDF: 'media',
    incluirFirmaDigital: true,
    marcaAgua: false,
    encriptacionReportes: false,
    notificacionesEmail: true,
    backupAutomatico: true
  });

  const handleEliminarReporte = (id: string) => {
    if (window.confirm('Esta seguro de eliminar este reporte programado?')) {
      onReportesProgramadosChange(reportesProgramados.filter(r => r.id !== id));
    }
  };

  const handleToggleEstado = (id: string) => {
    onReportesProgramadosChange(reportesProgramados.map(r => 
      r.id === id ? { ...r, estado: r.estado === 'activo' ? 'inactivo' : 'activo' } : r
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveSubTab('programados')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSubTab === 'programados'
              ? 'bg-teal-50 text-teal-700 border border-teal-200'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Clock className="h-4 w-4 inline mr-2" />
          Reportes Programados
        </button>
        <button
          onClick={() => setActiveSubTab('configuracion')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSubTab === 'configuracion'
              ? 'bg-teal-50 text-teal-700 border border-teal-200'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Settings className="h-4 w-4 inline mr-2" />
          Configuracion General
        </button>
      </div>

      {activeSubTab === 'programados' && (
        <div className="space-y-6">
          {/* Estadisticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Clock className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total</p>
                  <p className="text-xl font-bold text-gray-900">{reportesProgramados.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Activos</p>
                  <p className="text-xl font-bold text-gray-900">
                    {reportesProgramados.filter(r => r.estado === 'activo').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Proxima Ejecucion</p>
                  <p className="text-sm font-bold text-gray-900">Hoy 18:00</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Mail className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Enviados Hoy</p>
                  <p className="text-xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className={COMPONENT_STYLES.table.container}>
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Reportes Programados</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={COMPONENT_STYLES.table.header}>
                  <tr>
                    <th className={COMPONENT_STYLES.table.headerCell}>Reporte</th>
                    <th className={COMPONENT_STYLES.table.headerCell}>Frecuencia</th>
                    <th className={COMPONENT_STYLES.table.headerCell}>Proxima</th>
                    <th className={COMPONENT_STYLES.table.headerCell}>Destinatarios</th>
                    <th className={COMPONENT_STYLES.table.headerCell}>Estado</th>
                    <th className={`${COMPONENT_STYLES.table.headerCell} text-right`}>Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportesProgramados.map((reporte) => (
                    <tr key={reporte.id} className={COMPONENT_STYLES.table.row}>
                      <td className={COMPONENT_STYLES.table.cell}>
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{reporte.nombre}</div>
                            <div className="text-xs text-gray-500">{reporte.formato.toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className={COMPONENT_STYLES.table.cell}>
                        <span className={COMPONENT_STYLES.badge.info}>{reporte.frecuencia}</span>
                      </td>
                      <td className={COMPONENT_STYLES.table.cell}>
                        <span className="text-sm text-gray-900">{reporte.proximaEjecucion.toLocaleDateString()}</span>
                      </td>
                      <td className={COMPONENT_STYLES.table.cell}>
                        <span className="text-sm text-gray-500">{reporte.destinatarios.length} destinatario(s)</span>
                      </td>
                      <td className={COMPONENT_STYLES.table.cell}>
                        <button
                          onClick={() => handleToggleEstado(reporte.id)}
                          className={`${reporte.estado === 'activo' ? COMPONENT_STYLES.badge.active : COMPONENT_STYLES.badge.danger}`}
                        >
                          {reporte.estado}
                        </button>
                      </td>
                      <td className={`${COMPONENT_STYLES.table.cell} text-right`}>
                        <div className="flex items-center justify-end gap-1">
                          <button className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconEdit}`}>
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEliminarReporte(reporte.id)}
                            className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconDelete}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'configuracion' && (
        <div className="space-y-6">
          {/* Configuracion General */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Configuracion General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={COMPONENT_STYLES.input.label}>Formato de Fecha</label>
                <select
                  value={configuracion.formatoFechaDefault}
                  onChange={(e) => setConfiguracion({...configuracion, formatoFechaDefault: e.target.value})}
                  className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                >
                  <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                  <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                  <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className={COMPONENT_STYLES.input.label}>Idioma</label>
                <select
                  value={configuracion.idiomaDefault}
                  onChange={(e) => setConfiguracion({...configuracion, idiomaDefault: e.target.value})}
                  className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="qu">Quechua</option>
                </select>
              </div>
              <div>
                <label className={COMPONENT_STYLES.input.label}>Tiempo de Retencion</label>
                <select
                  value={configuracion.tiempoRetencion}
                  onChange={(e) => setConfiguracion({...configuracion, tiempoRetencion: e.target.value})}
                  className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                >
                  <option value="6">6 meses</option>
                  <option value="12">12 meses</option>
                  <option value="24">24 meses</option>
                </select>
              </div>
              <div>
                <label className={COMPONENT_STYLES.input.label}>Compresion PDF</label>
                <select
                  value={configuracion.compressionPDF}
                  onChange={(e) => setConfiguracion({...configuracion, compressionPDF: e.target.value})}
                  className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                >
                  <option value="baja">Baja (mejor calidad)</option>
                  <option value="media">Media (balanceado)</option>
                  <option value="alta">Alta (menor tamaño)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Seguridad */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Seguridad</h3>
            <div className="space-y-4">
              {[
                { key: 'incluirFirmaDigital', label: 'Firma Digital', desc: 'Incluir firma digital en PDFs' },
                { key: 'marcaAgua', label: 'Marca de Agua', desc: 'Agregar marca de agua institucional' },
                { key: 'encriptacionReportes', label: 'Encriptacion', desc: 'Encriptar reportes sensibles' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{item.label}</h4>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setConfiguracion({...configuracion, [item.key]: !configuracion[item.key as keyof typeof configuracion]})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      configuracion[item.key as keyof typeof configuracion] ? 'bg-teal-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      configuracion[item.key as keyof typeof configuracion] ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notificaciones */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Notificaciones</h3>
            <div className="space-y-4">
              {[
                { key: 'notificacionesEmail', label: 'Notificaciones por Email', desc: 'Enviar notificaciones cuando se generen reportes' },
                { key: 'backupAutomatico', label: 'Backup Automatico', desc: 'Crear copias de seguridad de reportes' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{item.label}</h4>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setConfiguracion({...configuracion, [item.key]: !configuracion[item.key as keyof typeof configuracion]})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      configuracion[item.key as keyof typeof configuracion] ? 'bg-teal-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      configuracion[item.key as keyof typeof configuracion] ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button className={COMPONENT_STYLES.button.primary}>
              Guardar Configuracion
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ConfiguracionTab);
