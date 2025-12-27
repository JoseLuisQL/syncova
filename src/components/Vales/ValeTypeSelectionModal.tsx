import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  X,
  FileText,
  Plus,
  CheckCircle,
  AlertCircle,
  Building2,
  Calendar,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Package
} from 'lucide-react';
import { ValesService, EntregaAdicionalInfo, ValeTypeSelectionConfig, GrupoEntregaAdicional } from '../../services/valesService';
import { StockValidationService, StockValidationRequest, StockValidationResult } from '../../services/stockValidationService';
import { useToastContext } from '../../contexts/ToastContext';
import { MESES } from './constants';

interface ValeTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: ValeTypeSelectionConfig) => void;
  centroAcopioId: string;
  centroAcopioNombre: string;
  mes: number;
  anio: number;
}

// Componente de opción de tipo de vale
const TipoValeOption = memo<{
  titulo: string;
  descripcion: string;
  icon: React.ElementType;
  isSelected: boolean;
  isDisabled: boolean;
  disabledReason?: string;
  badge?: string;
  badgeColor?: string;
  onClick: () => void;
}>(({ titulo, descripcion, icon: Icon, isSelected, isDisabled, disabledReason, badge, badgeColor, onClick }) => (
  <div
    onClick={() => !isDisabled && onClick()}
    className={`border-2 rounded-xl p-4 transition-all ${
      isDisabled
        ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
        : isSelected
          ? 'border-teal-500 bg-teal-50 cursor-pointer shadow-md'
          : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/30 cursor-pointer'
    }`}
  >
    <div className="flex items-start gap-4">
      {/* Radio button */}
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isSelected && !isDisabled
          ? 'border-teal-600 bg-teal-600'
          : 'border-gray-300'
      }`}>
        {isSelected && !isDisabled && (
          <div className="w-2 h-2 rounded-full bg-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Icon className={`h-5 w-5 ${isDisabled ? 'text-gray-400' : 'text-teal-600'}`} />
          <h4 className={`font-semibold ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
            {titulo}
          </h4>
          {badge && (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badgeColor || 'bg-gray-100 text-gray-600'}`}>
              {badge}
            </span>
          )}
        </div>
        <p className={`text-sm mt-1 ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
          {isDisabled && disabledReason ? disabledReason : descripcion}
        </p>
      </div>
    </div>
  </div>
));

TipoValeOption.displayName = 'TipoValeOption';

