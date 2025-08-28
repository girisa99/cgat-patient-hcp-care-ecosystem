import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Zap, 
  ChevronDown, 
  ChevronRight,
  GitBranch,
  Bot,
  FileText,
  ArrowRight
} from 'lucide-react';

interface ConnectionAwareValidatorProps {
  analysisResult: any;
  onApplyNodeFix: (nodeId: string, fix: any) => void;
  onAddTemplateNode: (template: any) => void;
}

export const ConnectionAwareValidator: React.FC<ConnectionAwareValidatorProps> = ({
  analysisResult,
  onApplyNodeFix,
  onAddTemplateNode
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [applyingFix, setApplyingFix] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleApplyNodeFix = async (nodeId: string, fix: any) => {
    setApplyingFix(`${nodeId}-${fix.type}`);
    try {
      await onApplyNodeFix(nodeId, fix);
    } finally {
      setApplyingFix(null);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return 'default';
    if (confidence >= 0.6) return 'secondary';
    return 'destructive';
  };

  if (!analysisResult) return null;

  const { connectionAnalysis, nodeSpecificFixes, templateNodes, workflowContext } = analysisResult;

  return (
    <div className="space-y-6">
      {/* Workflow Overview */}
      {workflowContext && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Workflow Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{workflowContext.totalNodes}</div>
                <div className="text-sm text-muted-foreground">Total Nodes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{workflowContext.totalConnections}</div>
                <div className="text-sm text-muted-foreground">Connections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{workflowContext.nodeTypes?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Node Types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{workflowContext.agentConfigs?.length || 0}</div>
                <div className="text-sm text-muted-foreground">AI Agents</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="connections" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connections">Connection Analysis</TabsTrigger>
          <TabsTrigger value="node-fixes">Node-Specific Fixes</TabsTrigger>
          <TabsTrigger value="templates">Template Suggestions</TabsTrigger>
        </TabsList>

        {/* Connection Analysis Tab */}
        <TabsContent value="connections" className="space-y-4">
          {connectionAnalysis ? (
            <>
              {/* Flow Paths */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Flow Paths Analysis</CardTitle>
                  <CardDescription>
                    Identified {connectionAnalysis.flowPaths?.length || 0} execution paths
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    {connectionAnalysis.flowPaths?.map((path: string[], index: number) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">Path {index + 1}:</span>
                        <div className="flex items-center gap-1">
                          {path.map((nodeId, pathIndex) => (
                            <React.Fragment key={nodeId}>
                              <Badge variant="outline" className="text-xs">{nodeId}</Badge>
                              {pathIndex < path.length - 1 && <ArrowRight className="h-3 w-3" />}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Bottlenecks */}
              {connectionAnalysis.bottlenecks?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Potential Bottlenecks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {connectionAnalysis.bottlenecks.map((bottleneck: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div>
                            <span className="font-medium">{bottleneck.nodeId}</span>
                            <span className="text-sm text-muted-foreground ml-2">({bottleneck.type})</span>
                          </div>
                          <div className="text-sm">
                            In: {bottleneck.incoming} | Out: {bottleneck.outgoing}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Isolated Nodes */}
              {connectionAnalysis.isolatedNodes?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      Isolated Nodes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {connectionAnalysis.isolatedNodes.map((node: any, index: number) => (
                        <Badge key={index} variant="destructive">
                          {node.id} ({node.type})
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No connection analysis available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Node-Specific Fixes Tab */}
        <TabsContent value="node-fixes" className="space-y-4">
          {nodeSpecificFixes?.length > 0 ? (
            nodeSpecificFixes.map((nodeFix: any, index: number) => (
              <Card key={index}>
                <Collapsible>
                  <CollapsibleTrigger 
                    className="w-full"
                    onClick={() => toggleSection(`node-${nodeFix.nodeId}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bot className="h-5 w-5" />
                          <div className="text-left">
                            <CardTitle className="text-sm">
                              {nodeFix.nodeId} ({nodeFix.nodeType})
                            </CardTitle>
                            <CardDescription>
                              {nodeFix.issues.length} issues • {nodeFix.suggestedFixes?.length || 0} fixes
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getConfidenceBadge(nodeFix.confidence)}>
                            {Math.round(nodeFix.confidence * 100)}% confidence
                          </Badge>
                          {expandedSections.has(`node-${nodeFix.nodeId}`) ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {/* Issues */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Issues:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {nodeFix.issues.map((issue: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span>•</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Suggested Fixes */}
                      {nodeFix.suggestedFixes?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Suggested Fixes:</h4>
                          {nodeFix.suggestedFixes.map((fix: any, fixIndex: number) => (
                            <div key={fixIndex} className="border rounded p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {fix.type === 'auto' ? (
                                    <Zap className="h-4 w-4 text-blue-500" />
                                  ) : (
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                  )}
                                  <span className="text-sm font-medium">{fix.description}</span>
                                </div>
                                <Badge variant={getConfidenceBadge(fix.confidence)} className="text-xs">
                                  {Math.round(fix.confidence * 100)}%
                                </Badge>
                              </div>
                              
                              {fix.code && (
                                <div className="mb-2">
                                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                    <code>{fix.code}</code>
                                  </pre>
                                </div>
                              )}
                              
                              {fix.type === 'auto' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleApplyNodeFix(nodeFix.nodeId, fix)}
                                  disabled={applyingFix === `${nodeFix.nodeId}-${fix.type}`}
                                  className="w-full"
                                >
                                  {applyingFix === `${nodeFix.nodeId}-${fix.type}` ? (
                                    'Applying...'
                                  ) : (
                                    <>
                                      <Zap className="h-3 w-3 mr-1" />
                                      Apply Auto Fix
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No node-specific fixes needed! All nodes are properly configured.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Template Suggestions Tab */}
        <TabsContent value="templates" className="space-y-4">
          {templateNodes?.length > 0 ? (
            templateNodes.map((template: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-sm">{template.label}</CardTitle>
                        <CardDescription>{template.reason}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{template.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {template.data && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-1">Configuration:</h4>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                        <code>{JSON.stringify(template.data, null, 2)}</code>
                      </pre>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => onAddTemplateNode(template)}
                    className="w-full"
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Add Template Node
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No template suggestions available. Your workflow appears complete!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};