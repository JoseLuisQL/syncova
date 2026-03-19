import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useStockEvents } from '../../utils/stockEventEmitter';
import {
  MovimientoCalculado,
  CreateMovimientoDto,
  UpdateMovimientoDto,
} from '../../types';
import { useMovimientos } from '../../hooks/useMovimientos';
import { useEstablecimientos } from '../../hooks/useEstablecimientos';
import { useVacunas } from '../../hooks/useVacunas';
import { useToastContext } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAutoSync } from '../../hooks/useAutoSync';
import { PlanificacionService } from '../../services/planificacionService';
import { MovimientosService, ProgresoValesResponse } from '../../services/movimientosService';
import { MovimientosExportService, MovimientosExportConfig } from '../../services/movimientosExportService';
import { ValesService, ImpactoModificacion } from '../../services/valesService';
import { ordenarEstablecimientos, COLORES_CENTROS_ACOPIO } from '../../utils/centroAcopioUtils';
import Vales from '../Vales/Vales';
import ValesErrorBoundary from '../Vales/ValesErrorBoundary';
import ImportarModal from './ImportarModal';
import ConfirmacionModificacionModal from './ConfirmacionModificacionModal';
import ConfirmacionSinDisponibilidadModal from './ConfirmacionSinDisponibilidadModal';

import { COMPONENT_STYLES, MESES } from './constants';
import {
  MovimientosHeaderCompact,
  MovimientosTabla,
  MovimientoDetalle,
  EntregasAdicionalesModal,
  AlertaEstado,
  AjusteDeficitModal,
} from './components';
import { AjusteEntregasService } from '../../services/ajusteEntregasService';

interface StockInfo {
  stockInicialHistorico: number | null;
  stockInicialOriginal: number | null;
  ingresosLotesDelMes: number;
  fechaCapturaStockInicial: Date | null;
  stockActual: number;
  totalEntregas: number;
  stockDisponible: number;
  estado: 'bueno' | 'medio' | 'critico';
  tieneHistorialInicial: boolean;
  lotes: Array<{
    id: string;
    numero: string;
    cantidadActual: number;
    fechaVencimiento: Date;
    estado: string;
  }>;
}

interface CentroAcopioFilterOption {
  id: string;
  nombre: string;
  codigo?: string;
}

