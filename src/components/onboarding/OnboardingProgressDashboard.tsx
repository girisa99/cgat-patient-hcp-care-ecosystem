/**
 * ONBOARDING PROGRESS DASHBOARD
 * Shows detailed application status, time tracking, and pending activities
 * Role: onboardingTeam
 */
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Calendar,
  FileText,
  DollarSign,
  Users,
  Building,
  Activity
} from 'lucide-react';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

interface OnboardingProgressDashboardProps {
  applications: any[]; // Use any[] to handle the actual database structure
  onNavigateToStep: (applicationId: string, step: string) => void;
}

interface ApplicationProgress {
  id: string;
  name: string;
  status: string;
  currentStep: string;
  daysInProcess: number;
  completionPercentage: number;
  pendingActivities: PendingActivity[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  lastActivity: string;
}

interface PendingActivity {
  activity: string;
  step: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  icon: React.ComponentType<any>;
  estimatedDays: number;
}

export function OnboardingProgressDashboard({ applications, onNavigateToStep }: OnboardingProgressDashboardProps) {
  console.log('🔍 OnboardingProgressDashboard received applications:', applications?.length || 0, applications);
  
  // Real-time enrollment integration
  const [realtimeUpdates, setRealtimeUpdates] = React.useState<any[]>([]);
  const [enrollmentProgress, setEnrollmentProgress] = React.useState<Record<string, number>>({});
  
  // Simulate real-time updates (would connect to actual real-time system)
  React.useEffect(() => {
    const interval = setInterval(() => {
      const update = {
        id: Date.now(),
        type: 'enrollment_progress',
        applicationId: applications[0]?.id,
        progress: Math.min(100, (enrollmentProgress[applications[0]?.id] || 0) + Math.random() * 10),
        timestamp: new Date().toISOString(),
        section: ['consent_mode', 'patient_info', 'provider_treatment_center', 'insurance', 'treatment_clinical'][Math.floor(Math.random() * 5)]
      };
      
      setRealtimeUpdates(prev => [update, ...prev.slice(0, 49)]);
      setEnrollmentProgress(prev => ({
        ...prev,
        [applications[0]?.id]: update.progress
      }));
    }, 15000); // Update every 15 seconds
    
    return () => clearInterval(interval);
  }, [applications]);
  
  // Calculate detailed progress for each application
  const calculateApplicationProgress = (app: any): ApplicationProgress => {
    const createdDate = new Date(app.created_at || Date.now());
    const daysInProcess = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Define all possible steps and their weights
    const allSteps = [
      'company_info', 'distributor_selection', 'business_classification', 'contacts',
      'ownership', 'references', 'therapy_selection', 'service_selection',
      'payment_banking', 'financial_assessment', 'credit_application',
      'licenses', 'documents', 'authorizations', 'review'
    ];
    
    // Calculate completion based on available data
    let completedSteps = 0;
    const pendingActivities: PendingActivity[] = [];
    
    // Check company info
    if (app.legal_name && app.federal_tax_id) {
      completedSteps += 1;
    } else {
      pendingActivities.push({
        activity: 'Complete Company Information',
        step: 'company_info',
        description: 'Legal name and federal tax ID required',
        urgency: 'high',
        icon: Building,
        estimatedDays: 1
      });
    }
    
    // Check distributor selection
    if (app.selected_distributors && app.selected_distributors.length > 0) {
      completedSteps += 1;
    } else {
      pendingActivities.push({
        activity: 'Select Distributors',
        step: 'distributor_selection',
        description: 'Choose preferred pharmaceutical distributors',
        urgency: 'medium',
        icon: Users,
        estimatedDays: 2
      });
    }
    
    // Check business classification
    if (app.business_types && app.business_types.length > 0) {
      completedSteps += 1;
    } else {
      pendingActivities.push({
        activity: 'Complete Business Classification',
        step: 'business_classification',
        description: 'Specify business type and ownership details',
        urgency: 'medium',
        icon: FileText,
        estimatedDays: 1
      });
    }
    
    // Check therapy selections
    if (app.therapy_selections && app.therapy_selections.length > 0) {
      completedSteps += 1;
    } else {
      pendingActivities.push({
        activity: 'Complete Therapy & Service Selection',
        step: 'therapy_selection',
        description: 'Select therapies and services offered',
        urgency: 'high',
        icon: Activity,
        estimatedDays: 3
      });
    }
    
    // Check service selections
    if (app.service_selections && app.service_selections.length > 0) {
      completedSteps += 1;
    } else {
      pendingActivities.push({
        activity: 'Complete Service Selection',
        step: 'service_selection',
        description: 'Configure additional healthcare services',
        urgency: 'medium',
        icon: CheckCircle,
        estimatedDays: 2
      });
    }
    
    // Check financial assessment
    if (app.annual_revenue_range) {
      completedSteps += 1;
    } else {
      pendingActivities.push({
        activity: 'Complete Financial Assessment',
        step: 'financial_assessment',
        description: 'Provide financial information and credit details',
        urgency: 'critical',
        icon: DollarSign,
        estimatedDays: 5
      });
    }
    
    // Check credit application
    if (app.requested_credit_limit) {
      completedSteps += 1;
    } else {
      pendingActivities.push({
        activity: 'Submit Credit Application',
        step: 'credit_application',
        description: 'Complete credit application and trade references',
        urgency: 'critical',
        icon: DollarSign,
        estimatedDays: 7
      });
    }
    
    // Check documents
    if (app.voided_check && app.dea_registration_copy) {
      completedSteps += 1;
    } else {
      pendingActivities.push({
        activity: 'Upload Required Documents',
        step: 'documents',
        description: 'Submit licenses, financial statements, and certifications',
        urgency: 'high',
        icon: FileText,
        estimatedDays: 3
      });
    }
    
    const completionPercentage = Math.round((completedSteps / allSteps.length) * 100);
    
    // Determine urgency level based on days in process and completion
    let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (daysInProcess > 30 && completionPercentage < 50) urgencyLevel = 'critical';
    else if (daysInProcess > 20 && completionPercentage < 70) urgencyLevel = 'high';
    else if (daysInProcess > 10 && completionPercentage < 90) urgencyLevel = 'medium';
    
    return {
      id: app.id || '',
      name: app.legal_name || app.dba_name || 'Unnamed Application',
      status: app.status || 'draft',
      currentStep: app.current_step || 'company_info',
      daysInProcess,
      completionPercentage,
      pendingActivities,
      urgencyLevel,
      lastActivity: app.updated_at || app.created_at || ''
    };
  };

  const progressData = applications
    .filter(app => {
      console.log('🔍 Filtering app:', app.legal_name || app.dba_name, app);
      return app.legal_name || app.dba_name;
    }) // Filter out incomplete applications
    .map(calculateApplicationProgress)
    .sort((a, b) => {
      // Sort by urgency first, then by days in process
      const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgencyLevel] - urgencyOrder[a.urgencyLevel] || b.daysInProcess - a.daysInProcess;
    });

