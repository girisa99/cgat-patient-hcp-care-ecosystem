
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { EnhancedTabs, EnhancedTabsList, EnhancedTabsTrigger, EnhancedTabsContent } from '@/components/ui/enhanced-tabs';
import RoutingPreferences from '@/components/routing/RoutingPreferences';
import { ModuleSettings } from '@/components/modules/ModuleSettings';
import ProfileSettings from '@/components/settings/ProfileSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import { Settings as SettingsIcon, Route, Package, Shield, User, Bell } from 'lucide-react';

const Settings = () => {
  console.log('🎛️ Settings page rendering...');
  
  return (
    <ProtectedRoute>
      <MainLayout>
        <PageContainer
          title="Settings"
          subtitle="Customize your portal experience and preferences"
        >
          <div className="max-w-6xl mx-auto">
            <EnhancedTabs defaultValue="routing" className="w-full">
              <EnhancedTabsList className="grid w-full grid-cols-5">
                <EnhancedTabsTrigger value="routing" icon={<Route className="h-4 w-4" />}>
                  Routing
                </EnhancedTabsTrigger>
                <EnhancedTabsTrigger value="modules" icon={<Package className="h-4 w-4" />}>
                  Modules
                </EnhancedTabsTrigger>
                <EnhancedTabsTrigger value="profile" icon={<User className="h-4 w-4" />}>
                  Profile
                </EnhancedTabsTrigger>
                <EnhancedTabsTrigger value="notifications" icon={<Bell className="h-4 w-4" />}>
                  Notifications
                </EnhancedTabsTrigger>
                <EnhancedTabsTrigger value="security" icon={<Shield className="h-4 w-4" />}>
                  Security
                </EnhancedTabsTrigger>
              </EnhancedTabsList>

              <div className="mt-6">
                <EnhancedTabsContent value="routing" className="mt-0">
                  <RoutingPreferences />
                </EnhancedTabsContent>

                <EnhancedTabsContent value="modules" className="mt-0">
                  <ModuleSettings />
                </EnhancedTabsContent>

                <EnhancedTabsContent value="profile" className="mt-0">
                  <ProfileSettings />
                </EnhancedTabsContent>

                <EnhancedTabsContent value="notifications" className="mt-0">
                  <NotificationSettings />
                </EnhancedTabsContent>

                <EnhancedTabsContent value="security" className="mt-0">
                  <SecuritySettings />
                </EnhancedTabsContent>
              </div>
            </EnhancedTabs>
          </div>
        </PageContainer>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default Settings;
