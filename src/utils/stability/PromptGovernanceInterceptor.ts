/**
 * PROMPT GOVERNANCE INTERCEPTOR
 * Analyzes prompts for compliance issues and enhances them with framework requirements
 * Integrates with existing FrameworkComplianceMonitor
 */

interface PromptData {
  content?: string;
  message?: string;
  [key: string]: any;
}

interface ViolationPattern {
  patterns: RegExp[];
  severity: 'high' | 'medium' | 'low';
  check: string;
}

interface PromptAnalysis {
  violations: Array<{
    type: string;
    severity: string;
    check: string;
    pattern: string;
    recommendation: string;
  }>;
  warnings: Array<{
    type: string;
    severity: string;
    check: string;
    pattern: string;
    recommendation: string;
  }>;
  enhancements: string[];
  complianceScore: number;
}

interface PromptHistoryEntry {
  prompt: PromptData;
  analysis: PromptAnalysis;
  timestamp: Date;
}

export class PromptGovernanceInterceptor {
  private promptHistory: PromptHistoryEntry[] = [];
  private violationPatterns: Map<string, ViolationPattern> = new Map();

  constructor() {
    this.setupViolationPatterns();
  }

  private setupViolationPatterns(): void {
    // Patterns that indicate potential violations
    this.violationPatterns.set('duplicate_creation', {
      patterns: [
        /create\s+(?:new\s+)?(?:component|service)/i,
        /build\s+(?:a\s+)?(?:component|service)/i,
        /make\s+(?:a\s+)?(?:component|service)/i
      ],
      severity: 'high',
      check: 'Must check existing components/services first'
    });

    this.violationPatterns.set('breaking_changes', {
      patterns: [
        /(?:change|modify|update|remove)\s+(?:prop|method|interface)/i,
        /delete\s+(?:component|service|function)/i,
        /rename\s+(?:component|service)/i
      ],
      severity: 'high',
      check: 'Must ensure backwards compatibility'
    });

    this.violationPatterns.set('missing_role_access', {
      patterns: [
        /(?:admin|manager)\s+(?:only|feature|functionality)/i,
        /restrict\s+(?:access|to)/i,
        /permission\s+(?:based|control)/i
      ],
      severity: 'medium',
      check: 'Should implement role-based access controls'
    });

    this.violationPatterns.set('missing_feature_flags', {
      patterns: [
        /new\s+feature/i,
        /experimental\s+functionality/i,
        /beta\s+feature/i
      ],
      severity: 'medium',
      check: 'Should use feature flags for gradual rollout'
    });
  }

  async interceptPrompt(promptData: PromptData): Promise<PromptData> {
    console.log('🎯 Intercepting prompt for governance check...');
    
    const analysis = await this.analyzePromptCompliance(promptData);
    
    // Store in history
    this.promptHistory.push({
      prompt: promptData,
      analysis,
      timestamp: new Date()
    });

    // Handle violations
    if (analysis.violations.length > 0) {
      return await this.handlePromptViolations(promptData, analysis);
    }

    // Enhance compliant prompts
    return this.enhanceCompliantPrompt(promptData, analysis);
  }

  private async analyzePromptCompliance(promptData: PromptData): Promise<PromptAnalysis> {
    const prompt = promptData.content || promptData.message || '';
    const analysis: PromptAnalysis = {
      violations: [],
      warnings: [],
      enhancements: [],
      complianceScore: 100
    };

    // Check against violation patterns
    for (const [violationType, config] of this.violationPatterns) {
      for (const pattern of config.patterns) {
        if (pattern.test(prompt)) {
          const violation = {
            type: violationType,
            severity: config.severity,
            check: config.check,
            pattern: pattern.toString(),
            recommendation: this.getRecommendation(violationType)
          };

          if (config.severity === 'high') {
            analysis.violations.push(violation);
            analysis.complianceScore -= 25;
          } else {
            analysis.warnings.push(violation);
            analysis.complianceScore -= 10;
          }
        }
      }
    }

    // Check for framework keywords
    analysis.enhancements = this.suggestEnhancements(prompt);

    return analysis;
  }

  private getRecommendation(violationType: string): string {
    const recommendations: Record<string, string> = {
      'duplicate_creation': 'Add "check existing components first" to your prompt',
      'breaking_changes': 'Specify "ensure backwards compatibility" in your request',
      'missing_role_access': 'Include role-based access requirements',
      'missing_feature_flags': 'Request feature flag implementation for gradual rollout'
    };

    return recommendations[violationType] || 'Follow framework guidelines';
  }

  private suggestEnhancements(prompt: string): string[] {
    const enhancements: string[] = [];
    
    if (!prompt.includes('existing')) {
      enhancements.push('Consider checking existing implementations first');
    }
    
    if (!prompt.includes('backwards compatible')) {
      enhancements.push('Ensure backwards compatibility');
    }
    
    if (!prompt.includes('role')) {
      enhancements.push('Consider role-based access requirements');
    }
    
    if (prompt.includes('feature') && !prompt.includes('flag')) {
      enhancements.push('Consider using feature flags for new features');
    }

    return enhancements;
  }

