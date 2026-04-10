import React, { memo } from 'react';
import { createPortal } from 'react-dom';
import { Warning, SpinnerGap, X } from '@phosphor-icons/react';
import { MODAL_STYLES } from './ModalConstants';

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
  icon?: React.ElementType; // Made optional for extreme minimalism if desired
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
    <div className={MODAL_STYLES.modal.overlay} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className={MODAL_STYLES.modal.container}>
        <div className={`${MODAL_STYLES.modal.panel} ${sizeClasses[size]}`}>
          {/* Close button - absolute top right according to Untitled UI specs */}
          <div className="absolute right-4 top-4 hidden sm:block">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" weight="bold" />
            </button>
          </div>

          <div className={MODAL_STYLES.modal.header}>
            <div className="sm:flex sm:items-start">
              {Icon && (
                <div className={MODAL_STYLES.modal.headerIconWrapper}>
                  <Icon className="h-5 w-5" aria-hidden="true" weight="duotone" />
                </div>
              )}
              <div className={`mt-3 text-center sm:mt-0 sm:text-left min-w-0 ${Icon ? 'sm:ml-4' : ''}`}>
                <h2 className="text-[1.1rem] font-bold tracking-tight text-gray-950">{title}</h2>
                {subtitle ? <p className="mt-1 text-[0.85rem] text-gray-500 leading-tight pr-4">{subtitle}</p> : null}
              </div>
            </div>
            {/* Mobile close button (visible only on small screens below the title for clarity or absolute if preferred, but usually absolute covers it. Actually let's use absolute for all) */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 sm:hidden text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" weight="bold" />
            </button>
          </div>

          <div className={MODAL_STYLES.modal.body}>{children}</div>

          {footer ? <div className={MODAL_STYLES.modal.footer}>{footer}</div> : null}
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
  icon?: React.ElementType;
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
    <div className={MODAL_STYLES.modal.overlay} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="flex h-full items-end justify-end sm:items-stretch">
        <aside className={MODAL_STYLES.modal.sideSheetPanel}>
          <div className="absolute right-4 top-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-label="Cerrar panel"
            >
              <X className="h-5 w-5" weight="bold" />
            </button>
          </div>
          
          <div className={MODAL_STYLES.modal.header}>
            <div className="sm:flex sm:items-start">
              {Icon && (
                <div className={MODAL_STYLES.modal.headerIconWrapper}>
                  <Icon className="h-5 w-5" aria-hidden="true" weight="duotone" />
                </div>
              )}
              <div className={`mt-3 sm:mt-0 sm:text-left min-w-0 ${Icon ? 'sm:ml-4' : ''}`}>
                <h2 className="text-[1.1rem] font-bold tracking-tight text-gray-950">{title}</h2>
                {subtitle ? <p className="mt-1 text-[0.85rem] text-gray-500 leading-tight pr-4">{subtitle}</p> : null}
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6">{children}</div>
          {footer ? <div className={MODAL_STYLES.modal.footer}>{footer}</div> : null}
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
  <div className="w-full flex flex-col gap-3 sm:flex-row-reverse sm:gap-3">
    <button
      type={submitType}
      onClick={submitType === 'button' ? onSubmit : undefined}
      className={`${MODAL_STYLES.button.primary} sm:w-auto w-full`}
      disabled={isLoading || isSubmitDisabled}
      aria-busy={isLoading}
    >
      {isLoading ? <SpinnerGap className="h-4 w-4 animate-spin" aria-hidden="true" weight="bold" /> : null}
      <span>{submitLabel}</span>
    </button>
    <button type="button" onClick={onCancel} className={`${MODAL_STYLES.button.secondary} sm:w-auto w-full mt-3 sm:mt-0`} disabled={isLoading}>
      {cancelLabel}
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
  <div className="mb-4 last:mb-0">
    <label htmlFor={id} className={MODAL_STYLES.input.label}>
      {label}
      {required ? <span className="ml-1 text-rose-500">*</span> : null}
    </label>
    {children}
    {helpText && !error ? <p className={MODAL_STYLES.input.helpText}>{helpText}</p> : null}
    {error ? <p className={MODAL_STYLES.input.errorText}>{error}</p> : null}
  </div>
));
FormField.displayName = 'FormField';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = memo(({ title, children }) => (
  <section className="mb-6 last:mb-0">
    {title && (
      <h3 className="mb-4 text-[0.75rem] font-bold uppercase tracking-widest text-zinc-400/80">
        {title}
      </h3>
    )}
    <div className="space-y-4">
      {children}
    </div>
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
  helpText?: string;
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
  helpText,
}) => (
  <FormField id={id} label={label} required={required} error={error} helpText={helpText}>
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
      className={`${MODAL_STYLES.input.base} ${error ? MODAL_STYLES.input.error.replace('border-error-300', 'border-rose-300').replace('focus:border-error-300', 'focus:border-rose-300').replace('focus:ring-error-100/50', 'focus:ring-rose-100') : MODAL_STYLES.input.normal}`}
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
  helpText?: string;
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
  helpText,
}) => (
  <FormField id={id} label={label} required={required} error={error} helpText={helpText}>
    <textarea
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      rows={rows}
      className={`${MODAL_STYLES.input.base} ${error ? MODAL_STYLES.input.error : MODAL_STYLES.input.normal} resize-none`}
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
  helpText?: string;
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
  helpText,
}) => (
  <FormField id={id} label={label} required={required} error={error} helpText={helpText}>
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      disabled={disabled}
      className={`${MODAL_STYLES.input.base} ${error ? MODAL_STYLES.input.error.replace('border-error-300', 'border-rose-300').replace('focus:border-error-300', 'focus:border-rose-300').replace('focus:ring-error-100/50', 'focus:ring-rose-100') : MODAL_STYLES.input.normal}`}
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
  helpText?: string;
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
  helpText,
}) => (
  <FormField id={id} label={label} required={required} error={error} helpText={helpText}>
    <input
      id={id}
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      disabled={disabled}
      min={min}
      max={max}
      className={`${MODAL_STYLES.input.base} ${error ? MODAL_STYLES.input.error.replace('border-error-300', 'border-rose-300').replace('focus:border-error-300', 'focus:border-rose-300').replace('focus:ring-error-100/50', 'focus:ring-rose-100') : MODAL_STYLES.input.normal}`}
      aria-invalid={Boolean(error)}
    />
  </FormField>
));
DateInput.displayName = 'DateInput';

