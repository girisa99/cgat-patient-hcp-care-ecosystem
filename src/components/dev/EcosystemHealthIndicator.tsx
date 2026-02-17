/**
 * ECOSYSTEM HEALTH INDICATOR
 * 
 * Dev-mode component that shows ecosystem health status.
 * Only visible in development mode.
 * 
 * Usage: Add <EcosystemHealthIndicator /> to your app layout
 */

import React, { useState, useEffect } from 'react';
import { verifyEcosystem, VerificationReport } from '@/utils/ecosystemVerification';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, AlertCircle, XCircle, Activity } from 'lucide-react';

const isDev = import.meta.env.DEV;

export function EcosystemHealthIndicator() {
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Run verification on mount
    const verification = verifyEcosystem();
    setReport(verification);
    
    // Log to console in dev
    if (isDev) {
      console.log('🔍 Ecosystem Verification:', verification.status.toUpperCase());
      if (verification.errors.length > 0) {
        console.error('❌ Ecosystem Errors:', verification.errors);
      }
      if (verification.warnings.length > 0) {
        console.warn('⚠️ Ecosystem Warnings:', verification.warnings);
      }
    }
  }, []);

  // Only show in development
  if (!isDev || !report) return null;

  const getStatusIcon = () => {
    switch (report.status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (report.status) {
      case 'healthy':
        return 'bg-green-500/10 border-green-500/20 text-green-500';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500';
      case 'error':
        return 'bg-red-500/10 border-red-500/20 text-red-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className={`fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono ${getStatusColor()} hover:opacity-80 transition-opacity`}
          title="Ecosystem Health (Dev Mode)"
        >
          <Activity className="h-3 w-3" />
          {getStatusIcon()}
          <span>{report.counts.pipelines} pipelines</span>
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Ecosystem Health Report
            <Badge 
              variant={report.status === 'healthy' ? 'default' : 'destructive'}
              className="ml-2"
            >
              {report.status.toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh]">
          <div className="space-y-4 p-4">
            {/* Counts */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-2xl font-bold">{report.counts.products}</div>
                <div className="text-xs text-muted-foreground">Products</div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-2xl font-bold">{report.counts.categories}</div>
                <div className="text-xs text-muted-foreground">Categories</div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-2xl font-bold">{report.counts.pipelines}</div>
                <div className="text-xs text-muted-foreground">Pipelines</div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-2xl font-bold">{report.counts.capabilities}</div>
                <div className="text-xs text-muted-foreground">Capabilities</div>
              </div>
            </div>

            {/* Connections */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Bridge Connections</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between p-2 rounded bg-muted">
                  <span>Outputs → Categories</span>
                  <span className="font-mono">{report.connections.outputsToCategories.connected}/{report.counts.outputTypes}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted">
                  <span>Visuals → Categories</span>
                  <span className="font-mono">{report.connections.visualsToCategories.connected}/{report.counts.visualFeatures}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted">
                  <span>Categories → Products</span>
                  <span className="font-mono">{report.connections.categoriesToProducts.connected}/{report.counts.categories}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted">
                  <span>Categories → Edge Functions</span>
                  <span className="font-mono">{report.connections.categoriesToEdgeFunctions.connected}/{report.counts.categories}</span>
                </div>
              </div>
            </div>

            {/* Dropdowns */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Wizard Dropdowns</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(report.dropdowns).map(([name, exists]) => (
                  <Badge 
                    key={name} 
                    variant={exists ? 'outline' : 'destructive'}
                    className="text-xs"
                  >
                    {exists ? '✓' : '✗'} {name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Errors */}
            {report.errors.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-red-500">Errors ({report.errors.length})</h3>
                <div className="space-y-1">
                  {report.errors.map((error, i) => (
                    <div key={i} className="text-xs p-2 rounded bg-red-500/10 text-red-500">
                      ❌ {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {report.warnings.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-yellow-500">Warnings ({report.warnings.length})</h3>
                <div className="space-y-1">
                  {report.warnings.map((warning, i) => (
                    <div key={i} className="text-xs p-2 rounded bg-yellow-500/10 text-yellow-500">
                      ⚠️ {warning}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Summary */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Full Report</h3>
              <pre className="text-xs p-3 rounded bg-muted overflow-x-auto whitespace-pre-wrap font-mono">
                {report.summary}
              </pre>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default EcosystemHealthIndicator;
