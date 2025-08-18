/**
 * Security Hardening Component (Phase 3)
 * Advanced security hardening features and session management
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, Lock, Clock, Users, Key, AlertCircle,
  CheckCircle, Settings, Activity, RefreshCw
} from 'lucide-react';
import { useAdvancedSecurityMonitoring } from '@/hooks/useAdvancedSecurityMonitoring';

interface SecurityHardeningSettings {
  enableSessionTimeout: boolean;
  sessionTimeoutMinutes: number;
  enableConcurrentSessionLimits: boolean;
  maxConcurrentSessions: number;
  enableStrictCSP: boolean;
  enableAPIRateLimit: boolean;
  apiRateLimit: number;
  enableAdvancedLogging: boolean;
  enableAutomatedResponse: boolean;
}

export const SecurityHardening: React.FC = () => {
  const [settings, setSettings] = useState<SecurityHardeningSettings>({
    enableSessionTimeout: true,
    sessionTimeoutMinutes: 30,
    enableConcurrentSessionLimits: true,
    maxConcurrentSessions: 3,
    enableStrictCSP: true,
    enableAPIRateLimit: true,
    apiRateLimit: 100,
    enableAdvancedLogging: true,
    enableAutomatedResponse: true
  });

  const [isApplying, setIsApplying] = useState(false);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  const { 
    securityScore, 
    threatLevel, 
    realTimeAlerts,
    blockIP,
    checkSuspiciousActivity 
  } = useAdvancedSecurityMonitoring();

  useEffect(() => {
    // Mock active sessions
    setActiveSessions([
      {
        id: '1',
        userId: 'user1',
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0',
        startTime: new Date(Date.now() - 30 * 60 * 1000),
        lastActivity: new Date(Date.now() - 5 * 60 * 1000),
        location: 'New York, US'
      }
    ]);
  }, []);

  const applySecuritySettings = async () => {
    setIsApplying(true);
    try {
      // Apply session timeout
      if (settings.enableSessionTimeout) {
        localStorage.setItem('sessionTimeout', settings.sessionTimeoutMinutes.toString());
      }

      // Apply CSP settings
      if (settings.enableStrictCSP) {
        // This would typically be handled server-side
        console.log('Applying strict Content Security Policy');
      }

      // Mock API call to update settings
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Security hardening settings applied:', settings);
    } catch (error) {
      console.error('Failed to apply security settings:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      // Mock session termination
      setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
      console.log('Session terminated:', sessionId);
    } catch (error) {
      console.error('Failed to terminate session:', error);
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Security Hardening
          </h2>
          <p className="text-muted-foreground">Advanced security controls and session management</p>
        </div>
        <Badge className={getThreatLevelColor(threatLevel)}>
          Threat Level: {threatLevel.toUpperCase()}
        </Badge>
      </div>

      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Security Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{securityScore}/100</div>
              <div className="text-sm text-muted-foreground">Current security score</div>
            </div>
            <div className="w-32 h-32 relative">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-muted"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${securityScore * 3.51} 351`}
                  className={securityScore > 80 ? 'text-green-500' : securityScore > 60 ? 'text-yellow-500' : 'text-red-500'}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium">{securityScore}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Session Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Session Timeout</div>
                <div className="text-sm text-muted-foreground">
                  Auto-logout after {settings.sessionTimeoutMinutes} minutes
                </div>
              </div>
              <Switch
                checked={settings.enableSessionTimeout}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, enableSessionTimeout: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Concurrent Session Limits</div>
                <div className="text-sm text-muted-foreground">
                  Max {settings.maxConcurrentSessions} sessions per user
                </div>
              </div>
              <Switch
                checked={settings.enableConcurrentSessionLimits}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, enableConcurrentSessionLimits: checked }))
                }
              />
            </div>

            <div className="pt-4">
              <div className="font-medium mb-2">Active Sessions ({activeSessions.length})</div>
              <div className="space-y-2">
                {activeSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="text-sm">
                      <div>{session.location}</div>
                      <div className="text-muted-foreground">{session.ipAddress}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => terminateSession(session.id)}
                    >
                      Terminate
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Rate Limiting</div>
                <div className="text-sm text-muted-foreground">
                  {settings.apiRateLimit} requests per minute
                </div>
              </div>
              <Switch
                checked={settings.enableAPIRateLimit}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, enableAPIRateLimit: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Strict CSP</div>
                <div className="text-sm text-muted-foreground">
                  Enhanced Content Security Policy
                </div>
              </div>
              <Switch
                checked={settings.enableStrictCSP}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, enableStrictCSP: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Advanced Logging</div>
                <div className="text-sm text-muted-foreground">
                  Detailed security event logging
                </div>
              </div>
              <Switch
                checked={settings.enableAdvancedLogging}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, enableAdvancedLogging: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Automated Response</div>
                <div className="text-sm text-muted-foreground">
                  Auto-block suspicious activities
                </div>
              </div>
              <Switch
                checked={settings.enableAutomatedResponse}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, enableAutomatedResponse: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Alerts */}
      {realTimeAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Recent Security Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {realTimeAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{alert.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apply Settings */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={applySecuritySettings} 
            disabled={isApplying}
            className="w-full"
          >
            {isApplying && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
            Apply Security Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};