/**
 * ENGINEERING CONTEXT EXPORTER
 * 
 * UI component for subscribers to export technical context
 * for engineering team analysis without needing Lovable access.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Copy, 
  Download, 
  Mail, 
  Code, 
  FileJson, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Bot
} from 'lucide-react';
import { 
  engineeringContextExportService, 
  EngineeringContext 
} from '@/services/engineeringContextExportService';

interface EngineeringContextExporterProps {
  ticketId: string;
  ticketSummary: string;
  category: string;
  priority: string;
  stackTraces?: string[];
  networkFailures?: EngineeringContext['networkFailures'];
  reproductionSteps?: string[];
  sessionReplayUrl?: string;
  subscriptionTier?: string;
  currentRoute?: string;
  lastActions?: string[];
  onExportComplete?: (exportId: string) => void;
}

export const EngineeringContextExporter: React.FC<EngineeringContextExporterProps> = ({
  ticketId,
  ticketSummary,
  category,
  priority,
  stackTraces = [],
  networkFailures = [],
  reproductionSteps = [],
  sessionReplayUrl,
  subscriptionTier = 'unknown',
  currentRoute = '/',
  lastActions = [],
  onExportComplete
}) => {
  const [activeFormat, setActiveFormat] = useState<'markdown' | 'json' | 'email'>('markdown');
  const [isExporting, setIsExporting] = useState(false);
  const [exportedContent, setExportedContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Build context object
  const buildContext = (): EngineeringContext => ({
    ticketId,
    summary: ticketSummary,
    category,
    priority,
    stackTraces,
    networkFailures,
    sessionReplayUrl,
    environmentSnapshot: engineeringContextExportService.captureEnvironmentSnapshot(),
    reproductionSteps,
    userContext: {
      subscriptionTier,
      currentRoute,
      lastActions
    }
  });
  
  const handleExport = async (format: 'markdown' | 'json' | 'email') => {
    setIsExporting(true);
    setActiveFormat(format);
    
    try {
      const context = buildContext();
      const result = await engineeringContextExportService.exportContext(ticketId, context, format);
      
      if (result.success) {
        setExportedContent(result.content);
        toast.success(`Context exported as ${format.toUpperCase()}`);
        
        if (result.exportId && onExportComplete) {
          onExportComplete(result.exportId);
        }
      } else {
        toast.error(result.error || 'Export failed');
      }
    } catch (err) {
      toast.error('Failed to export context');
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleCopy = async () => {
    if (!exportedContent) return;
    
    const success = await engineeringContextExportService.copyToClipboard(exportedContent);
    if (success) {
      setCopied(true);
      toast.success('Copied to clipboard! Paste into Lovable, Cursor, or Claude.');
      setTimeout(() => setCopied(false), 3000);
    } else {
      toast.error('Failed to copy');
    }
  };
  
  const handleDownload = () => {
    if (!exportedContent) return;
    
    const context = buildContext();
    engineeringContextExportService.downloadAsFile(exportedContent, activeFormat, ticketId);
    toast.success('File downloaded');
  };
  
  const handleEmailShare = () => {
    if (!exportedContent) return;
    
    const subject = encodeURIComponent(`[${priority.toUpperCase()}] Engineering Issue - ${ticketId}`);
    const body = encodeURIComponent(exportedContent);
    window.open(`mailto:engineering@example.com?subject=${subject}&body=${body}`);
  };
  
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI-Ready Context Export</CardTitle>
          </div>
          <Badge variant={priority === 'critical' ? 'destructive' : 'secondary'}>
            {priority}
          </Badge>
        </div>
        <CardDescription>
          Export technical context for engineering tools (Lovable, Cursor, Claude)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Context Summary */}
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {stackTraces.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <AlertCircle className="h-3 w-3 text-destructive" />
              {stackTraces.length} error(s)
            </Badge>
          )}
          {networkFailures.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <AlertCircle className="h-3 w-3 text-warning" />
              {networkFailures.length} network failure(s)
            </Badge>
          )}
          {reproductionSteps.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="h-3 w-3 text-primary" />
              {reproductionSteps.length} repro steps
            </Badge>
          )}
        </div>
        
        {/* Export Tabs */}
        <Tabs defaultValue="markdown" value={activeFormat} onValueChange={(v) => setActiveFormat(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="markdown" className="gap-1">
              <Code className="h-3 w-3" />
              Markdown
            </TabsTrigger>
            <TabsTrigger value="json" className="gap-1">
              <FileJson className="h-3 w-3" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-1">
              <Mail className="h-3 w-3" />
              Email
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="markdown" className="mt-3">
            <p className="text-sm text-muted-foreground mb-2">
              📋 Perfect for pasting into <strong>Lovable</strong>, <strong>Cursor</strong>, or <strong>Claude</strong>
            </p>
          </TabsContent>
          
          <TabsContent value="json" className="mt-3">
            <p className="text-sm text-muted-foreground mb-2">
              🔧 Structured data for programmatic use or detailed analysis
            </p>
          </TabsContent>
          
          <TabsContent value="email" className="mt-3">
            <p className="text-sm text-muted-foreground mb-2">
              ✉️ Human-readable summary for email escalation
            </p>
          </TabsContent>
        </Tabs>
        
        {/* Generate Button */}
        {!exportedContent && (
          <Button 
            onClick={() => handleExport(activeFormat)}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-2" />
                Generate {activeFormat.charAt(0).toUpperCase() + activeFormat.slice(1)} Export
              </>
            )}
          </Button>
        )}
        
        {/* Exported Content Preview */}
        {exportedContent && (
          <div className="space-y-3">
            <Textarea 
              value={exportedContent}
              readOnly
              className="font-mono text-xs h-48 resize-none bg-muted/50"
            />
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleCopy}
                variant={copied ? 'default' : 'outline'}
                className="flex-1"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleDownload}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              {activeFormat === 'email' && (
                <Button 
                  onClick={handleEmailShare}
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Email
                </Button>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground"
              onClick={() => {
                setExportedContent(null);
                setCopied(false);
              }}
            >
              Generate New Export
            </Button>
          </div>
        )}
        
        {/* Instructions */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
          <p className="font-medium mb-1">📌 How to use:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Generate the context export above</li>
            <li>Copy and paste into <strong>Lovable</strong>, <strong>Cursor</strong>, or <strong>Claude</strong></li>
            <li>The AI will analyze and suggest fixes</li>
            <li>Engineering team reviews and deploys to <code>dev → uat → main</code></li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default EngineeringContextExporter;
