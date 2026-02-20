/**
 * GENIE ADMIN PAGE - UNIFIED PRODUCTION HUB
 * Consolidated admin page with:
 * - Production Hub (Kanban, Calendar, Library, Create, Scheduler)
 * - Arc features merged (Appointments, Schedule flow)
 * - User Management (internal users only)
 * 
 * Uses GenieStudioLayout for subscription-based access
 */
import React, { Suspense, lazy, Component } from 'react';
import type { ReactNode } from 'react';
import { GenieStudioLayout } from '@/components/layout/GenieStudioLayout';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Error boundary to catch lazy-load failures and show a useful message
class ModuleErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      console.error('[GenieAdminPage] Module load error:', this.state.error);
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
          <AlertTriangle className="w-12 h-12 text-destructive" />
          <h2 className="text-lg font-semibold">Failed to Load Production Hub</h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {this.state.error.message}
          </p>
          <Button onClick={() => window.location.reload()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh Page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy load with retry — handles transient network/module resolution failures
const importWithRetry = (retries = 3, delay = 1000): Promise<{ default: React.ComponentType<any> }> =>
  import('@/components/genie-admin/ProductionHubAdmin')
    .then(m => ({ default: m.ProductionHubAdmin }))
    .catch((err) => {
      if (retries <= 0) throw err;
      return new Promise<{ default: React.ComponentType<any> }>((resolve) =>
        setTimeout(() => resolve(importWithRetry(retries - 1, delay * 1.5)), delay)
      );
    });

const ProductionHubAdmin = lazy(() => importWithRetry());

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
    <Loader2 className="w-10 h-10 animate-spin text-primary" />
    <p className="text-muted-foreground">Loading Production Hub...</p>
  </div>
);

const GenieAdminPage: React.FC = () => {
  return (
    <GenieStudioLayout variant="sidebar">
      <ModuleErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <ProductionHubAdmin />
        </Suspense>
      </ModuleErrorBoundary>
    </GenieStudioLayout>
  );
};

export default GenieAdminPage;
