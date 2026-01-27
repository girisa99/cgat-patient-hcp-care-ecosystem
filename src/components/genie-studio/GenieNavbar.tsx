/**
 * GENIE NAVBAR - Shared navigation component
 * Used across all Genie Studio public pages for consistent navigation
 */
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';

interface GenieNavbarProps {
  showBackButton?: boolean;
  backTo?: string;
  backLabel?: string;
  rightContent?: React.ReactNode;
}

export const GenieNavbar: React.FC<GenieNavbarProps> = ({
  showBackButton = true,
  backTo = '/genie-landing',
  backLabel = 'Home',
  rightContent,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/genie-landing" className="flex items-center gap-2">
          <img src={genieSuiteLogo} alt="Genie Suite" className="h-8 w-auto" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Genie Studio
          </span>
        </Link>

        {/* Center Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            to="/genie-landing#products" 
            className={`text-sm font-medium transition ${isActive('/genie-landing') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Products
          </Link>
          <Link 
            to="/pricing" 
            className={`text-sm font-medium transition ${isActive('/pricing') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Pricing
          </Link>
          <Link 
            to="/explore" 
            className={`text-sm font-medium transition ${isActive('/explore') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Explore
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button 
              variant="ghost" 
              onClick={() => navigate(backTo)} 
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              {backTo === '/genie-landing' ? <Home className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
              <span className="hidden sm:inline">{backLabel}</span>
            </Button>
          )}
          {rightContent}
          <Link to="/genie-studio-auth">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
              Start Free
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default GenieNavbar;
