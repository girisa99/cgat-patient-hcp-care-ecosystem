
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { EnhancedTabs, EnhancedTabsList, EnhancedTabsTrigger, EnhancedTabsContent } from '@/components/ui/enhanced-tabs';
import RoutingPreferences from '@/components/routing/RoutingPreferences';
import { ModuleSettings } from '@/components/modules/ModuleSettings';
import { Settings, Route, Modules, Shield, User, Bell } from 'lucide-react';

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
              <EnhancedTabsTrigger value="modules" icon={<Modules className="h-4 w-4" />}>
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

// Profile Settings Component
const ProfileSettings = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">Profile Settings</h3>
        <p className="text-gray-600">Manage your personal information and preferences</p>
        <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
      </div>
    </div>
  );
};

// Notification Settings Component
const NotificationSettings = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">Notification Settings</h3>
        <p className="text-gray-600">Configure how and when you receive notifications</p>
        <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
      </div>
    </div>
  );
};

// Security Settings Component
const SecuritySettings = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">Security Settings</h3>
        <p className="text-gray-600">Manage your account security and authentication</p>
        <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
      </div>
    </div>
  );
};

export default Settings;
