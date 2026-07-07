import {
  SquaresFour,
  Buildings,
  Package,
  ArrowsLeftRight,
  CalendarBlank,
  FileXls,
  FileText,
  Bell,
  Users,
  Gear,
  BookOpen,
  IconProps
} from '@phosphor-icons/react';
import React from 'react';

// Configuración de secciones del menú con agrupación jerárquica
export interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType<IconProps>;
  path: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'Principal',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: SquaresFour, path: '/dashboard' },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { id: 'establecimientos', label: 'Establecimientos', icon: Buildings, path: '/establecimientos' },
      { id: 'inventario', label: 'Inventario', icon: Package, path: '/inventario' },
      { id: 'movimientos', label: 'Movimientos', icon: ArrowsLeftRight, path: '/movimientos' },
      { id: 'planificacion', label: 'Planificación', icon: CalendarBlank, path: '/planificacion' },
      { id: 'ici-demid', label: 'ICI DEMID', icon: FileXls, path: '/ici-demid' },
      { id: 'kardex', label: 'Kardex', icon: BookOpen, path: '/kardex' },
    ],
  },
  {
    title: 'Reportes',
    items: [
      { id: 'reportes', label: 'Reportes', icon: FileText, path: '/reportes' },
      { id: 'alertas', label: 'Alertas', icon: Bell, path: '/alertas' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { id: 'usuarios', label: 'Usuarios', icon: Users, path: '/usuarios' },
      { id: 'configuracion', label: 'Configuración', icon: Gear, path: '/configuracion' },
    ],
  },
];

// Estilos de Breadcrumbs
export const BREADCRUMBS_STYLES = {
  nav: 'flex items-center flex-wrap gap-1.5 text-base font-medium tracking-[-0.01em]',
  homeButton: 'flex items-center rounded-sm p-1.5 text-muted transition-colors duration-150 hover:bg-white hover:text-ink-soft focus:outline-none focus:ring-2 focus:ring-[#0e9f8e]/20',
  homeIcon: 'w-4 h-4',
  separator: 'w-3 h-3 text-[#c8cad8] flex-shrink-0',
  item: 'text-muted-3 hover:text-ink-soft cursor-pointer transition-colors duration-150',
  itemLast: 'text-ink-soft',
} as const;
