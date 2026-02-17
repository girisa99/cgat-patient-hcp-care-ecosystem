import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Bot, Database, Globe, Brain, FileText, Shuffle, ChevronRight } from 'lucide-react';

interface MCPWelcomeOverviewProps {
  onStart: () => void;
}

export const MCPWelcomeOverview: React.FC<MCPWelcomeOverviewProps> = ({ onStart }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Welcome Overview
          <Badge variant="secondary" className="ml-2">MCP Education</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Shows the 5 active MCP types and how the orchestration works before enrollment.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* MCP Types */}
        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 rounded-md border p-3 bg-muted/30">
            <Database className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Database MCP</div>
              <div className="text-sm text-muted-foreground">Real-time data access</div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-md border p-3 bg-muted/30">
            <Globe className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">API MCP</div>
              <div className="text-sm text-muted-foreground">External system integration</div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-md border p-3 bg-muted/30">
            <Brain className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Memory MCP</div>
              <div className="text-sm text-muted-foreground">Contextual session intelligence</div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-md border p-3 bg-muted/30">
            <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">File MCP</div>
              <div className="text-sm text-muted-foreground">Document generation</div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-md border p-3 bg-muted/30 md:col-span-2">
            <Shuffle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Hybrid MCP</div>
              <div className="text-sm text-muted-foreground">Intelligent system orchestration</div>
            </div>
          </div>
        </div>

        {/* Deep Dives */}
        <div>
          <div className="font-medium mb-2">Interactive Deep Dives</div>
          <p className="text-sm text-muted-foreground mb-2">Click any topic to learn more.</p>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="db">
              <AccordionTrigger>Database MCP</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Real-time queries, cross-referencing, schema awareness, and RLS-aware access.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="api">
              <AccordionTrigger>API MCP</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                NPI registries, credentialing systems, rate limiting, and robust error handling.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="memory">
              <AccordionTrigger>Memory MCP</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Session context, caching, cross-session memory, and progressive learning.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="file">
              <AccordionTrigger>File MCP</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                PDF generation, templates, document assembly, and version control.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="hybrid">
              <AccordionTrigger>Hybrid MCP</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Load balancing, fallback systems, and intelligent routing across MCPs.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Process */}
        <div>
          <div className="font-medium mb-2">Technical Process Explanation</div>
          <p className="text-sm text-muted-foreground mb-2">6-step MCP orchestration process:</p>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
            <li>Input Processing → Entity analysis</li>
            <li>System Orchestration → Multi-MCP queries</li>
            <li>Data Correlation → Cross-validation</li>
            <li>Context Integration → Memory synthesis</li>
            <li>Response Generation → Intelligent replies</li>
            <li>Action Triggering → Automated workflows</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Explore More • See It In Action • Contextual Guidance
          </div>
          <Button onClick={onStart}>
            Let's begin
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