  console.log('🔍 Progress data after filtering:', progressData?.length || 0, progressData);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'under_review': return 'bg-blue-500';
      case 'submitted': return 'bg-purple-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (progressData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application Progress Tracking</CardTitle>
          <CardDescription>No active onboarding applications found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Start your first treatment center onboarding to see progress tracking here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Application Progress Tracking
        </CardTitle>
        <CardDescription>
          Monitor onboarding progress, pending activities, and time in process for each treatment center
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {progressData.map((progress) => (
          <Card key={progress.id} className={`border-l-4 ${getUrgencyColor(progress.urgencyLevel).split(' ')[2]}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{progress.name}</h3>
                    <Badge variant="outline" className={getStatusColor(progress.status)}>
                      {progress.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className={getUrgencyColor(progress.urgencyLevel)}>
                      {progress.urgencyLevel.toUpperCase()} PRIORITY
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{progress.daysInProcess} days in process</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Current step: {progress.currentStep.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-muted-foreground">{progress.completionPercentage}%</span>
                    </div>
                    <Progress value={progress.completionPercentage} className="h-2" />
                  </div>
                </div>
              </div>

              {progress.pendingActivities.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span>Pending Activities ({progress.pendingActivities.length})</span>
                  </div>
                  
                  <div className="grid gap-2">
                    {progress.pendingActivities.slice(0, 3).map((activity, index) => {
                      const IconComponent = activity.icon;
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <IconComponent className="h-4 w-4 text-gray-600" />
                            <div>
                              <p className="font-medium text-sm">{activity.activity}</p>
                              <p className="text-xs text-muted-foreground">{activity.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getUrgencyColor(activity.urgency)}>
                              {activity.estimatedDays}d
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onNavigateToStep(progress.id, activity.step)}
                              className="gap-1"
                            >
                              Complete
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    
                    {progress.pendingActivities.length > 3 && (
                      <div className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onNavigateToStep(progress.id, progress.currentStep)}
                          className="text-muted-foreground"
                        >
                          +{progress.pendingActivities.length - 3} more activities
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {progress.pendingActivities.length === 0 && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">All activities completed - Ready for review</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}