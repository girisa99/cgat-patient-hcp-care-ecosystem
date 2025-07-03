import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar-compliant';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export function AppSidebar() {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, profile, signOut } = useAuthContext();
  const { availableTabs, currentRole, isAdmin, isSuperAdmin } = useRoleBasedNavigation();

  const isActive = (path: string) => currentPath === path;

  const getNavClassName = (path: string) => {
    return isActive(path) 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-accent hover:text-accent-foreground";
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="offcanvas">
      {/* Header */}
      <SidebarHeader className="border-b p-4">
        {!collapsed && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Healthcare Admin</h2>
            <div className="flex items-center gap-2">
              <Badge variant={isSuperAdmin ? 'destructive' : isAdmin ? 'secondary' : 'outline'} className="text-xs">
                {currentRole ? currentRole.replace(/([A-Z])/g, ' $1').trim() : 'No Role'}
              </Badge>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">H</span>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {availableTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <SidebarMenuItem key={tab.to}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(tab.to)}
                      className={getNavClassName(tab.to)}
                    >
                      <Link to={tab.to}>
                        <Icon className="h-4 w-4" />
                        <span>{tab.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Info */}
        {!collapsed && profile && (
          <SidebarGroup>
            <SidebarGroupLabel>User Information</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <div className="text-sm">
                    <div className="font-medium">{profile.first_name} {profile.last_name}</div>
                    <div className="text-muted-foreground text-xs">{user?.email}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Access Level: {isAdmin ? 'Administrator' : 'User'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Available Modules: {availableTabs.length}
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t p-4">
        {!collapsed ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            className="w-full justify-center p-2"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}