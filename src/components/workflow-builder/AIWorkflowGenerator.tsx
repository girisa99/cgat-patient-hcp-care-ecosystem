import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Sparkles, Bot, Workflow, Users, MessageCircle, Phone, 
  Mail, Calendar, Settings, Download, Eye, Play, Wand2,
  Lightbulb, Target, TrendingUp, CheckCircle
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';
import { CustomerJourneyBuilder } from './CustomerJourneyBuilder';

interface UseCaseTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedTime: string;
  components: string[];
  icon: React.ComponentType<any>;
}

const useCaseTemplates: UseCaseTemplate[] = [
  {
    id: 'patient-onboarding',
    name: 'Patient Onboarding',
    description: 'Complete patient registration and intake process',
    industry: 'Healthcare',
    complexity: 'medium',
    estimatedTime: '15-20 min',
    components: ['Registration', 'Insurance Verification', 'Medical History', 'Scheduling'],
    icon: Users
  },
  {
    id: 'appointment-scheduling',
    name: 'Appointment Scheduling',
    description: 'Automated appointment booking and management',
    industry: 'Healthcare',
    complexity: 'simple',
    estimatedTime: '5-10 min',
    components: ['Availability Check', 'Booking', 'Confirmation', 'Reminders'],
    icon: Calendar
  },
  {
    id: 'insurance-verification',
    name: 'Insurance Verification',
    description: 'Verify patient insurance coverage and benefits',
    industry: 'Healthcare',
    complexity: 'complex',
    estimatedTime: '10-15 min',
    components: ['Coverage Check', 'Benefits Verification', 'Pre-authorization', 'Documentation'],
    icon: CheckCircle
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    description: 'Multi-channel customer service automation',
    industry: 'General',
    complexity: 'medium',
    estimatedTime: '10-15 min',
    components: ['Inquiry Routing', 'FAQ', 'Escalation', 'Follow-up'],
    icon: MessageCircle
  }
];

interface AIWorkflowGeneratorProps {
  onWorkflowGenerated?: (workflow: any) => void;
  onPreview?: (workflow: any) => void;
}

