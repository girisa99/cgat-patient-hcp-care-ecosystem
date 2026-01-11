/**
 * PWA Install Prompt
 * P1 Feature: Progressive Web App installation prompt
 * Target: Mobile-first users who want app-like experience
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Download,
  Smartphone,
  X,
  Check,
  Share,
  PlusSquare,
  Chrome,
  Apple,
  MonitorSmartphone,
  Zap,
  Wifi,
  Bell,
  HardDrive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallPromptProps {
  className?: string;
  variant?: 'banner' | 'card' | 'button' | 'modal';
  showOnMount?: boolean;
  onInstall?: () => void;
  onDismiss?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  className,
  variant = 'banner',
  showOnMount = true,
  onInstall,
  onDismiss
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown');
  const [isDismissed, setIsDismissed] = useState(false);

  // Detect platform
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    if (isIOS) {
      setPlatform('ios');
    } else if (isAndroid) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setIsDismissed(true);
      }
    }
  }, []);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (showOnMount && !isDismissed && !isInstalled) {
        setIsVisible(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
      toast.success('App installed successfully!');
      onInstall?.();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [showOnMount, isDismissed, isInstalled, onInstall]);

  // Show prompt for iOS (no native prompt event)
  useEffect(() => {
    if (platform === 'ios' && showOnMount && !isDismissed && !isInstalled) {
      // Delay showing to not interrupt user
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [platform, showOnMount, isDismissed, isInstalled]);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      // Native install prompt (Chrome/Android)
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success('Installing app...');
        onInstall?.();
      } else {
        toast.info('Installation cancelled');
      }
      
      setDeferredPrompt(null);
      setIsVisible(false);
    } else if (platform === 'ios') {
      // Show iOS instructions
      setShowInstructions(true);
    } else {
      // Fallback - show instructions
      setShowInstructions(true);
    }
  }, [deferredPrompt, platform, onInstall]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    onDismiss?.();
  }, [onDismiss]);

  const getPlatformIcon = () => {
    switch (platform) {
      case 'ios': return <Apple className="h-5 w-5" />;
      case 'android': return <Chrome className="h-5 w-5" />;
      default: return <MonitorSmartphone className="h-5 w-5" />;
    }
  };

  const benefits = [
    { icon: Zap, text: 'Faster loading' },
    { icon: Wifi, text: 'Works offline' },
    { icon: Bell, text: 'Push notifications' },
    { icon: HardDrive, text: 'Less storage' },
  ];

  // Don't render if installed or no prompt available (for non-iOS)
  if (isInstalled) {
    return null;
  }

  // Banner variant
  if (variant === 'banner' && isVisible) {
    return (
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-background via-background to-transparent",
        className
      )}>
        <Card className="shadow-lg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">Install Genie App</h4>
                  <Badge variant="secondary" className="text-xs">FREE</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add to your home screen for the best experience
                </p>
                
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {benefits.slice(0, 2).map((benefit, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <benefit.icon className="h-3 w-3" />
                      {benefit.text}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mt-1"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2 mt-3">
              <Button className="flex-1" onClick={handleInstall}>
                <Download className="h-4 w-4 mr-2" />
                Install Now
              </Button>
              <Button variant="outline" onClick={handleDismiss}>
                Maybe Later
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* iOS Instructions Modal */}
        <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getPlatformIcon()}
                Install on {platform === 'ios' ? 'iPhone/iPad' : platform === 'android' ? 'Android' : 'Desktop'}
              </DialogTitle>
              <DialogDescription>
                Follow these steps to install the app
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {platform === 'ios' ? (
                <>
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <div className="p-1.5 bg-primary text-primary-foreground rounded text-xs font-bold">1</div>
                    <div>
                      <p className="font-medium">Tap the Share button</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Share className="h-4 w-4" /> at the bottom of Safari
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <div className="p-1.5 bg-primary text-primary-foreground rounded text-xs font-bold">2</div>
                    <div>
                      <p className="font-medium">Tap "Add to Home Screen"</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <PlusSquare className="h-4 w-4" /> in the share menu
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <div className="p-1.5 bg-primary text-primary-foreground rounded text-xs font-bold">3</div>
                    <div>
                      <p className="font-medium">Tap "Add"</p>
                      <p className="text-sm text-muted-foreground">
                        The app will appear on your home screen
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <div className="p-1.5 bg-primary text-primary-foreground rounded text-xs font-bold">1</div>
                    <div>
                      <p className="font-medium">Tap the menu icon</p>
                      <p className="text-sm text-muted-foreground">
                        Three dots (⋮) in Chrome
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <div className="p-1.5 bg-primary text-primary-foreground rounded text-xs font-bold">2</div>
                    <div>
                      <p className="font-medium">Tap "Install app" or "Add to Home screen"</p>
                      <p className="text-sm text-muted-foreground">
                        <Download className="h-4 w-4 inline" /> in the menu
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <div className="p-1.5 bg-primary text-primary-foreground rounded text-xs font-bold">3</div>
                    <div>
                      <p className="font-medium">Confirm installation</p>
                      <p className="text-sm text-muted-foreground">
                        The app will install and appear on your home screen
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Button onClick={() => setShowInstructions(false)} className="w-full mt-4">
              Got it!
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Card variant
  if (variant === 'card') {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Smartphone className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Install Our App</h4>
                <p className="text-sm text-muted-foreground">
                  Get the full mobile experience
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>

            <Button className="w-full" onClick={handleInstall}>
              <Download className="h-4 w-4 mr-2" />
              Install Free App
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Button variant
  if (variant === 'button') {
    return (
      <>
        <Button 
          className={className}
          onClick={handleInstall}
          disabled={isInstalled}
        >
          {isInstalled ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Installed
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Install App
            </>
          )}
        </Button>

        <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getPlatformIcon()}
                Install Instructions
              </DialogTitle>
            </DialogHeader>
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                {platform === 'ios' 
                  ? 'Tap the Share button, then "Add to Home Screen"'
                  : 'Tap the menu (⋮), then "Install app"'
                }
              </p>
            </div>
            <Button onClick={() => setShowInstructions(false)}>
              Got it!
            </Button>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Modal variant
  if (variant === 'modal' && isVisible) {
    return (
      <Dialog open={isVisible} onOpenChange={(open) => !open && handleDismiss()}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 justify-center">
              <Smartphone className="h-6 w-6 text-primary" />
              Install Genie App
            </DialogTitle>
            <DialogDescription className="text-center">
              Get the best experience with our free app
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <benefit.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleInstall}>
              <Download className="h-4 w-4 mr-2" />
              Install Now
            </Button>
            <Button variant="ghost" onClick={handleDismiss}>
              Not now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
};

export default PWAInstallPrompt;
