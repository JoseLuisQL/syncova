import React, { memo, useMemo } from 'react';
import {
  DownloadSimple,
  CircleNotch,
  ArrowsClockwise,
  MagnifyingGlass,
  CaretDown,
  UserPlus,
  X,
} from '@phosphor-icons/react';
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

const FILTER_LABEL_CLASS = 'mb-1 block truncate text-[11px] font-semibold uppercase tracking-[0.06em] text-muted';
const SELECT_BASE_CLASS =
  'h-9 w-full appearance-none rounded-lg border border-line bg-surface pl-3 pr-8 text-xs sm:text-sm font-medium text-ink shadow-2xs transition hover:border-line-strong focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/15';

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
    <section
      aria-label="Filtros de usuarios"
      className="rounded-xl border border-line bg-surface p-3 shadow-2xs sm:p-3.5"
    >
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-end">
          {/* Buscador */}
          <div className="w-full sm:w-[220px] lg:w-[240px]">
            <label htmlFor="usuarios-search" className={FILTER_LABEL_CLASS}>
              Buscar usuario
            </label>
            <div className="relative">
              <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" aria-hidden="true" />
              <input
                id="usuarios-search"
                type="text"
                placeholder="Nombre, usuario o correo..."
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                className="h-9 w-full rounded-lg border border-line bg-surface pl-9 pr-8 text-xs sm:text-sm font-medium text-ink shadow-2xs transition placeholder:text-muted hover:border-line-strong focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/15"
              />
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted hover:bg-surface-soft hover:text-ink"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Selectores directos */}
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-end">
            <div className="min-w-0 sm:w-[160px]">
              <label htmlFor="usuarios-filter-rol" className={FILTER_LABEL_CLASS}>
                Rol
              </label>
              <div className="relative">
                <select
                  id="usuarios-filter-rol"
                  value={filterRol}
                  onChange={(event) => onRolChange(event.target.value)}
                  className={SELECT_BASE_CLASS}
                >
                  <option value="todos">Todos los roles</option>
                  {rolesActivos.map((rol) => (
                    <option key={rol.id} value={rol.codigo || rol.id}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
                <CaretDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2" weight="bold" />
              </div>
            </div>

            <div className="min-w-0 sm:w-[140px]">
              <label htmlFor="usuarios-filter-estado" className={FILTER_LABEL_CLASS}>
                Estado
              </label>
              <div className="relative">
                <select
                  id="usuarios-filter-estado"
                  value={filterEstado}
                  onChange={(event) => onEstadoChange(event.target.value)}
                  className={SELECT_BASE_CLASS}
                >
                  <option value="todos">Todos</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
                <CaretDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2" weight="bold" />
              </div>
            </div>

            <div className="col-span-2 min-w-0 sm:col-span-1 sm:w-[175px]">
              <label htmlFor="usuarios-filter-centro" className={FILTER_LABEL_CLASS}>
                Centro de acopio
              </label>
              <div className="relative">
                <select
                  id="usuarios-filter-centro"
                  value={filterCentroAcopio}
                  onChange={(event) => onCentroAcopioChange(event.target.value)}
                  className={SELECT_BASE_CLASS}
                >
                  <option value="todos">Todos los centros</option>
                  {centrosActivos.map((centro) => (
                    <option key={centro.id} value={centro.id}>
                      {centro.nombre}
                    </option>
                  ))}
                </select>
                <CaretDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2" weight="bold" />
              </div>
            </div>
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onRolChange('todos');
                onEstadoChange('todos');
                onCentroAcopioChange('todos');
              }}
              className="inline-flex h-9 items-center justify-center gap-1.5 self-start sm:self-end rounded-lg border border-line bg-surface-soft px-3 text-xs font-semibold text-muted-2 transition hover:border-line-strong hover:bg-surface hover:text-ink"
            >
              <X className="h-3.5 w-3.5" weight="bold" />
              <span>Limpiar</span>
            </button>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-line-soft pt-2 sm:border-t-0 sm:pt-0">
          <button
            type="button"
            onClick={onRefresh}
            className={COMPONENT_STYLES.button.secondary}
            disabled={isRefreshing}
            title="Actualizar lista"
          >
            {isRefreshing ? <CircleNotch className="h-4 w-4 animate-spin" /> : <ArrowsClockwise className="h-4 w-4" />}
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          <button
            type="button"
            onClick={onExportar}
            className={COMPONENT_STYLES.button.secondary}
          >
            <DownloadSimple className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
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