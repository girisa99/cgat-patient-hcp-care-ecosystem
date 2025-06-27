
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Users,
  Settings,
  Home,
  UserCheck,
  Hospital,
  Layers,
  Database,
  Shield,
  Activity,
  FileText
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Consistent Users', href: '/consistent-users', icon: UserCheck },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Facilities', href: '/facilities', icon: Hospital },
    { name: 'Modules', href: '/modules', icon: Layers },
    { name: 'API Management', href: '/api-management', icon: Database },
    { name: 'API Integrations', href: '/api-integrations', icon: Settings },
    { name: 'Audit Log', href: '/audit-log', icon: Shield },
    { name: 'Admin Verification', href: '/admin-verification', icon: Activity },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 border-r border-gray-200">
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Healthcare Admin</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
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
    </div>
  );
};

export default Sidebar;
