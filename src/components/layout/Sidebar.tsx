
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  Users,
  Building2,
  UserCheck,
  Settings,
  UserPlus,
  Package,
  FileText,
  Code,
  ExternalLink,
  X,
  Activity
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Facilities', href: '/facilities', icon: Building2 },
  { name: 'Patients', href: '/patients', icon: UserCheck },
  { name: 'Onboarding', href: '/onboarding', icon: UserPlus },
  { name: 'Modules', href: '/modules', icon: Package },
  { name: 'API Integrations', href: '/api-integrations', icon: ExternalLink },
  { name: 'System Assessment', href: '/system-assessment', icon: Activity },
  { name: 'Audit Log', href: '/audit-log', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-full w-64 transform bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out shadow-lg",
        // Desktop: always visible, positioned statically within layout
        "md:translate-x-0 md:static md:z-auto md:shadow-none",
        // Mobile: slide in/out behavior
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Header section */}
        <div className="flex h-16 shrink-0 items-center px-6 bg-white border-b">
          <Code className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-semibold text-gray-900">
            Healthcare Admin
          </span>
          {/* Close button - only show on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="ml-auto p-2 md:hidden hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {/* Navigation section */}
        <nav className="flex flex-1 flex-col px-6 py-4 bg-white overflow-y-auto">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={onClose}
                        className={cn(
                          isActive
                            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50',
                          'group flex gap-x-3 rounded-md p-2 text-sm font-medium transition-colors'
                        )}
                      >
                        <item.icon
                          className={cn(
                            isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600',
                            'h-5 w-5 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
