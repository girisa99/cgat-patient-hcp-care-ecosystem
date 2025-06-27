
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImplementationItem, ImplementationProgressStats } from './types/implementationTypes';
import ImplementationProgressCard from './ImplementationProgressCard';
import ImplementationTabsContent from './ImplementationTabsContent';

const ImplementationTracker = () => {
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
      implementation: 'Review all img elements and add meaningful alt attributes'
    },
    {
      id: 'acc-2',
      title: 'Fix Color Contrast Issues',
      description: 'Ensure 4.5:1 contrast ratio for normal text',
      priority: 'critical',
      category: 'accessibility',
      completed: false,
      estimatedTime: '3-4 hours',
      implementation: 'Update color scheme to meet WCAG AA standards'
    },
    {
      id: 'acc-3',
      title: 'Implement Keyboard Navigation',
      description: 'All interactive elements must be keyboard accessible',
      priority: 'critical',
      category: 'accessibility',
      completed: false,
      estimatedTime: '4-6 hours',
      implementation: 'Add proper tabindex and keyboard event handlers'
    },
    {
      id: 'acc-4',
      title: 'Add Focus Indicators',
      description: 'Visible focus styles for all interactive elements',
      priority: 'critical',
      category: 'accessibility',
      completed: false,
      estimatedTime: '2-3 hours',
      implementation: 'Add focus:ring and focus:outline styles'
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
      implementation: 'Add animations, shadows, and consistent spacing'
    },
    {
      id: 'ui-2',
      title: 'Improve Navigation Consistency',
      description: 'Standardize navigation patterns across all pages',
      priority: 'high',
      category: 'ui-ux',
      completed: false,
      estimatedTime: '4-5 hours',
      implementation: 'Create unified navigation component'
    },
    {
      id: 'ui-3',
      title: 'Role-Based UI Validation',
      description: 'Ensure UI adapts properly for different user roles',
      priority: 'medium',
      category: 'ui-ux',
      completed: false,
      estimatedTime: '3-4 hours',
      implementation: 'Add role-based component rendering logic'
    },
    // Security & Performance
    {
      id: 'sec-1',
      title: 'Security Compliance Review',
      description: 'Address security vulnerabilities and improve compliance',
      priority: 'high',
      category: 'security',
      completed: false,
      estimatedTime: '4-6 hours',
      implementation: 'Review and fix security issues identified in scan'
    },
    {
      id: 'perf-1',
      title: 'Performance Optimization',
      description: 'Optimize component rendering and bundle size',
      priority: 'medium',
      category: 'performance',
      completed: false,
      estimatedTime: '5-7 hours',
      implementation: 'Add memoization and lazy loading'
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

  return (
    <div className="space-y-6">
      <ImplementationProgressCard stats={stats} />

      <Tabs defaultValue="critical" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="critical">Critical Issues</TabsTrigger>
          <TabsTrigger value="high">High Priority</TabsTrigger>
          <TabsTrigger value="other">Other Tasks</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <ImplementationTabsContent 
          items={items}
          onToggleItem={toggleItem}
        />
      </Tabs>
    </div>
  );
};

export default ImplementationTracker;
