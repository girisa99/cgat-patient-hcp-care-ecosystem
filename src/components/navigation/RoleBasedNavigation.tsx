import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Home, ChevronDown, Users, Building2, Settings, Activity, MoreHorizontal, LogOut, User, FileBarChart, Bot, Brain, Network, GitBranch } from 'lucide-react';
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
  const { user, profile, availableTabs, currentRole, isAdmin, isSuperAdmin, userRoles } = useRoleBasedNavigation();
  const { signOut } = useMasterAuth();

  console.log('🚀 Navigation Debug:', {
    availableTabsCount: availableTabs.length,
    availableTabs: availableTabs.map(t => ({ title: t.title, to: t.to })),
    currentRole,
    isAdmin,
    isSuperAdmin,
    location: location.pathname
  });

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

  // FULLY DYNAMIC navigation groups - no hardcoding
  const getNavigationGroups = () => {
    // Healthcare Provider gets dedicated primary navigation with Architecture dropdown
    if (userRoles.includes('healthcareProvider')) {
      return {
        primary: availableTabs.filter(tab => 
          ['/', '/order-management', '/document-processing', '/patient-onboarding', '/patients'].includes(tab.to)
        ),
        treatmentCenters: [],
        agents: availableTabs.filter(tab => ['/agents'].includes(tab.to)),
        management: [],
        systemIntegration: availableTabs.filter(tab => 
          ['/api-services', '/system-integration', '/testing', '/architecture', '/healthcare-ai', '/database-performance'].includes(tab.to)
        ),
        reportsCompliance: [],
        architecture: [], // Merged into systemIntegration
        specialized: [],
        genieStudio: availableTabs.filter(tab => ['/genie-studio'].includes(tab.to))
      };
    }

    // Dynamic groupings for all other roles based on available tabs
    const primary = availableTabs.filter(tab => ['/', '/patients'].includes(tab.to));
    const treatmentCenters = availableTabs.filter(tab => ['/treatment-centers'].includes(tab.to));
    const agents = availableTabs.filter(tab => ['/agents'].includes(tab.to));
    const genieStudio = availableTabs.filter(tab => ['/genie-studio'].includes(tab.to));

    // Group remaining tabs dynamically by category
    const managementTabs = ['/users', '/facilities', '/onboarding', '/modules', '/role-management'];
    // System Integration now includes Architecture items to reduce nav scrolling
    const systemTabs = ['/api-services', '/system-integration', '/data-import', '/security', '/testing', '/architecture', '/healthcare-ai', '/database-performance'];
    const reportsTabs = ['/reports', '/governance', '/framework', '/stability', '/active-verification'];
    const specializedTabs = ['/ngrok'];

    return {
      primary,
      treatmentCenters,
      agents,
      genieStudio,
      management: availableTabs.filter(tab => managementTabs.includes(tab.to)),
      systemIntegration: availableTabs.filter(tab => systemTabs.includes(tab.to)),
      reportsCompliance: availableTabs.filter(tab => reportsTabs.includes(tab.to)),
      architecture: [], // Merged into systemIntegration
      specialized: availableTabs.filter(tab => specializedTabs.includes(tab.to))
    };
  };

  const navigationGroups = getNavigationGroups();

  // Debug: Log navigation groups for troubleshooting
  console.log('📍 Navigation Groups:', {
    roles: userRoles,
    primary: navigationGroups.primary.map(t => t.to),
    agents: navigationGroups.agents.map(t => t.to),
    systemIntegration: navigationGroups.systemIntegration.map(t => t.to),
  });

  const renderNavButton = (tab: any, isDropdown = false) => {
    const isActive = location.pathname === tab.to;
    const Icon = tab.icon;
    
    const buttonContent = (
      <>
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className={isDropdown ? "text-stable" : "hidden lg:inline text-stable truncate"}>{tab.title}</span>
      </>
    );

    if (isDropdown) {
      return (
        <DropdownMenuItem key={tab.to} asChild>
          <Link to={tab.to} className="flex items-center gap-2 w-full hover:bg-accent">
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
          className={`flex items-center gap-2 whitespace-nowrap transition-all duration-200 min-w-fit px-3 ${
            isActive 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'hover:bg-accent'
          }`}
        >
          {buttonContent}
        </Button>
      </Link>
    );
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="w-full px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between gap-4 min-w-0">
          
          {/* Left side: Logo and Back button */}
          <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
            {/* Company Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <img 
                src="/lovable-uploads/c721185e-a640-4364-a7d1-ccae9b2d6123.png" 
                alt="GENIE - Cell and Gene Technology Navigator" 
                className="w-8 h-8 md:w-10 md:h-10 object-contain flex-shrink-0"
              />
              <div className="hidden sm:block min-w-0">
                <div className="font-bold text-lg md:text-xl text-primary truncate">GENIE</div>
                <div className="text-xs text-muted-foreground -mt-1 truncate">Cell & Gene Navigator</div>
              </div>
            </Link>
            
            {canGoBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // For credit application, go back to onboarding instead of generic back
                  if (location.pathname === '/credit-application') {
                    navigate('/onboarding');
                  } else {
                    navigate(-1);
                  }
                }}
                className="flex items-center gap-2 hover:bg-accent flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden md:inline">Back</span>
              </Button>
            )}
          </div>

          {/* Center: Main Navigation - No scroll, dropdowns consolidate items */}
          <nav className="flex items-center flex-1 justify-start min-w-0 px-2" aria-label="Primary">
            <div className="flex items-center gap-1 flex-nowrap">
              {/* Dashboard */}
              <div className="nav-item">
                <Link to="/">
                  <Button
                    variant={isDashboard ? 'default' : 'ghost'}
                    size="sm"
                    className={`flex items-center gap-2 whitespace-nowrap min-w-fit px-3 ${
                      isDashboard ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-accent'
                    }`}
                  >
                    <Home className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden lg:inline text-stable">Dashboard</span>
                  </Button>
                </Link>
              </div>

              {/* Primary Navigation Items */}
              {navigationGroups.primary.filter(tab => tab.to !== '/').map(tab => (
                <div key={tab.to} className="nav-item">
                  {renderNavButton(tab)}
                </div>
              ))}

              {/* Agents Ecosystem */}
              {navigationGroups.agents && navigationGroups.agents.length > 0 && navigationGroups.agents.map(tab => (
                <div key={tab.to} className="nav-item">
                  {renderNavButton(tab)}
                </div>
              ))}

              {/* Treatment Centers - Business Domain */}
              {navigationGroups.treatmentCenters && navigationGroups.treatmentCenters.length > 0 && navigationGroups.treatmentCenters.map(tab => (
                <div key={tab.to} className="nav-item">
                  {renderNavButton(tab)}
                </div>
              ))}

              {/* Genie Studio - Media Production */}
              {navigationGroups.genieStudio && navigationGroups.genieStudio.length > 0 && navigationGroups.genieStudio.map(tab => (
                <div key={tab.to} className="nav-item">
                  {renderNavButton(tab)}
                </div>
              ))}

              {navigationGroups.management.length > 0 && (
                <div className="nav-item">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 hover:bg-accent whitespace-nowrap min-w-fit px-3"
                      >
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden xl:inline text-stable">Management</span>
                        <span className="hidden lg:inline xl:hidden text-stable">Mgmt</span>
                        <ChevronDown className="h-3 w-3 flex-shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-48 bg-background border border-border shadow-md z-[9999]">
                      {navigationGroups.management.map(tab => renderNavButton(tab, true))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* System Integration - Consolidated Technical Tools */}
              {navigationGroups.systemIntegration.length > 0 && (
                <div className="nav-item">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 hover:bg-accent whitespace-nowrap min-w-fit px-3"
                      >
                        <Settings className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden xl:inline text-stable">System Integration</span>
                        <span className="hidden lg:inline xl:hidden text-stable">System</span>
                        <ChevronDown className="h-3 w-3 flex-shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-56 bg-background border border-border shadow-md z-[9999]">
                      {navigationGroups.systemIntegration.map(tab => renderNavButton(tab, true))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* Reports & Compliance */}
              {navigationGroups.reportsCompliance.length > 0 && (
                <div className="nav-item">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 hover:bg-accent whitespace-nowrap min-w-fit px-3"
                      >
                        <FileBarChart className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden xl:inline text-stable">Reports & Compliance</span>
                        <span className="hidden lg:inline xl:hidden text-stable">Reports</span>
                        <ChevronDown className="h-3 w-3 flex-shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-56 bg-background border border-border shadow-md z-[9999]">
                      {navigationGroups.reportsCompliance.map(tab => renderNavButton(tab, true))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* Architecture merged into System Integration - removed separate dropdown */}

              {/* Specialized Tools */}
              {navigationGroups.specialized.length > 0 && (
                <div className="nav-item">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 hover:bg-accent whitespace-nowrap min-w-fit px-3"
                      >
                        <Brain className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden xl:inline text-stable">Tools</span>
                        <ChevronDown className="h-3 w-3 flex-shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-48 bg-background border border-border shadow-md z-[9999]">
                      {navigationGroups.specialized.map(tab => renderNavButton(tab, true))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </nav>

          {/* Right side: User dropdown and actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-accent">
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline max-w-32 truncate">{getUserDisplayName()}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">{getUserDisplayName()}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
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
              className="whitespace-nowrap hidden md:flex text-xs px-2 py-1"
            >
              {currentRole ? currentRole.replace(/([A-Z])/g, ' $1').trim() : 'No Role'}
            </Badge>
          </div>
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