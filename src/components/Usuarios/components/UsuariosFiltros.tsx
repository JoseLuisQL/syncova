import React, { memo, useMemo } from 'react';
import {
  Building2,
  Download,
  Loader2,
  RefreshCw,
  Search,
  Settings2,
  UserPlus,
} from 'lucide-react';
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

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Settings2 className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <span>Filtros y búsqueda</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              className={COMPONENT_STYLES.button.secondary}
              disabled={isRefreshing}
            >
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span>Actualizar</span>
            </button>
            <button
              type="button"
              onClick={onExportar}
              className={COMPONENT_STYLES.button.secondary}
            >
              <Download className="h-4 w-4" />
              <span>Exportar CSV</span>
            </button>
            <button
              type="button"
              onClick={onNuevoUsuario}
              className={COMPONENT_STYLES.button.primary}
              disabled={isCreating}
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              <span>Nuevo usuario</span>
            </button>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.55fr)_repeat(3,minmax(0,0.85fr))]">
          <div className="relative">
            <label htmlFor="usuarios-search" className="mb-1.5 block text-sm font-medium text-slate-700">
              Buscar usuario
            </label>
            <Search className="pointer-events-none absolute left-3.5 top-[calc(50%+0.875rem)] h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="usuarios-search"
              type="text"
              placeholder="Buscar por nombre, correo o usuario"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              className={`${COMPONENT_STYLES.filter.searchInput} pl-10`}
            />
          </div>

          <div>
            <label htmlFor="usuarios-filter-rol" className="mb-1.5 block text-sm font-medium text-slate-700">
              Rol
            </label>
            <select
              id="usuarios-filter-rol"
              value={filterRol}
              onChange={(event) => onRolChange(event.target.value)}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
            >
              <option value="todos">Todos los roles</option>
              {rolesActivos.map((rol) => (
                <option key={rol.id} value={rol.codigo || rol.id}>{rol.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="usuarios-filter-estado" className="mb-1.5 block text-sm font-medium text-slate-700">
              Estado
            </label>
            <select
              id="usuarios-filter-estado"
              value={filterEstado}
              onChange={(event) => onEstadoChange(event.target.value)}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>

          <div className="relative">
            <label htmlFor="usuarios-filter-centro" className="mb-1.5 block text-sm font-medium text-slate-700">
              Centro de acopio
            </label>
            <Building2 className="pointer-events-none absolute left-3 top-[calc(50%+0.875rem)] h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              id="usuarios-filter-centro"
              value={filterCentroAcopio}
              onChange={(event) => onCentroAcopioChange(event.target.value)}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal} pl-10`}
            >
              <option value="todos">Todos los centros</option>
              {centrosActivos.map((centro) => (
                <option key={centro.id} value={centro.id}>{centro.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </section>
    </div>
  );
});

UsuariosFiltros.displayName = 'UsuariosFiltros';

export default UsuariosFiltros;
