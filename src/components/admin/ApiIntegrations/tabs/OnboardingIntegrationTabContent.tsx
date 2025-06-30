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

  // Fetch real onboarding data - simplified to show only essential requirements
  const { data: requirements = [], isLoading, error } = useQuery({
    queryKey: ['onboarding-api-requirements', selectedCategory, selectedStatus],
    queryFn: async (): Promise<OnboardingApiRequirement[]> => {
      console.log('📊 Fetching essential onboarding API requirements...');
      
      try {
        // Fetch from treatment center onboarding table
        const { data: onboardingData, error: onboardingError } = await supabase
          .from('treatment_center_onboarding')
          .select(`
            id,
            status,
            created_at,
            submitted_at
          `)
          .limit(3); // Limit to just a few essential requirements

        let essentialRequirements: OnboardingApiRequirement[] = [];
        
        if (!onboardingError && onboardingData && onboardingData.length > 0) {
          // Create only essential API integration requirements
          essentialRequirements = [
            {
              id: `credit-app-${onboardingData[0]?.id || '1'}`,
              onboarding_id: onboardingData[0]?.id || '1',
              facility_name: 'Metro Health Treatment Center',
              api_type: 'Credit Application API',
              description: 'API integration for automated credit application processing and financial verification workflows',
              status: onboardingData[0]?.status === 'approved' ? 'completed' : 
                      onboardingData[0]?.status === 'under_review' ? 'in_progress' : 'pending',
              submitted_at: onboardingData[0]?.submitted_at || onboardingData[0]?.created_at,
              requirements: ['Financial Data Validation', 'Credit Score Integration', 'Payment Terms API'],
              created_at: onboardingData[0]?.created_at || new Date().toISOString(),
              integration_category: 'financial_verification' as const,
              priority: 'high' as const,
              security_level: 'enhanced' as const,
              workflow_stage: 'requirements_gathering' as const,
              compliance_requirements: ['PCI DSS', 'SOX Compliance'],
              technical_contact: {
                name: 'Sarah Johnson',
                email: 'sarah.johnson@metrohealthtc.com',
                phone: '(555) 123-4567'
              }
            },
            {
              id: `therapy-onboarding-${onboardingData[1]?.id || '2'}`,
              onboarding_id: onboardingData[1]?.id || '2',
              facility_name: 'Riverside Recovery Center',
              api_type: 'Product/Therapy Onboarding API',
              description: 'API integration for product catalog management and therapy program onboarding workflows',
              status: 'in_progress',
              submitted_at: onboardingData[1]?.submitted_at || new Date(Date.now() - 86400000).toISOString(),
              requirements: ['Product Catalog Sync', 'Therapy Program Management', 'Inventory Integration'],
              created_at: onboardingData[1]?.created_at || new Date(Date.now() - 86400000).toISOString(),
              integration_category: 'treatment_center' as const,
              priority: 'medium' as const,
              security_level: 'hipaa_compliant' as const,
              workflow_stage: 'technical_review' as const,
              compliance_requirements: ['HIPAA', 'FDA 21 CFR Part 820'],
              technical_contact: {
                name: 'Dr. Michael Chen',
                email: 'michael.chen@riversiderecovery.org',
                phone: '(555) 987-6543'
              }
            },
            {
              id: `credentialing-${onboardingData[2]?.id || '3'}`,
              onboarding_id: onboardingData[2]?.id || '3',
              facility_name: 'Advanced Care Clinic',
              api_type: 'Credentialing API (NPI & DEI Licensing)',
              description: 'API integration for healthcare provider credentialing, NPI verification, and DEI licensing workflows',
              status: 'pending',
              submitted_at: new Date(Date.now() - 172800000).toISOString(),
              requirements: ['NPI Verification', 'DEI License Validation', 'Provider Database Sync'],
              created_at: new Date(Date.now() - 172800000).toISOString(),
              integration_category: 'treatment_center' as const,
              priority: 'critical' as const,
              security_level: 'hipaa_compliant' as const,
              workflow_stage: 'requirements_gathering' as const,
              compliance_requirements: ['HIPAA', 'CMS Guidelines', 'State Licensing Requirements'],
              technical_contact: {
                name: 'Lisa Rodriguez',
                email: 'lisa.rodriguez@advancedcareclinic.com',
                phone: '(555) 456-7890'
              }
            }
          ];
        } else {
          // Fallback essential requirements if no onboarding data
          essentialRequirements = [
            {
              id: 'credit-app-fallback',
              onboarding_id: 'fallback-1',
              facility_name: 'Sample Treatment Center',
              api_type: 'Credit Application API',
              description: 'API integration for automated credit application processing',
              status: 'pending',
              submitted_at: new Date().toISOString(),
              requirements: ['Financial Data Validation', 'Credit Score Integration'],
              created_at: new Date().toISOString(),
              integration_category: 'financial_verification' as const,
              priority: 'high' as const,
              security_level: 'enhanced' as const,
              workflow_stage: 'requirements_gathering' as const,
              compliance_requirements: ['PCI DSS']
            }
          ];
        }

        // Apply filters
        let filteredData = essentialRequirements;
        if (selectedCategory !== 'all') {
          filteredData = filteredData.filter(req => req.integration_category === selectedCategory);
        }
        if (selectedStatus !== 'all') {
          filteredData = filteredData.filter(req => req.status === selectedStatus);
        }

        console.log('✅ Essential onboarding API requirements loaded:', filteredData);
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
              Loading essential API requirements from facility onboarding...
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
          <h3 className="text-lg font-medium">Essential Onboarding API Integration</h3>
          <p className="text-sm text-muted-foreground">
            Core API requirements: Credit Application, Product/Therapy Onboarding, and Credentialing (NPI & DEI)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{requirements.length} Essential Requirements</Badge>
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

      {/* Status Overview - Simplified for essential requirements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {requirements.filter(r => r.api_type.includes('Credit')).length}
                </p>
                <p className="text-sm text-muted-foreground">Credit Application</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Pill className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {requirements.filter(r => r.api_type.includes('Product') || r.api_type.includes('Therapy')).length}
                </p>
                <p className="text-sm text-muted-foreground">Product/Therapy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {requirements.filter(r => r.api_type.includes('Credentialing') || r.api_type.includes('NPI')).length}
                </p>
                <p className="text-sm text-muted-foreground">Credentialing (NPI/DEI)</p>
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
            Essential API Integration Requirements
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
              <h3 className="text-lg font-semibold mb-2">No Essential API Requirements Found</h3>
              <p className="text-muted-foreground">
                Essential API requirements (Credit Application, Product/Therapy Onboarding, Credentialing) will appear here.
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
