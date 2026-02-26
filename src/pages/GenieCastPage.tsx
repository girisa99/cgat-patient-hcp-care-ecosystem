/**
 * GENIE CAST PAGE
 * Dedicated standalone page for Genie Cast — first-class route.
 * Includes error boundary to prevent crashes from propagating.
 * 
 * CRITICAL: No lazy loading — direct import to prevent loading failures.
 */

import React from 'react';
import { GenieStudioLayout } from '@/components/layout/GenieStudioLayout';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GenieCastHub } from '@/components/genie-cast/GenieCastHub';
import { QuadrantProductHeader } from '@/components/navigation/QuadrantProductHeader';

// Error boundary for catching render errors
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

const GenieCastPage: React.FC = () => {
  return (
    <GenieStudioLayout variant="sidebar" requireAuth={true}>
      <QuadrantProductHeader productId="cast" />
      <GenieCastErrorBoundary>
        <div className="p-2 sm:p-4 h-full min-h-[calc(100vh-4rem)]">
          <GenieCastHub />
        </div>
      </GenieCastErrorBoundary>
    </GenieStudioLayout>
  );
};

export default GenieCastPage;
