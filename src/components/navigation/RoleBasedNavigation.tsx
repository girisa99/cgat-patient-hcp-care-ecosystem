import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Home, ChevronDown, Users, Building2, Settings, Activity, MoreHorizontal, LogOut, User } from 'lucide-react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RoleBasedNavigationProps {
  className?: string;
}

/**
 * CENTRAL NAVIGATION COMPONENT
 * Single source for role-based tab/navigation rendering
 */
export const RoleBasedNavigation: React.FC<RoleBasedNavigationProps> = ({ className = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, availableTabs, currentRole, isAdmin, isSuperAdmin } = useRoleBasedNavigation();
  const { signOut } = useMasterAuth();

  if (!user) {
    return null;
  }

  const isDashboard = location.pathname === '/';
  const canGoBack = !isDashboard && window.history.length > 1;

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

  // Group navigation items by category
  const navigationGroups = {
    core: availableTabs.filter(tab => 
      ['/', '/patients', '/onboarding'].includes(tab.to)
    ),
    management: availableTabs.filter(tab => 
      ['/users', '/facilities', '/modules', '/role-management'].includes(tab.to)
    ),
    technical: availableTabs.filter(tab => 
      ['/api-services', '/ngrok', '/security', '/testing', '/data-import', '/active-verification'].includes(tab.to)
    ),
    reporting: availableTabs.filter(tab => 
      ['/reports'].includes(tab.to)
    )
  };

  const renderNavButton = (tab: any, isDropdown = false) => {
    const isActive = location.pathname === tab.to;
    const Icon = tab.icon;
    
    const buttonContent = (
      <>
        <Icon className="h-4 w-4" />
        <span className={isDropdown ? "" : "hidden sm:inline"}>{tab.title}</span>
      </>
    );

    if (isDropdown) {
      return (
        <DropdownMenuItem key={tab.to} asChild>
          <Link to={tab.to} className="flex items-center gap-2 w-full">
            {buttonContent}
          </Link>
        </DropdownMenuItem>
      );
    }

    return (
      <Link key={tab.to} to={tab.to}>
        <Button
          variant={isActive ? 'default' : 'ghost'}
          size="sm"
          className={`flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
            isActive 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'hover:bg-accent hover:scale-105'
          }`}
        >
          {buttonContent}
        </Button>
      </Link>
    );
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="container flex h-16 items-center justify-between px-4">
        
        {/* Left side: Logo and Back button */}
        <div className="flex items-center gap-4">
          {/* Company Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/c721185e-a640-4364-a7d1-ccae9b2d6123.png" 
              alt="GENIE - Cell and Gene Technology Navigator" 
              className="w-10 h-10 object-contain"
            />
            <div className="hidden md:block">
              <div className="font-bold text-xl text-primary">GENIE</div>
              <div className="text-xs text-muted-foreground -mt-1">Cell & Gene Technology Navigator</div>
            </div>
          </Link>
          
          {canGoBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          )}
        </div>

        {/* Center: Main Navigation */}
        <nav className="flex items-center gap-1">
          {/* Dashboard */}
          <Link to="/">
            <Button
              variant={isDashboard ? 'default' : 'ghost'}
              size="sm"
              className={`flex items-center gap-2 ${
                isDashboard ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-accent hover:scale-105'
              }`}
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>

          {/* Core Features */}
          {navigationGroups.core.filter(tab => tab.to !== '/').map(tab => renderNavButton(tab))}

          {/* Management Dropdown */}
          {navigationGroups.management.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-accent hover:scale-105"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Management</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                {navigationGroups.management.map(tab => renderNavButton(tab, true))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Technical Dropdown */}
          {navigationGroups.technical.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-accent hover:scale-105"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Technical</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                {navigationGroups.technical.map(tab => renderNavButton(tab, true))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Reports */}
          {navigationGroups.reporting.map(tab => renderNavButton(tab))}
        </nav>

        {/* Right side: User dropdown and actions */}
        <div className="flex items-center gap-3">
          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-accent">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">{getUserDisplayName()}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{getUserDisplayName()}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Role Badge */}
          <Badge 
            variant={isSuperAdmin ? 'destructive' : isAdmin ? 'secondary' : 'outline'}
            className="whitespace-nowrap hidden sm:flex"
          >
            {currentRole ? currentRole.replace(/([A-Z])/g, ' $1').trim() : 'No Role'}
          </Badge>
        </div>
      </div>
    </header>
  );
};

/**
 * MOBILE NAVIGATION COMPONENT
 * Responsive navigation for mobile devices
 */
export const MobileRoleBasedNavigation: React.FC<RoleBasedNavigationProps> = ({ className = '' }) => {
  const location = useLocation();
  const { availableTabs } = useRoleBasedNavigation();

  return (
    <div className={`mobile-navigation ${className} md:hidden`}>
      <div className="flex overflow-x-auto gap-2 p-2">
        {availableTabs.map((tab) => {
          const isActive = location.pathname === tab.to;
          const Icon = tab.icon;

          return (
            <Link key={tab.to} to={tab.to} className="flex-shrink-0">
              <Button
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className="flex flex-col items-center gap-1 h-auto p-2 min-w-[70px]"
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{tab.title.split(' ')[0]}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RoleBasedNavigation;