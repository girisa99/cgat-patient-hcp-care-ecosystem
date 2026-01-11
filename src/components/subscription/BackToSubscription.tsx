import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackToSubscriptionProps {
  fallbackPath?: string;
  fallbackLabel?: string;
  className?: string;
}

/**
 * Smart back button that returns to subscription page if navigated from there,
 * otherwise falls back to specified path or genie-studio
 */
export const BackToSubscription = ({
  fallbackPath = '/genie-studio',
  fallbackLabel = 'Back to Studio',
  className = ''
}: BackToSubscriptionProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we came from subscription page
  const fromSubscription = (location.state as { from?: string })?.from === '/subscription';
  
  const handleBack = () => {
    if (fromSubscription) {
      navigate('/subscription');
    } else {
      navigate(fallbackPath);
    }
  };
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={`text-muted-foreground hover:text-foreground ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {fromSubscription ? 'Back to Plans' : fallbackLabel}
    </Button>
  );
};

export default BackToSubscription;
