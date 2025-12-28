import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Activity,
  Calendar,
  AlertTriangle,
  Archive,
  Download,
} from 'lucide-react';
import { Establecimiento, Vacuna } from '../../../../types';
import { useReportes } from '../../../../hooks/useReportes';
import { useToastContext } from '../../../../contexts/ToastContext';
import {
  FiltrosReporteBase,
  FiltrosStockCritico,
  FiltrosVencimientos,
  FiltrosKardexDetallado,
  ConfiguracionExportacion
} from '../../../../types/reportes';
import { COMPONENT_STYLES } from '../../constants';
import { ReporteCard } from '..';
import KardexDetalladoModal from '../../modals/KardexDetalladoModal';
import VisualizarReporteModal from '../../modals/VisualizarReporteModal';

interface InventarioTabProps {
  centrosAcopio: Establecimiento[];
  vacunas: Vacuna[];
}

const InventarioTab: React.FC<InventarioTabProps> = ({
  centrosAcopio,
  vacunas,
}) => {
  const {
    reportes,
    estadisticas,
    estado,
    generarStockActual,
    generarStockCritico,
    generarVencimientos,
    generarLotesVencidos,
    generarKardexDetallado,
    obtenerEstadisticas,
    exportarExcel,
    exportarKardexDetallado,
    limpiarError
  } = useReportes();

  const { toast } = useToastContext();

  const [filtrosReportes, setFiltrosReportes] = useState<{
    stockActual: FiltrosReporteBase;
    stockCritico: FiltrosStockCritico;
    vencimientos: FiltrosVencimientos;
    lotesVencidos: FiltrosReporteBase;
  }>({
    stockActual: {},
    stockCritico: { porcentajeMinimo: 20, cantidadMinima: 50 },
    vencimientos: { diasAnticipacion: 30 },
    lotesVencidos: {}
  });

  const [showKardexModal, setShowKardexModal] = useState(false);
  const [reporteActivo, setReporteActivo] = useState<string | null>(null);
  const [reporteVisualizando, setReporteVisualizando] = useState<string | null>(null);

  useEffect(() => {
    obtenerEstadisticas();
  }, [obtenerEstadisticas]);

  const handleGenerarReporte = useCallback(async (tipoReporte: string) => {
    try {
      setReporteActivo(tipoReporte);
      let resultado: unknown[] | null = null;

      switch (tipoReporte) {
        case 'stock_actual':
          resultado = await generarStockActual(filtrosReportes.stockActual);
          break;
        case 'stock_critico':
          resultado = await generarStockCritico(filtrosReportes.stockCritico);
          break;
        case 'vencimientos':
          resultado = await generarVencimientos(filtrosReportes.vencimientos);
          break;
        case 'lotes_vencidos':
          resultado = await generarLotesVencidos(filtrosReportes.lotesVencidos);
          break;
      }

      if (resultado && Array.isArray(resultado) && resultado.length === 0) {
        toast.warning('Sin datos disponibles', 'No hay datos para los filtros seleccionados', { duration: 4000 });
      }
    } catch (error) {
      console.error('Error al generar reporte:', error);
    } finally {
      setReporteActivo(null);
    }
  }, [filtrosReportes, generarStockActual, generarStockCritico, generarVencimientos, generarLotesVencidos, toast]);

  const handleExportarExcel = useCallback(async (tipoReporte: string) => {
    try {
      const config: ConfiguracionExportacion = {
        incluirDetalles: true,
        incluirGraficos: false,
        incluirEstadisticas: true,
        formatoFecha: 'dd/mm/yyyy',
        responsableReporte: 'Sistema SIVAC',
        observaciones: `Reporte generado el ${new Date().toLocaleDateString('es-PE')}`
      };
      await exportarExcel(tipoReporte as 'stock_actual' | 'stock_critico' | 'vencimientos' | 'lotes_vencidos', config);
    } catch (error) {
      console.error('Error al exportar reporte:', error);
    }
  }, [exportarExcel]);

  const handleExportarKardex = useCallback(async (filtros: FiltrosKardexDetallado) => {
    try {
      const resultado = await generarKardexDetallado(filtros);

      if (resultado && Array.isArray(resultado) && resultado.length === 0) {
        toast.warning('Sin datos disponibles', 'No hay datos para el kardex detallado', { duration: 4000 });
        return;
      }

      const config: ConfiguracionExportacion = {
        incluirDetalles: true,
        incluirGraficos: false,
        incluirEstadisticas: true,
        formatoFecha: 'dd/mm/yyyy',
        responsableReporte: 'Sistema SIVAC',
        observaciones: `Kardex detallado generado el ${new Date().toLocaleDateString('es-PE')}`
      };

      await exportarKardexDetallado(filtros, config);
      setShowKardexModal(false);
      toast.success('Exportacion exitosa', `Kardex exportado: ${filtros.fechaInicio} al ${filtros.fechaFin}`, { duration: 3000 });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err?.response?.data?.error || err?.message || 'Error desconocido';
      toast.error('Error de exportacion', errorMessage, { duration: 5000 });
    }
  }, [generarKardexDetallado, exportarKardexDetallado, toast]);

  const handleFiltroChange = useCallback((campo: string, valor: string | undefined) => {
    setFiltrosReportes(prev => ({
      ...prev,
      stockActual: { ...prev.stockActual, [campo]: valor },
      stockCritico: { ...prev.stockCritico, [campo]: valor },
      vencimientos: { ...prev.vencimientos, [campo]: valor },
      lotesVencidos: { ...prev.lotesVencidos, [campo]: valor }
    }));
  }, []);

  const reportesInventario = [
    { id: 'stock_actual', nombre: 'Stock Actual', descripcion: 'Estado actual del inventario', icon: Package, color: 'teal' as const, datos: reportes.stockActual },
    { id: 'stock_critico', nombre: 'Stock Critico', descripcion: 'Vacunas con stock bajo o agotado', icon: Activity, color: 'rose' as const, datos: reportes.stockCritico },
    { id: 'vencimientos', nombre: 'Proximos Vencimientos', descripcion: 'Lotes por vencer en 30 dias', icon: Calendar, color: 'amber' as const, datos: reportes.vencimientos },
    { id: 'lotes_vencidos', nombre: 'Lotes Vencidos', descripcion: 'Lotes que ya han vencido', icon: AlertTriangle, color: 'rose' as const, datos: reportes.lotesVencidos },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Reportes de Inventario y Stock</h2>
        {estadisticas && (
          <span className="text-sm text-gray-500">
            Actualizado: {estadisticas.ultimaActualizacion.toLocaleString('es-PE')}
          </span>
        )}
      </div>

      {/* Estadisticas Rapidas */}
      {estadisticas && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-teal-600" />
              <div>
                <p className="text-xs font-medium text-teal-600">Total Vacunas</p>
                <p className="text-xl font-bold text-teal-900">{estadisticas.totalVacunas}</p>
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="text-xs font-medium text-emerald-600">Stock Total</p>
                <p className="text-xl font-bold text-emerald-900">{estadisticas.totalStock.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-rose-600" />
              <div>
                <p className="text-xs font-medium text-rose-600">Stock Critico</p>
                <p className="text-xl font-bold text-rose-900">{estadisticas.vacunasCriticas}</p>
              </div>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-amber-600" />
              <div>
                <p className="text-xs font-medium text-amber-600">Por Vencer</p>
                <p className="text-xl font-bold text-amber-900">{estadisticas.lotesProximosVencer}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <div>
                <p className="text-xs font-medium text-orange-600">Vencidos</p>
                <p className="text-xl font-bold text-orange-900">{estadisticas.lotesVencidos}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros Globales */}
      <div className={COMPONENT_STYLES.filter.container}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={COMPONENT_STYLES.input.label}>Centro de Acopio</label>
            <select
              value={filtrosReportes.stockActual.centroAcopioId || ''}
              onChange={(e) => handleFiltroChange('centroAcopioId', e.target.value || undefined)}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
            >
              <option value="">Todos los centros</option>
              {centrosAcopio.map((centro) => (
                <option key={centro.id} value={centro.id}>{centro.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={COMPONENT_STYLES.input.label}>Vacuna</label>
            <select
              value={filtrosReportes.stockActual.vacunaId || ''}
              onChange={(e) => handleFiltroChange('vacunaId', e.target.value || undefined)}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
            >
              <option value="">Todas las vacunas</option>
              {vacunas.map((vacuna) => (
                <option key={vacuna.id} value={vacuna.id}>{vacuna.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={COMPONENT_STYLES.input.label}>Incluir Inactivos</label>
            <select
              value={filtrosReportes.stockActual.incluirInactivos ? 'true' : 'false'}
              onChange={(e) => handleFiltroChange('incluirInactivos', e.target.value === 'true' ? 'true' : undefined)}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
            >
              <option value="false">Solo activos</option>
              <option value="true">Incluir inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {estado.error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-rose-600" />
              <div>
                <p className="text-sm font-medium text-rose-800">Error al generar reporte</p>
                <p className="text-sm text-rose-600">{estado.error}</p>
              </div>
            </div>
            <button onClick={limpiarError} className="text-rose-600 hover:text-rose-800 text-xl">&times;</button>
          </div>
        </div>
      )}

      {/* Reportes Disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportesInventario.map((reporte) => (
          <ReporteCard
            key={reporte.id}
            id={reporte.id}
            nombre={reporte.nombre}
            descripcion={reporte.descripcion}
            icon={reporte.icon}
            color={reporte.color}
            registros={reporte.datos.length}
            isLoading={estado.cargando && reporteActivo === reporte.id}
            hasData={reporte.datos.length > 0}
            onGenerar={() => handleGenerarReporte(reporte.id)}
            onExportar={() => handleExportarExcel(reporte.id)}
            onVerDatos={() => setReporteVisualizando(reporte.id)}
          />
        ))}

        {/* Kardex Detallado - Card especial */}
        <div className={COMPONENT_STYLES.reportCard.container}>
          <div className="flex items-start gap-4 mb-4">
            <div className={`${COMPONENT_STYLES.reportCard.iconWrapper} bg-emerald-100`}>
              <Archive className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className={COMPONENT_STYLES.reportCard.title}>Kardex Detallado</h3>
              <p className={COMPONENT_STYLES.reportCard.description}>Movimientos con filtros avanzados</p>
            </div>
          </div>
          <button
            onClick={() => setShowKardexModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            <span>Configurar y Exportar</span>
          </button>
        </div>
      </div>

      {/* Modales */}
      {showKardexModal && (
        <KardexDetalladoModal
          onClose={() => setShowKardexModal(false)}
          onExportar={handleExportarKardex}
          vacunas={vacunas}
          centrosAcopio={centrosAcopio}
        />
      )}

      {reporteVisualizando && (
        <VisualizarReporteModal
          tipoReporte={reporteVisualizando}
          datos={reportes}
          onClose={() => setReporteVisualizando(null)}
        />
      )}
    </div>
  );
};

export default React.memo(InventarioTab);
