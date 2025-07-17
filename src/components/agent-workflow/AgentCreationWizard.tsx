import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Circle,
  Palette,
  Upload,
  Database,
  Bot,
  Rocket,
  Settings,
  FileText,
  Users,
  ExternalLink,
  Download,
  Share2,
  Eye,
  Plus
} from 'lucide-react';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
}

interface AgentConfig {
  name: string;
  description: string;
  type: 'single' | 'multi';
  template?: string;
  canvas?: string;
  knowledgeBase?: string;
  ragContent?: string[];
  deploymentType: 'sequential' | 'parallel';
}

interface CanvasConfig {
  logo?: File;
  tagline: string;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
}

interface KnowledgeDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  status: 'processing' | 'ready' | 'error';
}

interface RAGContent {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  compliance_notes?: string;
}

export const AgentCreationWizard: React.FC<{ 
  open: boolean; 
  onClose: () => void;
  onComplete: (config: AgentConfig) => void;
}> = ({ open, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    name: '',
    description: '',
    type: 'single',
    deploymentType: 'sequential'
  });
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>({
    tagline: '',
    colorPrimary: '#3b82f6',
    colorSecondary: '#8b5cf6',
    colorAccent: '#06b6d4'
  });
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [ragContent, setRAGContent] = useState<RAGContent[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [createNewCanvas, setCreateNewCanvas] = useState(false);

  const steps: WizardStep[] = [
    {
      id: 'template',
      title: 'Choose Template',
      description: 'Select existing template or create from scratch',
      icon: FileText,
      completed: false
    },
    {
      id: 'canvas',
      title: 'Configure Canvas',
      description: 'Set up white-label branding and appearance',
      icon: Palette,
      completed: false
    },
    {
      id: 'knowledge',
      title: 'Knowledge Base',
      description: 'Upload documents and configure knowledge',
      icon: Database,
      completed: false
    },
    {
      id: 'rag',
      title: 'RAG Content',
      description: 'Add and approve RAG content',
      icon: Bot,
      completed: false
    },
    {
      id: 'deploy',
      title: 'Deploy Agent',
      description: 'Configure and deploy your agent',
      icon: Rocket,
      completed: false
    }
  ];

  const updateStepCompletion = (stepIndex: number, completed: boolean) => {
    // Update step completion logic
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      updateStepCompletion(currentStep, true);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const newDoc: KnowledgeDocument = {
          id: `doc-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadDate: new Date().toISOString(),
          status: 'processing'
        };
        setDocuments(prev => [...prev, newDoc]);
        
        // Simulate processing
        setTimeout(() => {
          setDocuments(prev => 
            prev.map(doc => 
              doc.id === newDoc.id ? { ...doc, status: 'ready' } : doc
            )
          );
        }, 2000);
      });
    }
  };

  const handleRAGContentSubmit = (content: string, title: string) => {
    const newRAG: RAGContent = {
      id: `rag-${Date.now()}`,
      title,
      content,
      status: 'pending_approval'
    };
    setRAGContent(prev => [...prev, newRAG]);
    
    toast({
      title: "RAG Content Submitted",
      description: "Content has been sent for compliance review.",
    });
  };

  const handleRAGDownload = (ragId: string) => {
    const rag = ragContent.find(r => r.id === ragId);
    if (rag) {
      const blob = new Blob([rag.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${rag.title}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleRAGShare = (ragId: string) => {
    toast({
      title: "Sharing RAG Content",
      description: "Content has been shared with compliance team for review.",
    });
  };

  const handleCanvasLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCanvasConfig(prev => ({ ...prev, logo: file }));
      toast({
        title: "Logo Uploaded",
        description: "Canvas logo has been updated.",
      });
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            Agent Creation Wizard
          </DialogTitle>
          <DialogDescription>
            Follow the guided steps to create and deploy your intelligent agent
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  isCompleted ? 'bg-green-100 text-green-600' : 
                  isActive ? 'bg-primary text-primary-foreground' : 
                  'bg-muted text-muted-foreground'
                }`}>
                  {isCompleted ? <CheckCircle className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    isCompleted ? 'bg-green-200' : 'bg-muted'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-1">
          {/* Step 1: Template Selection */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Choose Agent Template</h3>
                <p className="text-muted-foreground">Select an existing template or create a new agent from scratch</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={`cursor-pointer border-2 ${!selectedTemplate ? 'border-primary' : 'border-border'}`}
                      onClick={() => setSelectedTemplate('')}>
                  <CardContent className="p-6 text-center">
                    <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h4 className="font-medium mb-2">Create from Scratch</h4>
                    <p className="text-sm text-muted-foreground">Build a custom agent with your specific requirements</p>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer border-2 ${selectedTemplate === 'healthcare' ? 'border-primary' : 'border-border'}`}
                      onClick={() => setSelectedTemplate('healthcare')}>
                  <CardContent className="p-6">
                    <h4 className="font-medium mb-2">Healthcare Compliance</h4>
                    <p className="text-sm text-muted-foreground mb-3">Pre-configured for healthcare compliance monitoring</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">FDA Alerts</Badge>
                      <Badge variant="secondary" className="text-xs">Veeva CRM</Badge>
                      <Badge variant="secondary" className="text-xs">ICD-10</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer border-2 ${selectedTemplate === 'insurance' ? 'border-primary' : 'border-border'}`}
                      onClick={() => setSelectedTemplate('insurance')}>
                  <CardContent className="p-6">
                    <h4 className="font-medium mb-2">Prior Authorization</h4>
                    <p className="text-sm text-muted-foreground mb-3">Automates prior authorization workflows</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Insurance APIs</Badge>
                      <Badge variant="secondary" className="text-xs">Benefits</Badge>
                      <Badge variant="secondary" className="text-xs">Epic/Cerner</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer border-2 ${selectedTemplate === 'patient' ? 'border-primary' : 'border-border'}`}
                      onClick={() => setSelectedTemplate('patient')}>
                  <CardContent className="p-6">
                    <h4 className="font-medium mb-2">Patient Onboarding</h4>
                    <p className="text-sm text-muted-foreground mb-3">Guides patients through onboarding</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">SMS/Email</Badge>
                      <Badge variant="secondary" className="text-xs">Salesforce</Badge>
                      <Badge variant="secondary" className="text-xs">Documents</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Canvas Configuration */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Configure Canvas & White-labeling</h3>
                <p className="text-muted-foreground">Customize the appearance and branding for your agent</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="logo-upload">Logo Upload</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleCanvasLogoUpload}
                        className="hidden"
                      />
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {canvasConfig.logo ? canvasConfig.logo.name : 'Click to upload or drag and drop'}
                        </p>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={canvasConfig.tagline}
                      onChange={(e) => setCanvasConfig(prev => ({ ...prev, tagline: e.target.value }))}
                      placeholder="Your healthcare AI partner"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Color Scheme</h4>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="color-primary">Primary</Label>
                      <div className="flex items-center gap-2">
                        <input
                          id="color-primary"
                          type="color"
                          value={canvasConfig.colorPrimary}
                          onChange={(e) => setCanvasConfig(prev => ({ ...prev, colorPrimary: e.target.value }))}
                          className="w-12 h-8 rounded border"
                        />
                        <Input
                          value={canvasConfig.colorPrimary}
                          onChange={(e) => setCanvasConfig(prev => ({ ...prev, colorPrimary: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="color-secondary">Secondary</Label>
                      <div className="flex items-center gap-2">
                        <input
                          id="color-secondary"
                          type="color"
                          value={canvasConfig.colorSecondary}
                          onChange={(e) => setCanvasConfig(prev => ({ ...prev, colorSecondary: e.target.value }))}
                          className="w-12 h-8 rounded border"
                        />
                        <Input
                          value={canvasConfig.colorSecondary}
                          onChange={(e) => setCanvasConfig(prev => ({ ...prev, colorSecondary: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="color-accent">Accent</Label>
                      <div className="flex items-center gap-2">
                        <input
                          id="color-accent"
                          type="color"
                          value={canvasConfig.colorAccent}
                          onChange={(e) => setCanvasConfig(prev => ({ ...prev, colorAccent: e.target.value }))}
                          className="w-12 h-8 rounded border"
                        />
                        <Input
                          value={canvasConfig.colorAccent}
                          onChange={(e) => setCanvasConfig(prev => ({ ...prev, colorAccent: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="border rounded-lg p-4" style={{ backgroundColor: `${canvasConfig.colorPrimary}10` }}>
                    <h4 className="font-medium mb-2" style={{ color: canvasConfig.colorPrimary }}>Preview</h4>
                    <div className="flex items-center gap-2 mb-2">
                      {canvasConfig.logo && (
                        <div className="w-8 h-8 bg-muted rounded"></div>
                      )}
                      <span className="text-sm">{canvasConfig.tagline || 'Your tagline here'}</span>
                    </div>
                    <Button style={{ backgroundColor: canvasConfig.colorSecondary }} className="text-white text-xs">
                      Sample Button
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Knowledge Base */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Knowledge Base Configuration</h3>
                <p className="text-muted-foreground">Upload documents and configure knowledge for your agent</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Document Upload</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.md"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="doc-upload"
                      />
                      <label htmlFor="doc-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Upload knowledge documents</p>
                        <p className="text-xs text-muted-foreground">PDF, DOC, TXT, MD supported</p>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label>Knowledge Base Selection</Label>
                    <Select value={agentConfig.knowledgeBase} onValueChange={(value) => setAgentConfig(prev => ({ ...prev, knowledgeBase: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select existing knowledge base" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="healthcare-general">Healthcare General</SelectItem>
                        <SelectItem value="clinical-protocols">Clinical Protocols</SelectItem>
                        <SelectItem value="regulatory-docs">Regulatory Documents</SelectItem>
                        <SelectItem value="new">Create New Knowledge Base</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Uploaded Documents</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {documents.map(doc => (
                      <div key={doc.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={doc.status === 'ready' ? 'default' : doc.status === 'processing' ? 'secondary' : 'destructive'}>
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                    {documents.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: RAG Content */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">RAG Content Management</h3>
                <p className="text-muted-foreground">Add, download, and share RAG content for compliance review</p>
              </div>

              <Tabs defaultValue="add" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="add">Add Content</TabsTrigger>
                  <TabsTrigger value="manage">Manage Content</TabsTrigger>
                  <TabsTrigger value="approved">Approved Content</TabsTrigger>
                </TabsList>

                <TabsContent value="add" className="space-y-4">
                  <RAGContentForm onSubmit={handleRAGContentSubmit} />
                </TabsContent>

                <TabsContent value="manage" className="space-y-4">
                  <div className="space-y-3">
                    {ragContent.filter(r => r.status === 'pending_approval' || r.status === 'draft').map(rag => (
                      <Card key={rag.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{rag.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{rag.content.substring(0, 100)}...</p>
                              <Badge variant={rag.status === 'pending_approval' ? 'default' : 'secondary'}>
                                {rag.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleRAGDownload(rag.id)}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleRAGShare(rag.id)}>
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="approved" className="space-y-4">
                  <div className="space-y-3">
                    {ragContent.filter(r => r.status === 'approved').map(rag => (
                      <Card key={rag.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{rag.title}</h4>
                              <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
                            </div>
                            <Button variant="outline" size="sm">
                              Use in Agent
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Step 5: Deploy */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Deploy Your Agent</h3>
                <p className="text-muted-foreground">Configure final settings and deploy your intelligent agent</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="agent-name">Agent Name</Label>
                    <Input
                      id="agent-name"
                      value={agentConfig.name}
                      onChange={(e) => setAgentConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My Healthcare Agent"
                    />
                  </div>

                  <div>
                    <Label htmlFor="agent-description">Description</Label>
                    <Textarea
                      id="agent-description"
                      value={agentConfig.description}
                      onChange={(e) => setAgentConfig(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your agent's purpose and capabilities"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Deployment Type</Label>
                    <Select value={agentConfig.deploymentType} onValueChange={(value: 'sequential' | 'parallel') => setAgentConfig(prev => ({ ...prev, deploymentType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sequential">Sequential Deployment</SelectItem>
                        <SelectItem value="parallel">Parallel Deployment</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {agentConfig.deploymentType === 'sequential' 
                        ? 'Deploy systems one after another for careful monitoring'
                        : 'Deploy all systems simultaneously for faster setup'
                      }
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Configuration Summary</h4>
                  
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Template:</span>
                        <span className="text-sm font-medium">{selectedTemplate || 'Custom'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Canvas:</span>
                        <span className="text-sm font-medium">{canvasConfig.tagline ? 'Configured' : 'Default'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Documents:</span>
                        <span className="text-sm font-medium">{documents.length} uploaded</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">RAG Content:</span>
                        <span className="text-sm font-medium">{ragContent.filter(r => r.status === 'approved').length} approved</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Deployment:</span>
                        <span className="text-sm font-medium">{agentConfig.deploymentType}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button onClick={() => onComplete(agentConfig)}>
                <Rocket className="h-4 w-4 mr-2" />
                Deploy Agent
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// RAG Content Form Component
const RAGContentForm: React.FC<{ onSubmit: (content: string, title: string) => void }> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (title.trim() && content.trim()) {
      onSubmit(content, title);
      setTitle('');
      setContent('');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="rag-title">Content Title</Label>
        <Input
          id="rag-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., CAR-T Cell Therapy Guidelines"
        />
      </div>
      
      <div>
        <Label htmlFor="rag-content">RAG Content</Label>
        <Textarea
          id="rag-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your RAG content here..."
          rows={8}
        />
      </div>
      
      <Button onClick={handleSubmit} disabled={!title.trim() || !content.trim()}>
        Submit for Approval
      </Button>
    </div>
  );
};