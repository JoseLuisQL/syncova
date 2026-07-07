import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Key, Shield, MagnifyingGlass, CircleNotch, CaretDown, CaretRight, Check, Checks, Eye, PencilSimple, Trash, DownloadSimple, Gear, Users, Package, FileText, Bell, Buildings, ChartBar, Funnel, ArrowCounterClockwise } from '@phosphor-icons/react';
import { Role, Permission } from '../../types';
import { COMPONENT_STYLES } from './constants';

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
  'Reportes': ChartBar,
  'Alertas': Bell,
  'Usuarios': Users,
  'Configuración': Gear,
};

// Colores por categoría
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  'Dashboard': { bg: 'bg-zinc-50', text: 'text-zinc-700', border: 'border-zinc-200', iconBg: 'bg-zinc-100' },
  'Establecimientos': { bg: 'bg-zinc-50', text: 'text-zinc-700', border: 'border-zinc-200', iconBg: 'bg-zinc-100' },
  'Inventario': { bg: 'bg-zinc-50', text: 'text-zinc-700', border: 'border-zinc-200', iconBg: 'bg-zinc-100' },
  'Movimientos': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', iconBg: 'bg-blue-100' },
  'Planificación': { bg: 'bg-zinc-50', text: 'text-zinc-700', border: 'border-zinc-200', iconBg: 'bg-zinc-100' },
  'Kardex': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', iconBg: 'bg-purple-100' },
  'Reportes': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', iconBg: 'bg-amber-100' },
  'Alertas': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', iconBg: 'bg-rose-100' },
  'Usuarios': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', iconBg: 'bg-emerald-100' },
  'Configuración': { bg: 'bg-zinc-50', text: 'text-zinc-700', border: 'border-zinc-200', iconBg: 'bg-zinc-100' },
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
  const modalRef = useRef<HTMLDivElement>(null);

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

  const modalContent = (
    <div 
      className={COMPONENT_STYLES.modal.overlay}
      onClick={(e) => e.target === e.currentTarget && !isLoading && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="permissions-modal-title"
    >
      <div 
        ref={modalRef}
        className={`${COMPONENT_STYLES.modal.containerShell} flex max-h-[88vh] max-w-5xl flex-col`}
      >
        {/* Header */}
        <div className="border-b border-line-soft bg-white px-5 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-line bg-surface-soft text-muted-2">
                <Key className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h2 id="permissions-modal-title" className="text-md font-semibold leading-5 text-ink">
                  Gestionar Permisos
                </h2>
                <p className="mt-1 text-sm leading-4 text-muted-2">
                  Rol: <span className="font-semibold text-zinc-700">{role.nombre}</span>
                  {isReadOnly ? ' · consulta protegida' : ''}
                </p>
              </div>
            </div>
            
            <button type="button"
              onClick={onClose}
              disabled={isLoading || isSaving}
              className={COMPONENT_STYLES.button.ghost}
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isReadOnly && (
          <div className="mx-5 mt-4 rounded-md border border-amber-200 bg-amber-50/80 px-3 py-2.5 text-base text-amber-800">
            Este rol es parte de la configuración base del sistema. Sus permisos se muestran solo para auditoría.
          </div>
        )}

        {/* Filtros y estadísticas */}
        <div className="border-b border-line-soft bg-white px-5 py-3.5">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" aria-hidden="true" />
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
              <Funnel className="h-4 w-4 text-zinc-400" aria-hidden="true" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-9 w-full rounded-[7px] border border-line bg-white px-3 pr-8 text-base font-medium text-ink outline-none transition hover:border-line-strong focus:border-line-focus-strong focus:ring-2 focus:ring-line-focus/70 sm:w-auto sm:min-w-[180px]"
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
              <button type="button"
                onClick={clearFilters}
                className={COMPONENT_STYLES.button.ghost}
              >
                <ArrowCounterClockwise className="h-4 w-4" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
          </div>

          {/* Estadísticas y acciones rápidas */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-zinc-500" />
                <span className="text-zinc-600">
                  <span className="font-semibold text-zinc-700">{totalStats.selected}</span>
                  <span className="text-zinc-400"> / </span>
                  <span>{totalStats.total}</span>
                  <span className="text-zinc-500 ml-1">seleccionados</span>
                </span>
              </div>
              {hasActiveFilters && (
                <div className="flex items-center gap-2 text-zinc-500">
                  <span>•</span>
                  <span>{totalStats.filtered} resultados</span>
                </div>
              )}
            </div>

            {!isReadOnly ? (
              <div className="flex items-center gap-2">
                <button type="button"
                  onClick={selectAll}
                  className="rounded-md border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface-soft"
                >
                  Seleccionar visibles
                </button>
                <button type="button"
                  onClick={deselectAll}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Deseleccionar visibles
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Lista de permisos */}
        <div className="flex-1 overflow-y-auto bg-white px-5 py-4">
          {Object.keys(groupedPermissions).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-2xl bg-zinc-100 mb-4">
                <MagnifyingGlass className="h-8 w-8 text-zinc-400" />
              </div>
              <p className="text-zinc-600 font-medium">No se encontraron permisos</p>
              <p className="text-zinc-400 text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
              {hasActiveFilters && (
                <button type="button"
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
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
                    className="overflow-hidden rounded-[9px] border border-line bg-white shadow-none transition-colors duration-200 hover:bg-surface-soft"
                  >
                    {/* Header de categoría */}
                    <button type="button"
                      onClick={() => toggleCategory(category)}
                      className={`flex w-full items-center justify-between px-4 py-3 ${colors.bg} transition-colors duration-200`}
                      aria-expanded={isExpanded}
                      aria-controls={`category-${category}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`rounded-[7px] p-2 ${colors.iconBg}`}>
                          <CategoryIcon className={`h-4 w-4 ${colors.text}`} />
                        </div>
                        <div className="text-left">
                          <h3 className={`font-semibold ${colors.text}`}>{category}</h3>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {stats.selected} de {stats.total} permisos asignados
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* Checkbox de categoría */}
                        <div 
                          onClick={(e) => toggleAllInCategory(category, e)}
                          className={`flex items-center justify-center w-6 h-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            allSelected 
                              ? 'bg-brand border-brand' 
                              : someSelected 
                                ? 'bg-[#f3f0ff] border-brand-100' 
                                : 'bg-white border-zinc-300 hover:border-brand-100'
                          } ${isReadOnly ? 'cursor-not-allowed opacity-60' : ''}`}
                          role="checkbox"
                          aria-checked={allSelected ? 'true' : someSelected ? 'mixed' : 'false'}
                          aria-label={`Seleccionar todos los permisos de ${category}`}
                        >
                          {allSelected && <Check className="h-4 w-4 text-white" />}
                          {someSelected && !allSelected && <div className="w-2 h-0.5 bg-brand rounded" />}
                        </div>

                        {/* Indicador expandido */}
                        <div className={`p-1 rounded-lg ${isExpanded ? colors.iconBg : 'bg-transparent'}`}>
                          {isExpanded ? (
                            <CaretDown className={`h-5 w-5 ${colors.text}`} />
                          ) : (
                            <CaretRight className="h-5 w-5 text-zinc-400" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Permisos de la categoría */}
                    {isExpanded && (
                        <div id={`category-${category}`} className="border-t border-line-soft p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {categoryPermissions.map((permission) => {
                            const isSelected = selectedPermissions.includes(permission.id);
                            const actionStyle = getActionStyle(permission.accion);
                            const ActionIcon = actionStyle.icon;
                            
                            return (
                              <label
                                key={permission.id}
                                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors duration-200 ${
                                  isSelected
                                    ? 'border-brand-100 bg-surface-soft'
                                    : 'border-line bg-white hover:border-line-strong hover:bg-surface-soft'
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
                                <div className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                                  isSelected 
                                    ? 'bg-brand border-brand' 
                                    : 'bg-white border-zinc-300'
                                }`}>
                                  {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`font-medium text-sm ${isSelected ? 'text-zinc-900' : 'text-zinc-900'}`}>
                                      {permission.nombre}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md ${actionStyle.bg} ${actionStyle.text}`}>
                                      <ActionIcon className="h-3 w-3" />
                                      {permission.accion}
                                    </span>
                                  </div>
                                  
                                  {permission.descripcion && (
                                    <p 
                                      id={`perm-desc-${permission.id}`}
                                      className={`text-xs mt-1 ${isSelected ? 'text-zinc-700' : 'text-zinc-500'}`}
                                    >
                                      {permission.descripcion}
                                    </p>
                                  )}
                                  
                                  <div className="mt-1.5">
                                    <code className={`text-xs px-1.5 py-0.5 rounded ${isSelected ? 'bg-[#f3f0ff] text-brand' : 'bg-zinc-100 text-zinc-500'}`}>
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

        {/* Footer */}
        <div className="border-t border-line-soft bg-surface-soft px-5 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Resumen */}
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Shield className="h-4 w-4 text-zinc-600" />
              <span>
                {totalStats.selected} permisos serán asignados al rol <strong className="text-zinc-900">{role.nombre}</strong>
              </span>
            </div>

            {/* Botones */}
            <div className="flex items-center gap-2">
              <button type="button"
                onClick={onClose}
                disabled={isLoading || isSaving}
                className={COMPONENT_STYLES.button.secondary}
              >
                Cancelar
              </button>
              {!isReadOnly ? (
                <button type="button"
                  onClick={handleSave}
                  disabled={isLoading || isSaving}
                  className={COMPONENT_STYLES.button.primary}
                >
                  {(isLoading || isSaving) && <CircleNotch className="h-4 w-4 animate-spin" />}
                  <Check className="h-4 w-4" />
                  <span>Guardar Permisos</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default React.memo(PermissionsModal);
   