// Componente de grupo de entrega adicional
const GrupoEntregaCard = memo<{
  grupo: GrupoEntregaAdicional;
  isSelected: boolean;
  onToggle: () => void;
}>(({ grupo, isSelected, onToggle }) => (
  <div
    onClick={onToggle}
    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
      isSelected
        ? 'border-amber-500 bg-amber-50 shadow-sm'
        : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30'
    }`}
  >
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
        onClick={e => e.stopPropagation()}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h5 className="font-semibold text-gray-900">
            Entrega Adicional #{grupo.numeroEntrega}
          </h5>
          <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
            {grupo.totalVacunas.toLocaleString()} vacunas
          </span>
          <span className="px-2 py-0.5 text-xs font-medium bg-cyan-100 text-cyan-700 rounded-full">
            {grupo.totalEstablecimientos} establec.
          </span>
        </div>
        {grupo.entregas.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-1">Incluye:</p>
            <div className="space-y-1">
              {grupo.entregas.slice(0, 2).map(entrega => (
                <div key={entrega.id} className="flex items-center gap-1.5 text-xs">
                  <span className="text-gray-700 truncate max-w-[150px]">{entrega.establecimientoNombre}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600 truncate max-w-[120px]">{entrega.vacunaNombre}</span>
                  <span className="text-gray-400">•</span>
                  <span className="font-medium text-amber-700">{entrega.cantidad}</span>
                </div>
              ))}
              {grupo.entregas.length > 2 && (
                <p className="text-xs text-gray-500 italic">
                  +{grupo.entregas.length - 2} más...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
));

GrupoEntregaCard.displayName = 'GrupoEntregaCard';

const ValeTypeSelectionModal: React.FC<ValeTypeSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  centroAcopioId,
  centroAcopioNombre,
  mes,
  anio
}) => {
  const { toast } = useToastContext();

  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingStock, setIsValidatingStock] = useState(false);
  const [gruposEntregasAdicionales, setGruposEntregasAdicionales] = useState<GrupoEntregaAdicional[]>([]);
  const [gruposGenerados, setGruposGenerados] = useState<number[]>([]);
  const [tiposGenerados, setTiposGenerados] = useState<string[]>([]);
  const [config, setConfig] = useState<ValeTypeSelectionConfig>({
    tipoVale: 'solo_base',
    entregasAdicionalesSeleccionadas: [],
    gruposEntregasSeleccionados: []
  });

  // Grupos disponibles (no generados)
  const gruposDisponibles = useMemo(() =>
    gruposEntregasAdicionales.filter(g => !gruposGenerados.includes(g.numeroEntrega)),
    [gruposEntregasAdicionales, gruposGenerados]
  );

  // Verificar disponibilidad de tipos
  const isBaseDisponible = useMemo(() => !tiposGenerados.includes('solo_base'), [tiposGenerados]);
  const isAdicionalesDisponible = useMemo(() => gruposDisponibles.length > 0, [gruposDisponibles]);
  const hayOpcionesDisponibles = useMemo(() => isBaseDisponible || isAdicionalesDisponible, [isBaseDisponible, isAdicionalesDisponible]);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [tiposRes, gruposGenRes, entregasRes] = await Promise.all([
          ValesService.getTiposValesGenerados(centroAcopioId, mes, anio),
          ValesService.getGruposEntregasAdicionalesGenerados(centroAcopioId, mes, anio),
          ValesService.getEntregasAdicionalesDisponibles(centroAcopioId, mes, anio)
        ]);

        setTiposGenerados(tiposRes.success && tiposRes.data ? tiposRes.data : []);
        setGruposGenerados(gruposGenRes.success && gruposGenRes.data ? gruposGenRes.data : []);

        if (entregasRes.success && entregasRes.data) {
          // Agrupar entregas por número
          const gruposMap = new Map<number, GrupoEntregaAdicional>();

          entregasRes.data.forEach((entrega: EntregaAdicionalInfo) => {
            const num = entrega.numeroEntrega;
            if (!gruposMap.has(num)) {
              gruposMap.set(num, { numeroEntrega: num, totalVacunas: 0, totalEstablecimientos: 0, entregas: [] });
            }
            const grupo = gruposMap.get(num)!;
            grupo.totalVacunas += entrega.cantidad;
            grupo.entregas.push(entrega);
          });

          gruposMap.forEach(grupo => {
            grupo.totalEstablecimientos = new Set(grupo.entregas.map(e => e.establecimientoId)).size;
          });

          setGruposEntregasAdicionales(
            Array.from(gruposMap.values()).sort((a, b) => a.numeroEntrega - b.numeroEntrega)
          );
        } else {
          setGruposEntregasAdicionales([]);
        }

        // Resetear configuración
        setConfig({
          tipoVale: 'solo_base',
          entregasAdicionalesSeleccionadas: [],
          gruposEntregasSeleccionados: []
        });
      } catch {
        toast.error('Error', 'No se pudieron cargar los datos');
        setTiposGenerados([]);
        setGruposGenerados([]);
        setGruposEntregasAdicionales([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isOpen, centroAcopioId, mes, anio, toast]);

  // Handlers
  const handleTipoChange = useCallback((tipo: 'solo_base' | 'solo_adicionales') => {
    if (tipo === 'solo_base' && !isBaseDisponible) {
      toast.warning('No disponible', 'El vale base ya fue generado');
      return;
    }
    if (tipo === 'solo_adicionales' && !isAdicionalesDisponible) {
      toast.warning('No disponible', 'No hay grupos de entregas adicionales disponibles');
      return;
    }

    setConfig({
      tipoVale: tipo,
      entregasAdicionalesSeleccionadas: [],
      gruposEntregasSeleccionados: tipo === 'solo_adicionales'
        ? gruposDisponibles.map(g => g.numeroEntrega)
        : []
    });
  }, [isBaseDisponible, isAdicionalesDisponible, gruposDisponibles, toast]);

  const handleGrupoToggle = useCallback((numeroEntrega: number) => {
    setConfig(prev => {
      const isSelected = prev.gruposEntregasSeleccionados.includes(numeroEntrega);
      const nuevosGrupos = isSelected
        ? prev.gruposEntregasSeleccionados.filter(n => n !== numeroEntrega)
        : [...prev.gruposEntregasSeleccionados, numeroEntrega];

      const grupo = gruposEntregasAdicionales.find(g => g.numeroEntrega === numeroEntrega);
      let nuevasEntregas = prev.entregasAdicionalesSeleccionadas;

      if (grupo) {
        const idsGrupo = grupo.entregas.map(e => e.id);
        nuevasEntregas = isSelected
          ? nuevasEntregas.filter(id => !idsGrupo.includes(id))
          : [...nuevasEntregas, ...idsGrupo];
      }

      return {
        ...prev,
        gruposEntregasSeleccionados: nuevosGrupos,
        entregasAdicionalesSeleccionadas: nuevasEntregas
      };
    });
  }, [gruposEntregasAdicionales]);

  const handleConfirm = useCallback(async () => {
    // Validaciones
    if (config.tipoVale === 'solo_adicionales' && config.gruposEntregasSeleccionados.length === 0) {
      toast.error('Selección requerida', 'Seleccione al menos un grupo de entregas adicionales');
      return;
    }

    setIsValidatingStock(true);
    try {
      const validationRequest: StockValidationRequest = {
        centroAcopioId,
        mes,
        anio,
        tipoVale: config.tipoVale,
        entregasAdicionalesSeleccionadas: config.entregasAdicionalesSeleccionadas,
        gruposEntregasSeleccionados: config.gruposEntregasSeleccionados
      };

      const result = await StockValidationService.validateStockForVoucher(validationRequest);

      if (!result.success) {
        toast.error('Error de validación', result.error || 'Error al validar stock');
        return;
      }

      const validation = result.data as StockValidationResult;

      if (!validation.success) {
        showStockErrors(validation);
        return;
      }

      onConfirm(config);
      onClose();
    } catch {
      toast.error('Error de conexión', 'No se pudo validar el stock disponible');
    } finally {
      setIsValidatingStock(false);
    }
  }, [config, centroAcopioId, mes, anio, onConfirm, onClose, toast]);

  const showStockErrors = useCallback((validation: StockValidationResult) => {
    const { stockDetails, expiredLots } = validation;

    interface StockItem {
      sufficient: boolean;
      requiredQuantity: number;
      availableQuantity: number;
      vaccineName?: string;
      syringeType?: string;
    }

    interface ExpiredLot {
      itemName: string;
    }

    const insuffVac = stockDetails.vaccines.filter((v: StockItem) => !v.sufficient);
    const insuffSyr = stockDetails.syringes.filter((s: StockItem) => !s.sufficient);

    let msg = 'Stock insuficiente. ';

    if (insuffVac.length > 0) {
      const names = [...new Set(insuffVac.map((v: StockItem) => v.vaccineName))].join(', ');
      const deficit = insuffVac.reduce((s: number, v: StockItem) => s + v.requiredQuantity - v.availableQuantity, 0);
      msg += `Vacunas: ${names} (faltan ${deficit.toLocaleString()}). `;
    }

    if (insuffSyr.length > 0) {
      const names = [...new Set(insuffSyr.map((s: StockItem) => s.syringeType))].join(', ');
      const deficit = insuffSyr.reduce((s: number, j: StockItem) => s + j.requiredQuantity - j.availableQuantity, 0);
      msg += `Jeringas: ${names} (faltan ${deficit.toLocaleString()}). `;
    }

    if (expiredLots.vaccines.length > 0 || expiredLots.syringes.length > 0) {
      const expNames = [
        ...expiredLots.vaccines.map((l: ExpiredLot) => l.itemName),
        ...expiredLots.syringes.map((l: ExpiredLot) => l.itemName)
      ];
      msg += `Lotes vencidos: ${[...new Set(expNames)].join(', ')}.`;
    }

    toast.error('Stock Insuficiente', msg, { duration: 12000 });
  }, [toast]);

  const handleRefresh = useCallback(() => {
    if (!isLoading) {
      setConfig({
        tipoVale: 'solo_base',
        entregasAdicionalesSeleccionadas: [],
        gruposEntregasSeleccionados: []
      });
      // Trigger reload by updating a dependency (the effect will re-run)
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 0);
    }
  }, [isLoading]);

  // Totales seleccionados
  const totalesSeleccionados = useMemo(() => {
    if (config.tipoVale !== 'solo_adicionales') return null;
    const grupos = gruposEntregasAdicionales.filter(g =>
      config.gruposEntregasSeleccionados.includes(g.numeroEntrega)
    );
    return {
      grupos: grupos.length,
      vacunas: grupos.reduce((s, g) => s + g.totalVacunas, 0)
    };
  }, [config, gruposEntregasAdicionales]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl shadow-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Generar Nuevo Vale</h2>
              <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {centroAcopioNombre}
                </span>
                <span className="text-gray-400">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {MESES[mes - 1]} {anio}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 hover:bg-white/80 rounded-lg transition-colors disabled:opacity-50"
              title="Actualizar"
            >
              <RefreshCw className={`h-4 w-4 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/80 rounded-lg transition-colors">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-3" />
              <p>Cargando datos...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Info */}
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-teal-900">Seleccione el tipo de vale</h3>
                    <p className="text-sm text-teal-700 mt-1">
                      Puede generar un vale con entregas base programadas o entregas adicionales.
                    </p>
                  </div>
                </div>
              </div>

              {/* Opciones de tipo */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Tipo de Vale</h3>

                <TipoValeOption
                  tipo="solo_base"
                  titulo="Entregas Base"
                  descripcion="Incluye las entregas programadas en la planificación anual"
                  icon={CheckCircle}
                  isSelected={config.tipoVale === 'solo_base'}
                  isDisabled={!isBaseDisponible}
                  disabledReason="Ya fue generado para este período"
                  badge={!isBaseDisponible ? 'Generado' : undefined}
                  badgeColor="bg-gray-200 text-gray-600"
                  onClick={() => handleTipoChange('solo_base')}
                />

                <TipoValeOption
                  tipo="solo_adicionales"
                  titulo="Entregas Adicionales"
                  descripcion="Incluye entregas adicionales no programadas"
                  icon={Plus}
                  isSelected={config.tipoVale === 'solo_adicionales'}
                  isDisabled={!isAdicionalesDisponible}
                  disabledReason={
                    gruposEntregasAdicionales.length === 0
                      ? 'No hay entregas adicionales para este período'
                      : 'Todos los grupos ya fueron generados'
                  }
                  badge={isAdicionalesDisponible ? `${gruposDisponibles.length} disponibles` : undefined}
                  badgeColor="bg-cyan-100 text-cyan-700"
                  onClick={() => handleTipoChange('solo_adicionales')}
                />
              </div>

              {/* Sin opciones disponibles */}
              {!hayOpcionesDisponibles && (
                <div className="text-center py-8 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-amber-900 mb-1">Sin opciones disponibles</h3>
                  <p className="text-sm text-amber-700">
                    Todos los tipos de vales ya fueron generados para este período.
                  </p>
                </div>
              )}

              {/* Grupos de entregas adicionales */}
              {config.tipoVale === 'solo_adicionales' && gruposDisponibles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Grupos de Entregas Adicionales
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {gruposDisponibles.map(grupo => (
                      <GrupoEntregaCard
                        key={grupo.numeroEntrega}
                        grupo={grupo}
                        isSelected={config.gruposEntregasSeleccionados.includes(grupo.numeroEntrega)}
                        onToggle={() => handleGrupoToggle(grupo.numeroEntrega)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-gray-600">
            {totalesSeleccionados && totalesSeleccionados.grupos > 0 && (
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4 text-amber-600" />
                <span>
                  {totalesSeleccionados.grupos} grupo(s) • {totalesSeleccionados.vacunas.toLocaleString()} vacunas
                </span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={
                isValidatingStock ||
                isLoading ||
                !hayOpcionesDisponibles ||
                (config.tipoVale === 'solo_adicionales' && config.gruposEntregasSeleccionados.length === 0) ||
                (config.tipoVale === 'solo_base' && !isBaseDisponible)
              }
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidatingStock ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Generar Vale
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ValeTypeSelectionModal;
