import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Search } from 'lucide-react';
import UserMenu from '../auth/UserMenu';
import Breadcrumbs from '../common/Breadcrumbs';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Sistema Integral de Gestión de Vacunas - DIRESA Apurímac II
              </p>
            </div>
          </div>
          <Breadcrumbs />
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;