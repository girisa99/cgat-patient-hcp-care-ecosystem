/**
 * Support Ticket View with Developer Handoff Integration
 * Displays ticket details and provides engineering context export for technical issues
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertCircle, 
  Bug, 
  Code, 
  Clock, 
  User,
  MessageSquare,
  Wrench,
  ExternalLink,
  GitBranch,
  CheckCircle2
} from 'lucide-react';
import { EngineeringContextExporter } from './EngineeringContextExporter';
import { environmentService } from '@/services/environmentService';
import { cn } from '@/lib/utils';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting_on_user' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  issueType: 'support' | 'engineering';
  createdAt: string;
  updatedAt: string;
  userTier?: string;
  hasEngineeringContext?: boolean;
  fixDeployment?: {
    currentEnvironment: 'dev' | 'uat' | 'main' | 'production';
    githubPrUrl?: string;
    githubPrNumber?: number;
    fixStatus: string;
  };
}

interface SupportTicketWithHandoffProps {
  ticket: SupportTicket;
  onClose?: () => void;
  onStatusChange?: (newStatus: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-primary/10 text-primary border-primary/20',
  in_progress: 'bg-warning/10 text-warning border-warning/20',
  waiting_on_user: 'bg-accent/10 text-accent-foreground border-accent/20',
  resolved: 'bg-success/10 text-success border-success/20',
  closed: 'bg-muted text-muted-foreground border-muted',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-primary/10 text-primary',
  high: 'bg-warning/10 text-warning',
  critical: 'bg-destructive/10 text-destructive',
};

const ENVIRONMENT_PROGRESS: Record<string, number> = {
  dev: 25,
  uat: 50,
  main: 75,
  production: 100,
};

export const SupportTicketWithHandoff: React.FC<SupportTicketWithHandoffProps> = ({
  ticket,
  onClose,
  onStatusChange,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'handoff' | 'timeline'>('details');
  const envConfig = environmentService.getConfig();
  const isEngineeringIssue = ticket.issueType === 'engineering';

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
            {isEngineeringIssue ? (
              <Bug className="h-5 w-5 text-warning" />
            ) : (
              <MessageSquare className="h-5 w-5 text-primary" />
            )}
              <CardTitle className="text-xl">{ticket.title}</CardTitle>
            </div>
            <CardDescription className="flex items-center gap-2">
              <span>Ticket #{ticket.id.slice(0, 8)}</span>
              <span>•</span>
              <span>{ticket.category}</span>
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn(PRIORITY_COLORS[ticket.priority])}>
              {ticket.priority}
            </Badge>
            <Badge variant="outline" className={cn(STATUS_COLORS[ticket.status])}>
              {ticket.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <div className="px-6 pt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger 
              value="handoff" 
              className="gap-2"
              disabled={!isEngineeringIssue}
            >
              <Code className="h-4 w-4" />
              Developer Handoff
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-4">
          <TabsContent value="details" className="mt-0 space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1 text-sm">Created</h4>
                <p className="text-muted-foreground text-sm">
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-sm">Last Updated</h4>
                <p className="text-muted-foreground text-sm">
                  {new Date(ticket.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {ticket.userTier && (
              <div>
                <h4 className="font-medium mb-1 text-sm">User Tier</h4>
                <Badge variant="secondary">{ticket.userTier}</Badge>
              </div>
            )}

            {/* Fix Deployment Progress */}
            {ticket.fixDeployment && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Fix Deployment Progress</span>
                  </div>
                  {ticket.fixDeployment.githubPrUrl && (
                    <Button variant="ghost" size="sm" asChild>
                      <a 
                        href={ticket.fixDeployment.githubPrUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="gap-1"
                      >
                        PR #{ticket.fixDeployment.githubPrNumber}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
                
                {/* Environment Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Dev</span>
                    <span>UAT</span>
                    <span>Main</span>
                    <span>Prod</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ 
                        width: `${ENVIRONMENT_PROGRESS[ticket.fixDeployment.currentEnvironment] || 0}%` 
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Currently in: <strong>{ticket.fixDeployment.currentEnvironment}</strong></span>
                    <Badge variant="outline" className="ml-auto">
                      {ticket.fixDeployment.fixStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="handoff" className="mt-0">
            {isEngineeringIssue ? (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <div className="flex items-start gap-3">
                    <Wrench className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-medium">Developer Handoff</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Export technical context for debugging in Lovable, Cursor, or Claude. 
                        This includes stack traces, network failures, and environment snapshots.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Engineering Context Exporter */}
                <EngineeringContextExporter 
                  ticketId={ticket.id}
                  ticketSummary={ticket.title}
                  category={ticket.category}
                  priority={ticket.priority}
                  subscriptionTier={ticket.userTier}
                />

                {/* Current Environment Badge */}
                {!envConfig.isProduction && (
                  <div className="text-xs text-muted-foreground text-center">
                    Exporting from: {envConfig.displayName} environment
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Developer Handoff is only available for technical/engineering issues.</p>
                <p className="text-sm mt-1">
                  This ticket is classified as a support issue.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="mt-0">
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="text-sm font-medium">Ticket Created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {ticket.fixDeployment?.currentEnvironment === 'dev' && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="text-sm font-medium">Fix in Development</p>
                      <p className="text-xs text-muted-foreground">
                        Engineering team is working on a fix
                      </p>
                    </div>
                  </div>
                )}

                {ticket.fixDeployment?.currentEnvironment === 'uat' && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-warning mt-2" />
                    <div>
                      <p className="text-sm font-medium">Testing in UAT</p>
                      <p className="text-xs text-muted-foreground">
                        Fix is being tested in UAT environment
                      </p>
                    </div>
                  </div>
                )}

                {ticket.status === 'resolved' && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-success mt-2" />
                    <div>
                      <p className="text-sm font-medium">Issue Resolved</p>
                      <p className="text-xs text-muted-foreground">
                        Fix deployed to production
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};

export default SupportTicketWithHandoff;
