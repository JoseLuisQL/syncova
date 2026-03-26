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
  nav: 'flex items-center flex-wrap gap-1.5 text-sm sm:text-base',
  homeButton: 'flex items-center p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-500/50',
  homeIcon: 'w-4 h-4 sm:w-4.5 sm:h-4.5',
  separator: 'w-4 h-4 text-zinc-300 flex-shrink-0',
  item: 'text-zinc-500 hover:text-zinc-900 cursor-pointer transition-colors duration-200',
  itemLast: 'text-zinc-900 font-semibold drop-shadow-sm',
} as const;
