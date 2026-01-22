import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { 
  GenerationContext, 
  computeA2ARequirements, 
  validateTierAccess,
  A2ARoutingConfig,
  GlobalTierLevel,
  VISUAL_FEATURE_A2A_ROUTING,
  FRAMEWORK_A2A_ROUTING,
  CONTENT_TYPE_A2A_ROUTING,
  DESIGN_TEMPLATE_A2A_ROUTING,
  MUSIC_SFX_A2A_ROUTING
} from "../_shared/generationContext.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface A2ARequest {
  action: 'orchestrate' | 'validate' | 'route' | 'status';
  generationContext: GenerationContext;
  userTier: GlobalTierLevel;
  sessionId?: string;
}

interface AgentTask {
  agentId: string;
  taskType: string;
  priority: number;
  dependencies: string[];
  provider: string;
  config: Record<string, any>;
}

interface OrchestrationPlan {
  sessionId: string;
  a2aConfig: A2ARoutingConfig;
  tasks: AgentTask[];
  estimatedDuration: number;
  tierValidation: { valid: boolean; requiredTier: GlobalTierLevel; userTier: GlobalTierLevel };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json() as A2ARequest;
    const { action, generationContext, userTier, sessionId } = body;

    console.log(`[A2A-Coordinator] Action: ${action}, UserTier: ${userTier}`);

    // Compute A2A requirements from full context
    const a2aConfig = computeA2ARequirements(generationContext);
    
    // Validate tier access
    const tierValidation = {
      valid: validateTierAccess(a2aConfig.tier, userTier),
      requiredTier: a2aConfig.tier,
      userTier
    };

    switch (action) {
      case 'validate':
        return new Response(JSON.stringify({
          success: true,
          a2aRequired: a2aConfig.a2aRequired,
          tierValidation,
          requiredAgents: a2aConfig.requiredAgents,
          orchestrationMode: a2aConfig.orchestrationMode,
          providers: a2aConfig.providers,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'route':
        // Determine optimal routing for each feature
        const routingPlan = buildRoutingPlan(generationContext, a2aConfig);
        return new Response(JSON.stringify({
          success: true,
          routing: routingPlan,
          a2aConfig,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'orchestrate':
        if (!tierValidation.valid) {
          return new Response(JSON.stringify({
            success: false,
            error: `Tier upgrade required. Feature requires ${a2aConfig.tier} tier, user has ${userTier}`,
            tierValidation,
          }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const orchestrationPlan = buildOrchestrationPlan(
          sessionId || crypto.randomUUID(),
          generationContext,
          a2aConfig,
          tierValidation
        );

        console.log(`[A2A-Coordinator] Orchestration plan created: ${orchestrationPlan.tasks.length} tasks`);

        return new Response(JSON.stringify({
          success: true,
          plan: orchestrationPlan,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({
          success: true,
          status: 'ready',
          supportedActions: ['orchestrate', 'validate', 'route', 'status'],
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('[A2A-Coordinator] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildRoutingPlan(context: GenerationContext, a2aConfig: A2ARoutingConfig): Record<string, any> {
  const routing: Record<string, any> = {
    visualFeatures: {},
    frameworks: {},
    contentTypes: {},
    templates: {},
    music: {},
  };

  // Visual features routing
  if (context.templateContext?.visualFeatures) {
    for (const feature of context.templateContext.visualFeatures) {
      const config = VISUAL_FEATURE_A2A_ROUTING[feature.id];
      if (config) {
        routing.visualFeatures[feature.id] = {
          agent: config.agent,
          provider: config.providers[0],
          tier: config.tier,
          subOptions: feature.subOptions,
        };
      }
    }
  }

  // Framework routing
  if (context.templateContext?.selectedFrameworkIds) {
    for (const frameworkId of context.templateContext.selectedFrameworkIds) {
      const config = FRAMEWORK_A2A_ROUTING[frameworkId];
      if (config) {
        routing.frameworks[frameworkId] = {
          chartTypes: config.chartTypes,
          specialists: config.specialists,
          tier: config.tier,
        };
      }
    }
  }

  // Content type routing
  if (context.workflowContext?.selectedContentTypes) {
    for (const contentType of context.workflowContext.selectedContentTypes) {
      const config = CONTENT_TYPE_A2A_ROUTING[contentType];
      if (config) {
        routing.contentTypes[contentType] = {
          agents: config.agents,
          outputFormats: config.outputFormats,
          tier: config.tier,
        };
      }
    }
  }

  return routing;
}

function buildOrchestrationPlan(
  sessionId: string,
  context: GenerationContext,
  a2aConfig: A2ARoutingConfig,
  tierValidation: { valid: boolean; requiredTier: GlobalTierLevel; userTier: GlobalTierLevel }
): OrchestrationPlan {
  const tasks: AgentTask[] = [];
  let priority = 0;

  // Phase 1: Content analysis tasks (parallel)
  if (context.workflowContext?.selectedContentTypes) {
    for (const contentType of context.workflowContext.selectedContentTypes) {
      const config = CONTENT_TYPE_A2A_ROUTING[contentType];
      if (config) {
        for (const agent of config.agents) {
          tasks.push({
            agentId: agent,
            taskType: 'content-analysis',
            priority: priority++,
            dependencies: [],
            provider: 'openai',
            config: { contentType, outputFormats: config.outputFormats },
          });
        }
      }
    }
  }

  // Phase 2: Visual generation tasks (depends on content)
  if (context.templateContext?.visualFeatures) {
    const contentTaskIds = tasks.filter(t => t.taskType === 'content-analysis').map(t => t.agentId);
    
    for (const feature of context.templateContext.visualFeatures) {
      const config = VISUAL_FEATURE_A2A_ROUTING[feature.id];
      if (config) {
        tasks.push({
          agentId: config.agent,
          taskType: 'visual-generation',
          priority: priority++,
          dependencies: contentTaskIds,
          provider: config.providers[0],
          config: { featureId: feature.id, subOptions: feature.subOptions },
        });
      }
    }
  }

  // Phase 3: Framework-specific visualizations
  if (context.templateContext?.selectedFrameworkIds) {
    for (const frameworkId of context.templateContext.selectedFrameworkIds) {
      const config = FRAMEWORK_A2A_ROUTING[frameworkId];
      if (config && config.specialists.length > 0) {
        tasks.push({
          agentId: config.specialists[0],
          taskType: 'framework-visualization',
          priority: priority++,
          dependencies: [],
          provider: 'gemini',
          config: { frameworkId, chartTypes: config.chartTypes },
        });
      }
    }
  }

  // Phase 4: Voice/Audio tasks (if enabled)
  if (context.outputConfig?.includeVoiceover && context.voiceConfig) {
    tasks.push({
      agentId: 'voice-generator',
      taskType: 'voice-synthesis',
      priority: priority++,
      dependencies: tasks.filter(t => t.taskType === 'content-analysis').map(t => t.agentId),
      provider: context.voiceConfig.provider || 'elevenlabs',
      config: { voiceConfig: context.voiceConfig },
    });
  }

  // Estimate duration based on task count and types
  const estimatedDuration = tasks.reduce((sum, task) => {
    const baseDuration = task.taskType === 'visual-generation' ? 15 : 
                         task.taskType === 'voice-synthesis' ? 30 : 5;
    return sum + baseDuration;
  }, 0);

  return {
    sessionId,
    a2aConfig,
    tasks,
    estimatedDuration,
    tierValidation,
  };
}
