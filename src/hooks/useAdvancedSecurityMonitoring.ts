/**
 * Advanced Security Monitoring Hook (Phase 2)
 * Enhanced real-time security monitoring with automated response
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityMonitoring } from './useSecurityMonitoring';
import { InputSanitizer } from '@/utils/security/inputSanitizer';

interface SecurityIncident {
  id: string;
  type: 'xss_attempt' | 'rate_limit_exceeded' | 'suspicious_login' | 'data_breach_attempt' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  source_ip?: string;
  user_id?: string;
  timestamp: string;
  auto_resolved: boolean;
  response_actions: string[];
  metadata: any;
}

interface SecurityResponse {
  action: 'block_ip' | 'suspend_user' | 'require_2fa' | 'log_only' | 'alert_admin';
  duration?: number;
  reason: string;
}

interface UseAdvancedSecurityMonitoringReturn {
  incidents: SecurityIncident[];
  realTimeAlerts: SecurityIncident[];
  isMonitoring: boolean;
  securityScore: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  startMonitoring: () => void;
  stopMonitoring: () => void;
  resolveIncident: (incidentId: string) => Promise<void>;
  blockIP: (ip: string, reason: string) => Promise<void>;
  getSecurityReport: () => Promise<any>;
  checkSuspiciousActivity: (activityData: any) => Promise<boolean>;
}

export const useAdvancedSecurityMonitoring = (): UseAdvancedSecurityMonitoringReturn => {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [realTimeAlerts, setRealTimeAlerts] = useState<SecurityIncident[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [securityScore, setSecurityScore] = useState(85);
  const [threatLevel, setThreatLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low');

  const { alerts, createAlert } = useSecurityMonitoring();

  // Real-time incident detection
  const detectXSSAttempt = useCallback((input: string, source: string): boolean => {
    const suspiciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
      /<iframe[^>]*>/gi,
      /document\.write/gi,
      /innerHTML/gi,
      /eval\(/gi
    ];

    return suspiciousPatterns.some(pattern => pattern.test(input));
  }, []);

  // Automated security response
  const executeSecurityResponse = useCallback(async (
    incident: SecurityIncident
  ): Promise<SecurityResponse[]> => {
    const responses: SecurityResponse[] = [];

    switch (incident.type) {
      case 'xss_attempt':
        if (incident.severity === 'critical') {
          responses.push({
            action: 'block_ip',
            duration: 3600, // 1 hour
            reason: 'Critical XSS attempt detected'
          });
          if (incident.user_id) {
            responses.push({
              action: 'suspend_user',
              duration: 1800, // 30 minutes
              reason: 'Suspicious activity detected'
            });
          }
        }
        responses.push({
          action: 'log_only',
          reason: 'XSS attempt logged for analysis'
        });
        break;

      case 'rate_limit_exceeded':
        responses.push({
          action: 'block_ip',
          duration: 300, // 5 minutes
          reason: 'Rate limit exceeded'
        });
        break;

      case 'suspicious_login':
        responses.push({
          action: 'require_2fa',
          reason: 'Suspicious login pattern detected'
        });
        break;

      case 'unauthorized_access':
        responses.push({
          action: 'alert_admin',
          reason: 'Unauthorized access attempt'
        });
        if (incident.severity === 'critical') {
          responses.push({
            action: 'suspend_user',
            duration: 3600,
            reason: 'Critical security violation'
          });
        }
        break;
    }

    // Execute responses
    for (const response of responses) {
      await executeResponse(response, incident);
    }

    return responses;
  }, []);

  // Execute individual security response
  const executeResponse = async (response: SecurityResponse, incident: SecurityIncident) => {
    try {
      switch (response.action) {
        case 'block_ip':
          await supabase.functions.invoke('security-monitor', {
            body: {
              action: 'block_ip',
              ip: incident.source_ip,
              duration: response.duration,
              reason: response.reason
            }
          });
          break;

        case 'suspend_user':
          if (incident.user_id) {
            await supabase.functions.invoke('security-monitor', {
              body: {
                action: 'suspend_user',
                user_id: incident.user_id,
                duration: response.duration,
                reason: response.reason
              }
            });
          }
          break;

        case 'alert_admin':
          await createAlert({
            type: 'security_violation',
            severity: incident.severity,
            message: `Security incident: ${incident.description}`,
            metadata: {
              incident_id: incident.id,
              response_action: response.action
            }
          });
          break;
      }
    } catch (error) {
      console.error('Failed to execute security response:', error);
    }
  };

  // Monitor for security incidents
  const monitorSecurityIncidents = useCallback(() => {
    // Monitor form inputs for XSS attempts
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (type === 'input' || type === 'change') {
        const wrappedListener = function(event: any) {
          const target = event.target;
          if (target && target.value) {
            const isXSS = detectXSSAttempt(target.value, target.name || 'unknown');
            if (isXSS) {
              const incident: SecurityIncident = {
                id: crypto.randomUUID(),
                type: 'xss_attempt',
                severity: 'high',
                description: `XSS attempt detected in field: ${target.name || 'unknown'}`,
                timestamp: new Date().toISOString(),
                auto_resolved: false,
                response_actions: [],
                metadata: {
                  field_name: target.name,
                  attempted_value: target.value.substring(0, 100),
                  user_agent: navigator.userAgent
                }
              };

              setRealTimeAlerts(prev => [incident, ...prev.slice(0, 4)]);
              executeSecurityResponse(incident);
            }
          }
          if (typeof listener === 'function') {
            return listener.call(this, event);
          } else if (listener && typeof listener.handleEvent === 'function') {
            return listener.handleEvent(event);
          }
        };
        return originalAddEventListener.call(this, type, wrappedListener, options);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };

    // Monitor rate limiting
    const originalFetch = window.fetch;
    let requestCount = 0;
    let lastResetTime = Date.now();

    window.fetch = async function(...args) {
      const now = Date.now();
      
      // Reset counter every minute
      if (now - lastResetTime > 60000) {
        requestCount = 0;
        lastResetTime = now;
      }

      requestCount++;
      
      // Check if rate limit exceeded (100 requests per minute)
      if (requestCount > 100) {
        const incident: SecurityIncident = {
          id: crypto.randomUUID(),
          type: 'rate_limit_exceeded',
          severity: 'medium',
          description: 'Rate limit exceeded - suspicious activity detected',
          timestamp: new Date().toISOString(),
          auto_resolved: true,
          response_actions: ['block_temporarily'],
          metadata: {
            request_count: requestCount,
            time_window: '1_minute'
          }
        };

        setRealTimeAlerts(prev => [incident, ...prev.slice(0, 4)]);
        executeSecurityResponse(incident);
        
        throw new Error('Rate limit exceeded');
      }

      return originalFetch.apply(this, args);
    };
  }, [detectXSSAttempt, executeSecurityResponse]);

  // Calculate security score
  const calculateSecurityScore = useCallback(() => {
    let score = 100;
    const recentIncidents = incidents.filter(
      incident => Date.now() - new Date(incident.timestamp).getTime() < 24 * 60 * 60 * 1000
    );

    // Deduct points for incidents
    recentIncidents.forEach(incident => {
      switch (incident.severity) {
        case 'critical': score -= 20; break;
        case 'high': score -= 10; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
      }
    });

    score = Math.max(0, score);
    setSecurityScore(score);

    // Determine threat level
    if (score < 50) setThreatLevel('critical');
    else if (score < 70) setThreatLevel('high');
    else if (score < 85) setThreatLevel('medium');
    else setThreatLevel('low');
  }, [incidents]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    monitorSecurityIncidents();
    
    // Initialize rate limiting
    InputSanitizer.initializeRateLimit();
  }, [monitorSecurityIncidents]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Resolve incident
  const resolveIncident = useCallback(async (incidentId: string) => {
    setIncidents(prev => 
      prev.map(incident => 
        incident.id === incidentId 
          ? { ...incident, auto_resolved: true }
          : incident
      )
    );

    await supabase
      .from('security_alerts')
      .update({ status: 'resolved' })
      .eq('id', incidentId);
  }, []);

  // Block IP
  const blockIP = useCallback(async (ip: string, reason: string) => {
    await supabase.functions.invoke('security-monitor', {
      body: {
        action: 'block_ip',
        ip,
        duration: 3600,
        reason
      }
    });
  }, []);

  // Get security report
  const getSecurityReport = useCallback(async () => {
    const { data, error } = await supabase
      .from('security_alerts')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;
    return data;
  }, []);

  // Check suspicious activity
  const checkSuspiciousActivity = useCallback(async (activityData: any) => {
    const patterns = [
      // Multiple failed login attempts
      activityData.failed_logins && activityData.failed_logins > 5,
      // Unusual access patterns
      activityData.unusual_hours && activityData.unusual_hours > 3,
      // Rapid data access
      activityData.rapid_requests && activityData.rapid_requests > 50
    ];

    return patterns.some(Boolean);
  }, []);

  // Initialize monitoring
  useEffect(() => {
    if (typeof window !== 'undefined') {
      startMonitoring();
    }

    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring]);

  // Update security score
  useEffect(() => {
    calculateSecurityScore();
  }, [incidents, calculateSecurityScore]);

  return {
    incidents,
    realTimeAlerts,
    isMonitoring,
    securityScore,
    threatLevel,
    startMonitoring,
    stopMonitoring,
    resolveIncident,
    blockIP,
    getSecurityReport,
    checkSuspiciousActivity
  };
};