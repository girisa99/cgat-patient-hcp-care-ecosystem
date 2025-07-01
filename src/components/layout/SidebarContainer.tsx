
import React from 'react';
import Sidebar from './Sidebar';

interface SidebarContainerProps {
  isMobile: boolean;
  sidebarOpen: boolean;
  onSidebarClose: () => void;
}

const SidebarContainer: React.FC<SidebarContainerProps> = ({ 
  isMobile, 
  sidebarOpen, 
  onSidebarClose 
}) => {
  if (isMobile) {
    return (
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={onSidebarClose} 
      />
    );
  }

  return (
    <div className="w-64 flex-shrink-0">
      <div className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto">
        <Sidebar />
      </div>
    </div>
  );
};

export default SidebarContainer;
