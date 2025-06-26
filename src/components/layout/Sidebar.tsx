import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCheck,
  Settings,
  UserPlus,
  Shield
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Facilities', path: '/facilities', icon: Building2 },
    { name: 'Patients', path: '/patients', icon: UserCheck },
    { name: 'Onboarding', path: '/onboarding', icon: UserPlus },
    { name: 'Modules', path: '/modules', icon: Shield },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="px-5 pt-5 pb-4">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navigate your dashboard
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
  );
};

export default Sidebar;
