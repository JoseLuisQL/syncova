import React, { useState, useMemo, useCallback, memo } from 'react';
import { Calendar, Building2 } from 'lucide-react';
import { Establecimiento, Vacuna } from '../../../../types';
import { COMPONENT_STYLES } from '../../constants';
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

  const yearOptions = useMemo(() => 
    Array.from({ length: 7 }, (_, i) => currentYear - 3 + i),
    [currentYear]
  );

  const handleYearChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAnio(parseInt(e.target.value));
  }, []);

  const handleCentroChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCentro(e.target.value);
  }, []);

  const handleTipoChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTipo(e.target.value);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Filtros compactos */}
      <div className="bg-gradient-to-r from-teal-50/50 to-cyan-50/50 rounded-xl border border-teal-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Año */}
          <div>
            <label className={COMPONENT_STYLES.input.label}>
              <Calendar className="h-3.5 w-3.5 inline mr-1.5 text-teal-600" />
              Año
            </label>
            <select
              value={selectedAnio}
              onChange={handleYearChange}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Centro de Acopio */}
          <div>
            <label className={COMPONENT_STYLES.input.label}>
              <Building2 className="h-3.5 w-3.5 inline mr-1.5 text-teal-600" />
              Centro de Acopio
            </label>
            <select
              value={selectedCentro}
              onChange={handleCentroChange}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
            >
              <option value="todos">Todos los centros</option>
              {centrosAcopio.map(centro => (
                <option key={centro.id} value={centro.id}>
                  {centro.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Item */}
          <div>
            <label className={COMPONENT_STYLES.input.label}>
              Tipo de Item
            </label>
            <select
              value={selectedTipo}
              onChange={handleTipoChange}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
            >
              <option value="todos">Todos</option>
              <option value="vacuna">Solo Vacunas</option>
              <option value="jeringa">Solo Jeringas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla Principal */}
      <CenaresTable
        anio={selectedAnio}
        centroAcopioId={selectedCentro}
        tipoItem={selectedTipo}
      />
    </div>
  );
});

CenaresTab.displayName = 'CenaresTab';

export default CenaresTab;
