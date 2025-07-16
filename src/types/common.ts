/**
 * Common TypeScript interfaces and types
 * Replaces 'any' types with proper type definitions
 */

// Base data structure for entities with ID
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// Generic data row interface - extends Record to allow any additional properties
export interface DataRow {
  id: string;
  [key: string]: unknown;
}

// Import/Export data types
export interface ImportResult<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
  rowIndex?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ImportStats {
  totalImports: number;
  successfulImports: number;
  failedImports: number;
  lastImport?: ImportResult;
}

// User role data structure
export interface UserRole {
  roles?: {
    name: string;
    description?: string;
  };
}

// Bulk operation types
export interface BulkOperationResult<T = DataRow> {
  successful: T[];
  failed: Array<{ item: T; error: string }>;
  total: number;
}

// API response types
export interface ApiResponse<T = unknown> {
  data: T;
  error?: string;
  status: number;
}

// Search and filter types
export interface SearchConfig {
  term: string;
  fields?: string[];
  caseSensitive?: boolean;
}

export interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte';
  value: unknown;
}

// Pagination types
export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

// Sort configuration
export interface SortConfig {
  key: string;
  field: string;
  direction: 'asc' | 'desc';
}

// Table column configuration with proper typing
export interface TableColumn<T = DataRow> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

// Form field types
export interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea';
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: unknown) => string | null;
  };
}

// Audit and logging types
export interface AuditEntry {
  id: string;
  action: string;
  user_id?: string;
  timestamp: string;
  details: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

// Error handling types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Configuration types
export interface ModuleConfig {
  name: string;
  enabled: boolean;
  settings: Record<string, unknown>;
  permissions: string[];
}

export interface SystemConfig {
  modules: ModuleConfig[];
  features: Record<string, boolean>;
  limits: Record<string, number>;
}

// Generic utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Event types
export interface SystemEvent<T = Record<string, unknown>> {
  type: string;
  payload: T;
  timestamp: string;
  source: string;
}

// Generic callback types
export type AsyncCallback<T = void, P = unknown> = (params: P) => Promise<T>;
export type SyncCallback<T = void, P = unknown> = (params: P) => T;
export type VoidCallback = () => void;
export type EventHandler<T = Event> = (event: T) => void;