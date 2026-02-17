/**
 * REAL-TIME NPI VERIFICATION SETTINGS
 * Settings panel for configuring real-time NPI verification preferences
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Clock, 
  Zap, 
  Settings,
  Info 
} from 'lucide-react';
import { useRealTimeNPIVerification } from './RealTimeNPIVerificationProvider';

export const RealTimeNPIVerificationSettings: React.FC = () => {
  const { settings, updateSettings, isEnabled } = useRealTimeNPIVerification();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Real-Time NPI Verification
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure automatic verification of NPI numbers and provider credentials as users type
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Real-Time Verification</Label>
            <p className="text-sm text-muted-foreground">
              Automatically verify NPI numbers and credentials in the background
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(enabled) => updateSettings({ enabled })}
          />
        </div>

        {isEnabled && (
          <>
            {/* Debounce Timer */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label>Verification Delay</Label>
                <span className="text-sm text-muted-foreground ml-auto">
                  {settings.debounceMs / 1000}s
                </span>
              </div>
              <Slider
                value={[settings.debounceMs]}
                onValueChange={([value]) => updateSettings({ debounceMs: value })}
                max={5000}
                min={500}
                step={500}
              />
              <p className="text-xs text-muted-foreground">
                Time to wait after user stops typing before starting verification
              </p>
            </div>

            {/* Auto-verify on Complete */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Auto-verify Complete NPIs
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically start verification when a valid 10-digit NPI is entered
                </p>
              </div>
              <Switch
                checked={settings.autoVerifyOnComplete}
                onCheckedChange={(autoVerifyOnComplete) => 
                  updateSettings({ autoVerifyOnComplete })
                }
              />
            </div>

            {/* Background Verification */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Background Processing
                </Label>
                <p className="text-sm text-muted-foreground">
                  Run verification as a background process without blocking the UI
                </p>
              </div>
              <Switch
                checked={settings.backgroundVerification}
                onCheckedChange={(backgroundVerification) => 
                  updateSettings({ backgroundVerification })
                }
              />
            </div>

            {/* Info Alert */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Real-time verification helps ensure data accuracy and compliance by validating 
                provider credentials as they're entered. This feature uses background processes 
                to minimize impact on user experience.
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
};