/**
 * PROMPT ENHANCEMENT ENGINE
 * Advanced prompt enhancement with compliance context injection
 * Ensures all AI interactions follow framework guidelines
 */

import { PromptGovernanceInterceptor } from '../stability/PromptGovernanceInterceptor';
import { FrameworkComplianceMonitor } from '../stability/FrameworkComplianceMonitor';
import { ComponentGovernance } from '../governance/ComponentGovernance';

export interface EnhancedPromptData {
  originalPrompt: string;
  enhancedPrompt: string;
  complianceContext: string[];
  frameworkGuidance: string[];
  preventionChecks: string[];
  autoFixSuggestions: string[];
  complianceScore: number;
  blockingIssues: string[];
}

export interface PromptEnhancementConfig {
  enableComplianceContext: boolean;
  enableAutoFix: boolean;
  enablePreventionChecks: boolean;
  strictMode: boolean;
  includeFrameworkGuidance: boolean;
}

export class PromptEnhancementEngine {
  private static instance: PromptEnhancementEngine;
  private promptInterceptor: PromptGovernanceInterceptor;
  private complianceMonitor: FrameworkComplianceMonitor;
  private enhancementHistory: EnhancedPromptData[] = [];

  private constructor() {
    this.promptInterceptor = new PromptGovernanceInterceptor();
    this.complianceMonitor = new FrameworkComplianceMonitor({
      strictMode: true,
      realTimeAnalysis: true
    });
  }

  static getInstance(): PromptEnhancementEngine {
    if (!PromptEnhancementEngine.instance) {
      PromptEnhancementEngine.instance = new PromptEnhancementEngine();
    }
    return PromptEnhancementEngine.instance;
  }

  async enhancePromptWithCompliance(
    prompt: string,
    config: PromptEnhancementConfig = this.getDefaultConfig()
  ): Promise<EnhancedPromptData> {
    console.log('🚀 Enhancing prompt with compliance context...');

    // Step 1: Intercept and analyze prompt
    const interceptedPrompt = await this.promptInterceptor.interceptPrompt({
      content: prompt
    });

    // Step 2: Generate compliance context
    const complianceContext = config.enableComplianceContext 
      ? await this.generateComplianceContext(prompt)
      : [];

    // Step 3: Generate framework guidance
    const frameworkGuidance = config.includeFrameworkGuidance
      ? this.generateFrameworkGuidance(prompt)
      : [];

    // Step 4: Generate prevention checks
    const preventionChecks = config.enablePreventionChecks
      ? this.generatePreventionChecks(prompt)
      : [];

    // Step 5: Generate auto-fix suggestions
    const autoFixSuggestions = config.enableAutoFix
      ? await this.generateAutoFixSuggestions(prompt)
      : [];

    // Step 6: Identify blocking issues
    const blockingIssues = config.strictMode
      ? this.identifyBlockingIssues(prompt, interceptedPrompt)
      : [];

    // Step 7: Build enhanced prompt
    const enhancedPrompt = this.buildEnhancedPrompt({
      originalPrompt: prompt,
      interceptedPrompt,
      complianceContext,
      frameworkGuidance,
      preventionChecks,
      autoFixSuggestions,
      blockingIssues,
      config
    });

    const result: EnhancedPromptData = {
      originalPrompt: prompt,
      enhancedPrompt: enhancedPrompt,
      complianceContext,
      frameworkGuidance,
      preventionChecks,
      autoFixSuggestions,
      complianceScore: interceptedPrompt.complianceScore || 100,
      blockingIssues
    };

    // Store in history
    this.enhancementHistory.push(result);

    console.log('✅ Prompt enhancement complete:', {
      complianceScore: result.complianceScore,
      enhancementsApplied: complianceContext.length + frameworkGuidance.length,
      blockingIssues: blockingIssues.length
    });

    return result;
  }

