import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RoleBasedNavigationProps {
  className?: string;
}

/**
 * CENTRAL NAVIGATION COMPONENT
 * Single source for role-based tab/navigation rendering
 */
export const RoleBasedNavigation: React.FC<RoleBasedNavigationProps> = ({ className = '' }) => {
  const location = useLocation();
  const { user, profile } = useAuthContext();
  const { availableTabs, currentRole, isAdmin, isSuperAdmin } = useRoleBasedNavigation();

  if (!user) {
    return null;
  }

  return (
    <div className={`role-based-navigation ${className}`}>
      {/* Role Status Badge */}
      <div className="mb-4 flex items-center gap-2">
        <Badge variant={isSuperAdmin ? 'destructive' : isAdmin ? 'secondary' : 'outline'}>
          {currentRole ? currentRole.replace(/([A-Z])/g, ' $1').trim() : 'No Role'}
        </Badge>
        {profile?.first_name && (
          <span className="text-sm text-muted-foreground">
            Welcome, {profile.first_name}
          </span>
        )}
      </div>

      {/* Navigation Tabs */}
      <nav className="flex flex-wrap gap-2">
        {availableTabs.map((tab) => {
          const isActive = location.pathname === tab.to;
          const Icon = tab.icon;

          return (
            <Link key={tab.to} to={tab.to}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className={`flex items-center gap-2 ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.title}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Debug Info (only for admins) */}
      {isAdmin && (
        <div className="mt-4 p-2 bg-muted rounded text-xs">
          <div>Role: {currentRole}</div>
          <div>Available tabs: {availableTabs.length}</div>
          <div>Current path: {location.pathname}</div>
        </div>
      )}
    </div>
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