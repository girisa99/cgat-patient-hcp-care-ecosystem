/**
 * GENIE STUDIO NAVIGATION COMPONENT
 * Clean, collapsible sidebar with 4-Quadrant workflow
 * MANAGE category expands to show sub-categories
 */

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useGenieStudioNavigation } from '@/hooks/useGenieStudioNavigation';
import { useGenieStudioAuth } from '@/hooks/useGenieStudioAuth';
import { getManageItemsBySubCategory } from '@/config/genieStudioNavItems';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ChevronDown, 
  ChevronRight,
  LogOut, 
  Crown,
  PanelLeftClose,
  PanelLeft,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';

interface GenieStudioNavigationProps {
  variant?: 'sidebar' | 'topbar';
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const CATEGORY_CONFIG: Record<string, { label: string; collapsible?: boolean }> = {
  main: { label: 'Workspace' },
  tools: { label: 'Create', collapsible: true },
  production: { label: 'Produce', collapsible: true },
  manage: { label: 'Manage', collapsible: true },
  publish: { label: 'Publish', collapsible: true },
  account: { label: 'Account' },
};

// Correct sequence: Workspace → Create → Produce → Manage → Publish → Account
const CATEGORY_ORDER = ['main', 'tools', 'production', 'manage', 'publish', 'account'];

export const GenieStudioNavigation: React.FC<GenieStudioNavigationProps> = ({ 
  variant = 'sidebar',
  defaultCollapsed = false,
  onCollapsedChange,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { navByCategory, tierInfo, userTier, isInternal } = useGenieStudioNavigation();
  const { genieUser, signOut } = useGenieStudioAuth();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  
  // Persist navigation state to localStorage to prevent losing Genie Cast visibility
  const [openCategories, setOpenCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('genie_nav_open_categories');
    return saved ? JSON.parse(saved) : ['manage'];
  });
  
  const [openSubCategories, setOpenSubCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('genie_nav_open_subcategories');
    return saved ? JSON.parse(saved) : ['Create', 'Plan'];
  });

  // Persist open categories state
  useEffect(() => {
    localStorage.setItem('genie_nav_open_categories', JSON.stringify(openCategories));
  }, [openCategories]);

  // Persist open subcategories state
  useEffect(() => {
    localStorage.setItem('genie_nav_open_subcategories', JSON.stringify(openSubCategories));
  }, [openSubCategories]);

  // Memoize manage subcategories - ALWAYS pass true for internal during dev
  // This ensures Genie Cast and other internal tabs are always visible in dev mode
  const manageSubCategories = React.useMemo(() => {
    // DEV_MODE: Always treat as internal to show all tabs
    const effectiveIsInternal = true; // Force internal access for dev
    return getManageItemsBySubCategory(userTier, effectiveIsInternal);
  }, [userTier]);