// DeleteConfirmModal adopts the Red / Danger minimalist approach of Untitled UI
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
    <div className={MODAL_STYLES.modal.overlay} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className={MODAL_STYLES.modal.container}>
        <div className="w-full sm:max-w-md">
          <div className="relative w-full rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/5 sm:rounded-xl">
            {/* Absolute Close */}
            <div className="absolute right-4 top-4 hidden sm:block">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <X className="h-5 w-5" weight="bold" />
              </button>
            </div>
            
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 sm:hidden text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" weight="bold" />
            </button>

            <div className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[8px] border-rose-50 bg-rose-100 sm:mx-0 sm:h-12 sm:w-12 text-rose-600">
                  <Warning className="h-6 w-6" weight="regular" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">Eliminar {itemType}</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Se eliminará <span className="font-semibold text-gray-900">"{itemName}"</span>. Esta acción no se puede deshacer.
                    </p>
                    {warningMessage ? <p className="mt-2 text-sm text-amber-600">{warningMessage}</p> : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-5 py-4 sm:flex sm:flex-row-reverse sm:px-6 rounded-b-xl border-t border-gray-200">
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="inline-flex w-full justify-center rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-100 sm:ml-3 sm:w-auto disabled:opacity-50"
              >
                {isLoading ? <SpinnerGap className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" weight="bold" /> : null}
                <span>Eliminar</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className={`${MODAL_STYLES.button.secondary} mt-3 w-full sm:mt-0 sm:w-auto`}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
DeleteConfirmModal.displayName = 'DeleteConfirmModal';
