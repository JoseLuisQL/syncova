import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CaretDown, Check, MagnifyingGlass, SpinnerGap, Warning, X } from '@phosphor-icons/react';
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

interface MultiSelectInputProps {
  id: string;
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  helpText?: string;
  itemLabel?: string;
  itemLabelPlural?: string;
  searchPlaceholder?: string;
  maxVisibleChips?: number;
}

export const MultiSelectInput: React.FC<MultiSelectInputProps> = memo(({
  id,
  label,
  values,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  required = false,
  error,
  disabled = false,
  helpText,
  itemLabel = 'elemento',
  itemLabelPlural = 'elementos',
  searchPlaceholder = 'Buscar...',
  maxVisibleChips = 8,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showAllChips, setShowAllChips] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const selectedSet = useMemo(() => new Set(values), [values]);

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) => option.label.toLowerCase().includes(query));
  }, [options, search]);

  const selectedOptions = useMemo(() => {
    const optionMap = new Map(options.map((option) => [option.value, option]));
    return values
      .map((value) => optionMap.get(value))
      .filter((option): option is SelectOption => Boolean(option));
  }, [options, values]);

  const toggleOption = (value: string) => {
    if (selectedSet.has(value)) {
      onChange(values.filter((current) => current !== value));
    } else {
      onChange([...values, value]);
    }
  };

  const selectAllVisible = () => {
    const visibleValues = filteredOptions.map((option) => option.value);
    const merged = Array.from(new Set([...values, ...visibleValues]));
    onChange(merged);
  };

  const clearAll = () => {
    onChange([]);
  };

  const triggerLabel = () => {
    if (values.length === 0) return placeholder;
    if (values.length === 1) {
      return selectedOptions[0]?.label || `1 ${itemLabel} seleccionado`;
    }
    return `${values.length} ${itemLabelPlural} seleccionados`;
  };

  const visibleChips = showAllChips ? selectedOptions : selectedOptions.slice(0, maxVisibleChips);
  const hiddenChipsCount = selectedOptions.length - visibleChips.length;
  const allVisibleSelected = filteredOptions.length > 0 && filteredOptions.every((option) => selectedSet.has(option.value));

  return (
    <FormField id={id} label={label} required={required} error={error} helpText={helpText}>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`${MODAL_STYLES.input.base} ${error ? MODAL_STYLES.input.error : MODAL_STYLES.input.normal} flex items-center justify-between gap-2 text-left`}
          aria-invalid={Boolean(error)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={`truncate ${values.length === 0 ? 'text-[#a0a4ae]' : 'text-[#15171d]'}`}>
            {triggerLabel()}
          </span>
          <CaretDown
            className={`h-3.5 w-3.5 shrink-0 text-[#8b8f9b] transition-transform ${isOpen ? 'rotate-180' : ''}`}
            weight="bold"
          />
        </button>

        {isOpen ? (
          <div className="absolute left-0 right-0 z-[400] mt-1.5 overflow-hidden rounded-[7px] border border-[#e7e7ef] bg-white shadow-[0_22px_54px_-26px_rgba(12,15,24,0.45)]">
            <div className="border-b border-[#eeeef3] p-2">
              <div className="relative">
                <MagnifyingGlass className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8b8f9b]" weight="bold" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-8 w-full rounded-[5px] border border-[#e7e7ef] bg-[#fbfafd] pl-7 pr-2 text-[12px] text-[#15171d] placeholder:text-[#a0a4ae] focus:border-[#babdca] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-b border-[#eeeef3] bg-[#fbfafd] px-2.5 py-1.5">
              <button
                type="button"
                onClick={selectAllVisible}
                disabled={filteredOptions.length === 0 || allVisibleSelected}
                className="text-[11px] font-semibold text-[#7c3aed] transition hover:text-[#6d28d9] disabled:cursor-not-allowed disabled:text-[#a0a4ae]"
              >
                {search.trim() ? 'Seleccionar resultados' : 'Seleccionar todo'}
              </button>
              <span className="text-[11px] font-medium text-[#8b8f9b]">
                {values.length} de {options.length}
              </span>
              <button
                type="button"
                onClick={clearAll}
                disabled={values.length === 0}
                className="text-[11px] font-medium text-[#606571] transition hover:text-[#15171d] disabled:cursor-not-allowed disabled:text-[#c5c8d2]"
              >
                Limpiar
              </button>
            </div>

            <div role="listbox" aria-multiselectable="true" className="max-h-60 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <p className="px-3 py-4 text-center text-[12px] text-[#8b8f9b]">
                  No se encontraron coincidencias
                </p>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = selectedSet.has(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => toggleOption(option.value)}
                      className={`flex w-full items-center gap-2.5 px-2.5 py-1.5 text-left text-[12.5px] transition ${
                        isSelected ? 'bg-[#f5f0fd] text-[#15171d]' : 'text-[#424750] hover:bg-[#fbfafd]'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition ${
                          isSelected ? 'border-[#7c3aed] bg-[#7c3aed]' : 'border-[#d7d8e2] bg-white'
                        }`}
                      >
                        {isSelected ? <Check className="h-3 w-3 text-white" weight="bold" /> : null}
                      </span>
                      <span className="truncate">{option.label}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : null}

        {selectedOptions.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {visibleChips.map((option) => (
              <span
                key={option.value}
                className="inline-flex max-w-full items-center gap-1 rounded-[5px] border border-[#e7e7ef] bg-[#fbfafd] py-0.5 pl-2 pr-1 text-[11.5px] font-medium text-[#424750]"
              >
                <span className="truncate">{option.label}</span>
                <button
                  type="button"
                  onClick={() => toggleOption(option.value)}
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] text-[#8b8f9b] transition hover:bg-[#fde7ec] hover:text-rose-600"
                  aria-label={`Remover ${option.label}`}
                >
                  <X className="h-2.5 w-2.5" weight="bold" />
                </button>
              </span>
            ))}
            {hiddenChipsCount > 0 ? (
              <button
                type="button"
                onClick={() => setShowAllChips(true)}
                className="inline-flex items-center rounded-[5px] border border-dashed border-[#d7d8e2] bg-white px-2 py-0.5 text-[11.5px] font-medium text-[#606571] transition hover:border-[#babdca] hover:text-[#15171d]"
              >
                +{hiddenChipsCount} más
              </button>
            ) : null}
            {showAllChips && selectedOptions.length > maxVisibleChips ? (
              <button
                type="button"
                onClick={() => setShowAllChips(false)}
                className="inline-flex items-center rounded-[5px] border border-dashed border-[#d7d8e2] bg-white px-2 py-0.5 text-[11.5px] font-medium text-[#606571] transition hover:border-[#babdca] hover:text-[#15171d]"
              >
                Mostrar menos
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </FormField>
  );
});
MultiSelectInput.displayName = 'MultiSelectInput';

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
