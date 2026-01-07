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
  nav: 'flex items-center gap-1.5 text-sm',
  homeButton: 'flex items-center gap-1 text-gray-400 hover:text-teal-600 transition-colors duration-200',
  homeIcon: 'w-3.5 h-3.5',
  separator: 'w-3.5 h-3.5 text-gray-300',
  item: 'text-gray-400 hover:text-teal-600 cursor-pointer transition-colors duration-200',
  itemLast: 'text-gray-600 font-medium',
} as const;
