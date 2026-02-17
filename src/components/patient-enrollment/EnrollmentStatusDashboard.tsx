/**
 * ENROLLMENT STATUS DASHBOARD
 * Displays workflow status, critical areas pending, and overall progress
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  Building2, 
  CreditCard, 
  Activity,
  ClipboardList,
  AlertCircle
} from 'lucide-react';

interface EnrollmentStatus {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  pendingSteps: string[];
  criticalIssues: CriticalIssue[];
  overallProgress: number;
}

interface CriticalIssue {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  stepAffected: string;
  daysOverdue?: number;
}

interface EnrollmentStatusDashboardProps {
  enrollmentStatus: EnrollmentStatus;
  patientName?: string;
  enrollmentId?: string;
}

export const EnrollmentStatusDashboard: React.FC<EnrollmentStatusDashboardProps> = ({
  enrollmentStatus,
  patientName = "Patient",
  enrollmentId = "ENR-000"
}) => {
  const stepInfo = [
    { id: 'submission_method', name: 'Submission Method', icon: ClipboardList, color: 'bg-blue-500' },
    { id: 'consent_management', name: 'Consent Management', icon: User, color: 'bg-green-500' },
    { id: 'patient_info', name: 'Patient Information', icon: User, color: 'bg-purple-500' },
    { id: 'provider_info', name: 'Provider Information', icon: Building2, color: 'bg-orange-500' },
    { id: 'insurance', name: 'Insurance Verification', icon: CreditCard, color: 'bg-cyan-500' },
    { id: 'treatment_assessment', name: 'Treatment & Clinical Assessment', icon: Activity, color: 'bg-red-500' },
    { id: 'final_review', name: 'Final Review & Submit', icon: CheckCircle2, color: 'bg-emerald-500' }
  ];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Enrollment Status Dashboard
            </div>
            <Badge variant="outline" className="text-xs">
              {enrollmentId}
            </Badge>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {patientName} • Step {enrollmentStatus.currentStep} of {enrollmentStatus.totalSteps}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Overall Progress</div>
              <div className="text-sm text-muted-foreground">
                {enrollmentStatus.overallProgress}% Complete
              </div>
            </div>
            <Progress value={enrollmentStatus.overallProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues */}
      {enrollmentStatus.criticalIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Critical Areas Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {enrollmentStatus.criticalIssues.map((issue) => (
              <Alert key={issue.id} className="border-l-4 border-l-red-500">
                <div className="flex items-start gap-3">
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{issue.title}</h4>
                      <Badge variant={getSeverityBadge(issue.severity) as any} className="text-xs">
                        {issue.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <AlertDescription className="mt-1">
                      {issue.description}
                    </AlertDescription>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Affects: {issue.stepAffected}</span>
                      {issue.daysOverdue && (
                        <span className="text-red-600">
                          {issue.daysOverdue} days overdue
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Step-by-Step Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stepInfo.map((step, index) => {
              const isCompleted = enrollmentStatus.completedSteps.includes(step.id);
              const isCurrent = index === enrollmentStatus.currentStep;
              const isPending = enrollmentStatus.pendingSteps.includes(step.id);
              const IconComponent = step.icon;

              return (
                <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className={`p-2 rounded-full ${
                    isCompleted ? 'bg-green-100 text-green-600' :
                    isCurrent ? 'bg-blue-100 text-blue-600' :
                    isPending ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{step.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Step {index + 1} of {stepInfo.length}
                    </div>
                  </div>
                  <div>
                    {isCompleted && (
                      <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                    )}
                    {isCurrent && (
                      <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Current
                      </Badge>
                    )}
                    {isPending && (
                      <Badge variant="secondary" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="font-medium text-sm">View Full Form</div>
              <div className="text-xs text-muted-foreground">Open complete enrollment</div>
            </button>
            <button className="p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="font-medium text-sm">Send Reminder</div>
              <div className="text-xs text-muted-foreground">Notify pending parties</div>
            </button>
            <button className="p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="font-medium text-sm">Download PDF</div>
              <div className="text-xs text-muted-foreground">Export current progress</div>
            </button>
            <button className="p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="font-medium text-sm">Add Note</div>
              <div className="text-xs text-muted-foreground">Internal comments</div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export type { EnrollmentStatus, CriticalIssue };