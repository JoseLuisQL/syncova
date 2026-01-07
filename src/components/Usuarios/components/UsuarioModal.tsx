import React, { useState, useEffect, memo } from 'react';
import { X, Loader2, Eye, EyeOff } from 'lucide-react';
import { Usuario, CentroAcopio, Role } from '../../../types';
import { COMPONENT_STYLES } from '../constants';

interface UsuarioModalProps {
  usuario: Usuario | null;
  centrosAcopio: CentroAcopio[];
  roles: Role[];
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const UsuarioModal: React.FC<UsuarioModalProps> = memo(({
  usuario,
  centrosAcopio,
  roles,
  isOpen,
  isLoading,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    usuario: '',
    password: '',
    rol: 'operador',
    centroAcopioId: '',
    estado: 'activo',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombres: usuario.nombres || '',
        apellidos: usuario.apellidos || '',
        email: usuario.email || '',
        usuario: usuario.usuario || '',
        password: '',
        rol: usuario.rol || 'operador',
        centroAcopioId: usuario.centroAcopioId || '',
        estado: usuario.estado || 'activo',
      });
    } else {
      setFormData({
        nombres: '',
        apellidos: '',
        email: '',
        usuario: '',
        password: '',
        rol: 'operador',
        centroAcopioId: '',
        estado: 'activo',
      });
    }
    setErrors({});
  }, [usuario, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombres.trim()) newErrors.nombres = 'Nombres requeridos';
    if (!formData.apellidos.trim()) newErrors.apellidos = 'Apellidos requeridos';
    if (!formData.email.trim()) newErrors.email = 'Email requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.usuario.trim()) newErrors.usuario = 'Usuario requerido';
    if (!usuario && !formData.password) newErrors.password = 'Contraseña requerida';
    if (!usuario && formData.password && formData.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className={COMPONENT_STYLES.modal.overlay} onClick={onClose}>
      <div
        className={COMPONENT_STYLES.modal.containerMedium}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={COMPONENT_STYLES.modal.header}>
          <div className="flex items-center justify-between">
            <h2 className={COMPONENT_STYLES.modal.headerTitle}>
              {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className={COMPONENT_STYLES.modal.body}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombres */}
            <div>
              <label className={COMPONENT_STYLES.input.label}>Nombres *</label>
              <input
                type="text"
                value={formData.nombres}
                onChange={(e) => handleChange('nombres', e.target.value)}
                className={`${COMPONENT_STYLES.input.base} ${
                  errors.nombres ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal
                }`}
                placeholder="Ingrese nombres"
              />
              {errors.nombres && (
                <p className={COMPONENT_STYLES.input.errorText}>{errors.nombres}</p>
              )}
            </div>

            {/* Apellidos */}
            <div>
              <label className={COMPONENT_STYLES.input.label}>Apellidos *</label>
              <input
                type="text"
                value={formData.apellidos}
                onChange={(e) => handleChange('apellidos', e.target.value)}
                className={`${COMPONENT_STYLES.input.base} ${
                  errors.apellidos ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal
                }`}
                placeholder="Ingrese apellidos"
              />
              {errors.apellidos && (
                <p className={COMPONENT_STYLES.input.errorText}>{errors.apellidos}</p>
              )}
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className={COMPONENT_STYLES.input.label}>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`${COMPONENT_STYLES.input.base} ${
                  errors.email ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal
                }`}
                placeholder="ejemplo@correo.com"
              />
              {errors.email && (
                <p className={COMPONENT_STYLES.input.errorText}>{errors.email}</p>
              )}
            </div>

            {/* Usuario */}
            <div>
              <label className={COMPONENT_STYLES.input.label}>Usuario *</label>
              <input
                type="text"
                value={formData.usuario}
                onChange={(e) => handleChange('usuario', e.target.value)}
                className={`${COMPONENT_STYLES.input.base} ${
                  errors.usuario ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal
                }`}
                placeholder="nombre.usuario"
              />
              {errors.usuario && (
                <p className={COMPONENT_STYLES.input.errorText}>{errors.usuario}</p>
              )}
            </div>

            {/* Contraseña (solo para nuevo usuario) */}
            {!usuario && (
              <div>
                <label className={COMPONENT_STYLES.input.label}>Contraseña *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`${COMPONENT_STYLES.input.base} ${
                      errors.password ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal
                    } pr-10`}
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className={COMPONENT_STYLES.input.errorText}>{errors.password}</p>
                )}
              </div>
            )}

            {/* Rol */}
            <div>
              <label className={COMPONENT_STYLES.input.label}>Rol *</label>
              <select
                value={formData.rol}
                onChange={(e) => handleChange('rol', e.target.value)}
                className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
              >
                {roles.filter(r => r.estado === 'activo').map((rol) => (
                  <option key={rol.id} value={rol.codigo || rol.id}>
                    {rol.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Centro de Acopio */}
            <div>
              <label className={COMPONENT_STYLES.input.label}>
                Centro de Acopio {formData.rol === 'responsable_acopio' && '*'}
              </label>
              <select
                value={formData.centroAcopioId}
                onChange={(e) => handleChange('centroAcopioId', e.target.value)}
                className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                required={formData.rol === 'responsable_acopio'}
              >
                <option value="">Sin asignar</option>
                {centrosAcopio.filter(ca => ca.estado === 'activo').map((ca) => (
                  <option key={ca.id} value={ca.id}>
                    {ca.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado (solo para edición) */}
            {usuario && (
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
            )}
          </div>
        </form>

        {/* Footer */}
        <div className={COMPONENT_STYLES.modal.footer}>
          <button
            type="button"
            onClick={onClose}
            className={COMPONENT_STYLES.button.secondary}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className={COMPONENT_STYLES.button.primary}
            disabled={isLoading}
          >
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