export const AIWorkflowGenerator: React.FC<AIWorkflowGeneratorProps> = ({
  onWorkflowGenerated,
  onPreview
}) => {
  const [selectedUseCase, setSelectedUseCase] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generationSettings, setGenerationSettings] = useState({
    includeAutomation: true,
    complexityLevel: 'medium',
    channelPreference: 'multi-channel',
    complianceLevel: 'healthcare'
  });
  
  const { showSuccess, showError } = useMasterToast();

  // AI Workflow Generation Logic
  const generateWorkflow = async () => {
    if (!selectedUseCase && !customPrompt) {
      showError('Please select a use case or provide a custom description');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI generation with realistic delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const template = useCaseTemplates.find(t => t.id === selectedUseCase);
      const workflowName = template?.name || 'Custom Workflow';
      
      // Generate workflow structure based on use case
      const workflow = generateWorkflowStructure(template, customPrompt);
      
      setGeneratedWorkflow(workflow);
      
      if (onWorkflowGenerated) {
        onWorkflowGenerated(workflow);
      }
      
      showSuccess(`AI workflow "${workflowName}" generated successfully!`);
      setShowPreview(true);
      
    } catch (error) {
      showError('Failed to generate workflow. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate workflow structure based on template and settings
  const generateWorkflowStructure = (template: UseCaseTemplate | undefined, prompt: string) => {
    const baseNodes: any[] = [];
    const baseEdges: any[] = [];

    if (template) {
      // Generate nodes based on template components
      template.components.forEach((component, index) => {
        baseNodes.push({
          id: `node-${index + 1}`,
          type: index === 0 ? 'customer' : 'touchpoint',
          position: { x: index * 250 + 50, y: 100 },
          data: {
            label: component,
            description: `AI-generated ${component.toLowerCase()} step`,
            channel: 'chat',
            automationLevel: generationSettings.includeAutomation ? 85 : 50,
            aiGenerated: true
          }
        });

        if (index > 0) {
          baseEdges.push({
            id: `edge-${index}`,
            source: `node-${index}`,
            target: `node-${index + 1}`,
            markerEnd: { type: 'ArrowClosed' },
            style: { stroke: '#8b5cf6', strokeDasharray: '5,5' }
          });
        }
      });

      // Add AI agent node
      baseNodes.push({
        id: 'ai-agent-main',
        type: 'agent',
        position: { x: template.components.length * 250 + 50, y: 100 },
        data: {
          label: `${template.name} AI Agent`,
          description: 'Primary AI agent for this workflow',
          capabilities: template.components.slice(0, 3),
          aiGenerated: true
        }
      });
    }

    // Add decision points based on complexity
    if (generationSettings.complexityLevel !== 'simple') {
      baseNodes.push({
        id: 'decision-1',
        type: 'decision',
        position: { x: 200, y: 250 },
        data: {
          label: 'Route Decision',
          description: 'AI-powered routing logic',
          conditions: ['Standard', 'Priority', 'Escalation'],
          aiGenerated: true
        }
      });
    }

    return {
      id: `workflow-${Date.now()}`,
      name: template?.name || 'Custom Workflow',
      description: template?.description || prompt,
      nodes: baseNodes,
      edges: baseEdges,
      metadata: {
        template: template?.id,
        customPrompt: prompt,
        settings: generationSettings,
        generated: new Date().toISOString(),
        version: '1.0'
      },
      aiGenerated: true
    };
  };

  const handlePreview = () => {
    if (generatedWorkflow && onPreview) {
      onPreview(generatedWorkflow);
    }
    setShowPreview(!showPreview);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            AI Workflow Generator
            <Badge variant="secondary">Beta</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Use Cases
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Custom
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {useCaseTemplates.map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <Card 
                      key={template.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedUseCase === template.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedUseCase(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-md">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{template.name}</h3>
                            <p className="text-xs text-muted-foreground mb-2">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {template.complexity}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {template.estimatedTime}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {template.components.slice(0, 3).map((comp, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {comp}
                                </Badge>
                              ))}
                              {template.components.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{template.components.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="custom-prompt">Describe Your Workflow</Label>
                  <Textarea
                    id="custom-prompt"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Describe the customer journey or workflow you want to create. For example: 'I want to create a workflow for patient prescription refill requests that includes verification, pharmacy coordination, and delivery scheduling.'"
                    rows={4}
                    className="mt-1"
                  />
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    AI Tips for Better Results
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Be specific about the steps involved</li>
                    <li>• Mention any decision points or conditions</li>
                    <li>• Include preferred communication channels</li>
                    <li>• Specify automation requirements</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="complexity">Complexity Level</Label>
                    <Select 
                      value={generationSettings.complexityLevel} 
                      onValueChange={(value) => 
                        setGenerationSettings(prev => ({ ...prev, complexityLevel: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple (3-5 steps)</SelectItem>
                        <SelectItem value="medium">Medium (6-10 steps)</SelectItem>
                        <SelectItem value="complex">Complex (10+ steps)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="channels">Channel Preference</Label>
                    <Select 
                      value={generationSettings.channelPreference} 
                      onValueChange={(value) => 
                        setGenerationSettings(prev => ({ ...prev, channelPreference: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chat-only">Chat Only</SelectItem>
                        <SelectItem value="phone-primary">Phone Primary</SelectItem>
                        <SelectItem value="multi-channel">Multi-Channel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="compliance">Compliance Level</Label>
                    <Select 
                      value={generationSettings.complianceLevel} 
                      onValueChange={(value) => 
                        setGenerationSettings(prev => ({ ...prev, complianceLevel: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="healthcare">Healthcare (HIPAA)</SelectItem>
                        <SelectItem value="financial">Financial (SOX)</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="automation"
                      checked={generationSettings.includeAutomation}
                      onChange={(e) => 
                        setGenerationSettings(prev => ({ 
                          ...prev, 
                          includeAutomation: e.target.checked 
                        }))
                      }
                      className="h-4 w-4"
                    />
                    <Label htmlFor="automation" className="text-sm">
                      Include High Automation (80%+)
                    </Label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              {(selectedUseCase || customPrompt) && (
                <Badge variant="outline" className="text-xs">
                  Ready to Generate
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {generatedWorkflow && (
                <Button variant="outline" onClick={handlePreview}>
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              )}
              
              <Button 
                onClick={generateWorkflow} 
                disabled={isGenerating || (!selectedUseCase && !customPrompt)}
                className="bg-primary hover:bg-primary/90"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {isGenerating ? 'Generating...' : 'Generate Workflow'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {showPreview && generatedWorkflow && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Generated Workflow Preview
              <Badge variant="secondary">AI Generated</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 border rounded-lg">
              <CustomerJourneyBuilder 
                initialWorkflow={generatedWorkflow}
                onSave={(workflow) => {
                  showSuccess('Workflow saved successfully!');
                }}
                onGenerateAgent={(workflow) => {
                  if (onWorkflowGenerated) {
                    onWorkflowGenerated(workflow);
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};