
import { useState, useEffect } from 'react';
import { useDesignSystem } from '@/components/ui/design-system/DesignSystemProvider';

export type BreakpointKey = 'mobile' | 'tablet' | 'laptop' | 'desktop';

export const useResponsiveLayout = () => {
  const { breakpoints } = useDesignSystem();
  const [currentBreakpoint, setCurrentBreakpoint] = useState<BreakpointKey>('desktop');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isLaptop, setIsLaptop] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width < parseInt(breakpoints.mobile)) {
        setCurrentBreakpoint('mobile');
        setIsMobile(true);
        setIsTablet(false);
        setIsLaptop(false);
        setIsDesktop(false);
      } else if (width < parseInt(breakpoints.tablet)) {
        setCurrentBreakpoint('tablet');
        setIsMobile(false);
        setIsTablet(true);
        setIsLaptop(false);
        setIsDesktop(false);
      } else if (width < parseInt(breakpoints.laptop)) {
        setCurrentBreakpoint('laptop');
        setIsMobile(false);
        setIsTablet(false);
        setIsLaptop(true);
        setIsDesktop(false);
      } else {
        setCurrentBreakpoint('desktop');
        setIsMobile(false);
        setIsTablet(false);
        setIsLaptop(false);
        setIsDesktop(true);
      }
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, [breakpoints]);

  return {
    currentBreakpoint,
    isMobile,
    isTablet,
    isLaptop,
    isDesktop,
    breakpoints,
  };
};
