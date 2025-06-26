
/**
 * White Label Manager
 * Automatically applies white-label customizations
 */

export interface WhiteLabelConfig {
  branding: {
    appName: string;
    logoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  customization: {
    headerText: string;
    footerText: string;
    loginMessage: string;
    customCSS: string;
    hideFeatures: string[];
  };
  domains: {
    allowedDomains: string[];
    customDomain?: string;
  };
  features: {
    enabledModules: string[];
    customModules: any[];
  };
}

class WhiteLabelManager {
  private config: WhiteLabelConfig = {
    branding: {
      appName: 'Healthcare Admin Portal',
      logoUrl: '',
      faviconUrl: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#1F2937',
      accentColor: '#10B981'
    },
    customization: {
      headerText: 'Healthcare Management System',
      footerText: 'Powered by Healthcare Solutions',
      loginMessage: 'Welcome to your healthcare portal',
      customCSS: '',
      hideFeatures: []
    },
    domains: {
      allowedDomains: []
    },
    features: {
      enabledModules: [],
      customModules: []
    }
  };

  /**
   * Initialize white label configuration
   */
  async initialize() {
    console.log('🎨 Initializing white label configuration...');
    
    await this.loadConfiguration();
    await this.applyBranding();
    await this.applyCustomization();
    
    console.log('✅ White label configuration applied');
  }

  /**
   * Load configuration from storage or API
   */
  private async loadConfiguration() {
    try {
      // Try to load from localStorage first
      const savedConfig = localStorage.getItem('whiteLabelConfig');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
        console.log('📋 Loaded white label config from storage');
        return;
      }

      // Try to load from API/database
      // In a real implementation, this would fetch from your backend
      console.log('📋 Using default white label configuration');
      
    } catch (error) {
      console.warn('⚠️ Could not load white label configuration:', error);
    }
  }

  /**
   * Apply branding customizations
   */
  private async applyBranding() {
    const { branding } = this.config;
    
    // Update page title
    if (branding.appName) {
      document.title = branding.appName;
    }

    // Update favicon
    if (branding.faviconUrl) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = branding.faviconUrl;
      }
    }

    // Apply CSS custom properties for colors
    const root = document.documentElement;
    if (branding.primaryColor) {
      root.style.setProperty('--primary-color', branding.primaryColor);
    }
    if (branding.secondaryColor) {
      root.style.setProperty('--secondary-color', branding.secondaryColor);
    }
    if (branding.accentColor) {
      root.style.setProperty('--accent-color', branding.accentColor);
    }

    console.log('🎨 Branding applied:', branding.appName);
  }

  /**
   * Apply custom styling and content
   */
  private async applyCustomization() {
    const { customization } = this.config;
    
    // Apply custom CSS
    if (customization.customCSS) {
      const styleElement = document.createElement('style');
      styleElement.textContent = customization.customCSS;
      document.head.appendChild(styleElement);
      console.log('🎨 Custom CSS applied');
    }

    // Hide features if specified
    if (customization.hideFeatures.length > 0) {
      customization.hideFeatures.forEach(feature => {
        const elements = document.querySelectorAll(`[data-feature="${feature}"]`);
        elements.forEach(el => {
          (el as HTMLElement).style.display = 'none';
        });
      });
    }

    console.log('✨ Customizations applied');
  }

  /**
   * Update white label configuration
   */
  updateConfiguration(newConfig: Partial<WhiteLabelConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    // Save to localStorage
    localStorage.setItem('whiteLabelConfig', JSON.stringify(this.config));
    
    // Reapply changes
    this.applyBranding();
    this.applyCustomization();
    
    console.log('🔄 White label configuration updated');
  }

  /**
   * Get current configuration
   */
  getConfiguration(): WhiteLabelConfig {
    return { ...this.config };
  }

  /**
   * Generate white label package for clients
   */
  generateWhiteLabelPackage(clientConfig: Partial<WhiteLabelConfig>) {
    const packageConfig = {
      ...this.config,
      ...clientConfig,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    console.log('📦 White label package generated for client');
    return packageConfig;
  }

  /**
   * Validate domain access
   */
  validateDomainAccess(domain: string): boolean {
    const { allowedDomains } = this.config.domains;
    
    if (allowedDomains.length === 0) {
      return true; // No restrictions
    }

    return allowedDomains.some(allowedDomain => 
      domain.includes(allowedDomain) || domain === allowedDomain
    );
  }

  /**
   * Get enabled modules based on white label config
   */
  getEnabledModules(): string[] {
    return this.config.features.enabledModules;
  }

  /**
   * Check if a feature is hidden
   */
  isFeatureHidden(featureName: string): boolean {
    return this.config.customization.hideFeatures.includes(featureName);
  }

  /**
   * Generate CSS variables for theme
   */
  generateThemeCSS(): string {
    const { branding } = this.config;
    
    return `
      :root {
        --primary-color: ${branding.primaryColor};
        --secondary-color: ${branding.secondaryColor};
        --accent-color: ${branding.accentColor};
        --app-name: "${branding.appName}";
      }
      
      .white-label-primary {
        background-color: var(--primary-color);
        color: white;
      }
      
      .white-label-secondary {
        background-color: var(--secondary-color);
        color: white;
      }
      
      .white-label-accent {
        background-color: var(--accent-color);
        color: white;
      }
      
      .white-label-text-primary {
        color: var(--primary-color);
      }
      
      .white-label-border-primary {
        border-color: var(--primary-color);
      }
    `;
  }
}

// Global singleton instance
export const whiteLabelManager = new WhiteLabelManager();

// Auto-initialize white label
if (typeof window !== 'undefined') {
  setTimeout(() => {
    whiteLabelManager.initialize();
  }, 500);
}
