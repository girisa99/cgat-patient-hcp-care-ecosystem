/**
 * Pipeline Testing Dashboard
 * 
 * Comprehensive testing interface for all 107+ pipelines across 14 categories.
 * Validates provider availability, capability readiness, and identifies gaps.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  Layers,
  Zap,
  Settings,
  FileWarning,
  Activity,
  Server,
  Globe,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  PIPELINE_CAPABILITY_MATRIX, 
  PipelineCapabilityEntry,
  PipelineCategory,
} from './pipelineCapabilityMatrix';
import type { ProviderId } from './types';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// TYPES
// ============================================================================

type TestStatus = 'pending' | 'testing' | 'passed' | 'failed' | 'warning' | 'skipped';

interface PipelineTestResult {
  pipelineId: string;
  status: TestStatus;
  providerResults: Record<string, {
    available: boolean;
    configured: boolean;
    latencyMs?: number;
    error?: string;
  }>;
  capabilityResults: Record<string, {
    implemented: boolean;
    functional: boolean;
    notes?: string;
  }>;
  overallScore: number;
  testedAt?: Date;
  issues: string[];
  warnings: string[];
}

interface CategorySummary {
  category: PipelineCategory;
  displayName: string;
  totalPipelines: number;
  productionReady: number;
  inDevelopment: number;
  blocked: number;
  avgQualityScore: number;
  avgAutomationLevel: number;
  issues: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORY_DISPLAY_NAMES: Record<PipelineCategory, string> = {
  presentation: 'Presentation',
  video_production: 'Video Production',
  content_repurposing: 'Content Repurposing',
  training_ld: 'Training & L&D',
  marketing_advertising: 'Marketing & Advertising',
  social_media: 'Social Media',
  sales_enablement: 'Sales Enablement',
  customer_education: 'Customer Education',
  localization: 'Localization',
  data_analytics: 'Data & Analytics',
  internal_comms: 'Internal Comms',
  live_realtime: 'Live & Realtime',
  immersive_3d: 'Immersive 3D',
  audio_sfx: 'Audio & SFX',
};

const CATEGORY_ICONS: Record<PipelineCategory, React.ReactNode> = {
  presentation: <Layers className="h-4 w-4" />,
  video_production: <Activity className="h-4 w-4" />,
  content_repurposing: <RefreshCw className="h-4 w-4" />,
  training_ld: <Shield className="h-4 w-4" />,
  marketing_advertising: <Zap className="h-4 w-4" />,
  social_media: <Globe className="h-4 w-4" />,
  sales_enablement: <Server className="h-4 w-4" />,
  customer_education: <FileWarning className="h-4 w-4" />,
  localization: <Globe className="h-4 w-4" />,
  data_analytics: <Activity className="h-4 w-4" />,
  internal_comms: <Server className="h-4 w-4" />,
  live_realtime: <Zap className="h-4 w-4" />,
  immersive_3d: <Layers className="h-4 w-4" />,
  audio_sfx: <Activity className="h-4 w-4" />,
};

// Provider availability check (mock - would connect to real API checks)
const PROVIDER_AVAILABILITY: Partial<Record<ProviderId, { configured: boolean; healthy: boolean }>> = {
  openai: { configured: true, healthy: true },
  claude: { configured: true, healthy: true },
  gemini: { configured: true, healthy: true },
  deepseek: { configured: true, healthy: true },
  alibaba: { configured: true, healthy: true },
  azure: { configured: true, healthy: true },
  modelslab: { configured: true, healthy: true },
  elevenlabs: { configured: true, healthy: true },
  deepl: { configured: true, healthy: true },
  replicate: { configured: true, healthy: true },
  supabase: { configured: true, healthy: true },
  stripe: { configured: true, healthy: true },
  huggingface: { configured: false, healthy: false },
  stability: { configured: false, healthy: false },
  assemblyai: { configured: false, healthy: false },
  cohere: { configured: false, healthy: false },
  google: { configured: true, healthy: true },
  microsoft: { configured: true, healthy: true },
  suno: { configured: false, healthy: false },
  udio: { configured: false, healthy: false },
  runway: { configured: false, healthy: false },
  pika: { configured: false, healthy: false },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getStatusColor(status: TestStatus): string {
  switch (status) {
    case 'passed': return 'text-green-500';
    case 'failed': return 'text-red-500';
    case 'warning': return 'text-yellow-500';
    case 'testing': return 'text-blue-500';
    case 'skipped': return 'text-gray-400';
    default: return 'text-muted-foreground';
  }
}

function getStatusIcon(status: TestStatus): React.ReactNode {
  switch (status) {
    case 'passed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
    case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'testing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    case 'skipped': return <Pause className="h-4 w-4 text-gray-400" />;
    default: return <Settings className="h-4 w-4 text-muted-foreground" />;
  }
}

function analyzePipeline(pipeline: PipelineCapabilityEntry): PipelineTestResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  // Check provider availability
  const providerResults: PipelineTestResult['providerResults'] = {};
  let primaryAvailable = false;
  let fallbackAvailable = false;
  
  pipeline.primaryProviders.forEach(provider => {
    const status = PROVIDER_AVAILABILITY[provider];
    providerResults[provider] = {
      available: status?.healthy || false,
      configured: status?.configured || false,
    };
    if (status?.healthy) primaryAvailable = true;
    if (!status?.configured) {
      issues.push(`Primary provider "${provider}" not configured`);
    }
  });
  
  pipeline.fallbackProviders.forEach(provider => {
    const status = PROVIDER_AVAILABILITY[provider];
    providerResults[provider] = {
      available: status?.healthy || false,
      configured: status?.configured || false,
    };
    if (status?.healthy) fallbackAvailable = true;
    if (!status?.configured && !primaryAvailable) {
      warnings.push(`Fallback provider "${provider}" not configured`);
    }
  });
  
  // Check capabilities (mock analysis)
  const capabilityResults: PipelineTestResult['capabilityResults'] = {};
  pipeline.requiredCapabilities.forEach(cap => {
    // In reality, this would check actual implementation status
    const implemented = pipeline.qualityScore >= 50;
    const functional = pipeline.qualityScore >= 70;
    capabilityResults[cap] = { implemented, functional };
    if (!implemented) {
      issues.push(`Required capability "${cap}" not implemented`);
    } else if (!functional) {
      warnings.push(`Capability "${cap}" partially functional`);
    }
  });
  
  // Determine status
  let status: TestStatus = 'pending';
  if (issues.length === 0 && warnings.length === 0 && primaryAvailable) {
    status = 'passed';
  } else if (issues.length > 0 && !primaryAvailable && !fallbackAvailable) {
    status = 'failed';
  } else if (warnings.length > 0 || !primaryAvailable) {
    status = 'warning';
  } else {
    status = 'passed';
  }
  
  // Calculate score
  const providerScore = primaryAvailable ? 40 : (fallbackAvailable ? 20 : 0);
  const capabilityScore = (pipeline.qualityScore / 100) * 40;
  const automationScore = (pipeline.automationLevel / 100) * 20;
  const overallScore = Math.round(providerScore + capabilityScore + automationScore);
  
  return {
    pipelineId: pipeline.pipelineId,
    status,
    providerResults,
    capabilityResults,
    overallScore,
    testedAt: new Date(),
    issues,
    warnings,
  };
}

function getCategorySummary(pipelines: PipelineCapabilityEntry[]): CategorySummary[] {
  const categories = Object.keys(CATEGORY_DISPLAY_NAMES) as PipelineCategory[];
  
  return categories.map(category => {
    const categoryPipelines = pipelines.filter(p => p.category === category);
    const issues: string[] = [];
    
    if (categoryPipelines.length === 0) {
      return {
        category,
        displayName: CATEGORY_DISPLAY_NAMES[category],
        totalPipelines: 0,
        productionReady: 0,
        inDevelopment: 0,
        blocked: 0,
        avgQualityScore: 0,
        avgAutomationLevel: 0,
        issues: ['No pipelines in this category'],
      };
    }
    
    const productionReady = categoryPipelines.filter(p => p.qualityScore >= 80).length;
    const inDevelopment = categoryPipelines.filter(p => p.qualityScore >= 50 && p.qualityScore < 80).length;
    const blocked = categoryPipelines.filter(p => p.qualityScore < 50).length;
    
    const avgQuality = Math.round(
      categoryPipelines.reduce((acc, p) => acc + p.qualityScore, 0) / categoryPipelines.length
    );
    const avgAutomation = Math.round(
      categoryPipelines.reduce((acc, p) => acc + p.automationLevel, 0) / categoryPipelines.length
    );
    
    // Check for provider gaps
    const allProviders = new Set<ProviderId>();
    categoryPipelines.forEach(p => {
      p.primaryProviders.forEach(pr => allProviders.add(pr));
    });
    
    allProviders.forEach(provider => {
      if (!PROVIDER_AVAILABILITY[provider]?.configured) {
        issues.push(`Provider "${provider}" not configured`);
      }
    });
    
    if (blocked > 0) {
      issues.push(`${blocked} pipeline(s) blocked`);
    }
    
    return {
      category,
      displayName: CATEGORY_DISPLAY_NAMES[category],
      totalPipelines: categoryPipelines.length,
      productionReady,
      inDevelopment,
      blocked,
      avgQualityScore: avgQuality,
      avgAutomationLevel: avgAutomation,
      issues,
    };
  }).filter(s => s.totalPipelines > 0);
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface CategoryCardProps {
  summary: CategorySummary;
  isExpanded: boolean;
  onToggle: () => void;
  pipelines: PipelineCapabilityEntry[];
  testResults: Record<string, PipelineTestResult>;
  onTestPipeline: (pipelineId: string) => void;
}

function CategoryCard({ 
  summary, 
  isExpanded, 
  onToggle, 
  pipelines,
  testResults,
  onTestPipeline,
}: CategoryCardProps) {
  const categoryPipelines = pipelines.filter(p => p.category === summary.category);
  const healthPercent = Math.round((summary.productionReady / summary.totalPipelines) * 100);
  
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className={cn(
        'transition-all',
        isExpanded && 'ring-1 ring-primary/20'
      )}>
        <CollapsibleTrigger asChild>
          <CardHeader className="py-3 cursor-pointer hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <div className="p-2 rounded-lg bg-primary/10">
                  {CATEGORY_ICONS[summary.category]}
                </div>
                <div>
                  <CardTitle className="text-sm font-medium">{summary.displayName}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {summary.totalPipelines} pipelines
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Status badges */}
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600 border-green-200">
                    {summary.productionReady}✓
                  </Badge>
                  <Badge variant="outline" className="text-[10px] bg-yellow-500/10 text-yellow-600 border-yellow-200">
                    {summary.inDevelopment}◐
                  </Badge>
                  {summary.blocked > 0 && (
                    <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-600 border-red-200">
                      {summary.blocked}✗
                    </Badge>
                  )}
                </div>
                
                {/* Health bar */}
                <div className="w-20">
                  <Progress value={healthPercent} className="h-2" />
                </div>
                <span className="text-xs font-medium w-8">{healthPercent}%</span>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {/* Issues banner */}
              {summary.issues.length > 0 && (
                <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-200 mb-3">
                  <div className="flex items-center gap-2 text-xs text-yellow-700">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="font-medium">Issues:</span>
                    {summary.issues.join(' | ')}
                  </div>
                </div>
              )}
              
              {/* Pipeline list */}
              <div className="space-y-1">
                {categoryPipelines.map(pipeline => {
                  const result = testResults[pipeline.pipelineId];
                  const status = result?.status || 'pending';
                  
                  return (
                    <div 
                      key={pipeline.pipelineId}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 text-xs"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getStatusIcon(status)}
                        <span className="font-medium truncate">{pipeline.displayName}</span>
                        <span className="text-muted-foreground truncate hidden sm:inline">
                          {pipeline.description}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Provider badges */}
                        <div className="flex items-center gap-0.5">
                          {pipeline.primaryProviders.slice(0, 3).map(provider => (
                            <TooltipProvider key={provider}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-[8px] px-1 py-0",
                                      PROVIDER_AVAILABILITY[provider]?.configured
                                        ? "bg-green-500/10 border-green-200"
                                        : "bg-red-500/10 border-red-200"
                                    )}
                                  >
                                    {provider.slice(0, 3).toUpperCase()}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {provider}: {PROVIDER_AVAILABILITY[provider]?.configured ? 'Configured' : 'Not configured'}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                        
                        {/* Quality score */}
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] w-12 justify-center",
                            pipeline.qualityScore >= 80 ? "bg-green-500/10" :
                            pipeline.qualityScore >= 50 ? "bg-yellow-500/10" :
                            "bg-red-500/10"
                          )}
                        >
                          Q:{pipeline.qualityScore}
                        </Badge>
                        
                        {/* Test button */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => onTestPipeline(pipeline.pipelineId)}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PipelineTestingDashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PipelineCategory | 'all'>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<PipelineCategory>>(new Set());
  const [testResults, setTestResults] = useState<Record<string, PipelineTestResult>>({});
  const [isRunningTests, setIsRunningTests] = useState(false);
  
  // Filter pipelines
  const filteredPipelines = useMemo(() => {
    let result = [...PIPELINE_CAPABILITY_MATRIX];
    
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.displayName.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.pipelineId.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [selectedCategory, searchQuery]);
  
  // Category summaries
  const categorySummaries = useMemo(() => {
    return getCategorySummary(PIPELINE_CAPABILITY_MATRIX);
  }, []);
  
  // Overall metrics
  const overallMetrics = useMemo(() => {
    const total = PIPELINE_CAPABILITY_MATRIX.length;
    const productionReady = PIPELINE_CAPABILITY_MATRIX.filter(p => p.qualityScore >= 80).length;
    const inDevelopment = PIPELINE_CAPABILITY_MATRIX.filter(p => p.qualityScore >= 50 && p.qualityScore < 80).length;
    const blocked = PIPELINE_CAPABILITY_MATRIX.filter(p => p.qualityScore < 50).length;
    
    const tested = Object.keys(testResults).length;
    const passed = Object.values(testResults).filter(r => r.status === 'passed').length;
    const failed = Object.values(testResults).filter(r => r.status === 'failed').length;
    const warnings = Object.values(testResults).filter(r => r.status === 'warning').length;
    
    return { total, productionReady, inDevelopment, blocked, tested, passed, failed, warnings };
  }, [testResults]);
  
  // Toggle category expansion
  const toggleCategory = useCallback((category: PipelineCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);
  
  // Test single pipeline
  const testPipeline = useCallback((pipelineId: string) => {
    const pipeline = PIPELINE_CAPABILITY_MATRIX.find(p => p.pipelineId === pipelineId);
    if (!pipeline) return;
    
    // Set testing state
    setTestResults(prev => ({
      ...prev,
      [pipelineId]: { ...prev[pipelineId], status: 'testing' } as PipelineTestResult,
    }));
    
    // Simulate test (in reality would call actual providers)
    setTimeout(() => {
      const result = analyzePipeline(pipeline);
      setTestResults(prev => ({ ...prev, [pipelineId]: result }));
      
      toast({
        title: `Pipeline Test: ${pipeline.displayName}`,
        description: result.status === 'passed' 
          ? 'All checks passed!' 
          : `${result.issues.length} issues, ${result.warnings.length} warnings`,
        variant: result.status === 'failed' ? 'destructive' : 'default',
      });
    }, 500);
  }, [toast]);
  
  // Run all tests
  const runAllTests = useCallback(async () => {
    setIsRunningTests(true);
    
    for (const pipeline of filteredPipelines) {
      setTestResults(prev => ({
        ...prev,
        [pipeline.pipelineId]: { status: 'testing' } as PipelineTestResult,
      }));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = analyzePipeline(pipeline);
      setTestResults(prev => ({ ...prev, [pipeline.pipelineId]: result }));
    }
    
    setIsRunningTests(false);
    toast({
      title: 'Test Suite Complete',
      description: `Tested ${filteredPipelines.length} pipelines`,
    });
  }, [filteredPipelines, toast]);
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Pipeline Testing Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Validate {PIPELINE_CAPABILITY_MATRIX.length} pipelines across 14 categories
          </p>
        </div>
        
        <Button 
          onClick={runAllTests} 
          disabled={isRunningTests}
          className="gap-2"
        >
          {isRunningTests ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {isRunningTests ? 'Testing...' : 'Run All Tests'}
        </Button>
      </div>
      
      {/* Overall metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        <Card className="p-3">
          <div className="text-2xl font-bold">{overallMetrics.total}</div>
          <div className="text-xs text-muted-foreground">Total Pipelines</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-green-600">{overallMetrics.productionReady}</div>
          <div className="text-xs text-muted-foreground">Production Ready</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-yellow-600">{overallMetrics.inDevelopment}</div>
          <div className="text-xs text-muted-foreground">In Development</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-red-600">{overallMetrics.blocked}</div>
          <div className="text-xs text-muted-foreground">Blocked</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-blue-600">{overallMetrics.tested}</div>
          <div className="text-xs text-muted-foreground">Tested</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-green-600">{overallMetrics.passed}</div>
          <div className="text-xs text-muted-foreground">Passed</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-red-600">{overallMetrics.failed}</div>
          <div className="text-xs text-muted-foreground">Failed</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-yellow-600">{overallMetrics.warnings}</div>
          <div className="text-xs text-muted-foreground">Warnings</div>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pipelines..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={v => setSelectedCategory(v as any)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_DISPLAY_NAMES).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Category cards */}
      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="space-y-3 pr-4">
          {categorySummaries.map(summary => (
            <CategoryCard
              key={summary.category}
              summary={summary}
              isExpanded={expandedCategories.has(summary.category)}
              onToggle={() => toggleCategory(summary.category)}
              pipelines={filteredPipelines}
              testResults={testResults}
              onTestPipeline={testPipeline}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default PipelineTestingDashboard;
