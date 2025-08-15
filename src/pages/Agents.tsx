import React, { useState, useEffect, Suspense } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AgenticEcosystem from '@/pages/AgenticEcosystem';
import { DeploymentManagementInterface } from '@/components/deployment/DeploymentManagementInterface';
import { AgentTestingInterface } from '@/components/agent-testing/AgentTestingInterface';
import ChannelAndVoiceSetup from '@/components/agent-deployment/ChannelAndVoiceSetup';
import { AgenticAIPresentation } from '@/components/presentation/AgenticAIPresentation';
import DeploymentReadyView from '@/components/deployment/DeploymentReadyView';
import EnhancedDeploymentReadyView from '@/components/deployment/EnhancedDeploymentReadyView';
import { Link } from 'react-router-dom';
import ActiveDeploymentsView from '@/components/deployment/ActiveDeploymentsView';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { 
  Bot, 
  Settings, 
  Users, 
  Presentation,
  X,
  TestTube,
  UserCog,
  Grid,
  Rocket,
  Activity,
  Workflow
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Removed Helmet to prevent context errors
// Role-specific components - defined before use to avoid React error #185
import TreatmentCentersView from '@/components/onboarding/TreatmentCentersView';
import { AgentBuilderProvider, useAgentBuilder } from '@/components/agent-builder/AgentBuilderProvider';
import ModePicker from '@/components/agent-builder/ModePicker';
import { WelcomeFlow } from '@/components/agent-builder/WelcomeFlow';

// Lazy load the workflow studio
const EmbeddedWorkflowStudio = React.lazy(() => import('@/components/agent-builder/EmbeddedWorkflowStudio'));

const OnboardingAgentsView = () => {
  return <TreatmentCentersView />;
};

const AgentSettingsView = () => {
  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          SuperAdmin Only - Agent Configuration
        </h3>
        <p className="text-red-700">
          Advanced agent settings and configurations - SuperAdmin exclusive access.
        </p>
      </div>
      
      {/* SuperAdmin-only settings would go here */}
      <div className="space-y-4">
        <div className="bg-card rounded-lg border p-4">
          <h4 className="font-medium mb-2">Global Agent Settings</h4>
          <p className="text-sm text-muted-foreground">
            Configure system-wide agent parameters and security settings.
          </p>
        </div>
      </div>
    </div>
  );
};

