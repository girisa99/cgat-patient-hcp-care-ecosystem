/**
 * ENROLLMENT LAUNCHER
 * Context-aware floating action button that shows relevant enrollment options
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MessageCircle, Users, Building, Package, UserPlus, Plus, Zap } from 'lucide-react';
import { useGlobalConversationalEnrollment } from '@/hooks/useGlobalConversationalEnrollment';
import { usePageAwareEnrollment } from '@/hooks/usePageAwareEnrollment';

interface EnrollmentLauncherProps {
  variant?: 'floating' | 'inline' | 'menu';
  size?: 'sm' | 'md' | 'lg';
  showAllOptions?: boolean;
  forceModule?: 'patient' | 'treatment_center' | 'customer' | 'manufacturer';
}

export const EnrollmentLauncher: React.FC<EnrollmentLauncherProps> = ({
  variant = 'floating',
  size = 'md',
  showAllOptions = false,
  forceModule
}) => {
  const { openEnrollment } = useGlobalConversationalEnrollment();
  const { getAvailableModules, pageContext } = usePageAwareEnrollment();
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine which modules to show
  const availableModules = forceModule 
    ? [forceModule] 
    : showAllOptions 
    ? ['patient', 'treatment_center', 'customer', 'manufacturer'] as const
    : getAvailableModules();

  const allEnrollmentOptions = [
    {
      type: 'patient' as const,
      title: 'Patient Enrollment',
      description: 'Complete patient intake and enrollment',
      icon: Users,
      color: 'bg-blue-500',
      badge: 'Medical'
    },
    {
      type: 'treatment_center' as const,
      title: 'Treatment Center',
      description: 'Register your treatment facility',
      icon: Building,
      color: 'bg-green-500',
      badge: 'Healthcare'
    },
    {
      type: 'customer' as const,
      title: 'Customer Registration',
      description: 'Join our platform',
      icon: UserPlus,
      color: 'bg-purple-500',
      badge: 'Business'
    },
    {
      type: 'manufacturer' as const,
      title: 'Manufacturer',
      description: 'Register your manufacturing company',
      icon: Package,
      color: 'bg-orange-500',
      badge: 'Industrial'
    }
  ];

  // Filter options based on available modules
  const enrollmentOptions = allEnrollmentOptions.filter(option => 
    availableModules.includes(option.type)
  );

  // If only one option, simplify the experience
  const isSingleOption = enrollmentOptions.length === 1;
  const singleOption = enrollmentOptions[0];

  // Get page-specific title if available
  const getContextualTitle = () => {
    if (pageContext.isPageSpecific && pageContext.config) {
      return pageContext.config.title;
    }
    return isSingleOption ? singleOption.title : 'AI Enrollment';
  };

  // Floating Action Button Style
  if (variant === 'floating') {
    // Don't show floating button if there are no relevant modules
    if (enrollmentOptions.length === 0) {
      return null;
    }

    // If single option, show simplified floating button
    if (isSingleOption) {
      return (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            className={`rounded-full shadow-lg hover:shadow-xl transition-all duration-200 min-w-[180px] h-[60px] ${singleOption.color} text-white`}
            onClick={() => openEnrollment(singleOption.type)}
          >
            <singleOption.icon className="h-5 w-5 mr-2" />
            {singleOption.title}
            <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-white/30">
              <Zap className="h-2 w-2 mr-1" />
              AI
            </Badge>
          </Button>
        </div>
      );
    }

    // Multiple options - expandable floating button
    return (
      <div className="fixed bottom-6 right-6 z-50">
        {isExpanded && (
          <div className="mb-4 space-y-2 max-w-xs">
            {enrollmentOptions.map((option) => (
              <Card 
                key={option.type}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                onClick={() => {
                  openEnrollment(option.type);
                  setIsExpanded(false);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${option.color} text-white`}>
                      <option.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{option.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          <Zap className="h-2 w-2 mr-1" />
                          AI
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <Button
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 min-w-[60px] h-[60px]"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <MessageCircle className="h-6 w-6" />
          {isExpanded && <Plus className="h-4 w-4 ml-2 rotate-45" />}
        </Button>
      </div>
    );
  }

  // Dropdown Menu Style
  if (variant === 'menu') {
    if (enrollmentOptions.length === 0) return null;

    // Single option - direct button
    if (isSingleOption) {
      return (
        <Button 
          variant="outline" 
          size={size === 'sm' ? 'sm' : 'default'}
          onClick={() => openEnrollment(singleOption.type)}
        >
          <singleOption.icon className="h-4 w-4 mr-2" />
          {getContextualTitle()}
          <Badge variant="secondary" className="ml-2">
            <Zap className="h-2 w-2 mr-1" />
            AI
          </Badge>
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size={size === 'sm' ? 'sm' : 'default'}>
            <MessageCircle className="h-4 w-4 mr-2" />
            {getContextualTitle()}
            <Badge variant="secondary" className="ml-2">
              <Zap className="h-2 w-2 mr-1" />
              AI
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {enrollmentOptions.map((option) => (
            <DropdownMenuItem 
              key={option.type}
              onClick={() => openEnrollment(option.type)}
              className="cursor-pointer p-3"
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`p-1.5 rounded ${option.color} text-white`}>
                  <option.icon className="h-3 w-3" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{option.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {option.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Inline Style
  if (enrollmentOptions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        No enrollment options available for this page.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">{getContextualTitle()}</h3>
        <Badge variant="default">
          <Zap className="h-3 w-3 mr-1" />
          Available
        </Badge>
      </div>
      
      <div className={`grid gap-4 ${
        enrollmentOptions.length === 1 
          ? 'grid-cols-1 max-w-md' 
          : enrollmentOptions.length === 2 
          ? 'grid-cols-1 md:grid-cols-2' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      }`}>
        {enrollmentOptions.map((option) => (
          <Card 
            key={option.type}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            onClick={() => openEnrollment(option.type)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${option.color} text-white`}>
                  <option.icon className="h-5 w-5" />
                </div>
                <Badge variant="secondary">{option.badge}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardTitle className="text-base mb-1">{option.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{option.description}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                <Zap className="h-3 w-3" />
                <span>AI Conversation Available</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};