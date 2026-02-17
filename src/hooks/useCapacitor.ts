/**
 * Capacitor Native Features Hook
 * Provides unified access to all native mobile capabilities
 * Uses dynamic imports to prevent build failures when running on web
 */

import { useState, useEffect, useCallback } from 'react';

export interface CapacitorState {
  isNative: boolean;
  platform: 'web' | 'ios' | 'android';
  isReady: boolean;
}

export interface PositionData {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

export interface PushNotificationData {
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
}

export interface UseCapacitorReturn {
  // State
  state: CapacitorState;
  
  // Camera
  takePhoto: () => Promise<string | null>;
  pickFromGallery: () => Promise<string | null>;
  
  // Location
  getCurrentPosition: () => Promise<PositionData | null>;
  watchPosition: (callback: (position: PositionData) => void) => Promise<string | null>;
  clearWatch: (watchId: string) => Promise<void>;
  
  // Haptics
  vibrate: (style?: 'light' | 'medium' | 'heavy') => Promise<void>;
  notificationHaptic: (type?: 'success' | 'warning' | 'error') => Promise<void>;
  
  // Push Notifications
  registerPush: () => Promise<string | null>;
  onPushReceived: (callback: (notification: PushNotificationData) => void) => void;
  
  // Status Bar
  setStatusBarStyle: (style: 'dark' | 'light') => Promise<void>;
  hideStatusBar: () => Promise<void>;
  showStatusBar: () => Promise<void>;
  
  // App Lifecycle
  onAppStateChange: (callback: (isActive: boolean) => void) => void;
  onBackButton: (callback: () => void) => void;
  exitApp: () => void;
}

// Helper to safely check if Capacitor is available
const getCapacitorInfo = async (): Promise<{ isNative: boolean; platform: 'web' | 'ios' | 'android' }> => {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return {
      isNative: Capacitor.isNativePlatform(),
      platform: Capacitor.getPlatform() as 'web' | 'ios' | 'android',
    };
  } catch {
    return { isNative: false, platform: 'web' };
  }
};

