
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { navItems } from '@/nav-items';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "flex h-full w-64 flex-col bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out",
        "md:translate-x-0 fixed left-0 top-0 z-50",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div className="flex flex-shrink-0 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">Healthcare Portal</h1>
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <nav className="mt-5 flex-1 space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              
              return (
                <Link
                  key={item.title}
                  to={item.to}
                  onClick={onClose}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <span className={cn(
                    'mr-3 flex-shrink-0',
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  )}>
                    {item.icon}
                  </span>
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
