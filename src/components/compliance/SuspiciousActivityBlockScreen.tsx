/**
 * Suspicious Activity Block Screen
 * 
 * Displayed when suspicious activity is detected that may indicate
 * attempts to bypass geographic restrictions.
 */

import { Shield, AlertTriangle, Lock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SuspiciousActivityBlockScreenProps {
  reasons: string[];
  riskScore: number;
}

export function SuspiciousActivityBlockScreen({ reasons, riskScore }: SuspiciousActivityBlockScreenProps) {
  const handleRefresh = () => {
    // Clear cached data and refresh
    localStorage.removeItem('geo_compliance_cache');
    localStorage.removeItem('geo_location_history');
    sessionStorage.removeItem('security_session_data');
    window.location.reload();
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:compliance@geniestudio.ai?subject=Access%20Verification%20Request';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/20 via-background to-destructive/10 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-destructive/30 bg-card/95 backdrop-blur-sm shadow-2xl">
        <CardContent className="p-8 text-center">
          {/* Warning Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-destructive to-destructive/80 p-4 rounded-full">
                <AlertTriangle className="h-12 w-12 text-destructive-foreground" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Security Verification Required
          </h1>
          
          {/* Risk Score Indicator */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-destructive" />
            <span className="text-sm text-muted-foreground">
              Risk Score: <span className="font-semibold text-destructive">{riskScore}/100</span>
            </span>
          </div>

          {/* Message */}
          <p className="text-muted-foreground mb-6">
            Our security systems have detected unusual activity patterns that require verification. 
            This may be triggered by VPN usage, proxy servers, or other network configurations.
          </p>

          {/* Detection Details */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Detection Details</span>
            </div>
            <ul className="space-y-2">
              {reasons.map((reason, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Compliance Notice */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-xs text-muted-foreground">
              To ensure compliance with international trade regulations (OFAC), we verify user 
              locations and block access from sanctioned regions. If you believe this is an error, 
              please disable any VPN or proxy services and try again.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleRefresh}
              variant="destructive"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Verification
            </Button>
            <Button 
              variant="outline"
              onClick={handleContactSupport}
            >
              Contact Support
            </Button>
          </div>

          {/* Legal Footer */}
          <p className="mt-8 text-xs text-muted-foreground">
            This verification is required under U.S. Treasury Department Office of Foreign Assets 
            Control (OFAC) regulations. Attempting to circumvent these controls may result in 
            permanent access restriction.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default SuspiciousActivityBlockScreen;
