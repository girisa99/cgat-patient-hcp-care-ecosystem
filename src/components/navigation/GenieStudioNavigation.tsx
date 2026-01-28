/**
 * GENIE STUDIO NAVIGATION COMPONENT
 * Collapsible sidebar with 4-Quadrant + PUBLISH flow
 * Categories: WORKSPACE → CREATE → PRODUCE → PUBLISH → MANAGE → ACCOUNT
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
  Send,
  Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';

interface GenieStudioNavigationProps {
  variant?: 'sidebar' | 'topbar';
  defaultCollapsed?: boolean;
}

/**
 * Category labels with PUBLISH added
 * Sequential flow: Workspace → Create → Produce → Publish → Manage → Account
 */
const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  main: { label: 'WORKSPACE', icon: '🏠' },
  tools: { label: 'CREATE', icon: '✨' },
  production: { label: 'PRODUCE', icon: '🎬' },
  publish: { label: 'PUBLISH', icon: '📢' },
  admin: { label: 'MANAGE', icon: '📊' },
  account: { label: 'ACCOUNT', icon: '👤' },
};

const CATEGORY_ORDER = ['main', 'tools', 'production', 'publish', 'admin', 'account'];

// PUBLISH category items (added separately since not in navByCategory)
const PUBLISH_ITEMS = [
  { 
    title: 'Content Scheduler', 
    url: '/genie-admin?tab=scheduler', 
    icon: Send,
    description: 'Schedule content across platforms'
  },
  { 
    title: 'Distribution', 
    url: '/genie-admin?tab=library', 
    icon: Megaphone,
    description: 'Manage content distribution'
  },
];

export const GenieStudioNavigation: React.FC<GenieStudioNavigationProps> = ({ 
  variant = 'sidebar',
  defaultCollapsed = false,
}) => {
  const navigate = useNavigate();
  const { navByCategory, tierInfo, userTier, isInternal } = useGenieStudioNavigation();
  const { genieUser, signOut } = useGenieStudioAuth();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const handleSignOut = async () => {
    await signOut();
    navigate('/genie-studio-auth');
  };

  const userInitials = genieUser?.display_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'GU';

  // Add PUBLISH items to the category structure
  const enhancedNavByCategory = {
    ...navByCategory,
    publish: PUBLISH_ITEMS.map(item => ({
      ...item,
      minTier: 'starter' as const,
      category: 'publish' as const,
    })),
  };

  if (variant === 'topbar') {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <NavLink to="/genie-studio" className="flex items-center gap-2">
            <img src={genieSuiteLogo} alt="Genie Studio" className="h-8" />
          </NavLink>

          <div className="flex items-center gap-1">
            {Object.entries(enhancedNavByCategory)
              .filter(([category]) => category !== 'account')
              .sort(([a], [b]) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b))
              .flatMap(([_, items]) => items)
              .slice(0, 6)
              .map(item => (
                <NavLink
                  key={item.url}
                  to={item.url}
                  className={({ isActive }) =>
                    cn(
                      "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )
                  }
                >
                  {item.title}
                </NavLink>
              ))}
          </div>

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

  // Collapsible Sidebar variant
  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header with Collapse Toggle */}
        <div className="flex h-16 items-center justify-between border-b px-3">
          <NavLink to="/genie-studio" className="flex items-center gap-2">
            <img 
              src={genieSuiteLogo} 
              alt="Genie Studio" 
              className={cn("transition-all", isCollapsed ? "h-8 w-8" : "h-8")} 
            />
          </NavLink>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <PanelLeft className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Navigation with Tooltips */}
        <ScrollArea className="flex-1 px-2 py-4">
          <TooltipProvider delayDuration={0}>
            {CATEGORY_ORDER
              .filter(category => enhancedNavByCategory[category]?.length > 0)
              .map((category, idx) => (
                <div key={category} className={cn(idx > 0 && "mt-4")}>
                  {/* Category Header */}
                  {!isCollapsed && (
                    <h4 className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <span>{CATEGORY_LABELS[category]?.icon}</span>
                      <span>{CATEGORY_LABELS[category]?.label}</span>
                    </h4>
                  )}
                  
                  {isCollapsed && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="mb-2 flex justify-center">
                          <span className="text-xs">{CATEGORY_LABELS[category]?.icon}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {CATEGORY_LABELS[category]?.label}
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {/* Nav Items */}
                  <div className="space-y-1">
                    {enhancedNavByCategory[category].map(item => (
                      <Tooltip key={item.url}>
                        <TooltipTrigger asChild>
                          <NavLink
                            to={item.url}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center rounded-lg transition-all",
                                isCollapsed 
                                  ? "justify-center p-2" 
                                  : "gap-3 px-3 py-2",
                                isActive
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              )
                            }
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            {!isCollapsed && (
                              <span className="text-sm truncate">{item.title}</span>
                            )}
                          </NavLink>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[200px]">
                          <p className="font-medium">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              ))}
          </TooltipProvider>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-3">
          {/* Tier Badge */}
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
          
          {/* User Menu */}
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
  );
};

export default GenieStudioNavigation;
