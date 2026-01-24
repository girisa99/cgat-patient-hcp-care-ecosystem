/**
 * Combination Workflow Selector
 * 
 * Visual UI for selecting and previewing combination workflows in the wizard.
 * Shows recommended workflows, custom builder, and edge function routing.
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { 
  Sparkles, 
  Video, 
  User, 
  Box, 
  Play, 
  FileText,
  Music,
  Languages,
  Zap,
  Crown,
  Lock,
  Check,
  ChevronRight,
  Info,
  Star,
  TrendingUp,
  Clock,
  CreditCard,
  Layers,
  Wand2,
  AlertCircle
} from 'lucide-react';
import {
  CombinationWorkflow,
  CombinationElement,
  CombinationRecommendation,
  OutputCategory,
  CombinationTier,
  UserContext,
  getRecommendedWorkflows,
  buildCustomWorkflow,
  getAvailableElements,
  getCategorySummary,
  tierMeetsRequirement,
  PRESET_WORKFLOWS,
  COMBINATION_ELEMENTS
} from '@/services/ai-hub/combinationWorkflowService';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

interface CombinationWorkflowSelectorProps {
  userTier: CombinationTier;
  industry?: string;
  segment?: string;
  language?: string;
  region?: 'west' | 'cjk' | 'mena' | 'india_sea' | 'fallback';
  budgetCredits?: number;
  onWorkflowSelect: (workflow: CombinationWorkflow) => void;
  selectedWorkflow?: CombinationWorkflow;
  className?: string;
}

// ============================================
// ICON MAPPINGS
// ============================================

const CATEGORY_ICONS: Record<OutputCategory, React.ReactNode> = {
  static: <FileText className="h-4 w-4" />,
  animated: <Play className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  avatar: <User className="h-4 w-4" />,
  immersive: <Box className="h-4 w-4" />,
  interactive: <Zap className="h-4 w-4" />,
};

const CATEGORY_COLORS: Record<OutputCategory, string> = {
  static: 'bg-slate-500/20 text-slate-300',
  animated: 'bg-purple-500/20 text-purple-300',
  video: 'bg-blue-500/20 text-blue-300',
  avatar: 'bg-green-500/20 text-green-300',
  immersive: 'bg-orange-500/20 text-orange-300',
  interactive: 'bg-pink-500/20 text-pink-300',
};

const TIER_COLORS: Record<CombinationTier, string> = {
  free: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  starter: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  creator: 'bg-green-500/20 text-green-300 border-green-500/30',
  pro: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  business: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  enterprise: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/30',
};

// ============================================
// COMPONENT
// ============================================

export const CombinationWorkflowSelector: React.FC<CombinationWorkflowSelectorProps> = ({
  userTier,
  industry,
  segment,
  language,
  region = 'west',
  budgetCredits,
  onWorkflowSelect,
  selectedWorkflow,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'recommended' | 'all' | 'custom'>('recommended');
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);

  // Build user context
  const context: UserContext = useMemo(() => ({
    tier: userTier,
    industry,
    segment,
    language,
    region,
    budgetCredits,
    selectedElements,
  }), [userTier, industry, segment, language, region, budgetCredits, selectedElements]);

  // Get recommendations
  const recommendations = useMemo(() => 
    getRecommendedWorkflows(context), [context]);

  // Get category summary
  const categorySummary = useMemo(() => getCategorySummary(), []);

  // Get available elements for user tier
  const availableElements = useMemo(() => 
    getAvailableElements(userTier), [userTier]);

  // Build custom workflow from selected elements
  const customWorkflow = useMemo(() => 
    selectedElements.length > 0 
      ? buildCustomWorkflow(selectedElements, context) 
      : null, 
    [selectedElements, context]);

  // Toggle element selection
  const toggleElement = (elementId: string) => {
    setSelectedElements(prev => 
      prev.includes(elementId)
        ? prev.filter(id => id !== elementId)
        : [...prev, elementId]
    );
  };

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-400" />
              Combination Workflows
            </h3>
            <p className="text-sm text-muted-foreground">
              Choose how your content will be generated and presented
            </p>
          </div>
          <Badge variant="outline" className={TIER_COLORS[userTier]}>
            <Crown className="h-3 w-3 mr-1" />
            {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Tier
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommended" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Recommended
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              All Workflows
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Custom Build
            </TabsTrigger>
          </TabsList>

          {/* Recommended Tab */}
          <TabsContent value="recommended" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {industry 
                ? `Best workflows for ${industry}` 
                : 'Top recommendations based on your context'}
            </p>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {recommendations.slice(0, 6).map((rec, index) => (
                  <WorkflowCard
                    key={rec.workflow.id}
                    recommendation={rec}
                    isSelected={selectedWorkflow?.id === rec.workflow.id}
                    isExpanded={expandedWorkflow === rec.workflow.id}
                    onSelect={() => onWorkflowSelect(rec.workflow)}
                    onToggleExpand={() => setExpandedWorkflow(
                      expandedWorkflow === rec.workflow.id ? null : rec.workflow.id
                    )}
                    userTier={userTier}
                    rank={index + 1}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* All Workflows Tab */}
          <TabsContent value="all" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {Object.entries(categorySummary).map(([category, { count }]) => (
                <Badge 
                  key={category}
                  variant="outline"
                  className={CATEGORY_COLORS[category as OutputCategory]}
                >
                  {CATEGORY_ICONS[category as OutputCategory]}
                  <span className="ml-1">{category} ({count})</span>
                </Badge>
              ))}
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {PRESET_WORKFLOWS.map((workflow) => {
                  const canAccess = tierMeetsRequirement(userTier, workflow.requiredTier);
                  return (
                    <WorkflowCard
                      key={workflow.id}
                      recommendation={{
                        workflow,
                        score: canAccess ? 80 : 40,
                        matchReasons: [],
                        tierUpgradeNeeded: canAccess ? undefined : workflow.requiredTier,
                      }}
                      isSelected={selectedWorkflow?.id === workflow.id}
                      isExpanded={expandedWorkflow === workflow.id}
                      onSelect={() => onWorkflowSelect(workflow)}
                      onToggleExpand={() => setExpandedWorkflow(
                        expandedWorkflow === workflow.id ? null : workflow.id
                      )}
                      userTier={userTier}
                    />
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Custom Build Tab */}
          <TabsContent value="custom" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Build your own combination by selecting elements
            </p>
            
            {/* Custom Workflow Preview */}
            {customWorkflow && (
              <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Your Custom Workflow</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <CreditCard className="h-3 w-3 mr-1" />
                        {customWorkflow.totalCreditCost} credits
                      </Badge>
                      <Badge variant="outline" className={TIER_COLORS[customWorkflow.requiredTier]}>
                        {customWorkflow.requiredTier}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {customWorkflow.elements.map(el => (
                      <Badge 
                        key={el.id} 
                        variant="secondary" 
                        className={CATEGORY_COLORS[el.category]}
                      >
                        {el.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ~{Math.round(customWorkflow.estimatedTime / 60)} min
                    </span>
                    <Button 
                      size="sm"
                      onClick={() => onWorkflowSelect(customWorkflow)}
                      disabled={!tierMeetsRequirement(userTier, customWorkflow.requiredTier)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Use This Workflow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Element Categories */}
            <ScrollArea className="h-[350px]">
              <div className="space-y-4 pr-4">
                {Object.entries(categorySummary).map(([category, { elements }]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("p-1 rounded", CATEGORY_COLORS[category as OutputCategory])}>
                        {CATEGORY_ICONS[category as OutputCategory]}
                      </span>
                      <span className="font-medium text-sm capitalize">{category}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pl-6">
                      {elements.map(element => {
                        const canUse = tierMeetsRequirement(userTier, element.tier);
                        return (
                          <div
                            key={element.id}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg border transition-colors",
                              selectedElements.includes(element.id)
                                ? "border-primary bg-primary/10"
                                : "border-border/50 hover:border-border",
                              !canUse && "opacity-50"
                            )}
                          >
                            <Checkbox
                              id={element.id}
                              checked={selectedElements.includes(element.id)}
                              onCheckedChange={() => canUse && toggleElement(element.id)}
                              disabled={!canUse}
                            />
                            <div className="flex-1 min-w-0">
                              <label 
                                htmlFor={element.id}
                                className="text-sm font-medium cursor-pointer flex items-center gap-1"
                              >
                                {element.name}
                                {!canUse && <Lock className="h-3 w-3 text-muted-foreground" />}
                              </label>
                              <p className="text-xs text-muted-foreground truncate">
                                {element.creditCost} credits
                              </p>
                            </div>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-[200px]">
                                <p className="text-xs">{element.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Providers: {element.providers.join(', ')}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

// ============================================
// WORKFLOW CARD SUB-COMPONENT
// ============================================

interface WorkflowCardProps {
  recommendation: CombinationRecommendation;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  userTier: CombinationTier;
  rank?: number;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  recommendation,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  userTier,
  rank,
}) => {
  const { workflow, score, matchReasons, tierUpgradeNeeded } = recommendation;
  const canAccess = !tierUpgradeNeeded;

  return (
    <Card 
      className={cn(
        "transition-all cursor-pointer",
        isSelected 
          ? "border-primary bg-primary/5" 
          : "border-border/50 hover:border-border",
        !canAccess && "opacity-75"
      )}
      onClick={() => canAccess && onSelect()}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {rank && (
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">
                {rank}
              </div>
            )}
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {workflow.name}
                {isSelected && <Check className="h-4 w-4 text-primary" />}
              </CardTitle>
              <CardDescription className="text-xs">
                {workflow.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className={TIER_COLORS[workflow.requiredTier]}>
              {canAccess ? <Check className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
              {workflow.requiredTier}
            </Badge>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                {workflow.totalCreditCost}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.round(workflow.estimatedTime / 60)}m
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Score indicator */}
        <div className="flex items-center gap-2">
          <Progress value={score} className="h-1.5 flex-1" />
          <span className="text-xs font-medium text-muted-foreground w-8">
            {score}%
          </span>
        </div>

        {/* Element badges */}
        <div className="flex flex-wrap gap-1">
          {workflow.elements.slice(0, isExpanded ? undefined : 4).map(el => (
            <Badge 
              key={el.id} 
              variant="secondary" 
              className={cn("text-xs", CATEGORY_COLORS[el.category])}
            >
              {CATEGORY_ICONS[el.category]}
              <span className="ml-1">{el.name}</span>
            </Badge>
          ))}
          {!isExpanded && workflow.elements.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{workflow.elements.length - 4} more
            </Badge>
          )}
        </div>

        {/* Match reasons */}
        {matchReasons.length > 0 && (
          <div className="space-y-1">
            {matchReasons.slice(0, 2).map((reason, i) => (
              <p key={i} className="text-xs text-green-400 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {reason}
              </p>
            ))}
          </div>
        )}

        {/* Tier upgrade notice */}
        {tierUpgradeNeeded && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <span className="text-xs text-amber-300">
              Upgrade to {tierUpgradeNeeded} to unlock
            </span>
          </div>
        )}

        {/* Expand/collapse button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
        >
          {isExpanded ? 'Show Less' : 'Show Details'}
          <ChevronRight className={cn(
            "h-4 w-4 ml-1 transition-transform",
            isExpanded && "rotate-90"
          )} />
        </Button>

        {/* Expanded details */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t border-border/50">
            {/* Providers */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Providers Used:</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(workflow.providers).map(([type, provider]) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}: {provider}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Edge Functions */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Edge Functions:</p>
              <div className="flex flex-wrap gap-1">
                {workflow.edgeFunctionChain.map(fn => (
                  <Badge key={fn} variant="secondary" className="text-xs font-mono">
                    {fn}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Recommended for */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Best For:</p>
              <p className="text-xs text-muted-foreground">
                {workflow.recommendedFor.join(' • ')}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CombinationWorkflowSelector;
