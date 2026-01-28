/**
 * GENIE STUDIO NAVIGATION COMPONENT
 * Displays only Genie Studio pages based on subscription tier
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useGenieStudioNavigation } from '@/hooks/useGenieStudioNavigation';
import { useGenieStudioAuth } from '@/hooks/useGenieStudioAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ChevronDown, 
  LogOut, 
  Crown,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';

interface GenieStudioNavigationProps {
  variant?: 'sidebar' | 'topbar';
}

const CATEGORY_LABELS: Record<string, string> = {
  main: 'Workspace',
  production: 'Production',
  tools: 'Creative Tools',
  account: 'Account',
  admin: 'Administration',
};

const CATEGORY_ORDER = ['main', 'production', 'tools', 'admin', 'account'];

export const GenieStudioNavigation: React.FC<GenieStudioNavigationProps> = ({ 
  variant = 'sidebar' 
}) => {
  const navigate = useNavigate();
  const { navByCategory, tierInfo, userTier, isInternal } = useGenieStudioNavigation();
  const { genieUser, signOut } = useGenieStudioAuth();

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
          {/* Logo */}
          <NavLink to="/genie-studio" className="flex items-center gap-2">
            <img src={genieSuiteLogo} alt="Genie Studio" className="h-8" />
          </NavLink>

          {/* Nav Items */}
          <div className="flex items-center gap-1">
            {Object.entries(navByCategory)
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

          {/* User Menu */}
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

  // Sidebar variant
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center border-b px-4">
          <NavLink to="/genie-studio" className="flex items-center gap-2">
            <img src={genieSuiteLogo} alt="Genie Studio" className="h-8" />
          </NavLink>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          {CATEGORY_ORDER
            .filter(category => navByCategory[category]?.length > 0)
            .map((category, idx) => (
              <div key={category} className={cn(idx > 0 && "mt-6")}>
                <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {CATEGORY_LABELS[category]}
                </h4>
                <div className="space-y-1">
                  {navByCategory[category].map(item => (
                    <NavLink
                      key={item.url}
                      to={item.url}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="mb-3 flex items-center justify-between">
            <Badge variant="outline" className={cn("text-xs", tierInfo.color)}>
              {(() => {
                const TierIcon = tierInfo.icon;
                return TierIcon ? <TierIcon className="h-3 w-3 mr-1" /> : null;
              })()}
              {tierInfo.name}
            </Badge>
            {isInternal && (
              <Badge variant="secondary" className="text-xs">
                Internal
              </Badge>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 px-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={genieUser?.avatar_url || undefined} alt={genieUser?.display_name || ''} />
                  <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate text-left text-sm">
                  {genieUser?.display_name || genieUser?.email}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
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
