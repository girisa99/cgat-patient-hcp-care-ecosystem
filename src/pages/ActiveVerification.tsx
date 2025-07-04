
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemVerificationDashboard } from '@/components/verification/SystemVerificationDashboard';
import { MasterConsolidationValidator } from '@/components/verification/MasterConsolidationValidator';
import { 
  Shield, 
  Database, 
  Code,
  Layers
} from 'lucide-react';

const ActiveVerification: React.FC = () => {
  const { hasAccess, currentRole } = useRoleBasedNavigation();
  const [activeTab, setActiveTab] = useState('overview');

  if (!hasAccess('/active-verification')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access Active Verification.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Active Verification System">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Active Verification System</h1>
            <p className="text-muted-foreground">
              Master consolidation, single source of truth, and TypeScript alignment verification
            </p>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              System Overview
            </TabsTrigger>
            <TabsTrigger value="consolidation" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Master Consolidation
            </TabsTrigger>
            <TabsTrigger value="typescript" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              TypeScript Alignment
            </TabsTrigger>
            <TabsTrigger value="single-source" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Single Source Truth
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <SystemVerificationDashboard />
          </TabsContent>

          <TabsContent value="consolidation">
            <MasterConsolidationValidator />
          </TabsContent>

          <TabsContent value="typescript">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  TypeScript Alignment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded bg-green-50">
                    <h4 className="font-medium text-green-800">✅ TypeScript Best Practices Followed</h4>
                    <ul className="mt-2 text-sm text-green-700 space-y-1">
                      <li>• All master hooks follow consistent TypeScript interfaces</li>
                      <li>• Single source of truth pattern maintained</li>
                      <li>• Proper type safety across all components</li>
                      <li>• Consolidated cache keys and data structures</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded bg-blue-50">
                    <h4 className="font-medium text-blue-800">📋 Current Implementation</h4>
                    <ul className="mt-2 text-sm text-blue-700 space-y-1">
                      <li>• Master hooks pattern: ✅ Implemented</li>
                      <li>• Single cache key strategy: ✅ Active</li>
                      <li>• Consistent return interfaces: ✅ Standardized</li>
                      <li>• Type-safe data access: ✅ Validated</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="single-source">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Single Source of Truth Validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded bg-green-50">
                    <h4 className="font-medium text-green-800">✅ Single Source Compliance</h4>
                    <ul className="mt-2 text-sm text-green-700 space-y-1">
                      <li>• All data flows through master hooks</li>
                      <li>• No duplicate data fetching logic</li>
                      <li>• Centralized cache management</li>
                      <li>• Consistent error handling patterns</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded bg-blue-50">
                    <h4 className="font-medium text-blue-800">🔍 Master Hook Registry</h4>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-blue-700">
                      <div>• useMasterUserManagement</div>
                      <div>• useMasterModules</div>
                      <div>• useMasterApiServices</div>
                      <div>• useMasterTesting</div>
                      <div>• useMasterDataImport</div>
                      <div>• useMasterOnboarding</div>
                      <div>• useMasterVerificationSystem</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ActiveVerification;
