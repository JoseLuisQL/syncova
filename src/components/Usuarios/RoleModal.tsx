import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, Check, ToggleLeft, ToggleRight, Sparkle, Info } from '@phosphor-icons/react';
import { Role, CreateRoleDto, UpdateRoleDto } from '../../types';
import { COMPONENT_STYLES } from './constants';
import { Modal, ModalFooter, FormField } from '../ui/ModalElements';

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

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => nombreInputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, [isOpen]);

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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading || isSubmitting ? () => undefined : onClose}
      title={isEditing ? 'Editar rol' : 'Nuevo rol'}
      subtitle={isEditing ? `Modificando: ${editingRole.nombre}` : 'Define un nuevo rol operativo para el sistema'}
      icon={Shield}
      size="md"
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={() => void handleSubmit()}
          submitType="button"
          submitLabel={isEditing ? 'Guardar cambios' : 'Crear rol'}
          isLoading={isLoading || isSubmitting}
          isSubmitDisabled={!canSubmit}
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSystemRole && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/70 px-3.5 py-2.5 dark:border-amber-500/30 dark:bg-amber-500/10">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" weight="bold" />
            <div>
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">Rol del sistema</p>
              <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">
                Este es un rol predefinido. El código identificador no puede ser modificado.
              </p>
            </div>
          </div>
        )}

        <FormField
          id="nombre"
          label="Nombre del rol"
          required
          error={touched.nombre ? errors.nombre : undefined}
          helpText="Nombre descriptivo para identificar el rol"
        >
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
          />
        </FormField>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="codigo" className="text-[0.8125rem] font-medium tracking-[-0.005em] text-ink">
              Código del rol <span className="ml-0.5 text-rose-500">*</span>
            </label>
            {!isEditing && formData.codigo && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-2">
                <Sparkle className="h-3 w-3 text-brand" weight="fill" />
                Generado automáticamente
              </span>
            )}
          </div>
          <input
            type="text"
            id="codigo"
            value={formData.codigo}
            onChange={(e) => handleCodigoChange(e.target.value)}
            onBlur={() => handleBlur('codigo')}
            className={`${COMPONENT_STYLES.input.base} font-mono text-xs ${
              errors.codigo && touched.codigo
                ? COMPONENT_STYLES.input.error
                : COMPONENT_STYLES.input.normal
            }`}
            placeholder="supervisor_inventario"
            disabled={isLoading || isSubmitting || isSystemRole}
            aria-invalid={!!errors.codigo}
          />
          {errors.codigo && touched.codigo ? (
            <p className={COMPONENT_STYLES.input.errorText}>{errors.codigo}</p>
          ) : (
            <p className="mt-1.5 text-xs text-muted-2">
              Identificador único (solo letras minúsculas, números y guiones bajos).
            </p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="descripcion" className="text-[0.8125rem] font-medium tracking-[-0.005em] text-ink">
              Descripción
            </label>
            <span className="text-[11px] font-medium tabular-nums text-muted">
              {formData.descripcion.length}/500
            </span>
          </div>
          <textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => handleDescripcionChange(e.target.value)}
            onBlur={() => handleBlur('descripcion')}
            rows={3}
            className={`${COMPONENT_STYLES.input.base} min-h-[84px] resize-none py-2.5 ${
              errors.descripcion && touched.descripcion
                ? COMPONENT_STYLES.input.error
                : COMPONENT_STYLES.input.normal
            }`}
            placeholder="Describe las responsabilidades y alcance de este rol..."
            disabled={isLoading || isSubmitting}
            aria-invalid={!!errors.descripcion}
          />
          {errors.descripcion && touched.descripcion && (
            <p className={COMPONENT_STYLES.input.errorText}>{errors.descripcion}</p>
          )}
        </div>

        <div>
          <label className={COMPONENT_STYLES.input.label}>Estado del rol</label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, estado: 'activo' }))}
              disabled={isLoading || isSubmitting}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-[0.8125rem] font-medium transition-all ${
                formData.estado === 'activo'
                  ? 'border-brand-100 bg-surface-soft text-brand'
                  : 'border-line bg-surface text-muted-2 hover:border-line-strong hover:bg-surface-soft'
              }`}
            >
              <ToggleRight className={`h-4 w-4 ${formData.estado === 'activo' ? 'text-emerald-600' : 'text-muted'}`} weight="fill" />
              <span>Activo</span>
              {formData.estado === 'activo' && <Check className="h-3.5 w-3.5 text-emerald-600" weight="bold" />}
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, estado: 'inactivo' }))}
              disabled={isLoading || isSubmitting}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-[0.8125rem] font-medium transition-all ${
                formData.estado === 'inactivo'
                  ? 'border-line-strong bg-surface-soft text-ink'
                  : 'border-line bg-surface text-muted-2 hover:border-line-strong hover:bg-surface-soft'
              }`}
            >
              <ToggleLeft className={`h-4 w-4 ${formData.estado === 'inactivo' ? 'text-ink' : 'text-muted'}`} weight="fill" />
              <span>Inactivo</span>
              {formData.estado === 'inactivo' && <Check className="h-3.5 w-3.5 text-ink" weight="bold" />}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-muted-2">
            {formData.estado === 'activo'
              ? 'Los usuarios con este rol podrán acceder al sistema.'
              : 'Los usuarios con este rol no podrán iniciar sesión.'}
          </p>
        </div>
      </form>
    </Modal>
  );
};

export default React.memo(RoleModal);

   