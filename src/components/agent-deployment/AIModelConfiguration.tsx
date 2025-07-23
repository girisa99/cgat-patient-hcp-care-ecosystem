import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentSession } from '@/types/agent-session';
import { 
  Brain, 
  Cpu, 
  Eye, 
  MessageSquare,
  Zap,
  Settings,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface AIModelConfigurationProps {
  session: AgentSession;
}

export const AIModelConfiguration: React.FC<AIModelConfigurationProps> = ({ session }) => {
  // Extract AI model information from session data
  const getAIModelInfo = () => {
    // Check actions for AI model configurations
    const actionModels = session.actions?.configurations?.ai_models || [];
    
    // Check canvas for any AI model references
    const canvasModels = session.canvas?.layout?.ai_models || [];
    
    // Check deployment config for model settings
    const deploymentModels = session.deployment?.config?.ai_models || [];
    
    // Combine all model references
    const allModels = [...actionModels, ...canvasModels, ...deploymentModels];
    
    // If no specific models configured, provide default/inferred setup
    if (allModels.length === 0) {
      return [{
        id: 'default-gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        type: 'conversational',
        capabilities: ['text_generation', 'function_calling', 'vision'],
        max_context: 128000,
        is_primary: true,
        use_cases: session.basic_info?.use_case ? [session.basic_info.use_case] : ['General Purpose']
      }];
    }
    
    return allModels;
  };

  const models = getAIModelInfo();
  const isMultiModel = models.length > 1;
  const primaryModel = models.find(m => m.is_primary) || models[0];

  const getCapabilityIcon = (capability: string) => {
    switch (capability.toLowerCase()) {
      case 'vision':
      case 'image_analysis':
        return <Eye className="h-4 w-4" />;
      case 'function_calling':
      case 'tool_use':
        return <Settings className="h-4 w-4" />;
      case 'text_generation':
      case 'conversation':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai':
        return 'bg-green-100 text-green-800';
      case 'anthropic':
        return 'bg-orange-100 text-orange-800';
      case 'google':
        return 'bg-blue-100 text-blue-800';
      case 'microsoft':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Model Architecture Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Model Architecture
          </CardTitle>
          <CardDescription>
            {isMultiModel ? 
              `Multi-model setup with ${models.length} AI models configured` :
              'Single-model setup with one primary AI model'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{isMultiModel ? 'Multi-Model' : 'Single-Model'}</p>
                <p className="text-sm text-muted-foreground">Architecture Type</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">{models.length}</p>
                <p className="text-sm text-muted-foreground">Models Configured</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Production Ready</p>
                <p className="text-sm text-muted-foreground">Deployment Status</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {models.map((model, index) => (
          <Card key={model.id || index} className={model.is_primary ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  {model.name || `Model ${index + 1}`}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {model.is_primary && (
                    <Badge variant="default">Primary</Badge>
                  )}
                  <Badge className={getProviderColor(model.provider || 'Unknown')}>
                    {model.provider || 'Unknown'}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                {model.type || 'Conversational'} AI Model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Model Specifications */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Context Length</label>
                  <p className="text-sm">{model.max_context?.toLocaleString() || '128,000'} tokens</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Model Type</label>
                  <p className="text-sm">{model.type || 'Conversational'}</p>
                </div>
              </div>

              {/* Capabilities */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Capabilities</label>
                <div className="flex flex-wrap gap-2">
                  {(model.capabilities || ['text_generation', 'function_calling']).map((capability, capIndex) => (
                    <Badge key={capIndex} variant="outline" className="flex items-center gap-1">
                      {getCapabilityIcon(capability)}
                      {capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Use Cases */}
              {model.use_cases && model.use_cases.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Use Cases</label>
                  <div className="flex flex-wrap gap-2">
                    {model.use_cases.map((useCase, ucIndex) => (
                      <Badge key={ucIndex} variant="secondary">
                        {useCase}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Configuration Details */}
              {model.configuration && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Configuration</label>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(model.configuration).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Model Integration Strategy */}
      {isMultiModel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Multi-Model Integration Strategy
            </CardTitle>
            <CardDescription>
              How multiple AI models work together in your agent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Model Routing</h4>
                <p className="text-sm text-muted-foreground">
                  Intelligent routing based on task complexity and requirements
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Fallback Strategy</h4>
                <p className="text-sm text-muted-foreground">
                  Primary model with automatic fallback to secondary models
                </p>
              </div>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-600">Multi-Model Benefits</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Enhanced capability coverage, improved reliability, and optimized cost-performance ratio
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Performance Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Optimization
          </CardTitle>
          <CardDescription>
            Optimization settings for production deployment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">Response Caching</h4>
              <Badge variant="outline">Enabled</Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Common responses cached for faster delivery
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Load Balancing</h4>
              <Badge variant="outline">Auto</Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Automatic distribution across model instances
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Rate Limiting</h4>
              <Badge variant="outline">Configured</Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Prevents API quota exhaustion
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};