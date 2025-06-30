
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Users,
  Settings,
  Home,
  Hospital,
  Layers,
  Database,
  Shield,
  Activity,
  UserPlus,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const location = useLocation();
  
  // Updated navigation with Onboarding link
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Facilities', href: '/facilities', icon: Hospital },
    { name: 'Onboarding', href: '/onboarding', icon: UserPlus },
    { name: 'Modules', href: '/modules', icon: Layers },
    { name: 'API Integrations', href: '/api-integrations', icon: Database },
    { name: 'Audit Log', href: '/audit-log', icon: Shield },
    { name: 'Admin Verification', href: '/admin-verification', icon: Activity },
  ];

  const NavigationItems = () => (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onClose}
            className={cn(
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-blue-100 text-blue-900'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <item.icon
              className={cn(
                'mr-3 h-5 w-5 flex-shrink-0',
                isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              )}
            />
            {item.name}
          </NavLink>
        );
      })}
    </nav>
  );

  // Mobile overlay - only when onClose is provided (indicating mobile usage)
  if (onClose) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50" 
              onClick={onClose}
            />
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-full w-64 bg-gray-50 border-r border-gray-200 shadow-lg">
              <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900">Healthcare Admin</h1>
                <button
                  onClick={onClose}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <NavigationItems />
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop sidebar (default behavior when no onClose prop is provided)
  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 border-r border-gray-200">
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Healthcare Admin</h1>
      </div>
      
      <NavigationItems />
    </div>
  );
};

export default Sidebar;
