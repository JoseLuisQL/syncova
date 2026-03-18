import React, { memo } from 'react';
import { FilterBar } from '../../Inventario/components/FilterAndTable';
import { NIVELES_ALERTA, TIPOS_ALERTA } from '../constants';

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
  <FilterBar
    searchValue={searchTerm}
    onSearchChange={onSearchChange}
    searchPlaceholder="Buscar por título o descripción"
    layout="inline"
    onClear={() => {
      onSearchChange('');
      onTipoChange('todos');
      onNivelChange('todos');
      onEstadoChange('todos');
    }}
    filters={[
      {
        id: 'alerta-tipo',
        label: 'Tipo',
        value: filtroTipo,
        onChange: onTipoChange,
        options: [
          { value: 'todos', label: 'Todos los tipos' },
          ...TIPOS_ALERTA.map((tipo) => ({ value: tipo.id, label: tipo.label })),
        ],
      },
      {
        id: 'alerta-nivel',
        label: 'Nivel',
        value: filtroNivel,
        onChange: onNivelChange,
        options: [
          { value: 'todos', label: 'Todos los niveles' },
          ...NIVELES_ALERTA.map((nivel) => ({ value: nivel.id, label: nivel.label })),
        ],
      },
      {
        id: 'alerta-estado',
        label: 'Estado',
        value: filtroEstado,
        onChange: onEstadoChange,
        options: [
          { value: 'todos', label: 'Todas' },
          { value: 'no_leidas', label: 'No leídas' },
          { value: 'leidas', label: 'Leídas' },
        ],
      },
    ]}
  />
));

AlertasFilters.displayName = 'AlertasFilters';
