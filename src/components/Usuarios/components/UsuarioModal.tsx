import React, { memo, useEffect, useMemo, useState } from 'react';
import { Buildings, Clock, Eye, EyeSlash, Key, EnvelopeSimple, Shield, User } from '@phosphor-icons/react';
import { CentroAcopio, Role, Usuario } from '../../../types';
import {
  FormField,
  FormSection,
  Modal,
  ModalFooter,
  SelectInput,
  TextInput,
} from '../../ui/ModalElements';
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

const formatDateTime = (value?: Date) => (value ? new Date(value).toLocaleString('es-PE') : 'Sin registro');

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
    setShowPassword(false);
    setErrors({});
  }, [usuario, isOpen]);

  const centrosActivos = useMemo(
    () => centrosAcopio.filter((centro) => centro.estado === 'activo'),
    [centrosAcopio],
  );

  const roleOptions = useMemo(() => {
    const options = roles
      .filter((rol) => rol.estado === 'activo')
      .map((rol) => ({ value: rol.codigo || rol.id, label: rol.nombre }));

    if (options.some((option) => option.value === formData.rol)) {
      return options;
    }

    return formData.rol
      ? [{ value: formData.rol, label: formData.rol }, ...options]
      : options;
  }, [formData.rol, roles]);

  const selectedCentros = useMemo(
    () => centrosActivos.filter((centro) => formData.centroAcopioIds.includes(centro.id)),
    [centrosActivos, formData.centroAcopioIds],
  );

  const primaryCentro = selectedCentros[0];

  const handleChange = (field: keyof UsuarioFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleToggleCentro = (centroId: string) => {
    setFormData((prev) => {
      const exists = prev.centroAcopioIds.includes(centroId);
      return {
        ...prev,
        centroAcopioIds: exists
          ? prev.centroAcopioIds.filter((id) => id !== centroId)
          : [...prev.centroAcopioIds, centroId],
      };
    });

    if (errors.centroAcopioIds) {
      setErrors((prev) => ({ ...prev, centroAcopioIds: '' }));
    }
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.nombres.trim()) nextErrors.nombres = 'Ingrese los nombres del usuario.';
    if (!formData.apellidos.trim()) nextErrors.apellidos = 'Ingrese los apellidos del usuario.';
    if (!formData.email.trim()) {
      nextErrors.email = 'Ingrese un correo electrónico.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Ingrese un correo válido.';
    }
    if (!formData.usuario.trim()) nextErrors.usuario = 'Ingrese el nombre de usuario.';
    if (!formData.rol) nextErrors.rol = 'Seleccione un rol.';

    if (!usuario && !formData.password) {
      nextErrors.password = 'Ingrese una contraseña inicial.';
    } else if (!usuario && formData.password.length < 8) {
      nextErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
    }

    if (formData.rol === 'responsable_acopio' && formData.centroAcopioIds.length === 0) {
      nextErrors.centroAcopioIds = 'Seleccione al menos un centro de acopio para este rol.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={usuario ? 'Editar usuario' : 'Nuevo usuario'}
      icon={User}
      size="xl"
      footer={(
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitType="button"
          submitLabel={usuario ? 'Guardar cambios' : 'Crear usuario'}
          isLoading={isLoading}
        />
      )}
    >
      <div className="space-y-6">
        {usuario ? (
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { label: 'Último acceso', value: formatDateTime(usuario.ultimoAcceso), icon: Clock },
              { label: 'Creado', value: formatDateTime(usuario.createdAt), icon: User },
              { label: 'Actualizado', value: formatDateTime(usuario.updatedAt), icon: Shield },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-400">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">{item.value}</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 text-zinc-400">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        <FormSection title="Identidad y acceso">
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              id="usuario-nombres"
              label="Nombres"
              value={formData.nombres}
              onChange={(value) => handleChange('nombres', value)}
              placeholder="Ingrese los nombres"
              required
              error={errors.nombres}
            />
            <TextInput
              id="usuario-apellidos"
              label="Apellidos"
              value={formData.apellidos}
              onChange={(value) => handleChange('apellidos', value)}
              placeholder="Ingrese los apellidos"
              required
              error={errors.apellidos}
            />
            <TextInput
              id="usuario-email"
              label="Correo electrónico"
              value={formData.email}
              onChange={(value) => handleChange('email', value)}
              placeholder="ejemplo@correo.com"
              required
              error={errors.email}
            />
            <TextInput
              id="usuario-usuario"
              label="Usuario"
              value={formData.usuario}
              onChange={(value) => handleChange('usuario', value)}
              placeholder="nombre.usuario"
              required
              error={errors.usuario}
            />

            {!usuario ? (
              <FormField
                id="usuario-password"
                label="Contraseña inicial"
                required
                error={errors.password}
              >
                <div className="relative">
                  <input
                    id="usuario-password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(event) => handleChange('password', event.target.value)}
                    className={`${COMPONENT_STYLES.input.base} ${
                      errors.password ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal
                    } pr-11`}
                    placeholder="Mínimo 8 caracteres"
                    aria-invalid={Boolean(errors.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormField>
            ) : (
              <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/50 p-3">
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Key className="h-4 w-4" />
                  <span>Contraseña gestionada por separado en su módulo de seguridad.</span>
                </div>
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="Perfil operativo">
          <div className="grid gap-4 md:grid-cols-2">
            <SelectInput
              id="usuario-rol"
              label="Rol"
              value={formData.rol}
              onChange={(value) => handleChange('rol', value)}
              options={roleOptions}
              required
              error={errors.rol}
            />

            {usuario ? (
              <SelectInput
                id="usuario-estado"
                label="Estado"
                value={formData.estado}
                onChange={(value) => handleChange('estado', value)}
                options={[
                  { value: 'activo', label: 'Activo' },
                  { value: 'inactivo', label: 'Inactivo' },
                ]}
              />
            ) : null}
          </div>
        </FormSection>

        <FormSection title="Centros de acopio asignados">
          {centrosActivos.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
              No hay centros de acopio activos.
            </div>
          ) : (
            <div>
              <div className="grid max-h-72 gap-2 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-2 md:grid-cols-2">
                {centrosActivos.map((centro) => {
                  const isSelected = formData.centroAcopioIds.includes(centro.id);

                  return (
                    <button
                      key={centro.id}
                      type="button"
                      onClick={() => handleToggleCentro(centro.id)}
                      className={`rounded-lg border px-3 py-2 text-left transition-all ${
                        isSelected
                          ? 'border-teal-600/30 bg-teal-50/50 text-teal-900 shadow-sm'
                          : 'border-zinc-200 bg-zinc-50/30 text-zinc-600 hover:border-zinc-300 hover:bg-white'
                      }`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex flex-col gap-1">
                        <p className={`truncate text-sm font-semibold ${isSelected ? 'text-teal-900' : 'text-zinc-700'}`}>
                          {centro.nombre}
                        </p>
                        <p className="text-xs text-zinc-400">{centro.codigo || 'Sin código'}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.centroAcopioIds ? (
                <p className="mt-2 text-xs font-semibold text-rose-500">{errors.centroAcopioIds}</p>
              ) : null}
            </div>
          )}
        </FormSection>
      </div>
    </Modal>
  );
});

UsuarioModal.displayName = 'UsuarioModal';

export default UsuarioModal;
   