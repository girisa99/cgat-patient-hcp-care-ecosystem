
/**
 * Component Auditor
 * 
 * Automated tool to audit component usage and ensure canonical source compliance
 */

export interface AuditResult {
  componentName: string;
  usageCount: number;
  importPaths: string[];
  isCanonical: boolean;
  issues: string[];
  recommendations: string[];
}

export class ComponentAuditor {
  private canonicalComponents = new Map<string, string>([
    ['UsersList', 'src/components/users/UsersList.tsx'],
    ['UserActions', 'src/components/users/UserActions.tsx'],
    ['ConsistentUsersLayout', 'src/components/users/ConsistentUsersLayout.tsx'],
    ['useUsers', 'src/hooks/useUsers.tsx'],
    ['usePatients', 'src/hooks/usePatients.tsx'],
    ['useConsistentUsers', 'src/hooks/useConsistentUsers.tsx']
  ]);

  /**
   * Audit all component usage across the codebase
   */
  async auditComponentUsage(): Promise<AuditResult[]> {
    const results: AuditResult[] = [];
    
    for (const [componentName, canonicalPath] of this.canonicalComponents) {
      const result = await this.auditSingleComponent(componentName, canonicalPath);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Audit a single component's usage
   */
  private async auditSingleComponent(componentName: string, canonicalPath: string): Promise<AuditResult> {
    const usages = await this.findComponentUsages(componentName);
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check for non-canonical imports
    const nonCanonicalImports = usages.filter(usage => 
      !usage.importPath.includes(canonicalPath.replace('src/', ''))
    );
    
    if (nonCanonicalImports.length > 0) {
      issues.push(`Found ${nonCanonicalImports.length} non-canonical imports`);
      recommendations.push(`Update imports to use: ${canonicalPath}`);
    }
    
    // Check usage frequency
    if (usages.length === 0) {
      issues.push('Component is not being used');
      recommendations.push('Consider removing if truly unused');
    } else if (usages.length === 1) {
      issues.push('Component has only one usage - consider if it\'s necessary');
    }
    
    return {
      componentName,
      usageCount: usages.length,
      importPaths: usages.map(u => u.importPath),
      isCanonical: nonCanonicalImports.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Find all usages of a component in the codebase
   */
  private async findComponentUsages(componentName: string): Promise<Array<{importPath: string, filePath: string}>> {
    // This would scan the codebase for imports
    // For now, returning a mock structure
    return [];
  }

  /**
   * Generate audit report
   */
  generateAuditReport(results: AuditResult[]): string {
    let report = '📋 COMPONENT USAGE AUDIT REPORT\n';
    report += '=' .repeat(50) + '\n\n';
    
    for (const result of results) {
      report += `📦 ${result.componentName}\n`;
      report += `📊 Usage Count: ${result.usageCount}\n`;
      report += `✅ Canonical: ${result.isCanonical ? 'Yes' : 'No'}\n`;
      
      if (result.issues.length > 0) {
        report += `⚠️  Issues:\n`;
        result.issues.forEach(issue => report += `   • ${issue}\n`);
      }
      
      if (result.recommendations.length > 0) {
        report += `💡 Recommendations:\n`;
        result.recommendations.forEach(rec => report += `   • ${rec}\n`);
      }
      
      report += '\n' + '-'.repeat(30) + '\n\n';
    }
    
    return report;
  }
}
