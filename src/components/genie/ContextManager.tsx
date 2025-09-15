import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, FileText, Brain, Zap } from 'lucide-react';

interface ContextManagerProps {
  ragEnabled: boolean;
  medicalContext: boolean;
  knowledgeSources: string[];
  contextSources: string[];
}

export const ContextManager: React.FC<ContextManagerProps> = ({
  ragEnabled,
  medicalContext,
  knowledgeSources,
  contextSources
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          Context Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Context Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={ragEnabled ? "default" : "outline"} className="text-xs">
              <Database className="h-3 w-3 mr-1" />
              RAG System
            </Badge>
            <Badge variant={medicalContext ? "default" : "outline"} className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Medical Context
            </Badge>
          </div>
        </div>

        {/* Feature Context Information */}
        <div className="text-sm text-muted-foreground space-y-2">
          <div>
            <strong>How Feature Context Works:</strong>
          </div>
          <ul className="text-xs space-y-1 pl-4">
            <li>• <strong>RAG System:</strong> Retrieves relevant knowledge from curated databases</li>
            <li>• <strong>Knowledge Base:</strong> Accesses domain-specific information repositories</li>
            <li>• <strong>Medical Context:</strong> Provides specialized healthcare expertise</li>
            <li>• <strong>Label Studio:</strong> Integrates with data annotation workflows</li>
          </ul>
        </div>

        {/* Active Knowledge Sources */}
        {knowledgeSources.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Knowledge Sources:</div>
            <div className="flex gap-1 flex-wrap">
              {knowledgeSources.map((source, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Context Sources from Last Query */}
        {contextSources.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Recent Context Sources:</div>
            <div className="space-y-1">
              {contextSources.slice(0, 3).map((source, index) => (
                <div key={index} className="text-xs text-muted-foreground truncate" title={source}>
                  {source}
                </div>
              ))}
              {contextSources.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{contextSources.length - 3} more sources
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Flow Explanation */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-xs font-medium mb-1 flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Context Flow
          </div>
          <div className="text-xs text-muted-foreground">
            User Query → RAG Enhancement → Knowledge Retrieval → Context Injection → AI Response
          </div>
        </div>
      </CardContent>
    </Card>
  );
};