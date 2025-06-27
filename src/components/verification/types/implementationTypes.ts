
export interface ImplementationItem {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'accessibility' | 'ui-ux' | 'security' | 'performance' | 'code-quality';
  completed: boolean;
  estimatedTime: string;
  implementation: string;
}

export interface ImplementationProgressStats {
  criticalCount: number;
  highPriorityCount: number;
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
}
