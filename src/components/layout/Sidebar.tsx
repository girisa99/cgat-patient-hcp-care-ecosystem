
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
    <div className="py-4 px-2">
      <div className="px-3 py-2 mb-4">
        <h2 className="text-lg font-semibold text-foreground">Admin Portal</h2>
        <p className="text-sm text-muted-foreground">Healthcare Management System</p>
      </div>
      {menuItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "flex items-center space-x-3 px-3 py-2 mx-1 text-sm font-medium rounded-md hover:bg-secondary hover:text-foreground transition-colors",
              isActive ? "bg-secondary text-foreground" : "text-muted-foreground"
            )
          }
        >
          <item.icon className="h-4 w-4" />
          <span>{item.name}</span>
        </NavLink>
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        <DesktopNav />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="px-5 pt-5 pb-4">
            <SheetTitle>Admin Portal</SheetTitle>
            <SheetDescription>
              Healthcare Management System
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-secondary hover:text-foreground transition-colors",
                    isActive ? "bg-secondary text-foreground" : "text-muted-foreground"
                  )
                }
                onClick={onClose}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;
