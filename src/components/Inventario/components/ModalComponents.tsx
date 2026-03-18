import React, { memo } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Loader2, LucideIcon, X } from 'lucide-react';
import { COMPONENT_STYLES } from '../constants';

const renderOverlay = (node: React.ReactElement) => {
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(node, document.body);
};

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
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
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

  return renderOverlay(
    <div className={COMPONENT_STYLES.modal.overlay} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className={COMPONENT_STYLES.modal.container}>
        <div className={`${COMPONENT_STYLES.modal.panel} ${sizeClasses[size]}`}>
          <div className={COMPONENT_STYLES.modal.header}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                <div className={COMPONENT_STYLES.header.iconWrapper}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
                  {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={COMPONENT_STYLES.button.ghost}
                aria-label="Cerrar modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className={COMPONENT_STYLES.modal.body}>{children}</div>

          {footer ? <div className={COMPONENT_STYLES.modal.footer}>{footer}</div> : null}
        </div>
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

interface SideSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const SideSheet: React.FC<SideSheetProps> = memo(({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
}) => {
  if (!isOpen) return null;

  return renderOverlay(
    <div className={COMPONENT_STYLES.modal.overlay} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="flex h-full items-end justify-end sm:items-stretch">
        <aside className="mt-auto flex h-[88vh] w-full flex-col rounded-t-[30px] bg-white shadow-2xl ring-1 ring-slate-200/80 sm:mt-0 sm:h-full sm:max-w-xl sm:rounded-none sm:rounded-l-[32px]">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={COMPONENT_STYLES.header.iconWrapper}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
                  {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
                </div>
              </div>
              <button type="button" onClick={onClose} className={COMPONENT_STYLES.button.ghost} aria-label="Cerrar panel">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

          {footer ? <div className="border-t border-slate-100 bg-white px-5 py-4 sm:px-6">{footer}</div> : null}
        </aside>
      </div>
    </div>
  );
});

SideSheet.displayName = 'SideSheet';

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
  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
    <button type="button" onClick={onCancel} className={COMPONENT_STYLES.button.secondary} disabled={isLoading}>
      {cancelLabel}
    </button>
    <button
      type={submitType}
      onClick={submitType === 'button' ? onSubmit : undefined}
      className={COMPONENT_STYLES.button.primary}
      disabled={isLoading || isSubmitDisabled}
      aria-busy={isLoading}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      <span>{submitLabel}</span>
    </button>
  </div>
));

ModalFooter.displayName = 'ModalFooter';

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
      {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
    </label>
    {children}
    {helpText && !error ? <p className={COMPONENT_STYLES.input.helpText}>{helpText}</p> : null}
    {error ? <p className={COMPONENT_STYLES.input.errorText}>{error}</p> : null}
  </div>
));

FormField.displayName = 'FormField';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = memo(({ title, description, children }) => (
  <section className="space-y-4 rounded-[22px] border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
    <header>
      <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-700">{title}</h3>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    </header>
    {children}
  </section>
));

FormSection.displayName = 'FormSection';

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
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      min={min}
      max={max}
      className={`${COMPONENT_STYLES.input.base} ${error ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal}`}
      aria-invalid={Boolean(error)}
    />
  </FormField>
));

TextInput.displayName = 'TextInput';

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
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      rows={rows}
      className={`${COMPONENT_STYLES.input.base} ${error ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal} resize-none`}
      aria-invalid={Boolean(error)}
    />
  </FormField>
));

TextArea.displayName = 'TextArea';

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
      onChange={(event) => onChange(event.target.value)}
      required={required}
      disabled={disabled}
      className={`${COMPONENT_STYLES.input.base} ${error ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal}`}
      aria-invalid={Boolean(error)}
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
      onChange={(event) => onChange(event.target.value)}
      required={required}
      disabled={disabled}
      min={min}
      max={max}
      className={`${COMPONENT_STYLES.input.base} ${error ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal}`}
      aria-invalid={Boolean(error)}
    />
  </FormField>
));

DateInput.displayName = 'DateInput';

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

  return renderOverlay(
    <div className={COMPONENT_STYLES.modal.overlay} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className={COMPONENT_STYLES.modal.container}>
        <div className="w-full sm:max-w-md">
          <div className={`${COMPONENT_STYLES.modal.panel} sm:rounded-[28px]`}>
            <div className={COMPONENT_STYLES.modal.header}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">Eliminar {itemType}</h3>
                  <p className="mt-1 text-sm text-slate-500">Esta accion no se puede deshacer.</p>
                </div>
              </div>
            </div>

            <div className={COMPONENT_STYLES.modal.body}>
              <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-sm text-slate-700">
                  Se eliminara <span className="font-semibold text-slate-950">"{itemName}"</span>.
                </p>
                {warningMessage ? <p className="mt-2 text-xs text-amber-700">{warningMessage}</p> : null}
              </div>
            </div>

            <div className={COMPONENT_STYLES.modal.footer}>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={onClose} className={COMPONENT_STYLES.button.secondary} disabled={isLoading}>
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:from-rose-700 hover:to-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

DeleteConfirmModal.displayName = 'DeleteConfirmModal';
