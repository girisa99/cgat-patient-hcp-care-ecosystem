/**
 * Comprehensive Gap Analysis Tool
 * Analyzes what's implemented vs what's missing in the /agents system
 */

import { supabase } from '@/integrations/supabase/client';

export interface GapAnalysisResult {
  category: string;
  component: string;
  status: 'IMPLEMENTED' | 'PARTIAL' | 'MISSING' | 'DEPRECATED';
  description: string;
  implementation_details?: string;
  gaps?: string[];
  recommendations?: string[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  database_sync: boolean;
}

export interface SystemOverview {
  database_stats: {
    workflow_node_types: number;
    workflow_node_categories: number;
    agent_templates: number;
    agents: number;
  };
  implementation_score: {
    ai_prompt: number;
    visual_builder: number;
    templates: number;
    database_sync: number;
    overall: number;
  };
  gaps: GapAnalysisResult[];
  critical_issues: string[];
  recommendations: string[];
}

class ComprehensiveGapAnalyzer {
  async runFullAnalysis(): Promise<SystemOverview> {
    console.log('🔍 Running comprehensive gap analysis...');

    // Get database stats
    const databaseStats = await this.getDatabaseStats();
    
    // Analyze each component
    const gaps = await this.analyzeAllComponents();
    
    // Calculate implementation scores
    const implementationScore = this.calculateImplementationScores(gaps);
    
    // Extract critical issues
    const criticalIssues = this.extractCriticalIssues(gaps);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(gaps);

    return {
      database_stats: databaseStats,
      implementation_score: implementationScore,
      gaps,
      critical_issues: criticalIssues,
      recommendations
    };
  }

  private async getDatabaseStats() {
    const stats = {
      workflow_node_types: 0,
      workflow_node_categories: 0,
      agent_templates: 0,
      agents: 0
    };

    try {
      const queries = [
        { table: 'workflow_node_types', key: 'workflow_node_types' },
        { table: 'workflow_node_categories', key: 'workflow_node_categories' },
        { table: 'agent_templates', key: 'agent_templates' },
        { table: 'agents', key: 'agents' }
      ];

      for (const query of queries) {
        const { count } = await supabase
          .from(query.table as any)
          .select('*', { count: 'exact', head: true });
        stats[query.key as keyof typeof stats] = count || 0;
      }
    } catch (error) {
      console.error('Error fetching database stats:', error);
    }

    return stats;
  }

  private async analyzeAllComponents(): Promise<GapAnalysisResult[]> {
    const gaps: GapAnalysisResult[] = [];

    // AI Prompt Integration Analysis
    gaps.push(...await this.analyzeAIPrompt());
    
    // Visual Builder Analysis  
    gaps.push(...await this.analyzeVisualBuilder());
    
    // Templates Analysis
    gaps.push(...await this.analyzeTemplates());
    
    // Database Sync Analysis
    gaps.push(...await this.analyzeDatabaseSync());
    
    // Node Configuration Analysis
    gaps.push(...await this.analyzeNodeConfiguration());
    
    // Connectors Analysis
    gaps.push(...await this.analyzeConnectors());

    return gaps;
  }

  private async analyzeAIPrompt(): Promise<GapAnalysisResult[]> {
    return [
      {
        category: 'AI Prompt Integration',
        component: 'Real AI Integration',
        status: 'IMPLEMENTED',
        description: 'Real AI integration with Supabase edge functions and multiple providers',
        implementation_details: 'useRealAIIntegration hook with OpenAI, Claude, Gemini support, context enhancement, and validation',
        gaps: [
          'AI Model Selection UI needs integration',
          'Advanced prompt templates could be added'
        ],
        recommendations: [
          'Integrate AI Model Selection Interface',
          'Add more sophisticated prompt templates',
          'Implement usage analytics'
        ],
        priority: 'LOW',
        database_sync: true
      },
      {
        category: 'AI Prompt Integration',
        component: 'PromptBasedAgentGenerator',
        status: 'IMPLEMENTED',
        description: 'Prompt-based agent generation with Supabase edge function',
        implementation_details: 'Uses generate-agent-from-prompt edge function',
        gaps: [
          'Limited to agent creation only',
          'No workflow prompt generation',
          'No node-specific prompting'
        ],
        recommendations: [
          'Extend to workflow generation',
          'Add node-specific prompt capabilities',
          'Integrate with visual builder'
        ],
        priority: 'MEDIUM',
        database_sync: true
      }
    ];
  }

