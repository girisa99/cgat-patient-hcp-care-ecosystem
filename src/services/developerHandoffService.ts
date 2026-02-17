/**
 * DEVELOPER HANDOFF SERVICE
 * 
 * Bi-directional context tracking between support tickets and AI coding tools
 * (Lovable, Cursor, Replica, Claude). Ensures context flows back when fixes are applied.
 * 
 * Features:
 * - Context export with tracking ID
 * - Fix verification webhook integration
 * - Automatic ticket resolution on fix deployment
 * - Cross-tool context synchronization
 */

import { supabase } from '@/integrations/supabase/client';
import { askGeniePipelineKnowledgeBase, SUPPORT_KNOWLEDGE, ENGINEERING_CONTEXT_EXPORT } from './askGeniePipelineKnowledgeBase';

// ==================== TYPES ====================

export interface DeveloperHandoffContext {
  ticketId: string;
  handoffId: string;
  exportedAt: string;
  targetTool: 'lovable' | 'cursor' | 'replica' | 'claude' | 'github' | 'other';
  contextHash: string;
  
  // Issue details
  issueDescription: string;
  issueCategory: string;
  issuePriority: 'low' | 'medium' | 'high' | 'critical';
  affectedPipelines: string[];
  affectedWizardSteps: number[];
  affectedComponents: string[];
  
  // Technical context
  stackTraces: string[];
  networkFailures: any[];
  consoleErrors: string[];
  environmentSnapshot: any;
  sessionReplayUrl?: string;
  reproductionSteps: string[];
  
  // User context
  userTier: string;
  userActions: string[];
  currentRoute: string;
  
  // AI analysis
  aiRootCause?: string;
  aiSuggestedFix?: string;
  aiAffectedFiles?: string[];
  aiConfidence?: number;
  
  // Fix tracking
  fixStatus: 'pending' | 'in_progress' | 'deployed_dev' | 'deployed_uat' | 'deployed_main' | 'verified';
  fixPrUrl?: string;
  fixCommitSha?: string;
  fixDeployedAt?: string;
  fixVerifiedAt?: string;
}

export interface FixDeploymentEvent {
  handoffId: string;
  environment: 'dev' | 'uat' | 'main';
  prUrl?: string;
  commitSha?: string;
  deployedAt: string;
  deployedBy?: string;
}

export interface FixVerificationResult {
  handoffId: string;
  ticketId: string;
  verified: boolean;
  verifiedAt: string;
  verificationMethod: 'automated' | 'manual' | 'user_confirmed';
  notes?: string;
}

// ==================== AI TOOL TEMPLATES ====================

