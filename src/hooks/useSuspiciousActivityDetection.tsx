/**
 * Suspicious Activity Detection Hook
 * 
 * Detects VPN/proxy usage, timezone mismatches, and other suspicious behaviors
 * that may indicate attempts to bypass geo-restrictions.
 */

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { BLOCKED_COUNTRY_CODES } from '@/services/sanctionsComplianceRegistry';

export interface SuspiciousActivityState {
  isLoading: boolean;
  isSuspicious: boolean;
  suspicionReasons: string[];
  riskScore: number; // 0-100
  browserTimezone: string | null;
  browserLanguages: string[];
  detectedVPN: boolean;
  timezoneCountryMismatch: boolean;
  multipleSessionsDetected: boolean;
  rapidLocationChanges: boolean;
}

export interface SuspiciousActivityContextType extends SuspiciousActivityState {
  recheckActivity: () => void;
}

const SuspiciousActivityContext = createContext<SuspiciousActivityContextType | undefined>(undefined);

// Timezones commonly associated with sanctioned countries
const SANCTIONED_TIMEZONES: Record<string, string[]> = {
  'RU': ['Europe/Moscow', 'Europe/Kaliningrad', 'Europe/Samara', 'Asia/Yekaterinburg', 'Asia/Omsk', 'Asia/Novosibirsk', 'Asia/Krasnoyarsk', 'Asia/Irkutsk', 'Asia/Yakutsk', 'Asia/Vladivostok', 'Asia/Magadan', 'Asia/Kamchatka'],
  'BY': ['Europe/Minsk'],
  'IR': ['Asia/Tehran'],
  'KP': ['Asia/Pyongyang'],
  'SY': ['Asia/Damascus'],
  'CU': ['America/Havana'],
};

// Language codes associated with sanctioned regions
const SANCTIONED_LANGUAGES: Record<string, string[]> = {
  'RU': ['ru', 'ru-RU'],
  'BY': ['be', 'be-BY', 'ru-BY'],
  'IR': ['fa', 'fa-IR'],
  'KP': ['ko-KP'],
  'SY': ['ar-SY'],
  'CU': ['es-CU'],
};

const SESSION_KEY = 'security_session_data';
const LOCATION_HISTORY_KEY = 'geo_location_history';

interface SessionData {
  sessionId: string;
  startTime: number;
  lastActive: number;
  countryCode: string | null;
}

interface LocationHistoryEntry {
  countryCode: string;
  timestamp: number;
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get browser timezone
 */
function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'Unknown';
  }
}

/**
 * Get browser languages
 */
function getBrowserLanguages(): string[] {
  try {
    return navigator.languages ? [...navigator.languages] : [navigator.language];
  } catch {
    return [];
  }
}

/**
 * Check if timezone matches any sanctioned country
 */
function getTimezoneCountry(timezone: string): string | null {
  for (const [country, timezones] of Object.entries(SANCTIONED_TIMEZONES)) {
    if (timezones.includes(timezone)) {
      return country;
    }
  }
  return null;
}

/**
 * Check if languages suggest sanctioned country
 */
function getLanguageCountry(languages: string[]): string | null {
  for (const lang of languages) {
    for (const [country, langCodes] of Object.entries(SANCTIONED_LANGUAGES)) {
      if (langCodes.some(code => lang.toLowerCase().startsWith(code.toLowerCase()))) {
        return country;
      }
    }
  }
  return null;
}

/**
 * Detect potential WebRTC leak indicators
 */
