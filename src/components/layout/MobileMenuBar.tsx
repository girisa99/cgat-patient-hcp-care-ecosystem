
import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileMenuBarProps {
  onMenuClick: () => void;
}

const MobileMenuBar: React.FC<MobileMenuBarProps> = ({ onMenuClick }) => {
  return (
    <div className="fixed top-16 left-0 right-0 z-30 h-12 bg-gray-50 border-b border-gray-200 flex items-center px-4 md:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuClick}
        className="flex items-center"
      >
        <Menu className="h-4 w-4 mr-2" />
        Menu
      </Button>
    </div>
  );
};

export default MobileMenuBar;
