import React, { memo, useCallback, useMemo, useState } from 'react';
import { Buildings, CalendarBlank } from '@phosphor-icons/react';
import { Establecimiento, Vacuna } from '../../../../types';
import { COMPONENT_STYLES } from '../../constants';
import { ReportSectionCard } from '../ReportPrimitives';
import CenaresTable from './CenaresTable';

interface CenaresTabProps {
  centrosAcopio: Establecimiento[];
  vacunas: Vacuna[];
}

const CenaresTab: React.FC<CenaresTabProps> = memo(({ centrosAcopio }) => {
  const currentYear = new Date().getFullYear();
  const [selectedAnio, setSelectedAnio] = useState<number>(currentYear);
  const [selectedCentro, setSelectedCentro] = useState<string>('todos');
  const [selectedTipo, setSelectedTipo] = useState<string>('todos');

  const yearOptions = useMemo(
    () => Array.from({ length: 7 }, (_, index) => currentYear - 3 + index),
    [currentYear],
  );

  const handleYearChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAnio(parseInt(event.target.value, 10));
  }, []);

  const handleCentroChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCentro(event.target.value);
  }, []);

  const handleTipoChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTipo(event.target.value);
  }, []);

  return (
    <ReportSectionCard
      title="Seguimiento anual CENARES"
      subtitle="Mantiene la lógica de cálculo y auto-guardado, pero con una superficie más clara y consistente."
      aside={<span className={COMPONENT_STYLES.badge.info}>Auto-guardado activo</span>}
      showHeader={false}
    >
      <div className="space-y-6">
        <section className={`${COMPONENT_STYLES.filter.container} border-zinc-200 bg-zinc-50/50`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-zinc-800">Contexto de seguimiento</h3>
              <p className="mt-1 text-sm text-zinc-900/80">Filtra el año, el centro y el tipo de item antes de editar o exportar.</p>
            </div>
            <span className={COMPONENT_STYLES.badge.count}>Seguimiento anual</span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div>
              <label className={COMPONENT_STYLES.input.label}>
                <CalendarBlank className="mr-1.5 inline h-3.5 w-3.5 text-zinc-600" />
                Año
              </label>
              <select
                value={selectedAnio}
                onChange={handleYearChange}
                className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={COMPONENT_STYLES.input.label}>
                <Buildings weight="duotone" className="mr-1.5 inline h-3.5 w-3.5 text-zinc-600" />
                Centro de acopio
              </label>
              <select
                value={selectedCentro}
                onChange={handleCentroChange}
                className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
              >
                <option value="todos">Todos los centros</option>
                {centrosAcopio.map((centro) => (
                  <option key={centro.id} value={centro.id}>{centro.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={COMPONENT_STYLES.input.label}>Tipo de item</label>
              <select
                value={selectedTipo}
                onChange={handleTipoChange}
                className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
              >
                <option value="todos">Todos</option>
                <option value="vacuna">Solo vacunas</option>
                <option value="jeringa">Solo jeringas</option>
              </select>
            </div>
          </div>
        </section>

        <CenaresTable
          anio={selectedAnio}
          centroAcopioId={selectedCentro}
          tipoItem={selectedTipo}
        />
      </div>
    </ReportSectionCard>
  );
});

CenaresTab.displayName = 'CenaresTab';

export default CenaresTab;
