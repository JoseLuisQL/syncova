import React, { memo } from 'react';
import { Users, UserPlus, ArrowsClockwise, DownloadSimple, CircleNotch, Icon } from '@phosphor-icons/react';
import { COMPONENT_STYLES, USER_SECTIONS, SectionId } from '../constants';

interface SectionItem {
  id: SectionId;
  label: string;
  icon: Icon;
}

interface UsuariosHeaderProps {
  activeSection: SectionId;
  onSectionChange: (section: SectionId) => void;
  onNuevoUsuario: () => void;
  onRefresh: () => void;
  onExportar: () => void;
  isLoading: boolean;
  isCreating: boolean;
  sections?: SectionItem[];
  canCreateUser?: boolean;
  canExportUsers?: boolean;
}

const UsuariosHeader: React.FC<UsuariosHeaderProps> = memo(({
  activeSection,
  onSectionChange,
  onNuevoUsuario,
  onRefresh,
  onExportar,
  isLoading,
  isCreating,
  sections,
  canCreateUser = true,
  canExportUsers = true,
}) => {
  const displaySections = sections || USER_SECTIONS;
  
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
              <button type="button"
                onClick={onRefresh}
                disabled={isLoading}
                className={COMPONENT_STYLES.button.secondary}
                title="Actualizar datos"
              >
                {isLoading ? (
                  <CircleNotch className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowsClockwise className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Actualizar</span>
              </button>

              {canExportUsers && (
                <button type="button"
                  onClick={onExportar}
                  className={COMPONENT_STYLES.button.secondary}
                  title="Exportar usuarios"
                >
                  <DownloadSimple className="h-4 w-4" />
                  <span className="hidden sm:inline">Exportar</span>
                </button>
              )}

              {canCreateUser && (
                <button type="button"
                  onClick={onNuevoUsuario}
                  disabled={isCreating}
                  className={COMPONENT_STYLES.button.primary}
                >
                  {isCreating ? (
                    <CircleNotch className="h-5 w-5 animate-spin" />
                  ) : (
                    <UserPlus className="h-5 w-5" />
                  )}
                  <span>Nuevo Usuario</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={COMPONENT_STYLES.nav.container} aria-label="Secciones">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {displaySections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button type="button"
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
   