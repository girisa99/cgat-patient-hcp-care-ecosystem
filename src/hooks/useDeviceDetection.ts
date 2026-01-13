/**
 * useDeviceDetection - Comprehensive device detection for Meeting Intelligence
 * 
 * Detects device type, capabilities, and optimizes meeting experience accordingly
 */

import { useState, useEffect, useCallback } from 'react';

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown';
  isTouchDevice: boolean;
  hasCamera: boolean;
  hasMicrophone: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  isOnline: boolean;
  connectionType: 'wifi' | 'cellular' | '4g' | '3g' | '2g' | 'unknown';
  supportsWebRTC: boolean;
  supportsMediaRecorder: boolean;
  supportsSpeechRecognition: boolean;
}

export interface UseDeviceDetectionReturn {
  device: DeviceInfo;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  canRecordAudio: boolean;
  canRecordVideo: boolean;
  canDoLiveTranscription: boolean;
  refreshDeviceInfo: () => void;
  requestMediaPermissions: () => Promise<{ audio: boolean; video: boolean }>;
}

export function useDeviceDetection(): UseDeviceDetectionReturn {
  const [device, setDevice] = useState<DeviceInfo>(() => getInitialDeviceInfo());

  const getDeviceType = useCallback((): 'mobile' | 'tablet' | 'desktop' => {
    const ua = navigator.userAgent.toLowerCase();
    const width = window.innerWidth;
    
    // Check for mobile user agents
    const isMobileUA = /iphone|ipod|android.*mobile|webos|blackberry|opera mini|iemobile/i.test(ua);
    const isTabletUA = /ipad|android(?!.*mobile)|tablet/i.test(ua);
    
    if (isMobileUA || width < 768) return 'mobile';
    if (isTabletUA || (width >= 768 && width < 1024)) return 'tablet';
    return 'desktop';
  }, []);

  const getOS = useCallback((): DeviceInfo['os'] => {
    const ua = navigator.userAgent;
    const platform = (navigator as any).userAgentData?.platform || navigator.platform;
    
    if (/iPad|iPhone|iPod/.test(ua) || platform === 'iOS') return 'ios';
    if (/Android/.test(ua)) return 'android';
    if (/Win/.test(platform)) return 'windows';
    if (/Mac/.test(platform)) return 'macos';
    if (/Linux/.test(platform)) return 'linux';
    return 'unknown';
  }, []);

  const getBrowser = useCallback((): DeviceInfo['browser'] => {
    const ua = navigator.userAgent;
    
    if (/Edg\//.test(ua)) return 'edge';
    if (/Chrome/.test(ua) && !/Edg\//.test(ua)) return 'chrome';
    if (/Firefox/.test(ua)) return 'firefox';
    if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 'safari';
    return 'unknown';
  }, []);

  const getConnectionType = useCallback((): DeviceInfo['connectionType'] => {
    const connection = (navigator as any).connection;
    if (!connection) return 'unknown';
    
    const effectiveType = connection.effectiveType;
    if (effectiveType === '4g') return '4g';
    if (effectiveType === '3g') return '3g';
    if (effectiveType === '2g') return '2g';
    if (connection.type === 'wifi') return 'wifi';
    if (connection.type === 'cellular') return 'cellular';
    return 'unknown';
  }, []);

  const checkMediaDevices = useCallback(async (): Promise<{ hasCamera: boolean; hasMicrophone: boolean }> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return {
        hasCamera: devices.some(d => d.kind === 'videoinput'),
        hasMicrophone: devices.some(d => d.kind === 'audioinput'),
      };
    } catch {
      return { hasCamera: false, hasMicrophone: false };
    }
  }, []);

  const refreshDeviceInfo = useCallback(async () => {
    const { hasCamera, hasMicrophone } = await checkMediaDevices();
    
    setDevice({
      type: getDeviceType(),
      os: getOS(),
      browser: getBrowser(),
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      hasCamera,
      hasMicrophone,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      isOnline: navigator.onLine,
      connectionType: getConnectionType(),
      supportsWebRTC: !!(window.RTCPeerConnection || (window as any).webkitRTCPeerConnection),
      supportsMediaRecorder: typeof MediaRecorder !== 'undefined',
      supportsSpeechRecognition: !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
    });
  }, [getDeviceType, getOS, getBrowser, getConnectionType, checkMediaDevices]);

  const requestMediaPermissions = useCallback(async (): Promise<{ audio: boolean; video: boolean }> => {
    const result = { audio: false, video: false };
    
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream.getTracks().forEach(track => track.stop());
      result.audio = true;
    } catch {
      console.warn('[useDeviceDetection] Audio permission denied');
    }
    
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoStream.getTracks().forEach(track => track.stop());
      result.video = true;
    } catch {
      console.warn('[useDeviceDetection] Video permission denied');
    }
    
    await refreshDeviceInfo();
    return result;
  }, [refreshDeviceInfo]);

  // Initialize and set up listeners
  useEffect(() => {
    refreshDeviceInfo();

    const handleResize = () => {
      setDevice(prev => ({
        ...prev,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
        type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
      }));
    };

    const handleOnline = () => setDevice(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setDevice(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshDeviceInfo]);

  return {
    device,
    isMobile: device.type === 'mobile',
    isTablet: device.type === 'tablet',
    isDesktop: device.type === 'desktop',
    canRecordAudio: device.hasMicrophone && device.supportsMediaRecorder,
    canRecordVideo: device.hasCamera && device.supportsMediaRecorder,
    canDoLiveTranscription: device.hasMicrophone && (device.supportsWebRTC || device.supportsSpeechRecognition),
    refreshDeviceInfo,
    requestMediaPermissions,
  };
}

function getInitialDeviceInfo(): DeviceInfo {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const height = typeof window !== 'undefined' ? window.innerHeight : 1080;
  
  return {
    type: width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop',
    os: 'unknown',
    browser: 'unknown',
    isTouchDevice: false,
    hasCamera: false,
    hasMicrophone: false,
    screenWidth: width,
    screenHeight: height,
    orientation: height > width ? 'portrait' : 'landscape',
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    connectionType: 'unknown',
    supportsWebRTC: false,
    supportsMediaRecorder: false,
    supportsSpeechRecognition: false,
  };
}

export default useDeviceDetection;
