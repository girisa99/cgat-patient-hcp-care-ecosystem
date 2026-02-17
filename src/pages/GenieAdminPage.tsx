/**
 * GENIE ADMIN PAGE - UNIFIED PRODUCTION HUB
 * Consolidated admin page with:
 * - Production Hub (Kanban, Calendar, Library, Create, Scheduler)
 * - Arc features merged (Appointments, Schedule flow)
 * - User Management (internal users only)
 * 
 * Uses GenieStudioLayout for subscription-based access
 */
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { GenieStudioLayout } from '@/components/layout/GenieStudioLayout';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Lazy load the heavy ProductionHubAdmin with error handling
const ProductionHubAdmin = lazy(() => 
  import('@/components/genie-admin/ProductionHubAdmin')
    .then(m => ({ default: m.ProductionHubAdmin }))
    .catch(error => {
      console.error('[GenieAdminPage] Failed to load ProductionHubAdmin:', error);
      // Return a fallback component on error
      return {
        default: () => (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
            <AlertTriangle className="w-12 h-12 text-destructive" />
            <h2 className="text-lg font-semibold">Failed to Load Production Hub</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              The module couldn't be loaded. This is usually a temporary issue.
            </p>
            <Button onClick={() => window.location.reload()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </Button>
          </div>
        )
      };
    })
);

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
    <Loader2 className="w-10 h-10 animate-spin text-primary" />
    <p className="text-muted-foreground">Loading Production Hub...</p>
  </div>
);

const GenieAdminPage: React.FC = () => {
  const [key, setKey] = useState(0);

  // Force re-render if there's a module load issue
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('dynamically imported module') || 
          event.message.includes('Failed to fetch')) {
        console.warn('[GenieAdminPage] Detected module load error, will retry...');
        // Give the bundler a moment, then retry
        setTimeout(() => setKey(prev => prev + 1), 1000);
      }
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <GenieStudioLayout variant="sidebar">
      <Suspense fallback={<LoadingFallback />} key={key}>
        <ProductionHubAdmin />
      </Suspense>
    </GenieStudioLayout>
  );
};

export default GenieAdminPage;
