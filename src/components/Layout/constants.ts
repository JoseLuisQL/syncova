import {
  LayoutDashboard,
  Building2,
  Package,
  ArrowRightLeft,
  Calendar,
  FileText,
  Bell,
  Users,
  Settings,
  BookOpen,
  LucideIcon,
} from 'lucide-react';

// Configuración de secciones del menú con agrupación jerárquica
export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
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
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { id: 'establecimientos', label: 'Establecimientos', icon: Building2, path: '/establecimientos' },
      { id: 'inventario', label: 'Inventario', icon: Package, path: '/inventario' },
      { id: 'movimientos', label: 'Movimientos', icon: ArrowRightLeft, path: '/movimientos' },
      { id: 'planificacion', label: 'Planificación', icon: Calendar, path: '/planificacion' },
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
      { id: 'configuracion', label: 'Configuración', icon: Settings, path: '/configuracion' },
    ],
  },
];

// Estilos de Breadcrumbs
export const BREADCRUMBS_STYLES = {
  nav: 'flex items-center flex-wrap gap-1.5 text-sm sm:text-base',
  homeButton: 'flex items-center p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50',
  homeIcon: 'w-4 h-4 sm:w-4.5 sm:h-4.5',
  separator: 'w-4 h-4 text-slate-300 flex-shrink-0',
  item: 'text-slate-500 hover:text-teal-600 cursor-pointer transition-colors duration-200',
  itemLast: 'text-slate-800 font-semibold drop-shadow-sm',
} as const;
