/**
 * ENROLLMENT LAUNCHER
 * Floating action button or menu to launch conversational enrollment from any page
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MessageCircle, Users, Building, Package, UserPlus, Plus, Zap } from 'lucide-react';
import { useGlobalConversationalEnrollment } from '@/hooks/useGlobalConversationalEnrollment';

interface EnrollmentLauncherProps {
  variant?: 'floating' | 'inline' | 'menu';
  size?: 'sm' | 'md' | 'lg';
  showAllOptions?: boolean;
}

export const EnrollmentLauncher: React.FC<EnrollmentLauncherProps> = ({
  variant = 'floating',
  size = 'md',
  showAllOptions = true
}) => {
  const { openEnrollment } = useGlobalConversationalEnrollment();
  const [isExpanded, setIsExpanded] = useState(false);

  const enrollmentOptions = [
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

  // Floating Action Button Style
  if (variant === 'floating') {
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
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size={size === 'sm' ? 'sm' : 'default'}>
            <MessageCircle className="h-4 w-4 mr-2" />
            AI Enrollment
            <Badge variant="secondary" className="ml-2">
              <Zap className="h-2 w-2 mr-1" />
              New
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
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI-Powered Enrollment</h3>
        <Badge variant="default">
          <Zap className="h-3 w-3 mr-1" />
          Available
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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