import React from 'react';
import {
  X,
  Package,
  Activity,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { COMPONENT_STYLES } from '../constants';

interface VisualizarReporteModalProps {
  tipoReporte: string;
  datos: {
    stockActual: unknown[];
    stockCritico: unknown[];
    vencimientos: unknown[];
    lotesVencidos: unknown[];
  };
  onClose: () => void;
}

interface StockActualItem {
  vacunaNombre: string;
  vacunaTipo: string;
  stockTotal: number;
  totalLotes: number;
  lotesPorVencer: number;
  ultimaActualizacion: string;
}

interface StockCriticoItem {
  vacunaNombre: string;
  vacunaTipo: string;
  stockTotal: number;
  stockMinimo: number;
  porcentajeCritico: number;
  nivelCriticidad: string;
  recomendacionAccion: string;
}

interface VencimientoItem {
  numeroLote: string;
  vacunaNombre: string;
  vacunaTipo: string;
  cantidadActual: number;
  fechaVencimiento: string;
  diasParaVencer: number;
  nivelUrgencia: string;
}

interface LoteVencidoItem {
  numeroLote: string;
  vacunaNombre: string;
  vacunaTipo: string;
  cantidadActual: number;
  fechaVencimiento: string;
  diasVencido: number;
  nivelCriticidad: string;
}

const VisualizarReporteModal: React.FC<VisualizarReporteModalProps> = ({
  tipoReporte,
  datos,
  onClose
}) => {
  const getTitulo = () => {
    const titulos: Record<string, string> = {
      'stock_actual': 'Stock Actual',
      'stock_critico': 'Stock Critico',
      'vencimientos': 'Proximos Vencimientos',
      'lotes_vencidos': 'Lotes Vencidos',
    };
    return titulos[tipoReporte] || 'Datos del Reporte';
  };

  const getDatos = () => {
    const mapping: Record<string, unknown[]> = {
      'stock_actual': datos.stockActual,
      'stock_critico': datos.stockCritico,
      'vencimientos': datos.vencimientos,
      'lotes_vencidos': datos.lotesVencidos,
    };
    return mapping[tipoReporte] || [];
  };

  const renderEmptyState = (icon: React.ReactNode, mensaje: string) => (
    <div className="text-center py-12">
      <div className="text-gray-300 mb-4">{icon}</div>
      <p className="text-gray-500">{mensaje}</p>
    </div>
  );

  const renderStockActual = () => {
    const items = getDatos() as StockActualItem[];
    if (items.length === 0) return renderEmptyState(<Package className="h-12 w-12 mx-auto" />, 'No hay datos de stock actual');

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={COMPONENT_STYLES.table.header}>
            <tr>
              <th className={COMPONENT_STYLES.table.headerCell}>Vacuna</th>
              <th className={COMPONENT_STYLES.table.headerCell}>Stock Total</th>
              <th className={COMPONENT_STYLES.table.headerCell}>Total Lotes</th>
              <th className={COMPONENT_STYLES.table.headerCell}>Por Vencer</th>
              <th className={COMPONENT_STYLES.table.headerCell}>Ultima Actualizacion</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index} className={COMPONENT_STYLES.table.row}>
                <td className={COMPONENT_STYLES.table.cell}>
                  <div className="text-sm font-medium text-gray-900">{item.vacunaNombre}</div>
                  <div className="text-xs text-gray-500">{item.vacunaTipo}</div>
                </td>
                <td className={COMPONENT_STYLES.table.cell}>
                  <span className="text-sm font-bold text-gray-900">{item.stockTotal.toLocaleString()}</span>
                </td>
                <td className={COMPONENT_STYLES.table.cell}>
                  <span className="text-sm text-gray-900">{item.totalLotes}</span>
                </td>
                <td className={COMPONENT_STYLES.table.cell}>
                  <span className="text-sm text-gray-900">{item.lotesPorVencer}</span>
                </td>
                <td className={COMPONENT_STYLES.table.cell}>
                  <span className="text-sm text-gray-900">{new Date(item.ultimaActualizacion).toLocaleDateString('es-PE')}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderStockCritico = () => {
    const items = getDatos() as StockCriticoItem[];
    if (items.length === 0) return renderEmptyState(<Activity className="h-12 w-12 mx-auto" />, 'No hay vacunas con stock critico');

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={COMPONENT_STYLES.table.header}>
            <tr>
              <th className={COMPONENT_STYLES.table.headerCell}>Vacuna</th>
              <th className={COMPONENT_STYLES.table.headerCell}>Stock Actual</th>
              <th className={COMPONENT_STYLES.table.headerCell}>Stock Minimo</th>
              <th className={COMPONENT_STYLES.table.headerCell}>% Critico</th>
              <th className={COMPONENT_STYLES.table.headerCell}>Nivel</th>
              <th className={COMPONENT_STYLES.table.headerCell}>Accion</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index} className={COMPONENT_STYLES.table.row}>
                <td className={COMPONENT_STYLES.table.cell}>
                  <div className="text-sm font-medium text-gray-900">{item.vacunaNombre}</div>
                  <div className="text-xs text-gray-500">{item.vacunaTipo}</div>
                </td>
                <td className={COMPONENT_STYLES.table.cell}>
                  <span className="text-sm font-bold text-gray-900">{item.stockTotal.toLocaleString()}</span>
                </td>
                <td className={COMPONENT_STYLES.table.cell}>
                  <span className="text-sm text-gray-900">{item.stockMinimo.toLocaleString()}</span>
                </td>
                <td className={COMPONENT_STYLES.table.cell}>
                  <span className="text-sm font-medium text-gray-900">{item.porcentajeCritico}%</span>
                </td>
                <td className={COMPONENT_STYLES.table.cell}>
                  <span className={`${COMPONENT_STYLES.badge[item.nivelCriticidad === 'agotado' || item.nivelCriticidad === 'critico' ? 'danger' : 'warning']}`}>
                    {item.nivelCriticidad.toUpperCase()}
                  </span>
                </td>
                <td className={COMPONENT_STYLES.table.cell}>
                  <span className="text-sm text-gray-900">{item.recomendacionAccion}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderVencimientos = () => {
    const items = getDatos() as VencimientoItem[];
    if (items.length === 0) return renderEmptyState(<Calendar className="h-12 w-12 mx-auto" />, 'No hay lotes proximos a vencer');

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={COMPONENT_STYLES.table.header}>
            <tr>
              <th className={COMPONENT_STYLES.table.headerCell}>Lote</th>
              <th className={COMPONENT_STYLES.table.headerCell}>Vacuna</th>
              <th className={COMPONENT_STYLES.table.headerCell}>Cantidad</th>
              <th className={COMPONENT_STYLES.table.headerCell}>Vencimiento</th>
              <th className={COMPONENT_STYLES.table.headerCell}>Dias</th>
              <th className={COMPONENT_STYLES.table.headerCell}>Urgencia</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index} className={COMPONENT_STYLES.table.row}>
                <td className={COMPONENT_STYLES.table.cell}>
                  <span className="text-sm font-medium text-gray-900">{item.numeroLote}</span>
                </td>
                <td className={COMPONENT_STYLES.table.cell}>
                  <div className="text-sm font-medium text-gray-900">{item.vacunaNombre}</div>
                  <div className="text-xs text-gray-500">{item.vacunaTipo}</div>
                </td>
                <td className={COMPONENT_STYLES.table.cell}>
                  <span className="text-sm font-bold text-gray-900">{item.cantidadActual.toLocaleString()}</span>
                </td>
                <td className={COMPONENT_STYLES.table.cell}>
                  <span className="text-sm text-gray-900">{new Date(item.fechaVencimiento).toLocaleDateString('es-PE')}</span>
                </td>
                <td className={COMPONENT_STYLES.table.cell}>
                  <span className="text-sm font-medium text-gray-900">{item.diasParaVencer} dias</span>
                </td>
                <td className={COMPONENT_STYLES.table.cell}>
                  <span className={`${COMPONENT_STYLES.badge[item.nivelUrgencia === 'inmediato' || item.nivelUrgencia === 'urgente' ? 'danger' : item.nivelUrgencia === 'atencion' ? 'warning' : 'active']}`}>
                    {item.nivelUrgencia.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderLotesVencidos = () => {
    const items = getDatos() as LoteVencidoItem[];
    if (items.length === 0) return renderEmptyState(<AlertTriangle className="h-12 w-12 mx-auto" />, 'No hay lotes vencidos');

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={COMPONENT_STYLES.table.header}>
            <tr>
              <th className={COMPONENT_STYLES.table.headerCell}>Lote</th>
              <th className={COMPONENT_STYLES.table.headerCell}>Vacuna</th>
              <th className={COMPONENT_STYLES.table.headerCell}>Cantidad</th>
              <th className={COMPONENT_STYLES.table.headerCell}>Vencimiento</th>
              <th className={COMPONENT_STYLES.table.headerCell}>Dias Vencido</th>
              <th className={COMPONENT_STYLES.table.headerCell}>Criticidad</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index} className={COMPONENT_STYLES.table.row}>
                <td className={COMPONENT_STYLES.table.cell}>
                  <span className="text-sm font-medium text-gray-900">{item.numeroLote}</span>
                </td>
                <td className={COMPONENT_STYLES.table.cell}>
                  <div className="text-sm font-medium text-gray-900">{item.vacunaNombre}</div>
                  <div className="text-xs text-gray-500">{item.vacunaTipo}</div>
                </td>
                <td className={COMPONENT_STYLES.table.cell}>
                  <span className="text-sm font-bold text-gray-900">{item.cantidadActual.toLocaleString()}</span>
                </td>
                <td className={COMPONENT_STYLES.table.cell}>
                  <span className="text-sm text-gray-900">{new Date(item.fechaVencimiento).toLocaleDateString('es-PE')}</span>
                </td>
                <td className={COMPONENT_STYLES.table.cell}>
                  <span className="text-sm font-medium text-rose-600">{item.diasVencido} dias</span>
                </td>
                <td className={COMPONENT_STYLES.table.cell}>
                  <span className={COMPONENT_STYLES.badge.danger}>
                    {item.nivelCriticidad.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderContenido = () => {
    switch (tipoReporte) {
      case 'stock_actual':
        return renderStockActual();
      case 'stock_critico':
        return renderStockCritico();
      case 'vencimientos':
        return renderVencimientos();
      case 'lotes_vencidos':
        return renderLotesVencidos();
      default:
        return <p className="text-gray-500 text-center py-8">Tipo de reporte no soportado</p>;
    }
  };

  return (
    <div className={COMPONENT_STYLES.modal.overlay}>
      <div className={COMPONENT_STYLES.modal.containerLarge}>
        <div className={COMPONENT_STYLES.modal.header}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{getTitulo()}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">{getDatos().length} registros encontrados</p>
        </div>
        <div className={COMPONENT_STYLES.modal.body}>
          {renderContenido()}
        </div>
        <div className={COMPONENT_STYLES.modal.footer}>
          <button onClick={onClose} className={COMPONENT_STYLES.button.secondary}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(VisualizarReporteModal);
