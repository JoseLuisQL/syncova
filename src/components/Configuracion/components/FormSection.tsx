import React, { memo } from 'react';
import { Save, RotateCcw, Loader2 } from 'lucide-react';
import { COMPONENT_STYLES } from '../constants';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  children: React.ReactNode;
  onSave?: () => void;
  onReset?: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
  showFooter?: boolean;
}

export const FormSection: React.FC<FormSectionProps> = memo(({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'bg-teal-100 text-teal-600',
  children,
  onSave,
  onReset,
  isSaving = false,
  hasChanges = false,
  showFooter = true,
}) => {
  const [iconBg, iconText] = iconColor.split(' ');

  return (
    <div className={COMPONENT_STYLES.section.container}>
      {/* Header */}
      <div className={COMPONENT_STYLES.section.header}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${iconBg}`}>
              <Icon className={`h-5 w-5 ${iconText}`} />
            </div>
            <div>
              <h3 className={COMPONENT_STYLES.section.headerTitle}>{title}</h3>
              {subtitle && (
                <p className={COMPONENT_STYLES.section.headerSubtitle}>{subtitle}</p>
              )}
            </div>
          </div>
          {hasChanges && (
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
              Sin guardar
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={COMPONENT_STYLES.section.body}>
        {children}
      </div>

      {/* Footer */}
      {showFooter && onSave && onReset && (
        <div className={COMPONENT_STYLES.section.footer}>
          <button
            onClick={onReset}
            disabled={isSaving}
            className={COMPONENT_STYLES.button.secondary}
          >
            <RotateCcw className="h-4 w-4" />
            Restablecer
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className={COMPONENT_STYLES.button.primary}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
      )}
    </div>
  );
});

FormSection.displayName = 'FormSection';

// Toggle component
interface ToggleFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const ToggleField: React.FC<ToggleFieldProps> = memo(({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <div className={COMPONENT_STYLES.toggle.container}>
      <div>
        <label className={COMPONENT_STYLES.toggle.label}>{label}</label>
        {description && (
          <p className={COMPONENT_STYLES.toggle.description}>{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`${COMPONENT_STYLES.toggle.wrapper} ${
          checked ? COMPONENT_STYLES.toggle.active : COMPONENT_STYLES.toggle.inactive
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`${COMPONENT_STYLES.toggle.dot} ${
            checked ? COMPONENT_STYLES.toggle.dotActive : COMPONENT_STYLES.toggle.dotInactive
          }`}
        />
      </button>
    </div>
  );
});

ToggleField.displayName = 'ToggleField';

// Input field component
interface InputFieldProps {
  label: string;
  type?: 'text' | 'email' | 'number' | 'password' | 'time';
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  helpText?: string;
  error?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export const InputField: React.FC<InputFieldProps> = memo(({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  helpText,
  error,
  min,
  max,
  disabled = false,
}) => {
  return (
    <div>
      <label className={COMPONENT_STYLES.input.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          const val = type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
          onChange(val);
        }}
        placeholder={placeholder}
        min={min}
        max={max}
        disabled={disabled}
        className={`${COMPONENT_STYLES.input.base} ${
          error ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal
        } ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
      />
      {helpText && !error && (
        <p className={COMPONENT_STYLES.input.helpText}>{helpText}</p>
      )}
      {error && (
        <p className={COMPONENT_STYLES.input.errorText}>{error}</p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

// Select field component
interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = memo(({
  label,
  value,
  onChange,
  options,
  disabled = false,
}) => {
  return (
    <div>
      <label className={COMPONENT_STYLES.input.label}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
});

SelectField.displayName = 'SelectField';

export default FormSection;
