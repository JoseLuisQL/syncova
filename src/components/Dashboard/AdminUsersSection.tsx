import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { ShieldCheck, Crown, Envelope, Clock, ArrowRight, User } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { SectionSkeleton, EmptyState } from './LoadingStates';
import UsuarioService from '../../services/usuarioService';
import type { Usuario } from '../../types';

const formatRelativeAccess = (fecha?: Date): string => {
  if (!fecha) return 'Sin acceso';
  const now = new Date();
  const date = new Date(fecha);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'En línea';
  if (diffMinutes < 60) return `Hace ${diffMinutes}m`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Hace ${diffDays}d`;

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
  }).format(date);
};

const AdminUserCard: React.FC<{ admin: Usuario }> = memo(({ admin }) => {
  const initials = `${admin.nombres[0] || ''}${admin.apellidos[0] || ''}`.toUpperCase();
  const isActive = admin.estado === 'activo';
  const accessLabel = formatRelativeAccess(admin.ultimoAcceso);
  const isOnlineRecently = admin.ultimoAcceso && (
    new Date().getTime() - new Date(admin.ultimoAcceso).getTime() < 15 * 60 * 1000
  );

  return (
    <div
      className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-zinc-200 hover:bg-zinc-50/80 hover:shadow-sm transition-all duration-200"
      role="listitem"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className={`
            flex items-center justify-center w-9 h-9 rounded-full text-base font-bold
            ${isActive 
              ? 'bg-teal-600 text-white' 
              : 'bg-zinc-200 text-zinc-500'
            }
          `}>
            {initials}
          </div>
          {/* Online indicator */}
          {isOnlineRecently && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
          )}
        </div>

        {/* Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-md font-bold text-zinc-900 truncate tracking-tight">
              {admin.apellidos}, {admin.nombres}
            </h4>
            {!isActive && (
              <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-widest bg-zinc-100 text-zinc-400 border border-zinc-200">
                Inactivo
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-widest">
              <Envelope className="h-3 w-3" weight="bold" aria-hidden="true" />
              <span className="truncate max-w-[140px]">{admin.email}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right side: access time & status */}
      <div className="flex items-center gap-3 flex-shrink-0 pl-4">
        <span className={`
          flex items-center gap-1.5 text-xs font-bold tracking-wider
          ${isOnlineRecently
            ? 'text-emerald-600'
            : 'text-zinc-400'
          }
        `}>
          <Clock className="h-3 w-3" weight="bold" aria-hidden="true" />
          {accessLabel}
        </span>
      </div>
    </div>
  );
});

AdminUserCard.displayName = 'AdminUserCard';

const AdminUsersSection: React.FC = memo(() => {
  const [admins, setAdmins] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const mountedRef = useRef(true);

  const loadAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await UsuarioService.getAll({
        rol: 'administrador',
        limit: 50,
        page: 1,
      });
      if (mountedRef.current) {
        setAdmins(result.usuarios);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Error al cargar administradores');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void loadAdmins();
    return () => { mountedRef.current = false; };
  }, [loadAdmins]);

  const handleRefresh = () => {
    void loadAdmins();
  };

  const activeCount = admins.filter(a => a.estado === 'activo').length;

  return (
    <section
      className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
      aria-label="Administradores del sistema"
    >
      <header className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <h3 className="text-md font-bold text-zinc-900 flex items-center gap-2.5 tracking-tight">
          <div className="p-1.5 rounded-lg bg-teal-600 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-white" weight="bold" aria-hidden="true" />
          </div>
          Administradores
          {admins.length > 0 && (
            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-teal-600 text-white shadow-sm ml-0.5">
              {admins.length}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <button type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="text-sm font-bold text-zinc-400 hover:text-zinc-900 disabled:opacity-50 
              disabled:cursor-not-allowed transition-colors"
            aria-label={loading ? 'Actualizando administradores' : 'Actualizar administradores'}
          >
            {loading ? 'Cargando...' : 'Recargar'}
          </button>
        </div>
      </header>

      <div className="p-3">
        {loading && admins.length === 0 ? (
          <SectionSkeleton rows={3} />
        ) : error ? (
          <div className="text-center py-8">
            <ShieldCheck className="mx-auto h-8 w-8 text-zinc-300 mb-2" weight="duotone" aria-hidden="true" />
            <p className="text-sm font-bold text-zinc-700 mb-1">Fallo de conexión</p>
            <p className="text-xs font-medium text-zinc-400 mb-4">{error}</p>
            <button type="button"
              onClick={handleRefresh}
              className="text-xs font-bold text-zinc-900 hover:underline"
            >
              Reintentar
            </button>
          </div>
        ) : admins.length === 0 ? (
          <EmptyState
            icon={<Crown className="h-full w-full" weight="duotone" />}
            title="Sin administradores"
            description="No se encontraron usuarios con rol de administrador."
          />
        ) : (
          <>
            {/* Stats mini bar */}
            <div className="flex items-center gap-4 px-4 py-2.5 mb-1 rounded-lg bg-zinc-50/80">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  {activeCount} Activos
                </span>
              </div>
              {admins.length - activeCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-300" />
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    {admins.length - activeCount} Inactivos
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-0.5" role="list" aria-label="Lista de administradores">
              {admins.map((admin) => (
                <AdminUserCard key={admin.id} admin={admin} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer: quick link to full users module */}
      <div className="border-t border-zinc-100 px-5 py-3 bg-zinc-50/30">
        <button type="button"
          onClick={() => navigate('/usuarios')}
          className="flex items-center justify-between w-full group"
        >
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-900 transition-colors" weight="bold" />
            <span className="text-sm font-bold text-zinc-400 group-hover:text-zinc-900 transition-colors uppercase tracking-widest">
              Gestión de Usuarios
            </span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" weight="bold" />
        </button>
      </div>
    </section>
  );
});

AdminUsersSection.displayName = 'AdminUsersSection';

export default AdminUsersSection;
