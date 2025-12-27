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
import { MovimientosService } from '../../services/movimientosService';
import { MovimientosExportService, MovimientosExportConfig } from '../../services/movimientosExportService';
import { ValesService } from '../../services/valesService';
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
} from './components';

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

  const {
    onEntregaBaseChanged,
    onEntregaAdicionalChanged,
  } = useAutoSync();

  // ============================================================================
  // ESTADOS DE FILTROS
  // ============================================================================
  const [selectedCentroAcopio, setSelectedCentroAcopio] = useState<string>('todos');
  const [selectedVacuna, setSelectedVacuna] = useState<string>('');
  const [selectedMes, setSelectedMes] = useState<number>(new Date().getMonth() + 1);
  const [selectedAnio, setSelectedAnio] = useState<number>(new Date().getFullYear());

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
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          loadEstablecimientos({ noPagination: true }),
          loadCentrosAcopio(),
          loadVacunasActivas()
        ]);
      } catch (err) {
        toast.error('Error al cargar datos iniciales');
      }
    };
    loadInitialData();
  }, []);

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
  }, [selectedVacuna, selectedMes, selectedAnio, vacunasActivas]);

  useEffect(() => {
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
      }
    });
    return unsubscribe;
  }, [onValeGenerated, selectedVacuna, selectedMes, selectedAnio, selectedCentroAcopio, forceRefreshStock, loadMovimientos, toast]);

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
          setShowConfirmacionModal(true);
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

    try {
      setIsProcessingEntrega(true);

      if (entregasDebounceTimeouts.current[key]) {
        clearTimeout(entregasDebounceTimeouts.current[key]);
        delete entregasDebounceTimeouts.current[key];
      }

      const movimientoAsociado = movimientos.find(m =>
        m.entregasAdicionales?.some(e => e.id === entregaId)
      );

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

      if (errorMessage.includes('No hay cantidades suficientes') ||
        errorMessage.includes('Faltan') ||
        errorMessage.includes('redistribuir')) {

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
      toast.error(`Error al guardar entrega adicional - ${errorMessage}`);
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
        // Filtros
        selectedCentroAcopio={selectedCentroAcopio}
        selectedVacuna={selectedVacuna}
        selectedMes={selectedMes}
        selectedAnio={selectedAnio}
        centrosAcopio={centrosAcopio}
        vacunasActivas={vacunasActivas}
        isLoadingEstablecimientos={isLoadingEstablecimientos}
        isLoadingVacunas={isLoadingActivas}
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
      />

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Alertas de Estado */}
        {error && (
          <AlertaEstado tipo="error" mensaje={error} />
        )}

        {(isCreating || isUpdating || isAutoSaving) && (
          <AlertaEstado
            tipo="loading"
            mensaje={isCreating ? 'Creando movimiento...' : isUpdating ? 'Actualizando movimiento...' : 'Guardando cambios automáticamente...'}
          />
        )}

        {pendingChangesCount > 0 && !isAutoSaving && (
          <AlertaEstado
            tipo="pending"
            mensaje="Tienes cambios pendientes que se guardarán automáticamente"
            count={pendingChangesCount}
            accion={{ label: 'Guardar ahora', onClick: handleSaveAllPendingChanges }}
          />
        )}

        {/* Tabla */}
        <MovimientosTabla
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
          <div className={COMPONENT_STYLES.modal.containerFullscreen}>
            <ValesErrorBoundary>
              <Vales
                initialCentroAcopioId={selectedCentroAcopio !== 'todos' ? selectedCentroAcopio : undefined}
                initialVacunaId={selectedVacuna}
                initialMes={selectedMes}
                initialAnio={selectedAnio}
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
          onClose={() => !isAutoSaving && handleCancelModification()}
          onConfirm={handleConfirmModification}
          onCancel={handleCancelModification}
          establecimientoNombre={pendingModification.establecimientoNombre}
          vacunaNombre={vacunasActivas.find(v => v.id === selectedVacuna)?.nombre || 'Vacuna'}
          cantidadOriginal={pendingModification.valorOriginal}
          cantidadNueva={pendingModification.valorNuevo}
          valesAfectados={pendingModification.valesAfectados}
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
    </main>
  );
};

export default Movimientos;
