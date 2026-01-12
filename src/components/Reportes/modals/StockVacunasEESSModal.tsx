import React, { useState, useCallback, useMemo } from 'react';
import {
  X,
  Calendar,
  Building2,
  Package,
  Download,
  Loader2,
  FileSpreadsheet,
  AlertCircle,
  CheckSquare,
  Square
} from 'lucide-react';
import { Vacuna, Establecimiento } from '../../../types';
import { COMPONENT_STYLES } from '../constants';

interface StockVacunasEESSModalProps {
  onClose: () => void;
  onExportar: (filtros: StockVacunasEESSFiltros) => Promise<void>;
  vacunas: Vacuna[];
  centrosAcopio: Establecimiento[];
}

export interface StockVacunasEESSFiltros {
  fechaInicio: string;
  fechaFin: string;
  centroAcopioId?: string;
  vacunaIds: string[];
}

const getFechaPeruActual = () => {
  const ahora = new Date();
  const fechaPeru = new Date(ahora.getTime() - (5 * 60 * 60 * 1000));
  return fechaPeru.toISOString().split('T')[0];
};

const getFechaPeruMesAnterior = () => {
  const ahora = new Date();
  const fechaPeru = new Date(ahora.getTime() - (5 * 60 * 60 * 1000));
  fechaPeru.setMonth(fechaPeru.getMonth() - 1);
  return fechaPeru.toISOString().split('T')[0];
};

