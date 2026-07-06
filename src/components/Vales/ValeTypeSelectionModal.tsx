import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  FileText, Plus, CheckCircle, WarningCircle,
  SpinnerGap, ArrowsClockwise, Warning, Package
} from '@phosphor-icons/react';
import { ValesService, EntregaAdicionalInfo, ValeTypeSelectionConfig, GrupoEntregaAdicional } from '../../services/valesService';
import { StockValidationService, StockValidationRequest, StockValidationResult } from '../../services/stockValidationService';
import { useToastContext } from '../../contexts/ToastContext';
import { MESES } from './constants';
import { Modal, FormSection } from '../ui/ModalElements';
import { MODAL_STYLES } from '../ui/ModalConstants';

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
    className={`rounded-[14px] border p-4 transition-colors ${
      isDisabled
        ? 'border-[#e7e7ef] bg-[#fbfafd] cursor-not-allowed opacity-60'
        : isSelected
          ? 'border-[#c8bbff] bg-[#fbfafd] cursor-pointer'
          : 'border-[#e7e7ef] bg-white hover:border-[#d7d8e2] hover:bg-[#fbfafd] cursor-pointer'
    }`}
  >
    <div className="flex items-start gap-4">
      {/* Radio button */}
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isSelected && !isDisabled
          ? 'border-[#7c3aed] bg-[#7c3aed]'
          : 'border-[#d7d8e2]'
      }`}>
        {isSelected && !isDisabled && (
          <div className="w-2 h-2 rounded-full bg-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Icon className={`h-5 w-5 ${isDisabled ? 'text-[#8b8f9b]' : 'text-[#606571]'}`} />
          <h4 className={`font-semibold ${isDisabled ? 'text-[#8b8f9b]' : 'text-[#15171d]'}`}>
            {titulo}
          </h4>
          {badge && (
            <span className={`rounded-[8px] border border-[#e7e7ef] bg-white px-2 py-0.5 text-xs font-medium text-[#15171d] ${badgeColor || ''}`}>
              {badge}
            </span>
          )}
        </div>
        <p className={`text-sm mt-1 ${isDisabled ? 'text-[#8b8f9b]' : 'text-[#606571]'}`}>
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
    className={`cursor-pointer rounded-[14px] border p-4 transition-colors ${
      isSelected
        ? 'border-[#c8bbff] bg-[#fbfafd]'
        : 'border-[#e7e7ef] bg-white hover:border-[#d7d8e2] hover:bg-[#fbfafd]'
    }`}
  >
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className="mt-1 h-4 w-4 rounded border-[#d7d8e2] text-[#7c3aed] focus:ring-[#7c3aed]/20"
        onClick={e => e.stopPropagation()}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h5 className="font-semibold text-[#15171d]">
            Entrega Adicional #{grupo.numeroEntrega}
          </h5>
          <span className="rounded-[8px] border border-[#e7e7ef] bg-white px-2 py-0.5 text-xs font-medium text-[#15171d]">
            {grupo.totalVacunas.toLocaleString()} vacunas
          </span>
          <span className="rounded-[8px] border border-[#e7e7ef] bg-white px-2 py-0.5 text-xs font-medium text-[#15171d]">
            {grupo.totalEstablecimientos} establec.
          </span>
        </div>
        {grupo.entregas.length > 0 && (
          <div className="mt-2 text-sm text-[#606571]">
            <p className="font-medium text-[#15171d] mb-1">Incluye:</p>
            <div className="space-y-1">
              {grupo.entregas.slice(0, 2).map(entrega => (
                <div key={entrega.id} className="flex items-center gap-1.5 text-xs">
                  <span className="text-[#15171d] truncate max-w-[150px]">{entrega.establecimientoNombre}</span>
                  <span className="text-[#c4c7d0]">•</span>
                  <span className="text-[#606571] truncate max-w-[120px]">{entrega.vacunaNombre}</span>
                  <span className="text-[#c4c7d0]">•</span>
                  <span className="font-medium text-[#7c3aed]">{entrega.cantidad}</span>
                </div>
              ))}
              {grupo.entregas.length > 2 && (
                <p className="text-xs text-[#8b8f9b] italic">
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generar Nuevo Vale"
      subtitle={`${centroAcopioNombre} • ${MESES[mes - 1]} ${anio}`}
      icon={FileText}
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="text-sm text-zinc-600">
            {totalesSeleccionados && totalesSeleccionados.grupos > 0 && (
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4 text-zinc-600" />
                <span>
                  {totalesSeleccionados.grupos} grupo(s) • {totalesSeleccionados.vacunas.toLocaleString()} vacunas
                </span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-3 py-2 text-zinc-500 hover:text-zinc-800 disabled:opacity-50"
              title="Actualizar"
            >
              <ArrowsClockwise className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button type="button"
              onClick={onClose}
              className={MODAL_STYLES.button.secondary}
            >
              Cancelar
            </button>
            <button type="button"
              onClick={handleConfirm}
              disabled={
                isValidatingStock ||
                isLoading ||
                !hayOpcionesDisponibles ||
                (config.tipoVale === 'solo_adicionales' && config.gruposEntregasSeleccionados.length === 0) ||
                (config.tipoVale === 'solo_base' && !isBaseDisponible)
              }
              className={MODAL_STYLES.button.primary}
            >
              {isValidatingStock ? (
                <>
                  <SpinnerGap weight="bold" className="h-4 w-4 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <CheckCircle weight="bold" className="h-4 w-4" />
                  Generar Vale
                </>
              )}
            </button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
          <SpinnerGap weight="bold" className="h-8 w-8 animate-spin text-zinc-600 mb-3" />
          <p>Cargando datos...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
            <div className="flex gap-3">
              <WarningCircle className="h-5 w-5 text-zinc-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-zinc-900">Seleccione el tipo de vale</h3>
                <p className="text-sm text-zinc-700 mt-1">
                  Puede generar un vale con entregas base programadas o entregas adicionales.
                </p>
              </div>
            </div>
          </div>

          <FormSection title="Tipo de Vale">
            <div className="space-y-3">
              <TipoValeOption
                titulo="Entregas Base"
                descripcion="Incluye las entregas programadas en la planificación anual"
                icon={CheckCircle}
                isSelected={config.tipoVale === 'solo_base'}
                isDisabled={!isBaseDisponible}
                disabledReason="Ya fue generado para este período"
                badge={!isBaseDisponible ? 'Generado' : undefined}
                badgeColor="bg-zinc-200 text-zinc-600"
                onClick={() => handleTipoChange('solo_base')}
              />

              <TipoValeOption
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
                badgeColor="bg-zinc-100 text-zinc-700"
                onClick={() => handleTipoChange('solo_adicionales')}
              />
            </div>
          </FormSection>

          {!hayOpcionesDisponibles && (
            <div className="text-center py-8 bg-amber-50 border border-amber-200 rounded-xl">
              <Warning weight="duotone" className="h-8 w-8 text-amber-500 mx-auto mb-3" />
              <h3 className="font-semibold text-amber-900 mb-1">Sin opciones disponibles</h3>
              <p className="text-sm text-amber-700">
                Todos los tipos de vales ya fueron generados para este período.
              </p>
            </div>
          )}

          {config.tipoVale === 'solo_adicionales' && gruposDisponibles.length > 0 && (
            <FormSection title="Grupos de Entregas Adicionales">
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {gruposDisponibles.map(grupo => (
                  <GrupoEntregaCard
                    key={grupo.numeroEntrega}
                    grupo={grupo}
                    isSelected={config.gruposEntregasSeleccionados.includes(grupo.numeroEntrega)}
                    onToggle={() => handleGrupoToggle(grupo.numeroEntrega)}
                  />
                ))}
              </div>
            </FormSection>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ValeTypeSelectionModal;
