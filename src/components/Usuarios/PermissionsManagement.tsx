import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Key,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  Settings2,
  Shield,
} from 'lucide-react';
import { Permission } from '../../types';
import { useToastContext } from '../../contexts/ToastContext';
import { PermissionService } from '../../services/permissionService';
import { logger } from '../../utils/debug';
import { COMPONENT_STYLES } from './constants';

interface PermissionsManagementProps {
  onNavigateToRoles?: () => void;
}

const formatLabel = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const PermissionsManagement: React.FC<PermissionsManagementProps> = ({ onNavigateToRoles }) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [filterCategoria, setFilterCategoria] = useState<string>('todas');
  const [filterRecurso, setFilterRecurso] = useState<string>('todos');
  const [filterAccion, setFilterAccion] = useState<string>('todas');

  const [categorias, setCategorias] = useState<string[]>([]);
  const [recursos, setRecursos] = useState<string[]>([]);
  const [acciones, setAcciones] = useState<string[]>([]);

  const { toast } = useToastContext();

  const filteredPermissions = useMemo(
    () =>
      permissions.filter((permission) => {
        const matchesSearch = searchTerm === ''
          || permission.nombre.toLowerCase().includes(searchTerm.toLowerCase())
          || permission.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
          || permission.codigo.toLowerCase().includes(searchTerm.toLowerCase())
          || permission.recurso.toLowerCase().includes(searchTerm.toLowerCase())
          || permission.accion.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesEstado = filterEstado === 'todos' || permission.estado === filterEstado;
        const matchesCategoria = filterCategoria === 'todas' || permission.categoria === filterCategoria;
        const matchesRecurso = filterRecurso === 'todos' || permission.recurso === filterRecurso;
        const matchesAccion = filterAccion === 'todas' || permission.accion === filterAccion;

        return matchesSearch && matchesEstado && matchesCategoria && matchesRecurso && matchesAccion;
      }),
    [filterAccion, filterCategoria, filterEstado, filterRecurso, permissions, searchTerm],
  );

  const hasActiveFilters =
    searchTerm.trim() !== ''
    || filterEstado !== 'todos'
    || filterCategoria !== 'todas'
    || filterRecurso !== 'todos'
    || filterAccion !== 'todas';

  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await PermissionService.getAll({ limit: 200 });
      setPermissions(result.permissions);
      logger.debug('Permisos cargados:', result.permissions);
    } catch (loadError) {
      const errorMessage = loadError instanceof Error ? loadError.message : 'Error al cargar permisos';
      setError(errorMessage);
      toast.error(errorMessage);
      logger.error('Error al cargar permisos:', loadError);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadMetadata = useCallback(async () => {
    try {
      const [categoriasResult, recursosResult, accionesResult] = await Promise.all([
        PermissionService.getCategorias(),
        PermissionService.getRecursos(),
        PermissionService.getAcciones(),
      ]);

      setCategorias(categoriasResult);
      setRecursos(recursosResult);
      setAcciones(accionesResult);
    } catch (metadataError) {
      logger.error('Error al cargar metadatos:', metadataError);
    }
  }, []);

  useEffect(() => {
    void loadPermissions();
    void loadMetadata();
  }, [loadMetadata, loadPermissions]);

  const getEstadoColor = (estado: string) =>
    estado === 'activo'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-rose-200 bg-rose-50 text-rose-700';

  const getAccionColor = (accion: string) => {
    const colors: Record<string, string> = {
      read: 'border-blue-200 bg-blue-50 text-blue-700',
      write: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      delete: 'border-rose-200 bg-rose-50 text-rose-700',
      export: 'border-violet-200 bg-violet-50 text-violet-700',
      manage: 'border-amber-200 bg-amber-50 text-amber-700',
    };

    return colors[accion] || 'border-slate-200 bg-slate-50 text-slate-700';
  };

  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      usuarios: 'border-indigo-200 bg-indigo-50 text-indigo-700',
      establecimientos: 'border-cyan-200 bg-cyan-50 text-cyan-700',
      vacunas: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      planificacion: 'border-amber-200 bg-amber-50 text-amber-700',
      movimientos: 'border-rose-200 bg-rose-50 text-rose-700',
      reportes: 'border-violet-200 bg-violet-50 text-violet-700',
      sistema: 'border-slate-200 bg-slate-50 text-slate-700',
      alertas: 'border-sky-200 bg-sky-50 text-sky-700',
      configuracion: 'border-teal-200 bg-teal-50 text-teal-700',
    };

    return colors[categoria] || 'border-slate-200 bg-slate-50 text-slate-700';
  };

  if (loading) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-slate-700">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 text-teal-700">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Cargando permisos</p>
            <p className="text-xs text-slate-500">Preparando catálogo, filtros y estadísticas del sistema.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-rose-200 bg-rose-50/80 p-6">
        <div className="flex items-center gap-2 text-rose-800">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">Error al cargar permisos</span>
        </div>
        <p className="mt-2 text-rose-700">{error}</p>
        <button
          onClick={() => void loadPermissions()}
          className={`${COMPONENT_STYLES.button.secondary} mt-4`}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Reintentar</span>
        </button>
      </div>
    );
  }

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
              onClick={() => {
                void loadPermissions();
                void loadMetadata();
              }}
              className={COMPONENT_STYLES.button.secondary}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Actualizar</span>
            </button>
            {onNavigateToRoles ? (
              <button
                onClick={onNavigateToRoles}
                className={COMPONENT_STYLES.button.secondary}
              >
                <Shield className="h-4 w-4" />
                <span>Ver roles</span>
              </button>
            ) : null}
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilterEstado('todos');
                  setFilterCategoria('todas');
                  setFilterRecurso('todos');
                  setFilterAccion('todas');
                }}
                className={COMPONENT_STYLES.button.secondary}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Limpiar filtros</span>
              </button>
            ) : (
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                {filteredPermissions.length} permisos visibles
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_repeat(4,minmax(0,0.8fr))]">
          <div className="relative">
            <label htmlFor="permissions-search" className="mb-1.5 block text-sm font-medium text-slate-700">
              Buscar permiso
            </label>
            <Search className="pointer-events-none absolute left-3.5 top-[calc(50%+0.875rem)] h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="permissions-search"
              type="text"
              placeholder="Buscar por nombre, código, recurso o acción"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className={`${COMPONENT_STYLES.filter.searchInput} pl-10`}
            />
          </div>

          <div>
            <label htmlFor="permissions-estado" className="mb-1.5 block text-sm font-medium text-slate-700">
              Estado
            </label>
            <select
              id="permissions-estado"
              value={filterEstado}
              onChange={(event) => setFilterEstado(event.target.value as 'todos' | 'activo' | 'inactivo')}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>

          <div>
            <label htmlFor="permissions-categoria" className="mb-1.5 block text-sm font-medium text-slate-700">
              Categoría
            </label>
            <select
              id="permissions-categoria"
              value={filterCategoria}
              onChange={(event) => setFilterCategoria(event.target.value)}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {formatLabel(categoria)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="permissions-recurso" className="mb-1.5 block text-sm font-medium text-slate-700">
              Recurso
            </label>
            <select
              id="permissions-recurso"
              value={filterRecurso}
              onChange={(event) => setFilterRecurso(event.target.value)}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
            >
              <option value="todos">Todos los recursos</option>
              {recursos.map((recurso) => (
                <option key={recurso} value={recurso}>
                  {formatLabel(recurso)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="permissions-accion" className="mb-1.5 block text-sm font-medium text-slate-700">
              Acción
            </label>
            <select
              id="permissions-accion"
              value={filterAccion}
              onChange={(event) => setFilterAccion(event.target.value)}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
            >
              <option value="todas">Todas las acciones</option>
              {acciones.map((accion) => (
                <option key={accion} value={accion}>
                  {formatLabel(accion)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/90">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Permiso</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Código</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Categoría</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Recurso</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Acción</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Estado</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Creado</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Auditoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredPermissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                        <Key className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-base font-medium text-slate-900">No se encontraron permisos</p>
                      <p className="max-w-md text-sm text-slate-500">
                        {hasActiveFilters
                          ? 'Intenta ajustar los filtros para encontrar el permiso que buscas.'
                          : 'No hay permisos disponibles para mostrar en este momento.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPermissions.map((permission) => (
                  <tr key={permission.id} className="transition-colors duration-150 hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-700">
                          <Key className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900">{permission.nombre}</div>
                          <div className="text-sm text-slate-500">{permission.descripcion || 'Sin descripción registrada.'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-sm text-slate-800">
                        {permission.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getCategoriaColor(permission.categoria)}`}>
                        {formatLabel(permission.categoria)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {permission.recurso}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getAccionColor(permission.accion)}`}>
                        {permission.accion}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getEstadoColor(permission.estado)}`}>
                        {permission.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span>{new Date(permission.createdAt).toLocaleDateString('es-PE')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                        <Lock className="h-3.5 w-3.5" />
                        <span>Solo lectura</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default PermissionsManagement;
