/**
 * Database-Aligned TypeScript Sidebar Component
 * Following verification standards and database schema patterns
 */
import * as React from "react"
import { Link, useLocation } from 'react-router-dom'
import { PanelLeft, User, LogOut } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';

// Database-aligned interfaces following verification standards
interface DatabaseSidebarContext {
  readonly state: "expanded" | "collapsed"
  readonly open: boolean
  readonly setOpen: (open: boolean) => void
  readonly openMobile: boolean  
  readonly setOpenMobile: (open: boolean) => void
  readonly isMobile: boolean
  readonly toggleSidebar: () => void
  readonly collapsed: boolean
}

// Constants aligned with database configuration patterns
const SIDEBAR_CONFIG = {
  COOKIE_NAME: "sidebar:state",
  COOKIE_MAX_AGE: 60 * 60 * 24 * 7,
  WIDTH: "16rem",
  WIDTH_MOBILE: "18rem", 
  WIDTH_ICON: "3rem",
} as const

const SidebarContext = React.createContext<DatabaseSidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

// Provider following database connection patterns
interface DatabaseSidebarProviderProps extends React.ComponentProps<"div"> {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const SidebarProvider = React.forwardRef<HTMLDivElement, DatabaseSidebarProviderProps>(
  ({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }, ref) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)
    const [_open, _setOpen] = React.useState(defaultOpen)
    
    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }
        document.cookie = `${SIDEBAR_CONFIG.COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_CONFIG.COOKIE_MAX_AGE}`
      },
      [setOpenProp, open]
    )

    const toggleSidebar = React.useCallback(() => {
      return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
    }, [isMobile, setOpen, setOpenMobile])

    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<DatabaseSidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
        collapsed: state === "collapsed",
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <div
          style={{
            "--sidebar-width": SIDEBAR_CONFIG.WIDTH,
            "--sidebar-width-icon": SIDEBAR_CONFIG.WIDTH_ICON,
            ...style,
          } as React.CSSProperties}
          className={cn("group/sidebar-wrapper flex min-h-svh w-full", className)}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

// Main sidebar following database entity patterns
interface DatabaseSidebarProps extends React.ComponentProps<"div"> {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}

const Sidebar = React.forwardRef<HTMLDivElement, DatabaseSidebarProps>(
  ({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }, ref) => {
    const { isMobile, state } = useSidebar()

    if (collapsible === "none") {
      return (
        <div
          className={cn("flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground", className)}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (isMobile) {
      return (
        <div className="mobile-sidebar-container" {...props}>
          <div className="w-[--sidebar-width-mobile] bg-sidebar p-0 text-sidebar-foreground">
            <div className="flex h-full w-full flex-col">{children}</div>
          </div>
        </div>
      )
    }

    const sidebarClasses = cn(
      "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex",
      side === "left" ? "left-0" : "right-0",
      "group-data-[collapsible=icon]:w-[--sidebar-width-icon] border-r",
      className
    )

    return (
      <div
        ref={ref}
        className="group peer hidden md:block text-sidebar-foreground"
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
      >
        <div className="duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear" />
        <div className={sidebarClasses} {...props}>
          <div className="flex h-full w-full flex-col bg-sidebar">
            {children}
          </div>
        </div>
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

// Database-aligned sidebar components
const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-2 p-2", className)} {...props} />
  )
)
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-2 p-2", className)} {...props} />
  )
)
SidebarFooter.displayName = "SidebarFooter"

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto", className)}
      {...props}
    />
  )
)
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props} />
  )
)
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70", className)}
      {...props}
    />
  )
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("w-full text-sm", className)} {...props} />
  )
)
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />
  )
)
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("group/menu-item relative", className)} {...props} />
  )
)
SidebarMenuItem.displayName = "SidebarMenuItem"

// Database-aligned menu button component
interface DatabaseSidebarMenuButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean
  isActive?: boolean
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, DatabaseSidebarMenuButtonProps>(
  ({ asChild = false, isActive = false, className, children, ...props }, ref) => {
    const baseClasses = cn(
      "flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-colors",
      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
      "disabled:pointer-events-none disabled:opacity-50",
      isActive && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
      className
    )

    if (asChild) {
      return (
        <div className={baseClasses}>
          {children}
        </div>
      )
    }

    return (
      <button
        ref={ref}
        className={baseClasses}
        {...props}
      >
        {children}
      </button>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

// Main app sidebar following database patterns  
export function AppSidebar() {
  const { collapsed } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const { user, profile, signOut } = useMasterAuth()
  
  // Use role-based navigation with fallback
  let availableTabs, currentRole, isAdmin, isSuperAdmin;
  try {
    const navigation = useRoleBasedNavigation()
    availableTabs = navigation.availableTabs
    currentRole = navigation.currentRole
    isAdmin = navigation.isAdmin
    isSuperAdmin = navigation.isSuperAdmin
  } catch (error) {
    console.warn('🔧 Role-based navigation failed, using fallback navigation');
    // Fallback navigation for all authenticated users
    availableTabs = [
      { title: 'Dashboard', to: '/', icon: () => '🏠' },
      { title: 'Users', to: '/users', icon: () => '👥' },
      { title: 'Patients', to: '/patients', icon: () => '🏥' },
      { title: 'Facilities', to: '/facilities', icon: () => '🏢' },
      { title: 'Modules', to: '/modules', icon: () => '📦' },
      { title: 'API Services', to: '/api-services', icon: () => '🔗' },
      { title: 'Testing', to: '/testing', icon: () => '🧪' },
      { title: 'Data Import', to: '/data-import', icon: () => '📊' },
      { title: 'Verification', to: '/active-verification', icon: () => '✅' },
      { title: 'Onboarding', to: '/onboarding', icon: () => '🚀' },
      { title: 'Security', to: '/security', icon: () => '🔒' }
    ]
    currentRole = 'Developer'
    isAdmin = true
    isSuperAdmin = false
  }

  const isActive = (path: string) => currentPath === path

  const getNavClassName = (path: string) => {
    return isActive(path) 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-accent hover:text-accent-foreground"
  }

  const handleSignOut = async () => {
    await signOut()
  }

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
                const Icon = tab.icon
                return (
                  <SidebarMenuItem key={tab.to}>
                     <SidebarMenuButton 
                       asChild 
                       isActive={isActive(tab.to)}
                     >
                       <Link to={tab.to} className={cn("flex items-center gap-3", getNavClassName(tab.to))}>
                         <Icon className="h-4 w-4 shrink-0" />
                         {!collapsed && <span className="truncate">{tab.title}</span>}
                       </Link>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
                )
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
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}