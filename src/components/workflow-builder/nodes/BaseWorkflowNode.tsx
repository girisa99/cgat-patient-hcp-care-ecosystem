import React from 'react';
import { Handle, Position, NodeResizer, NodeToolbar } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Copy, Edit, Trash2, Target, Play, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BaseWorkflowNodeProps {
  id: string;
  data: any;
  selected: boolean;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  className?: string;
  children: React.ReactNode;
  showHandles?: boolean;
  resizable?: boolean;
  categoryColor?: string;
}

export const BaseWorkflowNode: React.FC<BaseWorkflowNodeProps> = ({
  id,
  data,
  selected,
  icon: Icon,
  title,
  className = '',
  children,
  showHandles = true,
  resizable = true,
  categoryColor
}) => {
  const color = categoryColor || data?.color || 'hsl(var(--primary))';
  
  return (
    <>
      {resizable && (
        <NodeResizer 
          minWidth={180} 
          minHeight={100}
          maxWidth={420}
          maxHeight={350}
          isVisible={selected}
          lineClassName="border-primary/60"
          handleClassName="w-2.5 h-2.5 bg-background border-2 border-primary rounded-sm shadow-sm"
        />
      )}
      
      <NodeToolbar isVisible={selected} position={Position.Top} className="animate-fade-in">
        <div className="flex items-center gap-1 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border/50 p-1">
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-colors" 
            onClick={() => window.dispatchEvent(new CustomEvent('open-node-config', { detail: { nodeId: id } }))} 
            aria-label="Edit node"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-colors" 
            onClick={() => window.dispatchEvent(new CustomEvent('duplicate-node', { detail: { nodeId: id } }))} 
            aria-label="Duplicate node"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 w-7 p-0 hover:bg-accent hover:text-accent-foreground transition-colors" 
            onClick={() => window.dispatchEvent(new CustomEvent('test-node', { detail: { nodeId: id } }))} 
            aria-label="Test node"
          >
            <Play className="h-3.5 w-3.5" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 w-7 p-0 hover:bg-secondary hover:text-secondary-foreground transition-colors" 
            onClick={() => window.dispatchEvent(new CustomEvent('mark-start-node', { detail: { nodeId: id } }))} 
            aria-label="Mark as start"
          >
            <Target className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-5 bg-border mx-0.5" />
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors" 
            onClick={() => window.dispatchEvent(new CustomEvent('delete-node', { detail: { nodeId: id } }))} 
            aria-label="Delete node"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </NodeToolbar>
      
      <div 
        className={cn(
          "bg-card border-2 rounded-xl shadow-sm min-w-[180px] min-h-[100px] max-w-[300px]",
          "transition-all duration-300 ease-out",
          "hover:shadow-lg hover:-translate-y-0.5",
          selected && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background shadow-xl scale-[1.02]",
          className
        )}
        style={{ 
          borderColor: selected ? color : 'hsl(var(--border))',
          '--node-color': color 
        } as React.CSSProperties}
      >
        {showHandles && (
          <>
            <Handle 
              type="target" 
              position={Position.Left} 
              className="!w-3 !h-3 !bg-primary !border-2 !border-background !-left-1.5 transition-transform hover:scale-125"
              style={{ backgroundColor: color }}
            />
            <Handle 
              type="target" 
              position={Position.Top} 
              className="!w-3 !h-3 !bg-secondary !border-2 !border-background !-top-1.5 transition-transform hover:scale-125"
              id="top"
            />
            <Handle 
              type="source" 
              position={Position.Right} 
              className="!w-3 !h-3 !bg-primary !border-2 !border-background !-right-1.5 transition-transform hover:scale-125"
              style={{ backgroundColor: color }}
            />
            <Handle 
              type="source" 
              position={Position.Bottom} 
              className="!w-3 !h-3 !bg-secondary !border-2 !border-background !-bottom-1.5 transition-transform hover:scale-125"
              id="bottom"
            />
          </>
        )}
        
        {/* Header with gradient accent */}
        <div 
          className="px-3 py-2 border-b border-border/50 rounded-t-xl relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${color}10 0%, transparent 100%)` }}
        >
        <div 
          className="absolute top-0 left-0 w-1 h-full rounded-tl-xl"
          style={{ backgroundColor: color }}
        />
          <div className="flex items-center gap-2 pl-2">
            <div 
              className="p-1.5 rounded-md"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="h-3.5 w-3.5 text-primary" />
            </div>
            <h3 className="font-semibold text-xs text-foreground truncate flex-1">{title}</h3>
            {data?.status && (
              <div className={cn(
                "w-2 h-2 rounded-full flex-shrink-0 animate-pulse",
                data.status === 'active' ? 'bg-emerald-500' : 
                data.status === 'running' ? 'bg-amber-500' :
                data.status === 'error' ? 'bg-destructive' : 'bg-muted-foreground/30'
              )} />
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-3 text-xs text-muted-foreground">
          {children}
        </div>
      </div>
    </>
  );
};