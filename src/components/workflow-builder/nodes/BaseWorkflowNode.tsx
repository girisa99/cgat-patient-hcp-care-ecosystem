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
          minWidth={140} 
          minHeight={60}
          maxWidth={280}
          maxHeight={200}
          isVisible={selected}
          lineClassName="border-primary/50"
          handleClassName="w-2 h-2 bg-background border border-primary rounded-sm"
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
          "bg-card border rounded-lg shadow-sm min-w-[140px] min-h-[60px] max-w-[200px]",
          "transition-all duration-200 ease-out",
          "hover:shadow-md hover:-translate-y-0.5",
          selected && "ring-2 ring-primary/40 ring-offset-1 ring-offset-background shadow-lg",
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
              className="!w-2.5 !h-2.5 !bg-primary !border !border-background !-left-1 transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
            />
            <Handle 
              type="target" 
              position={Position.Top} 
              className="!w-2.5 !h-2.5 !bg-secondary !border !border-background !-top-1 transition-transform hover:scale-110"
              id="top"
            />
            <Handle 
              type="source" 
              position={Position.Right} 
              className="!w-2.5 !h-2.5 !bg-primary !border !border-background !-right-1 transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
            />
            <Handle 
              type="source" 
              position={Position.Bottom} 
              className="!w-2.5 !h-2.5 !bg-secondary !border !border-background !-bottom-1 transition-transform hover:scale-110"
              id="bottom"
            />
          </>
        )}
        
        {/* Compact Header */}
        <div 
          className="px-2 py-1.5 border-b border-border/40 rounded-t-lg relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${color}08 0%, transparent 100%)` }}
        >
          <div 
            className="absolute top-0 left-0 w-0.5 h-full rounded-tl-lg"
            style={{ backgroundColor: color }}
          />
          <div className="flex items-center gap-1.5 pl-1">
            <div 
              className="p-1 rounded"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon className="h-3 w-3 text-primary" />
            </div>
            <h3 className="font-medium text-[10px] text-foreground truncate flex-1">{title}</h3>
            {data?.status && (
              <div className={cn(
                "w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse",
                data.status === 'active' ? 'bg-emerald-500' : 
                data.status === 'running' ? 'bg-amber-500' :
                data.status === 'error' ? 'bg-destructive' : 'bg-muted-foreground/30'
              )} />
            )}
          </div>
        </div>
        
        {/* Content with Intent */}
        <div className="p-2 text-[10px] text-muted-foreground space-y-1">
          {data?.intent && (
            <p className="text-[9px] italic text-primary/70 truncate">{data.intent}</p>
          )}
          {children}
        </div>
      </div>
    </>
  );
};