function detectWebRTCLeak(): boolean {
  try {
    // Check if WebRTC is being blocked (common VPN behavior)
    const RTCPeerConnection = window.RTCPeerConnection;
    if (!RTCPeerConnection) {
      return true; // WebRTC blocked, likely VPN
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Check for common VPN browser extensions or indicators
 */
function detectVPNIndicators(): boolean {
  try {
    // Check for common VPN-related modifications
    const navigatorPrototype = Object.getPrototypeOf(navigator);
    const hasModifiedNavigator = Object.getOwnPropertyNames(navigatorPrototype).length > 20;
    
    // Check for timezone offset inconsistencies
    const now = new Date();
    const jan = new Date(now.getFullYear(), 0, 1);
    const jul = new Date(now.getFullYear(), 6, 1);
    const dstOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    const currentOffset = now.getTimezoneOffset();
    
    // Extreme offset (might indicate proxy)
    if (Math.abs(currentOffset) > 720) {
      return true;
    }
    
    return hasModifiedNavigator;
  } catch {
    return false;
  }
}

/**
 * Track location changes and detect rapid changes
 */
function trackLocationChange(countryCode: string): { rapidChange: boolean; history: LocationHistoryEntry[] } {
  try {
    const historyStr = localStorage.getItem(LOCATION_HISTORY_KEY);
    let history: LocationHistoryEntry[] = historyStr ? JSON.parse(historyStr) : [];
    
    // Keep last 10 entries
    if (history.length >= 10) {
      history = history.slice(-9);
    }
    
    const now = Date.now();
    history.push({ countryCode, timestamp: now });
    
    localStorage.setItem(LOCATION_HISTORY_KEY, JSON.stringify(history));
    
    // Check for rapid location changes (different country within 1 hour)
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentEntries = history.filter(e => e.timestamp > oneHourAgo);
    const uniqueCountries = new Set(recentEntries.map(e => e.countryCode));
    
    return {
      rapidChange: uniqueCountries.size > 1,
      history
    };
  } catch {
    return { rapidChange: false, history: [] };
  }
}

/**
 * Check for multiple active sessions
 */
function checkMultipleSessions(): boolean {
  try {
    const sessionStr = sessionStorage.getItem(SESSION_KEY);
    const localSessionStr = localStorage.getItem(SESSION_KEY);
    
    if (!sessionStr) {
      const newSession: SessionData = {
        sessionId: generateSessionId(),
        startTime: Date.now(),
        lastActive: Date.now(),
        countryCode: null
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      return false;
    }
    
    const currentSession: SessionData = JSON.parse(sessionStr);
    const storedSession: SessionData | null = localSessionStr ? JSON.parse(localSessionStr) : null;
    
    // Update last active
    currentSession.lastActive = Date.now();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentSession));
    localStorage.setItem(SESSION_KEY, JSON.stringify(currentSession));
    
    // If stored session is different and was active within last 5 minutes, flag as suspicious
    if (storedSession && storedSession.sessionId !== currentSession.sessionId) {
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      if (storedSession.lastActive > fiveMinutesAgo) {
        return true;
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

export function SuspiciousActivityProvider({ 
  children, 
  detectedCountryCode 
}: { 
  children: ReactNode;
  detectedCountryCode: string | null;
}) {
  const [state, setState] = useState<SuspiciousActivityState>({
    isLoading: true,
    isSuspicious: false,
    suspicionReasons: [],
    riskScore: 0,
    browserTimezone: null,
    browserLanguages: [],
    detectedVPN: false,
    timezoneCountryMismatch: false,
    multipleSessionsDetected: false,
    rapidLocationChanges: false
  });

  const analyzeActivity = useCallback(() => {
    const reasons: string[] = [];
    let riskScore = 0;
    
    const browserTimezone = getBrowserTimezone();
    const browserLanguages = getBrowserLanguages();
    
    // 1. Check timezone vs reported country mismatch
    const timezoneCountry = getTimezoneCountry(browserTimezone);
    let timezoneCountryMismatch = false;
    
    if (timezoneCountry && BLOCKED_COUNTRY_CODES.includes(timezoneCountry)) {
      if (detectedCountryCode && detectedCountryCode !== timezoneCountry) {
        // User's IP says one country, but timezone says sanctioned country
        timezoneCountryMismatch = true;
        reasons.push(`Timezone (${browserTimezone}) suggests ${timezoneCountry}, but IP shows ${detectedCountryCode}`);
        riskScore += 40;
      } else if (!detectedCountryCode) {
        // Can't detect IP country but timezone is sanctioned
        timezoneCountryMismatch = true;
        reasons.push(`Browser timezone (${browserTimezone}) is associated with sanctioned region`);
        riskScore += 50;
      }
    }
    
    // 2. Check language preferences
    const languageCountry = getLanguageCountry(browserLanguages);
    if (languageCountry && BLOCKED_COUNTRY_CODES.includes(languageCountry)) {
      if (detectedCountryCode && detectedCountryCode !== languageCountry) {
        reasons.push(`Browser language suggests ${languageCountry}, but IP shows ${detectedCountryCode}`);
        riskScore += 30;
      }
    }
    
    // 3. Detect VPN indicators
    const vpnIndicators = detectVPNIndicators();
    const webrtcBlocked = detectWebRTCLeak();
    const detectedVPN = vpnIndicators || webrtcBlocked;
    
    if (detectedVPN) {
      reasons.push('VPN or proxy usage detected');
      riskScore += 25;
    }
    
    // 4. Check multiple sessions
    const multipleSessionsDetected = checkMultipleSessions();
    if (multipleSessionsDetected) {
      reasons.push('Multiple simultaneous sessions detected');
      riskScore += 15;
    }
    
    // 5. Check rapid location changes
    let rapidLocationChanges = false;
    if (detectedCountryCode) {
      const { rapidChange } = trackLocationChange(detectedCountryCode);
      rapidLocationChanges = rapidChange;
      if (rapidChange) {
        reasons.push('Rapid geographic location changes detected');
        riskScore += 35;
      }
    }
    
    // 6. Additional browser fingerprint checks
    try {
      // Check for headless browser indicators
      if (navigator.webdriver) {
        reasons.push('Automated browser detected');
        riskScore += 20;
      }
      
      // Check for missing plugins (common in automated/VPN setups)
      if (navigator.plugins && navigator.plugins.length === 0) {
        riskScore += 5;
      }
      
      // Check screen dimensions (unusual values might indicate spoofing)
      if (window.screen.width === 0 || window.screen.height === 0) {
        reasons.push('Suspicious screen dimensions');
        riskScore += 15;
      }
    } catch {
      // Ignore errors
    }
    
    // Cap risk score at 100
    riskScore = Math.min(riskScore, 100);
    
    // Consider suspicious if risk score >= 50 OR timezone/language directly matches sanctioned region
    const isSuspicious = riskScore >= 50 || (timezoneCountryMismatch && timezoneCountry && BLOCKED_COUNTRY_CODES.includes(timezoneCountry));
    
    setState({
      isLoading: false,
      isSuspicious,
      suspicionReasons: reasons,
      riskScore,
      browserTimezone,
      browserLanguages,
      detectedVPN,
      timezoneCountryMismatch,
      multipleSessionsDetected,
      rapidLocationChanges
    });
  }, [detectedCountryCode]);

  useEffect(() => {
    analyzeActivity();
    
    // Re-check periodically
    const interval = setInterval(analyzeActivity, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [analyzeActivity]);

  const value: SuspiciousActivityContextType = {
    ...state,
    recheckActivity: analyzeActivity
  };

  return (
    <SuspiciousActivityContext.Provider value={value}>
      {children}
    </SuspiciousActivityContext.Provider>
  );
}

export function useSuspiciousActivity(): SuspiciousActivityContextType {
  const context = useContext(SuspiciousActivityContext);
  if (!context) {
    throw new Error('useSuspiciousActivity must be used within a SuspiciousActivityProvider');
  }
  return context;
}

export default useSuspiciousActivity;
