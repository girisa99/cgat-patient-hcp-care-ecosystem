
import React from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface LayoutDebugOverlayProps {
  isEnabled: boolean;
}

export const LayoutDebugOverlay: React.FC<LayoutDebugOverlayProps> = ({ isEnabled }) => {
  const { isMobile, isTablet, currentBreakpoint } = useResponsiveLayout();

  if (!isEnabled) return null;

  // Get current measurements with proper type casting
  const headerElement = document.querySelector('header') as HTMLElement;
  const sidebarElement = document.querySelector('[data-sidebar]') as HTMLElement;
  const mainElement = document.querySelector('main') as HTMLElement;
  
  const headerHeight = headerElement?.offsetHeight || 0;
  const sidebarWidth = sidebarElement?.offsetWidth || 0;
  const mainTop = mainElement?.getBoundingClientRect().top || 0;
  const mainLeft = mainElement?.getBoundingClientRect().left || 0;

  return (
    <div className="fixed top-0 right-0 z-[9999] bg-red-500 text-white p-3 text-xs font-mono max-w-xs">
      <div className="mb-2 font-bold">🐛 Layout Debug Info</div>
      
      <div className="space-y-1">
        <div>Breakpoint: {currentBreakpoint}</div>
        <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
        <div>Tablet: {isTablet ? 'Yes' : 'No'}</div>
        <div>Header Height: {headerHeight}px</div>
        <div>Sidebar Width: {sidebarWidth}px</div>
        <div>Main Top: {mainTop}px</div>
        <div>Main Left: {mainLeft}px</div>
        <div>Window Height: {window.innerHeight}px</div>
        <div>Window Width: {window.innerWidth}px</div>
      </div>

      <div className="mt-2 text-yellow-200">
        <div>Expected Main Top: {headerHeight}px</div>
        <div>Gap Issue: {mainTop > headerHeight ? `+${mainTop - headerHeight}px` : 'None'}</div>
      </div>
    </div>
  );
};