  private async handlePromptViolations(promptData: PromptData, analysis: PromptAnalysis): Promise<PromptData> {
    console.log('🚨 PROMPT VIOLATIONS DETECTED');
    
    const blockingViolations = analysis.violations.filter(v => v.severity === 'high');
    
    if (blockingViolations.length > 0) {
      console.error('❌ HIGH SEVERITY VIOLATIONS:');
      blockingViolations.forEach(violation => {
        console.error(`   - ${violation.check}`);
        console.error(`     Recommendation: ${violation.recommendation}`);
      });

      // Create compliance-enhanced prompt
      const enhancedPrompt = this.createComplianceEnhancedPrompt(promptData, analysis);
      
      console.log('✅ Prompt enhanced with compliance requirements');
      return enhancedPrompt;
    }

    return this.enhanceCompliantPrompt(promptData, analysis);
  }

  private createComplianceEnhancedPrompt(promptData: PromptData, analysis: PromptAnalysis): PromptData {
    let enhancedContent = promptData.content || promptData.message || '';
    
    // Add mandatory compliance prefix
    const compliancePrefix = `
🚨 FRAMEWORK COMPLIANCE REQUIRED 🚨

MANDATORY REQUIREMENTS:
${analysis.violations.map(v => `- ${v.check}`).join('\n')}

BEFORE PROCEEDING:
1. Check existing components/services for similar functionality
2. Ensure any changes maintain backwards compatibility  
3. Implement role-based access for new features
4. Use feature flags for gradual rollout
5. Follow established naming conventions

ORIGINAL REQUEST:
`;

    enhancedContent = compliancePrefix + enhancedContent;

    // Add specific compliance checks
    if (analysis.violations.some(v => v.type === 'duplicate_creation')) {
      enhancedContent += `\n\n📋 DUPLICATE PREVENTION CHECKLIST:
- [ ] Search existing components/services registry
- [ ] Analyze similar functionality (>70% similarity threshold)
- [ ] Consider extending existing instead of creating new
- [ ] Document why new creation is necessary`;
    }

    if (analysis.violations.some(v => v.type === 'breaking_changes')) {
      enhancedContent += `\n\n🔒 STABILITY CHECKLIST:
- [ ] Create new version instead of modifying existing
- [ ] Implement backwards compatibility adapters
- [ ] Use deprecation warnings for old versions
- [ ] Plan migration strategy for existing users`;
    }

    // Add framework context
    enhancedContent += `\n\n🔧 FRAMEWORK TOOLS AVAILABLE:
- check_component_duplicates: Verify component uniqueness
- validate_breaking_changes: Check stability impact
- create_role_based_feature: Implement role-based access
- enhance_component_safely: Add features without breaking changes

USE THESE TOOLS TO ENSURE COMPLIANCE.`;

    return {
      ...promptData,
      content: enhancedContent,
      complianceEnhanced: true,
      originalContent: promptData.content || promptData.message,
      violations: analysis.violations,
      complianceScore: analysis.complianceScore
    };
  }

  private enhanceCompliantPrompt(promptData: PromptData, analysis: PromptAnalysis): PromptData {
    let enhancedContent = promptData.content || promptData.message || '';
    
    // Add enhancement suggestions for compliant prompts
    if (analysis.enhancements.length > 0) {
      enhancedContent += `\n\n💡 FRAMEWORK ENHANCEMENTS:
${analysis.enhancements.map(e => `- ${e}`).join('\n')}`;
    }

    // Add best practices reminder
    enhancedContent += `\n\n✅ FRAMEWORK BEST PRACTICES ACTIVE:
- Duplicate prevention monitoring enabled
- Stability validation active
- Role-based access controls ready
- Feature flag system available`;

    return {
      ...promptData,
      content: enhancedContent,
      complianceEnhanced: true,
      complianceScore: analysis.complianceScore,
      enhancements: analysis.enhancements
    };
  }

  getPromptHistory(): PromptHistoryEntry[] {
    return this.promptHistory;
  }

  getViolationStats(): {
    totalPrompts: number;
    violationsFound: number;
    averageComplianceScore: number;
    commonViolations: Record<string, number>;
  } {
    const stats = {
      totalPrompts: this.promptHistory.length,
      violationsFound: 0,
      averageComplianceScore: 0,
      commonViolations: {} as Record<string, number>
    };

    let totalScore = 0;
    
    this.promptHistory.forEach(entry => {
      if (entry.analysis.violations.length > 0) {
        stats.violationsFound++;
      }
      
      totalScore += entry.analysis.complianceScore;
      
      entry.analysis.violations.forEach(violation => {
        stats.commonViolations[violation.type] = 
          (stats.commonViolations[violation.type] || 0) + 1;
      });
    });

    stats.averageComplianceScore = stats.totalPrompts > 0 ? 
      Math.round(totalScore / stats.totalPrompts) : 100;

    return stats;
  }
}