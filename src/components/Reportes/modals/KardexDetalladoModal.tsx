import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Calendar,
  Package,
  ArrowRightLeft,
  Search,
  Download,
  Loader2,
  Archive,
} from 'lucide-react';
import { Vacuna, Establecimiento } from '../../../types';
import { FiltrosKardexDetallado } from '../../../types/reportes';
import { KardexService } from '../../../services/KardexService';
import { COMPONENT_STYLES } from '../constants';

interface KardexDetalladoModalProps {
  onClose: () => void;
  onExportar: (filtros: FiltrosKardexDetallado) => void;
  vacunas: Vacuna[];
  centrosAcopio: Establecimiento[];
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

const KardexDetalladoModal: React.FC<KardexDetalladoModalProps> = ({
  onClose,
  onExportar,
  vacunas,
  centrosAcopio
}) => {
  const [filtros, setFiltros] = useState<FiltrosKardexDetallado>({
    fechaInicio: getFechaPeruMesAnterior(),
    fechaFin: getFechaPeruActual()
  });

  const [jeringas, setJeringas] = useState<Array<{ id: string; nombre: string }>>([]);
  const [lotes, setLotes] = useState<Array<{ id: string; numero: string }>>([]);
  const [loadingJeringas, setLoadingJeringas] = useState(false);
  const [loadingLotes, setLoadingLotes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    const cargarJeringas = async () => {
      setLoadingJeringas(true);
      try {
        const jeringasData = await KardexService.getJeringas();
        setJeringas(jeringasData);
      } catch (error) {
        console.error('Error al cargar jeringas:', error);
        setJeringas([]);
      } finally {
        setLoadingJeringas(false);
      }
    };
    cargarJeringas();
  }, []);

  useEffect(() => {
    const cargarLotes = async () => {
      if (!filtros.tipo || !filtros.itemId) {
        setLotes([]);
        return;
      }

      setLoadingLotes(true);
      try {
        let lotesData: Array<{ id: string; numero: string }> = [];
        if (filtros.tipo === 'vacuna') {
          lotesData = await KardexService.getLotesVacunas(filtros.itemId);
        } else if (filtros.tipo === 'jeringa') {
          lotesData = await KardexService.getLotesJeringas(filtros.itemId);
        }
        setLotes(lotesData);
      } catch (error) {
        console.error('Error al cargar lotes:', error);
        setLotes([]);
      } finally {
        setLoadingLotes(false);
      }
    };
    cargarLotes();
  }, [filtros.tipo, filtros.itemId]);

  const handleExportar = useCallback(async () => {
    setExportando(true);
    try {
      const filtrosCompletos = {
        ...filtros,
        search: searchTerm || undefined
      };
      await onExportar(filtrosCompletos);
    } finally {
      setExportando(false);
    }
  }, [filtros, searchTerm, onExportar]);

  const getItemsDisponibles = useCallback(() => {
    if (!filtros.tipo) return [];
    return filtros.tipo === 'vacuna' ? vacunas : jeringas;
  }, [filtros.tipo, vacunas, jeringas]);

