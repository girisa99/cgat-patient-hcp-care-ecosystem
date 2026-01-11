/**
 * Mobile Recording Page
 * Dedicated route for mobile-first recording experience
 * Part of P1 Mobile MVP - Competitive Differentiator
 * 
 * NAVIGATION:
 * - /genie-vibe/mobile → This page (mobile-first)
 * - Continue on Desktop → /genie-vibe (full desktop studio)
 * - Back → /genie-studio (main hub)
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MobileRecordingView } from '@/components/document-processing/RecordingStudio/components/MobileRecordingView';
import { PWAInstallPrompt } from '@/components/mobile';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGenieScripts } from '@/components/genie-studio/useGenieScripts';
import { useGenieMediaLibrary } from '@/components/genie-studio/useGenieMediaLibrary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Monitor, 
  Video, 
  Sparkles, 
  ArrowRight,
  Zap,
  Scissors,
  Layers,
  Wifi,
  ArrowLeft
} from 'lucide-react';

const MobileRecordingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [forceDesktop, setForceDesktop] = useState(false);

  // Load real scripts and music from existing hooks
  const { scripts: savedScripts } = useGenieScripts();
  const { instrumentalMusic } = useGenieMediaLibrary();

  // Format scripts for mobile view
  const scriptsForMobile = savedScripts.map(s => ({
    id: s.id,
    title: s.name,
    content: s.enhancedContent || s.content || ''
  }));

  // Format music for mobile view
  const musicForMobile = instrumentalMusic.map(m => ({
    id: m.id,
    name: m.name,
    url: m.url
  }));

  // Check for desktop override
  useEffect(() => {
    if (searchParams.get('desktop') === 'true') {
      setForceDesktop(true);
    }
  }, [searchParams]);

  // Handler for switching to desktop
  const handleSwitchToDesktop = () => {
    navigate('/genie-vibe');
  };

  // Handler for going back to main studio
  const handleBackToStudio = () => {
    navigate('/genie-studio');
  };

  // Desktop landing - show mobile benefits with navigation
  if (!isMobile && !forceDesktop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 flex items-center justify-center">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToStudio}
              className="absolute left-4 top-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Studio
            </Button>
            
            <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-4 mt-6">
              <Smartphone className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Genie Vibe Mobile</CardTitle>
            <p className="text-muted-foreground">
              The best recording experience is on your phone
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* QR Code placeholder */}
            <div className="text-center p-6 border-2 border-dashed rounded-xl bg-muted/50">
              <div className="w-32 h-32 mx-auto bg-muted rounded-lg flex items-center justify-center mb-3">
                <Video className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Scan with your phone camera or visit this URL on mobile
              </p>
              <code className="text-xs bg-muted px-2 py-1 rounded mt-2 block">
                {window.location.href}
              </code>
            </div>

            {/* Mobile Features */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <Zap className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
                <span className="text-sm font-medium">One-Tap Record</span>
                <p className="text-xs text-muted-foreground">Video, Audio, Photo</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <Scissors className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                <span className="text-sm font-medium">AI Quick Clips</span>
                <p className="text-xs text-muted-foreground">Auto-generate clips</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <Layers className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                <span className="text-sm font-medium">Multi-Clip Timeline</span>
                <p className="text-xs text-muted-foreground">Combine & edit</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <Wifi className="h-6 w-6 mx-auto text-green-500 mb-2" />
                <span className="text-sm font-medium">Works Offline</span>
                <p className="text-xs text-muted-foreground">Sync when online</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => setForceDesktop(true)}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Continue on Desktop (Preview Mobile UI)
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/genie-vibe')}
              >
                Open Full Genie Vibe Desktop Studio
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => navigate('/genie-studio')}
              >
                Back to Genie Studio Hub
              </Button>
            </div>

            {/* Badge */}
            <div className="text-center">
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                68% of creators prefer mobile-first recording
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* PWA Install for desktop users */}
        <PWAInstallPrompt variant="button" className="fixed bottom-4 right-4" />
      </div>
    );
  }

  // Mobile Recording View (or desktop preview)
  return (
    <MobileRecordingView
      isOpen={true}
      onClose={handleBackToStudio}
      scripts={scriptsForMobile}
      music={musicForMobile}
      onSwitchToDesktop={handleSwitchToDesktop}
      onRecordingComplete={(result) => {
        console.log('Recording complete:', result);
      }}
    />
  );
};

export default MobileRecordingPage;
