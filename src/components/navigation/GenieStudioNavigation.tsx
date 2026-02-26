/**
 * GENIE STUDIO NAVIGATION COMPONENT
 * Flat sidebar: 7 product links + 2 account links. No nested categories.
 */

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useGenieStudioNavigation } from '@/hooks/useGenieStudioNavigation';
import { useGenieStudioAuth } from '@/hooks/useGenieStudioAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ChevronDown,
  LogOut,
  Crown,
  PanelLeftClose,
  PanelLeft,
  Building2,
  Sparkles,
  Zap,
  Brain,
  Presentation,
  Video,
  Film,
  CreditCard,
  HelpCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';

interface GenieStudioNavigationProps {
  variant?: 'sidebar' | 'topbar';
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface SidebarItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

const SIDEBAR_PRODUCTS: SidebarItem[] = [
  { title: 'Genie Suite', url: '/genie-studio', icon: Sparkles },
  { title: 'Genie Spark', url: '/genie-spark', icon: Zap },
  { title: 'Genie Mind', url: '/genie-mind', icon: Brain },
  { title: 'Genie Deck', url: '/genie-deck', icon: Presentation },
  { title: 'Genie Vibe', url: '/genie-vibe', icon: Video },
  { title: 'Genie Cast', url: '/genie-cast', icon: Film },
  { title: 'Genie Hub', url: '/genie-hub', icon: Building2 },
];

const SIDEBAR_ACCOUNT: SidebarItem[] = [
  { title: 'Subscription', url: '/subscription', icon: CreditCard },
  { title: 'Support', url: '/genie-support', icon: HelpCircle },
];

export const GenieStudioNavigation: React.FC<GenieStudioNavigationProps> = ({
  variant = 'sidebar',
  defaultCollapsed = false,
  onCollapsedChange,
}) => {
  const navigate = useNavigate();
  const { tierInfo, isInternal } = useGenieStudioNavigation();
  const { genieUser, signOut } = useGenieStudioAuth();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const handleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    onCollapsedChange?.(collapsed);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/genie-studio-auth');
  };

  const userInitials = genieUser?.display_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'GU';

  if (variant === 'topbar') {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <NavLink to="/genie-studio" className="flex items-center gap-2">
            <img src={genieSuiteLogo} alt="Genie Suite" className="h-8" />
          </NavLink>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className={cn("text-xs", tierInfo.color)}>
              {(() => {
                const TierIcon = tierInfo.icon;
                return TierIcon ? <TierIcon className="h-3 w-3 mr-1" /> : null;
              })()}
              {tierInfo.name}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={genieUser?.avatar_url || undefined} alt={genieUser?.display_name || ''} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{genieUser?.display_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{genieUser?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/subscription')}>
                  <Crown className="mr-2 h-4 w-4" />
                  <span>Subscription</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    );
  }

  // Render a single sidebar link (expanded mode)
  const renderExpandedLink = (item: SidebarItem) => (
    <NavLink
      key={item.url}
      to={item.url}
      end={item.url === '/genie-studio'}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded px-2.5 py-1.5 text-sm transition-colors",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )
      }
    >
      <item.icon className="h-4 w-4 flex-shrink-0" />
      <span className="truncate">{item.title}</span>
    </NavLink>
  );

  // Render a single sidebar link (collapsed icon-only mode)
  const renderCollapsedLink = (item: SidebarItem) => (
    <Tooltip key={item.url}>
      <TooltipTrigger asChild>
        <NavLink
          to={item.url}
          end={item.url === '/genie-studio'}
          className={({ isActive }) =>
            cn(
              "flex justify-center py-1.5 rounded transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )
          }
        >
          <item.icon className="h-4 w-4" />
        </NavLink>
      </TooltipTrigger>
      <TooltipContent side="right">{item.title}</TooltipContent>
    </Tooltip>
  );

  // Collapsible Sidebar variant
  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300",
          isCollapsed ? "w-14" : "w-56"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header with Logo and Collapse Toggle */}
          <div className="flex h-12 items-center justify-between border-b px-2">
            <NavLink to="/genie-studio" className="flex items-center gap-2 min-w-0">
              <img
                src={genieSuiteLogo}
                alt="Genie Suite"
                className={cn("transition-all flex-shrink-0", isCollapsed ? "h-6 w-6" : "h-6")}
              />
            </NavLink>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={() => handleCollapse(!isCollapsed)}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeft className="h-3.5 w-3.5" />
              ) : (
                <PanelLeftClose className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>

          {/* Workspace Indicator */}
          {!isCollapsed && (
            <div className="px-3 py-2 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">
                  {genieUser?.display_name ? `${genieUser.display_name}'s Workspace` : 'My Workspace'}
                </span>
              </div>
            </div>
          )}

          {/* Navigation — flat PRODUCTS + ACCOUNT */}
          <ScrollArea className="flex-1 px-2 py-3">
            {/* PRODUCTS */}
            {!isCollapsed && (
              <span className="px-2 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                Products
              </span>
            )}
            <div className={cn("space-y-0.5", !isCollapsed && "mt-1")}>
              {SIDEBAR_PRODUCTS.map(item =>
                isCollapsed ? renderCollapsedLink(item) : renderExpandedLink(item)
              )}
            </div>

            {/* ACCOUNT */}
            <div className="mt-4">
              {!isCollapsed && (
                <span className="px-2 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                  Account
                </span>
              )}
              <div className={cn("space-y-0.5", !isCollapsed && "mt-1")}>
                {SIDEBAR_ACCOUNT.map(item =>
                  isCollapsed ? renderCollapsedLink(item) : renderExpandedLink(item)
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t p-3">
            <div className={cn(
              "mb-3 flex items-center",
              isCollapsed ? "justify-center" : "justify-between"
            )}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs cursor-default",
                      tierInfo.color,
                      isCollapsed && "px-1"
                    )}
                  >
                    {(() => {
                      const TierIcon = tierInfo.icon;
                      return TierIcon ? <TierIcon className="h-3 w-3" /> : null;
                    })()}
                    {!isCollapsed && <span className="ml-1">{tierInfo.name}</span>}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {tierInfo.name} Plan
                </TooltipContent>
              </Tooltip>

              {!isCollapsed && isInternal && (
                <Badge variant="secondary" className="text-xs">
                  Internal
                </Badge>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full gap-2",
                    isCollapsed ? "justify-center p-2" : "justify-start px-2"
                  )}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={genieUser?.avatar_url || undefined} alt={genieUser?.display_name || ''} />
                    <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 truncate text-left text-sm">
                        {genieUser?.display_name || genieUser?.email}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{genieUser?.display_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{genieUser?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/subscription')}>
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default GenieStudioNavigation;
