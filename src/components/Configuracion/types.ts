import type { LucideIcon } from 'lucide-react';
import type { ConfiguracionSistema } from '../../services/configuracionService';

export type ConfiguracionGroupId = 'identidad' | 'alertas' | 'seguridad' | 'operacion';
export type ConfiguracionGroupCategory = 'experiencia' | 'plataforma';
export type ConfiguracionCategoryId =
  | 'general'
  | 'interfaz'
  | 'alertas'
  | 'notificaciones'
  | 'seguridad'
  | 'backup'
  | 'reportes'
  | 'api'
  | 'sistema';
export type ConfiguracionFieldType = 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select';
export type ConfiguracionFieldValue = string | number;
export type ConfiguracionFieldSource = 'database' | 'env' | 'derived';
export type ConfiguracionFieldStatus = 'editable' | 'stored' | 'env';
export type ConfiguracionDataType = 'string' | 'number' | 'boolean' | 'json';

export interface ConfiguracionOption {
  value: string;
  label: string;
}

export interface ConfiguracionGroupDefinition {
  id: ConfiguracionGroupId;
  label: string;
  contextLabel: string;
  description: string;
  icon: LucideIcon;
  category: ConfiguracionGroupCategory;
  path: string;
}

export interface ConfiguracionNavGroup {
  key: ConfiguracionGroupCategory;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface ConfiguracionCategoryDefinition {
  id: ConfiguracionCategoryId;
  groupId: ConfiguracionGroupId;
  label: string;
  description: string;
  icon: LucideIcon;
  editable: boolean;
  source: ConfiguracionFieldSource;
  runtimeNote?: string;
}

export interface ConfiguracionFieldDefinition {
  id: string;
  key: string;
  groupId: ConfiguracionGroupId;
  categoryId: ConfiguracionCategoryId;
  label: string;
  description?: string;
  placeholder?: string;
  type: ConfiguracionFieldType;
  editable: boolean;
  source: ConfiguracionFieldSource;
  status: ConfiguracionFieldStatus;
  defaultValue: ConfiguracionFieldValue;
  legacyKeys?: string[];
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  options?: ConfiguracionOption[];
  createMeta?: {
    categoria: string;
    tipoDato: ConfiguracionDataType;
    esPublico: boolean;
    descripcion?: string;
  };
  formatValue?: (value: ConfiguracionFieldValue) => string;
}

export interface ConfiguracionLogoState {
  exists: boolean;
  url: string | null;
  isLoading: boolean;
  isUploading: boolean;
}

export interface ConfiguracionStats {
  categoriesVisible: number;
  editableCount: number;
  readonlyCount: number;
  pendingCount: number;
}

export interface ConfiguracionViewModel {
  values: Record<string, ConfiguracionFieldValue>;
  originalValues: Record<string, ConfiguracionFieldValue>;
  recordsByKey: Record<string, ConfiguracionSistema>;
  resolvedKeysByField: Record<string, string | null>;
}
