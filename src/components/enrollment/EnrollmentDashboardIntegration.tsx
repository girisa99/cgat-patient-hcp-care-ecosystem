/**
 * ENROLLMENT DASHBOARD INTEGRATION
 * Real-time sync component for reflecting enrollment progress in both patient and onboarding dashboards
 */
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Activity,
  Users,
  FileText,
  Shield,
  Building2,
  CreditCard,
  Stethoscope,
  Send,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useEnrollmentRealtimeContext } from './EnrollmentRealtimeProvider';

interface DashboardIntegrationProps {
  dashboardType: 'patient' | 'onboarding';
  showTransitions?: boolean;
  showAIProgress?: boolean;
}

export const EnrollmentDashboardIntegration: React.FC<DashboardIntegrationProps> = ({
  dashboardType,
  showTransitions = true,
  showAIProgress = true
}) => {
  const {
    isConnected,
    connectionStatus,
    tabProgress,
    overallProgress,
    activeSessions,
    dashboardUpdates,
    patientPageUpdates,
    transitionToNextSection,
    syncWithDashboard
  } = useEnrollmentRealtimeContext();

  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);

  const updates = dashboardType === 'patient' ? patientPageUpdates : dashboardUpdates;

  useEffect(() => {
    setRecentUpdates(updates.slice(0, 10));
  }, [updates]);

  const tabIcons = {
    consent_mode: Shield,
    patient_info: Users,
    provider_treatment_center: Building2,
    insurance: CreditCard,
    treatment_clinical: Stethoscope,
    submit: Send
  };

  const getTabIcon = (tabId: string) => {
    const Icon = tabIcons[tabId as keyof typeof tabIcons] || FileText;
    return Icon;
  };

  const getTabTitle = (tabId: string) => {
    const titles = {
      consent_mode: 'Consent Mode',
      patient_info: 'Patient Information',
      provider_treatment_center: 'Provider & Treatment Center',
      insurance: 'Insurance',
      treatment_clinical: 'Treatment & Clinical',
      submit: 'Submit'
    };
    return titles[tabId as keyof typeof titles] || tabId.replace('_', ' ');
  };

  const getCompletionColor = (completion: number) => {
    if (completion >= 90) return 'text-green-600 bg-green-50';
    if (completion >= 70) return 'text-blue-600 bg-blue-50';
    if (completion >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const handleSectionTransition = (currentTab: string) => {
    const tabKeys = Object.keys(tabProgress);
    const currentIndex = tabKeys.indexOf(currentTab);
    const nextTab = tabKeys[currentIndex + 1];
    
    if (nextTab) {
      transitionToNextSection(currentTab, nextTab);
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Connection Status */}
      <Card className={`${isConnected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="font-medium">
                {dashboardType === 'patient' ? 'Patient Dashboard' : 'Onboarding Dashboard'} Real-time Sync
              </span>
              <Badge variant="outline" className={isConnected ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}>
                {connectionStatus}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Active Sessions: {Object.keys(activeSessions).length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={syncWithDashboard}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Sync
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Enrollment Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Overall Completion</span>
              <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>MCP Agents Active</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Conversational AI Active</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Structured AI Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Section Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Object.entries(tabProgress).map(([tabId, progress]) => {
              const Icon = getTabIcon(tabId);
              return (
                <div key={tabId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{getTabTitle(tabId)}</span>
                        <Badge className={getCompletionColor(progress.completion)}>
                          {progress.completion}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Last updated: {new Date(progress.lastUpdated).toLocaleTimeString()}</span>
                        <Badge variant="outline" className="text-xs">
                          {progress.currentSection.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Progress value={progress.completion} className="h-2 mt-2" />
                    </div>
                  </div>
                  {showTransitions && progress.completion < 100 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSectionTransition(tabId)}
                      className="ml-4 flex items-center gap-1"
                    >
                      Continue
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Progress Breakdown */}
      {showAIProgress && (
        <Card>
          <CardHeader>
            <CardTitle>AI Integration Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="font-semibold">MCP Agents</span>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {Object.values(tabProgress).filter(tab => 
                    tab.activeAITypes.includes('mcp')).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Sections</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="font-semibold">Conversational AI</span>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {Object.values(tabProgress).filter(tab => 
                    tab.activeAITypes.includes('conversational')).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Sections</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="font-semibold">Structured AI</span>
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {Object.values(tabProgress).filter(tab => 
                    tab.activeAITypes.includes('structured')).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Sections</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Updates */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentUpdates.length > 0 ? (
              recentUpdates.map((update, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {update.type === 'progress_update' ? 'Progress Updated' : 
                       update.type === 'dashboard_sync' ? 'Dashboard Synced' : 
                       'Update Received'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(update.timestamp).toLocaleString()}
                    </div>
                  </div>
                  {update.tabId && (
                    <Badge variant="outline" className="text-xs">
                      {getTabTitle(update.tabId)}
                    </Badge>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent updates</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};