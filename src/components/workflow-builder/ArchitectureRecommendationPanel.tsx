/**
 * ARCHITECTURE RECOMMENDATION PANEL
 * Shows users the recommended architecture based on their input
 * Provides transparency on how their input influences recommendations
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Brain, 
  Users, 
  Network, 
  Cpu, 
  MessageSquare, 
  Plug, 
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Info,
  Lightbulb,
  Zap
} from 'lucide-react';
import { 
  agentArchitectureIntelligence, 
  ArchitectureAnalysis, 
  AgentArchitectureType,
  ArchitectureRecommendation 
} from '@/services/agentArchitectureIntelligence';

interface ArchitectureRecommendationPanelProps {
  userInput: string;
  useCase?: string;
  agentDescription?: string;
  existingNodes?: any[];
  onSelectArchitecture: (architecture: AgentArchitectureType, suggestedNodes: string[]) => void;
  className?: string;
}

const ARCHITECTURE_ICONS: Record<AgentArchitectureType, React.ReactNode> = {
  'single': <Cpu className="h-5 w-5" />,
  'conversational': <MessageSquare className="h-5 w-5" />,
  'mcp-sdk': <Plug className="h-5 w-5" />,
  'multi-agent': <Users className="h-5 w-5" />,
  'a2a': <Network className="h-5 w-5" />,
  'agentic': <Brain className="h-5 w-5" />,
  'swarm': <Zap className="h-5 w-5" />
};

export const ArchitectureRecommendationPanel: React.FC<ArchitectureRecommendationPanelProps> = ({
  userInput,
  useCase,
  agentDescription,
  existingNodes,
  onSelectArchitecture,
  className
}) => {
  const [showFactors, setShowFactors] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [selectedArchitecture, setSelectedArchitecture] = useState<AgentArchitectureType | null>(null);
  
  const analysis = useMemo(() => {
    if (!userInput && !useCase && !agentDescription) return null;
    return agentArchitectureIntelligence.analyzeAndRecommend(
      userInput,
      useCase,
      existingNodes,
      agentDescription
    );
  }, [userInput, useCase, agentDescription, existingNodes]);

  if (!analysis) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-center text-muted-foreground">
          <Info className="h-8 w-8 mx-auto mb-2" />
          <p>Enter a description or use case to get architecture recommendations</p>
        </CardContent>
      </Card>
    );
  }

  const { primaryRecommendation, alternativeRecommendations, inputFactors, complexityLevel } = analysis;
  const explanation = agentArchitectureIntelligence.getArchitectureExplanation(primaryRecommendation.architecture);
  const activeFactors = inputFactors.filter(f => f.detected);

  const handleSelect = (rec: ArchitectureRecommendation) => {
    setSelectedArchitecture(rec.architecture);
    onSelectArchitecture(rec.architecture, rec.suggestedNodes);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Architecture Recommendation
        </CardTitle>
        <CardDescription>
          Based on your input, we recommend the following architecture
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Recommendation */}
        <div 
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedArchitecture === primaryRecommendation.architecture 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => handleSelect(primaryRecommendation)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg" 
                style={{ backgroundColor: `${primaryRecommendation.color}20` }}
              >
                {ARCHITECTURE_ICONS[primaryRecommendation.architecture]}
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  {primaryRecommendation.label}
                  <Badge variant="secondary" className="text-xs">Recommended</Badge>
                </h3>
                <p className="text-sm text-muted-foreground">{primaryRecommendation.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: primaryRecommendation.color }}>
                {Math.round(primaryRecommendation.confidence * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Match</div>
            </div>
          </div>
          
          <Progress 
            value={primaryRecommendation.confidence * 100} 
            className="h-2 mb-3"
          />
          
          {/* Reasoning */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Why this recommendation:</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {primaryRecommendation.reasoning.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Suggested Nodes */}
          {primaryRecommendation.suggestedNodes.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <div className="text-sm font-medium mb-2">Suggested Nodes:</div>
              <div className="flex flex-wrap gap-1">
                {primaryRecommendation.suggestedNodes.map(node => (
                  <Badge key={node} variant="outline" className="text-xs">
                    {node.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <Button 
            className="w-full mt-3" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleSelect(primaryRecommendation);
            }}
          >
            Use {primaryRecommendation.label}
          </Button>
        </div>

        {/* Input Factors */}
        <Collapsible open={showFactors} onOpenChange={setShowFactors}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between" size="sm">
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                How your input influenced this ({activeFactors.length} factors detected)
              </span>
              {showFactors ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {inputFactors.map((factor, idx) => (
              <div 
                key={idx} 
                className={`p-2 rounded-lg text-sm ${
                  factor.detected 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{factor.factor}</span>
                  <Badge variant={factor.detected ? 'default' : 'secondary'} className="text-xs">
                    {factor.detected ? `${factor.influence} influence` : 'not detected'}
                  </Badge>
                </div>
                {factor.detected && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Influences: {factor.architecturesInfluenced.join(', ')}
                  </div>
                )}
              </div>
            ))}
            <div className="p-2 rounded-lg bg-muted/50 text-sm">
              <span className="font-medium">Complexity Level:</span>{' '}
              <Badge variant="outline" className="ml-2">{complexityLevel}</Badge>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Alternative Recommendations */}
        <Collapsible open={showAlternatives} onOpenChange={setShowAlternatives}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between" size="sm">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Alternative Architectures ({alternativeRecommendations.length})
              </span>
              {showAlternatives ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {alternativeRecommendations.map((alt, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedArchitecture === alt.architecture 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleSelect(alt)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="p-1.5 rounded" 
                      style={{ backgroundColor: `${alt.color}20` }}
                    >
                      {ARCHITECTURE_ICONS[alt.architecture]}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{alt.label}</div>
                      <div className="text-xs text-muted-foreground">{alt.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold" style={{ color: alt.color }}>
                      {Math.round(alt.confidence * 100)}%
                    </div>
                  </div>
                </div>
                {alt.matchedKeywords.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Matched: {alt.matchedKeywords.slice(0, 3).join(', ')}
                    {alt.matchedKeywords.length > 3 && ` +${alt.matchedKeywords.length - 3} more`}
                  </div>
                )}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Architecture Details */}
        {selectedArchitecture && (
          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                About {agentArchitectureIntelligence.getArchitectureExplanation(selectedArchitecture).whatItIs.split('.')[0]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-xs text-muted-foreground mb-1">Best For:</div>
                <ul className="list-disc list-inside text-xs space-y-0.5">
                  {agentArchitectureIntelligence.getArchitectureExplanation(selectedArchitecture).whenToUse.map((use, idx) => (
                    <li key={idx}>{use}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-medium text-xs text-muted-foreground mb-1">Capabilities:</div>
                <div className="flex flex-wrap gap-1">
                  {agentArchitectureIntelligence.getArchitectureExplanation(selectedArchitecture).capabilities.map((cap, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">{cap}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default ArchitectureRecommendationPanel;
