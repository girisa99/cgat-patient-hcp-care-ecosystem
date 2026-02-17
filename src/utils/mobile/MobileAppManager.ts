/**
 * Mobile App Manager
 * Prepares the application for mobile deployment with Capacitor
 * Uses dynamic imports to avoid module resolution errors in web builds
 */

export interface MobileConfig {
  enableOfflineMode: boolean;
  enablePushNotifications: boolean;
  enableBiometricAuth: boolean;
  enableCameraAccess: boolean;
  enableLocationServices: boolean;
  enableBackgroundSync: boolean;
}

export interface MobileCapabilities {
  isNativeApp: boolean;
  platform: 'web' | 'ios' | 'android';
  hasCamera: boolean;
  hasLocation: boolean;
  hasBiometrics: boolean;
  hasNotifications: boolean;
}

class MobileAppManager {
  private config: MobileConfig = {
    enableOfflineMode: true,
    enablePushNotifications: true,
    enableBiometricAuth: true,
    enableCameraAccess: true,
    enableLocationServices: true,
    enableBackgroundSync: true
  };

  private capabilities: MobileCapabilities = {
    isNativeApp: false,
    platform: 'web',
    hasCamera: false,
    hasLocation: false,
    hasBiometrics: false,
    hasNotifications: false
  };

  private capacitorCore: any = null;
  private capacitorApp: any = null;
  private capacitorStatusBar: any = null;

  /**
   * Initialize mobile capabilities detection
   */
  async initialize() {
    console.log('📱 Initializing mobile app capabilities...');
    
    // Try to load Capacitor modules dynamically
    await this.loadCapacitorModules();
    await this.detectCapabilities();
    await this.setupMobileFeatures();
    
    console.log('✅ Mobile app manager initialized:', this.capabilities);
    
    // Dispatch event for components to react
    window.dispatchEvent(new CustomEvent('mobile-capabilities-updated', {
      detail: this.capabilities
    }));
  }

  /**
   * Dynamically load Capacitor modules (only works in native environment)
   */
  private async loadCapacitorModules() {
    try {
      // Try to dynamically import Capacitor core
      const capacitorCore = await import('@capacitor/core').catch(() => null);
      if (capacitorCore) {
        this.capacitorCore = capacitorCore;
        console.log('✅ Capacitor core loaded');
        
        // Only load other modules if we're in a native environment
        if (capacitorCore.Capacitor?.isNativePlatform?.()) {
          const [appModule, statusBarModule] = await Promise.all([
            import('@capacitor/app').catch(() => null),
            import('@capacitor/status-bar').catch(() => null)
          ]);
          
          this.capacitorApp = appModule;
          this.capacitorStatusBar = statusBarModule;
          console.log('✅ Capacitor native modules loaded');
        }
      }
    } catch (error) {
      console.log('📱 Running in web mode (Capacitor not available)');
    }
  }

  /**
   * Detect device capabilities using Capacitor
   */
  private async detectCapabilities() {
    // Detect if running in Capacitor native environment
    if (this.capacitorCore?.Capacitor) {
      this.capabilities.isNativeApp = this.capacitorCore.Capacitor.isNativePlatform();
      this.capabilities.platform = this.capacitorCore.Capacitor.getPlatform() as 'web' | 'ios' | 'android';
    } else {
      this.capabilities.isNativeApp = false;
      this.capabilities.platform = 'web';
    }

    // Detect camera
    this.capabilities.hasCamera = !!(navigator.mediaDevices?.getUserMedia);

    // Detect location services
    this.capabilities.hasLocation = !!navigator.geolocation;

    // Detect notification support
    this.capabilities.hasNotifications = 'Notification' in window;

    // Detect biometric support
    this.capabilities.hasBiometrics = this.capabilities.isNativeApp && 
      (this.capabilities.platform === 'ios' || this.capabilities.platform === 'android');

    console.log('📱 Detected capabilities:', this.capabilities);
  }

  /**
   * Setup mobile-specific features
   */
  private async setupMobileFeatures() {
    if (this.capabilities.isNativeApp) {
      await this.setupNativeFeatures();
    }

    // Setup responsive design adjustments
    this.setupResponsiveAdjustments();
  }

