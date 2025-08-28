import React, { useState } from 'react';
import { Handle, Position, NodeProps, NodeToolbar } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, Copy, Trash2, Info, ChevronDown, ChevronUp, 
  Bot, Database, Brain, Zap, Eye, Link, Grid3X3, 
  Wrench, FileText, MessageSquare, Filter, Workflow, 
  GitBranch, Shield, Heart, Sparkles, Search, Terminal,
  MessageCircle, Code, Cloud, Globe, Building, Flame,
  Twitter, Layers, Edit, Table, List, CheckCircle,
  Download, Upload, Scissors, Hash, StickyNote, Route,
  UserCheck, Pill, Stethoscope, ShieldCheck, Activity
} from 'lucide-react';

const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'bot': Bot,
    'database': Database,
    'brain': Brain,
    'zap': Zap,
    'eye': Eye,
    'link': Link,
    'grid-3x3': Grid3X3,
    'wrench': Wrench,
    'file-text': FileText,
    'message-square': MessageSquare,
    'filter': Filter,
    'workflow': Workflow,
    'settings': Settings,
    'git-branch': GitBranch,
    'shield': Shield,
    'heart': Heart,
    'sparkles': Sparkles,
    'search': Search,
    'terminal': Terminal,
    'message-circle': MessageCircle,
    'code': Code,
    'cloud': Cloud,
    'globe': Globe,
    'building': Building,
    'flame': Flame,
    'twitter': Twitter,
    'layers': Layers,
    'edit': Edit,
    'table': Table,
    'list': List,
    'check-circle': CheckCircle,
    'download': Download,
    'upload': Upload,
    'scissors': Scissors,
    'hash': Hash,
    'sticky-note': StickyNote,
    'route': Route,
    'user-check': UserCheck,
    'pill': Pill,
    'stethoscope': Stethoscope,
    'shield-check': ShieldCheck,
    'activity': Activity,
  };
  
  return iconMap[iconName] || Settings;
};

export interface EnhancedNodeData extends Record<string, unknown> {
  label: string;
  type_key?: string;
  display_name?: string;
  description?: string;
  icon?: string;
  color?: string;
  capabilities?: string[];
  requirements?: Record<string, any>;
  default_config?: Record<string, any>;
  category?: any;
  isWorkflowNode?: boolean;
}

interface EnhancedWorkflowNodeProps extends NodeProps {
  data: EnhancedNodeData;
}

