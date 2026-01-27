/**
 * GENIE ADMIN PAGE - UNIFIED PRODUCTION HUB
 * Consolidated admin page with:
 * - Production Hub (Kanban, Calendar, Library, Create, Scheduler)
 * - Arc features merged (Appointments, Schedule flow)
 * - User Management (internal users only)
 * 
 * Uses GenieStudioLayout for subscription-based access
 */
import React, { Suspense, lazy } from 'react';
import { GenieStudioLayout } from '@/components/layout/GenieStudioLayout';
import { Loader2 } from 'lucide-react';

// Lazy load the heavy ProductionHubAdmin to fix loading issues
const ProductionHubAdmin = lazy(() => 
  import('@/components/genie-admin/ProductionHubAdmin').then(m => ({ default: m.ProductionHubAdmin }))
);

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
    <Loader2 className="w-10 h-10 animate-spin text-primary" />
    <p className="text-muted-foreground">Loading Production Hub...</p>
  </div>
);

const GenieAdminPage: React.FC = () => {
  return (
    <GenieStudioLayout variant="sidebar">
      <Suspense fallback={<LoadingFallback />}>
        <ProductionHubAdmin />
      </Suspense>
    </GenieStudioLayout>
  );
};

export default GenieAdminPage;
