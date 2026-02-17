/**
 * ENROLLMENT QUICK ACCESS
 * Navigation component for quick access to enrollment features
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnrollmentLauncher } from '@/components/global/EnrollmentLauncher';
import { MessageCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EnrollmentQuickAccessProps {
  variant?: 'nav' | 'sidebar' | 'compact';
}

export const EnrollmentQuickAccess: React.FC<EnrollmentQuickAccessProps> = ({
  variant = 'nav'
}) => {
  const navigate = useNavigate();

  if (variant === 'compact') {
    return (
      <EnrollmentLauncher variant="menu" size="sm" />
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => navigate('/enrollment-demo')}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          AI Enrollment
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-2 w-2 mr-1" />
            New
          </Badge>
        </Button>
        <EnrollmentLauncher variant="inline" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/enrollment-demo')}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Enrollment Demo
      </Button>
      <EnrollmentLauncher variant="menu" size="sm" />
    </div>
  );
};