export const AI_TOOL_TEMPLATES = {
  lovable: {
    name: 'Lovable',
    icon: '💜',
    promptPrefix: `# 🔧 Genie Support Issue - Fix Request

This issue was escalated from the Genie Suite support system.
Please analyze and implement the fix.

**IMPORTANT:** When the fix is complete, include this tracking ID in your commit message:
\`[GENIE-FIX: {{HANDOFF_ID}}]\`

---

`,
    promptSuffix: `

---
## 📋 Handoff Tracking

- **Handoff ID:** {{HANDOFF_ID}}
- **Ticket ID:** {{TICKET_ID}}
- **Generated:** {{TIMESTAMP}}

When you've implemented the fix, the Genie support system will automatically track the deployment and resolve the ticket.
`,
    commitFormat: '[GENIE-FIX: {{HANDOFF_ID}}]'
  },
  
  cursor: {
    name: 'Cursor',
    icon: '⚡',
    promptPrefix: `# Genie Support Fix Request

Issue from Genie Suite support system.
Track with ID: {{HANDOFF_ID}}

---

`,
    promptSuffix: `

---
Tracking: GENIE-FIX-{{HANDOFF_ID}}
`,
    commitFormat: 'fix: [GENIE-{{HANDOFF_ID}}]'
  },
  
  replica: {
    name: 'Replica',
    icon: '🔄',
    promptPrefix: `## Genie Support Issue

Handoff ID: {{HANDOFF_ID}}

`,
    promptSuffix: `

---
Include "GENIE-{{HANDOFF_ID}}" in fix reference.
`,
    commitFormat: 'GENIE-{{HANDOFF_ID}}'
  },
  
  claude: {
    name: 'Claude',
    icon: '🧠',
    promptPrefix: `# Technical Issue from Genie Suite

I'm sharing a technical issue that needs debugging and a fix suggestion.
Reference ID: {{HANDOFF_ID}}

---

`,
    promptSuffix: `

---
Please provide:
1. Root cause analysis
2. Step-by-step fix implementation
3. Testing recommendations
4. Any edge cases to consider

Reference: {{HANDOFF_ID}}
`,
    commitFormat: null // Claude doesn't commit directly
  },
  
  github: {
    name: 'GitHub Issue',
    icon: '🐙',
    promptPrefix: `## 🔧 Bug Report from Genie Support

**Tracking ID:** \`{{HANDOFF_ID}}\`
**Ticket:** {{TICKET_ID}}

---

`,
    promptSuffix: `

---
### Tracking

When resolving, reference: \`Fixes GENIE-{{HANDOFF_ID}}\`
`,
    commitFormat: 'Fixes GENIE-{{HANDOFF_ID}}'
  },
  
  other: {
    name: 'Other Tool',
    icon: '🛠️',
    promptPrefix: `# Genie Support Issue Export

Tracking ID: {{HANDOFF_ID}}

`,
    promptSuffix: `

---
Reference: {{HANDOFF_ID}}
`,
    commitFormat: '{{HANDOFF_ID}}'
  }
};

// ==================== SERVICE CLASS ====================

class DeveloperHandoffService {
  
