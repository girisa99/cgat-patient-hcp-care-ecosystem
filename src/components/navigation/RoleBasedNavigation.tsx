import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Home } from 'lucide-react';

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

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="container flex h-16 items-center justify-between px-4">
        
        {/* Left side: Back button and Home */}
        <div className="flex items-center gap-4">
          {canGoBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 ${
                isDashboard ? 'bg-accent text-accent-foreground' : 'hover:bg-accent'
              }`}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Center: Main Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto">
          {availableTabs.filter(tab => tab.to !== '/').map((tab) => {
            const isActive = location.pathname === tab.to;
            const Icon = tab.icon;

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
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.title}</span>
                </Button>
              </Link>
            );
          })}
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