import React, { useCallback, useMemo, useState } from 'react';
import { CheckSquare, FileSpreadsheet, Square } from 'lucide-react';
import { Vacuna, Establecimiento } from '../../../types';
import {
  DateInput,
  FormSection,
  Modal,
  ModalFooter,
  SelectInput,
} from '../../Inventario/components/ModalComponents';
import { getFechaPeruActual, getFechaPeruMesAnterior } from '../utils';

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

const StockVacunasEESSModal: React.FC<StockVacunasEESSModalProps> = ({
  onClose,
  onExportar,
  vacunas,
  centrosAcopio,
}) => {
  const [filtros, setFiltros] = useState<StockVacunasEESSFiltros>({
    fechaInicio: getFechaPeruMesAnterior(),
    fechaFin: getFechaPeruActual(),
    vacunaIds: vacunas.map((vacuna) => vacuna.id),
  });
  const [exportando, setExportando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const todasSeleccionadas = useMemo(
    () => filtros.vacunaIds.length === vacunas.length,
    [filtros.vacunaIds.length, vacunas.length],
  );
  const algunasSeleccionadas = useMemo(
    () => filtros.vacunaIds.length > 0 && filtros.vacunaIds.length < vacunas.length,
    [filtros.vacunaIds.length, vacunas.length],
  );

  const handleToggleTodasVacunas = useCallback(() => {
    setFiltros((prev) => ({
      ...prev,
      vacunaIds: todasSeleccionadas ? [] : vacunas.map((vacuna) => vacuna.id),
    }));
  }, [todasSeleccionadas, vacunas]);

  const handleToggleVacuna = useCallback((vacunaId: string) => {
    setFiltros((prev) => ({
      ...prev,
      vacunaIds: prev.vacunaIds.includes(vacunaId)
        ? prev.vacunaIds.filter((id) => id !== vacunaId)
        : [...prev.vacunaIds, vacunaId],
    }));
  }, []);

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!filtros.fechaInicio) nuevosErrores.fechaInicio = 'La fecha de inicio es requerida.';
    if (!filtros.fechaFin) nuevosErrores.fechaFin = 'La fecha de fin es requerida.';
    if (filtros.vacunaIds.length === 0) nuevosErrores.vacunas = 'Selecciona al menos una vacuna.';

    if (filtros.fechaInicio && filtros.fechaFin) {
      const inicio = new Date(filtros.fechaInicio);
      const fin = new Date(filtros.fechaFin);
      const diffDays = Math.ceil(Math.abs(fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));

      if (inicio > fin) {
        nuevosErrores.fechaFin = 'La fecha final debe ser posterior a la inicial.';
      } else if (diffDays > 730) {
        nuevosErrores.fechaFin = 'El rango no puede superar 2 años.';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleExportar = async () => {
    if (!validarFormulario()) return;

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
    <Modal
      isOpen
      onClose={onClose}
      title="Stock de vacunas por EESS"
      subtitle="Define el periodo, el alcance territorial y las vacunas incluidas en el Excel."
      icon={FileSpreadsheet}
      size="xl"
      footer={(
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleExportar}
          submitType="button"
          submitLabel={exportando ? 'Generando Excel...' : 'Generar Excel'}
          isLoading={exportando}
        />
      )}
    >
      <div className="space-y-4">
        <FormSection
          title="Resumen del reporte"
          description="El Excel agrupa stock por establecimiento y permite seleccionar múltiples vacunas."
        >
          <div className="rounded-[18px] border border-sky-200 bg-sky-50/80 p-4 text-sm leading-6 text-sky-900">
            Esta exportación es ideal para revisar cobertura territorial y disponibilidad por establecimiento.
          </div>
        </FormSection>

        <FormSection title="Periodo" description="El rango controla la fotografía temporal del stock exportado.">
          <div className="grid gap-4 sm:grid-cols-2">
            <DateInput
              id="stock-eess-start"
              label="Fecha inicio"
              value={filtros.fechaInicio}
              onChange={(value) => setFiltros((prev) => ({ ...prev, fechaInicio: value }))}
              error={errores.fechaInicio}
            />
            <DateInput
              id="stock-eess-end"
              label="Fecha fin"
              value={filtros.fechaFin}
              onChange={(value) => setFiltros((prev) => ({ ...prev, fechaFin: value }))}
              error={errores.fechaFin}
            />
          </div>
        </FormSection>

        <FormSection
          title="Cobertura"
          description="Si no eliges un centro específico, se usarán todos los establecimientos disponibles."
        >
          <SelectInput
            id="stock-eess-centro"
            label="Centro de acopio"
            value={filtros.centroAcopioId || ''}
            onChange={(value) => setFiltros((prev) => ({ ...prev, centroAcopioId: value || undefined }))}
            options={[
              { value: '', label: 'Todos los centros de acopio' },
              ...centrosAcopio.map((centro) => ({ value: centro.id, label: centro.nombre })),
            ]}
          />
        </FormSection>

        <FormSection
          title="Vacunas incluidas"
          description={`${filtros.vacunaIds.length} de ${vacunas.length} vacunas seleccionadas.`}
        >
          <button
            type="button"
            onClick={handleToggleTodasVacunas}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            {todasSeleccionadas ? (
              <CheckSquare className="h-4 w-4 text-teal-600" />
            ) : algunasSeleccionadas ? (
              <span className="flex h-4 w-4 items-center justify-center rounded border-2 border-teal-600 bg-teal-100">
                <span className="h-1.5 w-1.5 rounded-sm bg-teal-600" />
              </span>
            ) : (
              <Square className="h-4 w-4 text-slate-400" />
            )}
            Seleccionar todas
          </button>

          <div className="grid max-h-[280px] gap-2 overflow-y-auto pt-3 sm:grid-cols-2">
            {vacunas.map((vacuna) => {
              const selected = filtros.vacunaIds.includes(vacuna.id);

              return (
                <button
                  key={vacuna.id}
                  type="button"
                  onClick={() => handleToggleVacuna(vacuna.id)}
                  className={`flex items-center gap-3 rounded-[16px] border px-3 py-3 text-left transition ${
                    selected ? 'border-teal-200 bg-teal-50/80 text-teal-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {selected ? (
                    <CheckSquare className="h-4 w-4 shrink-0 text-teal-600" />
                  ) : (
                    <Square className="h-4 w-4 shrink-0 text-slate-400" />
                  )}
                  <span className="text-sm font-medium">{vacuna.nombre}</span>
                </button>
              );
            })}
          </div>

          {errores.vacunas ? <p className="mt-2 text-xs text-rose-600">{errores.vacunas}</p> : null}
        </FormSection>
      </div>
    </Modal>
  );
};

export default React.memo(StockVacunasEESSModal);
export type { StockVacunasEESSFiltros };