  /**
   * Setup native-specific features
   */
  private async setupNativeFeatures() {
    console.log('📱 Setting up native features...');

    // Setup Status Bar
    if (this.capacitorStatusBar?.StatusBar) {
      try {
        const { StatusBar, Style } = this.capacitorStatusBar;
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0f172a' });
        console.log('✅ Status bar configured');
      } catch (error) {
        console.warn('⚠️ Could not configure status bar:', error);
      }
    }

    // Setup app lifecycle listeners
    this.setupAppLifecycleListeners();

    // Setup deep link handling
    this.setupDeepLinkHandling();
  }

  /**
   * Setup app lifecycle listeners
   */
  private setupAppLifecycleListeners() {
    if (!this.capacitorApp?.App) return;
    
    const { App } = this.capacitorApp;
    
    App.addListener('appStateChange', ({ isActive }: { isActive: boolean }) => {
      console.log('📱 App state changed, active:', isActive);
      
      window.dispatchEvent(new CustomEvent('app-state-change', {
        detail: { isActive }
      }));
    });

    App.addListener('backButton', () => {
      console.log('📱 Back button pressed');
      
      window.dispatchEvent(new CustomEvent('native-back-button'));
    });

    App.addListener('appUrlOpen', ({ url }: { url: string }) => {
      console.log('🔗 App URL opened:', url);
      this.handleDeepLink(url);
    });
  }

  /**
   * Setup deep link handling
   */
  private setupDeepLinkHandling() {
    if (!this.capacitorApp?.App) return;
    
    const { App } = this.capacitorApp;
    
    // Handle initial deep link if app was opened via URL
    App.getLaunchUrl().then((result: { url?: string } | null) => {
      if (result?.url) {
        console.log('🔗 App launched with URL:', result.url);
        this.handleDeepLink(result.url);
      }
    });
  }

  /**
   * Setup offline mode with service worker
   */
  private async setupOfflineMode() {
    console.log('📱 Setting up offline mode...');
    
    if ('serviceWorker' in navigator) {
      try {
        console.log('✅ Offline mode prepared (service worker would be registered)');
      } catch (error) {
        console.warn('⚠️ Could not setup offline mode:', error);
      }
    }
  }

  /**
   * Setup responsive design adjustments for mobile
   */
  private setupResponsiveAdjustments() {
    console.log('📱 Setting up responsive design adjustments...');
    
    // Add mobile-specific CSS classes
    if (this.capabilities.isNativeApp) {
      document.body.classList.add('mobile-app');
      document.body.classList.add(`platform-${this.capabilities.platform}`);
    }

    // Setup viewport meta tag for mobile
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(viewport);
    }

    // Add safe area support for iOS
    if (this.capabilities.platform === 'ios') {
      document.body.classList.add('ios-safe-area');
      
      // Add CSS custom properties for safe areas
      document.documentElement.style.setProperty(
        '--safe-area-inset-top',
        'env(safe-area-inset-top)'
      );
      document.documentElement.style.setProperty(
        '--safe-area-inset-bottom',
        'env(safe-area-inset-bottom)'
      );
    }

    // Prevent overscroll/bounce on iOS
    if (this.capabilities.isNativeApp) {
      document.body.style.overscrollBehavior = 'none';
    }
  }

  /**
   * Get current capabilities
   */
  getCapabilities(): MobileCapabilities {
    return { ...this.capabilities };
  }

  /**
   * Update mobile configuration
   */
  updateConfig(newConfig: Partial<MobileConfig>) {
    this.config = { ...this.config, ...newConfig };
    console.log('📱 Mobile config updated:', this.config);
  }

  /**
   * Check if feature is available
   */
  isFeatureAvailable(feature: keyof MobileCapabilities): boolean {
    return this.capabilities[feature] as boolean;
  }

  /**
   * Handle deep links (for mobile apps)
   */
  handleDeepLink(url: string) {
    console.log('🔗 Handling deep link:', url);
    
    try {
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname;
      
      // Dispatch custom event for deep link handling
      window.dispatchEvent(new CustomEvent('deeplink', {
        detail: { 
          path, 
          url,
          params: Object.fromEntries(parsedUrl.searchParams)
        }
      }));
    } catch (error) {
      console.error('Failed to parse deep link:', error);
    }
  }
}

// Global singleton instance
export const mobileAppManager = new MobileAppManager();

// Auto-initialize when the app loads
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      mobileAppManager.initialize();
    });
  } else {
    setTimeout(() => {
      mobileAppManager.initialize();
    }, 100);
  }
}
