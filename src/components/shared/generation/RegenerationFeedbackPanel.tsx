/**
 * RegenerationFeedbackPanel - Competitive Differentiator UI
 * 
 * "Why didn't you like it?" - Captures RLHF feedback before regeneration
 * Shows smart suggestions based on feedback
 * Displays free credits remaining and discount for feedback
 */

import React, { useState } from 'react';
import { 
  RefreshCw, 
  MessageSquare, 
  Sparkles, 
  Gift, 
  ArrowRight,
  Percent,
  History,
  Lightbulb,
  ThumbsUp,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  useSmartRegeneration, 
  RegenerationReason, 
  REGENERATION_REASONS,
  type SmartSuggestion,
  type FreeCreditsState 
} from '@/hooks/useSmartRegeneration';

// ============================================================================
// TYPES
// ============================================================================

interface RegenerationFeedbackPanelProps {
  contentId: string;
  contentType: 'slide' | 'bullet' | 'video' | 'audio' | '3d' | 'avatar';
  userTier?: string;
  onRegenerate: (feedback?: { reason: RegenerationReason; customFeedback?: string }) => Promise<void>;
  onSuggestionSelect?: (suggestion: SmartSuggestion) => void;
  isRegenerating?: boolean;
  showVersionHistory?: boolean;
  className?: string;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function FreeCreditsIndicator({ credits }: { credits: FreeCreditsState }) {
  if (credits.freeRegenerationsRemaining === Infinity) {
    return (
      <Badge variant="outline" className="bg-accent/50 border-accent">
        <Sparkles className="h-3 w-3 mr-1 text-accent-foreground" />
        <span className="text-accent-foreground">Unlimited Regenerations</span>
      </Badge>
    );
  }

  if (credits.freeRegenerationsRemaining > 0) {
    return (
      <Badge variant="outline" className="bg-primary/10 border-primary/30">
        <Gift className="h-3 w-3 mr-1 text-primary" />
        <span className="text-primary">
          {credits.freeRegenerationsRemaining} free regeneration{credits.freeRegenerationsRemaining !== 1 ? 's' : ''} remaining
        </span>
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-muted/50">
      <RefreshCw className="h-3 w-3 mr-1" />
      <span className="text-muted-foreground">
        {credits.discountPercent > 0 
          ? `${credits.discountPercent}% off with feedback` 
          : 'Credits required'}
      </span>
    </Badge>
  );
}

function SmartSuggestionCard({ 
  suggestion, 
  onSelect, 
  isSelected 
}: { 
  suggestion: SmartSuggestion; 
  onSelect: () => void;
  isSelected?: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-all",
        "hover:border-primary/50 hover:bg-accent",
        isSelected && "border-primary bg-accent"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-accent-foreground" />
            <span className="font-medium text-sm">{suggestion.label}</span>
            <Badge variant="secondary" className="text-xs">
              {Math.round(suggestion.confidence * 100)}% match
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {suggestion.description}
          </p>
        </div>
        <Badge variant="outline" className="text-xs text-primary bg-primary/10">
          {suggestion.estimatedImprovement}
        </Badge>
      </div>
    </button>
  );
}

function ReasonSelector({ 
  selectedReason, 
  onSelect 
}: { 
  selectedReason: RegenerationReason | null;
  onSelect: (reason: RegenerationReason) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(REGENERATION_REASONS).map(([key, config]) => (
        <button
          key={key}
          onClick={() => onSelect(key as RegenerationReason)}
          className={cn(
            "flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all text-sm",
            "hover:border-primary/50 hover:bg-primary/5",
            selectedReason === key && "border-primary bg-primary/10 ring-1 ring-primary/20"
          )}
        >
          <span className="text-lg">{config.icon}</span>
          <span className={cn(
            "text-sm",
            selectedReason === key ? "font-medium" : "text-muted-foreground"
          )}>
            {config.label}
          </span>
          {selectedReason === key && (
            <Check className="h-3 w-3 ml-auto text-primary" />
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function RegenerationFeedbackPanel({
  contentId,
  contentType,
  userTier = 'free',
  onRegenerate,
  onSuggestionSelect,
  isRegenerating = false,
  showVersionHistory = false,
  className,
}: RegenerationFeedbackPanelProps) {
  // Local state
  const [selectedReason, setSelectedReason] = useState<RegenerationReason | null>(null);
  const [customFeedback, setCustomFeedback] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  // Hook for smart regeneration
  const smartRegen = useSmartRegeneration({
    contentId,
    contentType,
    userTier,
  });

  // Handle reason selection
  const handleReasonSelect = (reason: RegenerationReason) => {
    setSelectedReason(reason);
    smartRegen.provideFeedback({
      reason,
      customFeedback: customFeedback || undefined,
    });
  };

  // Handle regeneration
  const handleRegenerate = async () => {
    await onRegenerate(
      selectedReason 
        ? { reason: selectedReason, customFeedback: customFeedback || undefined }
        : undefined
    );
    
    // Reset state
    setSelectedReason(null);
    setCustomFeedback('');
    setSelectedSuggestion(null);
    smartRegen.clearFeedback();
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SmartSuggestion) => {
    setSelectedSuggestion(suggestion.id);
    onSuggestionSelect?.(suggestion);
  };

  return (
    <Card className={cn("p-4 space-y-4", className)}>
      {/* Header with Free Credits Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Regenerate</span>
        </div>
        <FreeCreditsIndicator credits={smartRegen.freeCredits} />
      </div>

      {/* Competitive Differentiator: "Why didn't you like it?" */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span>Tell us why — we'll make it better (and you get 50% off!)</span>
        </div>

        <ReasonSelector 
          selectedReason={selectedReason} 
          onSelect={handleReasonSelect} 
        />

        {/* Optional detailed feedback */}
        {selectedReason && (
          <div className="space-y-2 animate-in slide-in-from-top-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <MessageSquare className="h-3 w-3" />
              {showDetails ? 'Hide details' : 'Add more details (optional)'}
            </button>
            
            {showDetails && (
              <Textarea
                placeholder="Tell us more about what you'd like changed..."
                value={customFeedback}
                onChange={(e) => setCustomFeedback(e.target.value)}
                className="min-h-[60px] text-sm"
              />
            )}
          </div>
        )}
      </div>

      {/* Smart Suggestions (appears after feedback) */}
      {smartRegen.smartSuggestions.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-accent-foreground" />
            <span>AI Suggestions</span>
          </div>
          <div className="space-y-2">
            {smartRegen.smartSuggestions.map(suggestion => (
              <SmartSuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onSelect={() => handleSuggestionSelect(suggestion)}
                isSelected={selectedSuggestion === suggestion.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Version History Toggle */}
      {showVersionHistory && smartRegen.versions.length > 1 && (
        <div className="pt-2 border-t">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <History className="h-4 w-4" />
            <span>View {smartRegen.versions.length} previous versions</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2">
        <Button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="flex-1"
          variant={selectedReason ? 'default' : 'outline'}
        >
          {isRegenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              {selectedReason ? 'Regenerate with Feedback' : 'Quick Regenerate'}
              {smartRegen.freeCredits.isPaidRegeneration && smartRegen.freeCredits.discountPercent > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  <Percent className="h-3 w-3 mr-1" />
                  {smartRegen.freeCredits.discountPercent}% off
                </Badge>
              )}
            </>
          )}
        </Button>
      </div>

      {/* Remaining regenerations */}
      <div className="text-xs text-center text-muted-foreground">
        {smartRegen.isUnlimited ? (
          <span className="flex items-center justify-center gap-1">
            <ThumbsUp className="h-3 w-3" />
            Enterprise: Unlimited regenerations
          </span>
        ) : (
          <span>
            {smartRegen.regenerationsRemaining} of {smartRegen.caps.slideLevel} regenerations remaining for this {contentType}
          </span>
        )}
      </div>
    </Card>
  );
}

export default RegenerationFeedbackPanel;
