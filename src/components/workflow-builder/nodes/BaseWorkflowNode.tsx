import React from 'react';
import { Handle, Position, NodeResizer, NodeToolbar } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Copy, Edit, Trash2, Target } from 'lucide-react';
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
  resizable = true
}) => {
  return (
    <>
      {resizable && (
        <NodeResizer 
          minWidth={160} 
          minHeight={90}
          maxWidth={400}
          maxHeight={300}
          isVisible={selected}
          lineClassName="border-primary opacity-60"
          handleClassName="w-3 h-3 bg-white border-2 border-primary rounded-sm"
        />
      )}
      
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <div className="flex items-center gap-1 bg-white rounded shadow-lg border p-1">
          <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => {
            window.dispatchEvent(new CustomEvent('open-node-config', { detail: { nodeId: id } }));
          }} aria-label="Edit node">
            <Edit className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => {
            window.dispatchEvent(new CustomEvent('duplicate-node', { detail: { nodeId: id } }));
          }} aria-label="Duplicate node">
            <Copy className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" className="h-6 w-6 p-0" title="Mark as Start" onClick={() => {
            window.dispatchEvent(new CustomEvent('mark-start-node', { detail: { nodeId: id } }));
          }} aria-label="Mark as start">
            <Target className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="destructive" className="h-6 w-6 p-0" onClick={() => {
            window.dispatchEvent(new CustomEvent('delete-node', { detail: { nodeId: id } }));
          }} aria-label="Delete node">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </NodeToolbar>
      
      <div className={cn(
        "bg-white border-2 rounded-lg shadow-sm min-w-[160px] min-h-[90px] max-w-[280px]",
        "transition-all duration-200 hover:shadow-md",
        selected && "ring-2 ring-primary ring-offset-2 shadow-lg",
        className
      )}>
        {showHandles && (
          <>
            <Handle 
              type="target" 
              position={Position.Left} 
              className="w-3 h-3 !bg-primary border-2 border-white"
            />
            <Handle 
              type="target" 
              position={Position.Top} 
              className="w-3 h-3 !bg-secondary border-2 border-white"
              id="top"
            />
            <Handle 
              type="source" 
              position={Position.Right} 
              className="w-3 h-3 !bg-primary border-2 border-white"
            />
            <Handle 
              type="source" 
              position={Position.Bottom} 
              className="w-3 h-3 !bg-secondary border-2 border-white"
              id="bottom"
            />
          </>
        )}
        
        {/* Header */}
        <div className="p-2 border-b bg-muted/20 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Icon className="h-3 w-3 text-primary flex-shrink-0" />
            <h3 className="font-medium text-xs truncate flex-1">{title}</h3>
            {data?.status && (
              <div className={cn(
                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                data.status === 'active' ? 'bg-green-500' : 
                data.status === 'error' ? 'bg-red-500' : 'bg-gray-300'
              )} />
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-2 text-xs">
          {children}
        </div>
      </div>
    </>
  );
};