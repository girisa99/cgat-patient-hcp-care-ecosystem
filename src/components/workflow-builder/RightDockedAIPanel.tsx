import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight, Brain } from 'lucide-react';
import { AIWorkflowPrompt } from './AIWorkflowPrompt';

interface RightDockedAIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkflowGenerated: (workflow: any) => void;
  className?: string;
}

export const RightDockedAIPanel: React.FC<RightDockedAIPanelProps> = ({
  isOpen,
  onClose,
  onWorkflowGenerated,
  className = ""
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed top-0 right-0 h-screen bg-background border-l shadow-lg z-[100] flex ${
        isCollapsed ? 'w-12' : 'w-80 md:w-96'
      } transition-all duration-300 ${className}`}
    >
      {/* Collapse/Expand Button */}
      <div className="flex flex-col justify-between border-r bg-muted/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-10 w-10 p-0 rounded-none border-b"
        >
          {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
        
        {isCollapsed && (
          <div className="flex flex-col gap-2 p-2">
            <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
              <Brain className="h-3 w-3 text-primary" />
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      {!isCollapsed && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-3 border-b bg-background flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI Workflow Assistant
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <AIWorkflowPrompt 
              onWorkflowGenerated={onWorkflowGenerated}
              className="h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};