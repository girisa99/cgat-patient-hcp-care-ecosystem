/**
 * SanctionsBlockScreen Component
 * 
 * Displays a blocking screen for users in sanctioned regions.
 * This is shown when geolocation indicates the user is accessing
 * from a sanctioned country per OFAC regulations.
 */

import React from 'react';
import { ShieldX, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SanctionsBlockScreenProps {
  countryName: string | null;
  blockReason: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const SanctionsBlockScreen: React.FC<SanctionsBlockScreenProps> = ({
  countryName,
  blockReason,
  onRetry,
  isRetrying = false
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-destructive/50">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-4 bg-destructive/10 rounded-full w-fit">
            <ShieldX className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-destructive">
            Service Unavailable in Your Region
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {blockReason || 
                `Access to this service is not available ${countryName ? `in ${countryName}` : 'in your region'} due to regulatory requirements.`
              }
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              Due to U.S. Treasury Department Office of Foreign Assets Control (OFAC) 
              regulations, we are unable to provide our services in certain regions.
            </p>
            
            <p>
              This includes cloud-based services (SaaS), IT consultancy, and 
              software support services.
            </p>

            <p className="font-medium">
              We apologize for any inconvenience this may cause.
            </p>
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              <strong>Why am I seeing this?</strong><br />
              Your IP address indicates you are accessing from a region where 
              our services cannot be provided due to international sanctions and 
              export control regulations.
            </p>

            <p className="text-xs text-muted-foreground">
              <strong>If you believe this is an error:</strong><br />
              Please contact our support team if you believe your location has 
              been incorrectly identified.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {onRetry && (
              <Button 
                variant="outline" 
                onClick={onRetry}
                disabled={isRetrying}
                className="w-full"
              >
                {isRetrying ? 'Checking...' : 'Check Again'}
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              asChild
              className="w-full text-muted-foreground"
            >
              <a 
                href="https://ofac.treasury.gov/sanctions-programs-and-country-information" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Learn more about OFAC Sanctions
              </a>
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground/70 text-center">
            Last compliance check: {new Date().toISOString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SanctionsBlockScreen;
