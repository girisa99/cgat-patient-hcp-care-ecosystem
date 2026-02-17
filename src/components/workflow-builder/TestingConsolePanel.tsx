import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal } from 'lucide-react';
import { UnifiedTestingInterface } from '@/components/testing/UnifiedTestingInterface';

interface TestingConsolePanelProps {
  isVisible: boolean;
  onToggle: () => void;
  sessionId?: string;
  selectedNode?: any;
  workflowNodes?: any[];
  workflowEdges?: any[];
  heightClass?: string;
}

export const TestingConsolePanel: React.FC<TestingConsolePanelProps> = ({
  isVisible,
  onToggle,
  sessionId,
  selectedNode,
  workflowNodes = [],
  workflowEdges = [],
  heightClass
}) => {
  const handleAgentGenerated = (agent: any) => {
    // Handle generated agent for testing
    console.log('Agent generated for testing:', agent);
  };

  if (!isVisible) return null;

  return (
    <Card className={`w-full ${heightClass || 'h-96'} border-t-2 border-primary/20 bg-background/95 backdrop-blur`}>
      <CardHeader className="p-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Terminal className="h-4 w-4" />
            Advanced Testing Console
          </CardTitle>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onToggle}
            className="h-7 text-xs"
          >
            Close
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3 flex-1">
        <UnifiedTestingInterface
          workflowNodes={workflowNodes}
          workflowEdges={workflowEdges}
          selectedNode={selectedNode}
          onAgentGenerated={handleAgentGenerated}
        />
      </CardContent>
    </Card>
  );
};