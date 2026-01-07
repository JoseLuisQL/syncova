import React, { memo, useCallback } from 'react';
import { LucideIcon, Loader2, X, AlertTriangle, Trash2 } from 'lucide-react';
import { COMPONENT_STYLES } from '../constants';

// ============================================================================
// MODAL COMPONENT
// ============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = memo(({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  size = 'lg',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={COMPONENT_STYLES.modal.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`${COMPONENT_STYLES.modal.container} ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={COMPONENT_STYLES.modal.header}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 shadow-lg">
                <Icon className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={COMPONENT_STYLES.modal.body}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={COMPONENT_STYLES.modal.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

// ============================================================================
// MODAL FOOTER COMPONENT
// ============================================================================

interface ModalFooterProps {
  onCancel: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  isSubmitDisabled?: boolean;
  submitType?: 'button' | 'submit';
}

export const ModalFooter: React.FC<ModalFooterProps> = memo(({
  onCancel,
  onSubmit,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  isSubmitDisabled = false,
  submitType = 'submit',
}) => (
  <>
    <button
      type="button"
      onClick={onCancel}
      className={COMPONENT_STYLES.button.secondary}
      disabled={isLoading}
    >
      {cancelLabel}
    </button>
    <button
      type={submitType}
      onClick={submitType === 'button' ? onSubmit : undefined}
      disabled={isLoading || isSubmitDisabled}
      className={COMPONENT_STYLES.button.primary}
      aria-busy={isLoading}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      <span>{submitLabel}</span>
    </button>
  </>
));

ModalFooter.displayName = 'ModalFooter';

// ============================================================================
// FORM FIELD COMPONENT
// ============================================================================

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  helpText?: string;
}

export const FormField: React.FC<FormFieldProps> = memo(({
  id,
  label,
  required = false,
  error,
  children,
  helpText,
}) => (
  <div>
    <label htmlFor={id} className={COMPONENT_STYLES.input.label}>
      {label}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {children}
    {helpText && !error && (
      <p className="mt-1 text-xs text-gray-500">{helpText}</p>
    )}
    {error && (
      <p className={COMPONENT_STYLES.input.errorText} role="alert">
        {error}
      </p>
    )}
  </div>
));

FormField.displayName = 'FormField';

// ============================================================================
// TEXT INPUT COMPONENT
// ============================================================================

interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'number';
  disabled?: boolean;
  min?: number;
  max?: number;
}

export const TextInput: React.FC<TextInputProps> = memo(({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  type = 'text',
  disabled = false,
  min,
  max,
}) => (
  <FormField id={id} label={label} required={required} error={error}>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      min={min}
      max={max}
      className={`${COMPONENT_STYLES.input.base} ${
        error ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal
      }`}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
    />
  </FormField>
));

TextInput.displayName = 'TextInput';

// ============================================================================
// TEXTAREA COMPONENT
// ============================================================================

interface TextAreaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  rows?: number;
  disabled?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = memo(({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  rows = 3,
  disabled = false,
}) => (
  <FormField id={id} label={label} required={required} error={error}>
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      rows={rows}
      className={`${COMPONENT_STYLES.input.base} ${
        error ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal
      } resize-none`}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
    />
  </FormField>
));

TextArea.displayName = 'TextArea';

// ============================================================================
// SELECT INPUT COMPONENT
// ============================================================================

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export const SelectInput: React.FC<SelectInputProps> = memo(({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  required = false,
  error,
  disabled = false,
}) => (
  <FormField id={id} label={label} required={required} error={error}>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      className={`${COMPONENT_STYLES.input.base} ${
        error ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal
      }`}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </FormField>
));

SelectInput.displayName = 'SelectInput';

// ============================================================================
// DATE INPUT COMPONENT
// ============================================================================

interface DateInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
}

export const DateInput: React.FC<DateInputProps> = memo(({
  id,
  label,
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  min,
  max,
}) => (
  <FormField id={id} label={label} required={required} error={error}>
    <input
      id={id}
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      min={min}
      max={max}
      className={`${COMPONENT_STYLES.input.base} ${
        error ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal
      }`}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
    />
  </FormField>
));

DateInput.displayName = 'DateInput';

// ============================================================================
// DELETE CONFIRMATION MODAL COMPONENT
// ============================================================================

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: string;
  isLoading?: boolean;
  warningMessage?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = memo(({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
  isLoading = false,
  warningMessage,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={COMPONENT_STYLES.modal.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-rose-100">
              <svg className="h-6 w-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 id="delete-modal-title" className="text-lg font-semibold text-gray-900">
                Eliminar {itemType}
              </h3>
              <p id="delete-modal-description" className="text-sm text-gray-500 mt-1">
                Esta accion no se puede deshacer
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-700">
              Esta seguro de eliminar <span className="font-semibold">"{itemName}"</span>?
            </p>
            {warningMessage && (
              <p className="text-xs text-amber-600 mt-2">{warningMessage}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className={COMPONENT_STYLES.button.secondary}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-md transition-all duration-200 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

DeleteConfirmModal.displayName = 'DeleteConfirmModal';
