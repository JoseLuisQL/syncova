import React, { useEffect, useMemo, useState, memo } from 'react';
import { CheckSquare, Eye, EyeOff, Loader2, Square, X } from 'lucide-react';
import { CentroAcopio, Role, Usuario } from '../../../types';
import { COMPONENT_STYLES } from '../constants';

interface UsuarioFormData {
  nombres: string;
  apellidos: string;
  email: string;
  usuario: string;
  password: string;
  rol: string;
  centroAcopioIds: string[];
  estado: string;
}

interface UsuarioModalProps {
  usuario: Usuario | null;
  centrosAcopio: CentroAcopio[];
  roles: Role[];
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: UsuarioFormData) => void;
}

const buildInitialFormData = (usuario: Usuario | null): UsuarioFormData => ({
  nombres: usuario?.nombres || '',
  apellidos: usuario?.apellidos || '',
  email: usuario?.email || '',
  usuario: usuario?.usuario || '',
  password: '',
  rol: usuario?.rol || 'operador',
  centroAcopioIds:
    usuario?.centrosAcopioAsignados?.map((item) => item.centroAcopioId) ||
    usuario?.centroAcopioIds ||
    (usuario?.centroAcopioId ? [usuario.centroAcopioId] : []),
  estado: usuario?.estado || 'activo',
});

