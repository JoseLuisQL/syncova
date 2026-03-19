import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Key, 
  Shield, 
  Search, 
  Loader2, 
  ChevronDown, 
  ChevronRight,
  Check,
  CheckCheck,
  Eye,
  Edit3,
  Trash2,
  Download,
  Settings,
  Users,
  Package,
  FileText,
  Bell,
  Building2,
  BarChart3,
  Filter,
  RotateCcw
} from 'lucide-react';
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
  'Dashboard': BarChart3,
  'Establecimientos': Building2,
  'Inventario': Package,
  'Movimientos': Edit3,
  'Planificación': FileText,
  'Kardex': FileText,
  'Reportes': BarChart3,
  'Alertas': Bell,
  'Usuarios': Users,
  'Configuración': Settings,
};

// Colores por categoría
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  'Dashboard': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', iconBg: 'bg-violet-100' },
  'Establecimientos': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', iconBg: 'bg-teal-100' },
  'Inventario': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', iconBg: 'bg-cyan-100' },
  'Movimientos': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', iconBg: 'bg-blue-100' },
  'Planificación': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', iconBg: 'bg-indigo-100' },
  'Kardex': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', iconBg: 'bg-purple-100' },
  'Reportes': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', iconBg: 'bg-amber-100' },
  'Alertas': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', iconBg: 'bg-rose-100' },
  'Usuarios': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', iconBg: 'bg-emerald-100' },
  'Configuración': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', iconBg: 'bg-slate-100' },
};