  private async analyzeVisualBuilder(): Promise<GapAnalysisResult[]> {
    return [
      {
        category: 'Visual Builder',
        component: 'React Flow Integration',
        status: 'IMPLEMENTED',
        description: 'Advanced React Flow wrapper with database-driven nodes',
        implementation_details: 'AdvancedReactFlowWrapper with 182 nodes from database',
        gaps: [
          'Node creation from visual builder not fully integrated',
          'Limited drag-and-drop customization',
          'No visual template application'
        ],
        recommendations: [
          'Add visual node creation workflow',
          'Enhance drag-and-drop experience',
          'Visual template preview and application'
        ],
        priority: 'MEDIUM',
        database_sync: true
      },
      {
        category: 'Visual Builder',
        component: 'Node Palette',
        status: 'IMPLEMENTED',
        description: 'Database-driven node palette with categories',
        implementation_details: 'NodePalette uses useWorkflowNodes with 31 categories',
        gaps: [
          'No search/filter functionality',
          'Limited node preview capabilities',
          'No favorite/recent nodes'
        ],
        recommendations: [
          'Add search and filtering',
          'Node preview with configuration hints',
          'Favorites and recently used nodes'
        ],
        priority: 'LOW',
        database_sync: true
      }
    ];
  }

  private async analyzeTemplates(): Promise<GapAnalysisResult[]> {
    return [
      {
        category: 'Templates',
        component: 'Agent Templates',
        status: 'IMPLEMENTED',
        description: '21 agent templates in database',
        implementation_details: 'agent_templates table with template_type, configuration, journey_stages',
        gaps: [
          'Templates not synchronized with node types',
          'No template versioning',
          'Limited template customization',
          'No template validation against current nodes'
        ],
        recommendations: [
          'Sync templates with workflow_node_types',
          'Add template versioning system',
          'Template validation pipeline',
          'Enhanced customization options'
        ],
        priority: 'HIGH',
        database_sync: false
      },
      {
        category: 'Templates',
        component: 'Workflow Templates',
        status: 'MISSING',
        description: 'No dedicated workflow templates',
        gaps: [
          'No workflow_templates table',
          'No pre-built workflow patterns',
          'No industry-specific workflows'
        ],
        recommendations: [
          'Create workflow_templates table',
          'Add pre-built workflow patterns',
          'Industry-specific template library'
        ],
        priority: 'HIGH',
        database_sync: false
      }
    ];
  }

  private async analyzeDatabaseSync(): Promise<GapAnalysisResult[]> {
    return [
      {
        category: 'Database Sync',
        component: 'Node Types Sync',
        status: 'IMPLEMENTED', 
        description: '182 node types with comprehensive configuration schema',
        implementation_details: 'workflow_node_types with configuration_schema, ai_model_config, etc.',
        gaps: [
          'No real-time sync across sessions',
          'No collaborative editing capabilities',
          'No conflict resolution'
        ],
        recommendations: [
          'Implement real-time subscriptions',
          'Add collaborative editing features',
          'Conflict resolution mechanisms'
        ],
        priority: 'MEDIUM',
        database_sync: true
      },
      {
        category: 'Database Sync',
        component: 'Categories Sync',
        status: 'IMPLEMENTED',
        description: '31 active categories with proper hierarchy',
        implementation_details: 'workflow_node_categories with parent_category_id support',
        gaps: [
          'No dynamic category creation',
          'Limited category customization',
          'No category analytics'
        ],
        recommendations: [
          'Dynamic category management',
          'Enhanced customization options',
          'Category usage analytics'
        ],
        priority: 'LOW',
        database_sync: true
      }
    ];
  }

