/**
 * Mobile Recording Page
 * Dedicated route for mobile-first recording experience
 * Part of P1 Mobile MVP - Competitive Differentiator
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MobileRecordingView } from '@/components/document-processing/RecordingStudio/components/MobileRecordingView';
import { PWAInstallPrompt } from '@/components/mobile';
import { useIsMobile } from '@/hooks/use-mobile';
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
  Download
} from 'lucide-react';

const MobileRecordingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [forceDesktop, setForceDesktop] = useState(false);

  // Check for desktop override
  useEffect(() => {
    if (searchParams.get('desktop') === 'true') {
      setForceDesktop(true);
    }
  }, [searchParams]);

  // Sample scripts for demo
  const sampleScripts = [
    {
      id: '1',
      title: 'Product Demo Script',
      content: 'Welcome to our product demo. Today I\'ll show you how our solution helps you save time and increase productivity. Let\'s start with the main dashboard...'
    },
    {
      id: '2',
      title: 'Quick Introduction',
      content: 'Hi everyone! I\'m excited to share this quick update with you. In this video, we\'ll cover the three most important features you need to know about...'
    }
  ];

  // Desktop landing - show mobile benefits
  if (!isMobile && !forceDesktop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 flex items-center justify-center">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-4">
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
            </div>

            {/* Mobile Features */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <Zap className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
                <span className="text-sm font-medium">One-Tap Record</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <Scissors className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                <span className="text-sm font-medium">AI Quick Clips</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <Layers className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                <span className="text-sm font-medium">Multi-Clip Timeline</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <Wifi className="h-6 w-6 mx-auto text-green-500 mb-2" />
                <span className="text-sm font-medium">Works Offline</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => setForceDesktop(true)}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Continue on Desktop
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/genie-studio')}
              >
                Open Full Genie Studio
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

  // Mobile Recording View
  return (
    <MobileRecordingView
      isOpen={true}
      onClose={() => navigate(-1)}
      scripts={sampleScripts}
      onRecordingComplete={(result) => {
        console.log('Recording complete:', result);
      }}
    />
  );
};

export default MobileRecordingPage;
