/**
 * PAGE ENROLLMENT INTEGRATION
 * Embeds conversational enrollment options directly into existing pages
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Zap, Bot, Users, Building, UserPlus, Package } from 'lucide-react';
import { usePageAwareEnrollment } from '@/hooks/usePageAwareEnrollment';
import { useGlobalConversationalEnrollment } from '@/hooks/useGlobalConversationalEnrollment';

interface PageEnrollmentIntegrationProps {
  variant?: 'card' | 'banner' | 'inline';
  className?: string;
}

export const PageEnrollmentIntegration: React.FC<PageEnrollmentIntegrationProps> = ({
  variant = 'card',
  className = ''
}) => {
  const { currentPageConfig, getPageContext } = usePageAwareEnrollment();
  const { openEnrollment } = useGlobalConversationalEnrollment();

  // Don't show if no page-specific config
  if (!currentPageConfig) return null;

  const moduleIcons = {
    patient: Users,
    treatment_center: Building,
    customer: UserPlus,
    manufacturer: Package
  };

  const moduleColors = {
    patient: 'bg-blue-500',
    treatment_center: 'bg-green-500',
    customer: 'bg-purple-500',
    manufacturer: 'bg-orange-500'
  };

  const IconComponent = moduleIcons[currentPageConfig.moduleType];
  const colorClass = moduleColors[currentPageConfig.moduleType];

  const handleStartEnrollment = () => {
    openEnrollment(currentPageConfig.moduleType);
  };

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/20 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colorClass} text-white`}>
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{currentPageConfig.title}</h3>
              <p className="text-xs text-muted-foreground">{currentPageConfig.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Zap className="h-2 w-2 mr-1" />
              AI Powered
            </Badge>
            <Button onClick={handleStartEnrollment} size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Start AI Assistant
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-4 p-3 bg-muted/50 rounded-lg border ${className}`}>
        <div className={`p-2 rounded ${colorClass} text-white`}>
          <IconComponent className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{currentPageConfig.title}</span>
            <Badge variant="outline" className="text-xs">AI Assistant</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{currentPageConfig.description}</p>
        </div>
        <Button onClick={handleStartEnrollment} variant="outline" size="sm">
          <MessageCircle className="h-4 w-4 mr-1" />
          Launch
        </Button>
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={`border-primary/20 bg-gradient-to-br from-background to-primary/5 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colorClass} text-white`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{currentPageConfig.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{currentPageConfig.description}</p>
            </div>
          </div>
          <Badge variant="secondary">
            <Bot className="h-3 w-3 mr-1" />
            AI
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Zap className="h-3 w-3" />
            <span>Conversational • Fast • Accurate</span>
          </div>
          <Button onClick={handleStartEnrollment} className="min-w-[120px]">
            <MessageCircle className="h-4 w-4 mr-2" />
            Start Assistant
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};