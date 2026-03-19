import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Shield, 
  Loader2, 
  AlertCircle, 
  Check,
  Code,
  FileText,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Info
} from 'lucide-react';
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

  // Resetear formulario cuando cambia el rol en edición
  useEffect(() => {
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
      setTimeout(() => nombreInputRef.current?.focus(), 100);
    }
  }, [editingRole, isOpen]);

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
        className={`${COMPONENT_STYLES.modal.containerShell} max-w-lg max-h-[92vh] flex flex-col sm:rounded-[28px]`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-100/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 shadow-[0_16px_30px_-18px_rgba(13,148,136,0.75)]">
                <Shield className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <h2 id="role-modal-title" className="text-xl font-bold text-gray-900">
                  {isEditing ? 'Editar Rol' : 'Crear Nuevo Rol'}
                </h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  {isEditing 
                    ? `Modificando: ${editingRole.nombre}` 
                    : 'Define un nuevo rol para el sistema'}
                </p>
              </div>
            </div>
            
            <button
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
          <div className="mx-6 mt-4 rounded-[20px] border border-amber-200 bg-amber-50/80 px-4 py-3.5 flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Rol del Sistema</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Este es un rol predefinido. El código no puede ser modificado.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-white px-6 py-5">
          <div className="space-y-5">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 text-gray-400" />
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
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.nombre}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-gray-500">
                  Nombre descriptivo para identificar el rol
                </p>
              )}
            </div>

            {/* Código */}
            <div>
              <label htmlFor="codigo" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Code className="h-4 w-4 text-gray-400" />
                Código del Rol
                <span className="text-rose-500">*</span>
                {!isEditing && formData.codigo && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-teal-600">
                    <Sparkles className="h-3 w-3" />
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
                } ${isSystemRole ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="supervisor_inventario"
                disabled={isLoading || isSubmitting || isSystemRole}
                aria-invalid={!!errors.codigo}
                aria-describedby={errors.codigo ? 'codigo-error' : 'codigo-hint'}
              />
              {errors.codigo && touched.codigo ? (
                <p id="codigo-error" className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.codigo}
                </p>
              ) : (
                <p id="codigo-hint" className="mt-1.5 text-xs text-gray-500">
                  Identificador único. Solo letras minúsculas, números y guiones bajos.
                </p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 text-gray-400" />
                Descripción
                <span className="ml-auto text-xs text-gray-400">
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
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.descripcion}
                </p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                Estado del Rol
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, estado: 'activo' }))}
                  disabled={isLoading || isSubmitting}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${
                    formData.estado === 'activo'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <ToggleRight className={`h-5 w-5 ${formData.estado === 'activo' ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span className="font-medium">Activo</span>
                  {formData.estado === 'activo' && (
                    <Check className="h-4 w-4 text-emerald-600" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, estado: 'inactivo' }))}
                  disabled={isLoading || isSubmitting}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${
                    formData.estado === 'inactivo'
                      ? 'border-slate-300 bg-slate-100 text-slate-700 ring-1 ring-slate-200 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <ToggleLeft className={`h-5 w-5 ${formData.estado === 'inactivo' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <span className="font-medium">Inactivo</span>
                  {formData.estado === 'inactivo' && (
                    <Check className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {formData.estado === 'activo' 
                  ? 'Los usuarios con este rol podrán acceder al sistema' 
                  : 'Los usuarios con este rol no podrán iniciar sesión'}
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-end gap-3">
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
              {(isLoading || isSubmitting) && <Loader2 className="h-4 w-4 animate-spin" />}
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
