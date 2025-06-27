
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Target,
  Zap,
  Shield,
  Palette,
  Code,
  Database
} from 'lucide-react';

interface ImplementationItem {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'accessibility' | 'ui-ux' | 'security' | 'performance' | 'code-quality';
  completed: boolean;
  estimatedTime: string;
  implementation: string;
}

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

  const getProgress = () => {
    const completed = items.filter(item => item.completed).length;
    return Math.round((completed / items.length) * 100);
  };

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const criticalItems = items.filter(item => item.priority === 'critical');
  const highPriorityItems = items.filter(item => item.priority === 'high');
  const otherItems = items.filter(item => !['critical', 'high'].includes(item.priority));

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Implementation Progress
          </CardTitle>
          <CardDescription>
            Track your progress implementing verification recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{getProgress()}% Complete</span>
            </div>
            <Progress value={getProgress()} className="w-full" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-red-600">{criticalItems.filter(i => !i.completed).length}</div>
                <div className="text-xs text-muted-foreground">Critical</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{highPriorityItems.filter(i => !i.completed).length}</div>
                <div className="text-xs text-muted-foreground">High Priority</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{items.filter(i => i.completed).length}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Tasks */}
      <Tabs defaultValue="critical" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="critical">Critical Issues</TabsTrigger>
          <TabsTrigger value="high">High Priority</TabsTrigger>
          <TabsTrigger value="other">Other Tasks</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="critical" className="space-y-4">
          <div className="space-y-3">
            {criticalItems.map((item) => {
              const IconComponent = getCategoryIcon(item.category);
              return (
                <Card key={item.id} className="border-red-200 bg-red-50/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={getPriorityColor(item.priority) as any}>
                              {item.priority}
                            </Badge>
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {item.estimatedTime}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <div className="bg-white/60 p-3 rounded border">
                          <p className="text-xs font-medium text-blue-700">Implementation:</p>
                          <p className="text-xs text-gray-600 mt-1">{item.implementation}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="high" className="space-y-4">
          <div className="space-y-3">
            {highPriorityItems.map((item) => {
              const IconComponent = getCategoryIcon(item.category);
              return (
                <Card key={item.id} className="border-orange-200 bg-orange-50/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={getPriorityColor(item.priority) as any}>
                              {item.priority}
                            </Badge>
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {item.estimatedTime}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <div className="bg-white/60 p-3 rounded border">
                          <p className="text-xs font-medium text-blue-700">Implementation:</p>
                          <p className="text-xs text-gray-600 mt-1">{item.implementation}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          <div className="space-y-3">
            {otherItems.map((item) => {
              const IconComponent = getCategoryIcon(item.category);
              return (
                <Card key={item.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={getPriorityColor(item.priority) as any}>
                              {item.priority}
                            </Badge>
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {item.estimatedTime}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <div className="bg-gray-50 p-3 rounded border">
                          <p className="text-xs font-medium text-blue-700">Implementation:</p>
                          <p className="text-xs text-gray-600 mt-1">{item.implementation}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="space-y-3">
            {items.filter(item => item.completed).map((item) => {
              const IconComponent = getCategoryIcon(item.category);
              return (
                <Card key={item.id} className="border-green-200 bg-green-50/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
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
                  </CardContent>
                </Card>
              );
            })}
            {items.filter(item => item.completed).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No completed tasks yet. Start with the critical issues!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImplementationTracker;