// Colores por acción
const ACTION_STYLES: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  'read': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Eye },
  'write': { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: Edit3 },
  'update': { bg: 'bg-amber-100', text: 'text-amber-700', icon: Edit3 },
  'delete': { bg: 'bg-rose-100', text: 'text-rose-700', icon: Trash2 },
  'export': { bg: 'bg-purple-100', text: 'text-purple-700', icon: Download },
  'manage': { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Settings },
  'assign': { bg: 'bg-cyan-100', text: 'text-cyan-700', icon: Users },
  'aprobar': { bg: 'bg-teal-100', text: 'text-teal-700', icon: CheckCheck },
  'anular': { bg: 'bg-orange-100', text: 'text-orange-700', icon: X },
  'marcar': { bg: 'bg-sky-100', text: 'text-sky-700', icon: Check },
  'password': { bg: 'bg-violet-100', text: 'text-violet-700', icon: Key },
  'estado': { bg: 'bg-lime-100', text: 'text-lime-700', icon: Settings },
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

  // Expandir todas las categorías al abrir
  useEffect(() => {
    if (isOpen) {
      setExpandedCategories(new Set(categories));
      setSearchTerm('');
      setFilterCategory('todas');
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, categories]);

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
    return ACTION_STYLES[accion] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: Settings };
  };

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', iconBg: 'bg-gray-100' };
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
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 shadow-lg">
                <Key className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <h2 id="permissions-modal-title" className="text-xl font-bold text-gray-900">
                  Gestionar Permisos
                </h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  Rol: <span className="font-semibold text-teal-700">{role.nombre}</span>
                  {isReadOnly ? ' · consulta protegida' : ''}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              disabled={isLoading || isSaving}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isReadOnly && (
          <div className="mx-6 mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Este rol es parte de la configuración base del sistema. Sus permisos se muestran solo para auditoría.
          </div>
        )}

        {/* Filtros y estadísticas */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar permisos por nombre, código o recurso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:border-gray-300"
                aria-label="Buscar permisos"
              />
            </div>

            {/* Filtro por categoría */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:border-gray-300 min-w-[180px]"
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
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
          </div>

          {/* Estadísticas y acciones rápidas */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="text-gray-600">
                  <span className="font-semibold text-teal-700">{totalStats.selected}</span>
                  <span className="text-gray-400"> / </span>
                  <span>{totalStats.total}</span>
                  <span className="text-gray-500 ml-1">seleccionados</span>
                </span>
              </div>
              {hasActiveFilters && (
                <div className="flex items-center gap-2 text-gray-500">
                  <span>•</span>
                  <span>{totalStats.filtered} resultados</span>
                </div>
              )}
            </div>

            {!isReadOnly ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAll}
                  className="px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  Seleccionar visibles
                </button>
                <button
                  onClick={deselectAll}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Deseleccionar visibles
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Lista de permisos */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50/30">
          {Object.keys(groupedPermissions).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-2xl bg-gray-100 mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No se encontraron permisos</p>
              <p className="text-gray-400 text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors"
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
                    className={`rounded-2xl border ${colors.border} overflow-hidden bg-white shadow-sm transition-all duration-200 hover:shadow-md`}
                  >
                    {/* Header de categoría */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className={`w-full px-5 py-4 flex items-center justify-between ${colors.bg} transition-colors duration-200`}
                      aria-expanded={isExpanded}
                      aria-controls={`category-${category}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${colors.iconBg}`}>
                          <CategoryIcon className={`h-5 w-5 ${colors.text}`} />
                        </div>
                        <div className="text-left">
                          <h3 className={`font-semibold ${colors.text}`}>{category}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {stats.selected} de {stats.total} permisos asignados
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* Checkbox de categoría */}
                        <div 
                          onClick={(e) => toggleAllInCategory(category, e)}
                          className={`flex items-center justify-center w-6 h-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            allSelected 
                              ? 'bg-teal-600 border-teal-600' 
                              : someSelected 
                                ? 'bg-teal-100 border-teal-400' 
                                : 'bg-white border-gray-300 hover:border-teal-400'
                          } ${isReadOnly ? 'cursor-not-allowed opacity-60' : ''}`}
                          role="checkbox"
                          aria-checked={allSelected ? 'true' : someSelected ? 'mixed' : 'false'}
                          aria-label={`Seleccionar todos los permisos de ${category}`}
                        >
                          {allSelected && <Check className="h-4 w-4 text-white" />}
                          {someSelected && !allSelected && <div className="w-2 h-0.5 bg-teal-600 rounded" />}
                        </div>

                        {/* Indicador expandido */}
                        <div className={`p-1 rounded-lg ${isExpanded ? colors.iconBg : 'bg-transparent'}`}>
                          {isExpanded ? (
                            <ChevronDown className={`h-5 w-5 ${colors.text}`} />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Permisos de la categoría */}
                    {isExpanded && (
                      <div id={`category-${category}`} className="p-4 border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {categoryPermissions.map((permission) => {
                            const isSelected = selectedPermissions.includes(permission.id);
                            const actionStyle = getActionStyle(permission.accion);
                            const ActionIcon = actionStyle.icon;
                            
                            return (
                              <label
                                key={permission.id}
                                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                                  isSelected
                                    ? 'bg-teal-50/70 border-teal-200 ring-1 ring-teal-200'
                                    : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
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
                                    ? 'bg-teal-600 border-teal-600' 
                                    : 'bg-white border-gray-300'
                                }`}>
                                  {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`font-medium text-sm ${isSelected ? 'text-teal-900' : 'text-gray-900'}`}>
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
                                      className={`text-xs mt-1 ${isSelected ? 'text-teal-700' : 'text-gray-500'}`}
                                    >
                                      {permission.descripcion}
                                    </p>
                                  )}
                                  
                                  <div className="mt-1.5">
                                    <code className={`text-xs px-1.5 py-0.5 rounded ${isSelected ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>
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
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Resumen */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-teal-600" />
              <span>
                {totalStats.selected} permisos serán asignados al rol <strong className="text-gray-900">{role.nombre}</strong>
              </span>
            </div>

            {/* Botones */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={isLoading || isSaving}
                className={COMPONENT_STYLES.button.secondary}
              >
                Cancelar
              </button>
              {!isReadOnly ? (
                <button
                  onClick={handleSave}
                  disabled={isLoading || isSaving}
                  className={COMPONENT_STYLES.button.primary}
                >
                  {(isLoading || isSaving) && <Loader2 className="h-4 w-4 animate-spin" />}
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
