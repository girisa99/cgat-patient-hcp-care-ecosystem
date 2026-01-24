/**
 * Content Moderation Gate
 * Wraps content creation/upload features with real-time moderation
 * Blocks adult, explicit, and prohibited content before processing
 */

import React, { useState, useCallback } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Eye,
  RefreshCw,
  FileWarning
} from 'lucide-react';
import { 
  enhancedContentModeration, 
  type ModerationResult,
  type ContentViolation 
} from '@/services/enhancedContentModerationService';
import { recordViolation } from '@/services/contentViolationTracker';
import { useToast } from '@/hooks/use-toast';

interface ContentModerationGateProps {
  children: React.ReactNode;
  onModerationResult?: (result: ModerationResult) => void;
  showPreview?: boolean;
}

interface ContentModerationContextValue {
  moderateText: (text: string) => Promise<ModerationResult>;
  moderateFile: (file: File) => Promise<ModerationResult>;
  moderateRecording: (transcription: string, metadata?: { filename?: string; duration?: number }) => Promise<ModerationResult>;
  lastResult: ModerationResult | null;
  isChecking: boolean;
  clearResult: () => void;
}

const ContentModerationContext = React.createContext<ContentModerationContextValue | null>(null);

export const useContentModeration = () => {
  const context = React.useContext(ContentModerationContext);
  if (!context) {
    throw new Error('useContentModeration must be used within ContentModerationGate');
  }
  return context;
};

export const ContentModerationGate: React.FC<ContentModerationGateProps> = ({
  children,
  onModerationResult,
  showPreview = true,
}) => {
  const [lastResult, setLastResult] = useState<ModerationResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showViolationPanel, setShowViolationPanel] = useState(false);
  const { toast } = useToast();

  const handleResult = useCallback(async (result: ModerationResult) => {
    setLastResult(result);
    onModerationResult?.(result);

    if (result.hasViolations) {
      // Record violation for tracking
      const severity = result.violations.some(v => v.severity === 'critical') 
        ? 'severe' 
        : result.violations.some(v => v.severity === 'high') 
          ? 'moderate' 
          : 'minor';
      
      const violationAction = await recordViolation(
        result.violations[0]?.type || 'content_violation',
        severity,
        result.violations[0]?.description
      );

      if (violationAction.action === 'restrict' || violationAction.action === 'locked') {
        toast({
          title: 'Access Restricted',
          description: violationAction.message,
          variant: 'destructive',
        });
      } else if (!result.isAllowed) {
        setShowViolationPanel(true);
        toast({
          title: 'Content Blocked',
          description: result.blockedReason || 'Content violates our policies',
          variant: 'destructive',
        });
      }
    }

    return result;
  }, [onModerationResult, toast]);

  const moderateText = useCallback(async (text: string): Promise<ModerationResult> => {
    setIsChecking(true);
    try {
      const result = await enhancedContentModeration.moderateContent(text, 'text');
      return handleResult(result);
    } finally {
      setIsChecking(false);
    }
  }, [handleResult]);

  const moderateFile = useCallback(async (file: File): Promise<ModerationResult> => {
    setIsChecking(true);
    try {
      const result = await enhancedContentModeration.moderateFileUpload(file);
      return handleResult(result);
    } finally {
      setIsChecking(false);
    }
  }, [handleResult]);

  const moderateRecording = useCallback(async (
    transcription: string, 
    metadata?: { filename?: string; duration?: number }
  ): Promise<ModerationResult> => {
    setIsChecking(true);
    try {
      const result = await enhancedContentModeration.moderateRecording(transcription, metadata);
      return handleResult(result);
    } finally {
      setIsChecking(false);
    }
  }, [handleResult]);

  const clearResult = useCallback(() => {
    setLastResult(null);
    setShowViolationPanel(false);
  }, []);

  const contextValue: ContentModerationContextValue = {
    moderateText,
    moderateFile,
    moderateRecording,
    lastResult,
    isChecking,
    clearResult,
  };

  return (
    <ContentModerationContext.Provider value={contextValue}>
      {/* Violation Panel Overlay */}
      {showViolationPanel && lastResult && !lastResult.isAllowed && (
        <ViolationPanel 
          result={lastResult} 
          onDismiss={() => setShowViolationPanel(false)} 
        />
      )}

      {/* Moderation Status Indicator */}
      {showPreview && lastResult && (
        <ModerationStatusBadge result={lastResult} isChecking={isChecking} />
      )}

      {children}
    </ContentModerationContext.Provider>
  );
};

