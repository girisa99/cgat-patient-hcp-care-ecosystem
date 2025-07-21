import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, Database, Cloud, Link, Settings, Brain, 
  CheckCircle, AlertCircle, PlusCircle, Trash2,
  Activity, FileText, Globe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SystemConnector {
  id: string;
  name: string;
  type: 'database' | 'api' | 'messaging' | 'file_system' | 'external_service';
  category: 'technical' | 'business' | 'healthcare' | 'integration';
  capabilities: string[];
  endpoints: ConnectorEndpoint[];
  status: 'active' | 'inactive' | 'deprecated';
  confidence_score?: number;
  suggested?: boolean;
}

interface ConnectorEndpoint {
  id: string;
  path: string;
  method: string;
  description: string;
  requires_auth: boolean;
  token_requirements?: TokenConfig;
  threshold_settings?: ThresholdConfig;
}

interface TokenConfig {
  type: 'api_key' | 'bearer' | 'oauth' | 'custom';
  max_tokens?: number;
  rate_limit?: number;
  cost_per_token?: number;
}

interface ThresholdConfig {
  max_requests_per_minute?: number;
  max_response_time_ms?: number;
  error_threshold_percent?: number;
  retry_attempts?: number;
}

interface ActionAssignment {
  action_id: string;
  action_name: string;
  connector_id: string;
  endpoint_id: string;
  assignment_type: 'auto_suggested' | 'manual';
  confidence_score: number;
  token_config?: TokenConfig;
  threshold_config?: ThresholdConfig;
}

interface ConnectorAssignmentManagerProps {
  agentId: string;
  actions: Array<{
    id: string;
    name: string;
    type: string;
    category: string;
    description?: string;
  }>;
  onAssignmentsChange: (assignments: ActionAssignment[]) => void;
}

