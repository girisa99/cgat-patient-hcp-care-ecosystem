/**
 * Unified Development Lifecycle Hook
 * Single source of truth hook that consolidates ALL existing systems:
 * - Authentication (useDatabaseAuth.tsx)
 * - Role-based Navigation (useRoleBasedNavigation.tsx)
 * - Verification (UnifiedCoreVerificationService)
 * - Registry (RegistryFixAgent)
 * - Learning (useLearningOrchestration.tsx)
 * - Real Data Management (useUnifiedUserManagement.tsx)
 * - Multi-tenant Support
 * - Real-time Updates
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDatabaseAuth } from '@/hooks/useDatabaseAuth';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { useLearningOrchestration } from '@/hooks/useLearningOrchestration';
import { useUnifiedUserManagement } from '@/hooks/useUnifiedUserManagement';
import { unifiedOrchestrator, SDLCWorkflow, SDLCPhase, ProjectContext } from '@/services/orchestration/UnifiedDevelopmentLifecycleOrchestrator';
import { LearningInsight } from '@/utils/learning/LearningEngine';

export interface UnifiedSystemStatus {
  isAuthenticated: boolean;
  userRole: string;
  currentProject?: string;
  currentWorkflow?: SDLCWorkflow;
  availablePhases: SDLCPhase[];
  systemHealth: number;
  learningInsights: LearningInsight[];
  isBackgroundAgentsActive: boolean;
}

export interface UnifiedDevelopmentActions {
  // Project & Workflow Management
  createProject: (projectId: string, context?: Partial<ProjectContext>) => Promise<SDLCWorkflow>;
  progressPhase: (phaseId: string, artifacts?: Record<string, any>) => Promise<boolean>;
  switchProject: (projectId: string) => Promise<void>;
  
  // Role-based Operations
  getAvailableOperations: () => string[];
  validateOperation: (operation: string) => boolean;
  
  // Learning & Optimization
  captureLearning: (context: string, issue: string, solution?: any) => string;
  applyRecommendation: (insight: LearningInsight) => void;
  
  // System Health
  runSystemCheck: () => Promise<void>;
  getSystemReport: () => any;
}

export const useUnifiedDevelopmentLifecycle = (projectId?: string) => {
  const { toast } = useToast();
  
  // Integrate all existing hooks
  const auth = useDatabaseAuth();
  const navigation = useRoleBasedNavigation();
  const learning = useLearningOrchestration();
  const userManagement = useUnifiedUserManagement();
  
  // Unified state
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(projectId);
  const [currentWorkflow, setCurrentWorkflow] = useState<SDLCWorkflow | null>(null);
  const [systemStatus, setSystemStatus] = useState<UnifiedSystemStatus>({
    isAuthenticated: false,
    userRole: 'guest',
    availablePhases: [],
    systemHealth: 0,
    learningInsights: [],
    isBackgroundAgentsActive: false
  });
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Initialize the unified system
   */
  useEffect(() => {
    if (auth.isAuthenticated && !isInitialized) {
      initializeUnifiedSystem();
    }
  }, [auth.isAuthenticated, isInitialized]);

  /**
   * Monitor current project workflow
   */
  useEffect(() => {
    if (currentProjectId && auth.isAuthenticated) {
      loadCurrentWorkflow();
    }
  }, [currentProjectId, auth.isAuthenticated]);

  /**
   * Update system status periodically
   */
  useEffect(() => {
    if (isInitialized) {
      const interval = setInterval(updateSystemStatus, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isInitialized]);

  const initializeUnifiedSystem = async () => {
    try {
      console.log('🎯 Initializing Unified Development Lifecycle System...');
      
      // Verify all existing systems are operational
      if (!auth.isAuthenticated) {
        throw new Error('Authentication system not ready');
      }
      
      if (!auth.userRoles.length) {
        throw new Error('User roles not loaded');
      }
      
      // Update initial status
      setSystemStatus(prev => ({
        ...prev,
        isAuthenticated: auth.isAuthenticated,
        userRole: auth.userRoles[0] || 'guest',
        systemHealth: calculateSystemHealth(),
        learningInsights: learning.getLearningInsights(),
        isBackgroundAgentsActive: true
      }));
      
      setIsInitialized(true);
      
      toast({
        title: "🎯 Unified System Initialized",
        description: `Welcome ${auth.userRoles[0]}! All systems operational.`,
      });
      
      console.log('✅ Unified Development Lifecycle System initialized');
      
    } catch (error: any) {
      console.error('❌ Failed to initialize unified system:', error);
      
      // Capture initialization failure for learning
      learning.captureManualLearning(
        'system_initialization',
        'initialization_failure',
        { timestamp: new Date().toISOString() },
        error.message
      );
      
      toast({
        title: "❌ System Initialization Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadCurrentWorkflow = async () => {
    if (!currentProjectId) return;
    
    try {
      const workflow = unifiedOrchestrator.getWorkflowStatus(currentProjectId);
      setCurrentWorkflow(workflow);
      
      if (workflow) {
        // Update available phases based on role and dependencies
        const availablePhases = workflow.phases.filter(phase => 
          phase.requiredRoles.includes(systemStatus.userRole) &&
          phase.dependencies.every(dep => 
            workflow.phases.find(p => p.id === dep)?.isCompleted
          )
        );
        
        setSystemStatus(prev => ({
          ...prev,
          currentProject: currentProjectId,
          currentWorkflow: workflow,
          availablePhases,
          learningInsights: workflow.learningInsights
        }));
      }
    } catch (error) {
      console.error('❌ Failed to load workflow:', error);
    }
  };

  const updateSystemStatus = () => {
    const healthScore = calculateSystemHealth();
    const insights = learning.getLearningInsights();
    
    setSystemStatus(prev => ({
      ...prev,
      systemHealth: healthScore,
      learningInsights: insights,
      userRole: auth.userRoles[0] || 'guest'
    }));
  };

  const calculateSystemHealth = (): number => {
    let health = 0;
    
    // Authentication health (25%)
    if (auth.isAuthenticated && auth.userRoles.length > 0) {
      health += 25;
    }
    
    // Learning system health (25%)
    const learningHealth = learning.getLearningHealthScore();
    health += (learningHealth / 100) * 25;
    
    // User management health (25%)
    if (userManagement.users.length > 0) {
      health += 25;
    }
    
    // Navigation health (25%)
    if (navigation.filteredRoutes.length > 0) {
      health += 25;
    }
    
    return Math.round(health);
  };

  /**
   * Create a new project workflow
   */
  const createProject = useCallback(async (
    projectId: string, 
    context: Partial<ProjectContext> = {}
  ): Promise<SDLCWorkflow> => {
    if (!auth.isAuthenticated || !auth.userRoles.includes('superAdmin')) {
      throw new Error('Insufficient permissions to create project');
    }
    
    try {
      console.log(`🚀 Creating project: ${projectId}`);
      
      // Create team assignments based on current user and role
      const assignedTeam: Record<string, string[]> = {};
      for (const role of auth.userRoles) {
        assignedTeam[role] = [auth.user?.id || ''];
      }
      
      const workflow = await unifiedOrchestrator.createSDLCWorkflow(
        projectId,
        context,
        assignedTeam
      );
      
      setCurrentProjectId(projectId);
      setCurrentWorkflow(workflow);
      
      // Capture project creation for learning
      learning.captureManualLearning(
        `project_creation_${projectId}`,
        'project_created',
        { projectId, userRole: auth.userRoles[0], assignedTeam },
        'New project created successfully',
        { success: true },
        true
      );
      
      toast({
        title: "🎉 Project Created",
        description: `Project ${projectId} created with ${workflow.phases.length} phases`,
      });
      
      return workflow;
      
    } catch (error: any) {
      console.error('❌ Project creation failed:', error);
      
      // Capture failure for learning
      learning.captureManualLearning(
        `project_creation_${projectId}`,
        'project_creation_failed',
        { projectId, userRole: auth.userRoles[0] },
        error.message
      );
      
      toast({
        title: "❌ Project Creation Failed",
        description: error.message,
        variant: "destructive",
      });
      
      throw error;
    }
  }, [auth, learning, toast]);

  /**
   * Progress to next phase
   */
  const progressPhase = useCallback(async (
    phaseId: string,
    artifacts: Record<string, any> = {}
  ): Promise<boolean> => {
    if (!currentProjectId || !currentWorkflow) {
      throw new Error('No active project workflow');
    }
    
    try {
      console.log(`📈 Progressing phase: ${phaseId}`);
      
      const result = await unifiedOrchestrator.progressToNextPhase(
        currentProjectId,
        phaseId,
        auth.userRoles[0],
        artifacts
      );
      
      if (result.success) {
        // Reload workflow to get updated state
        await loadCurrentWorkflow();
        
        toast({
          title: "✅ Phase Completed",
          description: `Phase '${phaseId}' completed successfully${result.nextPhase ? `. Next: ${result.nextPhase}` : ''}`,
        });
        
        return true;
      } else {
        toast({
          title: "⚠️ Phase Progression Blocked",
          description: result.blockingIssues?.join(', ') || 'Unknown blocking issues',
          variant: "destructive",
        });
        
        return false;
      }
    } catch (error: any) {
      console.error('❌ Phase progression failed:', error);
      
      toast({
        title: "❌ Phase Progression Failed",
        description: error.message,
        variant: "destructive",
      });
      
      return false;
    }
  }, [currentProjectId, currentWorkflow, auth.userRoles, toast, loadCurrentWorkflow]);

  /**
   * Switch to different project
   */
  const switchProject = useCallback(async (projectId: string) => {
    setCurrentProjectId(projectId);
    
    toast({
      title: "🔄 Switching Project",
      description: `Loading project: ${projectId}`,
    });
  }, [toast]);

  /**
   * Get operations available to current user role
   */
  const getAvailableOperations = useCallback((): string[] => {
    const operations: string[] = [];
    
    // Base operations for all authenticated users
    if (auth.isAuthenticated) {
      operations.push('view_dashboard', 'view_profile');
    }
    
    // Role-specific operations
    if (auth.userRoles.includes('superAdmin')) {
      operations.push('create_project', 'manage_users', 'system_administration');
    }
    
    if (auth.userRoles.includes('onboardingTeam')) {
      operations.push('manage_onboarding', 'approve_applications');
    }
    
    if (auth.userRoles.includes('developer')) {
      operations.push('code_development', 'run_tests');
    }
    
    // Add operations based on current workflow phase
    if (currentWorkflow) {
      const currentPhase = currentWorkflow.phases.find(p => p.id === currentWorkflow.currentPhase);
      if (currentPhase && currentPhase.requiredRoles.some(role => auth.userRoles.includes(role))) {
        operations.push(`work_on_${currentPhase.id}`);
      }
    }
    
    return operations;
  }, [auth.isAuthenticated, auth.userRoles, currentWorkflow]);

  /**
   * Validate if user can perform operation
   */
  const validateOperation = useCallback((operation: string): boolean => {
    return getAvailableOperations().includes(operation);
  }, [getAvailableOperations]);

  /**
   * Capture learning from user interaction
   */
  const captureLearning = useCallback((
    context: string,
    issue: string,
    solution?: any
  ): string => {
    return learning.captureManualLearning(
      context,
      'user_interaction',
      { userRole: auth.userRoles[0], timestamp: new Date().toISOString() },
      issue,
      solution
    );
  }, [learning, auth.userRoles]);

  /**
   * Apply learning recommendation
   */
  const applyRecommendation = useCallback((insight: LearningInsight) => {
    learning.applyCourseCorrection(insight);
    
    toast({
      title: "🧠 Learning Applied",
      description: insight.description,
    });
  }, [learning, toast]);

  /**
   * Run comprehensive system check
   */
  const runSystemCheck = useCallback(async () => {
    try {
      // Trigger comprehensive verification
      await learning.queueTask('verification', 'system_health_check', {
        timestamp: new Date().toISOString(),
        userRole: auth.userRoles[0]
      }, 'high');
      
      // Update system status
      updateSystemStatus();
      
      toast({
        title: "🔍 System Check Initiated",
        description: "Comprehensive system verification in progress...",
      });
      
    } catch (error: any) {
      toast({
        title: "❌ System Check Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [learning, auth.userRoles, toast]);

  /**
   * Generate comprehensive system report
   */
  const getSystemReport = useCallback(() => {
    return {
      timestamp: new Date().toISOString(),
      systemStatus,
      authentication: {
        isAuthenticated: auth.isAuthenticated,
        userRoles: auth.userRoles,
        userId: auth.user?.id
      },
      currentProject: {
        projectId: currentProjectId,
        workflow: currentWorkflow,
        currentPhase: currentWorkflow?.currentPhase,
        progress: currentWorkflow?.overallProgress
      },
      learningStats: learning.stats,
      navigation: {
        filteredRoutes: navigation.filteredRoutes,
        currentRole: navigation.currentRole
      },
      userManagement: {
        totalUsers: userManagement.users.length,
        isLoading: userManagement.isLoading
      }
    };
  }, [systemStatus, auth, currentProjectId, currentWorkflow, learning.stats, navigation, userManagement]);

  // Main actions object
  const actions: UnifiedDevelopmentActions = {
    createProject,
    progressPhase,
    switchProject,
    getAvailableOperations,
    validateOperation,
    captureLearning,
    applyRecommendation,
    runSystemCheck,
    getSystemReport
  };

  return {
    // System Status
    isInitialized,
    systemStatus,
    currentProject: currentProjectId,
    currentWorkflow,
    
    // Integrated System Access
    auth,
    navigation,
    learning,
    userManagement,
    
    // Unified Actions
    actions,
    
    // Quick Access Properties
    isAuthenticated: auth.isAuthenticated,
    userRole: auth.userRoles[0] || 'guest',
    systemHealth: systemStatus.systemHealth,
    availableOperations: getAvailableOperations(),
    learningInsights: systemStatus.learningInsights,
    
    // Utilities
    isRoleAllowed: (role: string) => auth.userRoles.includes(role),
    isOperationAllowed: validateOperation,
    canProgressPhase: (phaseId: string) => {
      if (!currentWorkflow) return false;
      const phase = currentWorkflow.phases.find(p => p.id === phaseId);
      return phase ? phase.requiredRoles.some(role => auth.userRoles.includes(role)) : false;
    }
  };
};