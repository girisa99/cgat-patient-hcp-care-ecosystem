
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface MobileMenuBarProps {
  onMenuClick: () => void;
}

const MobileMenuBar: React.FC<MobileMenuBarProps> = ({ onMenuClick }) => {
  return (
    <div className="fixed top-16 left-0 right-0 z-40 h-12 bg-background border-b px-4 flex items-center">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onMenuClick}
        className="flex items-center space-x-2"
      >
        <Menu className="h-4 w-4" />
        <span>Menu</span>
      </Button>
    </div>
  );
};

export default MobileMenuBar;
