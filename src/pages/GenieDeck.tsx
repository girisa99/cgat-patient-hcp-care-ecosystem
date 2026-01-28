/**
 * Genie Deck - AI-Powered Presentation Generator
 * "Ideas to Impact" - Transform ideas into stunning presentations
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// NEW: 4-Quadrant Architecture - use QuadrantLayout for consistent navigation
import { QuadrantLayout } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Zap,
  Mic,
  AlertTriangle,
  RefreshCw,
  Mail,
  Shield,
  Lock,
  CheckCircle2,
  Loader2,
  Presentation,
  FileText,
  PlusCircle,
} from 'lucide-react';
// Force fresh import of 6-step wizard (not old 5-step PresentationGeneratorPanel)
import { PresentationWizard } from '@/components/genie-studio/presentation-generator/PresentationWizard';

// Debug log to verify correct wizard is loaded
console.log('🎯 GenieDeck: Loading 6-step PresentationWizard (not 5-step legacy panel)');
import { BackToSubscription } from '@/components/subscription/BackToSubscription';
import { AskGenie } from '@/components/genie-studio/AskGenie';
import { HIPAAComplianceFooter } from '@/components/genie-studio/HIPAAComplianceFooter';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import genieDeckLogo from '@/assets/logos/genie-deck-combined.png';

// ==================== HIPAA Badge Component ====================
const HIPAABadge = () => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className="bg-green-50 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-700 cursor-help gap-1 h-7"
        >
          <Shield className="h-3 w-3" />
          <span className="hidden sm:inline">HIPAA Compliant</span>
          <span className="sm:hidden">HIPAA</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs p-3 z-50">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <Shield className="h-4 w-4" />
            <span className="font-medium">HIPAA Compliant</span>
          </div>
          <p className="text-xs text-foreground/80">
            All Protected Health Information (PHI) is handled in compliance with HIPAA regulations. 
            Your patient data is encrypted in transit and at rest.
          </p>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1 border-t">
            <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> AES-256</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Audit Logs</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// ==================== Enhanced Loading State ====================
const LoadingState = ({ progress = 0, message = "Preparing your workspace..." }: { progress?: number; message?: string }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-6 p-8">
    <div className="relative">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-600/20 flex items-center justify-center">
        <Presentation className="h-10 w-10 text-purple-500 animate-pulse" />
      </div>
      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
        <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
      </div>
    </div>
    <div className="text-center space-y-2 max-w-sm">
      <h3 className="font-medium text-foreground">Loading Genie Deck</h3>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
    <div className="w-48">
      <Progress value={progress} className="h-1.5" />
      <p className="text-[10px] text-muted-foreground text-center mt-1">{progress}% complete</p>
    </div>
  </div>
);

// ==================== Empty State Component ====================
const EmptyState = ({ onCreateNew }: { onCreateNew: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-6 p-8">
    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-600/10 border border-purple-200/50 dark:border-purple-800/50 flex items-center justify-center">
      <FileText className="h-12 w-12 text-purple-400" />
    </div>
    <div className="text-center space-y-2 max-w-sm">
      <h3 className="text-lg font-semibold text-foreground">Create Your First Presentation</h3>
      <p className="text-sm text-muted-foreground">
        Transform your ideas, notes, or documents into professional AI-powered presentations with multi-language support.
      </p>
    </div>
    <Button 
      size="lg" 
      onClick={onCreateNew}
      className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 gap-2"
    >
      <PlusCircle className="h-5 w-5" />
      Create Your First Genie Deck
    </Button>
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI-Powered</span>
      <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-green-600" /> HIPAA Compliant</span>
      <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Encrypted</span>
    </div>
  </div>
);

// ==================== Error Display ====================
const ErrorDisplay = ({ 
  error, 
  onRetry, 
  onDismiss 
}: { 
  error: string; 
  onRetry: () => void; 
  onDismiss: () => void;
}) => (
  <Alert className="mx-4 my-4 border-amber-300 bg-amber-50/80 dark:bg-amber-950/30 dark:border-amber-700">
    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
    <AlertTitle className="text-amber-900 dark:text-amber-100 font-medium">
      Oops! Something didn't go as planned
    </AlertTitle>
    <AlertDescription className="mt-2 space-y-3">
      <p className="text-amber-800 dark:text-amber-200 text-sm">
        {error || "We encountered an issue while processing your request. Don't worry - your work is safe!"}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onRetry}
          className="border-amber-400 hover:bg-amber-100 dark:border-amber-600 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-100"
        >
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Try Again
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={onDismiss}
          className="text-amber-800 hover:text-amber-900 dark:text-amber-200 dark:hover:text-amber-100"
        >
          Dismiss
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => window.location.href = 'mailto:support@example.com?subject=Genie Deck Issue'}
          className="text-amber-800 hover:text-amber-900 dark:text-amber-200 dark:hover:text-amber-100"
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
  const [isLoading, setIsLoading] = useState(false);
  const [showWizard, setShowWizard] = useState(true); // Always show wizard for now

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
    <QuadrantLayout showNav={true}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/5">
        {/* Compact Header - Matches reference design */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-4">
              <BackToSubscription 
                fallbackPath="/genie-studio" 
                fallbackLabel="Studio" 
              />
              
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-3 cursor-help">
                      {/* Logo container - consistent with Genie ecosystem */}
                      <div className="h-10 w-10 rounded-lg bg-card border border-border/50 flex items-center justify-center overflow-hidden p-1.5 shadow-sm">
                        <img src={genieDeckLogo} alt="Genie Deck" className="h-full w-full object-contain" />
                      </div>
                      <div>
                        <h1 className="text-lg font-semibold text-foreground">
                          Genie Deck
                        </h1>
                        <p className="text-xs text-muted-foreground">Ideas to Impact</p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="bottom" 
                    className="max-w-xs p-3 bg-white dark:bg-gray-900 border shadow-lg z-50"
                    sideOffset={8}
                  >
                    <p className="font-medium text-gray-900 dark:text-white">AI Presentation Generator</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      Transform your ideas, notes, or documents into professional presentations with AI-powered slide generation, multi-language support, and smart visuals.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-2">
              {/* Prominent HIPAA Badge */}
              <HIPAABadge />
              
              <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20 hidden md:flex gap-1">
                <Sparkles className="h-3 w-3" />
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

        {/* Full-Screen Presentation Wizard - No hero banner, maximized space */}
        <div id="wizard-container" className="h-[calc(100vh-56px)]">
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
    </QuadrantLayout>
  );
};

export default GenieDeck;
