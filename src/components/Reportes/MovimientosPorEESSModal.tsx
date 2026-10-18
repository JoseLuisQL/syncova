import React, { useMemo, useState } from 'react';
import { CalendarBlank, CalendarCheck, FileXls } from '@phosphor-icons/react';
import { useToastContext } from '../../contexts/ToastContext';
import {
  DateInput,
  FormSection,
  Modal,
  ModalFooter,
  SelectInput,
} from '../ui/ModalElements';
import { COMPONENT_STYLES } from './constants';
import { getFechaPeruActual, getFechaPeruMesAnterior } from './utils';

interface Establecimiento {
  id: string;
  nombre: string;
}

interface MovimientosPorEESSModalProps {
  onClose: () => void;
  onExportar: (filtros: MovimientosPorEESSFiltros) => Promise<void>;
  centrosAcopio: Establecimiento[];
}

interface MovimientosPorEESSFiltros {
  centroAcopioId?: string;
  fechaInicio: string;
  fechaFin: string;
}

type ModoFiltro = 'rango' | 'mes';

const MESES: Array<{ value: string; label: string }> = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

const getFechaPeruDate = () => {
  const ahora = new Date();
  return new Date(ahora.getTime() - 5 * 60 * 60 * 1000);
};

const getMesActualPeru = () => String(getFechaPeruDate().getUTCMonth() + 1);
const getAnioActualPeru = () => getFechaPeruDate().getUTCFullYear();
const padZero = (value: number) => String(value).padStart(2, '0');
const formatYMD = (year: number, month: number, day: number) =>
  `${year}-${padZero(month)}-${padZero(day)}`;
const getUltimoDiaDelMes = (year: number, month: number) => new Date(year, month, 0).getDate();

