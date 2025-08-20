import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bot, MessageCircle, Phone, Mail, Calendar, CheckCircle, 
  AlertTriangle, Users, Settings, Zap, Database, ArrowRight,
  MoreHorizontal, Plus, Edit, Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface EnhancedNodeData extends Record<string, unknown> {
  label: string;
  description: string;
  type: 'customer' | 'touchpoint' | 'decision' | 'agent' | 'action';
  
  // Enhanced data fields
  dataFields?: string[];
  connectors?: {
    id: string;
    label: string;
    type: 'input' | 'output' | 'bidirectional';
    position: Position;
    dataType?: string;
  }[];
  
  // Node-specific properties
  channel?: 'chat' | 'phone' | 'email' | 'appointment';
  automationLevel?: number;
  capabilities?: string[];
  conditions?: string[];
  persona?: string;
  
  // Configuration
  config?: Record<string, any>;
  metadata?: Record<string, any>;
}

interface EnhancedWorkflowNodeProps extends NodeProps {
  data: EnhancedNodeData;
  onEdit?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
  onConnect?: (nodeId: string, connector: any) => void;
}

export const EnhancedWorkflowNode: React.FC<EnhancedWorkflowNodeProps> = ({
  id,
  data,
  selected,
  onEdit,
  onDelete,
  onConnect
}) => {
  const [showDataFields, setShowDataFields] = useState(false);
  
  const getNodeIcon = () => {
    switch (data.type) {
      case 'customer': return <Users className="h-4 w-4" />;
      case 'touchpoint':
        if (data.channel === 'chat') return <MessageCircle className="h-4 w-4" />;
        if (data.channel === 'phone') return <Phone className="h-4 w-4" />;
        if (data.channel === 'email') return <Mail className="h-4 w-4" />;
        if (data.channel === 'appointment') return <Calendar className="h-4 w-4" />;
        return <MessageCircle className="h-4 w-4" />;
      case 'decision': return <AlertTriangle className="h-4 w-4" />;
      case 'agent': return <Bot className="h-4 w-4" />;
      case 'action': return <Zap className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getNodeColor = () => {
    switch (data.type) {
      case 'customer': return 'border-primary bg-background';
      case 'touchpoint': return 'border-accent-foreground bg-accent';
      case 'decision': return 'border-yellow-400 bg-yellow-100 dark:bg-yellow-900 dark:border-yellow-600';
      case 'agent': return 'border-green-400 bg-green-100 dark:bg-green-900 dark:border-green-600';
      case 'action': return 'border-purple-400 bg-purple-100 dark:bg-purple-900 dark:border-purple-600';
      default: return 'border-border bg-background';
    }
  };

  const renderConnectors = () => {
    const defaultConnectors = [
      { id: 'input', position: Position.Left, type: 'input' as const },
      { id: 'output', position: Position.Right, type: 'output' as const }
    ];

    const connectors = data.connectors || defaultConnectors;
    
    return connectors.map((connector) => (
      <Handle
        key={connector.id}
        id={connector.id}
        type={connector.type === 'input' ? 'target' : 'source'}
        position={connector.position}
        className="enhanced-handle"
        style={{
          width: '8px',
          height: '8px',
          backgroundColor: connector.type === 'input' ? '#10b981' : '#3b82f6'
        }}
      />
    ));
  };

  return (
    <div className={`relative min-w-[200px] max-w-[280px]`}>
      {/* Enhanced Handles/Connectors */}
      {renderConnectors()}
      
      <Card className={`shadow-md border-2 ${getNodeColor()} ${selected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-3">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-1">
              {getNodeIcon()}
              <div className="flex-1">
                <h4 className="font-semibold text-sm leading-tight">{data.label}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">
                  {data.description}
                </p>
              </div>
            </div>
            
            {/* Node Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(id)}>
                  <Edit className="h-3 w-3 mr-2" />
                  Edit Node
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDataFields(!showDataFields)}>
                  <Database className="h-3 w-3 mr-2" />
                  {showDataFields ? 'Hide' : 'Show'} Data Fields
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete Node
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Node-specific content */}
          <div className="space-y-2">
            {/* Persona for customer nodes */}
            {data.persona && (
              <Badge variant="outline" className="text-xs">{data.persona}</Badge>
            )}

            {/* Automation level for touchpoint nodes */}
            {typeof data.automationLevel === 'number' && (
              <Badge variant="secondary" className="text-xs">
                {data.automationLevel}% Automated
              </Badge>
            )}

            {/* Capabilities for agent nodes */}
            {data.capabilities && data.capabilities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {data.capabilities.slice(0, 2).map((cap, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">{cap}</Badge>
                ))}
                {data.capabilities.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{data.capabilities.length - 2} more
                  </Badge>
                )}
              </div>
            )}

            {/* Conditions for decision nodes */}
            {data.conditions && data.conditions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {data.conditions.map((condition, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">{condition}</Badge>
                ))}
              </div>
            )}

            {/* Data Fields (expandable) */}
            {showDataFields && data.dataFields && data.dataFields.length > 0 && (
              <div className="border-t pt-2 mt-2">
                <div className="flex items-center gap-1 mb-2">
                  <Database className="h-3 w-3" />
                  <span className="text-xs font-medium">Data Fields</span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {data.dataFields.map((field, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{field}</span>
                      <ArrowRight className="h-2 w-2" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Connectors Info */}
            {data.connectors && data.connectors.length > 2 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Plus className="h-2 w-2" />
                <span>{data.connectors.length} connectors</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Custom CSS for enhanced handles
const enhancedHandleStyles = `
  .enhanced-handle {
    border: 2px solid #fff;
    background: #3b82f6;
    width: 8px;
    height: 8px;
  }
  
  .enhanced-handle:hover {
    transform: scale(1.2);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
  }
  
  .enhanced-handle.input {
    background: #10b981;
  }
  
  .enhanced-handle.output {
    background: #3b82f6;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = enhancedHandleStyles;
  document.head.appendChild(styleSheet);
}