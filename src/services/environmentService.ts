/**
 * Environment Detection Service
 * Provides environment-aware logic for Dev, UAT, and Production subdomains
 * 
 * Deployment Strategy:
 * - Development: geniestudiodev.genieaisuite.com
 * - UAT (Netlify): geniestudiouat.genieaisuite.com  
 * - Production: www.genieaisuite.com
 */

export type Environment = 'development' | 'uat' | 'production' | 'local';

export interface EnvironmentConfig {
  environment: Environment;
  subdomain: string;
  displayName: string;
  apiEndpoint: string;
  isProduction: boolean;
  debugMode: boolean;
  featureFlags: {
    enableDevTools: boolean;
    enableVerboseLogging: boolean;
    enableTestMode: boolean;
    enableBetaFeatures: boolean;
    enableMaintenanceMode: boolean;
  };
}

// Domain mappings for environment detection
const ENVIRONMENT_DOMAINS: Record<string, Environment> = {
  'geniestudiodev.genieaisuite.com': 'development',
  'geniestudiouat.genieaisuite.com': 'uat',
  'www.genieaisuite.com': 'production',
  'genieaisuite.com': 'production',
  'localhost': 'local',
  '127.0.0.1': 'local',
};

// Lovable preview domains are treated as development
const LOVABLE_PREVIEW_PATTERN = /\.lovable\.app$/;
const LOVABLE_PROJECT_PATTERN = /\.lovableproject\.com$/;
// Vercel preview domains are treated as development
const VERCEL_PREVIEW_PATTERN = /\.vercel\.app$/;

class EnvironmentService {
  private cachedConfig: EnvironmentConfig | null = null;

  /**
   * Detect current environment from hostname
   */
  detectEnvironment(): Environment {
    if (typeof window === 'undefined') {
      return 'local';
    }

    const hostname = window.location.hostname.toLowerCase();
    
    // Check exact domain matches
    if (ENVIRONMENT_DOMAINS[hostname]) {
      return ENVIRONMENT_DOMAINS[hostname];
    }

    // Check for Lovable and Vercel preview URLs
    if (LOVABLE_PREVIEW_PATTERN.test(hostname) || LOVABLE_PROJECT_PATTERN.test(hostname) || VERCEL_PREVIEW_PATTERN.test(hostname)) {
      return 'development';
    }

    // Check for localhost variations
    if (hostname.includes('localhost') || hostname.startsWith('127.') || hostname.startsWith('192.168.')) {
      return 'local';
    }

    // Default to production for unknown domains (safety)
    console.warn(`[EnvironmentService] Unknown hostname: ${hostname}, defaulting to production`);
    return 'production';
  }

  /**
   * Get full environment configuration
   */
  getConfig(): EnvironmentConfig {
    if (this.cachedConfig) {
      return this.cachedConfig;
    }

    const environment = this.detectEnvironment();
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

    const configs: Record<Environment, Omit<EnvironmentConfig, 'environment'>> = {
      local: {
        subdomain: 'localhost',
        displayName: 'Local Development',
        apiEndpoint: window?.location?.origin || 'http://localhost:8080',
        isProduction: false,
        debugMode: true,
        featureFlags: {
          enableDevTools: true,
          enableVerboseLogging: true,
          enableTestMode: true,
          enableBetaFeatures: true,
          enableMaintenanceMode: false,
        },
      },
      development: {
        subdomain: 'geniestudiodev',
        displayName: 'Development',
        apiEndpoint: 'https://geniestudiodev.genieaisuite.com',
        isProduction: false,
        debugMode: true,
        featureFlags: {
          enableDevTools: true,
          enableVerboseLogging: true,
          enableTestMode: true,
          enableBetaFeatures: true,
          enableMaintenanceMode: false,
        },
      },
      uat: {
        subdomain: 'geniestudiouat',
        displayName: 'UAT (Testing)',
        apiEndpoint: 'https://geniestudiouat.genieaisuite.com',
        isProduction: false,
        debugMode: false,
        featureFlags: {
          enableDevTools: true,
          enableVerboseLogging: false,
          enableTestMode: true,
          enableBetaFeatures: true,
          enableMaintenanceMode: false,
        },
      },
      production: {
        subdomain: 'www',
        displayName: 'Production',
        apiEndpoint: 'https://www.genieaisuite.com',
        isProduction: true,
        debugMode: false,
        featureFlags: {
          enableDevTools: false,
          enableVerboseLogging: false,
          enableTestMode: false,
          enableBetaFeatures: false,
          enableMaintenanceMode: false,
        },
      },
    };

    this.cachedConfig = {
      environment,
      ...configs[environment],
    };

    return this.cachedConfig;
  }

