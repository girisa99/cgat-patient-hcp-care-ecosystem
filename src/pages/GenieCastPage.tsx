/**
 * GENIE CAST PAGE
 * Dedicated standalone page for Genie Cast - NO longer a tab inside ProductionHubAdmin
 * This eliminates the recurring "tab disappearing" bug by making it a first-class route.
 * 
 * Internal users only for now.
 */

import React, { Suspense } from 'react';
import { GenieStudioLayout } from '@/components/layout/GenieStudioLayout';
import { Loader2 } from 'lucide-react';

const GenieCastHub = React.lazy(() => 
  import('@/components/genie-admin/genie-cast/GenieCastHub')
);

const GenieCastPage: React.FC = () => {
  return (
    <GenieStudioLayout variant="sidebar" requireAuth={true}>
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading Genie Cast...</span>
        </div>
      }>
        <div className="p-2 sm:p-4 h-full min-h-[calc(100vh-4rem)]">
          <GenieCastHub />
        </div>
      </Suspense>
    </GenieStudioLayout>
  );
};

export default GenieCastPage;
