import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Eye, 
  FileText,
  Zap,
  Settings,
  ArrowRight,
  Check
} from 'lucide-react';
import { UnifiedAgentState } from '@/types/unified-agent-builder';

interface ModeSpecificConfigurationProps {
  mode: UnifiedAgentState['user_mode'];
  capturedRequirements: {
    connectors: string[];
    actions: string[];
    steps: string[];
    integrations: string[];
  };
  onConfigurationComplete?: (config: any) => void;
}

const ModeSpecificConfiguration: React.FC<ModeSpecificConfigurationProps> = ({
  mode,
  capturedRequirements,
  onConfigurationComplete
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [manualConfig, setManualConfig] = useState<Record<string, any>>({});
  const [visualNodes, setVisualNodes] = useState<any[]>([]);

  // Prompt-based configuration
  const renderPromptConfiguration = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Describe Your Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tell us how you want to configure the components we identified. Be as detailed as possible.
          </p>
          
          <Textarea
            placeholder={`Based on your requirements (${capturedRequirements.connectors.join(', ')}, ${capturedRequirements.actions.join(', ')}), describe how you want them configured...

For example:
- "The EHR Integration should connect to Epic using FHIR R4"
- "Forms should collect patient demographics first, then insurance information"
- "Voice responses should be professional and empathetic"
- "Schedule appointments during business hours only"`}
            className="min-h-40"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
          />
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => {
                // Process the prompt and generate configuration
                onConfigurationComplete?.({ 
                  type: 'prompt', 
                  configuration: promptInput,
                  requirements: capturedRequirements 
                });
              }}
              disabled={!promptInput.trim()}
            >
              Generate Configuration
            </Button>
            <Badge variant="outline">AI-powered setup</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuration Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {capturedRequirements.steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{step}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Will be configured via AI</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Visual workflow configuration
  const renderVisualConfiguration = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visual Workflow Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Drag and connect components to build your agent's workflow visually.
          </p>
          
          {/* Simulated visual canvas */}
          <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 min-h-64 bg-muted/10">
            <div className="text-center space-y-4">
              <Eye className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-medium">Visual Canvas</h3>
                <p className="text-sm text-muted-foreground">
                  Interactive drag-and-drop interface will be shown here
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
                {capturedRequirements.connectors.slice(0, 3).map((connector, idx) => (
                  <div key={idx} className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded text-xs text-center">
                    {connector}
                  </div>
                ))}
                {capturedRequirements.actions.slice(0, 3).map((action, idx) => (
                  <div key={idx} className="p-2 bg-green-100 dark:bg-green-950/30 rounded text-xs text-center">
                    {action}
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => {
                  // Initialize visual canvas
                  onConfigurationComplete?.({ 
                    type: 'visual', 
                    nodes: capturedRequirements.steps.map((step, idx) => ({
                      id: `step-${idx}`,
                      type: 'workflow',
                      label: step,
                      position: { x: idx * 200, y: 100 }
                    })),
                    requirements: capturedRequirements 
                  });
                }}
              >
                Initialize Visual Builder
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Components</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Connectors</h4>
              <div className="space-y-1">
                {capturedRequirements.connectors.map((connector, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    {connector}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Actions</h4>
              <div className="space-y-1">
                {capturedRequirements.actions.map((action, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    {action}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Manual form-based configuration
  const renderManualConfiguration = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Manual Component Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Configure each component manually with full control over all settings.
          </p>
          
          {/* Connectors Configuration */}
          {capturedRequirements.connectors.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Connectors Configuration
              </h3>
              {capturedRequirements.connectors.map((connector, idx) => (
                <Card key={idx} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{connector}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Endpoint URL</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border rounded text-sm"
                          placeholder="https://api.example.com"
                          onChange={(e) => setManualConfig(prev => ({
                            ...prev,
                            [`${connector}_endpoint`]: e.target.value
                          }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Authentication</label>
                        <select 
                          className="w-full p-2 border rounded text-sm"
                          onChange={(e) => setManualConfig(prev => ({
                            ...prev,
                            [`${connector}_auth`]: e.target.value
                          }))}
                        >
                          <option>Select auth method</option>
                          <option value="api_key">API Key</option>
                          <option value="oauth">OAuth 2.0</option>
                          <option value="basic">Basic Auth</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Ready for configuration</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Actions Configuration */}
          {capturedRequirements.actions.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Actions Configuration
              </h3>
              {capturedRequirements.actions.map((action, idx) => (
                <Card key={idx} className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{action}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Trigger Condition</label>
                        <select 
                          className="w-full p-2 border rounded text-sm"
                          onChange={(e) => setManualConfig(prev => ({
                            ...prev,
                            [`${action}_trigger`]: e.target.value
                          }))}
                        >
                          <option>Select trigger</option>
                          <option value="user_input">User Input</option>
                          <option value="api_call">API Call</option>
                          <option value="schedule">Schedule</option>
                          <option value="event">Event</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Configuration</label>
                        <textarea 
                          className="w-full p-2 border rounded text-sm"
                          placeholder="JSON configuration for this action"
                          rows={2}
                          onChange={(e) => setManualConfig(prev => ({
                            ...prev,
                            [`${action}_config`]: e.target.value
                          }))}
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Ready for configuration</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="border-t pt-4">
            <Button 
              onClick={() => {
                onConfigurationComplete?.({ 
                  type: 'manual', 
                  configuration: manualConfig,
                  requirements: capturedRequirements 
                });
              }}
              className="w-full"
            >
              Save Manual Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderConfiguration = () => {
    switch (mode) {
      case 'guided':
        return renderPromptConfiguration();
      case 'visual':
        return renderVisualConfiguration();
      case 'expert':
        return renderManualConfiguration();
      default:
        return (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Please select a build mode first.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="secondary">
          {mode === 'guided' && 'Prompt-Based'}
          {mode === 'visual' && 'Visual Workflow'}
          {mode === 'expert' && 'Manual Configuration'}
          {!mode && 'No Mode Selected'}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {capturedRequirements.connectors.length + capturedRequirements.actions.length} components to configure
        </span>
      </div>
      
      {renderConfiguration()}
    </div>
  );
};

export default ModeSpecificConfiguration;