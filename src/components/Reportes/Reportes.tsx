import React, { useState, useMemo, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Clock, Loader2 } from 'lucide-react';
import { useKardexFiltros } from '../../hooks/useKardexData';
import { useAppNavigation, useCurrentRoute } from '../../hooks/useRouting';
import { usePermissions } from '../../hooks/usePermissions';
import { COMPONENT_STYLES, REPORTS_SECTIONS } from './constants';
import { ReportesHeader, ReportesNav } from './components';
import { InventarioTab, MovimientosTab, PlanificacionTab, ConfiguracionTab, CenaresTab } from './components/tabs';

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

const Reportes: React.FC = () => {
  const { navigateToModule } = useAppNavigation();
  const { currentSubModule } = useCurrentRoute();
  const { canAccessSection } = usePermissions();

  const {
    vacunas: vacunasReales,
    centrosAcopio: centrosAcopioReales,
    loading: loadingFiltros
  } = useKardexFiltros();

  const [filtrosFechas, setFiltrosFechas] = useState({
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    centroAcopio: 'todos',
  });

  const [showModalProgramar, setShowModalProgramar] = useState(false);

  const [reportesProgramados, setReportesProgramados] = useState<ReporteProgramado[]>([
    {
      id: '1',
      nombre: 'Reporte Mensual de Stock',
      tipo: 'stock_mensual',
      frecuencia: 'mensual',
      proximaEjecucion: new Date('2024-12-31'),
      estado: 'activo',
      destinatarios: ['coordinadora@saludapurimac.gob.pe'],
      formato: 'pdf'
    },
    {
      id: '2',
      nombre: 'Analisis de Consumo Trimestral',
      tipo: 'consumo_trimestral',
      frecuencia: 'trimestral',
      proximaEjecucion: new Date('2025-01-15'),
      estado: 'activo',
      destinatarios: ['admin@saludapurimac.gob.pe'],
      formato: 'excel'
    }
  ]);

  const centrosAcopio = useMemo(() => centrosAcopioReales, [centrosAcopioReales]);
  const vacunas = useMemo(() => vacunasReales, [vacunasReales]);

  // Filtrar secciones según permisos
  const filteredSections = useMemo(() => {
    return REPORTS_SECTIONS.filter(section => canAccessSection('reportes', section.id));
  }, [canAccessSection]);

  const activeSection = useMemo(() => {
    if (currentSubModule === 'programacion-seguimiento-anual') return 'cenares';
    return currentSubModule || 'inventario';
  }, [currentSubModule]);

  const handleSectionChange = useCallback((sectionId: string) => {
    const section = REPORTS_SECTIONS.find(s => s.id === sectionId);
    if (section) {
      const path = section.path.split('/').pop() || sectionId;
      navigateToModule('reportes', path);
    }
  }, [navigateToModule]);

  const handleFiltrosChange = useCallback((newFiltros: typeof filtrosFechas) => {
    setFiltrosFechas(newFiltros);
  }, []);

  const handleProgramarReporte = useCallback((reporte: Omit<ReporteProgramado, 'id'>) => {
    setReportesProgramados(prev => [...prev, { ...reporte, id: Date.now().toString() }]);
    setShowModalProgramar(false);
  }, []);

  if (loadingFiltros) {
    return (
      <main className={COMPONENT_STYLES.pageBackground}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={COMPONENT_STYLES.pageBackground}>
      {/* Header */}
      <ReportesHeader>
        <button
          onClick={() => setShowModalProgramar(true)}
          className={COMPONENT_STYLES.button.secondary}
        >
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Programar</span>
        </button>
      </ReportesHeader>

      {/* Navigation Tabs */}
      <ReportesNav
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        sections={filteredSections}
      />

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="inventario" replace />} />
            <Route
              path="inventario"
              element={
                <InventarioTab
                  centrosAcopio={centrosAcopio}
                  vacunas={vacunas}
                />
              }
            />
            <Route
              path="movimientos"
              element={
                <MovimientosTab
                  centrosAcopio={centrosAcopio}
                  filtrosFechas={filtrosFechas}
                  onFiltrosChange={handleFiltrosChange}
                />
              }
            />
            <Route
              path="planificacion"
              element={
                <PlanificacionTab
                  centrosAcopio={centrosAcopio}
                  vacunas={vacunas}
                />
              }
            />
            <Route
              path="programacion-seguimiento-anual"
              element={
                <CenaresTab
                  centrosAcopio={centrosAcopio}
                  vacunas={vacunas}
                />
              }
            />
            <Route
              path="configuracion"
              element={
                <ConfiguracionTab
                  reportesProgramados={reportesProgramados}
                  onReportesProgramadosChange={setReportesProgramados}
                />
              }
            />
          </Routes>
        </div>
      </div>

      {/* Modal Programar Reporte */}
      {showModalProgramar && (
        <ProgramarReporteModal
          onClose={() => setShowModalProgramar(false)}
          onProgramar={handleProgramarReporte}
        />
      )}
    </main>
  );
};