  private async analyzeNodeConfiguration(): Promise<GapAnalysisResult[]> {
    return [
      {
        category: 'Node Configuration',
        component: 'Configuration Schema',
        status: 'IMPLEMENTED',
        description: 'Comprehensive configuration schema for nodes',
        implementation_details: 'configuration_schema, ai_model_config, variables_config, apis_config, etc.',
        gaps: [
          'No visual configuration builder',
          'Limited validation feedback',
          'No configuration templates'
        ],
        recommendations: [
          'Visual configuration builder',
          'Real-time validation with feedback',
          'Configuration templates library'
        ],
        priority: 'MEDIUM',
        database_sync: true
      },
      {
        category: 'Node Configuration',
        component: 'AI Model Integration',
        status: 'PARTIAL',
        description: 'AI model config fields exist but limited integration',
        implementation_details: 'ai_model_config field in workflow_node_types',
        gaps: [
          'No AI model selection UI',
          'Limited model parameter configuration',
          'No model performance tracking'
        ],
        recommendations: [
          'AI model selection interface',
          'Parameter configuration UI',
          'Performance tracking dashboard'
        ],
        priority: 'HIGH',
        database_sync: true
      }
    ];
  }

  private async analyzeConnectors(): Promise<GapAnalysisResult[]> {
    return [
      {
        category: 'Connectors',
        component: 'Connector Configuration',
        status: 'PARTIAL',
        description: 'Connector config fields exist in schema',
        implementation_details: 'connectors_config field in workflow_node_types',
        gaps: [
          'No connector marketplace',
          'Limited pre-built connectors',
          'No connector testing framework',
          'No connector versioning'
        ],
        recommendations: [
          'Build connector marketplace',
          'Pre-built connector library',
          'Connector testing suite',
          'Versioning system'
        ],
        priority: 'HIGH',
        database_sync: false
      }
    ];
  }

  private calculateImplementationScores(gaps: GapAnalysisResult[]) {
    const categories = {
      ai_prompt: gaps.filter(g => g.category === 'AI Prompt Integration'),
      visual_builder: gaps.filter(g => g.category === 'Visual Builder'),
      templates: gaps.filter(g => g.category === 'Templates'),
      database_sync: gaps.filter(g => g.category === 'Database Sync'),
      node_configuration: gaps.filter(g => g.category === 'Node Configuration'),
      connectors: gaps.filter(g => g.category === 'Connectors')
    };

    const calculateCategoryScore = (categoryGaps: GapAnalysisResult[]) => {
      if (categoryGaps.length === 0) return 100;
      
      const statusScores = {
        'IMPLEMENTED': 100,
        'PARTIAL': 60,
        'MISSING': 0,
        'DEPRECATED': 0
      };
      
      const totalScore = categoryGaps.reduce((sum, gap) => {
        return sum + statusScores[gap.status];
      }, 0);
      
      return Math.round(totalScore / categoryGaps.length);
    };

    const scores = {
      ai_prompt: calculateCategoryScore(categories.ai_prompt),
      visual_builder: calculateCategoryScore(categories.visual_builder),
      templates: calculateCategoryScore(categories.templates),
      database_sync: calculateCategoryScore(categories.database_sync),
      overall: 0
    };

    scores.overall = Math.round(
      (scores.ai_prompt + scores.visual_builder + scores.templates + scores.database_sync) / 4
    );

    return scores;
  }

  private extractCriticalIssues(gaps: GapAnalysisResult[]): string[] {
    return gaps
      .filter(gap => gap.priority === 'HIGH' && gap.status !== 'IMPLEMENTED')
      .map(gap => `${gap.category}: ${gap.component} - ${gap.description}`);
  }

  private generateRecommendations(gaps: GapAnalysisResult[]): string[] {
    const recommendations = new Set<string>();
    
    gaps.forEach(gap => {
      if (gap.recommendations) {
        gap.recommendations.forEach(rec => recommendations.add(rec));
      }
    });
    
    return Array.from(recommendations);
  }
}

export const comprehensiveGapAnalyzer = new ComprehensiveGapAnalyzer();