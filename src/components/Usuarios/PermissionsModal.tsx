import React, { useState, useEffect } from 'react';
import { X, Key, Shield, Check, Search, Loader2, AlertTriangle } from 'lucide-react';
import { Role, Permission } from '../../types';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  role: Role | null;
  permissions: Permission[];
  selectedPermissions: string[];
  onPermissionToggle: (permissionId: string) => void;
  isLoading?: boolean;
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  role,
  permissions,
  selectedPermissions,
  onPermissionToggle,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('todas');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Obtener categorías únicas
  const categories = Array.from(new Set(permissions.map(p => p.categoria))).sort();

  // Filtrar permisos
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = searchTerm === '' || 
      permission.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.recurso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.accion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'todas' || permission.categoria === filterCategory;
    
    return matchesSearch && matchesCategory && permission.estado === 'activo';
  });

  // Agrupar permisos por categoría
  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.categoria]) {
      acc[permission.categoria] = [];
    }
    acc[permission.categoria].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Expandir todas las categorías por defecto
  useEffect(() => {
    if (isOpen) {
      setExpandedCategories(new Set(categories));
    }
  }, [isOpen, categories]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleAllInCategory = (category: string) => {
    const categoryPermissions = groupedPermissions[category] || [];
    const allSelected = categoryPermissions.every(p => selectedPermissions.includes(p.id));
    
    categoryPermissions.forEach(permission => {
      if (allSelected && selectedPermissions.includes(permission.id)) {
        onPermissionToggle(permission.id);
      } else if (!allSelected && !selectedPermissions.includes(permission.id)) {
        onPermissionToggle(permission.id);
      }
    });
  };

  const getCategoryStats = (category: string) => {
    const categoryPermissions = groupedPermissions[category] || [];
    const selectedCount = categoryPermissions.filter(p => selectedPermissions.includes(p.id)).length;
    return { total: categoryPermissions.length, selected: selectedCount };
  };

  const getActionColor = (accion: string) => {
    const colors: Record<string, string> = {
      'read': 'bg-blue-100 text-blue-800',
      'write': 'bg-green-100 text-green-800',
      'delete': 'bg-red-100 text-red-800',
      'export': 'bg-purple-100 text-purple-800',
      'manage': 'bg-orange-100 text-orange-800'
    };
    return colors[accion] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <Key className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Gestionar Permisos
              </h3>
              <p className="text-sm text-gray-500">
                Asignar permisos al rol: <span className="font-medium">{role.nombre}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar permisos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
              />
            </div>

            {/* Filtro por categoría */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="todas">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Estadísticas */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              {selectedPermissions.length} de {permissions.filter(p => p.estado === 'activo').length} permisos seleccionados
            </span>
            <span>
              {Object.keys(groupedPermissions).length} categorías mostradas
            </span>
          </div>
        </div>

        {/* Lista de permisos */}
        <div className="flex-1 overflow-y-auto p-6">
          {Object.keys(groupedPermissions).length === 0 ? (
            <div className="text-center py-12">
              <Key className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No se encontraron permisos</p>
              <p className="text-gray-400 text-sm">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => {
                const stats = getCategoryStats(category);
                const isExpanded = expandedCategories.has(category);
                
                return (
                  <div key={category} className="border border-gray-200 rounded-lg">
                    {/* Header de categoría */}
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => toggleCategory(category)}
                          className="flex items-center space-x-2 text-left flex-1"
                        >
                          <Shield className="h-5 w-5 text-gray-600" />
                          <span className="font-medium text-gray-900 capitalize">
                            {category}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({stats.selected}/{stats.total})
                          </span>
                        </button>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleAllInCategory(category)}
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            {stats.selected === stats.total ? 'Deseleccionar todo' : 'Seleccionar todo'}
                          </button>
                          
                          <button
                            onClick={() => toggleCategory(category)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {isExpanded ? '−' : '+'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Permisos de la categoría */}
                    {isExpanded && (
                      <div className="p-4">
                        <div className="grid grid-cols-1 gap-3">
                          {categoryPermissions.map((permission) => (
                            <div
                              key={permission.id}
                              className={`flex items-center p-3 rounded-lg border transition-colors ${
                                selectedPermissions.includes(permission.id)
                                  ? 'bg-indigo-50 border-indigo-200'
                                  : 'bg-white border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedPermissions.includes(permission.id)}
                                  onChange={() => onPermissionToggle(permission.id)}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                
                                <div className="ml-3 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-900">
                                      {permission.nombre}
                                    </span>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(permission.accion)}`}>
                                      {permission.accion}
                                    </span>
                                  </div>
                                  
                                  {permission.descripcion && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      {permission.descripcion}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                    <span>Recurso: {permission.recurso}</span>
                                    <span>Código: {permission.codigo}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
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
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>Guardar Permisos</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionsModal;