// Modal Programar Reporte (inline simplificado)
interface ProgramarReporteModalProps {
  onClose: () => void;
  onProgramar: (reporte: Omit<ReporteProgramado, 'id'>) => void;
}

const ProgramarReporteModal: React.FC<ProgramarReporteModalProps> = ({
  onClose,
  onProgramar,
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'inventario',
    frecuencia: 'mensual',
    destinatarios: '',
    formato: 'pdf',
    estado: 'activo'
  });

  const tiposReporte = [
    { id: 'inventario', nombre: 'Inventario' },
    { id: 'movimientos', nombre: 'Movimientos' },
    { id: 'planificacion', nombre: 'Planificacion' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proximaEjecucion = new Date();
    proximaEjecucion.setDate(proximaEjecucion.getDate() + 30);

    onProgramar({
      ...formData,
      proximaEjecucion,
      destinatarios: formData.destinatarios.split(',').map(email => email.trim())
    });
  };

  return (
    <div className={COMPONENT_STYLES.modal.overlay}>
      <div className={COMPONENT_STYLES.modal.container}>
        <div className={COMPONENT_STYLES.modal.header}>
          <h2 className="text-lg font-semibold text-gray-900">
            Programar Reporte Automatico
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={COMPONENT_STYLES.modal.body}>
            <div className="space-y-4">
              <div>
                <label className={COMPONENT_STYLES.input.label}>Nombre del Reporte</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
                  placeholder="Ej: Reporte Mensual de Stock"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={COMPONENT_STYLES.input.label}>Tipo de Reporte</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                  >
                    {tiposReporte.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={COMPONENT_STYLES.input.label}>Frecuencia</label>
                  <select
                    value={formData.frecuencia}
                    onChange={(e) => setFormData({...formData, frecuencia: e.target.value})}
                    className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                  >
                    <option value="semanal">Semanal</option>
                    <option value="mensual">Mensual</option>
                    <option value="trimestral">Trimestral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={COMPONENT_STYLES.input.label}>Destinatarios (separados por comas)</label>
                <textarea
                  required
                  value={formData.destinatarios}
                  onChange={(e) => setFormData({...formData, destinatarios: e.target.value})}
                  className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
                  rows={2}
                  placeholder="coordinadora@saludapurimac.gob.pe"
                />
              </div>

              <div>
                <label className={COMPONENT_STYLES.input.label}>Formato</label>
                <select
                  value={formData.formato}
                  onChange={(e) => setFormData({...formData, formato: e.target.value})}
                  className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                </select>
              </div>
            </div>
          </div>

          <div className={COMPONENT_STYLES.modal.footer}>
            <button
              type="button"
              onClick={onClose}
              className={COMPONENT_STYLES.button.secondary}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={COMPONENT_STYLES.button.primary}
            >
              Programar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Reportes;
