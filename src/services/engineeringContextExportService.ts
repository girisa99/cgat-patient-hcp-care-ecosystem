/**
 * ENGINEERING CONTEXT EXPORT SERVICE
 * 
 * Generates structured AI-ready context exports for subscribers
 * who don't have direct access to Lovable/Cursor/Claude.
 * 
 * Features:
 * - Copy-to-clipboard markdown prompt
 * - Downloadable JSON context
 * - Email-ready summary
 * - Direct submission to engineering queue
 */

import { supabase } from '@/integrations/supabase/client';

export interface ContextExportOptions {
  ticketId: string;
  format: 'markdown' | 'json' | 'email';
  includeStackTrace?: boolean;
  includeSessionReplay?: boolean;
  includeNetworkLogs?: boolean;
  includeEnvironmentSnapshot?: boolean;
}

export interface EngineeringContext {
  ticketId: string;
  summary: string;
  category: string;
  priority: string;
  stackTraces: string[];
  networkFailures: Array<{
    url: string;
    method: string;
    status: number;
    error: string;
    timestamp: string;
  }>;
  sessionReplayUrl?: string;
  environmentSnapshot: {
    browser: string;
    os: string;
    screenSize: string;
    timezone: string;
    language: string;
    appVersion: string;
  };
  reproductionSteps: string[];
  userContext: {
    subscriptionTier: string;
    lastActions: string[];
    currentRoute: string;
  };
}

export interface ExportResult {
  success: boolean;
  content: string;
  format: 'markdown' | 'json' | 'email';
  exportId?: string;
  downloadUrl?: string;
  error?: string;
}

class EngineeringContextExportService {
  
  /**
   * Capture current browser/environment context
   */
  captureEnvironmentSnapshot(): EngineeringContext['environmentSnapshot'] {
    return {
      browser: this.detectBrowser(),
      os: this.detectOS(),
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0'
    };
  }
  
