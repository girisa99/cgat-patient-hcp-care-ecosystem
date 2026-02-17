import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, TestTube, Zap } from 'lucide-react';
import { useGlobalAgentGenerator } from '@/hooks/useGlobalAgentGenerator';

interface QuickAgentGeneratorButtonProps {
  purpose?: string;
  prefillPrompt?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export const QuickAgentGeneratorButton: React.FC<QuickAgentGeneratorButtonProps> = ({
  purpose = 'Workflow Testing',
  prefillPrompt,
  variant = 'outline',
  size = 'sm',
  className = '',
  children
}) => {
  const { openGenerator } = useGlobalAgentGenerator();

  const handleClick = () => {
    openGenerator({ purpose, prefillPrompt });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`gap-2 ${className}`}
    >
      <Sparkles className="h-4 w-4" />
      {children || (
        <>
          Generate Test Agent
          <TestTube className="h-3 w-3" />
        </>
      )}
    </Button>
  );
};