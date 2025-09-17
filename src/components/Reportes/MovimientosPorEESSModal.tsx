import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Building2,
  Download,
  Loader2,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';

interface Establecimiento {
  id: string;
  nombre: string;
}

interface MovimientosPorEESSModalProps {
  onClose: () => void;
  onExportar: (filtros: MovimientosPorEESSFiltros) => void;
  centrosAcopio: Establecimiento[];
}

interface MovimientosPorEESSFiltros {
  centroAcopioId?: string;
  fechaInicio: string;
  fechaFin: string;
}

const MovimientosPorEESSModal: React.FC<MovimientosPorEESSModalProps> = ({
  onClose,
  onExportar,
  centrosAcopio
}) => {
  const { toast } = useToastContext();

  // Función para obtener fecha actual en zona horaria de Perú
  const getFechaPeruActual = () => {
    const ahora = new Date();
    // Perú está en UTC-5 (sin horario de verano)
    const fechaPeru = new Date(ahora.getTime() - (5 * 60 * 60 * 1000));
    return fechaPeru.toISOString().split('T')[0];
  };

  const getFechaPeruMesAnterior = () => {
    const ahora = new Date();
    // Perú está en UTC-5 (sin horario de verano)
    const fechaPeru = new Date(ahora.getTime() - (5 * 60 * 60 * 1000));
    fechaPeru.setMonth(fechaPeru.getMonth() - 1);
    return fechaPeru.toISOString().split('T')[0];
  };

  const [filtros, setFiltros] = useState<MovimientosPorEESSFiltros>({
    fechaInicio: getFechaPeruMesAnterior(),
    fechaFin: getFechaPeruActual()
  });

  const [exportando, setExportando] = useState(false);
  const [errores, setErrores] = useState<{ [key: string]: string }>({});

  // Validar formulario
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

      // Validar que no sea un rango muy amplio (más de 2 años)
      const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 730) {
        nuevosErrores.fechaFin = 'El rango de fechas no puede ser mayor a 2 años';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleExportar = async () => {
    if (!validarFormulario()) {
      toast.error('Por favor, corrija los errores en el formulario');
      return;
    }

    setExportando(true);
    try {
      await onExportar(filtros);
      toast.success('Reporte de Movimientos por EESS exportado exitosamente');
      onClose();
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      toast.error('Error al exportar el reporte. Por favor, inténtelo nuevamente.');
    } finally {
      setExportando(false);
    }
  };

  const handleCentroAcopioChange = (value: string) => {
    setFiltros(prev => ({
      ...prev,
      centroAcopioId: value === '' ? undefined : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Generar Reporte de Movimientos por EESS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Información del reporte */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Acerca de este reporte
                </h4>
                <p className="text-sm text-blue-800">
                  Este reporte genera un archivo Excel con los movimientos de vacunas agrupados por 
                  Establecimientos de Salud (EESS), mostrando las entregas, salidas y stock actual 
                  para cada vacuna en el período seleccionado.
                </p>
              </div>
            </div>
          </div>

          {/* Rango de Fechas */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Rango de Fechas *
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={filtros.fechaInicio}
                  onChange={(e) => setFiltros(prev => ({ ...prev, fechaInicio: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errores.fechaInicio ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errores.fechaInicio && (
                  <p className="text-red-600 text-xs mt-1">{errores.fechaInicio}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={filtros.fechaFin}
                  onChange={(e) => setFiltros(prev => ({ ...prev, fechaFin: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errores.fechaFin ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
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
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              Centro de Acopio (Opcional)
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Centro de Acopio
              </label>
              <select
                value={filtros.centroAcopioId || ''}
                onChange={(e) => handleCentroAcopioChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              disabled={exportando}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleExportar}
              disabled={exportando}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {exportando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando Excel...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generar Excel
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovimientosPorEESSModal;
export type { MovimientosPorEESSFiltros };