  private detectBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return `Chrome ${ua.match(/Chrome\/(\d+)/)?.[1] || ''}`;
    if (ua.includes('Firefox')) return `Firefox ${ua.match(/Firefox\/(\d+)/)?.[1] || ''}`;
    if (ua.includes('Safari')) return `Safari ${ua.match(/Version\/(\d+)/)?.[1] || ''}`;
    if (ua.includes('Edge')) return `Edge ${ua.match(/Edge\/(\d+)/)?.[1] || ''}`;
    return 'Unknown Browser';
  }
  
  private detectOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown OS';
  }
  
  /**
   * Generate markdown prompt for AI tools (Lovable, Cursor, Claude)
   */
  generateMarkdownPrompt(context: EngineeringContext): string {
    const sections: string[] = [];
    
    // Header
    sections.push(`# 🔧 Engineering Context Export`);
    sections.push(`**Ticket ID:** ${context.ticketId}`);
    sections.push(`**Generated:** ${new Date().toISOString()}`);
    sections.push(`**Priority:** ${context.priority}`);
    sections.push(`**Category:** ${context.category}`);
    sections.push('');
    
    // Summary
    sections.push(`## 📋 Issue Summary`);
    sections.push(context.summary);
    sections.push('');
    
    // Environment
    sections.push(`## 🖥️ Environment`);
    sections.push(`- **Browser:** ${context.environmentSnapshot.browser}`);
    sections.push(`- **OS:** ${context.environmentSnapshot.os}`);
    sections.push(`- **Screen:** ${context.environmentSnapshot.screenSize}`);
    sections.push(`- **Timezone:** ${context.environmentSnapshot.timezone}`);
    sections.push(`- **Language:** ${context.environmentSnapshot.language}`);
    sections.push(`- **App Version:** ${context.environmentSnapshot.appVersion}`);
    sections.push('');
    
    // User Context
    sections.push(`## 👤 User Context`);
    sections.push(`- **Subscription:** ${context.userContext.subscriptionTier}`);
    sections.push(`- **Current Route:** ${context.userContext.currentRoute}`);
    if (context.userContext.lastActions.length > 0) {
      sections.push(`- **Recent Actions:**`);
      context.userContext.lastActions.forEach(action => {
        sections.push(`  - ${action}`);
      });
    }
    sections.push('');
    
    // Stack Traces
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
    
    // Network Failures
    if (context.networkFailures.length > 0) {
      sections.push(`## 🌐 Network Failures`);
      context.networkFailures.forEach((failure, i) => {
        sections.push(`### Request ${i + 1}`);
        sections.push(`- **URL:** ${failure.url}`);
        sections.push(`- **Method:** ${failure.method}`);
        sections.push(`- **Status:** ${failure.status}`);
        sections.push(`- **Error:** ${failure.error}`);
        sections.push(`- **Time:** ${failure.timestamp}`);
      });
      sections.push('');
    }
    
    // Reproduction Steps
    if (context.reproductionSteps.length > 0) {
      sections.push(`## 🔄 Reproduction Steps`);
      context.reproductionSteps.forEach((step, i) => {
        sections.push(`${i + 1}. ${step}`);
      });
      sections.push('');
    }
    
    // Session Replay
    if (context.sessionReplayUrl) {
      sections.push(`## 🎬 Session Replay`);
      sections.push(`[View Session Recording](${context.sessionReplayUrl})`);
      sections.push('');
    }
    
    // AI Instructions
    sections.push(`## 🤖 AI Instructions`);
    sections.push(`Please analyze this issue and provide:`);
    sections.push(`1. Root cause analysis`);
    sections.push(`2. Suggested fix with code changes`);
    sections.push(`3. Testing recommendations`);
    sections.push(`4. Any security or performance concerns`);
    
    return sections.join('\n');
  }
  
  /**
   * Generate JSON context for programmatic use
   */
  generateJsonContext(context: EngineeringContext): string {
    return JSON.stringify({
      ...context,
      exportMetadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0',
        format: 'engineering-context-v1'
      }
    }, null, 2);
  }
  
  /**
   * Generate email-ready summary
   */
  generateEmailSummary(context: EngineeringContext): string {
    return `
Subject: [${context.priority.toUpperCase()}] Engineering Issue - ${context.ticketId}

Team,

A technical issue has been escalated from the support system.

ISSUE SUMMARY:
${context.summary}

CATEGORY: ${context.category}
PRIORITY: ${context.priority}
USER TIER: ${context.userContext.subscriptionTier}

ENVIRONMENT:
- Browser: ${context.environmentSnapshot.browser}
- OS: ${context.environmentSnapshot.os}
- Route: ${context.userContext.currentRoute}

${context.stackTraces.length > 0 ? `ERRORS DETECTED: ${context.stackTraces.length} stack trace(s) captured` : 'No stack traces captured'}
${context.networkFailures.length > 0 ? `NETWORK ISSUES: ${context.networkFailures.length} failed request(s)` : 'No network failures'}

REPRODUCTION STEPS:
${context.reproductionSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

The full technical context has been attached for AI-assisted debugging.

---
Auto-generated by Genie Support System
    `.trim();
  }
  
  /**
   * Export context to database and return download info
   */
  async exportContext(
    ticketId: string, 
    context: EngineeringContext, 
    format: 'markdown' | 'json' | 'email'
  ): Promise<ExportResult> {
    try {
      let content: string;
      
      switch (format) {
        case 'markdown':
          content = this.generateMarkdownPrompt(context);
          break;
        case 'json':
          content = this.generateJsonContext(context);
          break;
        case 'email':
          content = this.generateEmailSummary(context);
          break;
      }
      
      // Save to database
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data, error } = await supabase
        .from('genie_dev_context_exports')
        .insert([{
          export_content: {
            ticket_id: ticketId,
            ai_prompt: content,
            context_snapshot: context,
            generated_at: new Date().toISOString()
          } as any,
          export_format: format,
          exported_by: userId || null
        }])
        .select('id')
        .single();
      
      if (error) {
        console.error('Failed to save context export:', error);
        // Still return the content even if save fails
        return {
          success: true,
          content,
          format,
          error: 'Export generated but not saved to database'
        };
      }
      
      return {
        success: true,
        content,
        format,
        exportId: data.id
      };
    } catch (err) {
      console.error('Context export error:', err);
      return {
        success: false,
        content: '',
        format,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Copy context to clipboard
   */
  async copyToClipboard(content: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = content;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  }
  
  /**
   * Download context as file
   */
  downloadAsFile(content: string, format: 'markdown' | 'json' | 'email', ticketId: string): void {
    const extension = format === 'markdown' ? 'md' : format === 'json' ? 'json' : 'txt';
    const mimeType = format === 'json' ? 'application/json' : 'text/plain';
    const filename = `engineering-context-${ticketId}-${Date.now()}.${extension}`;
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const engineeringContextExportService = new EngineeringContextExportService();
