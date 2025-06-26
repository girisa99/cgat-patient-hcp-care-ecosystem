
/**
 * Mobile Features Hook
 * Provides mobile-specific functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { mobileAppManager, MobileCapabilities } from '@/utils/mobile/MobileAppManager';

export const useMobileFeatures = () => {
  const [capabilities, setCapabilities] = useState<MobileCapabilities>(() => 
    mobileAppManager.getCapabilities()
  );
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Update capabilities when they change
  useEffect(() => {
    const updateCapabilities = () => {
      setCapabilities(mobileAppManager.getCapabilities());
    };

    // Listen for capability changes
    window.addEventListener('mobile-capabilities-updated', updateCapabilities);
    
    return () => {
      window.removeEventListener('mobile-capabilities-updated', updateCapabilities);
    };
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = (event: CustomEvent) => {
      console.log('🔗 Deep link received:', event.detail);
      // Handle deep link navigation
    };

    window.addEventListener('deeplink', handleDeepLink);
    
    return () => {
      window.removeEventListener('deeplink', handleDeepLink);
    };
  }, []);

  const requestCameraPermission = useCallback(async () => {
    if (!capabilities.hasCamera) return false;
    
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  }, [capabilities.hasCamera]);

  const requestLocationPermission = useCallback(async () => {
    if (!capabilities.hasLocation) return false;
    
    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false)
      );
    });
  }, [capabilities.hasLocation]);

  const requestNotificationPermission = useCallback(async () => {
    if (!capabilities.hasNotifications) return false;
    
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Notification permission denied:', error);
      return false;
    }
  }, [capabilities.hasNotifications]);

  const showLocalNotification = useCallback((title: string, body: string) => {
    if (capabilities.hasNotifications && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }, [capabilities.hasNotifications]);

  const vibrate = useCallback((pattern: number | number[] = 200) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const shareContent = useCallback(async (data: { title?: string; text?: string; url?: string }) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Share failed:', error);
        return false;
      }
    }
    
    // Fallback to clipboard
    if (data.url && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(data.url);
        return true;
      } catch (error) {
        console.error('Clipboard write failed:', error);
        return false;
      }
    }
    
    return false;
  }, []);

  return {
    // Capabilities
    capabilities,
    isOnline,
    isNativeApp: capabilities.isNativeApp,
    platform: capabilities.platform,
    
    // Permissions
    requestCameraPermission,
    requestLocationPermission,
    requestNotificationPermission,
    
    // Native features
    showLocalNotification,
    vibrate,
    shareContent,
    
    // Feature checks
    hasCamera: capabilities.hasCamera,
    hasLocation: capabilities.hasLocation,
    hasNotifications: capabilities.hasNotifications,
    hasBiometrics: capabilities.hasBiometrics
  };
};
