
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { user, profile, userRoles, signOut } = useAuthContext();

  const getUserInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getPortalType = () => {
    if (userRoles.includes('superAdmin')) return 'Admin Portal';
    if (userRoles.includes('healthcareProvider')) return 'HCP Portal';
    if (userRoles.includes('nurse')) return 'Nurse Portal';
    if (userRoles.includes('caseManager')) return 'Care Manager Portal';
    if (userRoles.includes('onboardingTeam')) return 'Onboarding Portal';
    if (userRoles.includes('patientCaregiver')) return 'Patient Portal';
    return 'Healthcare Portal';
  };

  const getPortalColor = () => {
    if (userRoles.includes('superAdmin')) return 'text-red-600';
    if (userRoles.includes('healthcareProvider')) return 'text-blue-600';
    if (userRoles.includes('nurse')) return 'text-green-600';
    if (userRoles.includes('caseManager')) return 'text-purple-600';
    if (userRoles.includes('onboardingTeam')) return 'text-orange-600';
    if (userRoles.includes('patientCaregiver')) return 'text-pink-600';
    return 'text-slate-600';
  };

  const getRoleDisplay = () => {
    if (userRoles.length === 0) return 'No Role Assigned';
    return userRoles.map(role => {
      switch (role) {
        case 'superAdmin': return 'Super Admin';
        case 'healthcareProvider': return 'Healthcare Provider';
        case 'nurse': return 'Nurse';
        case 'caseManager': return 'Case Manager';
        case 'onboardingTeam': return 'Onboarding Team';
        case 'patientCaregiver': return 'Patient/Caregiver';
        default: return role;
      }
    }).join(', ');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background shadow-sm">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center space-x-4">
          <img 
            src="/lovable-uploads/7b3ce1dc-c275-46ae-a0ca-f70f73094f01.png" 
            alt="GENIE Logo" 
            className="h-10 w-10"
          />
          <div>
            <h1 className="text-xl font-bold text-slate-800">GENIE</h1>
            <p className="text-sm text-slate-600">Cell, Gene Technology Navigator</p>
          </div>
        </div>
        
        {/* Portal Type and User Name Display */}
        <div className="ml-auto flex items-center space-x-6">
          <div className="text-right">
            <div className={`text-sm font-semibold ${getPortalColor()}`}>
              {getPortalType()}
            </div>
            <div className="text-sm text-slate-700">
              {profile?.first_name && profile?.last_name 
                ? `${profile.first_name} ${profile.last_name}`
                : user?.email
              }
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || ''} alt="User" />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.first_name && profile?.last_name 
                      ? `${profile.first_name} ${profile.last_name}`
                      : user?.email
                    }
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {getRoleDisplay()}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
