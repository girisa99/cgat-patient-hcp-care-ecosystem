/**
 * WORKFLOW VISUALIZATION COMPONENT
 * Displays workflow as visual diagrams within templates
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Eye, 
  Edit, 
  Settings, 
  Download,
  Maximize2,
  Play,
  Database,
  FileSpreadsheet,
  Webhook,
  Plus,
  ArrowRight,
  Circle,
  Square
} from 'lucide-react';
import { EnhancedWorkflowCanvas } from '@/components/workflow-builder/EnhancedWorkflowCanvas';

interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  data?: any;
  style?: any;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  outputOptions: {
    database: boolean;
    excel: boolean;
    api: boolean;
    email: boolean;
    sms: boolean;
  };
  isEditable: boolean;
  isActive: boolean;
}

interface WorkflowVisualizationProps {
  template: WorkflowTemplate;
  onEdit?: (template: WorkflowTemplate) => void;
  onOutputChange?: (templateId: string, outputType: string, enabled: boolean) => void;
  showControls?: boolean;
  compact?: boolean;
}

export const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({
  template,
  onEdit,
  onOutputChange,
  showControls = true,
  compact = false
}) => {
  const [showFullView, setShowFullView] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'start': return <Circle className="h-4 w-4 text-green-500" />;
      case 'end': return <Square className="h-4 w-4 text-red-500" />;
      case 'database': return <Database className="h-4 w-4 text-blue-500" />;
      case 'api': return <Webhook className="h-4 w-4 text-purple-500" />;
      case 'processor': return <Settings className="h-4 w-4 text-orange-500" />;
      default: return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOutputTypeIcon = (type: string) => {
    switch (type) {
      case 'database': return <Database className="h-4 w-4" />;
      case 'excel': return <FileSpreadsheet className="h-4 w-4" />;
      case 'api': return <Webhook className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const renderCompactView = () => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{template.name}</CardTitle>
          <Badge variant={template.isActive ? "default" : "secondary"}>
            {template.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{template.description}</p>
      </CardHeader>
      <CardContent>
        {/* Mini workflow diagram */}
        <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg mb-4">
          <div className="flex items-center space-x-2">
            {template.nodes.slice(0, 4).map((node, index) => (
              <React.Fragment key={node.id}>
                <div className="flex flex-col items-center">
                  {getNodeIcon(node.type)}
                  <span className="text-xs mt-1">{node.label.split(' ')[0]}</span>
                </div>
                {index < Math.min(template.nodes.length - 1, 3) && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                )}
              </React.Fragment>
            ))}
            {template.nodes.length > 4 && (
              <span className="text-xs text-muted-foreground">+{template.nodes.length - 4} more</span>
            )}
          </div>
        </div>

        {/* Output options */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Output Options</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(template.outputOptions).map(([type, enabled]) => (
              enabled && (
                <Badge key={type} variant="outline" className="flex items-center gap-1">
                  {getOutputTypeIcon(type)}
                  <span className="capitalize">{type}</span>
                </Badge>
              )
            ))}
          </div>
        </div>

        {showControls && (
          <div className="flex gap-2 mt-4">
            <Dialog open={showFullView} onOpenChange={setShowFullView}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Workflow: {template.name}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 min-h-0">
                  <EnhancedWorkflowCanvas 
                    initialNodes={template.nodes as any}
                    initialEdges={template.edges as any}
                  />
                </div>
              </DialogContent>
            </Dialog>

            {template.isEditable && onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(template)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}

            <Button variant="outline" size="sm">
              <Play className="h-4 w-4 mr-1" />
              Test
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderFullView = () => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{template.name}</CardTitle>
            <p className="text-muted-foreground mt-1">{template.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={template.isActive ? "default" : "secondary"}>
              {template.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">{template.category}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Workflow Canvas */}
        <div className="border rounded-lg h-96">
          <EnhancedWorkflowCanvas 
            initialNodes={template.nodes as any}
            initialEdges={template.edges as any}
          />
        </div>

        {/* Output Configuration */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Output Options</h3>
            <div className="space-y-3">
              {Object.entries(template.outputOptions).map(([type, enabled]) => (
                <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getOutputTypeIcon(type)}
                    <span className="capitalize">{type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={enabled ? "default" : "secondary"}>
                      {enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    {onOutputChange && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOutputChange(template.id, type, !enabled)}
                      >
                        {enabled ? "Disable" : "Enable"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Workflow Details</h3>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Nodes</span>
                  <Badge variant="outline">{template.nodes.length}</Badge>
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Connections</span>
                  <Badge variant="outline">{template.edges.length}</Badge>
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={template.isActive ? "default" : "secondary"}>
                    {template.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showControls && (
          <div className="flex gap-3">
            {template.isEditable && onEdit && (
              <Button onClick={() => onEdit(template)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Workflow
              </Button>
            )}
            <Button variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Test Workflow
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Node
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return compact ? renderCompactView() : renderFullView();
};