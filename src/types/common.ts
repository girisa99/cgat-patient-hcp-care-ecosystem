import { ReactNode, FormEvent, MouseEvent, ChangeEvent } from 'react';

// Common Utility Types
export type ID = string;
export type Timestamp = string; // ISO 8601 format
export type DateString = string; // YYYY-MM-DD format
export type EmailAddress = string;
export type PhoneNumber = string;
export type URL = string;

// Generic Data Types
export interface BaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NamedEntity extends BaseEntity {
  name: string;
  description?: string;
}

export interface StatusEntity extends BaseEntity {
  status: 'active' | 'inactive' | 'pending' | 'archived';
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  meta: PaginationMeta;
}

// Filter and Search Types
export interface SearchParams {
  query?: string;
  filters?: Record<string, unknown>;
  dateRange?: DateRange;
}

export interface DateRange {
  start: DateString;
  end: DateString;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  defaultValue?: unknown;
  validation?: ValidationRule[];
  options?: FormOption[];
}

export type FormFieldType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'textarea'
  | 'file'
  | 'tel'
  | 'url';

export interface FormOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  value?: unknown;
  message: string;
}

export interface FormState<T = Record<string, unknown>> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
}

// React Component Types
export interface BaseProps {
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

export interface ComponentWithId extends BaseProps {
  id?: string;
}

export interface LoadingProps {
  isLoading?: boolean;
  loadingText?: string;
}

export interface ErrorProps {
  error?: string | null;
  onRetry?: () => void;
}

export interface DataProps<T> extends LoadingProps, ErrorProps {
  data?: T;
}

// Event Handler Types
export type ClickHandler = (event: MouseEvent<HTMLElement>) => void;
export type SubmitHandler = (event: FormEvent<HTMLFormElement>) => void;
export type ChangeHandler = (event: ChangeEvent<HTMLInputElement>) => void;
export type SelectChangeHandler = (value: string | string[]) => void;

// Async Operation Types
export interface AsyncOperation<T = unknown> {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: T;
  error?: string;
  lastUpdated?: Timestamp;
}

export interface AsyncState<T = unknown> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isError: boolean;
  isSuccess: boolean;
}

// File and Upload Types
export interface FileInfo {
  id: ID;
  name: string;
  size: number;
  type: string;
  url?: string;
  thumbnailUrl?: string;
  uploadedAt: Timestamp;
  uploadedBy: ID;
}

export interface UploadProgress {
  fileId: ID;
  progress: number; // 0-100
  status: 'uploading' | 'completed' | 'error' | 'cancelled';
  error?: string;
}

// Notification Types
export interface Notification {
  id: ID;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  isRead: boolean;
  createdAt: Timestamp;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

// Settings and Configuration Types
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  features: FeatureFlag[];
}

export interface FeatureFlag {
  name: string;
  isEnabled: boolean;
  description?: string;
  conditions?: Record<string, unknown>;
}

// Dialog and Modal Types
export interface DialogProps extends BaseProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
}

export interface ConfirmDialogProps extends DialogProps {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'danger';
}

// Table Types
export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  title: string;
  width?: string | number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction<T = Record<string, unknown>> {
  label: string;
  icon?: ReactNode;
  onClick: (record: T) => void;
  disabled?: (record: T) => boolean;
  visible?: (record: T) => boolean;
  variant?: 'default' | 'primary' | 'danger';
}

export interface TableProps<T = Record<string, unknown>> extends BaseProps {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  isLoading?: boolean;
  emptyText?: string;
  rowKey?: keyof T | ((record: T) => string);
}

// Chart and Analytics Types
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: 'line' | 'bar' | 'area' | 'pie';
}

export interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'number' | 'currency' | 'percentage';
  icon?: ReactNode;
  color?: string;
}

// Health Status Types
export interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  message?: string;
  lastChecked: Timestamp;
  details?: Record<string, unknown>;
}

export interface SystemHealth {
  overall: HealthStatus;
  services: Record<string, HealthStatus>;
  performance: PerformanceMetrics;
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
}

// Generic CRUD Operations
export interface CrudOperations<T, CreateT = Partial<T>, UpdateT = Partial<T>> {
  create: (data: CreateT) => Promise<T>;
  read: (id: ID) => Promise<T>;
  update: (id: ID, data: UpdateT) => Promise<T>;
  delete: (id: ID) => Promise<void>;
  list: (params?: SearchParams & PaginationParams) => Promise<PaginatedData<T>>;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Timestamp;
  stack?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Generic Response Wrapper
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface ErrorResponse {
  success: false;
  error: AppError;
  message: string;
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;