  /**
   * Get current environment name
   */
  getCurrentEnvironment(): Environment {
    return this.detectEnvironment();
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.getConfig().isProduction;
  }

  /**
   * Check if running in development (local or dev subdomain)
   */
  isDevelopment(): boolean {
    const env = this.detectEnvironment();
    return env === 'local' || env === 'development';
  }

  /**
   * Check if running in UAT
   */
  isUAT(): boolean {
    return this.detectEnvironment() === 'uat';
  }

  /**
   * Get auth redirect URL (uses window.location.origin for flexibility)
   */
  getAuthRedirectUrl(): string {
    if (typeof window === 'undefined') {
      return 'http://localhost:8080/';
    }
    return `${window.location.origin}/`;
  }

  /**
   * Get allowed redirect URLs for Supabase auth configuration
   */
  getAllowedRedirectUrls(): string[] {
    return [
      'http://localhost:8080',
      'http://localhost:3000',
      'https://geniestudiodev.genieaisuite.com',
      'https://geniestudiouat.genieaisuite.com',
      'https://www.genieaisuite.com',
      'https://genieaisuite.com',
      // Lovable preview URLs
      'https://*.lovable.app',
      'https://*.lovableproject.com',
      // Vercel preview URLs
      'https://*.vercel.app',
    ];
  }

  /**
   * Check if a feature flag is enabled
   */
  isFeatureEnabled(flag: keyof EnvironmentConfig['featureFlags']): boolean {
    return this.getConfig().featureFlags[flag];
  }

  /**
   * Log with environment context (respects debug mode)
   */
  log(message: string, data?: unknown): void {
    const config = this.getConfig();
    if (config.debugMode || config.featureFlags.enableVerboseLogging) {
      console.log(`[${config.displayName}] ${message}`, data ?? '');
    }
  }

  /**
   * Get environment badge info for UI display
   */
  getEnvironmentBadge(): { label: string; color: string; show: boolean } {
    const env = this.detectEnvironment();
    
    switch (env) {
      case 'local':
        return { label: 'LOCAL', color: 'bg-yellow-500', show: true };
      case 'development':
        return { label: 'DEV', color: 'bg-blue-500', show: true };
      case 'uat':
        return { label: 'UAT', color: 'bg-orange-500', show: true };
      case 'production':
        return { label: '', color: '', show: false }; // Hide in production
    }
  }

  /**
   * Get deployment tracking info for fix deployments
   */
  getDeploymentTrackingEnvironment(): 'dev' | 'uat' | 'main' | 'production' {
    const env = this.detectEnvironment();
    switch (env) {
      case 'local':
      case 'development':
        return 'dev';
      case 'uat':
        return 'uat';
      case 'production':
        return 'production';
    }
  }
}

export const environmentService = new EnvironmentService();

// Export convenience functions
export const isProduction = () => environmentService.isProduction();
export const isDevelopment = () => environmentService.isDevelopment();
export const isUAT = () => environmentService.isUAT();
export const getEnvironment = () => environmentService.getCurrentEnvironment();
export const getAuthRedirectUrl = () => environmentService.getAuthRedirectUrl();