const UsuarioModal: React.FC<UsuarioModalProps> = memo(({
  usuario,
  centrosAcopio,
  roles,
  isOpen,
  isLoading,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<UsuarioFormData>(buildInitialFormData(usuario));
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(buildInitialFormData(usuario));
    setErrors({});
  }, [usuario, isOpen]);

  const centrosActivos = useMemo(
    () => centrosAcopio.filter((centro) => centro.estado === 'activo'),
    [centrosAcopio],
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombres.trim()) newErrors.nombres = 'Nombres requeridos';
    if (!formData.apellidos.trim()) newErrors.apellidos = 'Apellidos requeridos';
    if (!formData.email.trim()) newErrors.email = 'Email requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.usuario.trim()) newErrors.usuario = 'Usuario requerido';
    if (!usuario && !formData.password) newErrors.password = 'Contraseña requerida';
    if (!usuario && formData.password && formData.password.length < 8) newErrors.password = 'Mínimo 8 caracteres';
    if (formData.rol === 'responsable_acopio' && formData.centroAcopioIds.length === 0) {
      newErrors.centroAcopioIds = 'Seleccione al menos un centro de acopio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof UsuarioFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleToggleCentro = (centroId: string) => {
    setFormData((prev) => {
      const exists = prev.centroAcopioIds.includes(centroId);
      const centroAcopioIds = exists
        ? prev.centroAcopioIds.filter((id) => id !== centroId)
        : [...prev.centroAcopioIds, centroId];

      return {
        ...prev,
        centroAcopioIds,
      };
    });

    if (errors.centroAcopioIds) {
      setErrors((prev) => ({ ...prev, centroAcopioIds: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className={COMPONENT_STYLES.modal.overlay} onClick={onClose}>
      <div
        className={COMPONENT_STYLES.modal.containerMedium}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={COMPONENT_STYLES.modal.header}>
          <div className="flex items-center justify-between">
            <h2 className={COMPONENT_STYLES.modal.headerTitle}>
              {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <button onClick={onClose} className="p-2 rounded-lg transition-colors hover:bg-gray-200">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={COMPONENT_STYLES.modal.body}>
          <div className="space-y-5">
            {usuario ? (
              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Último acceso</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {usuario.ultimoAcceso ? new Date(usuario.ultimoAcceso).toLocaleString('es-PE') : 'Sin registro'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Creado</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">{new Date(usuario.createdAt).toLocaleString('es-PE')}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Actualizado</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">{new Date(usuario.updatedAt).toLocaleString('es-PE')}</p>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={COMPONENT_STYLES.input.label}>Nombres *</label>
                <input
                  type="text"
                  value={formData.nombres}
                  onChange={(e) => handleChange('nombres', e.target.value)}
                  className={`${COMPONENT_STYLES.input.base} ${errors.nombres ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal}`}
                  placeholder="Ingrese nombres"
                />
                {errors.nombres ? <p className={COMPONENT_STYLES.input.errorText}>{errors.nombres}</p> : null}
              </div>

              <div>
                <label className={COMPONENT_STYLES.input.label}>Apellidos *</label>
                <input
                  type="text"
                  value={formData.apellidos}
                  onChange={(e) => handleChange('apellidos', e.target.value)}
                  className={`${COMPONENT_STYLES.input.base} ${errors.apellidos ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal}`}
                  placeholder="Ingrese apellidos"
                />
                {errors.apellidos ? <p className={COMPONENT_STYLES.input.errorText}>{errors.apellidos}</p> : null}
              </div>

              <div className="md:col-span-2">
                <label className={COMPONENT_STYLES.input.label}>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`${COMPONENT_STYLES.input.base} ${errors.email ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal}`}
                  placeholder="ejemplo@correo.com"
                />
                {errors.email ? <p className={COMPONENT_STYLES.input.errorText}>{errors.email}</p> : null}
              </div>

              <div>
                <label className={COMPONENT_STYLES.input.label}>Usuario *</label>
                <input
                  type="text"
                  value={formData.usuario}
                  onChange={(e) => handleChange('usuario', e.target.value)}
                  className={`${COMPONENT_STYLES.input.base} ${errors.usuario ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal}`}
                  placeholder="nombre.usuario"
                />
                {errors.usuario ? <p className={COMPONENT_STYLES.input.errorText}>{errors.usuario}</p> : null}
              </div>

              {!usuario ? (
                <div>
                  <label className={COMPONENT_STYLES.input.label}>Contraseña *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={`${COMPONENT_STYLES.input.base} ${errors.password ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal} pr-10`}
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password ? <p className={COMPONENT_STYLES.input.errorText}>{errors.password}</p> : null}
                </div>
              ) : null}

              <div>
                <label className={COMPONENT_STYLES.input.label}>Rol *</label>
                <select
                  value={formData.rol}
                  onChange={(e) => handleChange('rol', e.target.value)}
                  className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                >
                  {roles.filter((rol) => rol.estado === 'activo').map((rol) => (
                    <option key={rol.id} value={rol.codigo || rol.id}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {usuario ? (
                <div>
                  <label className={COMPONENT_STYLES.input.label}>Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => handleChange('estado', e.target.value)}
                    className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              ) : null}
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <label className={COMPONENT_STYLES.input.label}>
                  Centros de Acopio {formData.rol === 'responsable_acopio' && '*'}
                </label>
                <span className="text-xs text-slate-500">
                  {formData.centroAcopioIds.length} seleccionado(s)
                </span>
              </div>

              <div className="grid max-h-56 grid-cols-1 gap-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/70 p-3 md:grid-cols-2">
                {centrosActivos.map((centro) => {
                  const selected = formData.centroAcopioIds.includes(centro.id);
                  return (
                    <button
                      key={centro.id}
                      type="button"
                      onClick={() => handleToggleCentro(centro.id)}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
                        selected
                          ? 'border-teal-300 bg-teal-50 text-teal-800'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {selected ? <CheckSquare className="h-4 w-4 text-teal-600" /> : <Square className="h-4 w-4 text-slate-400" />}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{centro.nombre}</p>
                        <p className="text-xs text-slate-500">{centro.codigo || 'Sin código'}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.centroAcopioIds ? <p className={COMPONENT_STYLES.input.errorText}>{errors.centroAcopioIds}</p> : null}
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-800">
              <p className="font-semibold">Regla operativa</p>
              <p className="mt-1">
                Puedes asignar uno o varios centros de acopio. El primer centro seleccionado se usará como centro principal
                operativo para compatibilidad con el flujo actual del sistema.
              </p>
            </div>
          </div>
        </form>

        <div className={COMPONENT_STYLES.modal.footer}>
          <button type="button" onClick={onClose} className={COMPONENT_STYLES.button.secondary} disabled={isLoading}>
            Cancelar
          </button>
          <button onClick={handleSubmit} className={COMPONENT_STYLES.button.primary} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              usuario ? 'Actualizar' : 'Crear Usuario'
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

UsuarioModal.displayName = 'UsuarioModal';

export default UsuarioModal;
