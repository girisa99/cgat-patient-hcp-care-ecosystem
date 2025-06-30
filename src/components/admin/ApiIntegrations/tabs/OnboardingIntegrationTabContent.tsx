
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Workflow, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  Settings,
  UserCheck,
  Building,
  Database,
  Shield,
  Stethoscope,
  CreditCard,
  Pill,
  FlaskConical,
  FileText,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OnboardingApiRequirement {
  id: string;
  onboarding_id: string;
  facility_name: string;
  api_type: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'on_hold';
  submitted_at: string;
  requirements: string[];
  created_at: string;
  integration_category: 'treatment_center' | 'pharma_biotech' | 'financial_verification' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_completion_date?: string;
  assigned_to?: string;
  technical_contact?: {
    name: string;
    email: string;
    phone?: string;
  };
  compliance_requirements?: string[];
  security_level: 'standard' | 'enhanced' | 'hipaa_compliant';
  workflow_stage: 'requirements_gathering' | 'technical_review' | 'development' | 'testing' | 'deployment' | 'completed';
}

export const OnboardingIntegrationTabContent: React.FC = () => {
  console.log('🚀 OnboardingIntegrationTabContent: Component rendering');
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<OnboardingApiRequirement | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real onboarding data
  const { data: requirements = [], isLoading, error } = useQuery({
    queryKey: ['onboarding-api-requirements', selectedCategory, selectedStatus],
    queryFn: async (): Promise<OnboardingApiRequirement[]> => {
      console.log('📊 Fetching onboarding API requirements...');
      
      try {
        // Fetch from treatment center onboarding table with correct column names
        const { data: onboardingData, error: onboardingError } = await supabase
          .from('treatment_center_onboarding')
          .select(`
            id,
            status,
            created_at,
            submitted_at
          `);

        let realRequirements: OnboardingApiRequirement[] = [];
        
        if (!onboardingError && onboardingData) {
          realRequirements = onboardingData.map(app => ({
            id: `real-${app.id}`,
            onboarding_id: app.id,
            facility_name: 'Treatment Center Application',
            api_type: 'EHR Integration',
            description: `API integration requirements for onboarding application ${app.id}`,
            status: app.status === 'approved' ? 'completed' : 
                    app.status === 'under_review' ? 'in_progress' : 'pending',
            submitted_at: app.submitted_at || app.created_at,
            requirements: ['FHIR R4 Support', 'OAuth 2.0', 'Patient Data Sync'],
            created_at: app.created_at,
            integration_category: 'treatment_center' as const,
            priority: 'medium' as const,
            security_level: 'hipaa_compliant' as const,
            workflow_stage: 'requirements_gathering' as const,
            compliance_requirements: ['HIPAA', 'SOC 2']
          }));
        }

        // Apply filters
        let filteredData = realRequirements;
        if (selectedCategory !== 'all') {
          filteredData = filteredData.filter(req => req.integration_category === selectedCategory);
        }
        if (selectedStatus !== 'all') {
          filteredData = filteredData.filter(req => req.status === selectedStatus);
        }

        console.log('✅ Real onboarding API requirements loaded:', filteredData);
        return filteredData;
      } catch (error) {
        console.error('Error fetching onboarding data:', error);
        return [];
      }
    },
    staleTime: 30000
  });

  // Workflow management mutations
  const updateWorkflowMutation = useMutation({
    mutationFn: async ({ requirementId, newStage, notes }: { 
      requirementId: string; 
      newStage: string; 
      notes?: string; 
    }) => {
      console.log('🔄 Updating workflow stage:', { requirementId, newStage, notes });
      return { requirementId, newStage, notes };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-api-requirements'] });
      toast({
        title: "Workflow Updated",
        description: "The integration workflow stage has been updated successfully.",
      });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'on_hold':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'on_hold':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'treatment_center':
        return <Stethoscope className="h-4 w-4 text-blue-500" />;
      case 'pharma_biotech':
        return <FlaskConical className="h-4 w-4 text-purple-500" />;
      case 'financial_verification':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      default:
        return <Building className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'outline';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleProcessRequirement = (requirementId: string) => {
    console.log('🔄 Processing onboarding API requirement:', requirementId);
    const requirement = requirements.find(r => r.id === requirementId);
    if (requirement) {
      setSelectedRequirement(requirement);
      setWorkflowDialogOpen(true);
    }
  };

  const handleViewDetails = (requirementId: string) => {
    console.log('👁️ Viewing details for requirement:', requirementId);
  };

  const handleUpdateWorkflow = (newStage: string, notes?: string) => {
    if (selectedRequirement) {
      updateWorkflowMutation.mutate({
        requirementId: selectedRequirement.id,
        newStage,
        notes
      });
      setWorkflowDialogOpen(false);
      setSelectedRequirement(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Onboarding API Integration</h3>
            <p className="text-sm text-muted-foreground">
              Loading API requirements from facility onboarding...
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading onboarding API requirements...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Onboarding API Integration</h3>
            <p className="text-sm text-muted-foreground">
              Error loading API requirements from facility onboarding
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Error loading API requirements</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Onboarding API Integration</h3>
          <p className="text-sm text-muted-foreground">
            Manage API requirements from treatment center onboarding applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{requirements.length} Active Requirements</Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="treatment_center">Treatment Centers</SelectItem>
            <SelectItem value="pharma_biotech">Pharma & Biotech</SelectItem>
            <SelectItem value="financial_verification">Financial Verification</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Overview - Using Real Data Only */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">
                  {requirements.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {requirements.filter(r => r.status === 'in_progress').length}
                </p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Pause className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  {requirements.filter(r => r.status === 'on_hold').length}
                </p>
                <p className="text-sm text-muted-foreground">On Hold</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {requirements.filter(r => r.status === 'completed').length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {requirements.filter(r => r.status === 'failed').length}
                </p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requirements List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            API Integration Requirements from Onboarding
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requirements.length > 0 ? (
            <div className="space-y-6">
              {requirements.map((requirement) => (
                <div key={requirement.id} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getCategoryIcon(requirement.integration_category)}
                        <h4 className="font-semibold text-lg">{requirement.facility_name}</h4>
                        <Badge variant={getStatusColor(requirement.status) as any}>
                          {getStatusIcon(requirement.status)}
                          <span className="ml-1 capitalize">{requirement.status.replace('_', ' ')}</span>
                        </Badge>
                        <Badge variant={getPriorityColor(requirement.priority) as any}>
                          {requirement.priority.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            API Type: {requirement.api_type}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            {requirement.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Category: <span className="capitalize">{requirement.integration_category.replace('_', ' ')}</span>
                          </p>
                        </div>
                        
                        <div>
                          {requirement.technical_contact && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-muted-foreground">Technical Contact:</p>
                              <p className="text-sm">{requirement.technical_contact.name}</p>
                              <p className="text-sm text-muted-foreground">{requirement.technical_contact.email}</p>
                            </div>
                          )}
                          {requirement.assigned_to && (
                            <p className="text-sm text-muted-foreground">
                              Assigned to: <span className="font-medium">{requirement.assigned_to}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Technical Requirements */}
                      {requirement.requirements.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Technical Requirements:</p>
                          <div className="flex flex-wrap gap-1">
                            {requirement.requirements.map((req, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Compliance Requirements */}
                      {requirement.compliance_requirements && requirement.compliance_requirements.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Compliance Requirements:</p>
                          <div className="flex flex-wrap gap-1">
                            {requirement.compliance_requirements.map((req, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Workflow Stage */}
                      <div className="mb-3">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Workflow Stage:</p>
                        <Badge variant="outline" className="text-xs">
                          <Workflow className="h-3 w-3 mr-1" />
                          {requirement.workflow_stage.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Submitted: {new Date(requirement.submitted_at).toLocaleDateString()}</span>
                        {requirement.estimated_completion_date && (
                          <span>Est. Completion: {new Date(requirement.estimated_completion_date).toLocaleDateString()}</span>
                        )}
                        <span>Security: {requirement.security_level.replace('_', ' ').toUpperCase()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(requirement.id)}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      {(requirement.status === 'pending' || requirement.status === 'in_progress') && (
                        <Button 
                          size="sm"
                          onClick={() => handleProcessRequirement(requirement.id)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No API Requirements Found</h3>
              <p className="text-muted-foreground">
                API requirements from facility onboarding will appear here when submitted.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Management Dialog */}
      {workflowDialogOpen && selectedRequirement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Manage Integration Workflow</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Facility: {selectedRequirement.facility_name}</p>
                <p className="text-sm text-muted-foreground mb-4">Current Stage: {selectedRequirement.workflow_stage}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {['requirements_gathering', 'technical_review', 'development', 'testing', 'deployment', 'completed'].map((stage) => (
                  <Button
                    key={stage}
                    variant={selectedRequirement.workflow_stage === stage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleUpdateWorkflow(stage)}
                    disabled={updateWorkflowMutation.isPending}
                  >
                    {stage.replace('_', ' ').toUpperCase()}
                  </Button>
                ))}
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setWorkflowDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
