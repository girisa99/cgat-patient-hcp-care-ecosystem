// User Base Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatar?: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  preferences?: UserPreferences;
  lastLoginAt?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface UserProfile extends User {
  facilityId?: string;
  facility?: Facility;
  permissions: Permission[];
  modules: UserModule[];
  settings: UserSettings;
}

// User Role Types
export type UserRole = 
  | 'admin'
  | 'hcp'
  | 'patient'
  | 'facility_admin'
  | 'system_admin'
  | 'developer'
  | 'viewer';

export type UserStatus = 
  | 'active'
  | 'inactive'
  | 'pending'
  | 'suspended'
  | 'archived';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, unknown>;
}

export interface UserModule {
  id: string;
  moduleId: string;
  name: string;
  isEnabled: boolean;
  permissions: string[];
  settings?: Record<string, unknown>;
}

// Authentication Types
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  lastLoginAt?: string;
  sessionId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  facilityId?: string;
  acceptTerms: boolean;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  issuedAt: string;
  lastActivity: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Password and Security Types
export interface PasswordResetRequest {
  email: string;
  redirectUrl?: string;
}

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TwoFactorSetup {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  code: string;
  type: 'totp' | 'sms' | 'backup';
}

// User Preferences and Settings
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  accessibility?: AccessibilitySettings;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  types: NotificationType[];
}

export type NotificationType = 
  | 'security'
  | 'updates'
  | 'appointments'
  | 'reminders'
  | 'marketing';

export interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  screenReader: boolean;
  motionReduced: boolean;
}

export interface UserSettings {
  dashboard: DashboardSettings;
  privacy: PrivacySettings;
  integrations: IntegrationSettings;
}

export interface DashboardSettings {
  layout: 'compact' | 'comfortable' | 'spacious';
  widgets: DashboardWidget[];
  defaultView: string;
  refreshInterval: number;
}

export interface DashboardWidget {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  settings: Record<string, unknown>;
  isVisible: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts';
  activityTracking: boolean;
  dataSharing: boolean;
  analyticsOptIn: boolean;
}

export interface IntegrationSettings {
  connectedApps: ConnectedApp[];
  apiKeys: ApiKeyInfo[];
  webhooks: WebhookConfig[];
}

export interface ConnectedApp {
  id: string;
  name: string;
  provider: string;
  status: 'connected' | 'disconnected' | 'error';
  permissions: string[];
  connectedAt: string;
  lastSync?: string;
}

export interface ApiKeyInfo {
  id: string;
  name: string;
  permissions: string[];
  lastUsed?: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret?: string;
}

// User Management Types
export interface UserListFilters {
  role?: UserRole;
  status?: UserStatus;
  facilityId?: string;
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface UserCreateRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  facilityId?: string;
  permissions?: string[];
  sendInvitation?: boolean;
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  facilityId?: string;
  permissions?: string[];
}

export interface BulkUserOperation {
  userIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'change_role' | 'assign_facility';
  data?: Record<string, unknown>;
}

// Facility Types (related to users)
export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  address?: Address;
  phone?: string;
  email?: string;
  website?: string;
  status: 'active' | 'inactive' | 'pending';
  settings?: FacilitySettings;
  createdAt: string;
  updatedAt: string;
}

export type FacilityType = 
  | 'hospital'
  | 'clinic'
  | 'pharmacy'
  | 'laboratory'
  | 'imaging_center'
  | 'specialist_office'
  | 'other';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface FacilitySettings {
  operatingHours: OperatingHours;
  services: string[];
  specialties: string[];
  insurance: string[];
  features: FacilityFeature[];
}

export interface OperatingHours {
  [day: string]: {
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
    breaks?: TimeSlot[];
  };
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface FacilityFeature {
  id: string;
  name: string;
  isEnabled: boolean;
  settings?: Record<string, unknown>;
}