export const EnhancedWorkflowNode: React.FC<EnhancedWorkflowNodeProps> = ({
  id,
  data,
  selected
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nodeLabel, setNodeLabel] = useState(data.display_name || data.label || 'Node');

  const IconComponent = getIconComponent(data.icon || 'settings');
  const nodeColor = data.color || '#6366f1';
  const capabilities = data.capabilities || [];
  const requirements = data.requirements || {};

  const handleSaveLabel = (newLabel: string) => {
    setNodeLabel(newLabel);
    setIsEditing(false);
    // Here you would typically update the node in the parent component
  };

  return (
    <div 
      className={`
        relative bg-white rounded-lg border-2 shadow-lg min-w-[200px] max-w-[300px]
        transition-all duration-200 hover:shadow-xl
        ${selected ? 'border-primary shadow-primary/20' : 'border-border hover:border-primary/50'}
      `}
      style={{ 
        borderColor: selected ? nodeColor : undefined,
        boxShadow: selected ? `0 0 0 2px ${nodeColor}20` : undefined
      }}
    >
      {/* Node Toolbar */}
      {selected && (
        <NodeToolbar isVisible position={Position.Top} className="flex gap-1">
          <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => {
            window.dispatchEvent(new CustomEvent('duplicate-node', { detail: { nodeId: id } }));
          }} aria-label="Duplicate node">
            <Copy className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => {
            window.dispatchEvent(new CustomEvent('open-node-config', { detail: { nodeId: id } }));
          }} aria-label="Open configuration">
            <Settings className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => {
            window.dispatchEvent(new CustomEvent('delete-node', { detail: { nodeId: id } }));
          }} aria-label="Delete node">
            <Trash2 className="h-3 w-3" />
          </Button>
        </NodeToolbar>
      )}

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 border-2 border-white"
        style={{ backgroundColor: nodeColor }}
      />

      {/* Enhanced Node Visual State Display */}
      <div className="p-3">
        {/* Header with Configuration Status */}
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="p-1.5 rounded-md flex-shrink-0 relative"
            style={{ 
              backgroundColor: `${nodeColor}15`, 
              color: nodeColor,
              border: `1px solid ${nodeColor}30`
            }}
          >
            <IconComponent className="h-4 w-4" />
            {/* Configuration Status Indicator */}
            {data.isConfigured && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white" title="Configured" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={nodeLabel}
                onChange={(e) => setNodeLabel(e.target.value)}
                onBlur={() => handleSaveLabel(nodeLabel)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveLabel(nodeLabel);
                  } else if (e.key === 'Escape') {
                    setNodeLabel(data.display_name || data.label || 'Node');
                    setIsEditing(false);
                  }
                }}
                className="text-sm font-semibold bg-transparent border-none outline-none w-full"
                autoFocus
              />
            ) : (
              <h3 
                className="text-sm font-semibold text-foreground cursor-pointer hover:text-primary"
                onClick={() => setIsEditing(true)}
                title="Click to edit"
              >
                {nodeLabel}
              </h3>
            )}
          </div>

          {capabilities.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>

        {/* Description */}
        {data.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {data.description}
          </p>
        )}

        {/* Top 3 Capabilities - Always Visible */}
        {capabilities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {capabilities.slice(0, 3).map((capability, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-1.5 py-0.5 font-normal"
                style={{ 
                  backgroundColor: `${nodeColor}10`, 
                  color: nodeColor,
                  border: `1px solid ${nodeColor}20`
                }}
              >
                {capability.replace(/_/g, ' ')}
              </Badge>
            ))}
            {capabilities.length > 3 && !isExpanded && (
              <Badge 
                variant="outline" 
                className="text-xs px-1.5 py-0.5 cursor-pointer"
                onClick={() => setIsExpanded(true)}
                style={{ borderColor: `${nodeColor}30`, color: nodeColor }}
              >
                +{capabilities.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Configuration Summary */}
        {data.configuration && Object.keys(data.configuration).length > 0 && (
          <div className="mt-2 p-2 bg-muted/30 rounded border">
            <div className="text-xs font-medium text-foreground mb-1">Configuration:</div>
            <div className="space-y-1">
              {Object.entries(data.configuration).slice(0, 2).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground truncate">{key}:</span>
                  <span className="font-mono text-xs truncate max-w-[100px]" title={String(value)}>
                    {String(value).length > 15 ? `${String(value).slice(0, 15)}...` : String(value)}
                  </span>
                </div>
              ))}
              {Object.keys(data.configuration).length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{Object.keys(data.configuration).length - 2} more settings
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-2 border-t border-border pt-2 animate-in slide-in-from-top-1">
            {/* All Capabilities */}
            {capabilities.length > 3 && (
              <div>
                <div className="text-xs font-medium text-foreground mb-1">All Features:</div>
                <div className="flex flex-wrap gap-1">
                  {capabilities.slice(3).map((capability, index) => (
                    <Badge 
                      key={index + 3} 
                      variant="outline" 
                      className="text-xs px-1.5 py-0.5 font-normal"
                      style={{ 
                        borderColor: `${nodeColor}30`, 
                        color: nodeColor 
                      }}
                    >
                      {capability.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {Object.keys(requirements).length > 0 && (
              <div>
                <div className="text-xs font-medium text-foreground mb-1">Requirements:</div>
                <div className="space-y-1">
                  {Object.entries(requirements).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">{key.replace(/_/g, ' ')}:</span>
                      <Badge 
                        variant={String(value) === 'true' || String(value) === 'required' ? 'destructive' : 'secondary'} 
                        className="text-xs"
                      >
                        {String(value)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Info */}
            {data.category && (
              <div className="text-xs text-muted-foreground">
                Category: <span className="font-medium">{data.category.display_name || data.category.name}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 border-2 border-white"
        style={{ backgroundColor: nodeColor }}
      />

      {/* Connection Indicator */}
      {data.isWorkflowNode && (
        <div 
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
          style={{ backgroundColor: nodeColor }}
          title="Workflow Node"
        />
      )}
    </div>
  );
};