const Movimientos: React.FC = () => {
  // ============================================================================
  // HOOKS Y SERVICIOS
  // ============================================================================
  const {
    movimientos,
    isLoading,
    isCreating,
    isUpdating,
    error,
    loadMovimientos,
    createMovimiento,
    updateMovimiento,
    getStockDisponible,
    forceRefreshStock,
    createEntregaAdicional,
    deleteEntregaAdicional,
    calcularCamposDerivados,
    descargarPlantillaVacuna,
    descargarPlantillaMasiva,
    importarDesdeExcelVacuna,
    importarDesdeExcelMasivo,
    generarReporteErrores,
    isDownloadingTemplate,
    isImportingExcel,
    actualizarStockSiguienteMes
  } = useMovimientos();

  const { onValeGenerated } = useStockEvents();

  const {
    establecimientos,
    centrosAcopio,
    isLoading: isLoadingEstablecimientos,
    loadEstablecimientos,
    loadCentrosAcopio
  } = useEstablecimientos({ noPagination: true });

  const {
    vacunasActivas,
    isLoadingActivas,
    loadVacunasActivas
  } = useVacunas();

  const { toast } = useToastContext();
  const { user } = useAuth();
  const isReadOnlyMode = user?.rol === 'responsable_acopio';
  const lockedCentroAcopioIds = user?.centroAcopioIds?.length
    ? user.centroAcopioIds
    : user?.centroAcopioId
      ? [user.centroAcopioId]
      : [];
  const lockedCentroAcopioLabel = lockedCentroAcopioIds.length > 1
    ? `${lockedCentroAcopioIds.length} centros asignados`
    : user?.centroAcopio?.nombre || 'Centro asignado';
  const centrosAcopioPermitidos = useMemo<CentroAcopioFilterOption[]>(() => {
    const options = new Map<string, CentroAcopioFilterOption>();

    user?.centrosAcopioAsignados?.forEach(({ centroAcopio }) => {
      if (!centroAcopio?.id) {
        return;
      }

      options.set(centroAcopio.id, {
        id: centroAcopio.id,
        nombre: centroAcopio.nombre,
        codigo: centroAcopio.codigo,
      });
    });

    establecimientos.forEach((establecimiento) => {
      const centro = establecimiento.centroAcopio;
      if (!centro?.id || !lockedCentroAcopioIds.includes(centro.id) || options.has(centro.id)) {
        return;
      }

      options.set(centro.id, {
        id: centro.id,
        nombre: centro.nombre,
        codigo: centro.codigo,
      });
    });

    centrosAcopio.forEach((centro) => {
      if (!lockedCentroAcopioIds.includes(centro.id) || options.has(centro.id)) {
        return;
      }

      options.set(centro.id, {
        id: centro.id,
        nombre: centro.nombre,
        codigo: centro.codigo,
      });
    });

    return Array.from(options.values());
  }, [centrosAcopio, establecimientos, lockedCentroAcopioIds, user?.centrosAcopioAsignados]);
  const centrosAcopioFiltro = isReadOnlyMode ? centrosAcopioPermitidos : centrosAcopio;
  const canFilterAssignedCentros = isReadOnlyMode && centrosAcopioPermitidos.length > 1;
  const allCentrosLabel = 'Todos';

  const {
    onEntregaBaseChanged,
    onEntregaAdicionalChanged,
  } = useAutoSync();

  // ============================================================================
  // ESTADOS DE FILTROS
  // ============================================================================
  const [selectedCentroAcopio, setSelectedCentroAcopio] = useState<string>('todos');
  const [selectedVacuna, setSelectedVacuna] = useState<string>('');
  // Por defecto cargar el mes anterior al actual
  const [selectedMes, setSelectedMes] = useState<number>(() => {
    const mesActual = new Date().getMonth() + 1;
    return mesActual === 1 ? 12 : mesActual - 1;
  });
  const [selectedAnio, setSelectedAnio] = useState<number>(() => {
    const mesActual = new Date().getMonth() + 1;
    const anioActual = new Date().getFullYear();
    return mesActual === 1 ? anioActual - 1 : anioActual;
  });
  const [aniosDisponibles, setAniosDisponibles] = useState<number[]>([]);
  const [isLoadingAnios, setIsLoadingAnios] = useState(true);

  // ============================================================================
  // ESTADOS DE MODALES
  // ============================================================================
  const [showValesModal, setShowValesModal] = useState<boolean>(false);
  const [showImportarModal, setShowImportarModal] = useState<boolean>(false);
  const [showConfirmacionModal, setShowConfirmacionModal] = useState<boolean>(false);
  const [showSinDisponibilidadModal, setShowSinDisponibilidadModal] = useState<boolean>(false);
  const [selectedMovimiento, setSelectedMovimiento] = useState<MovimientoCalculado | null>(null);
  const [showEntregasAdicionalesModal, setShowEntregasAdicionalesModal] = useState(false);
  const [movimientoParaEntregas, setMovimientoParaEntregas] = useState<MovimientoCalculado | null>(null);
  const [showAjusteDeficitModal, setShowAjusteDeficitModal] = useState(false);
  const [ajusteDeficitDisponible, setAjusteDeficitDisponible] = useState(false);

  // Estado para fila seleccionada (persistente al cambiar pestañas/modales)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // ============================================================================
  // ESTADOS DE MODIFICACIÓN PENDIENTE
  // ============================================================================
  const [pendingModification, setPendingModification] = useState<{
    establecimientoId: string;
    campo: string;
    valorOriginal: number;
    valorNuevo: number;
    establecimientoNombre: string;
    valesAfectados: Array<{ numero: string; fechaGeneracion: Date }>;
  } | null>(null);

  const [impactoModificacion, setImpactoModificacion] = useState<ImpactoModificacion | null>(null);
  const [isLoadingImpacto, setIsLoadingImpacto] = useState(false);

  const [pendingSinDisponibilidad, setPendingSinDisponibilidad] = useState<{
    establecimientoId: string;
    campo: string;
    valor: number;
    establecimientoNombre: string;
    tipoEntrega: 'base' | 'adicional';
    entregaAdicionalId?: string;
  } | null>(null);

  // ============================================================================
  // ESTADOS DE STOCK
  // ============================================================================
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const [isUpdatingStockSiguienteMes, setIsUpdatingStockSiguienteMes] = useState(false);

  // ============================================================================
  // ESTADOS DE PROGRESO DE VALES
  // ============================================================================
  const [progresoVales, setProgresoVales] = useState<ProgresoValesResponse | null>(null);
  const [isLoadingProgresoVales, setIsLoadingProgresoVales] = useState(false);

  // ============================================================================
  // ESTADOS DE EDICIÓN
  // ============================================================================
  const [tempValues, setTempValues] = useState<{ [key: string]: number }>({});
  const [pendingChanges, setPendingChanges] = useState<{ [key: string]: boolean }>({});
  const debounceTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const [tempEntregasValues, setTempEntregasValues] = useState<{ [key: string]: number }>({});
  const [pendingEntregasChanges, setPendingEntregasChanges] = useState<{ [key: string]: boolean }>({});
  const entregasDebounceTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const [isProcessingEntrega, setIsProcessingEntrega] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const voucherValidationTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const [isTyping, setIsTyping] = useState<{ [key: string]: boolean }>({});
  const initialDataLoadedRef = useRef(false);

  // ============================================================================
  // FUNCIONES AUXILIARES
  // ============================================================================
  const getFieldKey = useCallback((establecimientoId: string, campo: string) => 
    `${establecimientoId}-${campo}`, []);

  const getCurrentValue = useCallback((establecimientoId: string, campo: string, originalValue: number): number => {
    const key = getFieldKey(establecimientoId, campo);
    return tempValues[key] !== undefined ? tempValues[key] : originalValue;
  }, [getFieldKey, tempValues]);

  const hasPendingChange = useCallback((establecimientoId: string, campo: string): boolean => {
    const key = getFieldKey(establecimientoId, campo);
    return pendingChanges[key] || false;
  }, [getFieldKey, pendingChanges]);

  const getEntregaFieldKey = useCallback((entregaId: string) => `entrega-${entregaId}`, []);

  const getCurrentEntregaValue = useCallback((entregaId: string, originalValue: number): number => {
    const key = getEntregaFieldKey(entregaId);
    return tempEntregasValues[key] !== undefined ? tempEntregasValues[key] : originalValue;
  }, [getEntregaFieldKey, tempEntregasValues]);

  const hasPendingEntregaChange = useCallback((entregaId: string): boolean => {
    const key = getEntregaFieldKey(entregaId);
    return pendingEntregasChanges[key] || false;
  }, [getEntregaFieldKey, pendingEntregasChanges]);

  // ============================================================================
  // DATOS DERIVADOS
  // ============================================================================
  const vacunaSeleccionada = useMemo(() =>
    vacunasActivas.find(v => v.id === selectedVacuna),
    [vacunasActivas, selectedVacuna]
  );

  const establecimientosFiltrados = useMemo(() => {
    let filtrados = selectedCentroAcopio === 'todos'
      ? establecimientos
      : establecimientos.filter(e => e.centroAcopioId === selectedCentroAcopio);

    return ordenarEstablecimientos(filtrados);
  }, [establecimientos, selectedCentroAcopio]);

  const movimientosCalculados = useMemo(() =>
    movimientos.map(mov => calcularCamposDerivados(mov)),
    [movimientos, calcularCamposDerivados]
  );

  const datosTabla = useMemo(() => {
    return establecimientosFiltrados.map(establecimiento => {
      const movimientoExistente = movimientosCalculados.find(
        m => m.establecimientoId === establecimiento.id
      );

      if (movimientoExistente) {
        const transIngreso = getCurrentValue(establecimiento.id, 'transIngreso', movimientoExistente.transIngreso);
        const salida = getCurrentValue(establecimiento.id, 'salida', movimientoExistente.salida);
        const transSalida = getCurrentValue(establecimiento.id, 'transSalida', movimientoExistente.transSalida);
        const entrega = getCurrentValue(establecimiento.id, 'entrega', movimientoExistente.entrega);

        const totalSaldo = movimientoExistente.saldoAnterior + transIngreso;
        const saldo = totalSaldo - salida - transSalida;
        const stock = saldo + entrega;

        return {
          ...movimientoExistente,
          transIngreso,
          salida,
          transSalida,
          entrega,
          totalSaldo,
          saldo,
          stock,
          establecimiento,
          tieneMovimiento: true
        };
      } else {
        const transIngreso = getCurrentValue(establecimiento.id, 'transIngreso', 0);
        const salida = getCurrentValue(establecimiento.id, 'salida', 0);
        const transSalida = getCurrentValue(establecimiento.id, 'transSalida', 0);
        const entrega = getCurrentValue(establecimiento.id, 'entrega', 0);

        const totalSaldo = 0 + transIngreso;
        const saldo = totalSaldo - salida - transSalida;
        const stock = saldo + entrega;

        return {
          id: `temp-${establecimiento.id}`,
          establecimientoId: establecimiento.id,
          vacunaId: selectedVacuna,
          mes: selectedMes,
          anio: selectedAnio,
          saldoAnterior: 0,
          transIngreso,
          salida,
          transSalida,
          entrega,
          totalSaldo,
          saldo,
          stock,
          promedioConsumo: 0,
          disponibilidad: 0,
          observaciones: '',
          fechaMovimiento: new Date(),
          usuarioId: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          establecimiento,
          vacuna: vacunaSeleccionada!,
          usuario: { id: '', nombres: '', apellidos: '', email: '' },
          entregasAdicionales: [],
          tieneMovimiento: false
        } as MovimientoCalculado & { tieneMovimiento: boolean };
      }
    });
  }, [establecimientosFiltrados, movimientosCalculados, selectedVacuna, selectedMes, selectedAnio, vacunaSeleccionada, getCurrentValue]);

  const totalesGenerales = useMemo(() => {
    return datosTabla.reduce((totales, movimiento) => {
      const entregaTotal = movimiento.entrega;
      return {
        saldoAnterior: totales.saldoAnterior + movimiento.saldoAnterior,
        transIngreso: totales.transIngreso + movimiento.transIngreso,
        totalSaldo: totales.totalSaldo + movimiento.totalSaldo,
        salida: totales.salida + movimiento.salida,
        transSalida: totales.transSalida + movimiento.transSalida,
        saldo: totales.saldo + movimiento.saldo,
        entrega: totales.entrega + entregaTotal,
        stock: totales.stock + movimiento.stock,
      };
    }, {
      saldoAnterior: 0,
      transIngreso: 0,
      totalSaldo: 0,
      salida: 0,
      transSalida: 0,
      saldo: 0,
      entrega: 0,
      stock: 0,
    });
  }, [datosTabla]);

  const pendingChangesCount = Object.values(pendingChanges).filter(Boolean).length +
    Object.values(pendingEntregasChanges).filter(Boolean).length;

  // ============================================================================
  // EFECTOS
  // ============================================================================
  
  // Cargar años disponibles desde la API
  useEffect(() => {
    const fetchAniosDisponibles = async () => {
      try {
        setIsLoadingAnios(true);
        const response = await MovimientosService.getAniosDisponibles();
        setAniosDisponibles(response.anios);
        // NO sobrescribir el año inicial - ya se calculó correctamente para el mes anterior
        // Solo actualizar si el año inicial no está en la lista de años disponibles
        if (!response.anios.includes(selectedAnio) && response.anios.length > 0) {
          // Buscar el año más cercano al seleccionado
          const anioMasCercano = response.anios.reduce((prev, curr) => 
            Math.abs(curr - selectedAnio) < Math.abs(prev - selectedAnio) ? curr : prev
          );
          setSelectedAnio(anioMasCercano);
        }
      } catch (error) {
        console.error('Error al cargar años disponibles:', error);
        const currentYear = new Date().getFullYear();
        setAniosDisponibles([currentYear - 1, currentYear, currentYear + 1]);
      } finally {
        setIsLoadingAnios(false);
      }
    };

    fetchAniosDisponibles();
  }, []);

  useEffect(() => {
    if (initialDataLoadedRef.current) {
      return;
    }

    if (isReadOnlyMode && lockedCentroAcopioIds.length === 0) {
      return;
    }

    initialDataLoadedRef.current = true;
    const loadInitialData = async () => {
      try {
        await Promise.all([
          loadEstablecimientos({ noPagination: true }),
          isReadOnlyMode ? Promise.resolve() : loadCentrosAcopio(),
          loadVacunasActivas()
        ]);
      } catch (err) {
        toast.error('Error al cargar datos iniciales');
      }
    };
    void loadInitialData();
  }, [isReadOnlyMode, lockedCentroAcopioIds.length, toast]);

  useEffect(() => {
    if (isReadOnlyMode) {
      setSelectedCentroAcopio('todos');
    }
  }, [isReadOnlyMode]);

  useEffect(() => {
    if (selectedCentroAcopio === 'todos') {
      return;
    }

    if (!centrosAcopioFiltro.some((centro) => centro.id === selectedCentroAcopio)) {
      setSelectedCentroAcopio('todos');
    }
  }, [centrosAcopioFiltro, selectedCentroAcopio]);

  useEffect(() => {
    if (vacunasActivas.length > 0 && !selectedVacuna) {
      setSelectedVacuna(vacunasActivas[0].id);
    }
  }, [vacunasActivas, selectedVacuna]);

  useEffect(() => {
    if (selectedVacuna) {
      const filters = {
        vacunaId: selectedVacuna,
        mes: selectedMes,
        anio: selectedAnio,
        ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio })
      };
      loadMovimientos(filters);
    }
  }, [selectedVacuna, selectedMes, selectedAnio, selectedCentroAcopio]);

  useEffect(() => {
    if (isReadOnlyMode) {
      setStockInfo(null);
      setStockError(null);
      return;
    }

    const loadStock = async () => {
      if (selectedVacuna) {
        setIsLoadingStock(true);
        setStockError(null);
        try {
          const stock = await getStockDisponible(selectedVacuna, selectedMes, selectedAnio);
          setStockInfo(stock);

          if (stock && stock.stockDisponible < 0) {
            const vacunaNombre = vacunasActivas.find(v => v.id === selectedVacuna)?.nombre || 'Vacuna';
            toast.warning(`Déficit detectado: ${vacunaNombre} - ${MESES[selectedMes - 1]} ${selectedAnio} - ${Math.abs(stock.stockDisponible).toLocaleString()} unidades`);
          }
        } catch (err: any) {
          const errorMessage = err?.response?.data?.message || err?.message || 'Error al cargar stock disponible';
          setStockError(errorMessage);
          setStockInfo(null);
        } finally {
          setIsLoadingStock(false);
        }
      } else {
        setStockInfo(null);
        setStockError(null);
      }
    };
    loadStock();
  }, [isReadOnlyMode, selectedVacuna, selectedMes, selectedAnio, toast, vacunasActivas]);

  // Verificar disponibilidad de ajuste de deficit
  useEffect(() => {
    if (isReadOnlyMode) {
      setAjusteDeficitDisponible(false);
      return;
    }

    const verificarAjusteDeficit = async () => {
      if (selectedVacuna && stockInfo && stockInfo.stockDisponible < 0) {
        try {
          const response = await AjusteEntregasService.verificarDisponibilidad(
            selectedVacuna,
            selectedMes,
            selectedAnio
          );
          if (response.success && response.data) {
            setAjusteDeficitDisponible(response.data.disponible);
          } else {
            setAjusteDeficitDisponible(false);
          }
        } catch {
          setAjusteDeficitDisponible(false);
        }
      } else {
        setAjusteDeficitDisponible(false);
      }
    };
    verificarAjusteDeficit();
  }, [isReadOnlyMode, selectedVacuna, selectedMes, selectedAnio, stockInfo]);

  // Cargar progreso de vales
  useEffect(() => {
    if (isReadOnlyMode) {
      setProgresoVales(null);
      return;
    }

    const loadProgresoVales = async () => {
      if (selectedVacuna) {
        setIsLoadingProgresoVales(true);
        try {
          const progreso = await MovimientosService.getProgresoVales(
            selectedVacuna,
            selectedMes,
            selectedAnio,
            selectedCentroAcopio !== 'todos' ? selectedCentroAcopio : undefined
          );
          setProgresoVales(progreso);
        } catch (err) {
          console.error('Error al cargar progreso de vales:', err);
          setProgresoVales(null);
        } finally {
          setIsLoadingProgresoVales(false);
        }
      } else {
        setProgresoVales(null);
      }
    };
    loadProgresoVales();
  }, [isReadOnlyMode, selectedVacuna, selectedMes, selectedAnio, selectedCentroAcopio]);

  useEffect(() => {
    if (isReadOnlyMode) {
      return undefined;
    }

    const unsubscribe = onValeGenerated(async (event) => {
      if (event.mes === selectedMes && event.anio === selectedAnio) {
        if (selectedVacuna) {
          try {
            setIsLoadingStock(true);
            setStockError(null);
            const freshStock = await forceRefreshStock(selectedVacuna, selectedMes, selectedAnio);
            if (freshStock) {
              setStockInfo(freshStock);
              toast.info('Stock actualizado automáticamente');
            }
          } catch (err) {
            setStockError('Error al actualizar stock automáticamente');
          } finally {
            setIsLoadingStock(false);
          }
        }

        const filters = {
          vacunaId: selectedVacuna,
          mes: selectedMes,
          anio: selectedAnio,
          centroAcopioId: selectedCentroAcopio !== 'todos' ? selectedCentroAcopio : undefined
        };
        await loadMovimientos(filters);

        // Actualizar progreso de vales
        if (selectedVacuna) {
          try {
            const progreso = await MovimientosService.getProgresoVales(
              selectedVacuna,
              selectedMes,
              selectedAnio,
              selectedCentroAcopio !== 'todos' ? selectedCentroAcopio : undefined
            );
            setProgresoVales(progreso);
          } catch (err) {
            console.error('Error al actualizar progreso de vales:', err);
          }
        }
      }
    });
    return unsubscribe;
  }, [forceRefreshStock, isReadOnlyMode, loadMovimientos, onValeGenerated, selectedAnio, selectedCentroAcopio, selectedMes, selectedVacuna, toast]);

  useEffect(() => {
    return () => {
      Object.values(debounceTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
      Object.values(entregasDebounceTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
      Object.values(voucherValidationTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  // ============================================================================
  // FUNCIONES DE STOCK
  // ============================================================================
  const updateStockInRealTime = async (showToastOnDeficit: boolean = true) => {
    if (!selectedVacuna) return;

    setIsUpdatingStock(true);
    try {
      const stock = await getStockDisponible(selectedVacuna, selectedMes, selectedAnio);
      setStockInfo(stock);
      setStockError(null);

      if (showToastOnDeficit && stock && stock.stockDisponible < 0) {
        const vacunaNombre = vacunasActivas.find(v => v.id === selectedVacuna)?.nombre || 'Vacuna';
        toast.warning(`Déficit detectado: ${vacunaNombre} - ${Math.abs(stock.stockDisponible).toLocaleString()} unidades`);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al actualizar stock';
      setStockError(errorMessage);
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleActualizarStockSiguienteMes = async () => {
    if (!selectedVacuna || !stockInfo) {
      toast.error('Debe seleccionar una vacuna y tener stock disponible cargado');
      return;
    }

    try {
      setIsUpdatingStockSiguienteMes(true);
      const resultado = await actualizarStockSiguienteMes(selectedVacuna, selectedMes, selectedAnio);

      if (resultado) {
        const vacunaNombre = vacunasActivas.find(v => v.id === selectedVacuna)?.nombre || 'Vacuna';
        const mesSiguienteNombre = MESES[resultado.mesSiguiente.mes - 1];
        toast.success(`${resultado.mensaje} - ${vacunaNombre} - ${mesSiguienteNombre}: ${resultado.mesSiguiente.stockInicialRegistrado.toLocaleString()} unidades`);
        await updateStockInRealTime(false);
      } else {
        toast.error('Error al actualizar stock inicial del siguiente mes');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al actualizar stock inicial del siguiente mes';
      toast.error(errorMessage);
    } finally {
      setIsUpdatingStockSiguienteMes(false);
    }
  };

  const handleRetryStock = () => {
    if (selectedVacuna) {
      setStockError(null);
      setIsLoadingStock(true);
      getStockDisponible(selectedVacuna, selectedMes, selectedAnio)
        .then(setStockInfo)
        .catch((err: any) => {
          const errorMessage = err?.response?.data?.message || err?.message || 'Error al cargar stock disponible';
          setStockError(errorMessage);
        })
        .finally(() => setIsLoadingStock(false));
    }
  };

  // ============================================================================
  // FUNCIONES DE PROGRESO DE VALES
  // ============================================================================
  const handleRefreshProgresoVales = useCallback(async () => {
    if (!selectedVacuna) return;
    
    setIsLoadingProgresoVales(true);
    try {
      const progreso = await MovimientosService.getProgresoVales(
        selectedVacuna,
        selectedMes,
        selectedAnio,
        selectedCentroAcopio !== 'todos' ? selectedCentroAcopio : undefined
      );
      setProgresoVales(progreso);
    } catch (err) {
      console.error('Error al refrescar progreso de vales:', err);
    } finally {
      setIsLoadingProgresoVales(false);
    }
  }, [selectedVacuna, selectedMes, selectedAnio, selectedCentroAcopio]);

  // ============================================================================
  // FUNCIONES DE VALIDACIÓN (MANTENIDAS DEL ORIGINAL)
  // ============================================================================
  const checkForVoucherConfirmation = async (establecimientoId: string, campo: string, value: number): Promise<boolean> => {
    if (showConfirmacionModal) return true;

    const movimientoExistente = datosTabla.find(m => m.establecimientoId === establecimientoId);
    const esCreacion = !movimientoExistente?.tieneMovimiento;
    const valorOriginal = movimientoExistente?.[campo as keyof typeof movimientoExistente] as number || 0;

    if (!esCreacion && campo === 'entrega' && selectedVacuna && valorOriginal !== value) {
      try {
        const verificacionVales = await ValesService.verificarValesExistentes(
          establecimientoId,
          selectedVacuna,
          selectedMes,
          selectedAnio
        );

        if (verificacionVales.success && verificacionVales.data?.existenVales) {
          const establecimiento = establecimientosFiltrados.find(e => e.id === establecimientoId);
          const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';

          const key = getFieldKey(establecimientoId, campo);
          if (debounceTimeouts.current[key]) {
            clearTimeout(debounceTimeouts.current[key]);
            delete debounceTimeouts.current[key];
          }

          setPendingModification({
            establecimientoId,
            campo,
            valorOriginal,
            valorNuevo: value,
            establecimientoNombre: nombreEstablecimiento,
            valesAfectados: verificacionVales.data.valesEncontrados.map(vale => ({
              numero: vale.numero,
              fechaGeneracion: vale.fechaGeneracion
            }))
          });
          
          // Mostrar modal y cargar impacto en paralelo
          setShowConfirmacionModal(true);
          setIsLoadingImpacto(true);
          setImpactoModificacion(null);

          // Calcular impacto detallado
          try {
            const impactoResult = await ValesService.calcularImpactoModificacion(
              establecimientoId,
              selectedVacuna,
              selectedMes,
              selectedAnio,
              valorOriginal,
              value
            );
            
            if (impactoResult.success && impactoResult.data) {
              setImpactoModificacion(impactoResult.data);
            }
          } catch (impactoError) {
            console.error('Error calculando impacto:', impactoError);
          } finally {
            setIsLoadingImpacto(false);
          }

          return true;
        }
      } catch (err) {
        // Error en verificación, continuar con modificación normal
      }
    }
    return false;
  };

  const verificarDisponibilidadAntesDeGuardar = async (
    establecimientoId: string,
    campo: string,
    value: number
  ): Promise<boolean> => {
    if (campo !== 'entrega' || !selectedVacuna || value <= 0) return true;

    try {
      const disponibilidad = await PlanificacionService.verificarDisponibilidadEntregas(
        establecimientoId,
        selectedVacuna,
        selectedMes,
        selectedAnio
      );

      if (!disponibilidad.tieneDisponibilidad) {
        const establecimiento = establecimientosFiltrados.find(e => e.id === establecimientoId);
        const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';

        setPendingSinDisponibilidad({
          establecimientoId,
          campo,
          valor: value,
          establecimientoNombre: nombreEstablecimiento,
          tipoEntrega: 'base'
        });
        setShowSinDisponibilidadModal(true);
        return false;
      }
      return true;
    } catch (err) {
      return true;
    }
  };

  // ============================================================================
  // FUNCIONES DE GUARDADO
  // ============================================================================
  const saveFieldValueToDatabase = async (establecimientoId: string, campo: string, value: number) => {
    const key = getFieldKey(establecimientoId, campo);
    const establecimiento = establecimientosFiltrados.find(e => e.id === establecimientoId);
    const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';
    const movimientoExistente = datosTabla.find(m => m.establecimientoId === establecimientoId);
    const esCreacion = !movimientoExistente?.tieneMovimiento;

    try {
      await handleActualizarCampoMovimiento(establecimientoId, campo as keyof UpdateMovimientoDto, value);

      setTempValues(prev => {
        const newTemp = { ...prev };
        delete newTemp[key];
        return newTemp;
      });

      setPendingChanges(prev => {
        const newPending = { ...prev };
        delete newPending[key];
        return newPending;
      });

      const campoNombre: { [key: string]: string } = {
        'transIngreso': 'Trans. Ingreso',
        'salida': 'Salida',
        'transSalida': 'Trans. Salida',
        'entrega': 'Entrega'
      };

      if (esCreacion) {
        toast.success(`Movimiento creado - ${nombreEstablecimiento} - ${campoNombre[campo] || campo}: ${value.toLocaleString()}`);
      } else {
        toast.success(`${campoNombre[campo] || campo} actualizado - ${nombreEstablecimiento}`);
      }
    } catch (redistributionError: any) {
      const errorMessage = redistributionError?.response?.data?.message || redistributionError?.response?.data?.error || redistributionError?.message || '';

      if (errorMessage.includes('No hay cantidades suficientes') ||
        errorMessage.includes('Faltan') ||
        errorMessage.includes('redistribuir')) {

        setPendingSinDisponibilidad({
          establecimientoId,
          campo,
          valor: value,
          establecimientoNombre: nombreEstablecimiento,
          tipoEntrega: 'base'
        });
        setShowSinDisponibilidadModal(true);
        return;
      }
      throw redistributionError;
    }

    if (['saldoAnterior', 'transIngreso', 'salida', 'transSalida', 'entrega', 'entregaBase'].includes(campo)) {
      setTimeout(async () => {
        if (selectedVacuna) {
          const filters = {
            vacunaId: selectedVacuna,
            mes: selectedMes,
            anio: selectedAnio,
            ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio })
          };
          await loadMovimientos(filters);
          if (campo === 'entrega') {
            await updateStockInRealTime();
          }
        }
      }, 500);
    }
  };

  const handleSaveFieldValue = async (establecimientoId: string, campo: string, value: number) => {
    const key = getFieldKey(establecimientoId, campo);

    try {
      setIsAutoSaving(true);

      const puedeGuardar = await verificarDisponibilidadAntesDeGuardar(establecimientoId, campo, value);
      if (!puedeGuardar) {
        setIsAutoSaving(false);
        return;
      }

      if (debounceTimeouts.current[key]) {
        clearTimeout(debounceTimeouts.current[key]);
        delete debounceTimeouts.current[key];
      }

      const necesitaConfirmacion = await checkForVoucherConfirmation(establecimientoId, campo, value);
      if (necesitaConfirmacion) {
        setIsAutoSaving(false);
        return;
      }

      await saveFieldValueToDatabase(establecimientoId, campo, value);
    } catch (err: any) {
      const establecimiento = establecimientosFiltrados.find(e => e.id === establecimientoId);
      const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';
      toast.error(`Error al guardar - ${nombreEstablecimiento}`);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleActualizarCampoMovimiento = async (
    establecimientoId: string,
    campo: keyof UpdateMovimientoDto,
    valor: number
  ) => {
    if (valor < 0) {
      toast.error('Los valores no pueden ser negativos');
      throw new Error('Valor negativo no permitido');
    }

    if (!selectedVacuna) {
      toast.error('Debe seleccionar una vacuna primero');
      throw new Error('Vacuna no seleccionada');
    }

    const movimientoExistente = datosTabla.find(m => m.establecimientoId === establecimientoId);
    const establecimiento = establecimientosFiltrados.find(e => e.id === establecimientoId);
    const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';

    if (movimientoExistente && movimientoExistente.tieneMovimiento) {
      if (campo === 'entrega' && movimientoExistente.entregasAdicionales && movimientoExistente.entregasAdicionales.length > 0) {
        toast.error(`Campo bloqueado - ${nombreEstablecimiento} - Use entrega base cuando hay entregas adicionales`);
        throw new Error('Campo bloqueado por entregas adicionales');
      }

      const updateData = { [campo]: valor, usuarioId: user?.id || 'system-auto' };
      await updateMovimiento(movimientoExistente.id, updateData);

      if (campo === 'entrega' || campo === 'entregaBase') {
        onEntregaBaseChanged(establecimientoId, selectedVacuna, selectedMes, selectedAnio);
      }
    } else {
      if (valor === 0 && campo !== 'saldoAnterior') return;

      const createData: CreateMovimientoDto = {
        establecimientoId,
        vacunaId: selectedVacuna,
        mes: selectedMes,
        anio: selectedAnio,
        saldoAnterior: campo === 'saldoAnterior' ? valor : 0,
        transIngreso: campo === 'transIngreso' ? valor : 0,
        salida: campo === 'salida' ? valor : 0,
        transSalida: campo === 'transSalida' ? valor : 0,
        entrega: campo === 'entrega' ? valor : 0,
        usuarioId: user?.id || 'system-auto'
      };

      await createMovimiento(createData);

      if (campo === 'entrega' && valor > 0) {
        onEntregaBaseChanged(establecimientoId, selectedVacuna, selectedMes, selectedAnio);
      }
    }
  };

  // ============================================================================
  // HANDLERS DE EDICIÓN
  // ============================================================================
  const handleTempValueChange = async (establecimientoId: string, campo: string, newValue: number) => {
    const key = getFieldKey(establecimientoId, campo);

    if (campo === 'entrega' && newValue > 0) {
      try {
        const verificacion = await PlanificacionService.verificarExistenciaPlanificacion(
          establecimientoId,
          selectedVacuna!,
          selectedAnio
        );

        if (!verificacion.existe) {
          toast.error(`No se puede asignar cantidad - Este establecimiento no tiene planificación programada para ${selectedAnio}`);

          setTempValues(prev => {
            const newTemp = { ...prev };
            delete newTemp[key];
            return newTemp;
          });
          setPendingChanges(prev => {
            const newPending = { ...prev };
            delete newPending[key];
            return newPending;
          });
          return;
        }
      } catch (err) {
        toast.error('Error de validación - No se pudo verificar la planificación');
        return;
      }
    }

    setTempValues(prev => ({ ...prev, [key]: newValue }));
    setPendingChanges(prev => ({ ...prev, [key]: true }));

    if (debounceTimeouts.current[key]) {
      clearTimeout(debounceTimeouts.current[key]);
    }

    setIsTyping(prev => ({ ...prev, [key]: true }));

    if (voucherValidationTimeouts.current[key]) {
      clearTimeout(voucherValidationTimeouts.current[key]);
    }

    if ((campo === 'entrega' || campo === 'entregaBase') && selectedVacuna) {
      handleAdvancedVoucherValidation(establecimientoId, campo, newValue, key);
    } else {
      debounceTimeouts.current[key] = setTimeout(() => {
        setIsTyping(prev => ({ ...prev, [key]: false }));
        handleSaveFieldValue(establecimientoId, campo, newValue);
      }, 2000);
    }
  };

  const handleAdvancedVoucherValidation = (establecimientoId: string, campo: string, newValue: number, key: string) => {
    const voucherTimeout = setTimeout(async () => {
      setIsTyping(prev => ({ ...prev, [key]: false }));

      const movimientoExistente = datosTabla.find(m => m.establecimientoId === establecimientoId);
      const esCreacion = !movimientoExistente?.tieneMovimiento;
      const valorOriginal = movimientoExistente?.[campo as keyof typeof movimientoExistente] as number || 0;

      if (!esCreacion && valorOriginal !== newValue) {
        const necesitaConfirmacion = await checkForVoucherConfirmation(establecimientoId, campo, newValue);
        if (!necesitaConfirmacion) {
          debounceTimeouts.current[key] = setTimeout(() => {
            handleSaveFieldValue(establecimientoId, campo, newValue);
          }, 500);
        }
      } else {
        debounceTimeouts.current[key] = setTimeout(() => {
          handleSaveFieldValue(establecimientoId, campo, newValue);
        }, 500);
      }
    }, 1500);

    voucherValidationTimeouts.current[key] = voucherTimeout;
  };

  const handleFieldBlur = async (establecimientoId: string, campo: string) => {
    const key = getFieldKey(establecimientoId, campo);
    const tempValue = tempValues[key];

    if (voucherValidationTimeouts.current[key]) {
      clearTimeout(voucherValidationTimeouts.current[key]);
      delete voucherValidationTimeouts.current[key];
    }

    setIsTyping(prev => ({ ...prev, [key]: false }));

    if (tempValue !== undefined && pendingChanges[key]) {
      if ((campo === 'entrega' || campo === 'entregaBase') && selectedVacuna) {
        const movimientoExistente = datosTabla.find(m => m.establecimientoId === establecimientoId);
        const esCreacion = !movimientoExistente?.tieneMovimiento;
        const valorOriginal = movimientoExistente?.[campo as keyof typeof movimientoExistente] as number || 0;

        if (!esCreacion && valorOriginal !== tempValue) {
          const necesitaConfirmacion = await checkForVoucherConfirmation(establecimientoId, campo, tempValue);
          if (!necesitaConfirmacion) {
            handleSaveFieldValue(establecimientoId, campo, tempValue);
          }
        } else {
          handleSaveFieldValue(establecimientoId, campo, tempValue);
        }
      } else {
        handleSaveFieldValue(establecimientoId, campo, tempValue);
      }
    }
  };

  // ============================================================================
  // HANDLERS DE ENTREGAS ADICIONALES
  // ============================================================================

  // Función para verificar disponibilidad antes de guardar entregas adicionales
  const verificarDisponibilidadAntesDeGuardarEntrega = async (
    entregaId: string,
    value: number,
    movimientoAsociado: any
  ): Promise<boolean> => {
    if (!selectedVacuna || value <= 0 || !movimientoAsociado) {
      return true;
    }

    try {
      const disponibilidad = await PlanificacionService.verificarDisponibilidadEntregas(
        movimientoAsociado.establecimientoId,
        selectedVacuna,
        selectedMes,
        selectedAnio
      );

      if (!disponibilidad.tieneDisponibilidad) {
        const establecimiento = establecimientosFiltrados.find(e => e.id === movimientoAsociado.establecimientoId);
        const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';

        setPendingSinDisponibilidad({
          establecimientoId: movimientoAsociado.establecimientoId,
          campo: 'entregaAdicional',
          valor: value,
          establecimientoNombre: nombreEstablecimiento,
          tipoEntrega: 'adicional',
          entregaAdicionalId: entregaId
        });
        setShowSinDisponibilidadModal(true);

        return false;
      }

      return true;
    } catch (error) {
      console.error('Error al verificar disponibilidad para entrega adicional:', error);
      return true;
    }
  };

  const handleTempEntregaValueChange = async (entregaId: string, newValue: number) => {
    const key = getEntregaFieldKey(entregaId);

    const movimientoAsociado = movimientos.find(m =>
      m.entregasAdicionales?.some(e => e.id === entregaId)
    );

    if (movimientoAsociado && newValue > 0) {
      try {
        const verificacion = await PlanificacionService.verificarExistenciaPlanificacion(
          movimientoAsociado.establecimientoId,
          movimientoAsociado.vacunaId,
          movimientoAsociado.anio
        );

        if (!verificacion.existe) {
          toast.error(`No se puede asignar cantidad - No hay planificación para ${movimientoAsociado.anio}`);
          setTempEntregasValues(prev => { const n = { ...prev }; delete n[key]; return n; });
          setPendingEntregasChanges(prev => { const n = { ...prev }; delete n[key]; return n; });
          return;
        }
      } catch (err) {
        toast.error('Error de validación');
        return;
      }
    }

    setTempEntregasValues(prev => ({ ...prev, [key]: newValue }));
    setPendingEntregasChanges(prev => ({ ...prev, [key]: true }));

    if (entregasDebounceTimeouts.current[key]) {
      clearTimeout(entregasDebounceTimeouts.current[key]);
    }

    entregasDebounceTimeouts.current[key] = setTimeout(() => {
      handleSaveEntregaAdicionalValue(entregaId, newValue);
    }, 2000);
  };

  const handleSaveEntregaAdicionalValue = async (entregaId: string, value: number) => {
    const key = getEntregaFieldKey(entregaId);

    // No guardar si el valor es 0 o menor
    if (value <= 0) {
      setTempEntregasValues(prev => { const n = { ...prev }; delete n[key]; return n; });
      setPendingEntregasChanges(prev => { const n = { ...prev }; delete n[key]; return n; });
      return;
    }

    try {
      setIsProcessingEntrega(true);

      if (entregasDebounceTimeouts.current[key]) {
        clearTimeout(entregasDebounceTimeouts.current[key]);
        delete entregasDebounceTimeouts.current[key];
      }

      const movimientoAsociado = movimientos.find(m =>
        m.entregasAdicionales?.some(e => e.id === entregaId)
      );

      // Verificar disponibilidad antes de guardar
      const puedeGuardar = await verificarDisponibilidadAntesDeGuardarEntrega(entregaId, value, movimientoAsociado);
      if (!puedeGuardar) {
        setIsProcessingEntrega(false);
        return;
      }

      await MovimientosService.updateEntregaAdicional(entregaId, { cantidad: value });
      await loadMovimientos();

      if (movimientoAsociado) {
        const establecimiento = establecimientosFiltrados.find(e => e.id === movimientoAsociado.establecimientoId);
        toast.success(`Entrega adicional actualizada - ${establecimiento?.nombre || 'Establecimiento'}`);

        onEntregaAdicionalChanged(
          movimientoAsociado.establecimientoId,
          movimientoAsociado.vacunaId,
          movimientoAsociado.mes,
          movimientoAsociado.anio
        );
      }

      setTempEntregasValues(prev => { const n = { ...prev }; delete n[key]; return n; });
      setPendingEntregasChanges(prev => { const n = { ...prev }; delete n[key]; return n; });

      await updateStockInRealTime();
    } catch (redistributionError: any) {
      const errorMessage = redistributionError?.response?.data?.message || redistributionError?.response?.data?.error || redistributionError?.message || '';
      
      console.log('[DEBUG] Error completo:', redistributionError?.response?.data);
      console.log('[DEBUG] Mensaje de error:', errorMessage);

      if (errorMessage.includes('No hay cantidades suficientes') ||
        errorMessage.includes('Faltan') ||
        errorMessage.includes('redistribuir') ||
        errorMessage.includes('no tiene planificación')) {

        const movimientoAsociado = movimientos.find(m => m.entregasAdicionales?.some(e => e.id === entregaId));
        const establecimiento = establecimientosFiltrados.find(e => e.id === movimientoAsociado!.establecimientoId);

        setPendingSinDisponibilidad({
          establecimientoId: movimientoAsociado!.establecimientoId,
          campo: 'entregaAdicional',
          valor: value,
          establecimientoNombre: establecimiento?.nombre || 'Establecimiento',
          tipoEntrega: 'adicional',
          entregaAdicionalId: entregaId
        });
        setShowSinDisponibilidadModal(true);
        setIsProcessingEntrega(false);
        return;
      }
      toast.error(`Error al guardar entrega adicional - ${errorMessage || 'Error desconocido'}`);
    } finally {
      setIsProcessingEntrega(false);
    }
  };

  const handleEntregaFieldBlur = (entregaId: string) => {
    const key = getEntregaFieldKey(entregaId);
    const tempValue = tempEntregasValues[key];

    if (tempValue !== undefined && pendingEntregasChanges[key]) {
      handleSaveEntregaAdicionalValue(entregaId, tempValue);
    }
  };

  const handleAgregarEntregaAdicional = async (establecimientoId: string) => {
    try {
      setIsProcessingEntrega(true);

      const movimientoExistente = datosTabla.find(m => m.establecimientoId === establecimientoId);
      const establecimiento = establecimientosFiltrados.find(e => e.id === establecimientoId);
      const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';

      if (!movimientoExistente?.tieneMovimiento) {
        toast.error(`Debe crear primero el movimiento principal - ${nombreEstablecimiento}`);
        return;
      }

      const entregasExistentes = movimientoExistente!.entregasAdicionales || [];
      const numerosExistentes = entregasExistentes.map(e => e.numeroEntrega).filter(n => typeof n === 'number');
      const siguienteNumero = numerosExistentes.length > 0 ? Math.max(...numerosExistentes) + 1 : 1;

      if (siguienteNumero > 10) {
        toast.error(`Límite excedido - ${nombreEstablecimiento}`);
        return;
      }

      await createEntregaAdicional({
        movimientoVacunaId: movimientoExistente!.id,
        numeroEntrega: siguienteNumero,
        cantidad: 0,
        fechaEntrega: new Date(),
        motivo: `Entrega adicional #${siguienteNumero}`,
        usuarioId: 'temp-user-id'
      });

      onEntregaAdicionalChanged(establecimientoId, selectedVacuna, selectedMes, selectedAnio);

      const filters = {
        vacunaId: selectedVacuna!,
        mes: selectedMes,
        anio: selectedAnio,
        ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio })
      };
      await loadMovimientos(filters);

      toast.success(`Entrega adicional creada - ${nombreEstablecimiento} - #${siguienteNumero}`);
      await updateStockInRealTime();
    } catch (err: any) {
      toast.error('Error al agregar entrega adicional');
    } finally {
      setIsProcessingEntrega(false);
    }
  };

  const handleEliminarEntregaAdicional = async (entregaId: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta entrega adicional?\n\nEsta acción no se puede deshacer.')) {
      return;
    }

    try {
      const movimientoAsociado = movimientos.find(m =>
        m.entregasAdicionales?.some(e => e.id === entregaId)
      );

      await deleteEntregaAdicional(entregaId);

      if (movimientoAsociado) {
        onEntregaAdicionalChanged(
          movimientoAsociado.establecimientoId,
          movimientoAsociado.vacunaId,
          movimientoAsociado.mes,
          movimientoAsociado.anio
        );

        const establecimiento = establecimientosFiltrados.find(e => e.id === movimientoAsociado.establecimientoId);
        toast.success(`Entrega adicional eliminada - ${establecimiento?.nombre || 'Establecimiento'}`);
      }

      await updateStockInRealTime();
    } catch (err) {
      toast.error('Error al eliminar entrega adicional');
    }
  };

  // ============================================================================
  // HANDLERS DE CONFIRMACIÓN
  // ============================================================================
  const handleConfirmModification = async () => {
    if (!pendingModification) return;

    try {
      setIsAutoSaving(true);
      await saveFieldValueToDatabase(
        pendingModification.establecimientoId,
        pendingModification.campo,
        pendingModification.valorNuevo
      );

      toast.success(`Entrega modificada - ${pendingModification.establecimientoNombre} - Vales sincronizados`);

      if (selectedVacuna) {
        const filters = {
          vacunaId: selectedVacuna,
          mes: selectedMes,
          anio: selectedAnio,
          ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio })
        };
        await loadMovimientos(filters);
      }

      setShowConfirmacionModal(false);
      setPendingModification(null);
      setImpactoModificacion(null);
    } catch (err: any) {
      toast.error(`Error al modificar entrega - ${pendingModification.establecimientoNombre}`);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleCancelModification = () => {
    if (!pendingModification) return;

    const key = getFieldKey(pendingModification.establecimientoId, pendingModification.campo);

    if (debounceTimeouts.current[key]) {
      clearTimeout(debounceTimeouts.current[key]);
      delete debounceTimeouts.current[key];
    }

    if (voucherValidationTimeouts.current[key]) {
      clearTimeout(voucherValidationTimeouts.current[key]);
      delete voucherValidationTimeouts.current[key];
    }

    setTempValues(prev => { const n = { ...prev }; delete n[key]; return n; });
    setPendingChanges(prev => { const n = { ...prev }; delete n[key]; return n; });
    setIsTyping(prev => { const n = { ...prev }; delete n[key]; return n; });

    setShowConfirmacionModal(false);
    setPendingModification(null);
    setImpactoModificacion(null);

    toast.info(`Modificación cancelada - ${pendingModification.establecimientoNombre}`);
  };

  const handleConfirmSinDisponibilidad = async () => {
    if (!pendingSinDisponibilidad || !selectedVacuna) return;

    try {
      setIsAutoSaving(true);
      setIsProcessingEntrega(true);

      await PlanificacionService.registrarEntregaMesActual(
        pendingSinDisponibilidad.establecimientoId,
        selectedVacuna,
        selectedMes,
        selectedAnio,
        pendingSinDisponibilidad.valor,
        user?.id
      );

      if (pendingSinDisponibilidad.tipoEntrega === 'adicional' && pendingSinDisponibilidad.entregaAdicionalId) {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
          const token = localStorage.getItem('token');

          await fetch(`${apiUrl}/movimientos/entregas-adicionales/${pendingSinDisponibilidad.entregaAdicionalId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              cantidad: pendingSinDisponibilidad.valor,
              skipRedistribucion: true
            })
          });
        } catch (updateError) {
          // Continuar de todas formas
        }

        toast.success(`Entrega adicional registrada - ${pendingSinDisponibilidad.establecimientoNombre} - ${pendingSinDisponibilidad.valor.toLocaleString()} unidades`);
        onEntregaAdicionalChanged(pendingSinDisponibilidad.establecimientoId, selectedVacuna, selectedMes, selectedAnio);
      } else {
        toast.success(`Entrega base registrada - ${pendingSinDisponibilidad.establecimientoNombre} - ${pendingSinDisponibilidad.valor.toLocaleString()} unidades`);
        onEntregaBaseChanged(pendingSinDisponibilidad.establecimientoId, selectedVacuna, selectedMes, selectedAnio);
      }

      if (selectedVacuna) {
        const filters = {
          vacunaId: selectedVacuna,
          mes: selectedMes,
          anio: selectedAnio,
          ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio })
        };
        await loadMovimientos(filters);
        await updateStockInRealTime(false);
      }

      setShowSinDisponibilidadModal(false);
      setPendingSinDisponibilidad(null);

      // Limpiar valores temporales
      if (pendingSinDisponibilidad.tipoEntrega === 'adicional' && pendingSinDisponibilidad.entregaAdicionalId) {
        const key = getEntregaFieldKey(pendingSinDisponibilidad.entregaAdicionalId);
        setTempEntregasValues(prev => { const n = { ...prev }; delete n[key]; return n; });
        setPendingEntregasChanges(prev => { const n = { ...prev }; delete n[key]; return n; });
      } else {
        const key = getFieldKey(pendingSinDisponibilidad.establecimientoId, pendingSinDisponibilidad.campo);
        setTempValues(prev => { const n = { ...prev }; delete n[key]; return n; });
        setPendingChanges(prev => { const n = { ...prev }; delete n[key]; return n; });
      }
    } catch (err: any) {
      toast.error(`Error al registrar - ${pendingSinDisponibilidad.establecimientoNombre}`);
    } finally {
      setIsAutoSaving(false);
      setIsProcessingEntrega(false);
    }
  };

  const handleCancelSinDisponibilidad = () => {
    if (!pendingSinDisponibilidad) return;

    if (pendingSinDisponibilidad.tipoEntrega === 'adicional' && pendingSinDisponibilidad.entregaAdicionalId) {
      const key = getEntregaFieldKey(pendingSinDisponibilidad.entregaAdicionalId);
      if (entregasDebounceTimeouts.current[key]) {
        clearTimeout(entregasDebounceTimeouts.current[key]);
        delete entregasDebounceTimeouts.current[key];
      }
      setTempEntregasValues(prev => { const n = { ...prev }; delete n[key]; return n; });
      setPendingEntregasChanges(prev => { const n = { ...prev }; delete n[key]; return n; });
    } else {
      const key = getFieldKey(pendingSinDisponibilidad.establecimientoId, pendingSinDisponibilidad.campo);
      if (debounceTimeouts.current[key]) {
        clearTimeout(debounceTimeouts.current[key]);
        delete debounceTimeouts.current[key];
      }
      if (voucherValidationTimeouts.current[key]) {
        clearTimeout(voucherValidationTimeouts.current[key]);
        delete voucherValidationTimeouts.current[key];
      }
      setTempValues(prev => { const n = { ...prev }; delete n[key]; return n; });
      setPendingChanges(prev => { const n = { ...prev }; delete n[key]; return n; });
      setIsTyping(prev => { const n = { ...prev }; delete n[key]; return n; });
    }

    setShowSinDisponibilidadModal(false);
    setPendingSinDisponibilidad(null);
    toast.info('Registro cancelado');
  };

  // ============================================================================
  // HANDLERS DE ACCIONES
  // ============================================================================
  const handleSaveAllPendingChanges = async () => {
    const pendingKeys = Object.keys(pendingChanges).filter(key => pendingChanges[key]);
    const pendingEntregasKeys = Object.keys(pendingEntregasChanges).filter(key => pendingEntregasChanges[key]);

    if (pendingKeys.length === 0 && pendingEntregasKeys.length === 0) {
      toast.info('No hay cambios pendientes para guardar');
      return;
    }

    try {
      setIsAutoSaving(true);
      setIsProcessingEntrega(true);
      let exitosos = 0;
      let errores = 0;

      for (const key of pendingKeys) {
        try {
          const [establecimientoId, campo] = key.split('-');
          const value = tempValues[key];
          if (value !== undefined) {
            await handleSaveFieldValue(establecimientoId, campo, value);
            exitosos++;
          }
        } catch (err) {
          errores++;
        }
      }

      for (const key of pendingEntregasKeys) {
        try {
          const entregaId = key.replace('entrega-', '');
          const value = tempEntregasValues[key];
          if (value !== undefined) {
            await handleSaveEntregaAdicionalValue(entregaId, value);
            exitosos++;
          }
        } catch (err) {
          errores++;
        }
      }

      if (errores === 0) {
        toast.success(`Todos los cambios guardados - ${exitosos} campo(s)`);
      } else if (exitosos > 0) {
        toast.warning(`Guardado parcial - ${exitosos} exitosos, ${errores} errores`);
      } else {
        toast.error(`Error al guardar - ${errores} campo(s) fallaron`);
      }
    } catch (err) {
      toast.error('Error inesperado al guardar');
    } finally {
      setIsAutoSaving(false);
      setIsProcessingEntrega(false);
    }
  };

  const handleRefresh = () => {
    if (selectedVacuna) {
      const filters = {
        vacunaId: selectedVacuna,
        mes: selectedMes,
        anio: selectedAnio,
        ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio })
      };
      loadMovimientos(filters);
      toast.success(`Datos actualizados - ${vacunaSeleccionada?.nombre} - ${MESES[selectedMes - 1]} ${selectedAnio}`);
    } else {
      toast.warning('Seleccione una vacuna para actualizar los datos');
    }
  };

  const handleExportar = async () => {
    try {
      setIsExporting(true);

      if (!selectedVacuna) {
        toast.error('Seleccione una vacuna para exportar');
        return;
      }

      const vacunaSelec = vacunasActivas.find(v => v.id === selectedVacuna);
      if (!vacunaSelec) {
        toast.error('Vacuna no encontrada');
        return;
      }

      const config: MovimientosExportConfig = MovimientosExportService.crearConfiguracionDesdeFiltros(
        selectedMes,
        selectedAnio,
        selectedVacuna,
        selectedCentroAcopio !== 'todos' ? selectedCentroAcopio : undefined,
        undefined,
        user?.nombres && user?.apellidos ? `${user.nombres} ${user.apellidos}` : 'Usuario del Sistema',
        `Exportación de movimientos - ${vacunaSelec.nombre} - ${MESES[selectedMes - 1]} ${selectedAnio}`
      );

      toast.info('Generando archivo Excel...');

      await MovimientosExportService.exportarYDescargarPorVacuna(
        selectedVacuna,
        config,
        vacunaSelec.nombre
      );

      toast.success(`Exportación completada - ${vacunaSelec.nombre}`);
    } catch (err: any) {
      toast.error('Error en exportación');
    } finally {
      setIsExporting(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <main className={COMPONENT_STYLES.pageBackground}>
      {/* Header Compacto con Filtros y Stock Integrados */}
      <MovimientosHeaderCompact
        isReadOnly={isReadOnlyMode}
        lockedCentroAcopioLabel={lockedCentroAcopioLabel}
        showReadOnlyCentroFilter={canFilterAssignedCentros}
        allCentrosLabel={allCentrosLabel}
        hideStockMetrics={isReadOnlyMode}
        // Filtros
        selectedCentroAcopio={selectedCentroAcopio}
        selectedVacuna={selectedVacuna}
        selectedMes={selectedMes}
        selectedAnio={selectedAnio}
        centrosAcopio={centrosAcopioFiltro}
        vacunasActivas={vacunasActivas}
        aniosDisponibles={aniosDisponibles}
        isLoadingEstablecimientos={isLoadingEstablecimientos}
        isLoadingVacunas={isLoadingActivas}
        isLoadingAnios={isLoadingAnios}
        datosTablaLength={datosTabla.length}
        onCentroAcopioChange={setSelectedCentroAcopio}
        onVacunaChange={setSelectedVacuna}
        onMesChange={setSelectedMes}
        onAnioChange={setSelectedAnio}
        // Stock
        stockInfo={stockInfo}
        stockError={stockError}
        isLoadingStock={isLoadingStock}
        isUpdatingStock={isUpdatingStock}
        isUpdatingStockSiguienteMes={isUpdatingStockSiguienteMes}
        onRetryStock={handleRetryStock}
        onActualizarStockSiguienteMes={handleActualizarStockSiguienteMes}
        // Acciones
        pendingChangesCount={pendingChangesCount}
        isAutoSaving={isAutoSaving}
        isLoading={isLoading}
        isExporting={isExporting}
        onSaveChanges={handleSaveAllPendingChanges}
        onRefresh={handleRefresh}
        onExport={handleExportar}
        onImport={() => setShowImportarModal(true)}
        onOpenVales={() => setShowValesModal(true)}
        // Ajuste de Deficit
        onOpenAjusteDeficit={() => setShowAjusteDeficitModal(true)}
        ajusteDeficitDisponible={ajusteDeficitDisponible}
        // Progreso de Vales
        progresoVales={progresoVales}
        isLoadingProgresoVales={isLoadingProgresoVales}
        onRefreshProgresoVales={handleRefreshProgresoVales}
      />

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Alertas de Estado - Solo errores */}
        {error && (
          <AlertaEstado tipo="error" mensaje={error} />
        )}

        {/* Tabla */}
        <MovimientosTabla
          readOnly={isReadOnlyMode}
          datosTabla={datosTabla}
          totalesGenerales={totalesGenerales}
          selectedMes={selectedMes}
          selectedAnio={selectedAnio}
          selectedCentroAcopio={selectedCentroAcopio}
          isLoading={isLoading}
          isCreating={isCreating}
          isUpdating={isUpdating}
          isAutoSaving={isAutoSaving}
          isProcessingEntrega={isProcessingEntrega}
          isTyping={isTyping}
          getCurrentValue={getCurrentValue}
          hasPendingChange={hasPendingChange}
          getCurrentEntregaValue={getCurrentEntregaValue}
          hasPendingEntregaChange={hasPendingEntregaChange}
          getFieldKey={getFieldKey}
          onTempValueChange={handleTempValueChange}
          onFieldBlur={handleFieldBlur}
          onTempEntregaValueChange={handleTempEntregaValueChange}
          onEntregaFieldBlur={handleEntregaFieldBlur}
          onAgregarEntregaAdicional={handleAgregarEntregaAdicional}
          onEliminarEntregaAdicional={handleEliminarEntregaAdicional}
          onVerDetalle={(mov) => setSelectedMovimiento(mov)}
          onGestionarEntregas={(mov) => {
            setMovimientoParaEntregas(mov);
            setShowEntregasAdicionalesModal(true);
          }}
          selectedRowId={selectedRowId}
          onRowSelect={setSelectedRowId}
        />
      </div>

      {/* Modales */}
      {selectedMovimiento && (
        <MovimientoDetalle
          movimiento={selectedMovimiento as MovimientoCalculado & { tieneMovimiento: boolean }}
          selectedMes={selectedMes}
          selectedAnio={selectedAnio}
          onClose={() => setSelectedMovimiento(null)}
        />
      )}

      {showEntregasAdicionalesModal && movimientoParaEntregas && (
        <EntregasAdicionalesModal
          movimiento={movimientoParaEntregas as MovimientoCalculado & { tieneMovimiento: boolean }}
          isProcessing={isProcessingEntrega}
          isCreating={isCreating}
          isUpdating={isUpdating}
          tempEntregasValues={tempEntregasValues}
          pendingEntregasChanges={pendingEntregasChanges}
          getCurrentEntregaValue={getCurrentEntregaValue}
          hasPendingEntregaChange={hasPendingEntregaChange}
          onClose={() => {
            setShowEntregasAdicionalesModal(false);
            setMovimientoParaEntregas(null);
          }}
          onAgregarEntrega={handleAgregarEntregaAdicional}
          onTempValueChange={handleTempEntregaValueChange}
          onBlur={handleEntregaFieldBlur}
          onEliminarEntrega={handleEliminarEntregaAdicional}
        />
      )}

      {showValesModal && (
        <div className={COMPONENT_STYLES.modal.overlay}>
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
            <ValesErrorBoundary>
              <Vales
                initialCentroAcopioId={selectedCentroAcopio !== 'todos' ? selectedCentroAcopio : undefined}
                initialVacunaId={selectedVacuna}
                initialMes={selectedMes === 12 ? 1 : selectedMes + 1}
                initialAnio={selectedMes === 12 ? selectedAnio + 1 : selectedAnio}
                onClose={() => setShowValesModal(false)}
              />
            </ValesErrorBoundary>
          </div>
        </div>
      )}

      {showImportarModal && (
        <ImportarModal
          isOpen={showImportarModal}
          onClose={() => setShowImportarModal(false)}
          vacunas={vacunasActivas}
          onDescargarPlantillaVacuna={descargarPlantillaVacuna}
          onDescargarPlantillaMasiva={descargarPlantillaMasiva}
          onImportarVacuna={async (vacunaId: string, anio: number, archivo: File) => {
            const resultado = await importarDesdeExcelVacuna(vacunaId, anio, archivo);
            if (resultado) {
              const { creadas, actualizadas, errores } = resultado;
              if (errores.length === 0) {
                toast.success(`Importación exitosa: ${creadas} creados, ${actualizadas} actualizados`);
              } else {
                toast.warning(`Importación con errores: ${creadas} creados, ${actualizadas} actualizados, ${errores.length} errores`);
              }
            }
            return resultado;
          }}
          onImportarMasivo={async (anio: number, archivo: File) => {
            const resultado = await importarDesdeExcelMasivo(anio, archivo);
            if (resultado) {
              const { totalCreadas, totalActualizadas, erroresPorVacuna, vacunasProcesadas } = resultado;
              if (erroresPorVacuna.length === 0) {
                toast.success(`Importación masiva exitosa: ${totalCreadas} creados, ${totalActualizadas} actualizados en ${vacunasProcesadas} vacunas`);
              } else {
                toast.warning(`Importación masiva con errores: ${totalCreadas} creados, ${totalActualizadas} actualizados, ${erroresPorVacuna.length} vacunas con errores`);
              }
            }
            return resultado;
          }}
          onGenerarReporteErrores={generarReporteErrores}
          isDownloadingTemplate={isDownloadingTemplate}
          isImportingExcel={isImportingExcel}
        />
      )}

      {showConfirmacionModal && pendingModification && (
        <ConfirmacionModificacionModal
          isOpen={showConfirmacionModal}
          onClose={() => !isAutoSaving && !isLoadingImpacto && handleCancelModification()}
          onConfirm={handleConfirmModification}
          onCancel={handleCancelModification}
          impacto={impactoModificacion}
          isLoading={isLoadingImpacto}
          isProcessing={isAutoSaving}
        />
      )}

      {showSinDisponibilidadModal && pendingSinDisponibilidad && (
        <ConfirmacionSinDisponibilidadModal
          isOpen={showSinDisponibilidadModal}
          onClose={() => !isAutoSaving && handleCancelSinDisponibilidad()}
          onConfirm={handleConfirmSinDisponibilidad}
          establecimientoNombre={pendingSinDisponibilidad.establecimientoNombre}
          vacunaNombre={vacunasActivas.find(v => v.id === selectedVacuna)?.nombre || 'Vacuna'}
          cantidad={pendingSinDisponibilidad.valor}
          mesActual={MESES[selectedMes - 1]}
          anio={selectedAnio}
          isProcessing={isAutoSaving}
          tipoEntrega={pendingSinDisponibilidad.tipoEntrega}
        />
      )}

      {showAjusteDeficitModal && selectedVacuna && stockInfo && stockInfo.stockDisponible < 0 && (
        <AjusteDeficitModal
          isOpen={showAjusteDeficitModal}
          onClose={() => setShowAjusteDeficitModal(false)}
          vacunaId={selectedVacuna}
          vacunaNombre={vacunasActivas.find(v => v.id === selectedVacuna)?.nombre || 'Vacuna'}
          mes={selectedMes}
          anio={selectedAnio}
          deficit={stockInfo.stockDisponible}
          onAjusteCompletado={async () => {
            // Reload movements and stock
            const filters = {
              vacunaId: selectedVacuna,
              mes: selectedMes,
              anio: selectedAnio,
              ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio })
            };
            await loadMovimientos(filters);
            await updateStockInRealTime(false);
          }}
        />
      )}
    </main>
  );
};

export default Movimientos;
