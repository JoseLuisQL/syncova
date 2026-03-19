import React, { memo } from 'react';
import { Search, Users, CheckCircle, Shield, UserMinus, Building2 } from 'lucide-react';
import { CentroAcopio, Role } from '../../../types';
import { COMPONENT_STYLES } from '../constants';

interface UsuariosFiltrosProps {
  searchTerm: string;
  filterRol: string;
  filterEstado: string;
  filterCentroAcopio: string;
  roles: Role[];
  centrosAcopio: CentroAcopio[];
  totalUsuarios: number;
  usuariosActivos: number;
  usuariosInactivos: number;
  onSearchChange: (value: string) => void;
  onRolChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
  onCentroAcopioChange: (value: string) => void;
}

const UsuariosFiltros: React.FC<UsuariosFiltrosProps> = memo(({
  searchTerm,
  filterRol,
  filterEstado,
  filterCentroAcopio,
  roles,
  centrosAcopio,
  totalUsuarios,
  usuariosActivos,
  usuariosInactivos,
  onSearchChange,
  onRolChange,
  onEstadoChange,
  onCentroAcopioChange,
}) => {
  const stats = [
    { key: 'total', value: totalUsuarios, label: 'Total', icon: Users, gradient: 'from-teal-500 to-teal-600' },
    { key: 'activos', value: usuariosActivos, label: 'Activos', icon: CheckCircle, gradient: 'from-emerald-500 to-emerald-600' },
    { key: 'inactivos', value: usuariosInactivos, label: 'Inactivos', icon: UserMinus, gradient: 'from-slate-500 to-slate-600' },
    { key: 'roles', value: roles.length, label: 'Roles', icon: Shield, gradient: 'from-cyan-500 to-cyan-600' },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Cards Compactos */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.key}
              className={`${COMPONENT_STYLES.stats.cardGradient} bg-gradient-to-r ${stat.gradient}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={COMPONENT_STYLES.stats.label}>{stat.label}</p>
                  <p className={COMPONENT_STYLES.stats.value}>{stat.value}</p>
                </div>
                <Icon className="h-8 w-8 opacity-80" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtros */}
      <div className={COMPONENT_STYLES.filter.container}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className={COMPONENT_STYLES.filter.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o usuario..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className={COMPONENT_STYLES.filter.searchInput}
            />
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select
              value={filterRol}
              onChange={(e) => onRolChange(e.target.value)}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
            >
              <option value="todos">Todos los roles</option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.codigo}>{rol.nombre}</option>
              ))}
            </select>

            <select
              value={filterEstado}
              onChange={(e) => onEstadoChange(e.target.value)}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>

            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={filterCentroAcopio}
                onChange={(e) => onCentroAcopioChange(e.target.value)}
                className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal} pl-10`}
              >
                <option value="todos">Todos los centros</option>
                {centrosAcopio.filter((centro) => centro.estado === 'activo').map((centro) => (
                  <option key={centro.id} value={centro.id}>{centro.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

UsuariosFiltros.displayName = 'UsuariosFiltros';

export default UsuariosFiltros;
