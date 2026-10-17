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
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const sizeClasses = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
  '2xl': 'sm:max-w-5xl',
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
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return renderOverlay(
    <div
      className={MODAL_STYLES.modal.overlay}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className={MODAL_STYLES.modal.container}
        onClick={(event) => event.target === event.currentTarget && onClose()}
      >
        <div
          role="dialog"
          aria-modal="true"
          className={`${MODAL_STYLES.modal.panel} ${sizeClasses[size]}`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className={MODAL_STYLES.modal.header}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                {Icon && (
                  <div className={MODAL_STYLES.modal.headerIconWrapper}>
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" weight="duotone" />
                  </div>
                )}
                <div className="min-w-0 text-left">
                  <h2 className="text-[0.95rem] font-semibold leading-5 tracking-[-0.015em] text-ink">
                    {title}
                  </h2>
                  {subtitle ? (
                    <p className="mt-1 text-[0.8125rem] leading-5 text-muted-2">{subtitle}</p>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-soft hover:text-ink focus:outline-none focus:ring-2 focus:ring-line-focus/70"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" weight="bold" />
              </button>
            </div>
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
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return renderOverlay(
    <div
      className={MODAL_STYLES.modal.overlay}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="flex h-full items-end justify-end sm:items-stretch"
        onClick={(event) => event.target === event.currentTarget && onClose()}
      >
        <aside
          role="dialog"
          aria-modal="true"
          className={MODAL_STYLES.modal.sideSheetPanel}
          onClick={(event) => event.stopPropagation()}
        >
          <div className={MODAL_STYLES.modal.header}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                {Icon && (
                  <div className={MODAL_STYLES.modal.headerIconWrapper}>
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" weight="duotone" />
                  </div>
                )}
                <div className="min-w-0 text-left">
                  <h2 className="text-[0.95rem] font-semibold leading-5 tracking-[-0.015em] text-ink">
                    {title}
                  </h2>
                  {subtitle ? (
                    <p className="mt-1 text-[0.8125rem] leading-5 text-muted-2">{subtitle}</p>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-soft hover:text-ink focus:outline-none focus:ring-2 focus:ring-line-focus/70"
                aria-label="Cerrar panel"
              >
                <X className="h-4 w-4" weight="bold" />
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
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
  isDisabled?: boolean;
  submitType?: 'button' | 'submit';
  submitVariant?: 'primary' | 'danger';
  submitClassName?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = memo(({
  onCancel,
  onSubmit,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  isSubmitDisabled = false,
  isDisabled = false,
  submitType = 'submit',
  submitVariant = 'primary',
  submitClassName,
}) => {
  const defaultBtnClass = submitVariant === 'danger' ? MODAL_STYLES.button.danger : MODAL_STYLES.button.primary;
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row-reverse sm:items-center sm:gap-2.5">
      <button
        type={submitType}
        onClick={submitType === 'button' ? onSubmit : undefined}
        className={submitClassName ?? `${defaultBtnClass} w-full sm:w-auto`}
        disabled={isLoading || isSubmitDisabled || isDisabled}
        aria-busy={isLoading}
      >
        {isLoading ? <SpinnerGap className="h-4 w-4 animate-spin" aria-hidden="true" weight="bold" /> : null}
        <span>{submitLabel}</span>
      </button>
      <button
        type="button"
        onClick={onCancel}
        className={`${MODAL_STYLES.button.secondary} w-full sm:mt-0 sm:w-auto`}
        disabled={isLoading}
      >
        {cancelLabel}
      </button>
    </div>
  );
});
ModalFooter.displayName = 'ModalFooter';

interface FormFieldProps {
  id?: string;
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
  <div className="mb-3.5 last:mb-0">
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

export const FormSection: React.FC<FormSectionProps> = memo(({ title, description, children }) => (
  <section className="mb-6 last:mb-0">
    {(title || description) && (
      <div className="mb-3.5 border-b border-line-soft pb-2">
        {title && (
          <h3 className="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-muted-2">
            {title}
          </h3>
        )}
        {description && (
          <p className="mt-0.5 text-[0.78rem] leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
    )}
    <div className="space-y-3.5">
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
  maxLength?: number;
  list?: string;
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
  maxLength,
  list,
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
      maxLength={maxLength}
      list={list}
      className={`${MODAL_STYLES.input.base} ${error ? MODAL_STYLES.input.error : MODAL_STYLES.input.normal}`}
      aria-invalid={Boolean(error)}
    />
  </FormField>
));
TextInput.displayName = 'TextInput';

export interface ComboboxOption {
  value: string;
  label?: string;
  dotClass?: string;
}

interface ComboboxInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (string | ComboboxOption)[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  maxLength?: number;
  helpText?: string;
}

export const ComboboxInput: React.FC<ComboboxInputProps> = memo(({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  error,
  disabled = false,
  maxLength,
  helpText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: ComboboxOption[] = useMemo(() => {
    return options.map((opt) =>
      typeof opt === 'string'
        ? { value: opt, label: opt }
        : { value: opt.value, label: opt.label || opt.value, dotClass: opt.dotClass },
    );
  }, [options]);

  const filteredOptions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter(
      (opt) =>
        opt.value.toLowerCase().includes(q) ||
        (opt.label && opt.label.toLowerCase().includes(q)),
    );
  }, [normalizedOptions, value]);

  useEffect(() => {
    if (!isOpen) return;

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

  return (
    <FormField id={id} label={label} required={required} error={error} helpText={helpText}>
      <div ref={containerRef} className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          autoComplete="off"
          className={`${MODAL_STYLES.input.base} ${
            error ? MODAL_STYLES.input.error : MODAL_STYLES.input.normal
          }`}
          aria-invalid={Boolean(error)}
          aria-expanded={isOpen}
          aria-autocomplete="list"
        />

        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-52 overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-[0_18px_42px_-12px_rgba(15,23,42,0.18)] dark:shadow-[0_18px_42px_-12px_rgba(0,0,0,0.65)]">
            {filteredOptions.map((opt) => {
              const isSelected = opt.value.toLowerCase() === value.trim().toLowerCase();
              return (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[0.8125rem] transition-colors ${
                    isSelected
                      ? 'bg-surface-tint font-medium text-ink'
                      : 'text-ink hover:bg-surface-soft'
                  }`}
                >
                  {opt.dotClass && (
                    <span
                      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-black/10 ${opt.dotClass}`}
                    />
                  )}
                  <span className="truncate">{opt.label || opt.value}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </FormField>
  );
});
ComboboxInput.displayName = 'ComboboxInput';

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
  options: readonly SelectOption[];
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
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled}
        className={`${MODAL_STYLES.input.base} ${error ? MODAL_STYLES.input.error : MODAL_STYLES.input.normal} appearance-none pr-9`}
        aria-invalid={Boolean(error)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <CaretDown
        className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
        weight="bold"
      />
    </div>
  </FormField>
));
SelectInput.displayName = 'SelectInput';

interface MultiSelectInputProps {
  id: string;
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: readonly SelectOption[];
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
          <span className={`truncate ${values.length === 0 ? 'text-muted/80' : 'text-ink'}`}>
            {triggerLabel()}
          </span>
          <CaretDown
            className={`h-3.5 w-3.5 shrink-0 text-muted transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
            weight="bold"
          />
        </button>

        {isOpen ? (
          <div className="absolute left-0 right-0 z-[400] mt-1.5 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_18px_42px_-12px_rgba(15,23,42,0.2)] dark:shadow-[0_18px_42px_-12px_rgba(0,0,0,0.65)]">
            <div className="border-b border-line-soft p-2">
              <div className="relative">
                <MagnifyingGlass className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" weight="bold" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-8.5 w-full rounded-lg border border-line bg-surface-soft pl-8 pr-2.5 text-[0.8125rem] text-ink placeholder:text-muted/80 focus:border-brand focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/12"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-b border-line-soft bg-surface-soft/70 px-3 py-1.5">
              <button
                type="button"
                onClick={selectAllVisible}
                disabled={filteredOptions.length === 0 || allVisibleSelected}
                className="text-xs font-semibold text-brand transition hover:text-brand-600 disabled:cursor-not-allowed disabled:text-muted"
              >
                {search.trim() ? 'Seleccionar resultados' : 'Seleccionar todo'}
              </button>
              <span className="text-xs font-medium text-muted">
                {values.length} de {options.length}
              </span>
              <button
                type="button"
                onClick={clearAll}
                disabled={values.length === 0}
                className="text-xs font-medium text-muted-2 transition hover:text-ink disabled:cursor-not-allowed disabled:text-muted"
              >
                Limpiar
              </button>
            </div>

            <div role="listbox" aria-multiselectable="true" className="max-h-60 overflow-y-auto p-1">
              {filteredOptions.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-muted">
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
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[0.8rem] transition ${
                        isSelected ? 'bg-surface-tint font-medium text-ink' : 'text-muted-2 hover:bg-surface-soft hover:text-ink'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition ${
                          isSelected ? 'border-brand bg-brand' : 'border-line-strong bg-surface'
                        }`}
                      >
                        {isSelected ? <Check className="h-2.5 w-2.5 text-white" weight="bold" /> : null}
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
                className="inline-flex max-w-full items-center gap-1 rounded-lg border border-line bg-surface-soft py-0.5 pl-2.5 pr-1 text-xs font-medium text-ink"
              >
                <span className="truncate">{option.label}</span>
                <button
                  type="button"
                  onClick={() => toggleOption(option.value)}
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
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
                className="inline-flex items-center rounded-lg border border-dashed border-line-strong bg-surface-soft px-2 py-0.5 text-xs font-medium text-muted-2 transition hover:border-line-focus-strong hover:text-ink"
              >
                +{hiddenChipsCount} más
              </button>
            ) : null}
            {showAllChips && selectedOptions.length > maxVisibleChips ? (
              <button
                type="button"
                onClick={() => setShowAllChips(false)}
                className="inline-flex items-center rounded-lg border border-dashed border-line-strong bg-surface-soft px-2 py-0.5 text-xs font-medium text-muted-2 transition hover:border-line-focus-strong hover:text-ink"
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
      className={`${MODAL_STYLES.input.base} ${error ? MODAL_STYLES.input.error : MODAL_STYLES.input.normal}`}
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
  itemType?: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
  isLoading?: boolean;
  warningMessage?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = memo(({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
  title,
  description,
  confirmLabel = 'Eliminar',
  isLoading = false,
  warningMessage,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return renderOverlay(
    <div
      className={MODAL_STYLES.modal.overlay}
      onClick={(event) => event.target === event.currentTarget && !isLoading && onClose()}
    >
      <div
        className={MODAL_STYLES.modal.container}
        onClick={(event) => event.target === event.currentTarget && !isLoading && onClose()}
      >
        <div
          role="dialog"
          aria-modal="true"
          className={`${MODAL_STYLES.modal.panel} sm:max-w-md`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="px-5 pt-5 pb-4 sm:px-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-200/80 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
                  <Warning className="h-5 w-5" weight="duotone" />
                </div>
                <div className="min-w-0 text-left">
                  <h3 className="text-[0.95rem] font-semibold leading-5 tracking-[-0.015em] text-ink">
                    {title || `Eliminar ${itemType || 'registro'}`}
                  </h3>
                  <div className="mt-1.5 space-y-2">
                    <p className="text-[0.8125rem] leading-relaxed text-muted-2">
                      {description ? (
                        description
                      ) : (
                        <>
                          Se eliminará <span className="font-semibold text-ink">"{itemName}"</span>. Esta acción no se puede deshacer.
                        </>
                      )}
                    </p>
                    {warningMessage ? (
                      <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 px-3 py-2 text-xs font-medium leading-relaxed text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                        {warningMessage}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-soft hover:text-ink disabled:opacity-50"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" weight="bold" />
              </button>
            </div>
          </div>

          <div className={MODAL_STYLES.modal.footer}>
            <div className="flex w-full flex-col gap-2 sm:flex-row-reverse sm:items-center sm:gap-2.5">
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`${MODAL_STYLES.button.danger} w-full sm:w-auto`}
              >
                {isLoading ? <SpinnerGap className="h-4 w-4 animate-spin" aria-hidden="true" weight="bold" /> : null}
                <span>{confirmLabel}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className={`${MODAL_STYLES.button.secondary} w-full sm:w-auto`}
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
