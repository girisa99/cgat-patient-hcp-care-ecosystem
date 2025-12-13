/**
 * Agent Architecture Recommendation Panel for Document Processing
 * Recommends appropriate agent architectures based on document type
 * Includes: Multi-Agent, A2A, Human-in-Loop, Swarm, Agentic AI, ReAct Loop, etc.
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  Users, 
  Brain, 
  Zap, 
  Network, 
  GitBranch, 
  RefreshCw, 
  Target, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  UserCheck,
  FlaskConical,
  Lightbulb,
  Play,
  Settings2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DocumentTypeConfig } from '@/config/documentTypes';
import { agentArchitectureIntelligence, ArchitectureAnalysis, ArchitectureRecommendation } from '@/services/agentArchitectureIntelligence';

interface AgentArchitectureRecommendationPanelProps {
  documentType: DocumentTypeConfig;
  onConfirmAndBuild: (recommendation: ArchitectureRecommendation, options: BuildOptions) => void;
  className?: string;
}

interface BuildOptions {
  includeHumanInLoop: boolean;
  enableMCPSync: boolean;
  multiChannelDeploy: boolean;
  selectedTargets: string[];
}

// Document type to analysis input mapping
const DOCUMENT_TYPE_ANALYSIS_MAP: Record<string, string> = {
  'prescription': 'prescription processing medication verification drug interaction check automated calculation',
  'insurance': 'insurance verification eligibility check coverage validation CRM integration',
  'patient-onboarding': 'patient enrollment intake form data collection CRM sync conversation memory',
  'lab-results': 'lab results analysis medical data extraction clinical decision support',
  'xray': 'medical imaging DICOM analysis X-ray interpretation AI vision autonomous analysis',
  'ct-scan': 'CT scan analysis complex imaging multi-perspective analysis autonomous reasoning',
  'mri': 'MRI analysis imaging AI complex analysis autonomous reasoning planning',
  'ecg': 'ECG analysis heart rhythm pattern recognition clinical decision',
  'invoice': 'invoice processing financial data extraction automated workflow',
  'order-management': 'order management workflow coordination multiple steps parallel processing',
  'treatment-center': 'treatment center onboarding complex workflow multi-step credentialing coordination',
  'customer-onboarding': 'customer onboarding CRM integration data sync workflow automation',
};

const architectureService = agentArchitectureIntelligence;

export default function AgentArchitectureRecommendationPanel({
  documentType,
  onConfirmAndBuild,
  className = '',
}: AgentArchitectureRecommendationPanelProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [buildOptions, setBuildOptions] = useState<BuildOptions>({
    includeHumanInLoop: true,
    enableMCPSync: true,
    multiChannelDeploy: false,
    selectedTargets: ['supabase'],
  });

  // Generate recommendations based on document type
  const analysis: ArchitectureAnalysis = useMemo(() => {
    const inputContext = DOCUMENT_TYPE_ANALYSIS_MAP[documentType.id] || 
      `${documentType.title} ${documentType.description} document processing`;
    return architectureService.analyzeAndRecommend(inputContext, documentType.id, [], documentType.description);
  }, [documentType]);

  const getArchitectureIcon = (arch: string) => {
    switch (arch) {
      case 'single': return <Bot className="h-5 w-5" />;
      case 'multi-agent': return <Users className="h-5 w-5" />;
      case 'a2a': return <Network className="h-5 w-5" />;
      case 'agentic': return <Brain className="h-5 w-5" />;
      case 'swarm': return <GitBranch className="h-5 w-5" />;
      case 'conversational': return <RefreshCw className="h-5 w-5" />;
      case 'mcp-sdk': return <Zap className="h-5 w-5" />;
      default: return <Bot className="h-5 w-5" />;
    }
  };

  const MCP_TARGETS = [
    { id: 'supabase', label: 'Supabase DB', icon: '🗄️' },
    { id: 'salesforce', label: 'Salesforce', icon: '☁️' },
    { id: 'hubspot', label: 'HubSpot', icon: '🔶' },
    { id: 'veeva', label: 'Veeva CRM', icon: '💊' },
    { id: 'external-api', label: 'External API', icon: '🔗' },
    { id: 'webhook', label: 'Webhook', icon: '🪝' },
  ];

  const toggleTarget = (targetId: string) => {
    setBuildOptions(prev => ({
      ...prev,
      selectedTargets: prev.selectedTargets.includes(targetId)
        ? prev.selectedTargets.filter(t => t !== targetId)
        : [...prev.selectedTargets, targetId]
    }));
  };

  return (
    <Card className={`border-primary/20 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Agent Recommendation
        </CardTitle>
        <CardDescription>
          Based on <span className="font-medium text-foreground">{documentType.title}</span> document type
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Recommendation */}
        <div 
          className="p-4 rounded-lg border-2 border-primary bg-primary/5 cursor-pointer"
          onClick={() => setShowDetails(!showDetails)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                {getArchitectureIcon(analysis.primaryRecommendation.architecture)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{analysis.primaryRecommendation.label}</h4>
                  <Badge variant="default" className="text-xs">
                    {Math.round(analysis.primaryRecommendation.confidence * 100)}% Match
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{analysis.primaryRecommendation.description}</p>
              </div>
            </div>
            {showDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>

          {/* Suggested Nodes */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {analysis.primaryRecommendation.suggestedNodes.map(node => (
              <Badge key={node} variant="secondary" className="text-xs">
                {node.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>

          {/* Reasoning */}
          {showDetails && (
            <div className="mt-4 pt-3 border-t space-y-3">
              <div>
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Why this recommendation?
                </h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {analysis.primaryRecommendation.reasoning.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Analysis Details */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-2 rounded bg-muted/50 text-center">
                  <div className="font-medium">{analysis.complexityLevel}</div>
                  <div className="text-muted-foreground">Complexity</div>
                </div>
                <div className="p-2 rounded bg-muted/50 text-center">
                  <div className="font-medium">{analysis.requiresAutonomy ? 'Yes' : 'No'}</div>
                  <div className="text-muted-foreground">Autonomy</div>
                </div>
                <div className="p-2 rounded bg-muted/50 text-center">
                  <div className="font-medium">{analysis.requiresRealTimeSync ? 'Yes' : 'No'}</div>
                  <div className="text-muted-foreground">Real-time</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Alternative Recommendations */}
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-muted-foreground">Alternatives</h5>
          <div className="flex gap-2 flex-wrap">
            {analysis.alternativeRecommendations.slice(0, 3).map((alt) => (
              <Badge 
                key={alt.architecture} 
                variant="outline" 
                className="cursor-pointer hover:bg-muted"
              >
                {getArchitectureIcon(alt.architecture)}
                <span className="ml-1.5">{alt.label}</span>
                <span className="ml-1 text-muted-foreground">
                  {Math.round(alt.confidence * 100)}%
                </span>
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Build Options */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Build Options
          </h5>
          
          <div className="grid grid-cols-3 gap-2">
            <label className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted/50">
              <input
                type="checkbox"
                checked={buildOptions.includeHumanInLoop}
                onChange={(e) => setBuildOptions(prev => ({ ...prev, includeHumanInLoop: e.target.checked }))}
                className="rounded"
              />
              <UserCheck className="h-4 w-4 text-blue-500" />
              <span className="text-xs">Human-in-Loop</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted/50">
              <input
                type="checkbox"
                checked={buildOptions.enableMCPSync}
                onChange={(e) => setBuildOptions(prev => ({ ...prev, enableMCPSync: e.target.checked }))}
                className="rounded"
              />
              <Zap className="h-4 w-4 text-purple-500" />
              <span className="text-xs">MCP Sync</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted/50">
              <input
                type="checkbox"
                checked={buildOptions.multiChannelDeploy}
                onChange={(e) => setBuildOptions(prev => ({ ...prev, multiChannelDeploy: e.target.checked }))}
                className="rounded"
              />
              <Network className="h-4 w-4 text-green-500" />
              <span className="text-xs">Multi-Channel</span>
            </label>
          </div>

          {/* MCP Targets */}
          {buildOptions.enableMCPSync && (
            <div className="p-3 rounded-lg bg-muted/30 space-y-2">
              <span className="text-xs font-medium">MCP Sync Targets</span>
              <div className="flex flex-wrap gap-1.5">
                {MCP_TARGETS.map(target => (
                  <Badge
                    key={target.id}
                    variant={buildOptions.selectedTargets.includes(target.id) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleTarget(target.id)}
                  >
                    <span className="mr-1">{target.icon}</span>
                    {target.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button 
          className="w-full"
          onClick={() => onConfirmAndBuild(analysis.primaryRecommendation, buildOptions)}
        >
          <Play className="h-4 w-4 mr-2" />
          Generate & Build Agent in Canvas
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