const MovimientosPorEESSModal: React.FC<MovimientosPorEESSModalProps> = ({
  onClose,
  onExportar,
  centrosAcopio,
}) => {
  const { toast } = useToastContext();
  const anioActual = getAnioActualPeru();

  const [modoFiltro, setModoFiltro] = useState<ModoFiltro>('rango');
  const [fechaInicio, setFechaInicio] = useState<string>(getFechaPeruMesAnterior());
  const [fechaFin, setFechaFin] = useState<string>(getFechaPeruActual());
  const [mes, setMes] = useState<string>(getMesActualPeru());
  const [anio, setAnio] = useState<string>(String(anioActual));
  const [centroAcopioId, setCentroAcopioId] = useState<string>('');
  const [exportando, setExportando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const aniosOptions = useMemo(() => {
    const desde = anioActual - 5;
    const hasta = anioActual + 1;
    const lista: Array<{ value: string; label: string }> = [];
    for (let y = hasta; y >= desde; y--) {
      lista.push({ value: String(y), label: String(y) });
    }
    return lista;
  }, [anioActual]);

  const periodoResumen = useMemo(() => {
    if (modoFiltro !== 'mes') return null;
    const mesNum = parseInt(mes, 10);
    const anioNum = parseInt(anio, 10);
    if (isNaN(mesNum) || isNaN(anioNum)) return null;
    const nombreMes = MESES.find((m) => m.value === mes)?.label ?? '';
    const ultimoDia = getUltimoDiaDelMes(anioNum, mesNum);
    return `${nombreMes} ${anioNum} · del 01/${padZero(mesNum)}/${anioNum} al ${padZero(ultimoDia)}/${padZero(mesNum)}/${anioNum}`;
  }, [modoFiltro, mes, anio]);

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    if (modoFiltro === 'rango') {
      if (!fechaInicio) nuevosErrores.fechaInicio = 'La fecha de inicio es requerida.';
      if (!fechaFin) nuevosErrores.fechaFin = 'La fecha de fin es requerida.';

      if (fechaInicio && fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const diffDays = Math.ceil(Math.abs(fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));

        if (inicio > fin) {
          nuevosErrores.fechaFin = 'La fecha final debe ser posterior a la inicial.';
        } else if (diffDays > 730) {
          nuevosErrores.fechaFin = 'El rango no puede superar 2 años.';
        }
      }
    } else {
      const mesNum = parseInt(mes, 10);
      const anioNum = parseInt(anio, 10);

      if (!mes || isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
        nuevosErrores.mes = 'Selecciona un mes válido.';
      }
      if (!anio || isNaN(anioNum) || anioNum < 2020 || anioNum > 2050) {
        nuevosErrores.anio = 'Selecciona un año entre 2020 y 2050.';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const construirFiltros = (): MovimientosPorEESSFiltros => {
    if (modoFiltro === 'mes') {
      const mesNum = parseInt(mes, 10);
      const anioNum = parseInt(anio, 10);
      const ultimoDia = getUltimoDiaDelMes(anioNum, mesNum);
      return {
        centroAcopioId: centroAcopioId || undefined,
        fechaInicio: formatYMD(anioNum, mesNum, 1),
        fechaFin: formatYMD(anioNum, mesNum, ultimoDia),
      };
    }

    return {
      centroAcopioId: centroAcopioId || undefined,
      fechaInicio,
      fechaFin,
    };
  };

  const handleCambiarModo = (nuevoModo: ModoFiltro) => {
    if (nuevoModo === modoFiltro) return;
    setModoFiltro(nuevoModo);
    setErrores({});
  };

  const handleExportar = async () => {
    if (!validarFormulario()) {
      toast.error(
        'Corrige los campos requeridos',
        modoFiltro === 'rango'
          ? 'Verifica el rango de fechas antes de exportar.'
          : 'Selecciona un mes y año válidos antes de exportar.',
        { duration: 3500 },
      );
      return;
    }

    setExportando(true);
    try {
      await onExportar(construirFiltros());
      onClose();
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      toast.error('No se pudo exportar el reporte', 'Inténtalo nuevamente con otro periodo o centro.', {
        duration: 4000,
      });
    } finally {
      setExportando(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Matriz de movimientos por EESS"
      subtitle="Exporta entregas, salidas y saldos agrupados por establecimiento y vacuna."
      icon={FileXls}
      size="lg"
      footer={(
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleExportar}
          submitType="button"
          submitLabel={exportando ? 'Generando Excel...' : 'Exportar Excel'}
          isLoading={exportando}
        />
      )}
    >
      <div className="space-y-4">
        <FormSection
          title="Periodo de consulta"
          description="Selecciona un rango de fechas personalizado o un mes calendario completo."
        >
          <div className={COMPONENT_STYLES.segmented.container} role="tablist" aria-label="Modo de filtrado por periodo">
            <button
              type="button"
              role="tab"
              aria-selected={modoFiltro === 'rango'}
              onClick={() => handleCambiarModo('rango')}
              className={`${COMPONENT_STYLES.segmented.item} ${
                modoFiltro === 'rango' ? COMPONENT_STYLES.segmented.itemActive : COMPONENT_STYLES.segmented.itemInactive
              }`}
            >
              <CalendarBlank className="h-4 w-4" weight={modoFiltro === 'rango' ? 'fill' : 'regular'} />
              <span>Rango de fechas</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={modoFiltro === 'mes'}
              onClick={() => handleCambiarModo('mes')}
              className={`${COMPONENT_STYLES.segmented.item} ${
                modoFiltro === 'mes' ? COMPONENT_STYLES.segmented.itemActive : COMPONENT_STYLES.segmented.itemInactive
              }`}
            >
              <CalendarCheck className="h-4 w-4" weight={modoFiltro === 'mes' ? 'fill' : 'regular'} />
              <span>Por mes</span>
            </button>
          </div>

          {modoFiltro === 'rango' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <DateInput
                id="movimientos-eess-start"
                label="Fecha inicio"
                value={fechaInicio}
                onChange={setFechaInicio}
                error={errores.fechaInicio}
              />
              <DateInput
                id="movimientos-eess-end"
                label="Fecha fin"
                value={fechaFin}
                onChange={setFechaFin}
                error={errores.fechaFin}
              />
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectInput
                  id="movimientos-eess-mes"
                  label="Mes"
                  value={mes}
                  onChange={setMes}
                  options={MESES}
                  placeholder="Seleccionar mes"
                  error={errores.mes}
                />
                <SelectInput
                  id="movimientos-eess-anio"
                  label="Año"
                  value={anio}
                  onChange={setAnio}
                  options={aniosOptions}
                  placeholder="Seleccionar año"
                  error={errores.anio}
                />
              </div>
              {periodoResumen ? (
                <p className="font-mono text-xs text-muted-2">
                  Periodo seleccionado: <span className="font-semibold text-ink">{periodoResumen}</span>
                </p>
              ) : null}
            </div>
          )}
        </FormSection>

        <FormSection
          title="Alcance territorial"
          description="Filtra por un centro de acopio específico o incluye todos los establecimientos."
        >
          <SelectInput
            id="movimientos-eess-centro"
            label="Centro de acopio"
            value={centroAcopioId}
            onChange={setCentroAcopioId}
            options={[
              { value: '', label: 'Todos los centros de acopio' },
              ...centrosAcopio.map((centro) => ({ value: centro.id, label: centro.nombre })),
            ]}
          />
        </FormSection>
      </div>
    </Modal>
  );
};

export default MovimientosPorEESSModal;
export type { MovimientosPorEESSFiltros };
