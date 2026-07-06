import React, { memo, useMemo } from 'react';
import { DownloadSimple, CircleNotch, ArrowsClockwise, MagnifyingGlass, Faders, UserPlus, X } from '@phosphor-icons/react';
import { CentroAcopio, Role } from '../../../types';
import { COMPONENT_STYLES } from '../constants';

interface UsuariosFiltrosProps {
  searchTerm: string;
  filterRol: string;
  filterEstado: string;
  filterCentroAcopio: string;
  roles: Role[];
  centrosAcopio: CentroAcopio[];
  onSearchChange: (value: string) => void;
  onRolChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
  onCentroAcopioChange: (value: string) => void;
  onRefresh: () => void;
  onExportar: () => void;
  onNuevoUsuario: () => void;
  isRefreshing: boolean;
  isCreating: boolean;
}

const UsuariosFiltros: React.FC<UsuariosFiltrosProps> = memo(({
  searchTerm,
  filterRol,
  filterEstado,
  filterCentroAcopio,
  roles,
  centrosAcopio,
  onSearchChange,
  onRolChange,
  onEstadoChange,
  onCentroAcopioChange,
  onRefresh,
  onExportar,
  onNuevoUsuario,
  isRefreshing,
  isCreating,
}) => {
  const centrosActivos = useMemo(
    () => centrosAcopio.filter((centro) => centro.estado === 'activo'),
    [centrosAcopio],
  );

  const rolesActivos = useMemo(
    () => roles.filter((rol) => rol.estado === 'activo'),
    [roles],
  );

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    filterRol !== 'todos' ||
    filterEstado !== 'todos' ||
    filterCentroAcopio !== 'todos';

  return (
    <section aria-label="Filtros de usuarios" className={COMPONENT_STYLES.filter.container}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-[280px]">
            <label htmlFor="usuarios-search" className="sr-only">
              Buscar usuario
            </label>
            <MagnifyingGlass className={COMPONENT_STYLES.filter.searchIcon} aria-hidden="true" />
            <input
              id="usuarios-search"
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              className={COMPONENT_STYLES.filter.searchInput}
            />
          </div>

          <details className="group relative">
            <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-2 rounded-[9px] border border-[#e7e7ef] bg-white px-3.5 text-sm font-semibold text-[#15171d] shadow-sm transition hover:border-[#d7d8e2] hover:bg-[#fbfafd] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70 [&::-webkit-details-marker]:hidden">
              <Faders className="h-4 w-4 text-[#606571]" aria-hidden="true" />
              Filtros
            </summary>
            <div className="absolute left-0 top-11 z-30 w-[min(300px,calc(100vw-3rem))] rounded-[14px] border border-[#e7e7ef] bg-white p-3 shadow-[0_18px_40px_-28px_rgba(12,15,24,0.45)]">
              <div className="space-y-3">
                <div>
                  <label htmlFor="usuarios-filter-rol" className="mb-1 block text-xs font-medium text-[#747986]">
                    Rol
                  </label>
                  <select
                    id="usuarios-filter-rol"
                    value={filterRol}
                    onChange={(event) => onRolChange(event.target.value)}
                    className="h-9 w-full rounded-[9px] border border-[#e7e7ef] bg-white px-3 pr-8 text-sm font-medium text-[#15171d] outline-none transition hover:border-[#d7d8e2] focus:border-[#babdca] focus:ring-2 focus:ring-[#dedfea]/70"
                  >
                    <option value="todos">Todos los roles</option>
                    {rolesActivos.map((rol) => (
                      <option key={rol.id} value={rol.codigo || rol.id}>{rol.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="usuarios-filter-estado" className="mb-1 block text-xs font-medium text-[#747986]">
                    Estado
                  </label>
                  <select
                    id="usuarios-filter-estado"
                    value={filterEstado}
                    onChange={(event) => onEstadoChange(event.target.value)}
                    className="h-9 w-full rounded-[9px] border border-[#e7e7ef] bg-white px-3 pr-8 text-sm font-medium text-[#15171d] outline-none transition hover:border-[#d7d8e2] focus:border-[#babdca] focus:ring-2 focus:ring-[#dedfea]/70"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="activo">Activos</option>
                    <option value="inactivo">Inactivos</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="usuarios-filter-centro" className="mb-1 block text-xs font-medium text-[#747986]">
                    Centro de acopio
                  </label>
                  <select
                    id="usuarios-filter-centro"
                    value={filterCentroAcopio}
                    onChange={(event) => onCentroAcopioChange(event.target.value)}
                    className="h-9 w-full rounded-[9px] border border-[#e7e7ef] bg-white px-3 pr-8 text-sm font-medium text-[#15171d] outline-none transition hover:border-[#d7d8e2] focus:border-[#babdca] focus:ring-2 focus:ring-[#dedfea]/70"
                  >
                    <option value="todos">Todos los centros</option>
                    {centrosActivos.map((centro) => (
                      <option key={centro.id} value={centro.id}>{centro.nombre}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={onRefresh}
                  className={`${COMPONENT_STYLES.button.secondary} w-full`}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? <CircleNotch className="h-4 w-4 animate-spin" /> : <ArrowsClockwise className="h-4 w-4" />}
                  <span>Actualizar</span>
                </button>
              </div>
            </div>
          </details>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onRolChange('todos');
                onEstadoChange('todos');
                onCentroAcopioChange('todos');
              }}
              className={COMPONENT_STYLES.button.ghost}
            >
              <X className="h-4 w-4" />
              <span>Limpiar</span>
            </button>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onExportar}
            className={COMPONENT_STYLES.button.secondary}
          >
            <DownloadSimple className="h-4 w-4" />
            <span>Exportar CSV</span>
          </button>
          <button
            type="button"
            onClick={onNuevoUsuario}
            className={COMPONENT_STYLES.button.primary}
            disabled={isCreating}
          >
            {isCreating ? <CircleNotch className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            <span>Nuevo usuario</span>
          </button>
        </div>
      </div>
    </section>
  );
});

UsuariosFiltros.displayName = 'UsuariosFiltros';

export default UsuariosFiltros;
   