// ═══ Violation Panel Component ═══
const ViolationPanel: React.FC<{ result: ModerationResult; onDismiss: () => void }> = ({
  result,
  onDismiss,
}) => (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <Card className="max-w-lg w-full border-destructive">
      <CardHeader className="bg-destructive/10">
        <CardTitle className="flex items-center gap-2 text-destructive">
          <XCircle className="h-5 w-5" />
          Content Blocked
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Policy Violation Detected</AlertTitle>
          <AlertDescription>
            {result.blockedReason || 'Your content violates our community guidelines.'}
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <p className="text-sm font-medium">Violations Found:</p>
          <div className="space-y-1">
            {result.violations.slice(0, 5).map((violation, i) => (
              <ViolationItem key={i} violation={violation} />
            ))}
            {result.violations.length > 5 && (
              <p className="text-xs text-muted-foreground">
                +{result.violations.length - 5} more violations
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Risk Score: {result.riskScore}/100
            </span>
          </div>
          <Progress value={result.riskScore} className="w-24 h-2" />
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onDismiss} className="flex-1">
            I Understand
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.open('/content-policy', '_blank')}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Repeated violations may result in account restrictions.
          <a href="/terms-of-service" className="text-primary hover:underline ml-1">
            View Terms
          </a>
        </p>
      </CardContent>
    </Card>
  </div>
);

// ═══ Violation Item Component ═══
const ViolationItem: React.FC<{ violation: ContentViolation }> = ({ violation }) => {
  const severityColors = {
    critical: 'bg-red-500/10 text-red-700 border-red-200',
    high: 'bg-orange-500/10 text-orange-700 border-orange-200',
    medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    low: 'bg-blue-500/10 text-blue-700 border-blue-200',
  };

  return (
    <div className={`flex items-start gap-2 p-2 rounded border ${severityColors[violation.severity]}`}>
      <FileWarning className="h-4 w-4 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium">{violation.type.replace(/_/g, ' ').toUpperCase()}</p>
        <p className="text-xs opacity-80 truncate">{violation.description}</p>
      </div>
      <Badge variant="outline" className="text-[10px] shrink-0">
        {Math.round(violation.confidence * 100)}%
      </Badge>
    </div>
  );
};

// ═══ Moderation Status Badge ═══
const ModerationStatusBadge: React.FC<{ result: ModerationResult; isChecking: boolean }> = ({
  result,
  isChecking,
}) => {
  if (isChecking) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Badge variant="outline" className="bg-background px-3 py-1">
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          Checking content...
        </Badge>
      </div>
    );
  }

  const statusConfig = {
    safe: { icon: CheckCircle2, color: 'text-green-600 bg-green-500/10', label: 'Safe' },
    sensitive: { icon: Eye, color: 'text-yellow-600 bg-yellow-500/10', label: 'Sensitive' },
    restricted: { icon: AlertTriangle, color: 'text-orange-600 bg-orange-500/10', label: 'Restricted' },
    blocked: { icon: XCircle, color: 'text-red-600 bg-red-500/10', label: 'Blocked' },
  };

  const config = statusConfig[result.contentCategory];
  const Icon = config.icon;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Badge variant="outline" className={`${config.color} px-3 py-1`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    </div>
  );
};

export default ContentModerationGate;
