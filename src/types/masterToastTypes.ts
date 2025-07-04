
/**
 * MASTER TOAST TYPE DEFINITIONS - SINGLE SOURCE OF TRUTH
 * Ensures all toast usage follows consistent TypeScript patterns
 * Version: master-toast-types-v1.0.0
 */

export interface MasterToastConfig {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export interface MasterToastReturn {
  id: string;
  dismiss: () => void;
  update: (config: Partial<MasterToastConfig>) => void;
}

export interface MasterToastMethods {
  showSuccess: (title: string, description?: string) => MasterToastReturn;
  showError: (title: string, description?: string) => MasterToastReturn;
  showInfo: (title: string, description?: string) => MasterToastReturn;
  dismiss: (toastId?: string) => void;
}

export interface MasterToastState {
  toasts: Array<{
    id: string;
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
    open: boolean;
  }>;
}

export type MasterToastValidator = {
  validateToastConfig: (config: MasterToastConfig) => boolean;
  ensureTypeCompliance: () => boolean;
  getComplianceScore: () => number;
};
