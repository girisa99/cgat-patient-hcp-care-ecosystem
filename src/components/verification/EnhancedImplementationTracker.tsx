
import React, { useState } from 'react';
import { EnhancedTabs, EnhancedTabsList, EnhancedTabsTrigger, EnhancedTabsContent } from '@/components/ui/enhanced-tabs';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Target, 
  AlertTriangle, 
  Clock, 
  Shield, 
  Palette, 
  Zap, 
  Code, 
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { ImplementationItem, ImplementationProgressStats } from './types/implementationTypes';

const EnhancedImplementationTracker = () => {
  const [items, setItems] = useState<ImplementationItem[]>([
    // Critical Accessibility Issues
    {
      id: 'acc-1',
      title: 'Add Alt Text to Images',
      description: 'All images must have alternative text for screen readers',
      priority: 'critical',
      category: 'accessibility',
      completed: false,
      estimatedTime: '2-3 hours',
      implementation: 'Use AccessibleImage component with mandatory alt props'
    },
    {
      id: 'acc-2',
      title: 'Fix Color Contrast Issues',
      description: 'Ensure 4.5:1 contrast ratio for normal text',
      priority: 'critical',
      category: 'accessibility', 
      completed: false,
      estimatedTime: '3-4 hours',
      implementation: 'Update color scheme using design system tokens'
    },
    {
      id: 'acc-3',
      title: 'Implement Keyboard Navigation',
      description: 'All interactive elements must be keyboard accessible',
      priority: 'critical',
      category: 'accessibility',
      completed: false,
      estimatedTime: '4-6 hours',
      implementation: 'Add proper tabindex and keyboard event handlers to all components'
    },
    {
      id: 'acc-4',
      title: 'Add Focus Indicators', 
      description: 'Visible focus styles for all interactive elements',
      priority: 'critical',
      category: 'accessibility',
      completed: false,
      estimatedTime: '2-3 hours',
      implementation: 'Use EnhancedButton and enhanced components with built-in focus styles'
    },
    // UI/UX Improvements
    {
      id: 'ui-1',
      title: 'Enhance Component Visual Appeal',
      description: 'Improve visual richness and consistency',
      priority: 'high',
      category: 'ui-ux',
      completed: false,
      estimatedTime: '6-8 hours', 
      implementation: 'Replace basic components with enhanced versions (cards, buttons, tabs)'
    },
    {
      id: 'ui-2',
      title: 'Add Loading States and Animations',
      description: 'Implement smooth transitions and loading indicators',
      priority: 'high',
      category: 'ui-ux',
      completed: false,
      estimatedTime: '4-5 hours',
      implementation: 'Add loading props to enhanced components and skeleton states'
    }
  ]);

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const getProgressStats = (): ImplementationProgressStats => {
    const criticalItems = items.filter(item => item.priority === 'critical');
    const highPriorityItems = items.filter(item => item.priority === 'high');
    const completedItems = items.filter(item => item.completed);
    
    return {
      criticalCount: criticalItems.filter(i => !i.completed).length,
      highPriorityCount: highPriorityItems.filter(i => !i.completed).length,
      completedCount: completedItems.length,
      totalCount: items.length,
      progressPercentage: Math.round((completedItems.length / items.length) * 100)
    };
  };

  const stats = getProgressStats();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'accessibility': return Shield;
      case 'ui-ux': return Palette;
      case 'security': return Shield;
      case 'performance': return Zap;
      case 'code-quality': return Code;
      default: return Target;
    }
  };

  const renderImplementationItem = (item: ImplementationItem, variant: string) => {
    const IconComponent = getCategoryIcon(item.category);
    
    if (item.completed && variant === 'completed') {
      return (
        <EnhancedCard 
          key={item.id}
          variant="elevated"
          className="border-l-4 border-l-green-500 bg-green-50/50"
        >
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2 text-green-800">
                  <IconComponent className="h-4 w-4" />
                  {item.title}
                </h4>
                <Badge variant="default" className="bg-green-600">
                  Completed
                </Badge>
              </div>
              <p className="text-sm text-green-700">{item.description}</p>
            </div>
          </div>
        </EnhancedCard>
      );
    }

    const getCardVariant = () => {
      switch (item.priority) {
        case 'critical': return 'outlined';
        case 'high': return 'elevated';
        default: return 'default';
      }
    };

    const getBorderColor = () => {
      switch (item.priority) {
        case 'critical': return 'border-l-4 border-l-red-500';
        case 'high': return 'border-l-4 border-l-orange-500';
        default: return 'border-l-4 border-l-blue-500';
      }
    };

    return (
      <EnhancedCard 
        key={item.id}
        variant={getCardVariant()}
        className={getBorderColor()}
        hoverable
      >
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={item.completed}
            onCheckedChange={() => toggleItem(item.id)}
            className="mt-1"
            aria-label={`Mark ${item.title} as ${item.completed ? 'incomplete' : 'complete'}`}
          />
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                {item.title}
              </h4>
              <div className="flex items-center gap-2">
                <Badge variant={item.priority === 'critical' ? 'destructive' : 'default'}>
                  {item.priority}
                </Badge>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {item.estimatedTime}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
              <p className="text-xs font-medium text-blue-700 mb-1">Implementation:</p>
              <p className="text-xs text-blue-600">{item.implementation}</p>
            </div>
          </div>
        </div>
      </EnhancedCard>
    );
  };

  const criticalItems = items.filter(item => item.priority === 'critical');
  const highPriorityItems = items.filter(item => item.priority === 'high');
  const completedItems = items.filter(item => item.completed);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <EnhancedCard 
        title="Implementation Progress" 
        description="Track your progress implementing verification recommendations"
        variant="gradient"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{stats.progressPercentage}% Complete</span>
          </div>
          <Progress value={stats.progressPercentage} className="w-full h-3" />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{stats.criticalCount}</div>
              <div className="text-xs text-red-700 font-medium">Critical Issues</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">{stats.highPriorityCount}</div>
              <div className="text-xs text-orange-700 font-medium">High Priority</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{stats.completedCount}</div>
              <div className="text-xs text-green-700 font-medium">Completed</div>
            </div>
          </div>
        </div>
      </EnhancedCard>

      {/* Implementation Tabs */}
      <EnhancedTabs defaultValue="critical">
        <EnhancedTabsList>
          <EnhancedTabsTrigger 
            value="critical" 
            icon={<AlertTriangle className="h-4 w-4" />}
          >
            Critical Issues ({criticalItems.filter(i => !i.completed).length})
          </EnhancedTabsTrigger>
          <EnhancedTabsTrigger 
            value="high"
            icon={<TrendingUp className="h-4 w-4" />}
          >
            High Priority ({highPriorityItems.filter(i => !i.completed).length})
          </EnhancedTabsTrigger>
          <EnhancedTabsTrigger 
            value="completed"
            icon={<CheckCircle className="h-4 w-4" />}
          >
            Completed ({completedItems.length})
          </EnhancedTabsTrigger>
        </EnhancedTabsList>

        <EnhancedTabsContent value="critical">
          <div className="space-y-4">
            {criticalItems.filter(item => !item.completed).map(item => 
              renderImplementationItem(item, 'critical')
            )}
            {criticalItems.filter(item => !item.completed).length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold text-green-600">All Critical Issues Resolved!</h3>
                <p className="text-muted-foreground">Great job! Move on to high priority items.</p>
              </div>
            )}
          </div>
        </EnhancedTabsContent>

        <EnhancedTabsContent value="high">
          <div className="space-y-4">
            {highPriorityItems.filter(item => !item.completed).map(item => 
              renderImplementationItem(item, 'high')
            )}
            {highPriorityItems.filter(item => !item.completed).length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold text-green-600">All High Priority Items Complete!</h3>
                <p className="text-muted-foreground">Excellent progress on UI/UX improvements.</p>
              </div>
            )}
          </div>
        </EnhancedTabsContent>

        <EnhancedTabsContent value="completed">
          <div className="space-y-4">
            {completedItems.map(item => 
              renderImplementationItem(item, 'completed')
            )}
            {completedItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No completed tasks yet. Start with the critical issues!</p>
              </div>
            )}
          </div>
        </EnhancedTabsContent>
      </EnhancedTabs>
    </div>
  );
};

export default EnhancedImplementationTracker;
