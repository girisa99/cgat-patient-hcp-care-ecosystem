/**
 * Genie Deck - AI-Powered Presentation Generator
 * "Ideas to Impact" - Transform ideas into stunning presentations
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Presentation, 
  Sparkles, 
  Zap,
  Mic,
  AlertTriangle,
  RefreshCw,
  Mail
} from 'lucide-react';
import { PresentationWizard } from '@/components/genie-studio/presentation-generator/PresentationWizard';
import { BackToSubscription } from '@/components/subscription/BackToSubscription';
import { AskGenie } from '@/components/genie-studio/AskGenie';
import { HIPAAComplianceFooter } from '@/components/genie-studio/HIPAAComplianceFooter';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import genieDeckLogo from '@/assets/logos/genie-deck-combined.png';

// Error display component - friendly and not scary
const ErrorDisplay = ({ 
  error, 
  onRetry, 
  onDismiss 
}: { 
  error: string; 
  onRetry: () => void; 
  onDismiss: () => void;
}) => (
  <Alert className="mx-4 my-4 border-amber-200 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-800">
    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
    <AlertTitle className="text-amber-800 dark:text-amber-200 font-medium">
      Oops! Something didn't go as planned
    </AlertTitle>
    <AlertDescription className="mt-2 space-y-3">
      <p className="text-amber-700 dark:text-amber-300 text-sm">
        {error || "We encountered an issue while processing your request. Don't worry - your work is safe!"}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onRetry}
          className="border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/30"
        >
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Try Again
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={onDismiss}
          className="text-amber-700 hover:text-amber-800 dark:text-amber-300"
        >
          Dismiss
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => window.location.href = 'mailto:support@example.com?subject=Genie Deck Issue'}
          className="text-amber-700 hover:text-amber-800 dark:text-amber-300"
        >
          <Mail className="h-4 w-4 mr-1.5" />
          Contact Support
        </Button>
      </div>
    </AlertDescription>
  </Alert>
);

const GenieDeck = () => {
  const navigate = useNavigate();
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    toast.error('Generation encountered an issue', {
      description: 'Please check the error message and try again.'
    });
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    toast.info('Ready to try again!');
  }, []);

  const handleDismiss = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/10">
        {/* Compact Header */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center gap-4">
              <BackToSubscription 
                fallbackPath="/genie-studio" 
                fallbackLabel="Studio" 
              />
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-3 group cursor-help">
                      {/* Logo with hover tooltip */}
                      <div className="relative">
                        <div className="h-9 w-9 rounded-lg bg-white/90 backdrop-blur border border-purple-200/50 flex items-center justify-center shadow-sm overflow-hidden p-1 transition-transform group-hover:scale-110">
                          <img src={genieDeckLogo} alt="Genie Deck" className="h-full w-full object-contain" />
                        </div>
                        {/* Hover tooltip with larger logo */}
                        <div className="absolute left-0 top-12 z-50 hidden group-hover:block">
                          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border p-4 min-w-[280px]">
                            <img src={genieDeckLogo} alt="Genie Deck" className="h-20 w-auto mx-auto object-contain" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h1 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                          Genie Deck
                        </h1>
                        <p className="text-xs text-muted-foreground hidden sm:block">Ideas to Impact</p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs p-3">
                    <p className="font-medium text-foreground">AI Presentation Generator</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Transform your ideas, notes, or documents into professional presentations with AI-powered slide generation, multi-language support, and smart visuals.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 hidden sm:flex">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/genie-spark')}
                className="h-8"
              >
                <Zap className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Spark</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/genie-vibe')}
                className="h-8"
              >
                <Mic className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Vibe</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Error Display - Friendly and not scary */}
        {error && (
          <ErrorDisplay 
            error={error} 
            onRetry={handleRetry} 
            onDismiss={handleDismiss} 
          />
        )}

        {/* Full-Screen Presentation Wizard */}
        <div className="h-[calc(100vh-56px)]">
          <PresentationWizard 
            className="h-full"
            onComplete={(presentation) => {
              setHasGeneratedContent(true);
              setError(null);
              toast.success('Presentation generated successfully!');
            }}
            onError={handleError}
          />
        </div>

        {/* HIPAA Compliance Footer */}
        <HIPAAComplianceFooter variant="compact" className="fixed bottom-4 left-4 z-30" />

        {/* Ask Genie - Context-aware AI for Deck */}
        <AskGenie 
          product="deck" 
          currentTab="create"
          sessionData={{ hasGeneratedContent }}
        />
      </div>
    </AppLayout>
  );
};

export default GenieDeck;