  private async generateComplianceContext(prompt: string): Promise<string[]> {
    const context: string[] = [];

    // Framework compliance requirements
    context.push('FRAMEWORK COMPLIANCE ACTIVE: All changes must follow established patterns');
    
    // Component governance
    if (prompt.toLowerCase().includes('component')) {
      const governance = ComponentGovernance.getRecommendations();
      context.push('COMPONENT GOVERNANCE: Check existing components before creating new ones');
      context.push(`Available components: ${ComponentGovernance.getRegistry().length} registered`);
    }

    // Database operations
    if (prompt.toLowerCase().includes('database') || prompt.toLowerCase().includes('table')) {
      context.push('DATABASE COMPLIANCE: Use Supabase RLS policies for all data access');
      context.push('REAL DATA ONLY: No mock, test, or dummy data in production code');
    }

    // API operations
    if (prompt.toLowerCase().includes('api') || prompt.toLowerCase().includes('endpoint')) {
      context.push('API COMPLIANCE: Follow RESTful conventions and proper error handling');
      context.push('AUTHENTICATION: Implement proper user authentication for all endpoints');
    }

    // UI/UX operations
    if (prompt.toLowerCase().includes('ui') || prompt.toLowerCase().includes('interface')) {
      context.push('UI COMPLIANCE: Use design system tokens, avoid hardcoded colors');
      context.push('ACCESSIBILITY: Implement ARIA labels and keyboard navigation');
    }

    return context;
  }

  private generateFrameworkGuidance(prompt: string): string[] {
    const guidance: string[] = [];

    // Always include core framework principles
    guidance.push('🏗️  ARCHITECTURE: Follow single responsibility principle');
    guidance.push('🔄 REUSABILITY: Maximize component and hook reuse');
    guidance.push('🛡️  STABILITY: Maintain backwards compatibility');
    guidance.push('📋 DOCUMENTATION: Include TypeScript interfaces and JSDoc');

    // Context-specific guidance
    if (prompt.toLowerCase().includes('create')) {
      guidance.push('🔍 CREATION CHECKLIST: 1) Check existing 2) Validate necessity 3) Follow conventions');
    }

    if (prompt.toLowerCase().includes('update') || prompt.toLowerCase().includes('modify')) {
      guidance.push('⚡ UPDATE STRATEGY: 1) Test existing functionality 2) Add, don\'t break 3) Deprecate gracefully');
    }

    if (prompt.toLowerCase().includes('delete') || prompt.toLowerCase().includes('remove')) {
      guidance.push('🗑️  REMOVAL PROTOCOL: 1) Check dependencies 2) Migrate users 3) Archive, don\'t delete');
    }

    return guidance;
  }

  private generatePreventionChecks(prompt: string): string[] {
    const checks: string[] = [];

    // Duplicate prevention
    checks.push('✅ DUPLICATE CHECK: Verify no similar component/service exists');
    
    // Mock data prevention
    checks.push('✅ REAL DATA CHECK: Ensure all data comes from Supabase database');
    
    // Breaking change prevention
    checks.push('✅ STABILITY CHECK: Maintain existing API contracts');
    
    // Security prevention
    checks.push('✅ SECURITY CHECK: Implement proper authentication and authorization');
    
    // Performance prevention
    checks.push('✅ PERFORMANCE CHECK: Optimize for loading speed and responsiveness');

    return checks;
  }

  private async generateAutoFixSuggestions(prompt: string): Promise<string[]> {
    const suggestions: string[] = [];

    // Check for common auto-fixable issues
    if (prompt.toLowerCase().includes('error') || prompt.toLowerCase().includes('bug')) {
      suggestions.push('AUTO-FIX: Enable error boundary for component isolation');
      suggestions.push('AUTO-FIX: Add proper error handling with try-catch blocks');
    }

    if (prompt.toLowerCase().includes('style') || prompt.toLowerCase().includes('css')) {
      suggestions.push('AUTO-FIX: Replace hardcoded colors with design system tokens');
      suggestions.push('AUTO-FIX: Use responsive design utilities from Tailwind');
    }

    if (prompt.toLowerCase().includes('form')) {
      suggestions.push('AUTO-FIX: Implement form validation with React Hook Form');
      suggestions.push('AUTO-FIX: Add accessibility attributes to form elements');
    }

    return suggestions;
  }

