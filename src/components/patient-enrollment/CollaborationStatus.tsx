/**
 * COLLABORATION STATUS COMPONENT
 * Shows current workflow status and pending collaborations
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  User,
  Building2,
  CreditCard,
  FileText,
  Activity,
  Send,
  Shield,
  Clipboard
} from 'lucide-react';

interface CollaborationStatusProps {
  collaborationStatus: {
    currentStage: string;
    pendingWith: string[];
    completedStages: string[];
  };
  totalSteps: number;
}

const stageIcons = {
  'submission_method': Send,
  'consent_management': Shield,
  'patient_info': User,
  'provider_info': Building2,
  'insurance': CreditCard,
  'therapy': FileText,
  'clinical': Activity,
  'medical_review': Clipboard,
  'submit': Send
};

const stageNames = {
  'submission_method': 'Submission Method',
  'consent_management': 'Consent Management',
  'patient_info': 'Patient Information',
  'provider_info': 'Provider Information',
  'insurance': 'Insurance Information',
  'therapy': 'Therapy Information',
  'clinical': 'Clinical Information',
  'medical_review': 'Medical Review',
  'submit': 'Final Submission'
};

export const CollaborationStatus: React.FC<CollaborationStatusProps> = ({
  collaborationStatus,
  totalSteps
}) => {
  const progress = (collaborationStatus.completedStages.length / totalSteps) * 100;
  
  const getCurrentStageIcon = () => {
    const IconComponent = stageIcons[collaborationStatus.currentStage as keyof typeof stageIcons] || Clock;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Workflow Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Enrollment Progress</span>
            <span>{collaborationStatus.completedStages.length} of {totalSteps} completed</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Stage */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          {getCurrentStageIcon()}
          <div className="flex-1">
            <div className="font-medium">
              Current Stage: {stageNames[collaborationStatus.currentStage as keyof typeof stageNames]}
            </div>
            <div className="text-sm text-muted-foreground">
              {collaborationStatus.pendingWith.length > 0 
                ? `Waiting for: ${collaborationStatus.pendingWith.join(', ')}`
                : 'Ready to proceed'
              }
            </div>
          </div>
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>

        {/* Completed Stages */}
        {collaborationStatus.completedStages.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Completed Stages</h4>
            <div className="space-y-2">
              {collaborationStatus.completedStages.map((stage, index) => {
                const IconComponent = stageIcons[stage as keyof typeof stageIcons] || CheckCircle2;
                return (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <span>{stageNames[stage as keyof typeof stageNames]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pending With Team Members */}
        {collaborationStatus.pendingWith.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Pending Approvals</h4>
            <div className="space-y-2">
              {collaborationStatus.pendingWith.map((member, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span>{member}</span>
                  <Badge variant="outline">Pending</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};