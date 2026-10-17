import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { X, Key, Shield, MagnifyingGlass, CircleNotch, CaretDown, CaretRight, Check, Checks, Eye, PencilSimple, Trash, DownloadSimple, Gear, Users, Package, FileText, Bell, Buildings, ChartBar, Funnel, ArrowCounterClockwise } from '@phosphor-icons/react';
import { Role, Permission } from '../../types';
import { COMPONENT_STYLES } from './constants';
import { Modal } from '../ui/ModalElements';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  role: Role | null;
  permissions: Permission[];
  selectedPermissions: string[];
  onPermissionToggle: (permissionId: string) => void;
  isLoading?: boolean;
  isReadOnly?: boolean;
}

// Iconos por categoría
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Dashboard': ChartBar,
  'Establecimientos': Buildings,
  'Inventario': Package,
  'Movimientos': PencilSimple,
  'Planificación': FileText,
  'Kardex': FileText,
  'Reportas': ChartBar,
  'Reportes': ChartBar,
  'Alertas': Bell,
  'Usuarios': Users,
  'Configuración': Gear,
};

// Colores por categoría
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  'Dashboard': { bg: 'bg-zinc-50 dark:bg-zinc-900', text: 'text-zinc-700 dark:text-zinc-300', border: 'border-zinc-200 dark:border-zinc-800', iconBg: 'bg-zinc-100 dark:bg-zinc-800' },
  'Establecimientos': { bg: 'bg-zinc-50 dark:bg-zinc-900', text: 'text-zinc-700 dark:text-zinc-300', border: 'border-zinc-200 dark:border-zinc-800', iconBg: 'bg-zinc-100 dark:bg-zinc-800' },
  'Inventario': { bg: 'bg-zinc-50 dark:bg-zinc-900', text: 'text-zinc-700 dark:text-zinc-300', border: 'border-zinc-200 dark:border-zinc-800', iconBg: 'bg-zinc-100 dark:bg-zinc-800' },
  'Movimientos': { bg: 'bg-blue-50/70 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-900/60', iconBg: 'bg-blue-100/80 dark:bg-blue-900/40' },
  'Planificación': { bg: 'bg-zinc-50 dark:bg-zinc-900', text: 'text-zinc-700 dark:text-zinc-300', border: 'border-zinc-200 dark:border-zinc-800', iconBg: 'bg-zinc-100 dark:bg-zinc-800' },
  'Kardex': { bg: 'bg-purple-50/70 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-900/60', iconBg: 'bg-purple-100/80 dark:bg-purple-900/40' },
  'Reportes': { bg: 'bg-amber-50/70 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-900/60', iconBg: 'bg-amber-100/80 dark:bg-amber-900/40' },
  'Alertas': { bg: 'bg-rose-50/70 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-900/60', iconBg: 'bg-rose-100/80 dark:bg-rose-900/40' },
  'Usuarios': { bg: 'bg-emerald-50/70 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-900/60', iconBg: 'bg-emerald-100/80 dark:bg-emerald-900/40' },
  'Configuración': { bg: 'bg-zinc-50 dark:bg-zinc-900', text: 'text-zinc-700 dark:text-zinc-300', border: 'border-zinc-200 dark:border-zinc-800', iconBg: 'bg-zinc-100 dark:bg-zinc-800' },
};

// Colores por acción
const ACTION_STYLES: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  'read': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Eye },
  'write': { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: PencilSimple },
  'update': { bg: 'bg-amber-100', text: 'text-amber-700', icon: PencilSimple },
  'delete': { bg: 'bg-rose-100', text: 'text-rose-700', icon: Trash },
  'export': { bg: 'bg-purple-100', text: 'text-purple-700', icon: DownloadSimple },
  'manage': { bg: 'bg-zinc-100', text: 'text-zinc-700', icon: Gear },
  'assign': { bg: 'bg-zinc-100', text: 'text-zinc-700', icon: Users },
  'aprobar': { bg: 'bg-zinc-100', text: 'text-zinc-700', icon: Checks },
  'anular': { bg: 'bg-orange-100', text: 'text-orange-700', icon: X },
  'marcar': { bg: 'bg-sky-100', text: 'text-sky-700', icon: Check },
  'password': { bg: 'bg-zinc-100', text: 'text-zinc-700', icon: Key },
  'estado': { bg: 'bg-lime-100', text: 'text-lime-700', icon: Gear },
  'ingreso': { bg: 'bg-green-100', text: 'text-green-700', icon: Package },
};

