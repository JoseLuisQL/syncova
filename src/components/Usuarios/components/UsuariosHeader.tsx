import React, { memo } from 'react';
import { Users, UserPlus, RefreshCw, Download, Loader2 } from 'lucide-react';
import { COMPONENT_STYLES, USER_SECTIONS, SectionId } from '../constants';

interface UsuariosHeaderProps {
  activeSection: SectionId;
  onSectionChange: (section: SectionId) => void;
  onNuevoUsuario: () => void;
  onRefresh: () => void;
  onExportar: () => void;
  isLoading: boolean;
  isCreating: boolean;
}

const UsuariosHeader: React.FC<UsuariosHeaderProps> = memo(({
  activeSection,
  onSectionChange,
  onNuevoUsuario,
  onRefresh,
  onExportar,
  isLoading,
  isCreating,
}) => {
  return (
    <>
      {/* Header Principal */}
      <header className={COMPONENT_STYLES.header.container}>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={COMPONENT_STYLES.header.iconWrapper}>
                <Users className="h-7 w-7 text-white" aria-hidden="true" />
              </div>
              <div>
                <h1 className={COMPONENT_STYLES.header.title}>
                  Gestión de Usuarios
                </h1>
                <p className={COMPONENT_STYLES.header.subtitle}>
                  Administración de usuarios, roles y permisos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className={COMPONENT_STYLES.button.secondary}
                title="Actualizar datos"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Actualizar</span>
              </button>

              <button
                onClick={onExportar}
                className={COMPONENT_STYLES.button.secondary}
                title="Exportar usuarios"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar</span>
              </button>

              <button
                onClick={onNuevoUsuario}
                disabled={isCreating}
                className={COMPONENT_STYLES.button.primary}
              >
                {isCreating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <UserPlus className="h-5 w-5" />
                )}
                <span>Nuevo Usuario</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={COMPONENT_STYLES.nav.container} aria-label="Secciones">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {USER_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={`${COMPONENT_STYLES.nav.tab} ${
                    isActive ? COMPONENT_STYLES.nav.tabActive : COMPONENT_STYLES.nav.tabInactive
                  } flex-shrink-0`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="whitespace-nowrap">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
});

UsuariosHeader.displayName = 'UsuariosHeader';

export default UsuariosHeader;
