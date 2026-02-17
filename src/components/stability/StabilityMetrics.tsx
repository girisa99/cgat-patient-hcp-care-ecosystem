/**
 * STABILITY METRICS COMPONENT
 * Extracted metrics logic from StabilityProvider for better organization
 * Part of Stability Framework Phase 2 refactoring
 */
import React from 'react';
import { StabilityMetrics as MetricsType, HookUsageTracker, LayoutProtection } from './StabilityHooks';

interface StabilityMetricsProps {
  modules: Record<string, MetricsType>;
  hooks: Record<string, HookUsageTracker>;
  layouts: Record<string, LayoutProtection>;
  globalHealth: 'stable' | 'warning' | 'unstable';
  duplicateDetections: string[];
  protectionAlerts: string[];
}

export const StabilityMetricsDisplay: React.FC<StabilityMetricsProps> = ({
  modules,
  hooks,
  layouts,
  globalHealth,
  duplicateDetections,
  protectionAlerts
}) => {
  const moduleCount = Object.keys(modules).length;
  const hookCount = Object.keys(hooks).length;
  const layoutCount = Object.keys(layouts).length;
  const duplicateCount = duplicateDetections.length;
  const alertCount = protectionAlerts.length;

  const healthyModules = Object.values(modules).filter(m => m.healthStatus === 'healthy').length;
  const warningModules = Object.values(modules).filter(m => m.healthStatus === 'warning').length;
  const criticalModules = Object.values(modules).filter(m => m.healthStatus === 'critical').length;

  const duplicateHooks = Object.values(hooks).filter(h => h.isDuplicate).length;
  const layoutShifts = Object.values(layouts).filter(l => l.hasLayoutShift).length;

  return (
    <div className="stability-metrics space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="metric-card p-3 bg-card border rounded-lg">
          <div className="text-sm text-muted-foreground">Modules</div>
          <div className="text-2xl font-bold">{moduleCount}</div>
          <div className="text-xs text-muted-foreground">
            {healthyModules}H {warningModules}W {criticalModules}C
          </div>
        </div>

        <div className="metric-card p-3 bg-card border rounded-lg">
          <div className="text-sm text-muted-foreground">Hooks</div>
          <div className="text-2xl font-bold">{hookCount}</div>
          <div className="text-xs text-muted-foreground">
            {duplicateHooks} duplicates
          </div>
        </div>

        <div className="metric-card p-3 bg-card border rounded-lg">
          <div className="text-sm text-muted-foreground">Layouts</div>
          <div className="text-2xl font-bold">{layoutCount}</div>
          <div className="text-xs text-muted-foreground">
            {layoutShifts} shifts
          </div>
        </div>

        <div className="metric-card p-3 bg-card border rounded-lg">
          <div className="text-sm text-muted-foreground">Health</div>
          <div className={`text-2xl font-bold ${
            globalHealth === 'stable' ? 'text-green-600' :
            globalHealth === 'warning' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {globalHealth.toUpperCase()}
          </div>
          <div className="text-xs text-muted-foreground">
            {alertCount} alerts
          </div>
        </div>
      </div>

      {alertCount > 0 && (
        <div className="alerts-section">
          <h4 className="font-semibold text-sm mb-2">Recent Alerts</h4>
          <div className="space-y-1">
            {protectionAlerts.slice(0, 3).map((alert, index) => (
              <div key={index} className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded">
                {alert}
              </div>
            ))}
          </div>
        </div>
      )}

      {duplicateCount > 0 && (
        <div className="duplicates-section">
          <h4 className="font-semibold text-sm mb-2">Duplicate Detections</h4>
          <div className="space-y-1">
            {duplicateDetections.slice(0, 3).map((duplicate, index) => (
              <div key={index} className="text-xs text-muted-foreground bg-red-50 p-2 rounded">
                {duplicate}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Utility functions for metrics calculations
 */
export class StabilityMetricsCalculator {
  static calculateOverallHealth(modules: Record<string, MetricsType>): 'stable' | 'warning' | 'unstable' {
    const moduleValues = Object.values(modules);
    if (moduleValues.length === 0) return 'stable';

    const criticalCount = moduleValues.filter(m => m.healthStatus === 'critical').length;
    const warningCount = moduleValues.filter(m => m.healthStatus === 'warning').length;

    if (criticalCount > 0 || criticalCount / moduleValues.length > 0.1) {
      return 'unstable';
    }

    if (warningCount > 0 || warningCount / moduleValues.length > 0.3) {
      return 'warning';
    }

    return 'stable';
  }

  static calculatePerformanceScore(modules: Record<string, MetricsType>): number {
    const moduleValues = Object.values(modules);
    if (moduleValues.length === 0) return 100;

    const totalScore = moduleValues.reduce((sum, module) => sum + module.performanceScore, 0);
    return Math.round(totalScore / moduleValues.length);
  }

  static getTopIssues(modules: Record<string, MetricsType>, limit: number = 5): Array<{
    moduleId: string;
    issue: string;
    severity: 'high' | 'medium' | 'low';
  }> {
    const issues: Array<{
      moduleId: string;
      issue: string;
      severity: 'high' | 'medium' | 'low';
    }> = [];

    Object.values(modules).forEach(module => {
      if (module.errorCount > 5) {
        issues.push({
          moduleId: module.moduleId,
          issue: `High error count: ${module.errorCount}`,
          severity: 'high'
        });
      }

      if (module.performanceScore < 60) {
        issues.push({
          moduleId: module.moduleId,
          issue: `Poor performance: ${module.performanceScore}`,
          severity: 'medium'
        });
      }

      if (module.crashCount > 0) {
        issues.push({
          moduleId: module.moduleId,
          issue: `Crashes detected: ${module.crashCount}`,
          severity: 'high'
        });
      }
    });

    return issues
      .sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
      .slice(0, limit);
  }
}

export default StabilityMetricsDisplay;