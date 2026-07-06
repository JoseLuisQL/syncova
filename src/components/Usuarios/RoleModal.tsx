import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, CircleNotch, WarningCircle, Check, Code, FileText, ToggleLeft, ToggleRight, Sparkle, Info } from '@phosphor-icons/react';
import { Role, CreateRoleDto, UpdateRoleDto } from '../../types';
import { COMPONENT_STYLES } from './constants';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoleDto | UpdateRoleDto) => Promise<void>;
  editingRole?: Role | null;
  isLoading?: boolean;
}

const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingRole,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    codigo: '',
    estado: 'activo' as 'activo' | 'inactivo'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nombreInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Resetear formulario cuando cambia el rol en edición o al abrir.
  // Ajuste durante el render (sin useEffect) para evitar el flash de estado
  // stale que marca react-doctor (no-adjust-state-on-prop-change).
  const [lastKey, setLastKey] = useState<string | null>(null);
  const currentKey = `${isOpen ? 'open' : 'closed'}:${editingRole?.id ?? 'new'}`;
  if (currentKey !== lastKey) {
    setLastKey(currentKey);
    if (isOpen) {
      if (editingRole) {
        setFormData({
          nombre: editingRole.nombre,
          descripcion: editingRole.descripcion || '',
          codigo: editingRole.codigo,
          estado: editingRole.estado
        });
      } else {
        setFormData({
          nombre: '',
          descripcion: '',
          codigo: '',
          estado: 'activo'
        });
      }
      setErrors({});
      setTouched({});
    }
  }

  // Foco al abrir: timer con cleanup para evitar memory leak.
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => nombreInputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, [isOpen]);

  // Manejar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading && !isSubmitting) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, isSubmitting, onClose]);

  // Generar código automáticamente basado en el nombre
  const generateCodigo = useCallback((nombre: string) => {
    return nombre
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }, []);

  const handleNombreChange = (nombre: string) => {
    setFormData(prev => ({
      ...prev,
      nombre,
      codigo: editingRole ? prev.codigo : generateCodigo(nombre)
    }));
    if (touched.nombre) {
      validateField('nombre', nombre);
    }
  };

  const handleCodigoChange = (codigo: string) => {
    const cleanCodigo = codigo.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setFormData(prev => ({ ...prev, codigo: cleanCodigo }));
    if (touched.codigo) {
      validateField('codigo', cleanCodigo);
    }
  };

  const handleDescripcionChange = (descripcion: string) => {
    if (descripcion.length <= 500) {
      setFormData(prev => ({ ...prev, descripcion }));
      if (touched.descripcion) {
        validateField('descripcion', descripcion);
      }
    }
  };

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'nombre':
        if (!value.trim()) {
          newErrors.nombre = 'El nombre es requerido';
        } else if (value.length < 3) {
          newErrors.nombre = 'Mínimo 3 caracteres';
        } else if (value.length > 100) {
          newErrors.nombre = 'Máximo 100 caracteres';
        } else {
          delete newErrors.nombre;
        }
        break;
      case 'codigo':
        if (!value.trim()) {
          newErrors.codigo = 'El código es requerido';
        } else if (!/^[a-z0-9_]+$/.test(value)) {
          newErrors.codigo = 'Solo letras minúsculas, números y guiones bajos';
        } else if (value.length < 3) {
          newErrors.codigo = 'Mínimo 3 caracteres';
        } else if (value.length > 50) {
          newErrors.codigo = 'Máximo 50 caracteres';
        } else {
          delete newErrors.codigo;
        }
        break;
      case 'descripcion':
        if (value.length > 500) {
          newErrors.descripcion = 'Máximo 500 caracteres';
        } else {
          delete newErrors.descripcion;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field as keyof typeof formData] as string);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 3) {
      newErrors.nombre = 'Mínimo 3 caracteres';
    }

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    } else if (!/^[a-z0-9_]+$/.test(formData.codigo)) {
      newErrors.codigo = 'Solo letras minúsculas, números y guiones bajos';
    } else if (formData.codigo.length < 3) {
      newErrors.codigo = 'Mínimo 3 caracteres';
    }

    if (formData.descripcion && formData.descripcion.length > 500) {
      newErrors.descripcion = 'Máximo 500 caracteres';
    }

    setErrors(newErrors);
    setTouched({ nombre: true, codigo: true, descripcion: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        codigo: formData.codigo.trim(),
        estado: formData.estado
      };

      await onSubmit(submitData);
    } catch {
      // El error se maneja en el componente padre
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.nombre.trim().length >= 3 && 
                      formData.codigo.trim().length >= 3 && 
                      /^[a-z0-9_]+$/.test(formData.codigo);

  if (!isOpen) return null;

  const isEditing = !!editingRole;
  const isSystemRole = editingRole?.esDefault ?? false;
  const canSubmit = isFormValid && !isLoading && !isSubmitting;

  const modalContent = (
    <div 
      className={COMPONENT_STYLES.modal.overlay}
      onClick={(e) => e.target === e.currentTarget && !isLoading && !isSubmitting && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-modal-title"
    >
      <div 
        ref={modalRef}
        className={`${COMPONENT_STYLES.modal.containerShell} flex max-h-[88vh] max-w-lg flex-col`}
      >
        {/* Header */}
        <div className="border-b border-[#eeeef3] bg-white px-5 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-[#e7e7ef] bg-[#fbfafd] text-[#606571]">
                <Shield className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h2 id="role-modal-title" className="text-[15px] font-semibold leading-5 text-[#15171d]">
                  {isEditing ? 'Editar Rol' : 'Crear Nuevo Rol'}
                </h2>
                <p className="mt-1 text-[12px] leading-4 text-[#606571]">
                  {isEditing 
                    ? `Modificando: ${editingRole.nombre}` 
                    : 'Define un nuevo rol para el sistema'}
                </p>
              </div>
            </div>
            
            <button type="button"
              onClick={onClose}
              disabled={isLoading || isSubmitting}
              className={COMPONENT_STYLES.button.ghost}
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Aviso de rol del sistema */}
        {isSystemRole && (
          <div className="mx-5 mt-4 flex items-start gap-3 rounded-[8px] border border-amber-200 bg-amber-50/80 px-3 py-2.5">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <div>
              <p className="text-[13px] font-medium text-amber-800">Rol del Sistema</p>
              <p className="mt-0.5 text-xs text-amber-700">
                Este es un rol predefinido. El código no puede ser modificado.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-white px-5 py-4">
          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="mb-1.5 flex items-center gap-2 text-[12px] font-medium text-[#424750]">
                <FileText className="h-3.5 w-3.5 text-zinc-400" />
                Nombre del Rol
                <span className="text-rose-500">*</span>
              </label>
              <input
                ref={nombreInputRef}
                type="text"
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleNombreChange(e.target.value)}
                onBlur={() => handleBlur('nombre')}
                className={`${COMPONENT_STYLES.input.base} ${
                  errors.nombre && touched.nombre 
                    ? COMPONENT_STYLES.input.error 
                    : COMPONENT_STYLES.input.normal
                }`}
                placeholder="Ej: Supervisor de Inventario"
                disabled={isLoading || isSubmitting}
                aria-invalid={!!errors.nombre}
                aria-describedby={errors.nombre ? 'nombre-error' : undefined}
              />
              {errors.nombre && touched.nombre ? (
                <p id="nombre-error" className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                  <WarningCircle className="h-3.5 w-3.5" />
                  {errors.nombre}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-zinc-500">
                  Nombre descriptivo para identificar el rol
                </p>
              )}
            </div>

            {/* Código */}
            <div>
              <label htmlFor="codigo" className="mb-1.5 flex items-center gap-2 text-[12px] font-medium text-[#424750]">
                <Code className="h-3.5 w-3.5 text-zinc-400" />
                Código del Rol
                <span className="text-rose-500">*</span>
                {!isEditing && formData.codigo && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-zinc-600">
                    <Sparkle className="h-3 w-3" />
                    Generado automáticamente
                  </span>
                )}
              </label>
              <input
                type="text"
                id="codigo"
                value={formData.codigo}
                onChange={(e) => handleCodigoChange(e.target.value)}
                onBlur={() => handleBlur('codigo')}
                className={`${COMPONENT_STYLES.input.base} font-mono text-sm ${
                  errors.codigo && touched.codigo 
                    ? COMPONENT_STYLES.input.error 
                    : COMPONENT_STYLES.input.normal
                } ${isSystemRole ? 'bg-zinc-50 cursor-not-allowed' : ''}`}
                placeholder="supervisor_inventario"
                disabled={isLoading || isSubmitting || isSystemRole}
                aria-invalid={!!errors.codigo}
                aria-describedby={errors.codigo ? 'codigo-error' : 'codigo-hint'}
              />
              {errors.codigo && touched.codigo ? (
                <p id="codigo-error" className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                  <WarningCircle className="h-3.5 w-3.5" />
                  {errors.codigo}
                </p>
              ) : (
                <p id="codigo-hint" className="mt-1.5 text-xs text-zinc-500">
                  Identificador único. Solo letras minúsculas, números y guiones bajos.
                </p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="mb-1.5 flex items-center gap-2 text-[12px] font-medium text-[#424750]">
                <FileText className="h-3.5 w-3.5 text-zinc-400" />
                Descripción
                <span className="ml-auto text-xs text-zinc-400">
                  {formData.descripcion.length}/500
                </span>
              </label>
              <textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => handleDescripcionChange(e.target.value)}
                onBlur={() => handleBlur('descripcion')}
                rows={3}
                className={`${COMPONENT_STYLES.input.base} resize-none ${
                  errors.descripcion && touched.descripcion 
                    ? COMPONENT_STYLES.input.error 
                    : COMPONENT_STYLES.input.normal
                }`}
                placeholder="Describe las responsabilidades y alcance de este rol..."
                disabled={isLoading || isSubmitting}
                aria-invalid={!!errors.descripcion}
                aria-describedby={errors.descripcion ? 'descripcion-error' : undefined}
              />
              {errors.descripcion && touched.descripcion && (
                <p id="descripcion-error" className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                  <WarningCircle className="h-3.5 w-3.5" />
                  {errors.descripcion}
                </p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-[12px] font-medium text-[#424750]">
                Estado del Rol
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, estado: 'activo' }))}
                  disabled={isLoading || isSubmitting}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-[7px] border px-3 py-2 text-[13px] transition-colors duration-200 ${
                    formData.estado === 'activo'
                      ? 'border-[#c8bbff] bg-[#fbfafd] text-[#7c3aed]'
                      : 'border-[#e7e7ef] bg-white text-zinc-600 hover:border-[#d7d8e2] hover:bg-[#fbfafd]'
                  }`}
                >
                  <ToggleRight className={`h-5 w-5 ${formData.estado === 'activo' ? 'text-emerald-600' : 'text-zinc-400'}`} />
                  <span className="font-medium">Activo</span>
                  {formData.estado === 'activo' && (
                    <Check className="h-4 w-4 text-emerald-600" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, estado: 'inactivo' }))}
                  disabled={isLoading || isSubmitting}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-[7px] border px-3 py-2 text-[13px] transition-colors duration-200 ${
                    formData.estado === 'inactivo'
                      ? 'border-[#e7e7ef] bg-[#fbfafd] text-zinc-700'
                      : 'border-[#e7e7ef] bg-white text-zinc-600 hover:border-[#d7d8e2] hover:bg-[#fbfafd]'
                  }`}
                >
                  <ToggleLeft className={`h-5 w-5 ${formData.estado === 'inactivo' ? 'text-zinc-600' : 'text-zinc-400'}`} />
                  <span className="font-medium">Inactivo</span>
                  {formData.estado === 'inactivo' && (
                    <Check className="h-4 w-4 text-zinc-600" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                {formData.estado === 'activo' 
                  ? 'Los usuarios con este rol podrán acceder al sistema' 
                  : 'Los usuarios con este rol no podrán iniciar sesión'}
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-[#eeeef3] bg-[#fbfafd] px-5 py-3">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isSubmitting}
              className={COMPONENT_STYLES.button.secondary}
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={COMPONENT_STYLES.button.primary}
            >
              {(isLoading || isSubmitting) && <CircleNotch className="h-4 w-4 animate-spin" />}
              <Check className="h-4 w-4" />
              <span>{isEditing ? 'Actualizar Rol' : 'Crear Rol'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default React.memo(RoleModal);
   