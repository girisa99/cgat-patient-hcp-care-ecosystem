
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Building2, 
  FileText, 
  Settings, 
  UserPlus,
  Heart
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { userRoles, hasRole } = useAuthContext();
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: FileText,
      href: '/dashboard',
      roles: ['superAdmin', 'healthcareProvider', 'nurse', 'caseManager', 'onboardingTeam', 'patientCaregiver']
    },
    {
      title: 'Patients',
      icon: Heart,
      href: '/patients',
      roles: ['healthcareProvider', 'nurse', 'caseManager']
    },
    {
      title: 'Users',
      icon: Users,
      href: '/users',
      roles: ['superAdmin', 'caseManager']
    },
    {
      title: 'Facilities',
      icon: Building2,
      href: '/facilities',
      roles: ['superAdmin', 'onboardingTeam']
    },
    {
      title: 'Onboarding',
      icon: UserPlus,
      href: '/onboarding',
      roles: ['superAdmin', 'onboardingTeam']
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/settings',
      roles: ['superAdmin']
    }
  ];

  const visibleItems = menuItems.filter(item => 
    item.roles.some(role => hasRole(role as any))
  );

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {visibleItems.map((item) => (
              <Button
                key={item.href}
                variant={location.pathname === item.href ? "default" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link to={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
