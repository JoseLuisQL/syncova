import React, { memo, useCallback, useMemo, useState } from 'react';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import ExcelJS from 'exceljs';
import { Alerta } from '../../types';
import { useToastContext } from '../../contexts/ToastContext';
import { AlertSectionCard } from './components';
import { COMPONENT_STYLES, TIPOS_ALERTA } from './constants';

interface ReportesAlertasProps {
  alertas: Alerta[];
  isLoading?: boolean;
}

const ReportesAlertas: React.FC<ReportesAlertasProps> = memo(({
  alertas,
  isLoading = false,
}) => {
  const { toast } = useToastContext();
  const [filtroFecha, setFiltroFecha] = useState('7');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [isExporting, setIsExporting] = useState(false);

  const alertasFiltradas = useMemo(() => {
    const diasAtras = parseInt(filtroFecha, 10);
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasAtras);

    return alertas.filter((alerta) => {
      const fechaAlerta = new Date(alerta.fechaCreacion);
      const cumpleFecha = fechaAlerta >= fechaLimite;
      const cumpleTipo = filtroTipo === 'todos' || alerta.tipo === filtroTipo;
      return cumpleFecha && cumpleTipo;
    });
  }, [alertas, filtroFecha, filtroTipo]);

  const estadisticas = useMemo(() => {
    const totalPeriodo = alertasFiltradas.length;
    const promedioDiario = Math.round(totalPeriodo / parseInt(filtroFecha, 10)) || 0;

    const tipoMasFrecuente = TIPOS_ALERTA.reduce((max, tipo) => {
      const cantidad = alertasFiltradas.filter((alerta) => alerta.tipo === tipo.id).length;
      return cantidad > max.cantidad ? { tipo: tipo.label, cantidad } : max;
    }, { tipo: 'N/A', cantidad: 0 });

    return { totalPeriodo, promedioDiario, tipoMasFrecuente };
  }, [alertasFiltradas, filtroFecha]);

  const distribucionTipo = useMemo(
    () => TIPOS_ALERTA.map((tipo) => {
      const cantidad = alertasFiltradas.filter((alerta) => alerta.tipo === tipo.id).length;
      const porcentaje = alertasFiltradas.length > 0 ? (cantidad / alertasFiltradas.length) * 100 : 0;
      return { ...tipo, cantidad, porcentaje };
    }),
    [alertasFiltradas],
  );

  const handleExportExcel = useCallback(async () => {
    if (alertasFiltradas.length === 0) {
      toast.warning('Sin datos para exportar', 'No hay alertas en el período seleccionado.', { duration: 2500 });
      return;
    }

    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC';
      workbook.created = new Date();

      const wsAlertas = workbook.addWorksheet('Alertas', {
        properties: { tabColor: { argb: '0D9488' } },
      });

      wsAlertas.columns = [
        { header: 'Fecha', key: 'fecha', width: 18 },
        { header: 'Tipo', key: 'tipo', width: 18 },
        { header: 'Nivel', key: 'nivel', width: 14 },
        { header: 'Título', key: 'titulo', width: 40 },
        { header: 'Descripción', key: 'descripcion', width: 60 },
        { header: 'Estado', key: 'estado', width: 12 },
      ];

      wsAlertas.getRow(1).eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0D9488' } };
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      alertasFiltradas.forEach((alerta, index) => {
        const tipoLabel = TIPOS_ALERTA.find((tipo) => tipo.id === alerta.tipo)?.label || alerta.tipo;
        const row = wsAlertas.addRow({
          fecha: new Date(alerta.fechaCreacion).toLocaleString('es-PE'),
          tipo: tipoLabel,
          nivel: alerta.nivel,
          titulo: alerta.titulo,
          descripcion: alerta.descripcion,
          estado: alerta.leida ? 'Leída' : 'Pendiente',
        });

        if (index % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0FDFA' } };
          });
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_alertas_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Reporte exportado', 'El archivo Excel se descargó correctamente.', { duration: 2500 });
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('No se pudo exportar', 'Hubo un problema al generar el archivo Excel.', { duration: 3500 });
    } finally {
      setIsExporting(false);
    }
  }, [alertasFiltradas, toast]);

  return (
    <AlertSectionCard>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Reportes y análisis</h2>
            <p className="mt-1 text-sm text-slate-500">Filtra el período y exporta sin salir del módulo.</p>
          </div>
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
            Exportar Excel
          </button>
        </div>

        <section className={COMPONENT_STYLES.filter.container}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={COMPONENT_STYLES.input.label}>Período</label>
              <select
                value={filtroFecha}
                onChange={(event) => setFiltroFecha(event.target.value)}
                className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
              >
                <option value="1">Último día</option>
                <option value="7">Últimos 7 días</option>
                <option value="30">Últimos 30 días</option>
                <option value="90">Últimos 3 meses</option>
                <option value="365">Último año</option>
              </select>
            </div>
            <div>
              <label className={COMPONENT_STYLES.input.label}>Tipo de alerta</label>
              <select
                value={filtroTipo}
                onChange={(event) => setFiltroTipo(event.target.value)}
                className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
              >
                <option value="todos">Todos los tipos</option>
                {TIPOS_ALERTA.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>{tipo.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
          </div>
        ) : (
          <>
            <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-950">Distribución por tipo</h3>
                <div className="mt-4 space-y-3">
                  {distribucionTipo.map((tipo) => {
                    const Icon = tipo.icon;
                    return (
                      <div key={tipo.id} className="rounded-[16px] border border-slate-200 bg-slate-50/70 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className={`rounded-lg p-2 ${tipo.bgColor}`}>
                              <Icon className={`h-4 w-4 ${tipo.color}`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{tipo.label}</p>
                              <p className="text-xs text-slate-500">{tipo.cantidad} alerta(s)</p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">{tipo.porcentaje.toFixed(0)}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-950">Resumen del período</h3>
                <div className="mt-4 space-y-3">
                  <div className="rounded-[16px] border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Total del período</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{estadisticas.totalPeriodo}</p>
                  </div>
                  <div className="rounded-[16px] border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Promedio diario</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{estadisticas.promedioDiario}</p>
                  </div>
                  <div className="rounded-[16px] border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Tipo dominante</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{estadisticas.tipoMasFrecuente.tipo}</p>
                    <p className="mt-1 text-sm text-slate-500">{estadisticas.tipoMasFrecuente.cantidad} alerta(s)</p>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </AlertSectionCard>
  );
});

ReportesAlertas.displayName = 'ReportesAlertas';

export default ReportesAlertas;
