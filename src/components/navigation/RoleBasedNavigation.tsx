import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Home, ChevronDown, Users, Building2, Settings, Activity, MoreHorizontal } from 'lucide-react';
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

  if (!user) {
    return null;
  }

  const isDashboard = location.pathname === '/';
  const canGoBack = !isDashboard && window.history.length > 1;

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
          {/* Logo - replace with your actual logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-lg">H</span>
            </div>
            <span className="font-semibold text-xl hidden md:inline bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Healthcare Platform
            </span>
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

        {/* Right side: User info and role badge */}
        <div className="flex items-center gap-3">
          {profile?.first_name && (
            <span className="text-sm text-muted-foreground hidden md:inline">
              Welcome, {profile.first_name}
            </span>
          )}
          <Badge 
            variant={isSuperAdmin ? 'destructive' : isAdmin ? 'secondary' : 'outline'}
            className="whitespace-nowrap"
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