/**
 * ENHANCED DASHBOARD HEADER - User Welcome and Navigation
 * Professional header with GENIE branding, Cell Gene technology navigator, user info, and logout
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Shield, Settings, Stethoscope } from 'lucide-react';
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
    if (userRoles.includes('healthcareProvider')) return 'Healthcare Provider';
    if (userRoles.includes('nurse')) return 'Nurse';
    if (userRoles.includes('caseManager')) return 'Case Manager';
    if (userRoles.includes('technicalServices')) return 'Technical Services';
    if (userRoles.includes('patientCaregiver')) return 'Patient/Caregiver';
    if (userRoles.includes('user')) return 'User';
    return 'Team Member';
  };

  const getRoleBadgeVariant = () => {
    if (userRoles.includes('superAdmin')) return 'destructive';
    if (userRoles.includes('admin')) return 'secondary';
    if (userRoles.includes('healthcareProvider')) return 'default';
    if (userRoles.includes('technicalServices')) return 'outline';
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
          {/* Enhanced Logo and Branding */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg shadow-md">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  GENIE
                </h1>
                <p className="text-xs text-blue-600 font-medium">
                  Cell, Gene Technology Navigator
                </p>
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