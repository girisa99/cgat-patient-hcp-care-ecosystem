
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Rocket, 
  Settings,
  Globe,
  Key
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useExternalApiPublishing } from '@/hooks/useExternalApiPublishing';

interface PublishingWorkflowTabContentProps {
  internalApis: any[];
  externalApis: any[];
}

export const PublishingWorkflowTabContent: React.FC<PublishingWorkflowTabContentProps> = ({
  internalApis,
  externalApis
}) => {
  const { toast } = useToast();
  const {
    createDraft,
    moveToReview,
    publishApi,
    completeWorkflow,
    isCreatingDraft,
    isMovingToReview,
    isPublishing,
    isCompletingWorkflow
  } = useExternalApiPublishing();

  const [selectedInternalApi, setSelectedInternalApi] = useState('');
  const [publishingConfig, setPublishingConfig] = useState({
    external_name: '',
    external_description: '',
    version: '1.0.0',
    category: '',
    visibility: 'private' as 'private' | 'public' | 'marketplace',
    pricing_model: 'free' as 'free' | 'freemium' | 'paid' | 'enterprise'
  });

  const workflowSteps = [
    { id: 'draft', label: 'Create Draft', icon: Settings, description: 'Prepare API for publishing' },
    { id: 'review', label: 'Review', icon: Clock, description: 'Review and validate API' },
    { id: 'publish', label: 'Publish', icon: Rocket, description: 'Make API publicly available' },
    { id: 'live', label: 'Live', icon: Globe, description: 'API is live and accessible' }
  ];

  const getStepStatus = (stepId: string, apiStatus?: string) => {
    if (!apiStatus) return 'pending';
    
    const statusOrder = ['draft', 'review', 'published', 'live'];
    const currentIndex = statusOrder.indexOf(apiStatus);
    const stepIndex = statusOrder.indexOf(stepId === 'live' ? 'published' : stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const handleCreateDraft = () => {
    if (!selectedInternalApi || !publishingConfig.external_name) {
      toast({
        title: "Missing Information",
        description: "Please select an internal API and provide a name for the external API.",
        variant: "destructive",
      });
      return;
    }

    createDraft({
      internalApiId: selectedInternalApi,
      config: publishingConfig
    });
  };

  const handleCompleteWorkflow = () => {
    if (!selectedInternalApi || !publishingConfig.external_name) {
      toast({
        title: "Missing Information",
        description: "Please select an internal API and provide publishing configuration.",
        variant: "destructive",
      });
      return;
    }

    completeWorkflow({
      internalApiId: selectedInternalApi,
      config: publishingConfig
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Publishing Workflow</h2>
          <p className="text-muted-foreground">Manage the complete API publishing lifecycle</p>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          <Rocket className="h-3 w-3 mr-1" />
          Publishing Hub
        </Badge>
      </div>

      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing Pipeline</CardTitle>
          <CardDescription>Track APIs through the publishing workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Workflow Steps */}
            <div className="flex items-center justify-between">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                const status = getStepStatus(step.id, 'draft'); // Default status for demo
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-2
                        ${status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                          status === 'active' ? 'bg-blue-500 border-blue-500 text-white' :
                          'bg-gray-100 border-gray-300 text-gray-500'}
                      `}>
                        {status === 'completed' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="text-center mt-2">
                        <div className="text-sm font-medium">{step.label}</div>
                        <div className="text-xs text-muted-foreground">{step.description}</div>
                      </div>
                    </div>
                    {index < workflowSteps.length - 1 && (
                      <ArrowRight className="h-5 w-5 text-gray-400 mx-4" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Workflow Progress</span>
                <span>25%</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Publishing Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>New API Publishing</CardTitle>
            <CardDescription>Configure and publish an internal API externally</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Internal API</label>
              <Select value={selectedInternalApi} onValueChange={setSelectedInternalApi}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an internal API to publish" />
                </SelectTrigger>
                <SelectContent>
                  {internalApis.map((api) => (
                    <SelectItem key={api.id} value={api.id}>
                      {api.name} - {api.endpoints?.length || 0} endpoints
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">External API Name</label>
              <Input
                value={publishingConfig.external_name}
                onChange={(e) => setPublishingConfig(prev => ({ ...prev, external_name: e.target.value }))}
                placeholder="Public name for your API"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={publishingConfig.external_description}
                onChange={(e) => setPublishingConfig(prev => ({ ...prev, external_description: e.target.value }))}
                placeholder="Describe what your API does..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Version</label>
                <Input
                  value={publishingConfig.version}
                  onChange={(e) => setPublishingConfig(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="1.0.0"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Input
                  value={publishingConfig.category}
                  onChange={(e) => setPublishingConfig(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Healthcare, Data, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Visibility</label>
                <Select 
                  value={publishingConfig.visibility} 
                  onValueChange={(value: any) => setPublishingConfig(prev => ({ ...prev, visibility: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="marketplace">Marketplace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Pricing Model</label>
                <Select 
                  value={publishingConfig.pricing_model} 
                  onValueChange={(value: any) => setPublishingConfig(prev => ({ ...prev, pricing_model: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleCreateDraft}
                disabled={isCreatingDraft}
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                {isCreatingDraft ? 'Creating Draft...' : 'Create Draft'}
              </Button>
              
              <Button 
                onClick={handleCompleteWorkflow}
                disabled={isCompletingWorkflow}
                variant="default"
                className="w-full"
              >
                <Rocket className="h-4 w-4 mr-2" />
                {isCompletingWorkflow ? 'Publishing...' : 'Complete Full Workflow'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current External APIs */}
        <Card>
          <CardHeader>
            <CardTitle>Published APIs</CardTitle>
            <CardDescription>Manage your published external APIs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {externalApis.length > 0 ? (
                externalApis.map((api) => (
                  <div key={api.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{api.external_name || api.name}</h4>
                      <Badge variant={
                        api.status === 'published' ? 'default' :
                        api.status === 'draft' ? 'secondary' :
                        api.status === 'review' ? 'outline' : 'destructive'
                      }>
                        {api.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {api.external_description || api.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Version: {api.version}</span>
                      <span>•</span>
                      <span>Visibility: {api.visibility}</span>
                      <span>•</span>
                      <span>Model: {api.pricing_model}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {api.status === 'draft' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => moveToReview(api.id)}
                          disabled={isMovingToReview}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Move to Review
                        </Button>
                      )}
                      {api.status === 'review' && (
                        <Button 
                          size="sm"
                          onClick={() => publishApi(api.id)}
                          disabled={isPublishing}
                        >
                          <Rocket className="h-3 w-3 mr-1" />
                          Publish
                        </Button>
                      )}
                      {api.status === 'published' && (
                        <Button size="sm" variant="outline">
                          <Globe className="h-3 w-3 mr-1" />
                          View Live
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Published APIs</h3>
                  <p className="text-muted-foreground">
                    Start by publishing an internal API to make it externally available.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
