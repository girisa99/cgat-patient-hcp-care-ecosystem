
import React from 'react';
import { PageContainer } from './PageContainer';
import { useUnifiedPageData } from '@/hooks/useUnifiedPageData';
import { Card, CardContent } from '@/components/ui/card';

interface UnifiedPageWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  fluid?: boolean;
  showSystemStatus?: boolean;
}

/**
 * SINGLE WRAPPER COMPONENT - All pages must use this
 * Direct layout implementation without MainLayout to prevent double sidebars
 */
export const UnifiedPageWrapper: React.FC<UnifiedPageWrapperProps> = ({
  children,
  title,
  subtitle,
  headerActions,
  fluid = false,
  showSystemStatus = true
}) => {
  const { meta, isLoading, hasError } = useUnifiedPageData();

  console.log('🎯 Unified Page Wrapper - Direct Layout (No MainLayout) for:', title);

  if (isLoading) {
    return (
      <div className="p-6">
        <PageContainer title={title} subtitle="Loading..." fluid={fluid}>
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading from unified data sources...</p>
            </CardContent>
          </Card>
        </PageContainer>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-6">
        <PageContainer title={title} subtitle="Error loading data" fluid={fluid}>
          <Card>
            <CardContent className="p-8 text-center text-red-600">
              <p>Error loading data from unified sources</p>
            </CardContent>
          </Card>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <PageContainer
        title={title}
        subtitle={subtitle}
        headerActions={headerActions}
        fluid={fluid}
      >
        {/* Single Source Validation Banner */}
        {showSystemStatus && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-semibold text-green-900">✅ Unified Single Source Architecture</h3>
            </div>
            <div className="text-sm text-green-700 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p><strong>Implementation:</strong> {meta.implementationLocked ? '🔒 LOCKED' : '❌ Unlocked'}</p>
                <p><strong>Version:</strong> {meta.version}</p>
              </div>
              <div>
                <p><strong>Data Sources:</strong> {meta.dataSourcesCount}</p>
                <p><strong>Validated:</strong> {meta.singleSourceValidated ? '✅' : '❌'}</p>
              </div>
              <div>
                <p><strong>Layout:</strong> Direct Unified Layout</p>
                <p><strong>Last Updated:</strong> {new Date(meta.lastUpdated).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        )}

        {children}
      </PageContainer>
    </div>
  );
};