  private identifyBlockingIssues(prompt: string, interceptedPrompt: any): string[] {
    const blocking: string[] = [];

    // Check for potential breaking changes
    if (prompt.toLowerCase().includes('delete') || prompt.toLowerCase().includes('remove')) {
      blocking.push('BLOCKING: Removal operations require dependency analysis');
    }

    // Check for security violations
    if (prompt.toLowerCase().includes('admin') && !prompt.toLowerCase().includes('role')) {
      blocking.push('BLOCKING: Admin features require role-based access control');
    }

    // Check for compliance violations from interceptor
    if (interceptedPrompt.violations && interceptedPrompt.violations.length > 0) {
      interceptedPrompt.violations.forEach((violation: any) => {
        if (violation.severity === 'high') {
          blocking.push(`BLOCKING: ${violation.check}`);
        }
      });
    }

    return blocking;
  }

  private buildEnhancedPrompt(params: {
    originalPrompt: string;
    interceptedPrompt: any;
    complianceContext: string[];
    frameworkGuidance: string[];
    preventionChecks: string[];
    autoFixSuggestions: string[];
    blockingIssues: string[];
    config: PromptEnhancementConfig;
  }): string {
    const {
      originalPrompt,
      complianceContext,
      frameworkGuidance,
      preventionChecks,
      autoFixSuggestions,
      blockingIssues,
      config
    } = params;

    let enhanced = '';

    // Add blocking issues first if any
    if (blockingIssues.length > 0 && config.strictMode) {
      enhanced += `🚨 BLOCKING ISSUES DETECTED:\n${blockingIssues.map(issue => `❌ ${issue}`).join('\n')}\n\n`;
      enhanced += 'RESOLVE BLOCKING ISSUES BEFORE PROCEEDING.\n\n';
    }

    // Add compliance context
    if (complianceContext.length > 0) {
      enhanced += `🔒 COMPLIANCE CONTEXT:\n${complianceContext.map(ctx => `• ${ctx}`).join('\n')}\n\n`;
    }

    // Add framework guidance
    if (frameworkGuidance.length > 0) {
      enhanced += `📚 FRAMEWORK GUIDANCE:\n${frameworkGuidance.join('\n')}\n\n`;
    }

    // Add prevention checks
    if (preventionChecks.length > 0) {
      enhanced += `🛡️  PREVENTION CHECKLIST:\n${preventionChecks.join('\n')}\n\n`;
    }

    // Add auto-fix suggestions
    if (autoFixSuggestions.length > 0) {
      enhanced += `🔧 AUTO-FIX AVAILABLE:\n${autoFixSuggestions.join('\n')}\n\n`;
    }

    // Add original prompt
    enhanced += `📝 REQUEST:\n${originalPrompt}\n\n`;

    // Add framework footer
    enhanced += `⚡ FRAMEWORK STATUS: Compliance monitoring active, real-time validation enabled\n`;
    enhanced += `🎯 QUALITY GATE: Follow all guidelines above for framework compliance`;

    return enhanced;
  }

  private getDefaultConfig(): PromptEnhancementConfig {
    return {
      enableComplianceContext: true,
      enableAutoFix: true,
      enablePreventionChecks: true,
      strictMode: true,
      includeFrameworkGuidance: true
    };
  }

  getEnhancementHistory(): EnhancedPromptData[] {
    return this.enhancementHistory;
  }

  getEnhancementStats() {
    const stats = {
      totalEnhancements: this.enhancementHistory.length,
      averageComplianceScore: 0,
      blockingIssuesFound: 0,
      autoFixesApplied: 0
    };

    if (this.enhancementHistory.length > 0) {
      stats.averageComplianceScore = Math.round(
        this.enhancementHistory.reduce((sum, item) => sum + item.complianceScore, 0) / 
        this.enhancementHistory.length
      );
      
      stats.blockingIssuesFound = this.enhancementHistory.reduce(
        (sum, item) => sum + item.blockingIssues.length, 0
      );
      
      stats.autoFixesApplied = this.enhancementHistory.reduce(
        (sum, item) => sum + item.autoFixSuggestions.length, 0
      );
    }

    return stats;
  }
}

export default PromptEnhancementEngine;