  // Auto-expand Create subcategory when internal user and it has items
  useEffect(() => {
    if (isInternal && manageSubCategories['Create']?.length > 0) {
      setOpenSubCategories(prev => {
        if (!prev.includes('Create')) {
          const updated = [...prev, 'Create'];
          localStorage.setItem('genie_nav_open_subcategories', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
      // Also ensure MANAGE is open
      setOpenCategories(prev => {
        if (!prev.includes('manage')) {
          const updated = [...prev, 'manage'];
          localStorage.setItem('genie_nav_open_categories', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    }
  }, [isInternal, manageSubCategories]);

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

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

  const toggleSubCategory = (subCat: string) => {
    setOpenSubCategories(prev => 
      prev.includes(subCat) 
        ? prev.filter(c => c !== subCat)
        : [...prev, subCat]
    );
  };

  // Check if current path is in a category
  const isPathInCategory = (category: string) => {
    const items = navByCategory[category] || [];
    return items.some(item => {
      const itemPath = item.url.split('?')[0];
      const currentPath = location.pathname;
      return currentPath === itemPath || currentPath.startsWith(itemPath);
    });
  };

  if (variant === 'topbar') {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <NavLink to="/genie-studio" className="flex items-center gap-2">
            <img src={genieSuiteLogo} alt="Genie Studio" className="h-8" />
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
                alt="Genie Studio" 
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

          {/* Navigation */}
          <ScrollArea className="flex-1 px-2 py-3">
            {CATEGORY_ORDER
              .filter(category => {
                // For MANAGE, check if there are any sub-items
                if (category === 'manage') {
                  return Object.keys(manageSubCategories).length > 0;
                }
                return navByCategory[category]?.length > 0;
              })
              .map((category, idx) => {
                const config = CATEGORY_CONFIG[category];
                const items = navByCategory[category] || [];
                const isActive = isPathInCategory(category);

                // Special handling for MANAGE category with sub-categories
                if (category === 'manage') {
                  const isManageOpen = openCategories.includes('manage');
                  
                  if (isCollapsed) {
                    return (
                      <div key={category} className={cn(idx > 0 && "mt-2")}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex justify-center py-1.5 cursor-pointer hover:bg-muted/50 rounded">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right">{config.label}</TooltipContent>
                        </Tooltip>
                      </div>
                    );
                  }

                  return (
                    <div key={category} className={cn(idx > 0 && "mt-2")}>
                      <Collapsible open={isManageOpen} onOpenChange={() => toggleCategory('manage')}>
                        <CollapsibleTrigger asChild>
                          <button className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-muted/50 transition-colors">
                            <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                              {config.label}
                            </span>
                            {isManageOpen ? (
                              <ChevronDown className="h-3 w-3 text-muted-foreground/50" />
                            ) : (
                              <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                            )}
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-0.5 mt-0.5">
                          {Object.entries(manageSubCategories).map(([subCat, subItems]) => (
                            <Collapsible
                              key={subCat}
                              open={openSubCategories.includes(subCat)}
                              onOpenChange={() => toggleSubCategory(subCat)}
                            >
                              <CollapsibleTrigger asChild>
                                <button className="w-full flex items-center justify-between px-2 py-1 rounded text-xs hover:bg-muted/30 transition-colors">
                                  <span className="text-muted-foreground font-medium">{subCat}</span>
                                  {openSubCategories.includes(subCat) ? (
                                    <ChevronDown className="h-2.5 w-2.5 text-muted-foreground/50" />
                                  ) : (
                                    <ChevronRight className="h-2.5 w-2.5 text-muted-foreground/50" />
                                  )}
                                </button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="pl-2 space-y-0.5">
                                {subItems.map(item => (
                                  <NavLink
                                    key={item.url}
                                    to={item.url}
                                    title={item.description}
                                    className={({ isActive }) =>
                                      cn(
                                        "flex items-center gap-2 rounded px-2 py-1 text-xs transition-colors",
                                        isActive
                                          ? "bg-primary/10 text-primary font-medium"
                                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                      )
                                    }
                                  >
                                    <item.icon className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{item.title}</span>
                                  </NavLink>
                                ))}
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                    );
                }

                // Collapsible workflow categories (Create, Produce, Publish)
                if (config.collapsible && !isCollapsed) {
                  const isCategoryOpen = openCategories.includes(category);
                  
                  return (
                    <div key={category} className={cn(idx > 0 && "mt-2")}>
                      <Collapsible open={isCategoryOpen} onOpenChange={() => toggleCategory(category)}>
                        <CollapsibleTrigger asChild>
                          <button className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-muted/50 transition-colors">
                            <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                              {config.label}
                            </span>
                            {isCategoryOpen ? (
                              <ChevronDown className="h-3 w-3 text-muted-foreground/50" />
                            ) : (
                              <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                            )}
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-0.5 mt-0.5">
                          {items.map(item => (
                            <NavLink
                              key={item.url}
                              to={item.url}
                              title={item.description}
                              className={({ isActive }) =>
                                cn(
                                  "flex items-center gap-2.5 rounded px-2.5 py-1.5 text-sm transition-all",
                                  isActive
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )
                              }
                            >
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{item.title}</span>
                            </NavLink>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  );
                }

                // Non-collapsible categories (Workspace, Account) or collapsed sidebar view
                return (
                  <div key={category} className={cn(idx > 0 && "mt-2")}>
                    {!isCollapsed && (
                      <h4 className="mb-0.5 px-2 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                        {config.label}
                      </h4>
                    )}

                    <div className="space-y-0.5">
                      {items.map(item => 
                        isCollapsed ? (
                          <Tooltip key={item.url}>
                            <TooltipTrigger asChild>
                              <NavLink
                                to={item.url}
                                className={({ isActive }) =>
                                  cn(
                                    "flex items-center justify-center rounded p-2 transition-all",
                                    isActive
                                      ? "bg-primary/10 text-primary"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                  )
                                }
                              >
                                <item.icon className="h-4 w-4" />
                              </NavLink>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              {item.title}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <NavLink
                            key={item.url}
                            to={item.url}
                            title={item.description}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center gap-2.5 rounded px-2.5 py-1.5 text-sm transition-all",
                                isActive
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              )
                            }
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{item.title}</span>
                          </NavLink>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
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
