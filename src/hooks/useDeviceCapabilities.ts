/**
 * useDeviceCapabilities - Enhanced Device Detection & Adaptive UI Hook
 * 
 * Features:
 * - Camera capability detection (front/back, resolution)
 * - Network quality detection
 * - Touch vs Mouse input detection
 * - Screen orientation handling
 * - Media codec support detection
 * - Battery status awareness
 * - Memory/CPU constraints
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface CameraCapabilities {
  hasFrontCamera: boolean;
  hasBackCamera: boolean;
  maxResolution: { width: number; height: number };
  supportsHD: boolean;
  supports4K: boolean;
  facingMode: 'user' | 'environment' | null;
}

export interface NetworkCapabilities {
  type: 'wifi' | 'cellular' | '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  effectiveType: string;
  downlink: number; // Mbps
  rtt: number; // Round trip time in ms
  isOnline: boolean;
  isSlow: boolean;
  recommendedQuality: 'low' | 'medium' | 'high' | '4k';
}

export interface InputCapabilities {
  hasTouchScreen: boolean;
  hasMousePointer: boolean;
  hasKeyboard: boolean;
  primaryInput: 'touch' | 'mouse' | 'keyboard';
  supportsHover: boolean;
}

export interface ScreenCapabilities {
  orientation: 'portrait' | 'landscape';
  width: number;
  height: number;
  devicePixelRatio: number;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  isRetina: boolean;
}

export interface MediaCodecSupport {
  webm: boolean;
  mp4: boolean;
  h264: boolean;
  vp8: boolean;
  vp9: boolean;
  av1: boolean;
  opus: boolean;
  aac: boolean;
  preferredVideoCodec: string;
  preferredAudioCodec: string;
}

export interface BatteryStatus {
  isCharging: boolean;
  level: number; // 0-1
  chargingTime: number;
  dischargingTime: number;
  isLowBattery: boolean;
  shouldReduceQuality: boolean;
}

export interface PerformanceCapabilities {
  deviceMemory: number; // GB
  hardwareConcurrency: number; // CPU cores
  isLowEndDevice: boolean;
  isMidRangeDevice: boolean;
  isHighEndDevice: boolean;
  recommendedBlurEnabled: boolean;
  recommendedPipEnabled: boolean;
}

export interface DeviceCapabilities {
  camera: CameraCapabilities;
  network: NetworkCapabilities;
  input: InputCapabilities;
  screen: ScreenCapabilities;
  codecs: MediaCodecSupport;
  battery: BatteryStatus;
  performance: PerformanceCapabilities;
  isCapable: boolean;
  recommendedSettings: {
    videoQuality: 'low' | 'medium' | 'high' | '4k';
    enableBackgroundBlur: boolean;
    enablePiP: boolean;
    teleprompterFontSize: 'small' | 'medium' | 'large';
    useSimplifiedUI: boolean;
    enableKeyboardShortcuts: boolean;
  };
}

interface UseDeviceCapabilitiesOptions {
  detectCamera?: boolean;
  detectNetwork?: boolean;
  detectBattery?: boolean;
}

export function useDeviceCapabilities(options: UseDeviceCapabilitiesOptions = {}): DeviceCapabilities {
  const { detectCamera = true, detectNetwork = true, detectBattery = true } = options;

  // Camera capabilities
  const [camera, setCamera] = useState<CameraCapabilities>({
    hasFrontCamera: false,
    hasBackCamera: false,
    maxResolution: { width: 1920, height: 1080 },
    supportsHD: true,
    supports4K: false,
    facingMode: null,
  });

  // Network capabilities
  const [network, setNetwork] = useState<NetworkCapabilities>({
    type: 'unknown',
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    isOnline: true,
    isSlow: false,
    recommendedQuality: 'high',
  });

  // Battery status
  const [battery, setBattery] = useState<BatteryStatus>({
    isCharging: true,
    level: 1,
    chargingTime: 0,
    dischargingTime: Infinity,
    isLowBattery: false,
    shouldReduceQuality: false,
  });

  // Screen capabilities
  const [screen, setScreen] = useState<ScreenCapabilities>(() => ({
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    isSmallScreen: window.innerWidth < 640,
    isMediumScreen: window.innerWidth >= 640 && window.innerWidth < 1024,
    isLargeScreen: window.innerWidth >= 1024,
    isRetina: window.devicePixelRatio >= 2,
  }));

  // Input capabilities
  const input = useMemo<InputCapabilities>(() => {
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasMousePointer = window.matchMedia('(pointer: fine)').matches;
    const hasKeyboard = !hasTouchScreen || hasMousePointer;
    const supportsHover = window.matchMedia('(hover: hover)').matches;

    return {
      hasTouchScreen,
      hasMousePointer,
      hasKeyboard,
      primaryInput: hasTouchScreen && !hasMousePointer ? 'touch' : hasMousePointer ? 'mouse' : 'keyboard',
      supportsHover,
    };
  }, []);

  // Media codec support
  const codecs = useMemo<MediaCodecSupport>(() => {
    const checkCodec = (mimeType: string): boolean => {
      if (typeof MediaRecorder !== 'undefined') {
        return MediaRecorder.isTypeSupported(mimeType);
      }
      return false;
    };

    const webm = checkCodec('video/webm');
    const mp4 = checkCodec('video/mp4');
    const h264 = checkCodec('video/webm;codecs=h264') || checkCodec('video/mp4;codecs=avc1');
    const vp8 = checkCodec('video/webm;codecs=vp8');
    const vp9 = checkCodec('video/webm;codecs=vp9');
    const av1 = checkCodec('video/webm;codecs=av1');
    const opus = checkCodec('audio/webm;codecs=opus');
    const aac = checkCodec('audio/mp4;codecs=mp4a.40.2');

    // Prefer VP9 > H264 > VP8
    let preferredVideoCodec = 'video/webm';
    if (vp9) preferredVideoCodec = 'video/webm;codecs=vp9';
    else if (h264) preferredVideoCodec = 'video/webm;codecs=h264';
    else if (vp8) preferredVideoCodec = 'video/webm;codecs=vp8';

    // Prefer Opus > AAC
    const preferredAudioCodec = opus ? 'audio/webm;codecs=opus' : 'audio/mp4;codecs=mp4a.40.2';

    return {
      webm,
      mp4,
      h264,
      vp8,
      vp9,
      av1,
      opus,
      aac,
      preferredVideoCodec,
      preferredAudioCodec,
    };
  }, []);

  // Performance capabilities
  const performance = useMemo<PerformanceCapabilities>(() => {
    const deviceMemory = (navigator as any).deviceMemory || 4;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;

    const isLowEndDevice = deviceMemory <= 2 || hardwareConcurrency <= 2;
    const isHighEndDevice = deviceMemory >= 8 && hardwareConcurrency >= 8;
    const isMidRangeDevice = !isLowEndDevice && !isHighEndDevice;

    return {
      deviceMemory,
      hardwareConcurrency,
      isLowEndDevice,
      isMidRangeDevice,
      isHighEndDevice,
      recommendedBlurEnabled: !isLowEndDevice,
      recommendedPipEnabled: !isLowEndDevice,
    };
  }, []);

  // Detect camera capabilities
  const detectCameraCapabilities = useCallback(async () => {
    if (!detectCamera || !navigator.mediaDevices?.enumerateDevices) return;

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');

      const hasFrontCamera = videoDevices.some(d => 
        d.label.toLowerCase().includes('front') || 
        d.label.toLowerCase().includes('user') ||
        d.label.toLowerCase().includes('facetime')
      );
      const hasBackCamera = videoDevices.some(d => 
        d.label.toLowerCase().includes('back') || 
        d.label.toLowerCase().includes('environment')
      );

      // Try to get max resolution
      let maxResolution = { width: 1920, height: 1080 };
      let supports4K = false;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 3840 }, height: { ideal: 2160 } }
        });
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        maxResolution = { width: settings.width || 1920, height: settings.height || 1080 };
        supports4K = maxResolution.width >= 3840;
        stream.getTracks().forEach(t => t.stop());
      } catch {
        // Use defaults
      }

      setCamera({
        hasFrontCamera: hasFrontCamera || videoDevices.length > 0,
        hasBackCamera,
        maxResolution,
        supportsHD: maxResolution.width >= 1280,
        supports4K,
        facingMode: hasFrontCamera ? 'user' : hasBackCamera ? 'environment' : null,
      });
    } catch (err) {
      console.warn('[useDeviceCapabilities] Camera detection failed:', err);
    }
  }, [detectCamera]);

  // Detect network capabilities
  const detectNetworkCapabilities = useCallback(() => {
    if (!detectNetwork) return;

    const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;

    if (connection) {
      const effectiveType = connection.effectiveType || '4g';
      const downlink = connection.downlink || 10;
      const rtt = connection.rtt || 50;
      const isSlow = effectiveType === '2g' || effectiveType === 'slow-2g' || downlink < 1;

      let recommendedQuality: 'low' | 'medium' | 'high' | '4k' = 'high';
      if (isSlow || downlink < 1) recommendedQuality = 'low';
      else if (downlink < 5) recommendedQuality = 'medium';
      else if (downlink >= 25) recommendedQuality = '4k';

      setNetwork({
        type: connection.type || 'unknown',
        effectiveType,
        downlink,
        rtt,
        isOnline: navigator.onLine,
        isSlow,
        recommendedQuality,
      });
    }
  }, [detectNetwork]);

  // Detect battery status
  const detectBatteryStatus = useCallback(async () => {
    if (!detectBattery) return;

    try {
      const batteryApi = await (navigator as any).getBattery?.();
      if (batteryApi) {
        const updateBattery = () => {
          const isLowBattery = batteryApi.level < 0.2 && !batteryApi.charging;
          setBattery({
            isCharging: batteryApi.charging,
            level: batteryApi.level,
            chargingTime: batteryApi.chargingTime,
            dischargingTime: batteryApi.dischargingTime,
            isLowBattery,
            shouldReduceQuality: isLowBattery,
          });
        };

        updateBattery();
        batteryApi.addEventListener('chargingchange', updateBattery);
        batteryApi.addEventListener('levelchange', updateBattery);
      }
    } catch {
      // Battery API not supported
    }
  }, [detectBattery]);

  // Screen resize handler
  useEffect(() => {
    const handleResize = () => {
      setScreen({
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
        isSmallScreen: window.innerWidth < 640,
        isMediumScreen: window.innerWidth >= 640 && window.innerWidth < 1024,
        isLargeScreen: window.innerWidth >= 1024,
        isRetina: window.devicePixelRatio >= 2,
      });
    };

    const handleOrientationChange = () => {
      setTimeout(handleResize, 100); // Delay for accurate dimensions
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Network change handler
  useEffect(() => {
    if (!detectNetwork) return;

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', detectNetworkCapabilities);
      return () => connection.removeEventListener('change', detectNetworkCapabilities);
    }

    // Fallback: online/offline events
    window.addEventListener('online', detectNetworkCapabilities);
    window.addEventListener('offline', detectNetworkCapabilities);
    return () => {
      window.removeEventListener('online', detectNetworkCapabilities);
      window.removeEventListener('offline', detectNetworkCapabilities);
    };
  }, [detectNetwork, detectNetworkCapabilities]);

  // Initial detection
  useEffect(() => {
    detectCameraCapabilities();
    detectNetworkCapabilities();
    detectBatteryStatus();
  }, [detectCameraCapabilities, detectNetworkCapabilities, detectBatteryStatus]);

  // Calculate recommended settings
  const recommendedSettings = useMemo(() => {
    const isLowEnd = performance.isLowEndDevice || battery.shouldReduceQuality || network.isSlow;
    const isMobile = screen.isSmallScreen || input.primaryInput === 'touch';

    let videoQuality: 'low' | 'medium' | 'high' | '4k' = 'high';
    if (isLowEnd || network.recommendedQuality === 'low') videoQuality = 'low';
    else if (network.recommendedQuality === 'medium') videoQuality = 'medium';
    else if (camera.supports4K && network.recommendedQuality === '4k' && performance.isHighEndDevice) videoQuality = '4k';

    return {
      videoQuality,
      enableBackgroundBlur: performance.recommendedBlurEnabled && !battery.shouldReduceQuality,
      enablePiP: performance.recommendedPipEnabled && screen.isLargeScreen,
      teleprompterFontSize: isMobile ? 'large' : 'medium' as 'small' | 'medium' | 'large',
      useSimplifiedUI: isMobile || isLowEnd,
      enableKeyboardShortcuts: input.hasKeyboard && !isMobile,
    };
  }, [performance, battery, network, screen, input, camera]);

  // Overall capability check
  const isCapable = useMemo(() => {
    return codecs.webm && network.isOnline;
  }, [codecs, network]);

  return {
    camera,
    network,
    input,
    screen,
    codecs,
    battery,
    performance,
    isCapable,
    recommendedSettings,
  };
}

export default useDeviceCapabilities;
