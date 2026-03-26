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
      subtitle={
        usuario
          ? 'Actualiza la cuenta y mantiene alineado su alcance operativo con los centros asignados.'
          : 'Crea una cuenta con su perfil operativo y los centros de acopio que podrá gestionar.'
      }
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
      <div className="space-y-4">
        {usuario ? (
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { label: 'Último acceso', value: formatDateTime(usuario.ultimoAcceso), icon: Clock },
              { label: 'Creado', value: formatDateTime(usuario.createdAt), icon: User },
              { label: 'Actualizado', value: formatDateTime(usuario.updatedAt), icon: Shield },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="rounded-[20px] border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">{item.label}</p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-zinc-900">{item.value}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-600">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        <FormSection title="Identidad y acceso" description="Datos base para autenticar al usuario y reconocerlo dentro del sistema.">
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
              helpText="Identificador usado para el ingreso al sistema."
            />

            {!usuario ? (
              <FormField
                id="usuario-password"
                label="Contraseña inicial"
                required
                error={errors.password}
                helpText="Debe tener al menos 8 caracteres."
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
                    className="absolute right-3 top-1/2 -tranzinc-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormField>
            ) : (
              <div className="rounded-[20px] border border-zinc-200 bg-zinc-50/80 p-4 md:col-span-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-700 shadow-sm">
                    <Key className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Contraseña gestionada por separado</p>
                    <p className="mt-1 text-sm text-zinc-800">
                      Para mantener el control y la trazabilidad, el cambio de contraseña se realiza desde el modal específico
                      de seguridad.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="Perfil operativo" description="Define el rol del usuario, su estado y el alcance territorial que tendrá disponible.">
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
            ) : (
              <div className="rounded-[20px] border border-zinc-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
                    <EnvelopeSimple className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Alta inicial en estado activo</p>
                    <p className="mt-1 text-sm text-zinc-600">
                      Las nuevas cuentas se crean activas para facilitar el primer acceso. Luego podrás ajustar el estado si lo necesitas.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.35fr_0.95fr]">
            <div className="rounded-[20px] border border-zinc-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-700">
                  <Buildings className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">Centro principal operativo</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {primaryCentro
                      ? `${primaryCentro.nombre} (${primaryCentro.codigo || 'sin código'})`
                      : 'Aún no se ha definido un centro principal.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[20px] border border-amber-200 bg-amber-50/80 p-4">
              <p className="text-sm font-semibold text-amber-900">Regla operativa</p>
              <p className="mt-1 text-sm text-amber-800">
                El primer centro seleccionado se usa como referencia principal para mantener compatibilidad con el flujo actual.
              </p>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Centros de acopio asignados"
          description="Selecciona uno o varios centros. Para responsables de acopio esta asignación es obligatoria."
        >
          <div className="flex flex-col gap-3 rounded-[20px] border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Cobertura configurada</p>
              <p className="mt-1 text-sm text-zinc-500">
                {selectedCentros.length > 0
                  ? `${selectedCentros.length} centro${selectedCentros.length === 1 ? '' : 's'} seleccionado${selectedCentros.length === 1 ? '' : 's'}.`
                  : 'No hay centros seleccionados todavía.'}
              </p>
            </div>
            <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700">
              {primaryCentro ? `Principal: ${primaryCentro.nombre}` : 'Sin centro principal'}
            </span>
          </div>

          {centrosActivos.length === 0 ? (
            <div className="rounded-[20px] border border-zinc-200 bg-white p-5 text-sm text-zinc-600">
              No hay centros de acopio activos disponibles para asignar.
            </div>
          ) : (
            <div>
              <div className="grid max-h-72 gap-2 overflow-y-auto rounded-[22px] border border-zinc-200 bg-white p-3 md:grid-cols-2">
                {centrosActivos.map((centro) => {
                  const isSelected = formData.centroAcopioIds.includes(centro.id);

                  return (
                    <button
                      key={centro.id}
                      type="button"
                      onClick={() => handleToggleCentro(centro.id)}
                      className={`rounded-[18px] border px-4 py-3 text-left transition-all ${
                        isSelected
                          ? 'border-zinc-300 bg-zinc-50 text-zinc-900 shadow-sm'
                          : 'border-zinc-200 bg-zinc-50/60 text-zinc-700 hover:border-zinc-300 hover:bg-white'
                      }`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{centro.nombre}</p>
                          <p className="mt-1 text-xs text-zinc-500">{centro.codigo || 'Sin código'}</p>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] ${
                            isSelected ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-200 text-zinc-600'
                          }`}
                        >
                          {isSelected ? 'Asignado' : 'Disponible'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.centroAcopioIds ? <p className={COMPONENT_STYLES.input.errorText}>{errors.centroAcopioIds}</p> : null}
            </div>
          )}
        </FormSection>
      </div>
    </Modal>
  );
});

UsuarioModal.displayName = 'UsuarioModal';

export default UsuarioModal;
   