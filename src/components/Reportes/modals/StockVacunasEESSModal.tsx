import React, { useCallback, useMemo, useState } from 'react';
import { CheckSquare, FileXls, MagnifyingGlass, Square, X } from '@phosphor-icons/react';
import { Vacuna } from '../../../types';
import { CentroAcopioOption } from '../../../types/reportes';
import {
  DateInput,
  FormSection,
  Modal,
  ModalFooter,
  SelectInput,
} from '../../ui/ModalElements';
import { COMPONENT_STYLES } from '../constants';
import { getFechaPeruActual, getFechaPeruMesAnterior } from '../utils';

interface StockVacunasEESSModalProps {
  onClose: () => void;
  onExportar: (filtros: StockVacunasEESSFiltros) => Promise<void>;
  vacunas: Vacuna[];
  centrosAcopio: CentroAcopioOption[];
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
  const [searchVacuna, setSearchVacuna] = useState('');
  const [exportando, setExportando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const todasSeleccionadas = useMemo(
    () => vacunas.length > 0 && filtros.vacunaIds.length === vacunas.length,
    [filtros.vacunaIds.length, vacunas.length],
  );
  const algunasSeleccionadas = useMemo(
    () => filtros.vacunaIds.length > 0 && filtros.vacunaIds.length < vacunas.length,
    [filtros.vacunaIds.length, vacunas.length],
  );

  const vacunasFiltradas = useMemo(() => {
    const q = searchVacuna.trim().toLowerCase();
    if (!q) return vacunas;
    return vacunas.filter((v) => v.nombre.toLowerCase().includes(q));
  }, [searchVacuna, vacunas]);

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
      subtitle="Define el periodo, alcance territorial y biológicos incluidos en la matriz Excel."
      icon={FileXls}
      size="xl"
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
        <FormSection title="Periodo y cobertura" description="Rango de fechas y centro de acopio a consultar.">
          <div className="grid gap-3.5 sm:grid-cols-3">
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
            <SelectInput
              id="stock-eess-centro"
              label="Centro de acopio"
              value={filtros.centroAcopioId || ''}
              onChange={(value) => setFiltros((prev) => ({ ...prev, centroAcopioId: value || undefined }))}
              options={[
                { value: '', label: 'Todos los centros' },
                ...centrosAcopio.map((centro) => ({ value: centro.id, label: centro.nombre })),
              ]}
            />
          </div>
        </FormSection>

        <FormSection
          title="Biológicos incluidos"
          description={`${filtros.vacunaIds.length} de ${vacunas.length} vacunas seleccionadas.`}
        >
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <MagnifyingGlass className={COMPONENT_STYLES.filter.searchIcon} />
              <input
                type="search"
                value={searchVacuna}
                onChange={(e) => setSearchVacuna(e.target.value)}
                placeholder="Filtrar vacunas por nombre..."
                className={COMPONENT_STYLES.filter.searchInput}
              />
              {searchVacuna ? (
                <button
                  type="button"
                  onClick={() => setSearchVacuna('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted hover:text-ink"
                  aria-label="Limpiar filtro"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleToggleTodasVacunas}
              className={COMPONENT_STYLES.button.secondary}
            >
              {todasSeleccionadas ? (
                <CheckSquare className="h-4 w-4 text-brand" weight="fill" />
              ) : algunasSeleccionadas ? (
                <CheckSquare className="h-4 w-4 text-brand" />
              ) : (
                <Square className="h-4 w-4 text-muted" />
              )}
              <span>{todasSeleccionadas ? 'Deseleccionar todas' : 'Seleccionar todas'}</span>
            </button>
          </div>

          <div className="grid max-h-[240px] gap-2 overflow-y-auto pt-2 sm:grid-cols-2">
            {vacunasFiltradas.map((vacuna) => {
              const selected = filtros.vacunaIds.includes(vacuna.id);

              return (
                <button
                  key={vacuna.id}
                  type="button"
                  onClick={() => handleToggleVacuna(vacuna.id)}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-xs sm:text-sm transition-colors ${
                    selected
                      ? 'border-brand/40 bg-brand/5 text-ink font-medium'
                      : 'border-line bg-surface text-muted-2 hover:bg-surface-soft hover:text-ink'
                  }`}
                >
                  {selected ? (
                    <CheckSquare className="h-4 w-4 shrink-0 text-brand" weight="fill" />
                  ) : (
                    <Square className="h-4 w-4 shrink-0 text-muted" />
                  )}
                  <span className="truncate">{vacuna.nombre}</span>
                </button>
              );
            })}
          </div>

          {errores.vacunas ? <p className="mt-2 text-xs font-medium text-rose-600">{errores.vacunas}</p> : null}
        </FormSection>
      </div>
    </Modal>
  );
};

export default React.memo(StockVacunasEESSModal);