  return (
    <div className={COMPONENT_STYLES.modal.overlay}>
      <div className={COMPONENT_STYLES.modal.containerLarge}>
        <div className={COMPONENT_STYLES.modal.header}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Archive className="h-5 w-5 text-teal-600" />
              <h3 className="text-lg font-semibold text-gray-900">Configurar Kardex Detallado</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className={COMPONENT_STYLES.modal.body}>
          <div className="space-y-5">
            {/* Fechas */}
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
                    className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
                    required
                  />
                </div>
                <div>
                  <label className={COMPONENT_STYLES.input.label}>Fecha Fin</label>
                  <input
                    type="date"
                    value={filtros.fechaFin}
                    onChange={(e) => setFiltros(prev => ({ ...prev, fechaFin: e.target.value }))}
                    className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Filtros de Producto */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Filtros de Producto
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={COMPONENT_STYLES.input.label}>Tipo</label>
                  <select
                    value={filtros.tipo || ''}
                    onChange={(e) => {
                      const nuevoTipo = e.target.value as 'vacuna' | 'jeringa' || undefined;
                      setFiltros(prev => ({
                        ...prev,
                        tipo: nuevoTipo,
                        itemId: undefined,
                        loteId: undefined
                      }));
                    }}
                    className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                  >
                    <option value="">Todos</option>
                    <option value="vacuna">Vacunas</option>
                    <option value="jeringa">Jeringas</option>
                  </select>
                </div>
                <div>
                  <label className={COMPONENT_STYLES.input.label}>
                    {filtros.tipo === 'vacuna' ? 'Vacuna' : filtros.tipo === 'jeringa' ? 'Jeringa' : 'Item'}
                  </label>
                  <select
                    value={filtros.itemId || ''}
                    onChange={(e) => setFiltros(prev => ({
                      ...prev,
                      itemId: e.target.value || undefined,
                      loteId: undefined
                    }))}
                    className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                    disabled={!filtros.tipo || (filtros.tipo === 'jeringa' && loadingJeringas)}
                  >
                    <option value="">Todos</option>
                    {getItemsDisponibles().map((item) => (
                      <option key={item.id} value={item.id}>{item.nombre}</option>
                    ))}
                  </select>
                  {filtros.tipo === 'jeringa' && loadingJeringas && (
                    <p className="text-xs text-gray-500 mt-1">Cargando jeringas...</p>
                  )}
                </div>
                <div>
                  <label className={COMPONENT_STYLES.input.label}>Lote</label>
                  <select
                    value={filtros.loteId || ''}
                    onChange={(e) => setFiltros(prev => ({ ...prev, loteId: e.target.value || undefined }))}
                    className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                    disabled={!filtros.itemId || loadingLotes}
                  >
                    <option value="">Todos</option>
                    {lotes.map((lote) => (
                      <option key={lote.id} value={lote.id}>{lote.numero}</option>
                    ))}
                  </select>
                  {loadingLotes && (
                    <p className="text-xs text-gray-500 mt-1">Cargando lotes...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Filtros de Movimiento */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                Filtros de Movimiento
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={COMPONENT_STYLES.input.label}>Tipo de Movimiento</label>
                  <select
                    value={filtros.tipoMovimiento || ''}
                    onChange={(e) => setFiltros(prev => ({ ...prev, tipoMovimiento: e.target.value as 'ingreso' | 'salida' | 'transferencia' | 'ajuste' || undefined }))}
                    className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                  >
                    <option value="">Todos</option>
                    <option value="ingreso">Ingreso</option>
                    <option value="salida">Salida</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="ajuste">Ajuste</option>
                  </select>
                </div>
                <div>
                  <label className={COMPONENT_STYLES.input.label}>Establecimiento</label>
                  <select
                    value={filtros.establecimientoId || ''}
                    onChange={(e) => setFiltros(prev => ({ ...prev, establecimientoId: e.target.value || undefined }))}
                    className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                  >
                    <option value="">Todos</option>
                    {centrosAcopio.map((centro) => (
                      <option key={centro.id} value={centro.id}>{centro.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Busqueda */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Search className="h-4 w-4" />
                Busqueda y Opciones
              </h4>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por documento, numero, observaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${COMPONENT_STYLES.filter.searchInput}`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="incluirTrazabilidad"
                    checked={filtros.incluirTrazabilidad || false}
                    onChange={(e) => setFiltros(prev => ({ ...prev, incluirTrazabilidad: e.target.checked }))}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="incluirTrazabilidad" className="text-sm text-gray-700">
                    Incluir informacion de trazabilidad completa
                  </label>
                </div>
              </div>
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
            type="button"
            onClick={handleExportar}
            disabled={exportando}
            className={COMPONENT_STYLES.button.primary}
          >
            {exportando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exportar Excel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(KardexDetalladoModal);
