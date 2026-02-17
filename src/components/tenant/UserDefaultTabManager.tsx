
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, User, Shield, Bell, 
  Database, Activity, CheckCircle2
} from "lucide-react";
import { useMasterAuth } from "@/hooks/useMasterAuth";

const UserDefaultTabManager = () => {
  const { user, userRoles, isLoading } = useMasterAuth();
  const [defaultTab, setDefaultTab] = useState<string>('dashboard');
  const [isSaving, setIsSaving] = useState(false);

  // Available tabs based on user roles
  const availableTabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Activity },
    { id: 'users', name: 'Users', icon: User },
    { id: 'facilities', name: 'Facilities', icon: Database },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const handleSaveDefaultTab = async () => {
    setIsSaving(true);
    try {
      // User preferences saved via user settings hook
      console.log('Saving default tab:', defaultTab);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to save default tab:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            User Preferences
          </h1>
          <p className="text-lg text-gray-600">
            Manage your default tab and navigation preferences
          </p>
        </div>

        {/* User Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>User Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Roles</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {userRoles.length > 0 ? userRoles.map((role, index) => (
                    <Badge key={index} variant="outline">
                      {role}
                    </Badge>
                  )) : (
                    <Badge variant="secondary">No roles assigned</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Default Tab Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Default Tab Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Choose your default landing tab
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableTabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <div
                        key={tab.id}
                        className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                          defaultTab === tab.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setDefaultTab(tab.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`h-5 w-5 ${
                            defaultTab === tab.id ? 'text-blue-600' : 'text-gray-500'
                          }`} />
                          <span className={`font-medium ${
                            defaultTab === tab.id ? 'text-blue-900' : 'text-gray-700'
                          }`}>
                            {tab.name}
                          </span>
                        </div>
                        {defaultTab === tab.id && (
                          <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveDefaultTab}
                  disabled={isSaving}
                  className="min-w-[120px]"
                >
                  {isSaving ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save Preferences'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Settings Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Current Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Default Tab</span>
                <Badge variant="outline">
                  {availableTabs.find(tab => tab.id === defaultTab)?.name || 'Dashboard'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Available Tabs</span>
                <span className="text-sm text-gray-600">
                  {availableTabs.length} tabs available
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDefaultTabManager;
