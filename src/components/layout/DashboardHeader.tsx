/**
 * DASHBOARD HEADER - User Welcome and Navigation
 * Professional header with logo, user info, and logout
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Shield, Settings } from 'lucide-react';
import { useMasterAuth } from '@/hooks/useMasterAuth';

export const DashboardHeader: React.FC = () => {
  const { user, profile, userRoles, signOut, isLoading } = useMasterAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getPrimaryRole = () => {
    if (userRoles.includes('superAdmin')) return 'Super Admin';
    if (userRoles.includes('admin')) return 'Administrator';
    if (userRoles.includes('onboardingTeam')) return 'Onboarding Team';
    if (userRoles.includes('user')) return 'User';
    return 'Team Member';
  };

  const getRoleBadgeVariant = () => {
    if (userRoles.includes('superAdmin')) return 'destructive';
    if (userRoles.includes('admin')) return 'secondary';
    return 'outline';
  };

  if (isLoading) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
            </div>
            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Welcome */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <img 
                  src="/lovable-uploads/7b3ce1dc-c275-46ae-a0ca-f70f73094f01.png" 
                  alt="GENIE Logo" 
                  className="h-8 w-8"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">GENIE</h1>
                <p className="text-xs text-gray-500">Healthcare Management</p>
              </div>
            </div>
            
            <div className="hidden md:block border-l border-gray-200 pl-4 ml-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Welcome, {getUserDisplayName()}
                </span>
                <Badge variant={getRoleBadgeVariant()} className="text-xs">
                  {getPrimaryRole()}
                </Badge>
              </div>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {/* User Info (Mobile) */}
            <div className="md:hidden flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 truncate max-w-24">
                {getUserDisplayName()}
              </span>
              <Badge variant={getRoleBadgeVariant()} className="text-xs">
                {getPrimaryRole()}
              </Badge>
            </div>

            {/* Settings Button */}
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Settings className="h-4 w-4" />
            </Button>

            {/* Logout Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;