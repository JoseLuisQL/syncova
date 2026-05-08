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
          <div className="absolute right-3 top-3 hidden sm:block">
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-white text-[#8b8f9b] transition hover:bg-[#fbfafd] hover:text-[#15171d] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" weight="bold" />
            </button>
          </div>

          <div className={MODAL_STYLES.modal.header}>
            <div className="flex items-start gap-3 pr-8">
              {Icon && (
                <div className={MODAL_STYLES.modal.headerIconWrapper}>
                  <Icon className="h-4 w-4" aria-hidden="true" weight="duotone" />
                </div>
              )}
              <div className="min-w-0 text-left">
                <h2 className="text-[15px] font-semibold leading-5 tracking-[-0.01em] text-[#15171d]">{title}</h2>
                {subtitle ? <p className="mt-1 text-[12px] leading-5 text-[#606571]">{subtitle}</p> : null}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-[7px] text-[#8b8f9b] transition hover:bg-[#fbfafd] hover:text-[#15171d] sm:hidden"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" weight="bold" />
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
          <div className="absolute right-3 top-3">
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-white text-[#8b8f9b] transition hover:bg-[#fbfafd] hover:text-[#15171d] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70"
              aria-label="Cerrar panel"
            >
              <X className="h-4 w-4" weight="bold" />
            </button>
          </div>
          
          <div className={MODAL_STYLES.modal.header}>
            <div className="flex items-start gap-3 pr-8">
              {Icon && (
                <div className={MODAL_STYLES.modal.headerIconWrapper}>
                  <Icon className="h-4 w-4" aria-hidden="true" weight="duotone" />
                </div>
              )}
              <div className="min-w-0 text-left">
                <h2 className="text-[15px] font-semibold leading-5 tracking-[-0.01em] text-[#15171d]">{title}</h2>
                {subtitle ? <p className="mt-1 text-[12px] leading-5 text-[#606571]">{subtitle}</p> : null}
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">{children}</div>
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
  <div className="flex w-full flex-col gap-2 sm:flex-row-reverse sm:gap-2">
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
    <button type="button" onClick={onCancel} className={`${MODAL_STYLES.button.secondary} w-full sm:mt-0 sm:w-auto`} disabled={isLoading}>
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
  <div className="mb-3 last:mb-0">
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
  <section className="mb-5 last:mb-0">
    {title && (
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b8f9b]">
        {title}
      </h3>
    )}
    <div className="space-y-3">
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
          <div className="relative w-full overflow-hidden rounded-[10px] border border-[#e7e7ef] bg-white shadow-[0_22px_54px_-38px_rgba(12,15,24,0.55)]">
            <div className="absolute right-3 top-3 hidden sm:block">
              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-white text-[#8b8f9b] transition hover:bg-[#fbfafd] hover:text-[#15171d] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" weight="bold" />
              </button>
            </div>
            
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-[7px] text-[#8b8f9b] transition hover:bg-[#fbfafd] hover:text-[#15171d] sm:hidden"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" weight="bold" />
            </button>

            <div className="border-b border-[#eeeef3] px-4 py-3.5 sm:px-5">
              <div className="flex items-start gap-3 pr-8">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] border border-rose-200 bg-rose-50 text-rose-600">
                  <Warning className="h-4 w-4" weight="regular" />
                </div>
                <div className="min-w-0 text-left">
                  <h3 className="text-[15px] font-semibold leading-5 text-[#15171d]">Eliminar {itemType}</h3>
                  <div className="mt-1">
                    <p className="text-[12px] leading-5 text-[#606571]">
                      Se eliminará <span className="font-semibold text-[#15171d]">"{itemName}"</span>. Esta acción no se puede deshacer.
                    </p>
                    {warningMessage ? <p className="mt-2 text-xs font-medium text-amber-700">{warningMessage}</p> : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#eeeef3] bg-[#fbfafd] px-4 py-3 sm:flex sm:flex-row-reverse sm:px-5">
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="inline-flex h-9 w-full items-center justify-center rounded-[7px] bg-rose-600 px-3.5 text-[13px] font-semibold text-white shadow-none transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:ring-offset-2 sm:ml-2 sm:w-auto disabled:opacity-50"
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
