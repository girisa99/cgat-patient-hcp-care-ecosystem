import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestTube, Play, CheckCircle, AlertCircle } from 'lucide-react';

interface TestingConfigurationNodeProps {
  data: {
    label: string;
    config?: {
      test_type?: string;
      test_scenarios?: number;
      assertions?: number;
      timeout_seconds?: number;
      parallel_execution?: boolean;
      retry_attempts?: number;
      success_criteria?: string;
    };
  };
}

export const TestingConfigurationNode: React.FC<TestingConfigurationNodeProps> = ({ data }) => {
  const config = data.config || {};

  const testTypeColors = {
    flow_tester: 'bg-blue-500/10 text-blue-600',
    response_validator: 'bg-green-500/10 text-green-600', 
    load_tester: 'bg-purple-500/10 text-purple-600',
    debug_console: 'bg-orange-500/10 text-orange-600',
    default: 'bg-gray-500/10 text-gray-600'
  };

  const testType = config.test_type || 'flow_tester';
  const colorClass = testTypeColors[testType as keyof typeof testTypeColors] || testTypeColors.default;

  return (
    <div className="min-w-[280px]">
      <Handle type="target" position={Position.Top} />
      
      <Card className="border-2 border-purple-500/20 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <TestTube className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{data.label}</CardTitle>
              <Badge variant="secondary" className="text-xs mt-1">
                Testing
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Test Type:</span>
            <Badge className={`text-xs ${colorClass}`}>
              {testType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Scenarios:</span>
              <div className="font-medium">{config.test_scenarios || 5}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Assertions:</span>
              <div className="font-medium">{config.assertions || 10}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Timeout:</span>
              <div className="font-medium">{config.timeout_seconds || 30}s</div>
            </div>
            <div>
              <span className="text-muted-foreground">Retries:</span>
              <div className="font-medium">{config.retry_attempts || 3}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              <Play className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {config.parallel_execution ? 'Parallel' : 'Sequential'}
              </span>
            </div>
            {config.success_criteria && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span className="text-xs text-muted-foreground">{config.success_criteria}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