export const useCapacitor = (): UseCapacitorReturn => {
  const [state, setState] = useState<CapacitorState>({
    isNative: false,
    platform: 'web',
    isReady: false,
  });

  useEffect(() => {
    const initCapacitor = async () => {
      const { isNative, platform } = await getCapacitorInfo();
      
      setState(prev => ({ ...prev, isNative, platform }));
      
      if (isNative) {
        console.log('📱 Initializing Capacitor on', platform);
        
        // Setup status bar for native apps
        try {
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#0f172a' });
        } catch (e) {
          console.warn('StatusBar not available:', e);
        }
      }
      
      setState(prev => ({ ...prev, isReady: true }));
    };

    initCapacitor();
  }, []);

  // Camera functions
  const takePhoto = useCallback(async (): Promise<string | null> => {
    try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      
      const permission = await Camera.checkPermissions();
      if (permission.camera !== 'granted') {
        await Camera.requestPermissions();
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        correctOrientation: true,
      });

      return image.webPath || null;
    } catch (error) {
      console.error('Camera error:', error);
      return null;
    }
  }, []);

  const pickFromGallery = useCallback(async (): Promise<string | null> => {
    try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });

      return image.webPath || null;
    } catch (error) {
      console.error('Gallery error:', error);
      return null;
    }
  }, []);

  // Location functions
  const getCurrentPosition = useCallback(async (): Promise<PositionData | null> => {
    try {
      const { Geolocation } = await import('@capacitor/geolocation');
      
      const permission = await Geolocation.checkPermissions();
      if (permission.location !== 'granted') {
        await Geolocation.requestPermissions();
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      
      return position as PositionData;
    } catch (error) {
      console.error('Location error:', error);
      return null;
    }
  }, []);

  const watchPosition = useCallback(async (callback: (position: PositionData) => void): Promise<string | null> => {
    try {
      const { Geolocation } = await import('@capacitor/geolocation');
      
      const watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true },
        (position, err) => {
          if (position) callback(position as PositionData);
          if (err) console.error('Watch position error:', err);
        }
      );
      return watchId;
    } catch (error) {
      console.error('Watch position error:', error);
      return null;
    }
  }, []);

  const clearWatch = useCallback(async (watchId: string): Promise<void> => {
    try {
      const { Geolocation } = await import('@capacitor/geolocation');
      await Geolocation.clearWatch({ id: watchId });
    } catch (error) {
      console.error('Clear watch error:', error);
    }
  }, []);

  // Haptics functions
  const vibrate = useCallback(async (style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> => {
    if (!state.isNative) return;
    
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      
      const impactStyles: Record<string, typeof ImpactStyle[keyof typeof ImpactStyle]> = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      };

      await Haptics.impact({ style: impactStyles[style] });
    } catch (error) {
      console.error('Haptics error:', error);
    }
  }, [state.isNative]);

  const notificationHaptic = useCallback(async (type: 'success' | 'warning' | 'error' = 'success'): Promise<void> => {
    if (!state.isNative) return;
    
    try {
      const { Haptics, NotificationType } = await import('@capacitor/haptics');
      
      const notificationTypes: Record<string, typeof NotificationType[keyof typeof NotificationType]> = {
        success: NotificationType.Success,
        warning: NotificationType.Warning,
        error: NotificationType.Error,
      };

      await Haptics.notification({ type: notificationTypes[type] });
    } catch (error) {
      console.error('Notification haptic error:', error);
    }
  }, [state.isNative]);

  // Push Notifications functions
  const registerPush = useCallback(async (): Promise<string | null> => {
    if (!state.isNative) {
      console.log('Push notifications only available on native');
      return null;
    }

    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      
      const permission = await PushNotifications.checkPermissions();
      if (permission.receive !== 'granted') {
        await PushNotifications.requestPermissions();
      }

      await PushNotifications.register();

      return new Promise((resolve) => {
        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration token:', token.value);
          resolve(token.value);
        });

        PushNotifications.addListener('registrationError', (error) => {
          console.error('Push registration error:', error);
          resolve(null);
        });
      });
    } catch (error) {
      console.error('Push registration error:', error);
      return null;
    }
  }, [state.isNative]);

  const onPushReceived = useCallback((callback: (notification: PushNotificationData) => void): void => {
    if (!state.isNative) return;

    const setupListeners = async () => {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications');
        
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          callback(notification as PushNotificationData);
        });
        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          callback(action.notification as PushNotificationData);
        });
      } catch (error) {
        console.error('Push listener setup error:', error);
      }
    };
    
    setupListeners();
  }, [state.isNative]);

  // Status Bar functions
  const setStatusBarStyle = useCallback(async (style: 'dark' | 'light'): Promise<void> => {
    if (!state.isNative) return;
    
    try {
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      await StatusBar.setStyle({ style: style === 'dark' ? Style.Dark : Style.Light });
    } catch (error) {
      console.error('StatusBar style error:', error);
    }
  }, [state.isNative]);

  const hideStatusBar = useCallback(async (): Promise<void> => {
    if (!state.isNative) return;
    
    try {
      const { StatusBar } = await import('@capacitor/status-bar');
      await StatusBar.hide();
    } catch (error) {
      console.error('StatusBar hide error:', error);
    }
  }, [state.isNative]);

  const showStatusBar = useCallback(async (): Promise<void> => {
    if (!state.isNative) return;
    
    try {
      const { StatusBar } = await import('@capacitor/status-bar');
      await StatusBar.show();
    } catch (error) {
      console.error('StatusBar show error:', error);
    }
  }, [state.isNative]);

  // App Lifecycle functions
  const onAppStateChange = useCallback((callback: (isActive: boolean) => void): void => {
    const setupListener = async () => {
      try {
        const { App } = await import('@capacitor/app');
        App.addListener('appStateChange', ({ isActive }) => {
          callback(isActive);
        });
      } catch (error) {
        console.error('App state listener error:', error);
      }
    };
    
    setupListener();
  }, []);

  const onBackButton = useCallback((callback: () => void): void => {
    const setupListener = async () => {
      try {
        const { App } = await import('@capacitor/app');
        App.addListener('backButton', callback);
      } catch (error) {
        console.error('Back button listener error:', error);
      }
    };
    
    setupListener();
  }, []);

  const exitApp = useCallback((): void => {
    const doExit = async () => {
      try {
        const { App } = await import('@capacitor/app');
        App.exitApp();
      } catch (error) {
        console.error('Exit app error:', error);
      }
    };
    
    doExit();
  }, []);

  return {
    state,
    takePhoto,
    pickFromGallery,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    vibrate,
    notificationHaptic,
    registerPush,
    onPushReceived,
    setStatusBarStyle,
    hideStatusBar,
    showStatusBar,
    onAppStateChange,
    onBackButton,
    exitApp,
  };
};
