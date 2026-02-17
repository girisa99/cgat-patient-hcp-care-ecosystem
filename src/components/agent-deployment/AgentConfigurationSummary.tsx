import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentSession } from '@/types/agent-session';
import { 
  User, 
  Target, 
  Building, 
  Tag,
  Palette,
  FileText
} from 'lucide-react';

interface AgentConfigurationSummaryProps {
  session: AgentSession;
}

export const AgentConfigurationSummary: React.FC<AgentConfigurationSummaryProps> = ({ session }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Agent Name</label>
            <p className="text-lg font-semibold">{session.basic_info?.name || session.name}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="text-sm">{session.basic_info?.description || session.description || 'No description provided'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Purpose</label>
            <p className="text-sm">{session.basic_info?.purpose || 'Not specified'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Use Case</label>
            <p className="text-sm">{session.basic_info?.use_case || 'Not specified'}</p>
          </div>
          
          {session.basic_info?.brand && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Brand</label>
              <p className="text-sm">{session.basic_info.brand}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories and Classification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Classification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Agent Type</label>
            <Badge variant="default">
              {session.basic_info?.agent_type || 'Single Agent'}
            </Badge>
          </div>
          
          {session.basic_info?.categories && session.basic_info.categories.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Categories</label>
              <div className="flex flex-wrap gap-2">
                {session.basic_info.categories.map((category, index) => (
                  <Badge key={index} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {session.basic_info?.topics && session.basic_info.topics.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Topics</label>
              <div className="flex flex-wrap gap-2">
                {session.basic_info.topics.map((topic, index) => (
                  <Badge key={index} variant="outline">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {session.basic_info?.business_units && session.basic_info.business_units.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Business Units</label>
              <div className="flex flex-wrap gap-2">
                {session.basic_info.business_units.map((unit, index) => (
                  <Badge key={index} variant="outline">
                    <Building className="h-3 w-3 mr-1" />
                    {unit}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Canvas Configuration */}
      {session.canvas && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Canvas & Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {session.canvas.name && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Canvas Name</label>
                <p className="text-sm">{session.canvas.name}</p>
              </div>
            )}
            
            {session.canvas.tagline && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tagline</label>
                <p className="text-sm italic">"{session.canvas.tagline}"</p>
              </div>
            )}
            
            <div className="flex items-center gap-4">
              {session.canvas.primaryColor && (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: session.canvas.primaryColor }}
                  />
                  <span className="text-xs text-muted-foreground">Primary</span>
                </div>
              )}
              {session.canvas.secondaryColor && (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: session.canvas.secondaryColor }}
                  />
                  <span className="text-xs text-muted-foreground">Secondary</span>
                </div>
              )}
              {session.canvas.accentColor && (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: session.canvas.accentColor }}
                  />
                  <span className="text-xs text-muted-foreground">Accent</span>
                </div>
              )}
            </div>
            
            {session.canvas.workflow_steps && session.canvas.workflow_steps.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Workflow Steps</label>
                <p className="text-sm">{session.canvas.workflow_steps.length} steps configured</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Template Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Template & Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Template Type</label>
            <Badge variant="outline">
              {session.template_type === 'ai_generated' ? 'AI Generated' : 
               session.template_type === 'system' ? 'System Template' : 'Custom'}
            </Badge>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Current Status</label>
            <Badge variant={session.status === 'ready_to_deploy' ? 'default' : 'secondary'}>
              {session.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Current Step</label>
            <Badge variant="outline">
              {session.current_step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>Created: {new Date(session.created_at).toLocaleDateString()}</p>
            <p>Updated: {new Date(session.updated_at).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};