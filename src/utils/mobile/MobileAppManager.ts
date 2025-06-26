
/**
 * Mobile App Manager
 * Prepares the application for mobile deployment with Capacitor
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

  /**
   * Initialize mobile capabilities detection
   */
  async initialize() {
    console.log('📱 Initializing mobile app capabilities...');
    
    await this.detectCapabilities();
    await this.setupMobileFeatures();
    
    console.log('✅ Mobile app manager initialized:', this.capabilities);
  }

  /**
   * Detect device capabilities
   */
  private async detectCapabilities() {
    // Detect if running in Capacitor
    this.capabilities.isNativeApp = !!(window as any).Capacitor;
    
    // Detect platform
    if (this.capabilities.isNativeApp) {
      const platform = (window as any).Capacitor?.getPlatform?.();
      this.capabilities.platform = platform || 'web';
    }

    // Detect camera
    this.capabilities.hasCamera = !!(navigator.mediaDevices?.getUserMedia);

    // Detect location services
    this.capabilities.hasLocation = !!navigator.geolocation;

    // Detect notification support
    this.capabilities.hasNotifications = 'Notification' in window;

    // Detect biometric support (simplified check)
    this.capabilities.hasBiometrics = this.capabilities.isNativeApp && 
      (this.capabilities.platform === 'ios' || this.capabilities.platform === 'android');
  }

  /**
   * Setup mobile-specific features
   */
  private async setupMobileFeatures() {
    if (this.config.enableOfflineMode) {
      await this.setupOfflineMode();
    }

    if (this.config.enablePushNotifications && this.capabilities.hasNotifications) {
      await this.setupPushNotifications();
    }

    if (this.config.enableBiometricAuth && this.capabilities.hasBiometrics) {
      await this.setupBiometricAuth();
    }

    // Setup responsive design adjustments
    this.setupResponsiveAdjustments();
  }

  /**
   * Setup offline mode with service worker
   */
  private async setupOfflineMode() {
    console.log('📱 Setting up offline mode...');
    
    if ('serviceWorker' in navigator) {
      try {
        // In a real implementation, you would register a service worker
        console.log('✅ Offline mode prepared (service worker would be registered)');
      } catch (error) {
        console.warn('⚠️ Could not setup offline mode:', error);
      }
    }
  }

  /**
   * Setup push notifications
   */
  private async setupPushNotifications() {
    console.log('📱 Setting up push notifications...');
    
    try {
      const permission = await Notification.requestPermission();
      console.log('🔔 Notification permission:', permission);
    } catch (error) {
      console.warn('⚠️ Could not setup push notifications:', error);
    }
  }

  /**
   * Setup biometric authentication
   */
  private async setupBiometricAuth() {
    console.log('📱 Setting up biometric authentication...');
    
    // This would integrate with Capacitor's biometric plugins
    // For now, just log the setup
    console.log('🔐 Biometric auth prepared for native apps');
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
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(viewport);
    }

    // Add safe area support for iOS
    if (this.capabilities.platform === 'ios') {
      document.body.classList.add('ios-safe-area');
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
    
    // Parse the deep link and navigate accordingly
    // This would integrate with your routing system
    const path = new URL(url).pathname;
    
    // Dispatch custom event for deep link handling
    window.dispatchEvent(new CustomEvent('deeplink', {
      detail: { path, url }
    }));
  }
}

// Global singleton instance
export const mobileAppManager = new MobileAppManager();

// Auto-initialize when the app loads
if (typeof window !== 'undefined') {
  setTimeout(() => {
    mobileAppManager.initialize();
  }, 500);
}
