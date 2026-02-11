/**
 * GENIE CAST PAGE
 * Dedicated standalone page for Genie Cast — first-class route.
 * Includes error boundary + load timeout to prevent infinite loading hangs.
 */

import React, { Suspense, useEffect, useState } from 'react';
import { GenieStudioLayout } from '@/components/layout/GenieStudioLayout';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GenieCastHub = React.lazy(() => 
  import('@/components/genie-admin/genie-cast/GenieCastHub')
);

// Error boundary for catching render errors in lazy-loaded components
class GenieCastErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[GenieCastPage] Render error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertTriangle className="w-10 h-10 text-destructive" />
          <p className="text-sm text-muted-foreground">Genie Cast failed to load.</p>
          <p className="text-xs text-muted-foreground max-w-md text-center">{this.state.error?.message}</p>
          <Button variant="outline" size="sm" onClick={() => { this.setState({ hasError: false }); }}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading fallback with timeout detection
const LoadingFallback: React.FC = () => {
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsStuck(true), 12000); // 12s timeout
    return () => clearTimeout(timer);
  }, []);

  if (isStuck) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        <p className="text-sm text-muted-foreground">Loading is taking longer than expected.</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reload Page
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <span className="ml-3 text-muted-foreground">Loading Genie Cast...</span>
    </div>
  );
};

const GenieCastPage: React.FC = () => {
  return (
    <GenieStudioLayout variant="sidebar" requireAuth={true}>
      <GenieCastErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <div className="p-2 sm:p-4 h-full min-h-[calc(100vh-4rem)]">
            <GenieCastHub />
          </div>
        </Suspense>
      </GenieCastErrorBoundary>
    </GenieStudioLayout>
  );
};

export default GenieCastPage;
