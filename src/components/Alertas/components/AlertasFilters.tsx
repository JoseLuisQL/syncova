import React, { memo } from 'react';
import { Search } from 'lucide-react';
import { COMPONENT_STYLES, TIPOS_ALERTA, NIVELES_ALERTA } from '../constants';

interface AlertasFiltersProps {
  searchTerm: string;
  filtroTipo: string;
  filtroNivel: string;
  filtroEstado: string;
  onSearchChange: (value: string) => void;
  onTipoChange: (value: string) => void;
  onNivelChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
}

export const AlertasFilters: React.FC<AlertasFiltersProps> = memo(({
  searchTerm,
  filtroTipo,
  filtroNivel,
  filtroEstado,
  onSearchChange,
  onTipoChange,
  onNivelChange,
  onEstadoChange,
}) => (
  <div className="bg-gray-50/80 rounded-xl p-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label htmlFor="search" className={COMPONENT_STYLES.input.label}>
          Buscar
        </label>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            id="search"
            type="text"
            placeholder="Buscar alertas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal} pl-10`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="tipo" className={COMPONENT_STYLES.input.label}>
          Tipo
        </label>
        <select
          id="tipo"
          value={filtroTipo}
          onChange={(e) => onTipoChange(e.target.value)}
          className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
        >
          <option value="todos">Todos los tipos</option>
          {TIPOS_ALERTA.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>{tipo.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="nivel" className={COMPONENT_STYLES.input.label}>
          Nivel
        </label>
        <select
          id="nivel"
          value={filtroNivel}
          onChange={(e) => onNivelChange(e.target.value)}
          className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
        >
          <option value="todos">Todos los niveles</option>
          {NIVELES_ALERTA.map((nivel) => (
            <option key={nivel.id} value={nivel.id}>{nivel.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="estado" className={COMPONENT_STYLES.input.label}>
          Estado
        </label>
        <select
          id="estado"
          value={filtroEstado}
          onChange={(e) => onEstadoChange(e.target.value)}
          className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
        >
          <option value="todos">Todas</option>
          <option value="no_leidas">No leidas</option>
          <option value="leidas">Leidas</option>
        </select>
      </div>
    </div>
  </div>
));

AlertasFilters.displayName = 'AlertasFilters';
