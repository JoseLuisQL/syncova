import React, { useCallback, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useKardexFiltros } from '../../hooks/useKardexData';
import { useCurrentRoute } from '../../hooks/useRouting';
import { usePermissions } from '../../hooks/usePermissions';
import { ReportScheduleModal, ReportsShell } from './components';
import { COMPONENT_STYLES, REPORTS_SECTIONS, ReporteProgramado, SectionId } from './constants';
import { ConfiguracionTab, InventarioTab, MovimientosTab, PlanificacionTab, CenaresTab } from './components/tabs';

const INITIAL_PROGRAMADOS: ReporteProgramado[] = [
  {
    id: '1',
    nombre: 'Reporte Mensual de Stock',
    tipo: 'inventario',
    frecuencia: 'mensual',
    proximaEjecucion: new Date('2026-04-15T18:00:00'),
    estado: 'activo',
    destinatarios: ['coordinadora@saludapurimac.gob.pe'],
    formato: 'pdf',
  },
  {
    id: '2',
    nombre: 'Análisis de Consumo Trimestral',
    tipo: 'planificacion',
    frecuencia: 'trimestral',
    proximaEjecucion: new Date('2026-06-01T08:30:00'),
    estado: 'activo',
    destinatarios: ['admin@saludapurimac.gob.pe'],
    formato: 'excel',
  },
];

const Reportes: React.FC = () => {
  const { currentSubModule } = useCurrentRoute();
  const { canAccessSection } = usePermissions();
  const { vacunas: vacunasReales, centrosAcopio: centrosAcopioReales, loading } = useKardexFiltros();

  const [filtrosFechas, setFiltrosFechas] = useState({
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    centroAcopio: 'todos',
  });
  const [reportesProgramados, setReportesProgramados] = useState<ReporteProgramado[]>(INITIAL_PROGRAMADOS);
  const [scheduleModalReporte, setScheduleModalReporte] = useState<ReporteProgramado | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const accessibleSections = useMemo(
    () => REPORTS_SECTIONS.filter((section) => canAccessSection('reportes', section.id)),
    [canAccessSection],
  );
  const visibleSections = useMemo(
    () => accessibleSections.filter((section) => section.id !== 'configuracion'),
    [accessibleSections],
  );

  const activeSection = useMemo<SectionId>(() => {
    if (currentSubModule === 'programacion-seguimiento-anual') return 'cenares';
    const current = accessibleSections.find((section) => section.routeSegment === currentSubModule || section.id === currentSubModule);
    return current?.id || 'inventario';
  }, [accessibleSections, currentSubModule]);

  const openCreateScheduleModal = useCallback(() => {
    setScheduleModalReporte(null);
    setIsScheduleModalOpen(true);
  }, []);

  const openEditScheduleModal = useCallback((reporte: ReporteProgramado) => {
    setScheduleModalReporte(reporte);
    setIsScheduleModalOpen(true);
  }, []);

  const closeScheduleModal = useCallback(() => {
    setIsScheduleModalOpen(false);
    setScheduleModalReporte(null);
  }, []);

  const handleSaveScheduledReport = useCallback((reporte: Omit<ReporteProgramado, 'id'>, existingId?: string) => {
    setReportesProgramados((prev) => {
      if (existingId) {
        return prev.map((item) => (item.id === existingId ? { ...item, ...reporte } : item));
      }

      return [...prev, { ...reporte, id: Date.now().toString() }];
    });

    closeScheduleModal();
  }, [closeScheduleModal]);

  const handleDeleteScheduledReport = useCallback((id: string) => {
    setReportesProgramados((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleToggleScheduledReport = useCallback((id: string) => {
    setReportesProgramados((prev) =>
      prev.map((item) => (
        item.id === id
          ? { ...item, estado: item.estado === 'activo' ? 'inactivo' : 'activo' }
          : item
      )),
    );
  }, []);

  if (loading) {
    return (
      <main className={COMPONENT_STYLES.pageBackground}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4 rounded-[24px] border border-slate-200 bg-white px-8 py-10 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-900">Cargando entorno de reportes</p>
              <p className="mt-1 text-sm text-slate-500">Preparando filtros y catálogos operativos.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <ReportsShell
        activeSection={activeSection}
        sections={visibleSections}
      >
        <Routes>
          <Route path="/" element={<Navigate to="inventario" replace />} />
          <Route
            path="inventario"
            element={(
              <InventarioTab
                centrosAcopio={centrosAcopioReales}
                vacunas={vacunasReales}
              />
            )}
          />
          <Route
            path="movimientos"
            element={(
              <MovimientosTab
                centrosAcopio={centrosAcopioReales}
                filtrosFechas={filtrosFechas}
                onFiltrosChange={setFiltrosFechas}
              />
            )}
          />
          <Route
            path="planificacion"
            element={(
              <PlanificacionTab
                centrosAcopio={centrosAcopioReales}
                vacunas={vacunasReales}
              />
            )}
          />
          <Route
            path="programacion-seguimiento-anual"
            element={(
              <CenaresTab
                centrosAcopio={centrosAcopioReales}
                vacunas={vacunasReales}
              />
            )}
          />
          <Route
            path="configuracion"
            element={(
              <ConfiguracionTab
                reportesProgramados={reportesProgramados}
                onOpenCreate={openCreateScheduleModal}
                onOpenEdit={openEditScheduleModal}
                onDelete={handleDeleteScheduledReport}
                onToggleEstado={handleToggleScheduledReport}
              />
            )}
          />
          <Route path="*" element={<Navigate to={visibleSections[0]?.routeSegment || 'inventario'} replace />} />
        </Routes>
      </ReportsShell>

      <ReportScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={closeScheduleModal}
        onSubmit={handleSaveScheduledReport}
        reporte={scheduleModalReporte}
      />
    </>
  );
};

export default Reportes;