const AgentsInner = () => {
  console.log('🚀 Agents page rendering...');
  const [showWelcomeFlow, setShowWelcomeFlow] = useState(false);
  const [welcomeData, setWelcomeData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('ecosystem');
  const [showPresentation, setShowPresentation] = useState(false);
  const [showProgressOptions, setShowProgressOptions] = useState(false);
  const [showSessionOptions, setShowSessionOptions] = useState(false);
  const [savedProgress, setSavedProgress] = useState<any>(null);
  const [draftSessions, setDraftSessions] = useState<any[]>([]);
  const { userRoles } = useMasterAuth();
  const { userSessions, isLoading: sessionsLoading, setCurrentSessionId } = useAgentBuilder();
  console.log('🎭 User roles:', userRoles);

  // Role-based access control
  const isSuperAdmin = userRoles.includes('superAdmin');
  const isOnboardingTeam = userRoles.includes('onboardingTeam');
  const isAdmin = userRoles.includes('admin');

  // Check for existing sessions and saved progress on component mount
  useEffect(() => {
    if (sessionsLoading) return;
    
    // First check for existing draft/in-progress agent sessions
    const draftAgentSessions = userSessions?.filter(session => 
      session.status === 'draft' || session.status === 'in_progress'
    ) || [];
    
    if (draftAgentSessions.length > 0) {
      setDraftSessions(draftAgentSessions);
      setShowSessionOptions(true);
      return;
    }
    
    // Then check for saved welcome flow progress
    const savedAgentProgress = localStorage.getItem('agent-builder-progress');
    if (savedAgentProgress) {
      try {
        const progress = JSON.parse(savedAgentProgress);
        setSavedProgress(progress);
        setShowProgressOptions(true);
      } catch (error) {
        console.error('Failed to parse saved progress:', error);
        localStorage.removeItem('agent-builder-progress');
        setShowWelcomeFlow(true);
      }
    } else {
      setShowWelcomeFlow(true);
    }
  }, [userSessions, sessionsLoading]);

  // Start new agent flow
  const startNewAgent = () => {
    // Clear any existing progress and sessions
    localStorage.removeItem('agent-builder-progress');
    setSavedProgress(null);
    setShowProgressOptions(false);
    setShowSessionOptions(false);
    setDraftSessions([]);
    setWelcomeData(null);
    setCurrentSessionId(null);
    setActiveTab('ecosystem');
    setShowWelcomeFlow(true);
  };

  // Resume existing agent session
  const resumeSession = (session: any) => {
    setCurrentSessionId(session.id);
    setShowSessionOptions(false);
    // Navigate to the appropriate tab based on session progress
    if (session.current_step) {
      setActiveTab('workflow-studio'); // Or determine based on current_step
    }
  };

  // Continue with saved progress
  const continueProgress = () => {
    if (savedProgress) {
      setWelcomeData(savedProgress);
      setShowProgressOptions(false);
      setShowWelcomeFlow(false);
      // Set tab based on saved mode
      if (savedProgress.selectedMode === 'visual') {
        setActiveTab('workflow-studio');
      } else if (savedProgress.selectedMode === 'prompt') {
        setActiveTab('workflow-studio');
      } else {
        setActiveTab('ecosystem');
      }
    }
  };

  const handleWelcomeComplete = (data: any) => {
    // Save progress to localStorage
    const progressData = {
      ...data,
      timestamp: new Date().toISOString(),
      lastStep: 'welcome-complete'
    };
    localStorage.setItem('agent-builder-progress', JSON.stringify(progressData));
    
    setWelcomeData(data);
    setShowWelcomeFlow(false);
    setShowProgressOptions(false);
    
    // Set initial tab based on selected mode
    if (data.selectedMode === 'prompt') {
      setActiveTab('workflow-studio');
    } else if (data.selectedMode === 'visual') {
      setActiveTab('workflow-studio');
    } else if (data.selectedMode === 'manual') {
      setActiveTab('ecosystem');
    }
  };

  // Save progress whenever important changes happen
  const saveProgress = (additionalData: any = {}) => {
    if (welcomeData) {
      const updatedProgress = {
        ...welcomeData,
        ...additionalData,
        timestamp: new Date().toISOString(),
        currentTab: activeTab
      };
      localStorage.setItem('agent-builder-progress', JSON.stringify(updatedProgress));
    }
  };

  // Update progress when tab changes
  useEffect(() => {
    if (welcomeData) {
      saveProgress({ currentTab: activeTab });
    }
  }, [activeTab, welcomeData]);

  // Minimal SEO without Helmet to avoid context errors
  useEffect(() => {
    try {
      document.title = 'Agents – Visual Workflow, Templates, Prompts';
      const metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      metaDesc.setAttribute('content', 'Build and deploy healthcare AI agents with visual workflows, templates, and prompt-based generation.');
      if (!metaDesc.parentElement) document.head.appendChild(metaDesc);

      const linkCanonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      linkCanonical.setAttribute('href', '/agents');
      if (!linkCanonical.parentElement) document.head.appendChild(linkCanonical);
    } catch (e) {
      // no-op
    }
  }, []);

  // Generate available tabs based on user roles - reorganized for better UX flow
  const availableTabs = [
    { id: 'ecosystem', label: 'Agent Ecosystem', component: 'AgenticEcosystem' },
    { id: 'workflow-studio', label: 'Visual Workflow Builder', component: 'WorkflowStudio' },
    ...(isOnboardingTeam ? [{ id: 'onboarding', label: 'Treatment Centers', component: 'OnboardingAgentsView' }] : []),
    { id: 'deployment-ready', label: 'Deployment Ready', component: 'DeploymentReady' },
    { id: 'channel-assignment', label: 'Channel & Voice Setup', component: 'ChannelAssignment' },
    { id: 'testing', label: 'Agent Testing', component: 'AgentTestingInterface' },
    { id: 'active-deployments', label: 'Active Deployments', component: 'ActiveDeployments' },
    ...(isSuperAdmin ? [{ id: 'settings', label: 'Agent Settings', component: 'AgentSettingsView' }] : []),
  ];

  // Show session options if user has existing agent sessions
  if (showSessionOptions && draftSessions.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-lg border p-8">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
              <p className="text-muted-foreground">
                You have {draftSessions.length} agent{draftSessions.length > 1 ? 's' : ''} in progress. 
                Choose one to continue or start a new agent.
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              {draftSessions.map((session) => (
                <div 
                  key={session.id} 
                  className="bg-blue-50 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => resumeSession(session)}
                >
                  <h3 className="font-semibold text-blue-900 mb-1">
                    {session.name || 'Untitled Agent'}
                  </h3>
                  <p className="text-sm text-blue-700 mb-2">
                    Status: {session.status} • Step: {session.current_step}
                  </p>
                  <p className="text-xs text-blue-600">
                    Last updated: {new Date(session.updated_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <Button variant="outline" onClick={startNewAgent} className="w-full">
                Start New Agent
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show progress options if user has saved work
  if (showProgressOptions && savedProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg border p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
            <p className="text-muted-foreground mb-2">
              You have work in progress on an agent.
            </p>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-blue-900 mb-1">
                {savedProgress.analysisResult?.title || 'Healthcare Agent'}
              </h3>
              <p className="text-sm text-blue-700 mb-2">
                Mode: {savedProgress.selectedMode?.charAt(0).toUpperCase() + savedProgress.selectedMode?.slice(1)}
              </p>
              <p className="text-xs text-blue-600">
                Last worked on: {new Date(savedProgress.timestamp).toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={continueProgress} className="w-full">
                Continue Where I Left Off
              </Button>
              <Button variant="outline" onClick={startNewAgent} className="w-full">
                Start New Agent
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show welcome flow for new agents
  if (showWelcomeFlow) {
    return <WelcomeFlow onComplete={handleWelcomeComplete} />;
  }

  // Add error boundary for debugging
  try {
    return (
      <AppLayout>
        <div className="space-y-6">
          {/* Welcome data summary */}
          {welcomeData && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-900">
                    {welcomeData.analysisResult?.title || 'Agent Configuration'}
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Mode: {welcomeData.selectedMode} • 
                    {welcomeData.isReturningUser ? ' Returning User' : ' New User'}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={startNewAgent}
                >
                  Start New Agent
                </Button>
              </div>
            </div>
          )}

          {/* Role-specific header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isOnboardingTeam && !isSuperAdmin ? 'Treatment Center Agents' : 'Agents'}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isOnboardingTeam && !isSuperAdmin 
                  ? 'Create, configure, and deploy agents for treatment center onboarding workflows. Use Deployment Management to deploy agents to live channels.'
                  : 'Create, configure, and deploy intelligent agents for healthcare automation across multiple channels.'
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex items-center gap-2" onClick={() => setActiveTab('workflow-studio')} aria-label="Open Visual Workflow Builder tab">
                <Workflow className="w-4 h-4" />
                Visual Workflow Builder
              </Button>
              <Link to="/agents/new">
                <Button className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  New Agent
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => setShowPresentation(!showPresentation)}
                className="flex items-center gap-2"
              >
                <Presentation className="w-4 h-4" />
                {showPresentation ? 'Hide' : 'Show'} AI Presentation
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <ModePicker />
          </div>

          {/* AI Presentation Display */}
          {showPresentation && (
            <div className="mb-8">
              <AgenticAIPresentation />
            </div>
          )}

          {/* Dynamic Tabs based on role */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="parent-tabs">
               {availableTabs.map((tab) => (
                 <TabsTrigger 
                   key={tab.id} 
                   value={tab.id} 
                   className="parent-tab-trigger flex items-center gap-2"
                 >
                   {tab.id === 'ecosystem' && <Bot className="h-4 w-4" />}
                   {tab.id === 'workflow-studio' && <Grid className="h-4 w-4" />}
                   {tab.id === 'onboarding' && <Users className="h-4 w-4" />}
                   {tab.id === 'deployment-ready' && <Rocket className="h-4 w-4" />}
                   {tab.id === 'channel-assignment' && <Settings className="h-4 w-4" />}
                   {tab.id === 'testing' && <TestTube className="h-4 w-4" />}
                   {tab.id === 'active-deployments' && <Activity className="h-4 w-4" />}
                   {tab.id === 'settings' && <UserCog className="h-4 w-4" />}
                   <span className="font-medium text-sm">{tab.label}</span>
                 </TabsTrigger>
               ))}
            </TabsList>

            <TabsContent value="ecosystem" className="parent-tab-content">
              <AgenticEcosystem />
            </TabsContent>
            
            <TabsContent value="workflow-studio" className="parent-tab-content">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 shadow-sm">
                  <h3 className="font-bold text-purple-900 mb-3 text-lg flex items-center gap-2">
                    <Workflow className="h-5 w-5" />
                    Enhanced Visual Workflow Builder
                  </h3>
                  <p className="text-purple-700">
                    Full-featured visual agent builder with session management, deployment pipeline, channel assignment, 
                    knowledge base configuration, RAG setup, and complete backend integration. All functionality from 
                    manual builder now available in visual drag & drop interface.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">Session Management</Badge>
                    <Badge variant="outline" className="text-xs">Full Deployment</Badge>
                    <Badge variant="outline" className="text-xs">Channel Assignment</Badge>
                    <Badge variant="outline" className="text-xs">RAG Configuration</Badge>
                    <Badge variant="outline" className="text-xs">Knowledge Bases</Badge>
                    <Badge variant="outline" className="text-xs">MCP Integration</Badge>
                    <Badge variant="outline" className="text-xs">Label Studio</Badge>
                    <Badge variant="outline" className="text-xs">Real-time Testing</Badge>
                  </div>
                </div>
                <Suspense fallback={<div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading Enhanced Workflow Builder...</p>
                  </div>
                </div>}>
                  <EmbeddedWorkflowStudio />
                </Suspense>
              </div>
            </TabsContent>
            
            <TabsContent value="deployment-ready" className="parent-tab-content">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 shadow-sm">
                  <h3 className="font-bold text-blue-900 mb-3 text-lg">Ready for Deployment</h3>
                  <p className="text-blue-700">
                    View agents from the ecosystem and sessions from treatment centers that are ready to be deployed to live channels. This shows the complete data flow from creation to deployment.
                  </p>
                </div>
                <EnhancedDeploymentReadyView />
              </div>
            </TabsContent>

            <TabsContent value="channel-assignment" className="parent-tab-content">
              <ChannelAndVoiceSetup />
            </TabsContent>

            <TabsContent value="testing" className="parent-tab-content">
              <AgentTestingInterface />
            </TabsContent>

            <TabsContent value="active-deployments" className="parent-tab-content">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6 shadow-sm">
                  <h3 className="font-bold text-orange-900 mb-3 text-lg">Active Deployments</h3>
                  <p className="text-orange-700">
                    Monitor and manage currently deployed agents across all channels.
                  </p>
                </div>
                <ActiveDeploymentsView />
              </div>
            </TabsContent>
            {isOnboardingTeam && (
              <TabsContent value="onboarding" className="parent-tab-content">
                <OnboardingAgentsView />
              </TabsContent>
            )}
            
            {isSuperAdmin && (
              <TabsContent value="settings" className="parent-tab-content">
                <AgentSettingsView />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </AppLayout>
    );
  } catch (error) {
    console.error('🚨 Error in Agents component:', error);
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Agents</h1>
          <p className="text-muted-foreground">
            There was an error loading the agents interface. Please check the console for details.
          </p>
        </div>
      </AppLayout>
    );
  }
};

const Agents: React.FC = () => (
  <AgentBuilderProvider>
    <AgentsInner />
  </AgentBuilderProvider>
);

export default Agents;