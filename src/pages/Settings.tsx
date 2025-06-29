
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
  return (
    <ProtectedRoute>
      <MainLayout>
        <PageContainer
          title="Settings"
          subtitle="Customize your portal experience and preferences"
        >
          <EnhancedTabs defaultValue="routing">
            <EnhancedTabsList>
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

            <EnhancedTabsContent value="routing">
              <RoutingPreferences />
            </EnhancedTabsContent>

            <EnhancedTabsContent value="modules">
              <ModuleSettings />
            </EnhancedTabsContent>

            <EnhancedTabsContent value="profile">
              <ProfileSettings />
            </EnhancedTabsContent>

            <EnhancedTabsContent value="notifications">
              <NotificationSettings />
            </EnhancedTabsContent>

            <EnhancedTabsContent value="security">
              <SecuritySettings />
            </EnhancedTabsContent>
          </EnhancedTabs>
        </PageContainer>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default Settings;
