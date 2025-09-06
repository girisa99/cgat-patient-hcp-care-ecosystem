import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Zap, Users, Activity, Brain, Grid, Move, 
  RotateCw, Download, Upload, Settings, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { unifiedFlowIntegrator, FlowEvent, VisualChange } from '@/services/integration/UnifiedFlowIntegrator';
import { AnimatedNode, AnimatedConnection, flowAnimations } from '@/components/animations/FlowAnimations';

interface RealTimeVisualBuilderProps {
  sessionId: string;
  userId?: string;
  onAIPrompt?: (prompt: string) => void;
  onTemplateUpdate?: (templateId: string, changes: any) => void;
}

interface VisualNode {
  id: string;
  type: 'ai' | 'template' | 'action' | 'decision';
  position: { x: number; y: number };
  data: any;
  isActive?: boolean;
  lastUpdated?: string;
  updatedBy?: string;
}

interface CollaboratorCursor {
  userId: string;
  userName: string;
  position: { x: number; y: number };
  color: string;
}

export const RealTimeVisualBuilder: React.FC<RealTimeVisualBuilderProps> = ({
  sessionId,
  userId,
  onAIPrompt,
  onTemplateUpdate
}) => {
  const [nodes, setNodes] = useState<VisualNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<VisualNode | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [collaborators, setCollaborators] = useState<CollaboratorCursor[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);
  const [gridEnabled, setGridEnabled] = useState(true);

  // Real-time integration
  useEffect(() => {
    if (!realtimeEnabled) return;

    const unsubscribers = [
      // Subscribe to AI prompt events
      unifiedFlowIntegrator.subscribe('ai_prompt', (event: FlowEvent) => {
        if (event.sessionId === sessionId) {
          handleAIPromptEvent(event);
        }
      }),

      // Subscribe to template updates
      unifiedFlowIntegrator.subscribe('template_update', (event: FlowEvent) => {
        if (event.sessionId === sessionId) {
          handleTemplateUpdateEvent(event);
        }
      }),

      // Subscribe to visual changes from other users
      unifiedFlowIntegrator.subscribe('visual_change', (event: FlowEvent) => {
        if (event.sessionId === sessionId && event.userId !== userId) {
          handleRemoteVisualChange(event);
        }
      })
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [sessionId, userId, realtimeEnabled]);

  const handleAIPromptEvent = useCallback((event: FlowEvent) => {
    console.log('AI Prompt Event received:', event);
    // Create visual indicator for AI processing
    const aiNode: VisualNode = {
      id: `ai-${event.id}`,
      type: 'ai',
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      data: { 
        prompt: event.data.prompt,
        status: 'processing',
        createdAt: event.timestamp
      },
      isActive: true,
      lastUpdated: event.timestamp,
      updatedBy: event.userId
    };

    setNodes(prev => [...prev, aiNode]);
  }, []);

  const handleTemplateUpdateEvent = useCallback((event: FlowEvent) => {
    console.log('Template Update Event received:', event);
    const templateUpdate = event.data;
    
    // Update existing AI node or create template node
    setNodes(prev => prev.map(node => {
      if (node.type === 'ai' && node.data.prompt === templateUpdate.aiPrompt) {
        return {
          ...node,
          data: { ...node.data, status: 'completed', template: templateUpdate },
          isActive: false,
          lastUpdated: event.timestamp
        };
      }
      return node;
    }));

    // Create template visualization node
    const templateNode: VisualNode = {
      id: `template-${templateUpdate.templateId}`,
      type: 'template',
      position: { x: Math.random() * 400 + 200, y: Math.random() * 300 + 100 },
      data: {
        templateId: templateUpdate.templateId,
        changes: templateUpdate.changes,
        triggeredBy: templateUpdate.triggeredBy
      },
      lastUpdated: event.timestamp,
      updatedBy: event.userId
    };

    setNodes(prev => [...prev, templateNode]);
    onTemplateUpdate?.(templateUpdate.templateId, templateUpdate.changes);
  }, [onTemplateUpdate]);

  const handleRemoteVisualChange = useCallback((event: FlowEvent) => {
    const change: VisualChange = event.data;
    
    switch (change.action) {
      case 'create':
        const newNode: VisualNode = {
          id: change.nodeId || crypto.randomUUID(),
          type: change.data.type,
          position: change.coordinates || { x: 0, y: 0 },
          data: change.data,
          lastUpdated: event.timestamp,
          updatedBy: event.userId
        };
        setNodes(prev => [...prev, newNode]);
        break;
        
      case 'update':
        setNodes(prev => prev.map(node => 
          node.id === change.nodeId 
            ? { ...node, data: { ...node.data, ...change.data }, lastUpdated: event.timestamp }
            : node
        ));
        break;
        
      case 'delete':
        setNodes(prev => prev.filter(node => node.id !== change.nodeId));
        break;
        
      case 'move':
        setNodes(prev => prev.map(node =>
          node.id === change.nodeId
            ? { ...node, position: change.coordinates || node.position, lastUpdated: event.timestamp }
            : node
        ));
        break;
    }
  }, []);

  const handleAIPromptSubmit = useCallback(async () => {
    if (!aiPrompt.trim()) return;

    setIsProcessing(true);
    try {
      // Process AI prompt through unified integrator
      await unifiedFlowIntegrator.processAIPrompt(aiPrompt, sessionId, userId);
      onAIPrompt?.(aiPrompt);
      setAiPrompt('');
    } catch (error) {
      console.error('Error processing AI prompt:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [aiPrompt, sessionId, userId, onAIPrompt]);

  const handleNodeClick = useCallback((node: VisualNode) => {
    setSelectedNode(node);
    
    // Broadcast visual change
    const change: VisualChange = {
      nodeId: node.id,
      action: 'update',
      data: { selected: true },
      coordinates: node.position
    };

    unifiedFlowIntegrator.processVisualChange(change, sessionId, userId);
  }, [sessionId, userId]);

  const handleNodeDrag = useCallback((nodeId: string, position: { x: number; y: number }) => {
    // Update local state
    setNodes(prev => prev.map(node =>
      node.id === nodeId ? { ...node, position } : node
    ));

    // Broadcast change
    const change: VisualChange = {
      nodeId,
      action: 'move',
      data: {},
      coordinates: position
    };

    unifiedFlowIntegrator.processVisualChange(change, sessionId, userId);
  }, [sessionId, userId]);

  const createNewNode = useCallback((type: VisualNode['type']) => {
    const newNode: VisualNode = {
      id: crypto.randomUUID(),
      type,
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      data: { 
        title: `New ${type} node`,
        createdAt: new Date().toISOString()
      },
      lastUpdated: new Date().toISOString(),
      updatedBy: userId
    };

    setNodes(prev => [...prev, newNode]);

    // Broadcast creation
    const change: VisualChange = {
      nodeId: newNode.id,
      action: 'create',
      data: newNode.data,
      coordinates: newNode.position
    };

    unifiedFlowIntegrator.processVisualChange(change, sessionId, userId);
  }, [sessionId, userId]);

  const renderNode = (node: VisualNode) => (
    <AnimatedNode
      key={node.id}
      isActive={node.isActive}
      className="absolute cursor-pointer"
    >
      <motion.div
        className="p-4 bg-card border rounded-lg shadow-lg min-w-[120px]"
        style={{
          left: node.position.x,
          top: node.position.y,
          transform: 'translate(-50%, -50%)'
        }}
        onClick={() => handleNodeClick(node)}
        drag
        onDragEnd={(_, info) => {
          const newPosition = {
            x: node.position.x + info.offset.x,
            y: node.position.y + info.offset.y
          };
          handleNodeDrag(node.id, newPosition);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-2 mb-2">
          {node.type === 'ai' && <Brain className="w-4 h-4 text-primary" />}
          {node.type === 'template' && <Grid className="w-4 h-4 text-secondary" />}
          {node.type === 'action' && <Zap className="w-4 h-4 text-accent" />}
          {node.type === 'decision' && <Activity className="w-4 h-4 text-muted-foreground" />}
          
          <Badge variant="outline" className="text-xs">
            {node.type}
          </Badge>
        </div>
        
        <div className="text-sm font-medium">
          {node.data.title || node.data.prompt?.substring(0, 30) + '...' || 'Untitled'}
        </div>
        
        <div className="text-xs text-muted-foreground mt-1">
          {node.updatedBy && `Updated by ${node.updatedBy}`}
        </div>
        
        {node.isActive && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity
            }}
          />
        )}
      </motion.div>
    </AnimatedNode>
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Grid className="w-5 h-5" />
              Real-Time Visual Builder
              <Badge variant="secondary">Live</Badge>
            </CardTitle>
            <CardDescription>
              AI-integrated visual builder with real-time collaboration
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              checked={realtimeEnabled}
              onCheckedChange={setRealtimeEnabled}
              id="realtime-enabled"
            />
            <Label htmlFor="realtime-enabled" className="text-xs">Real-time</Label>
            
            <Switch
              checked={gridEnabled}
              onCheckedChange={setGridEnabled}
              id="grid-enabled"
            />
            <Label htmlFor="grid-enabled" className="text-xs">Grid</Label>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* AI Prompt Input */}
        <div className="space-y-2">
          <Label>AI Prompt</Label>
          <div className="flex gap-2">
            <Textarea
              placeholder="Describe what you want to create..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={2}
              className="flex-1"
            />
            <Button 
              onClick={handleAIPromptSubmit}
              disabled={isProcessing || !aiPrompt.trim()}
              size="sm"
            >
              {isProcessing ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Visual Canvas */}
        <div className="relative border rounded-lg bg-muted/10 h-[400px] overflow-hidden">
          {/* Grid Background */}
          {gridEnabled && (
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          )}

          {/* Nodes */}
          <AnimatePresence>
            {nodes.map(renderNode)}
          </AnimatePresence>

          {/* Collaborator Cursors */}
          <AnimatePresence>
            {collaborators.map(collaborator => (
              <motion.div
                key={collaborator.userId}
                className="absolute pointer-events-none z-50"
                style={{
                  left: collaborator.position.x,
                  top: collaborator.position.y
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white"
                  style={{ backgroundColor: collaborator.color }}
                />
                <div className="text-xs bg-black text-white px-1 rounded ml-2 mt-1">
                  {collaborator.userName}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Grid className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Start by typing an AI prompt or creating nodes
                </p>
                <div className="flex gap-2">
                  {(['ai', 'template', 'action', 'decision'] as const).map((type) => (
                    <Button
                      key={type}
                      size="sm"
                      variant="outline"
                      onClick={() => createNewNode(type)}
                    >
                      {type === 'ai' && <Brain className="w-4 h-4 mr-1" />}
                      {type === 'template' && <Grid className="w-4 h-4 mr-1" />}
                      {type === 'action' && <Zap className="w-4 h-4 mr-1" />}
                      {type === 'decision' && <Activity className="w-4 h-4 mr-1" />}
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{nodes.length} nodes</span>
          <span>{collaborators.length} collaborators</span>
          <span>Session: {sessionId.substring(0, 8)}...</span>
        </div>
      </CardContent>
    </Card>
  );
};