const StockVacunasEESSModal: React.FC<StockVacunasEESSModalProps> = ({
  onClose,
  onExportar,
  vacunas,
  centrosAcopio
}) => {
  const [filtros, setFiltros] = useState<StockVacunasEESSFiltros>({
    fechaInicio: getFechaPeruMesAnterior(),
    fechaFin: getFechaPeruActual(),
    vacunaIds: vacunas.map(v => v.id)
  });

  const [exportando, setExportando] = useState(false);
  const [errores, setErrores] = useState<{ [key: string]: string }>({});

  const todasSeleccionadas = useMemo(() => {
    return filtros.vacunaIds.length === vacunas.length;
  }, [filtros.vacunaIds.length, vacunas.length]);

  const algunasSeleccionadas = useMemo(() => {
    return filtros.vacunaIds.length > 0 && filtros.vacunaIds.length < vacunas.length;
  }, [filtros.vacunaIds.length, vacunas.length]);

  const handleToggleTodasVacunas = useCallback(() => {
    if (todasSeleccionadas) {
      setFiltros(prev => ({ ...prev, vacunaIds: [] }));
    } else {
      setFiltros(prev => ({ ...prev, vacunaIds: vacunas.map(v => v.id) }));
    }
  }, [todasSeleccionadas, vacunas]);

  const handleToggleVacuna = useCallback((vacunaId: string) => {
    setFiltros(prev => {
      const isSelected = prev.vacunaIds.includes(vacunaId);
      if (isSelected) {
        return { ...prev, vacunaIds: prev.vacunaIds.filter(id => id !== vacunaId) };
      } else {
        return { ...prev, vacunaIds: [...prev.vacunaIds, vacunaId] };
      }
    });
  }, []);

  const validarFormulario = (): boolean => {
    const nuevosErrores: { [key: string]: string } = {};

    if (!filtros.fechaInicio) {
      nuevosErrores.fechaInicio = 'La fecha de inicio es requerida';
    }

    if (!filtros.fechaFin) {
      nuevosErrores.fechaFin = 'La fecha de fin es requerida';
    }

    if (filtros.fechaInicio && filtros.fechaFin) {
      const fechaInicio = new Date(filtros.fechaInicio);
      const fechaFin = new Date(filtros.fechaFin);

      if (fechaInicio > fechaFin) {
        nuevosErrores.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }

      const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 730) {
        nuevosErrores.fechaFin = 'El rango de fechas no puede ser mayor a 2 años';
      }
    }

    if (filtros.vacunaIds.length === 0) {
      nuevosErrores.vacunas = 'Debe seleccionar al menos una vacuna';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleExportar = async () => {
    if (!validarFormulario()) {
      return;
    }

    setExportando(true);
    try {
      await onExportar(filtros);
      onClose();
    } catch (error) {
      console.error('Error al exportar reporte:', error);
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className={COMPONENT_STYLES.modal.overlay}>
      <div className={COMPONENT_STYLES.modal.containerLarge}>
        <div className={COMPONENT_STYLES.modal.header}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-cyan-600" />
              <h3 className="text-lg font-semibold text-gray-900">Stock de Vacunas en EESS</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className={COMPONENT_STYLES.modal.body}>
          <div className="space-y-5">
            {/* Informacion del reporte */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-cyan-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-cyan-900 mb-1">
                    Acerca de este reporte
                  </h4>
                  <p className="text-sm text-cyan-800">
                    Este reporte genera un archivo Excel con el stock disponible de vacunas 
                    en cada Establecimiento de Salud (EESS), agrupado por Centro de Acopio.
                  </p>
                </div>
              </div>
            </div>

            {/* Rango de Fechas */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Rango de Fechas *
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={COMPONENT_STYLES.input.label}>Fecha Inicio</label>
                  <input
                    type="date"
                    value={filtros.fechaInicio}
                    onChange={(e) => setFiltros(prev => ({ ...prev, fechaInicio: e.target.value }))}
                    className={`${COMPONENT_STYLES.input.base} ${errores.fechaInicio ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal}`}
                    required
                  />
                  {errores.fechaInicio && (
                    <p className="text-red-600 text-xs mt-1">{errores.fechaInicio}</p>
                  )}
                </div>
                <div>
                  <label className={COMPONENT_STYLES.input.label}>Fecha Fin</label>
                  <input
                    type="date"
                    value={filtros.fechaFin}
                    onChange={(e) => setFiltros(prev => ({ ...prev, fechaFin: e.target.value }))}
                    className={`${COMPONENT_STYLES.input.base} ${errores.fechaFin ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal}`}
                    required
                  />
                  {errores.fechaFin && (
                    <p className="text-red-600 text-xs mt-1">{errores.fechaFin}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Centro de Acopio */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Centro de Acopio (Opcional)
              </h4>
              <select
                value={filtros.centroAcopioId || ''}
                onChange={(e) => setFiltros(prev => ({ ...prev, centroAcopioId: e.target.value || undefined }))}
                className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
              >
                <option value="">Todos los Centros de Acopio</option>
                {centrosAcopio.map((centro) => (
                  <option key={centro.id} value={centro.id}>
                    {centro.nombre}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Si no selecciona un centro específico, se incluirán todos los establecimientos
              </p>
            </div>

            {/* Seleccion de Vacunas */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Vacunas a incluir *
              </h4>
              
              {/* Checkbox Seleccionar Todas */}
              <div className="mb-3 pb-3 border-b border-gray-200">
                <button
                  type="button"
                  onClick={handleToggleTodasVacunas}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-cyan-600 transition-colors"
                >
                  {todasSeleccionadas ? (
                    <CheckSquare className="h-5 w-5 text-cyan-600" />
                  ) : algunasSeleccionadas ? (
                    <div className="h-5 w-5 border-2 border-cyan-600 rounded bg-cyan-100 flex items-center justify-center">
                      <div className="h-2 w-2 bg-cyan-600 rounded-sm"></div>
                    </div>
                  ) : (
                    <Square className="h-5 w-5 text-gray-400" />
                  )}
                  Seleccionar todas ({vacunas.length})
                </button>
              </div>

              {/* Lista de Vacunas */}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {vacunas.map((vacuna) => {
                  const isSelected = filtros.vacunaIds.includes(vacuna.id);
                  return (
                    <button
                      key={vacuna.id}
                      type="button"
                      onClick={() => handleToggleVacuna(vacuna.id)}
                      className="w-full flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg p-2 transition-colors text-left"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-cyan-600 flex-shrink-0" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className={isSelected ? 'text-gray-900' : 'text-gray-600'}>
                        {vacuna.nombre}
                      </span>
                    </button>
                  );
                })}
              </div>

              {errores.vacunas && (
                <p className="text-red-600 text-xs mt-2">{errores.vacunas}</p>
              )}

              <p className="text-xs text-gray-500 mt-2">
                {filtros.vacunaIds.length} de {vacunas.length} vacunas seleccionadas
              </p>
            </div>
          </div>
        </div>

        <div className={COMPONENT_STYLES.modal.footer}>
          <button
            type="button"
            onClick={onClose}
            className={COMPONENT_STYLES.button.secondary}
            disabled={exportando}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleExportar}
            disabled={exportando}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando Excel...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Generar Excel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(StockVacunasEESSModal);
export type { StockVacunasEESSFiltros };