  /**
   * Generate unique handoff ID
   */
  generateHandoffId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `GH-${timestamp}-${random}`.toUpperCase();
  }
  
  /**
   * Generate content hash for verification
   */
  generateContentHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).toUpperCase();
  }
  
  /**
   * Analyze issue to identify affected pipelines and components
   */
  analyzeIssueContext(description: string): {
    affectedPipelines: string[];
    affectedWizardSteps: number[];
    affectedComponents: string[];
  } {
    const lowerDesc = description.toLowerCase();
    
    // Search pipelines
    const pipelineMatches = askGeniePipelineKnowledgeBase.searchPipelines(description);
    const affectedPipelines = pipelineMatches.slice(0, 5).map(p => p.id);
    
    // Detect wizard steps
    const affectedWizardSteps: number[] = [];
    if (lowerDesc.includes('input') || lowerDesc.includes('upload')) affectedWizardSteps.push(0);
    if (lowerDesc.includes('language') || lowerDesc.includes('translation')) affectedWizardSteps.push(1);
    if (lowerDesc.includes('industry') || lowerDesc.includes('segment')) affectedWizardSteps.push(2);
    if (lowerDesc.includes('framework') || lowerDesc.includes('template')) affectedWizardSteps.push(3, 4);
    if (lowerDesc.includes('visual') || lowerDesc.includes('image') || lowerDesc.includes('design')) affectedWizardSteps.push(5);
    if (lowerDesc.includes('agent') || lowerDesc.includes('voice') || lowerDesc.includes('orchestrat')) affectedWizardSteps.push(6);
    if (lowerDesc.includes('generat') || lowerDesc.includes('pipeline') || lowerDesc.includes('edit')) affectedWizardSteps.push(7);
    if (lowerDesc.includes('export') || lowerDesc.includes('publish') || lowerDesc.includes('download')) affectedWizardSteps.push(8);
    
    // Detect components
    const affectedComponents: string[] = [];
    const componentPatterns = [
      { pattern: /wizard/i, component: 'PresentationWizard' },
      { pattern: /editor/i, component: 'EmbeddedEditorPanel' },
      { pattern: /canvas/i, component: 'Layer3Editor' },
      { pattern: /timeline/i, component: 'TimelineMode' },
      { pattern: /avatar/i, component: 'AvatarGenerator' },
      { pattern: /voice|tts|speech/i, component: 'VoiceNarrator' },
      { pattern: /export|download/i, component: 'UniversalExport' },
      { pattern: /a2a|agent/i, component: 'A2ACoordinator' },
      { pattern: /support|ticket/i, component: 'SupportSystem' },
      { pattern: /ask genie/i, component: 'AskGenieChat' }
    ];
    
    componentPatterns.forEach(({ pattern, component }) => {
      if (pattern.test(description)) {
        affectedComponents.push(component);
      }
    });
    
    return { affectedPipelines, affectedWizardSteps, affectedComponents };
  }
  
  /**
   * Create handoff context for export
   */
  createHandoffContext(params: {
    ticketId: string;
    issueDescription: string;
    issueCategory: string;
    issuePriority: 'low' | 'medium' | 'high' | 'critical';
    targetTool: DeveloperHandoffContext['targetTool'];
    stackTraces?: string[];
    networkFailures?: any[];
    consoleErrors?: string[];
    environmentSnapshot?: any;
    sessionReplayUrl?: string;
    reproductionSteps?: string[];
    userTier?: string;
    userActions?: string[];
    currentRoute?: string;
    aiRootCause?: string;
    aiSuggestedFix?: string;
    aiAffectedFiles?: string[];
  }): DeveloperHandoffContext {
    const handoffId = this.generateHandoffId();
    const analysisResult = this.analyzeIssueContext(params.issueDescription);
    
    const context: DeveloperHandoffContext = {
      ticketId: params.ticketId,
      handoffId,
      exportedAt: new Date().toISOString(),
      targetTool: params.targetTool,
      contextHash: this.generateContentHash(params.issueDescription),
      
      issueDescription: params.issueDescription,
      issueCategory: params.issueCategory,
      issuePriority: params.issuePriority,
      affectedPipelines: analysisResult.affectedPipelines,
      affectedWizardSteps: analysisResult.affectedWizardSteps,
      affectedComponents: analysisResult.affectedComponents,
      
      stackTraces: params.stackTraces || [],
      networkFailures: params.networkFailures || [],
      consoleErrors: params.consoleErrors || [],
      environmentSnapshot: params.environmentSnapshot || {},
      sessionReplayUrl: params.sessionReplayUrl,
      reproductionSteps: params.reproductionSteps || [],
      
      userTier: params.userTier || 'unknown',
      userActions: params.userActions || [],
      currentRoute: params.currentRoute || '/',
      
      aiRootCause: params.aiRootCause,
      aiSuggestedFix: params.aiSuggestedFix,
      aiAffectedFiles: params.aiAffectedFiles,
      
      fixStatus: 'pending'
    };
    
    return context;
  }
  
  /**
   * Generate tool-specific prompt
   */
  generateToolPrompt(context: DeveloperHandoffContext): string {
    const template = AI_TOOL_TEMPLATES[context.targetTool];
    const sections: string[] = [];
    
    // Apply prefix
    let prefix = template.promptPrefix
      .replace(/\{\{HANDOFF_ID\}\}/g, context.handoffId)
      .replace(/\{\{TICKET_ID\}\}/g, context.ticketId)
      .replace(/\{\{TIMESTAMP\}\}/g, context.exportedAt);
    sections.push(prefix);
    
    // Issue details
    sections.push(`## 📋 Issue Details`);
    sections.push(`**Category:** ${context.issueCategory}`);
    sections.push(`**Priority:** ${context.issuePriority.toUpperCase()}`);
    sections.push(`**User Tier:** ${context.userTier}`);
    sections.push('');
    sections.push(`### Description`);
    sections.push(context.issueDescription);
    sections.push('');
    
    // Affected areas
    if (context.affectedPipelines.length > 0) {
      sections.push(`### 🔄 Affected Pipelines`);
      sections.push(context.affectedPipelines.map(p => `- \`${p}\``).join('\n'));
      sections.push('');
    }
    
    if (context.affectedWizardSteps.length > 0) {
      sections.push(`### 🧙 Affected Wizard Steps`);
      sections.push(context.affectedWizardSteps.map(s => `- Step ${s}`).join('\n'));
      sections.push('');
    }
    
    if (context.affectedComponents.length > 0) {
      sections.push(`### 🧩 Affected Components`);
      sections.push(context.affectedComponents.map(c => `- \`${c}\``).join('\n'));
      sections.push('');
    }
    
    // Environment
    sections.push(`## 🖥️ Environment`);
    sections.push(`- **Browser:** ${context.environmentSnapshot.browser || 'Unknown'}`);
    sections.push(`- **OS:** ${context.environmentSnapshot.os || 'Unknown'}`);
    sections.push(`- **Screen:** ${context.environmentSnapshot.screenSize || 'Unknown'}`);
    sections.push(`- **Route:** ${context.currentRoute}`);
    sections.push('');
    
    // Stack traces
    if (context.stackTraces.length > 0) {
      sections.push(`## 🔴 Error Stack Traces`);
      context.stackTraces.forEach((trace, i) => {
        sections.push(`### Error ${i + 1}`);
        sections.push('```');
        sections.push(trace);
        sections.push('```');
      });
      sections.push('');
    }
    
    // Console errors
    if (context.consoleErrors.length > 0) {
      sections.push(`## 📝 Console Errors`);
      sections.push('```');
      sections.push(context.consoleErrors.join('\n'));
      sections.push('```');
      sections.push('');
    }
    
    // Network failures
    if (context.networkFailures.length > 0) {
      sections.push(`## 🌐 Network Failures`);
      context.networkFailures.forEach((failure, i) => {
        sections.push(`${i + 1}. **${failure.method}** ${failure.url}`);
        sections.push(`   - Status: ${failure.status}`);
        sections.push(`   - Error: ${failure.error}`);
      });
      sections.push('');
    }
    
    // Reproduction steps
    if (context.reproductionSteps.length > 0) {
      sections.push(`## 🔄 Reproduction Steps`);
      context.reproductionSteps.forEach((step, i) => {
        sections.push(`${i + 1}. ${step}`);
      });
      sections.push('');
    }
    
    // Session replay
    if (context.sessionReplayUrl) {
      sections.push(`## 🎬 Session Replay`);
      sections.push(`[View Recording](${context.sessionReplayUrl})`);
      sections.push('');
    }
    
    // AI analysis if available
    if (context.aiRootCause || context.aiSuggestedFix) {
      sections.push(`## 🤖 AI Pre-Analysis`);
      if (context.aiRootCause) {
        sections.push(`### Root Cause (Preliminary)`);
        sections.push(context.aiRootCause);
        sections.push('');
      }
      if (context.aiSuggestedFix) {
        sections.push(`### Suggested Fix`);
        sections.push(context.aiSuggestedFix);
        sections.push('');
      }
      if (context.aiAffectedFiles && context.aiAffectedFiles.length > 0) {
        sections.push(`### Likely Affected Files`);
        sections.push(context.aiAffectedFiles.map(f => `- \`${f}\``).join('\n'));
        sections.push('');
      }
    }
    
    // User actions
    if (context.userActions.length > 0) {
      sections.push(`## 👤 Recent User Actions`);
      context.userActions.slice(-10).forEach((action, i) => {
        sections.push(`${i + 1}. ${action}`);
      });
      sections.push('');
    }
    
    // Apply suffix
    let suffix = template.promptSuffix
      .replace(/\{\{HANDOFF_ID\}\}/g, context.handoffId)
      .replace(/\{\{TICKET_ID\}\}/g, context.ticketId)
      .replace(/\{\{TIMESTAMP\}\}/g, context.exportedAt);
    sections.push(suffix);
    
    return sections.join('\n');
  }
  
  /**
   * Save handoff to database
   */
  async saveHandoff(context: DeveloperHandoffContext): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      const { error } = await supabase
        .from('genie_dev_context_exports')
        .insert([{
          export_content: {
            handoff: context,
            prompt: this.generateToolPrompt(context)
          } as any,
          export_format: 'handoff',
          exported_by: userId || null
        }]);
      
      if (error) {
        console.error('Failed to save handoff:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (err) {
      console.error('Handoff save error:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }
  
  /**
   * Record fix deployment event
   */
  async recordFixDeployment(event: FixDeploymentEvent): Promise<{ success: boolean }> {
    try {
      // Update the handoff status in genie_fix_deployments using correct column names
      const { error } = await supabase
        .from('genie_fix_deployments')
        .upsert([{
          ticket_id: event.handoffId, // Map handoffId to ticket_id
          current_environment: event.environment as 'dev' | 'uat' | 'main',
          pr_url: event.prUrl,
          commit_sha: event.commitSha,
          [`deployed_to_${event.environment}_at`]: event.deployedAt
        }]);
      
      if (error) {
        console.error('Failed to record deployment:', error);
        return { success: false };
      }
      
      return { success: true };
    } catch (err) {
      console.error('Deployment record error:', err);
      return { success: false };
    }
  }
  
  /**
   * Verify fix and auto-resolve ticket
   */
  async verifyFix(result: FixVerificationResult): Promise<{ success: boolean; ticketResolved: boolean }> {
    try {
      if (result.verified) {
        // Auto-resolve the associated ticket
        const { error } = await supabase
          .from('genie_support_tickets')
          .update({
            status: 'resolved',
            resolution_notes: `Fix verified via ${result.verificationMethod}. Handoff: ${result.handoffId}`
          })
          .eq('id', result.ticketId);
        
        if (error) {
          console.error('Failed to resolve ticket:', error);
          return { success: true, ticketResolved: false };
        }
        
        return { success: true, ticketResolved: true };
      }
      
      return { success: true, ticketResolved: false };
    } catch (err) {
      console.error('Fix verification error:', err);
      return { success: false, ticketResolved: false };
    }
  }
  
  /**
   * Get handoff status
   */
  async getHandoffStatus(handoffId: string): Promise<{
    found: boolean;
    context?: DeveloperHandoffContext;
    deployments?: FixDeploymentEvent[];
  }> {
    try {
      const { data } = await supabase
        .from('genie_dev_context_exports')
        .select('*')
        .eq('export_format', 'handoff')
        .single();
      
      // Note: This is a simplified lookup - in production, 
      // you'd have a proper index on handoff_id
      const exportContent = data?.export_content as any;
      
      return { found: !!data, context: exportContent?.handoff };
    } catch (err) {
      return { found: false };
    }
  }
  
  /**
   * Parse commit message to extract handoff ID
   */
  parseCommitForHandoffId(commitMessage: string): string | null {
    // Check for various formats
    const patterns = [
      /\[GENIE-FIX:\s*([A-Z0-9-]+)\]/i,
      /GENIE-FIX-([A-Z0-9-]+)/i,
      /GENIE-([A-Z0-9-]+)/i,
      /Fixes\s+GENIE-([A-Z0-9-]+)/i,
      /fix:\s*\[GENIE-([A-Z0-9-]+)\]/i
    ];
    
    for (const pattern of patterns) {
      const match = commitMessage.match(pattern);
      if (match && match[1]) {
        return match[1].startsWith('GH-') ? match[1] : `GH-${match[1]}`;
      }
    }
    
    return null;
  }
  
  /**
   * Get ecosystem support knowledge for Ask Genie
   */
  getEcosystemKnowledge() {
    return {
      supportTiers: SUPPORT_KNOWLEDGE.tiers,
      escalationFlow: SUPPORT_KNOWLEDGE.escalationFlow,
      engineeringContext: ENGINEERING_CONTEXT_EXPORT,
      differentiators: SUPPORT_KNOWLEDGE.differentiators,
      aiTools: Object.keys(AI_TOOL_TEMPLATES).map(key => ({
        id: key,
        ...AI_TOOL_TEMPLATES[key as keyof typeof AI_TOOL_TEMPLATES]
      })),
      pipelines: askGeniePipelineKnowledgeBase.getStats()
    };
  }
}

// Export singleton
export const developerHandoffService = new DeveloperHandoffService();
