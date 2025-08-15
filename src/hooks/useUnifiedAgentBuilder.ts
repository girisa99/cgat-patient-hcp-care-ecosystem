import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  UnifiedAgentState, 
  UseCase, 
  SmartSuggestion, 
  ValidationResult, 
  FlowNode, 
  FlowEdge,
  USE_CASE_TEMPLATES 
} from '@/types/unified-agent-builder';

export const useUnifiedAgentBuilder = () => {
  const [state, setState] = useState<UnifiedAgentState>({
    name: '',
    use_case: USE_CASE_TEMPLATES[0],
    current_journey_stage: '',
    completed_stages: [],
    user_mode: 'guided',
    show_suggestions: true,
    auto_progress: false,
    canvas: {
      nodes: [],
      edges: [],
      layout_type: 'vertical',
      auto_layout: true,
      journey_sync: true
    },
    actions: {
      assigned_actions: [],
      custom_actions: [],
      templates: [],
      execution_order: []
    },
    knowledge: {
      sources: [],
      embeddings_config: {},
      rag_settings: {},
      auto_sync: true
    },
    connectors: {
      api_integrations: [],
      mcp_servers: [],
      custom_connectors: [],
      authentication: []
    },
    deployment: {
      environment: 'development',
      scaling_config: {},
      ai_models: [],
      monitoring: {
        enabled: false,
        metrics: [],
        alerts: []
      },
      channels: []
    },
    voice_channels: {
      voice_configs: [],
      channel_assignments: [],
      telephony_settings: {},
      speech_settings: {}
    },
    suggestions: [],
    validation_results: [],
    completion_score: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Smart Suggestion Engine
  const generateSuggestions = useCallback((): SmartSuggestion[] => {
    const suggestions: SmartSuggestion[] = [];
    
    // Analyze current state and generate intelligent suggestions
    if (!state.name.trim()) {
      suggestions.push({
        id: 'name_required',
        type: 'fix_issue',
        component: 'basic_info',
        title: 'Agent needs a name',
        description: 'Please provide a descriptive name for your agent',
        priority: 'high',
        action: () => {} // Will be handled by UI
      });
    }

    // Canvas-based suggestions
    if (state.canvas.nodes.length === 0) {
      suggestions.push({
        id: 'add_canvas_nodes',
        type: 'next_step',
        component: 'canvas',
        title: 'Design your agent workflow',
        description: 'Add workflow steps to visualize your agent\'s logic',
        priority: 'medium',
        action: () => updateUserMode('visual')
      });
    }

    // Use case specific suggestions
    if (state.use_case.required_components) {
      state.use_case.required_components.forEach(component => {
        const isConfigured = checkComponentConfigured(component.id);
        if (!isConfigured) {
          suggestions.push({
            id: `configure_${component.id}`,
            type: 'next_step',
            component: component.category,
            title: `Configure ${component.name}`,
            description: `This component is required for your ${state.use_case.name} use case`,
            priority: 'high',
            action: () => navigateToComponent(component.category)
          });
        }
      });
    }

    // Journey progression suggestions
    if (state.use_case.recommended_journey) {
      const nextStage = state.use_case.recommended_journey.find(
        stage => !state.completed_stages.includes(stage.id)
      );
      if (nextStage) {
        suggestions.push({
          id: `progress_to_${nextStage.id}`,
          type: 'next_step',
          component: 'journey',
          title: `Continue to: ${nextStage.title}`,
          description: nextStage.description || 'Next step in your agent journey',
          priority: 'medium',
          action: () => progressToStage(nextStage.id)
        });
      }
    }

    return suggestions;
  }, [state]);

  // Canvas to Journey Sync
  const syncCanvasToJourney = useCallback((nodes: FlowNode[], edges: FlowEdge[]) => {
    if (!state.canvas.journey_sync) return;

    // Convert canvas flow to journey stages
    const journeyStages = nodes
      .filter(node => node.type === 'journey_stage' || node.type === 'decision')
      .map(node => ({
        id: node.id,
        title: node.data.label,
        description: node.data.component_data?.description,
        type: node.type === 'decision' ? 'decision_point' as const : 'action_required' as const,
        components_involved: [],
        canvas_node_id: node.id
      }));

    setState(prev => ({
      ...prev,
      custom_journey: journeyStages,
      canvas: { ...prev.canvas, nodes, edges }
    }));

    toast({
      title: 'Journey Updated',
      description: 'Your workflow canvas has updated the agent journey',
    });
  }, [state.canvas.journey_sync]);

  // Use Case Selection with Auto-Configuration
  const selectUseCase = useCallback((useCase: UseCase) => {
    setState(prev => ({
      ...prev,
      use_case: useCase,
      current_journey_stage: useCase.recommended_journey[0]?.id || '',
      // Auto-apply templates
      canvas: {
        ...prev.canvas,
        ...useCase.templates.canvas_layout,
        nodes: [], // Will be populated by template
        edges: []
      },
      actions: {
        ...prev.actions,
        assigned_actions: useCase.templates.default_actions || []
      },
      connectors: {
        ...prev.connectors,
        // Auto-suggest connectors
      },
      knowledge: {
        ...prev.knowledge,
        sources: useCase.templates.knowledge_sources || []
      }
    }));

    toast({
      title: 'Use Case Selected',
      description: `Configured agent for ${useCase.name}. Templates applied automatically.`,
    });
  }, []);

  // Intelligent Component Navigation
  const navigateToComponent = useCallback((componentType: string) => {
    // This will be used by the UI to navigate to specific components
    // while maintaining unified state
    console.log(`Navigating to ${componentType} component`);
  }, []);

  // Journey Stage Progression
  const progressToStage = useCallback((stageId: string) => {
    setState(prev => ({
      ...prev,
      current_journey_stage: stageId,
      completed_stages: prev.completed_stages.includes(prev.current_journey_stage) 
        ? prev.completed_stages 
        : [...prev.completed_stages, prev.current_journey_stage]
    }));
  }, []);

  // User Mode Management
  const updateUserMode = useCallback((mode: UnifiedAgentState['user_mode']) => {
    setState(prev => ({ ...prev, user_mode: mode }));
  }, []);

  // Component Configuration Checker
  const checkComponentConfigured = useCallback((componentId: string): boolean => {
    switch (componentId) {
      case 'forms_integration':
        return state.actions.assigned_actions.some(action => action.type === 'form');
      case 'ehr_connector':
        return state.connectors.api_integrations.some(conn => conn.type === 'ehr');
      case 'voice_interface':
        return state.voice_channels.voice_configs.length > 0;
      default:
        return false;
    }
  }, [state]);

  // Validation Engine
  const validateCurrentState = useCallback((): ValidationResult[] => {
    const results: ValidationResult[] = [];

    // Basic validation
    if (!state.name.trim()) {
      results.push({
        component: 'basic_info',
        status: 'error',
        message: 'Agent name is required',
        fix_suggestions: [{
          id: 'fix_name',
          type: 'fix_issue',
          component: 'basic_info',
          title: 'Add agent name',
          description: 'Provide a descriptive name for your agent',
          priority: 'high',
          action: () => {}
        }]
      });
    }

    // Use case specific validation
    if (state.use_case.required_components) {
      state.use_case.required_components.forEach(component => {
        if (!checkComponentConfigured(component.id)) {
          results.push({
            component: component.category,
            status: 'warning',
            message: `${component.name} is required for ${state.use_case.name}`,
            fix_suggestions: [{
              id: `configure_${component.id}`,
              type: 'next_step',
              component: component.category,
              title: `Configure ${component.name}`,
              description: 'Set up this required component',
              priority: 'high',
              action: () => navigateToComponent(component.category)
            }]
          });
        }
      });
    }

    return results;
  }, [state, checkComponentConfigured, navigateToComponent]);

  // Completion Score Calculator
  const calculateCompletionScore = useCallback((): number => {
    const totalRequirements = [
      'name',
      'use_case',
      ...state.use_case.required_components.map(c => c.id)
    ];

    const completedRequirements = totalRequirements.filter(req => {
      switch (req) {
        case 'name':
          return state.name.trim().length > 0;
        case 'use_case':
          return !!state.use_case;
        default:
          return checkComponentConfigured(req);
      }
    });

    return Math.round((completedRequirements.length / totalRequirements.length) * 100);
  }, [state, checkComponentConfigured]);

  // Update suggestions and validation on state changes
  useEffect(() => {
    const suggestions = generateSuggestions();
    const validationResults = validateCurrentState();
    const completionScore = calculateCompletionScore();

    setState(prev => ({
      ...prev,
      suggestions,
      validation_results: validationResults,
      completion_score: completionScore
    }));
  }, [state.name, state.use_case, state.canvas.nodes, state.actions, state.connectors, state.knowledge, state.voice_channels]);

  // Save/Load Agent State
  const saveAgent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Create or update agent
      const agentData = {
        name: state.name,
        description: state.description,
        use_case: state.use_case.name,
        configuration: JSON.parse(JSON.stringify({
          unified_state: state,
          completion_score: state.completion_score
        })),
        created_by: user.user.id
      };

      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .upsert(agentData)
        .select()
        .single();

      if (agentError) throw agentError;

      setState(prev => ({ ...prev, id: agent.id }));

      toast({
        title: 'Agent Saved',
        description: `${state.name} has been saved successfully`,
      });

      return agent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save agent';
      setError(errorMessage);
      toast({
        title: 'Save Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [state]);

  return {
    state,
    setState,
    loading,
    error,
    
    // Core Functions
    selectUseCase,
    updateUserMode,
    progressToStage,
    syncCanvasToJourney,
    
    // Component Management
    navigateToComponent,
    checkComponentConfigured,
    
    // Intelligence
    generateSuggestions,
    validateCurrentState,
    calculateCompletionScore,
    
    // Persistence
    saveAgent,
    
    // Utilities
    USE_CASE_TEMPLATES
  };
};