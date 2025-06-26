
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCheck,
  Settings,
  UserPlus,
  Shield,
  FileText
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Facilities', path: '/facilities', icon: Building2 },
    { name: 'Patients', path: '/patients', icon: UserCheck },
    { name: 'Onboarding', path: '/onboarding', icon: UserPlus },
    { name: 'Modules', path: '/modules', icon: Shield },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Audit Log', path: '/audit-log', icon: FileText },
  ];

  // Desktop Navigation (always visible)
  const DesktopNav = () => (
    <div className="h-full flex flex-col">
      <div className="px-3 py-6 border-b">
        <h2 className="text-lg font-semibold text-foreground">Admin Portal</h2>
        <p className="text-sm text-muted-foreground">Healthcare Management System</p>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary hover:text-foreground transition-colors group",
                isActive 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:border-r md:bg-background">
        <DesktopNav />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="px-6 py-6 border-b">
            <SheetTitle>Admin Portal</SheetTitle>
            <SheetDescription>
              Healthcare Management System
            </SheetDescription>
          </SheetHeader>
          <nav className="px-2 py-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary hover:text-foreground transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )
                }
                onClick={onClose}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;
