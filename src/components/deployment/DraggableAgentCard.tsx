import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDraggable } from '@dnd-kit/core';
import { 
  Bot, 
  GripVertical, 
  Settings, 
  Play, 
  Pause, 
  MoreHorizontal,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react';
import { AgentSession } from '@/types/agent-session';

interface DraggableAgentCardProps {
  agent: AgentSession;
  isDeployed?: boolean;
  deploymentChannel?: string;
  metrics?: {
    responseTime: number;
    successRate: number;
    requestsToday: number;
  };
  onConfigure?: () => void;
  onToggleStatus?: () => void;
}

export const DraggableAgentCard: React.FC<DraggableAgentCardProps> = ({
  agent,
  isDeployed = false,
  deploymentChannel,
  metrics,
  onConfigure,
  onToggleStatus
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: agent.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const getStatusColor = (status: AgentSession['status']) => {
    switch (status) {
      case 'deployed': return 'bg-green-100 text-green-800';
      case 'ready_to_deploy': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: AgentSession['status']) => {
    switch (status) {
      case 'deployed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'ready_to_deploy': return <Play className="h-4 w-4 text-blue-600" />;
      case 'in_progress': return <Activity className="h-4 w-4 text-yellow-600" />;
      default: return <Pause className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`
        transition-all duration-200 cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50 rotate-3 scale-105 shadow-xl z-50' : 'hover:shadow-md'}
        ${isDeployed ? 'ring-1 ring-green-200' : ''}
      `}
      {...attributes}
      {...listeners}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">{agent.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(agent.status)}
                <Badge className={getStatusColor(agent.status)} variant="secondary">
                  {agent.status.replace('_', ' ')}
                </Badge>
                {deploymentChannel && (
                  <Badge variant="outline" className="text-xs">
                    {deploymentChannel}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Handle more options
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        {agent.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {agent.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Agent Type & Use Case */}
        <div className="space-y-2">
          {agent.basic_info?.agent_type && (
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="text-sm font-medium">{agent.basic_info.agent_type}</p>
            </div>
          )}
          {agent.basic_info?.use_case && (
            <div>
              <p className="text-xs text-muted-foreground">Use Case</p>
              <p className="text-sm">{agent.basic_info.use_case}</p>
            </div>
          )}
        </div>

        {/* Deployment Metrics (if deployed) */}
        {isDeployed && metrics && (
          <div className="border-t pt-3 space-y-2">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <p className="text-muted-foreground">Response</p>
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="font-medium">{metrics.responseTime}ms</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Success</p>
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="font-medium">{metrics.successRate}%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Today</p>
                <div className="flex items-center justify-center gap-1">
                  <Activity className="h-3 w-3 text-blue-600" />
                  <span className="font-medium">{metrics.requestsToday}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories/Topics */}
        {agent.basic_info?.categories && agent.basic_info.categories.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Categories</p>
            <div className="flex flex-wrap gap-1">
              {agent.basic_info.categories.slice(0, 2).map((category, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
              {agent.basic_info.categories.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{agent.basic_info.categories.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          {onConfigure && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onConfigure();
              }}
              className="flex-1 gap-1 text-xs"
            >
              <Settings className="h-3 w-3" />
              Configure
            </Button>
          )}
          {onToggleStatus && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus();
              }}
              className="flex-1 gap-1 text-xs"
            >
              {isDeployed ? (
                <>
                  <Pause className="h-3 w-3" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  Deploy
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};