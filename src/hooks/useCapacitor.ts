/**
 * Capacitor Native Features Hook
 * Provides unified access to all native mobile capabilities
 */

import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
import { StatusBar, Style } from '@capacitor/status-bar';

export interface CapacitorState {
  isNative: boolean;
  platform: 'web' | 'ios' | 'android';
  isReady: boolean;
}

export interface UseCapacitorReturn {
  // State
  state: CapacitorState;
  
  // Camera
  takePhoto: () => Promise<string | null>;
  pickFromGallery: () => Promise<string | null>;
  
  // Location
  getCurrentPosition: () => Promise<Position | null>;
  watchPosition: (callback: (position: Position) => void) => Promise<string | null>;
  clearWatch: (watchId: string) => Promise<void>;
  
  // Haptics
  vibrate: (style?: 'light' | 'medium' | 'heavy') => Promise<void>;
  notificationHaptic: (type?: 'success' | 'warning' | 'error') => Promise<void>;
  
  // Push Notifications
  registerPush: () => Promise<string | null>;
  onPushReceived: (callback: (notification: PushNotificationSchema) => void) => void;
  
  // Status Bar
  setStatusBarStyle: (style: 'dark' | 'light') => Promise<void>;
  hideStatusBar: () => Promise<void>;
  showStatusBar: () => Promise<void>;
  
  // App Lifecycle
  onAppStateChange: (callback: (isActive: boolean) => void) => void;
  onBackButton: (callback: () => void) => void;
  exitApp: () => void;
}

export const useCapacitor = (): UseCapacitorReturn => {
  const [state, setState] = useState<CapacitorState>({
    isNative: Capacitor.isNativePlatform(),
    platform: Capacitor.getPlatform() as 'web' | 'ios' | 'android',
    isReady: false,
  });

  useEffect(() => {
    const initCapacitor = async () => {
      if (state.isNative) {
        console.log('📱 Initializing Capacitor on', state.platform);
        
        // Setup status bar for native apps
        try {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#0f172a' });
        } catch (e) {
          console.warn('StatusBar not available:', e);
        }
      }
      
      setState(prev => ({ ...prev, isReady: true }));
    };

    initCapacitor();
  }, [state.isNative, state.platform]);

  // Camera functions
  const takePhoto = useCallback(async (): Promise<string | null> => {
    try {
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
  const getCurrentPosition = useCallback(async (): Promise<Position | null> => {
    try {
      const permission = await Geolocation.checkPermissions();
      if (permission.location !== 'granted') {
        await Geolocation.requestPermissions();
      }

      return await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
    } catch (error) {
      console.error('Location error:', error);
      return null;
    }
  }, []);

  const watchPosition = useCallback(async (callback: (position: Position) => void): Promise<string | null> => {
    try {
      const watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true },
        (position, err) => {
          if (position) callback(position);
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
    await Geolocation.clearWatch({ id: watchId });
  }, []);

  // Haptics functions
  const vibrate = useCallback(async (style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> => {
    if (!state.isNative) return;
    
    const impactStyles: Record<string, ImpactStyle> = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    };

    await Haptics.impact({ style: impactStyles[style] });
  }, [state.isNative]);

  const notificationHaptic = useCallback(async (type: 'success' | 'warning' | 'error' = 'success'): Promise<void> => {
    if (!state.isNative) return;
    
    const notificationTypes: Record<string, NotificationType> = {
      success: NotificationType.Success,
      warning: NotificationType.Warning,
      error: NotificationType.Error,
    };

    await Haptics.notification({ type: notificationTypes[type] });
  }, [state.isNative]);

  // Push Notifications functions
  const registerPush = useCallback(async (): Promise<string | null> => {
    if (!state.isNative) {
      console.log('Push notifications only available on native');
      return null;
    }

    try {
      const permission = await PushNotifications.checkPermissions();
      if (permission.receive !== 'granted') {
        await PushNotifications.requestPermissions();
      }

      await PushNotifications.register();

      return new Promise((resolve) => {
        PushNotifications.addListener('registration', (token: Token) => {
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

  const onPushReceived = useCallback((callback: (notification: PushNotificationSchema) => void): void => {
    if (!state.isNative) return;

    PushNotifications.addListener('pushNotificationReceived', callback);
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      callback(action.notification);
    });
  }, [state.isNative]);

  // Status Bar functions
  const setStatusBarStyle = useCallback(async (style: 'dark' | 'light'): Promise<void> => {
    if (!state.isNative) return;
    await StatusBar.setStyle({ style: style === 'dark' ? Style.Dark : Style.Light });
  }, [state.isNative]);

  const hideStatusBar = useCallback(async (): Promise<void> => {
    if (!state.isNative) return;
    await StatusBar.hide();
  }, [state.isNative]);

  const showStatusBar = useCallback(async (): Promise<void> => {
    if (!state.isNative) return;
    await StatusBar.show();
  }, [state.isNative]);

  // App Lifecycle functions
  const onAppStateChange = useCallback((callback: (isActive: boolean) => void): void => {
    App.addListener('appStateChange', ({ isActive }) => {
      callback(isActive);
    });
  }, []);

  const onBackButton = useCallback((callback: () => void): void => {
    App.addListener('backButton', callback);
  }, []);

  const exitApp = useCallback((): void => {
    App.exitApp();
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