const PermissionsModal: React.FC<PermissionsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  role,
  permissions,
  selectedPermissions,
  onPermissionToggle,
  isLoading = false,
  isReadOnly = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('todas');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Obtener categorías únicas ordenadas
  const categories = useMemo(() => {
    const order = ['Dashboard', 'Establecimientos', 'Inventario', 'Movimientos', 'Planificación', 'Kardex', 'Reportes', 'Alertas', 'Usuarios', 'Configuración'];
    const uniqueCategories = Array.from(new Set(permissions.map(p => p.categoria)));
    return uniqueCategories.sort((a, b) => {
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [permissions]);

  // Filtrar permisos
  const filteredPermissions = useMemo(() => {
    return permissions.filter(permission => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        permission.nombre.toLowerCase().includes(searchLower) ||
        permission.descripcion?.toLowerCase().includes(searchLower) ||
        permission.codigo.toLowerCase().includes(searchLower) ||
        permission.recurso.toLowerCase().includes(searchLower);
      
      const matchesCategory = filterCategory === 'todas' || permission.categoria === filterCategory;
      
      return matchesSearch && matchesCategory && permission.estado === 'activo';
    });
  }, [permissions, searchTerm, filterCategory]);

  // Agrupar permisos por categoría
  const groupedPermissions = useMemo(() => {
    return filteredPermissions.reduce((acc, permission) => {
      if (!acc[permission.categoria]) {
        acc[permission.categoria] = [];
      }
      acc[permission.categoria].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [filteredPermissions]);

  // Expandir todas las categorías al abrir.
  // Ajuste durante el render (sin useEffect) para evitar el flash de estado
  // stale que marca react-doctor (no-adjust-state-on-prop-change).
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setExpandedCategories(new Set(categories));
      setSearchTerm('');
      setFilterCategory('todas');
    }
  }

  // Foco al abrir: timer con cleanup para evitar memory leak.
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => searchInputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, [isOpen]);

  // Manejar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  const toggleAllInCategory = useCallback((category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const categoryPermissions = groupedPermissions[category] || [];
    const allSelected = categoryPermissions.every(p => selectedPermissions.includes(p.id));
    
    if (isReadOnly) return;
    categoryPermissions.forEach(permission => {
      if (allSelected && selectedPermissions.includes(permission.id)) {
        onPermissionToggle(permission.id);
      } else if (!allSelected && !selectedPermissions.includes(permission.id)) {
        onPermissionToggle(permission.id);
      }
    });
  }, [groupedPermissions, isReadOnly, selectedPermissions, onPermissionToggle]);

  const selectAll = useCallback(() => {
    if (isReadOnly) return;
    filteredPermissions.forEach(permission => {
      if (!selectedPermissions.includes(permission.id)) {
        onPermissionToggle(permission.id);
      }
    });
  }, [filteredPermissions, isReadOnly, selectedPermissions, onPermissionToggle]);

  const deselectAll = useCallback(() => {
    if (isReadOnly) return;
    filteredPermissions.forEach(permission => {
      if (selectedPermissions.includes(permission.id)) {
        onPermissionToggle(permission.id);
      }
    });
  }, [filteredPermissions, isReadOnly, selectedPermissions, onPermissionToggle]);

  const getCategoryStats = useCallback((category: string) => {
    const categoryPermissions = groupedPermissions[category] || [];
    const selectedCount = categoryPermissions.filter(p => selectedPermissions.includes(p.id)).length;
    return { total: categoryPermissions.length, selected: selectedCount };
  }, [groupedPermissions, selectedPermissions]);

  const totalStats = useMemo(() => {
    const activePermissions = permissions.filter(p => p.estado === 'activo');
    return {
      total: activePermissions.length,
      selected: selectedPermissions.length,
      filtered: filteredPermissions.length
    };
  }, [permissions, selectedPermissions, filteredPermissions]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('todas');
  };

  const getActionStyle = (accion: string) => {
    return ACTION_STYLES[accion] || { bg: 'bg-zinc-100', text: 'text-zinc-700', icon: Gear };
  };

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category] || { bg: 'bg-zinc-50', text: 'text-zinc-700', border: 'border-zinc-200', iconBg: 'bg-zinc-100' };
  };

  const getCategoryIcon = (category: string) => {
    return CATEGORY_ICONS[category] || Shield;
  };

  if (!isOpen || !role) return null;

  const hasActiveFilters = searchTerm !== '' || filterCategory !== 'todas';

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading || isSaving ? () => undefined : onClose}
      title="Gestionar permisos"
      subtitle={`Rol: ${role.nombre}${isReadOnly ? ' · consulta protegida' : ''}`}
      icon={Key}
      size="2xl"
      footer={
        <div className="flex w-full flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2 text-xs text-muted-2">
            <Shield className="h-4 w-4 text-muted-2" />
            <span>
              <strong className="text-ink">{totalStats.selected}</strong> permisos asignados al rol <strong className="text-ink">{role.nombre}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isSaving}
              className={COMPONENT_STYLES.button.secondary}
            >
              Cancelar
            </button>
            {!isReadOnly ? (
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading || isSaving}
                className={COMPONENT_STYLES.button.primary}
              >
                {(isLoading || isSaving) ? <CircleNotch className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                <span>Guardar permisos</span>
              </button>
            ) : null}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {isReadOnly && (
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 px-3.5 py-2.5 text-xs font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            Este rol es parte de la configuración base del sistema. Sus permisos se muestran solo para auditoría.
          </div>
        )}

        {/* Filtros y estadísticas */}
        <div className="rounded-xl border border-line-soft bg-surface-soft/50 p-3.5">
          <div className="flex flex-col gap-3 lg:flex-row">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar permisos por nombre, código o recurso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={COMPONENT_STYLES.filter.searchInput}
                aria-label="Buscar permisos"
              />
            </div>

            {/* Filtro por categoría */}
            <div className="flex items-center gap-2">
              <Funnel className="h-4 w-4 text-muted" aria-hidden="true" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`${COMPONENT_STYLES.select.base} sm:w-auto sm:min-w-[190px]`}
                aria-label="Filtrar por categoría"
              >
                <option value="todas">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Limpiar filtros */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className={COMPONENT_STYLES.button.ghost}
              >
                <ArrowCounterClockwise className="h-4 w-4" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
          </div>

          {/* Estadísticas y acciones rápidas */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line-soft pt-3">
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-brand" />
                <span className="text-muted-2">
                  <span className="font-semibold text-ink">{totalStats.selected}</span>
                  <span className="text-muted"> / </span>
                  <span>{totalStats.total}</span>
                  <span className="ml-1 text-muted-2">seleccionados</span>
                </span>
              </div>
              {hasActiveFilters && (
                <div className="flex items-center gap-2 text-muted-2">
                  <span>•</span>
                  <span>{totalStats.filtered} resultados</span>
                </div>
              )}
            </div>

            {!isReadOnly ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink transition hover:bg-surface-soft"
                >
                  Seleccionar visibles
                </button>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="rounded-lg border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-muted-2 transition hover:bg-surface hover:text-ink"
                >
                  Deseleccionar visibles
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Lista de permisos */}
        <div>
          {Object.keys(groupedPermissions).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-3 rounded-xl border border-line bg-surface-soft p-3.5">
                <MagnifyingGlass className="h-6 w-6 text-muted" />
              </div>
              <p className="text-sm font-semibold text-ink">No se encontraron permisos</p>
              <p className="mt-1 text-xs text-muted-2">Intenta ajustar los filtros de búsqueda</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className={`${COMPONENT_STYLES.button.secondary} mt-3`}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => {
                const stats = getCategoryStats(category);
                const isExpanded = expandedCategories.has(category);
                const colors = getCategoryColor(category);
                const CategoryIcon = getCategoryIcon(category);
                const allSelected = stats.selected === stats.total;
                const someSelected = stats.selected > 0 && stats.selected < stats.total;
                
                return (
                  <div 
                    key={category} 
                    className="overflow-hidden rounded-xl border border-line bg-surface transition-colors duration-200"
                  >
                    {/* Header de categoría */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className="flex w-full items-center justify-between bg-surface-soft/50 px-4 py-3 transition-colors duration-200 hover:bg-surface-soft"
                      aria-expanded={isExpanded}
                      aria-controls={`category-${category}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg p-2 ${colors.iconBg}`}>
                          <CategoryIcon className={`h-4 w-4 ${colors.text}`} />
                        </div>
                        <div className="text-left">
                          <h3 className="text-[0.875rem] font-semibold text-ink">{category}</h3>
                          <p className="mt-0.5 text-xs text-muted-2">
                            {stats.selected} de {stats.total} permisos asignados
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* Checkbox de categoría */}
                        <div 
                          onClick={(e) => toggleAllInCategory(category, e)}
                          className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border transition-all duration-200 ${
                            allSelected 
                              ? 'border-brand bg-brand' 
                              : someSelected 
                                ? 'border-brand-100 bg-surface-soft' 
                                : 'border-line-strong bg-surface hover:border-brand-100'
                          } ${isReadOnly ? 'cursor-not-allowed opacity-60' : ''}`}
                          role="checkbox"
                          aria-checked={allSelected ? 'true' : someSelected ? 'mixed' : 'false'}
                          aria-label={`Seleccionar todos los permisos de ${category}`}
                        >
                          {allSelected && <Check className="h-3.5 w-3.5 text-white" weight="bold" />}
                          {someSelected && !allSelected && <div className="h-0.5 w-2 rounded bg-brand" />}
                        </div>

                        {/* Indicador expandido */}
                        <div className="rounded-lg p-1 text-muted">
                          {isExpanded ? (
                            <CaretDown className="h-4 w-4 text-ink" />
                          ) : (
                            <CaretRight className="h-4 w-4 text-muted" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Permisos de la categoría */}
                    {isExpanded && (
                      <div id={`category-${category}`} className="border-t border-line-soft p-3.5">
                        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                          {categoryPermissions.map((permission) => {
                            const isSelected = selectedPermissions.includes(permission.id);
                            const actionStyle = getActionStyle(permission.accion);
                            const ActionIcon = actionStyle.icon;
                            
                            return (
                              <label
                                key={permission.id}
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors duration-200 ${
                                  isSelected
                                    ? 'border-brand-100 bg-surface-soft'
                                    : 'border-line bg-surface hover:border-line-strong hover:bg-surface-soft'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (!isReadOnly) {
                                      onPermissionToggle(permission.id);
                                    }
                                  }}
                                  disabled={isReadOnly}
                                  className="sr-only"
                                  aria-describedby={`perm-desc-${permission.id}`}
                                />
                                
                                {/* Checkbox visual */}
                                <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-all duration-200 ${
                                  isSelected 
                                    ? 'border-brand bg-brand' 
                                    : 'border-line-strong bg-surface'
                                }`}>
                                  {isSelected && <Check className="h-3 w-3 text-white" weight="bold" />}
                                </div>
                                
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[0.8125rem] font-medium text-ink">
                                      {permission.nombre}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${actionStyle.bg} ${actionStyle.text}`}>
                                      <ActionIcon className="h-3 w-3" />
                                      {permission.accion}
                                    </span>
                                  </div>
                                  
                                  {permission.descripcion && (
                                    <p 
                                      id={`perm-desc-${permission.id}`}
                                      className="mt-1 text-xs text-muted-2"
                                    >
                                      {permission.descripcion}
                                    </p>
                                  )}
                                  
                                  <div className="mt-1.5">
                                    <code className={`rounded px-1.5 py-0.5 text-[11px] ${isSelected ? 'bg-surface text-brand' : 'bg-surface-soft text-muted-2'}`}>
                                      {permission.codigo}
                                    </code>
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(PermissionsModal);

   