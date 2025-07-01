
import { useState, useEffect } from 'react';

export const useResponsiveLayout = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState('desktop');

  useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        setIsMobile(true);
        setIsTablet(false);
        setCurrentBreakpoint('mobile');
      } else if (width < 1024) {
        setIsMobile(false);
        setIsTablet(true);
        setCurrentBreakpoint('tablet');
      } else {
        setIsMobile(false);
        setIsTablet(false);
        setCurrentBreakpoint('desktop');
      }
    };

    checkResponsive();
    window.addEventListener('resize', checkResponsive);

    return () => window.removeEventListener('resize', checkResponsive);
  }, []);

  return { isMobile, isTablet, currentBreakpoint };
};
