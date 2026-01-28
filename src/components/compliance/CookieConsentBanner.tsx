/**
 * COOKIE CONSENT BANNER
 * GDPR/CCPA compliant cookie consent banner
 * Appears on first visit before any tracking
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cookie, Settings, X } from 'lucide-react';
import { useCookieConsent, CookiePreferences } from '@/hooks/useCookieConsent';
import { Link } from 'react-router-dom';

export const CookieConsentBanner: React.FC = () => {
  const { hasConsented, isLoading, acceptAll, acceptEssentialOnly, saveConsent } = useCookieConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  if (isLoading || hasConsented) {
    return null;
  }

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-background/80 backdrop-blur-md border-t">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardContent className="p-4 md:p-6">
            {!showDetails ? (
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <Cookie className="h-8 w-8 text-primary shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg">We use cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      We use cookies to enhance your experience. By continuing, you agree to our{' '}
                      <Link to="/cookies" className="text-primary underline">Cookie Policy</Link>.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 ml-auto">
                  <Button variant="outline" size="sm" onClick={() => setShowDetails(true)}>
                    <Settings className="h-4 w-4 mr-1" />
                    Customize
                  </Button>
                  <Button variant="outline" size="sm" onClick={acceptEssentialOnly}>
                    Essential Only
                  </Button>
                  <Button size="sm" onClick={acceptAll}>
                    Accept All
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Cookie className="h-5 w-5 text-primary" />
                    Cookie Preferences
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="font-medium">Essential Cookies</Label>
                      <p className="text-xs text-muted-foreground">Required for the website to function properly</p>
                    </div>
                    <Switch checked disabled />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="font-medium">Analytics Cookies</Label>
                      <p className="text-xs text-muted-foreground">Help us understand how visitors interact with our website</p>
                    </div>
                    <Switch 
                      checked={preferences.analytics} 
                      onCheckedChange={(checked) => setPreferences(p => ({ ...p, analytics: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="font-medium">Marketing Cookies</Label>
                      <p className="text-xs text-muted-foreground">Used to track visitors across websites for advertising</p>
                    </div>
                    <Switch 
                      checked={preferences.marketing} 
                      onCheckedChange={(checked) => setPreferences(p => ({ ...p, marketing: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="font-medium">Functional Cookies</Label>
                      <p className="text-xs text-muted-foreground">Enable enhanced functionality and personalization</p>
                    </div>
                    <Switch 
                      checked={preferences.functional} 
                      onCheckedChange={(checked) => setPreferences(p => ({ ...p, functional: checked }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={acceptEssentialOnly}>
                    Reject All
                  </Button>
                  <Button onClick={handleSavePreferences}>
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