export const ConnectorAssignmentManager: React.FC<ConnectorAssignmentManagerProps> = ({
  agentId,
  actions,
  onAssignmentsChange
}) => {
  const { toast } = useToast();
  const [connectors, setConnectors] = useState<SystemConnector[]>([]);
  const [assignments, setAssignments] = useState<ActionAssignment[]>([]);
  const [suggestions, setSuggestions] = useState<Record<string, SystemConnector[]>>({});
  const [loading, setLoading] = useState(false);
  const [autoSuggestEnabled, setAutoSuggestEnabled] = useState(true);
  const [manualAssignAction, setManualAssignAction] = useState<string | null>(null);
  const [showAllConnectors, setShowAllConnectors] = useState(false);

  useEffect(() => {
    loadConnectors();
    if (autoSuggestEnabled) {
      generateSuggestions();
    }
  }, [actions, autoSuggestEnabled]);

  const loadConnectors = async () => {
    try {
      // Load from API integration registry and connected systems
      const [apiResult, systemsResult] = await Promise.all([
        supabase.from('api_integration_registry').select('*'),
        supabase.from('connected_systems').select('*')
      ]);

      const apiConnectors: SystemConnector[] = (apiResult.data || []).map(api => ({
        id: api.id,
        name: api.name,
        type: 'api' as const,
        category: (['technical', 'business', 'healthcare', 'integration'].includes(api.category) 
          ? api.category 
          : 'technical') as 'technical' | 'business' | 'healthcare' | 'integration',
        capabilities: [],
        endpoints: [],
        status: api.status === 'active' ? 'active' : 'inactive'
      }));

      const systemConnectors: SystemConnector[] = (systemsResult.data || []).map(system => ({
        id: system.id,
        name: system.name,
        type: (['database', 'api', 'messaging', 'file_system', 'external_service'].includes(system.system_type) 
          ? system.system_type 
          : 'external_service') as 'database' | 'api' | 'messaging' | 'file_system' | 'external_service',
        category: 'technical' as const,
        capabilities: [],
        endpoints: [],
        status: system.status === 'connected' ? 'active' : 'inactive'
      }));

      setConnectors([...apiConnectors, ...systemConnectors]);
    } catch (error) {
      console.error('Error loading connectors:', error);
      toast({
        title: "Error",
        description: "Failed to load system connectors",
        variant: "destructive"
      });
    }
  };

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const newSuggestions: Record<string, SystemConnector[]> = {};

      for (const action of actions) {
        const matchedConnectors = connectors.filter(connector => {
          let score = 0;

          // Type-based matching
          if (action.type === 'api_call' && connector.type === 'api') score += 40;
          if (action.type === 'database_query' && connector.type === 'database') score += 40;
          if (action.type === 'file_operation' && connector.type === 'file_system') score += 40;
          if (action.type === 'messaging' && connector.type === 'messaging') score += 40;

          // Category-based matching
          if (action.category === connector.category) score += 30;

          // Capability-based matching
          const actionKeywords = action.name.toLowerCase().split(' ');
          const matchingCapabilities = connector.capabilities.filter(cap =>
            actionKeywords.some(keyword => cap.toLowerCase().includes(keyword))
          );
          score += matchingCapabilities.length * 10;

          // Description-based matching
          if (action.description && connector.name) {
            const descriptionKeywords = action.description.toLowerCase().split(' ');
            const nameKeywords = connector.name.toLowerCase().split(' ');
            const matches = descriptionKeywords.filter(word => 
              nameKeywords.some(nameWord => nameWord.includes(word))
            );
            score += matches.length * 5;
          }

          return score > 30; // Minimum threshold
        }).map(connector => ({
          ...connector,
          confidence_score: Math.min(100, calculateConfidenceScore(action, connector)),
          suggested: true
        })).sort((a, b) => (b.confidence_score || 0) - (a.confidence_score || 0))
          .slice(0, 3); // Top 3 suggestions

        newSuggestions[action.id] = matchedConnectors;
      }

      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
    setLoading(false);
  };

  const calculateConfidenceScore = (action: any, connector: SystemConnector): number => {
    let score = 0;

    // Base type matching
    if (action.type === 'api_call' && connector.type === 'api') score += 40;
    if (action.type === 'database_query' && connector.type === 'database') score += 40;
    if (action.type === 'file_operation' && connector.type === 'file_system') score += 40;

    // Category alignment
    if (action.category === connector.category) score += 30;

    // Active status bonus
    if (connector.status === 'active') score += 20;

    // Capability matching
    const capabilities = connector.capabilities || [];
    const actionKeywords = action.name.toLowerCase().split(' ');
    const matchingCaps = capabilities.filter(cap =>
      actionKeywords.some(keyword => cap.toLowerCase().includes(keyword))
    );
    score += matchingCaps.length * 5;

    return Math.min(100, score);
  };

  const assignConnector = (
    actionId: string, 
    connectorId: string, 
    endpointId: string = 'default',
    assignmentType: 'auto_suggested' | 'manual' = 'manual'
  ) => {
    const action = actions.find(a => a.id === actionId);
    const connector = connectors.find(c => c.id === connectorId);
    
    if (!action || !connector) return;

    // Check if this connector is already assigned to this action
    const existingAssignment = assignments.find(a => 
      a.action_id === actionId && a.connector_id === connectorId
    );
    
    if (existingAssignment) {
      toast({
        title: "Already Assigned",
        description: `${connector.name} is already assigned to ${action.name}`,
        variant: "destructive"
      });
      return;
    }

    const assignment: ActionAssignment = {
      action_id: actionId,
      action_name: action.name,
      connector_id: connectorId,
      endpoint_id: endpointId,
      assignment_type: assignmentType,
      confidence_score: connector.confidence_score || 0,
      token_config: {
        type: 'api_key',
        max_tokens: 1000,
        rate_limit: 100
      },
      threshold_config: {
        max_requests_per_minute: 60,
        max_response_time_ms: 5000,
        error_threshold_percent: 5,
        retry_attempts: 3
      }
    };

    const updatedAssignments = [...assignments, assignment];
    setAssignments(updatedAssignments);
    onAssignmentsChange(updatedAssignments);

    toast({
      title: "Connector Assigned",
      description: `${connector.name} assigned to ${action.name}`,
    });
  };

  const removeAssignment = (actionId: string, connectorId?: string) => {
    const updatedAssignments = connectorId 
      ? assignments.filter(a => !(a.action_id === actionId && a.connector_id === connectorId))
      : assignments.filter(a => a.action_id !== actionId);
    setAssignments(updatedAssignments);
    onAssignmentsChange(updatedAssignments);
  };

  const acceptAllSuggestions = (actionId: string) => {
    const actionSuggestions = suggestions[actionId] || [];
    actionSuggestions.forEach(connector => {
      assignConnector(actionId, connector.id, 'default', 'auto_suggested');
    });
  };

  const updateTokenConfig = (actionId: string, tokenConfig: TokenConfig) => {
    const updatedAssignments = assignments.map(a =>
      a.action_id === actionId ? { ...a, token_config: tokenConfig } : a
    );
    setAssignments(updatedAssignments);
    onAssignmentsChange(updatedAssignments);
  };

  const updateThresholdConfig = (actionId: string, thresholdConfig: ThresholdConfig) => {
    const updatedAssignments = assignments.map(a =>
      a.action_id === actionId ? { ...a, threshold_config: thresholdConfig } : a
    );
    setAssignments(updatedAssignments);
    onAssignmentsChange(updatedAssignments);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Connector Assignment Manager
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={autoSuggestEnabled}
                  onCheckedChange={setAutoSuggestEnabled}
                />
                <Label>Auto-suggest</Label>
              </div>
              <Button
                onClick={generateSuggestions}
                disabled={loading}
                size="sm"
              >
                <Brain className="h-4 w-4 mr-2" />
                {loading ? 'Analyzing...' : 'Refresh Suggestions'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{actions.length}</div>
              <div className="text-sm text-muted-foreground">Actions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{connectors.length}</div>
              <div className="text-sm text-muted-foreground">Connectors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{assignments.length}</div>
              <div className="text-sm text-muted-foreground">Assigned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((assignments.length / Math.max(actions.length, 1)) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Coverage</div>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Main Assignment Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions & Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions & Suggested Connectors</CardTitle>
            <p className="text-sm text-muted-foreground">
              <strong>System Connectors</strong> are pre-built integrations with external services, APIs, and databases. 
              Regular <strong>Connectors</strong> are custom integrations you create. Each action/task can have multiple connectors assigned.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {actions.map(action => {
              const actionAssignments = assignments.filter(a => a.action_id === action.id);
              const actionSuggestions = suggestions[action.id] || [];

              return (
                <div key={action.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{action.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {action.type} • {action.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {actionAssignments.length > 0 ? (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {actionAssignments.length} Assigned
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setManualAssignAction(action.id)}
                      >
                        <PlusCircle className="h-3 w-3 mr-1" />
                        Assign
                      </Button>
                    </div>
                  </div>

                  {/* Show assigned connectors */}
                  {actionAssignments.length > 0 && (
                    <div className="space-y-2">
                      {actionAssignments.map(assignment => (
                        <div key={assignment.connector_id} className="bg-green-50 p-3 rounded">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                {connectors.find(c => c.id === assignment.connector_id)?.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {assignment.assignment_type === 'auto_suggested' ? 'Auto-suggested' : 'Manual'} • 
                                Confidence: {assignment.confidence_score}%
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeAssignment(action.id, assignment.connector_id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Auto-suggestions */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Auto-Suggestions</Label>
                      {actionSuggestions.length > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => acceptAllSuggestions(action.id)}
                        >
                          Accept All
                        </Button>
                      )}
                    </div>
                    {actionSuggestions.length > 0 ? (
                      actionSuggestions.map(connector => (
                        <div
                          key={connector.id}
                          className="flex items-center justify-between p-2 bg-blue-50 rounded cursor-pointer hover:bg-blue-100"
                          onClick={() => assignConnector(action.id, connector.id, 'default', 'auto_suggested')}
                        >
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium">{connector.name}</p>
                              <p className="text-xs text-muted-foreground">{connector.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={connector.confidence_score || 0} 
                              className="w-16 h-2"
                            />
                            <span className="text-xs font-medium">
                              {connector.confidence_score}%
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No auto-suggestions available.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Manual Connector Assignment & Available Connectors */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Connector Assignment</CardTitle>
            <p className="text-sm text-muted-foreground">
              Browse and manually assign connectors when auto-suggestions aren't sufficient
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Show All Available Connectors</Label>
                <Switch
                  checked={showAllConnectors}
                  onCheckedChange={setShowAllConnectors}
                />
              </div>
              
              {showAllConnectors && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <div className="grid gap-3">
                    {connectors.map(connector => (
                      <div key={connector.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              {connector.type === 'database' && <Database className="h-5 w-5 text-blue-500" />}
                              {connector.type === 'api' && <Cloud className="h-5 w-5 text-green-500" />}
                              {connector.type === 'messaging' && <Zap className="h-5 w-5 text-purple-500" />}
                              {connector.type === 'file_system' && <FileText className="h-5 w-5 text-orange-500" />}
                              {connector.type === 'external_service' && <Globe className="h-5 w-5 text-red-500" />}
                            </div>
                            <div>
                              <p className="font-medium">{connector.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {connector.type} • {connector.category}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant={connector.status === 'active' ? 'default' : 'secondary'}>
                              {connector.status}
                            </Badge>
                            {manualAssignAction && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  assignConnector(manualAssignAction, connector.id, 'default', 'manual');
                                  setManualAssignAction(null);
                                }}
                              >
                                Assign
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {connector.capabilities.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {connector.capabilities.slice(0, 3).map(cap => (
                              <Badge key={cap} variant="outline" className="text-xs">
                                {cap}
                              </Badge>
                            ))}
                            {connector.capabilities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{connector.capabilities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {manualAssignAction && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      Assigning to: {actions.find(a => a.id === manualAssignAction)?.name}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Select a connector from the list above or cancel to close this mode.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setManualAssignAction(null)}
                  >
                    Cancel Assignment
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token & Threshold Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Token & Threshold Configuration</CardTitle>
        </CardHeader>
        <CardContent>
            {assignments.length > 0 ? (
              <Tabs defaultValue={assignments[0]?.action_id} className="w-full">
                <TabsList className="grid w-full grid-cols-1">
                  {assignments.map(assignment => (
                    <TabsTrigger key={assignment.action_id} value={assignment.action_id}>
                      {assignment.action_name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {assignments.map(assignment => (
                  <TabsContent key={assignment.action_id} value={assignment.action_id} className="space-y-4">
                    {/* Token Configuration */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Token Configuration
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Token Type</Label>
                          <select
                            className="w-full p-2 border rounded"
                            value={assignment.token_config?.type || 'api_key'}
                            onChange={(e) => updateTokenConfig(assignment.action_id, {
                              ...assignment.token_config!,
                              type: e.target.value as any
                            })}
                          >
                            <option value="api_key">API Key</option>
                            <option value="bearer">Bearer Token</option>
                            <option value="oauth">OAuth</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>
                        <div>
                          <Label>Max Tokens</Label>
                          <Input
                            type="number"
                            value={assignment.token_config?.max_tokens || 1000}
                            onChange={(e) => updateTokenConfig(assignment.action_id, {
                              ...assignment.token_config!,
                              max_tokens: parseInt(e.target.value)
                            })}
                          />
                        </div>
                        <div>
                          <Label>Rate Limit</Label>
                          <Input
                            type="number"
                            value={assignment.token_config?.rate_limit || 100}
                            onChange={(e) => updateTokenConfig(assignment.action_id, {
                              ...assignment.token_config!,
                              rate_limit: parseInt(e.target.value)
                            })}
                          />
                        </div>
                        <div>
                          <Label>Cost per Token</Label>
                          <Input
                            type="number"
                            step="0.001"
                            value={assignment.token_config?.cost_per_token || 0.001}
                            onChange={(e) => updateTokenConfig(assignment.action_id, {
                              ...assignment.token_config!,
                              cost_per_token: parseFloat(e.target.value)
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Threshold Configuration */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Threshold Configuration
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Max Requests/Min</Label>
                          <Input
                            type="number"
                            value={assignment.threshold_config?.max_requests_per_minute || 60}
                            onChange={(e) => updateThresholdConfig(assignment.action_id, {
                              ...assignment.threshold_config!,
                              max_requests_per_minute: parseInt(e.target.value)
                            })}
                          />
                        </div>
                        <div>
                          <Label>Max Response Time (ms)</Label>
                          <Input
                            type="number"
                            value={assignment.threshold_config?.max_response_time_ms || 5000}
                            onChange={(e) => updateThresholdConfig(assignment.action_id, {
                              ...assignment.threshold_config!,
                              max_response_time_ms: parseInt(e.target.value)
                            })}
                          />
                        </div>
                        <div>
                          <Label>Error Threshold (%)</Label>
                          <Input
                            type="number"
                            max="100"
                            value={assignment.threshold_config?.error_threshold_percent || 5}
                            onChange={(e) => updateThresholdConfig(assignment.action_id, {
                              ...assignment.threshold_config!,
                              error_threshold_percent: parseInt(e.target.value)
                            })}
                          />
                        </div>
                        <div>
                          <Label>Retry Attempts</Label>
                          <Input
                            type="number"
                            value={assignment.threshold_config?.retry_attempts || 3}
                            onChange={(e) => updateThresholdConfig(assignment.action_id, {
                              ...assignment.threshold_config!,
                              retry_attempts: parseInt(e.target.value)
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No assignments to configure</p>
                <p className="text-sm">Assign connectors to actions first</p>
              </div>
            )}
          </CardContent>
         </Card>
    </div>
  );
};