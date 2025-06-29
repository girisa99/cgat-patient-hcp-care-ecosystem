
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIntelligentRouting } from '@/hooks/useIntelligentRouting';
import { useModules } from '@/hooks/useModules';
import { Settings, Route, Clock, Zap } from 'lucide-react';

const RoutingPreferences: React.FC = () => {
  const { 
    userPreferences, 
    updateUserPreferences, 
    canAccessUnifiedDashboard,
    hasMultipleModules,
    getAccessibleModules,
    moduleProgress 
  } = useIntelligentRouting();
  
  const { userModules } = useModules();

  const accessibleModules = getAccessibleModules();

  const handlePreferenceChange = (key: string, value: any) => {
    updateUserPreferences({ [key]: value });
  };

  const clearModuleProgress = () => {
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem('auth-user') || '{}');
      if (user.id) {
        localStorage.removeItem(`module-progress-${user.id}`);
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Routing Preferences
          </CardTitle>
          <CardDescription>
            Customize how the system routes you between modules and remembers your progress.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto-routing */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">Intelligent Auto-Routing</div>
              <div className="text-sm text-muted-foreground">
                Automatically route to your preferred or last active module
              </div>
            </div>
            <Switch
              checked={userPreferences?.auto_route || false}
              onCheckedChange={(checked) => handlePreferenceChange('auto_route', checked)}
            />
          </div>

          {/* Dashboard preference (only for super admins) */}
          {canAccessUnifiedDashboard && (
            <div className="space-y-2">
              <div className="font-medium">Dashboard Type</div>
              <Select
                value={userPreferences?.preferred_dashboard || 'unified'}
                onValueChange={(value) => handlePreferenceChange('preferred_dashboard', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unified">Unified Dashboard</SelectItem>
                  <SelectItem value="module-specific">Module-Specific Dashboard</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">
                Choose between a unified admin view or module-specific dashboards
              </div>
            </div>
          )}

          {/* Default module */}
          {hasMultipleModules && (
            <div className="space-y-2">
              <div className="font-medium">Default Module</div>
              <Select
                value={userPreferences?.default_module || ''}
                onValueChange={(value) => handlePreferenceChange('default_module', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  {accessibleModules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.id.charAt(0).toUpperCase() + module.id.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">
                Module to load when no specific preference is available
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Module Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Module Activity
          </CardTitle>
          <CardDescription>
            Your recent module usage and saved progress.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {moduleProgress.length > 0 ? (
            <div className="space-y-3">
              {moduleProgress.slice(0, 5).map((progress, index) => (
                <div key={`${progress.moduleId}-${progress.timestamp}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      {progress.moduleId}
                    </Badge>
                    <div className="text-sm">
                      <div className="font-medium">{progress.lastPath}</div>
                      <div className="text-muted-foreground">
                        {new Date(progress.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {progress.visitCount} visits
                  </Badge>
                </div>
              ))}
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={clearModuleProgress}>
                  Clear Progress History
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Route className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <div>No recent module activity</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accessible Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Your Accessible Modules
          </CardTitle>
          <CardDescription>
            Modules you have access to based on your role permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {userModules && userModules.length > 0 ? (
              userModules.map((module) => (
                <Badge key={module.module_id} variant="default">
                  {module.module_name}
                </Badge>
              ))
            ) : (
              <div className="text-muted-foreground">Loading modules...</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoutingPreferences;
