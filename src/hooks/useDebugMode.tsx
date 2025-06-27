
import { useState, useEffect } from 'react';

export const useDebugMode = () => {
  const [debugMode, setDebugMode] = useState(false);
  const [layoutDebug, setLayoutDebug] = useState(false);

  const toggleDebugMode = () => {
    setDebugMode(prev => !prev);
    console.log('🐛 Debug mode:', !debugMode);
  };

  const toggleLayoutDebug = () => {
    setLayoutDebug(prev => !prev);
    console.log('📐 Layout debug:', !layoutDebug);
  };

  // Log layout measurements when debug is enabled
  useEffect(() => {
    if (layoutDebug) {
      const logLayoutInfo = () => {
        const header = document.querySelector('header');
        const sidebar = document.querySelector('[data-sidebar]');
        const main = document.querySelector('main');
        
        console.log('🔍 Layout Debug Measurements:');
        console.log('Header:', {
          height: header?.offsetHeight,
          position: header ? getComputedStyle(header).position : 'not found',
          zIndex: header ? getComputedStyle(header).zIndex : 'not found',
          top: header?.getBoundingClientRect().top,
        });
        console.log('Sidebar:', {
          width: sidebar?.offsetWidth,
          position: sidebar ? getComputedStyle(sidebar).position : 'not found',
          left: sidebar?.getBoundingClientRect().left,
        });
        console.log('Main:', {
          top: main?.getBoundingClientRect().top,
          left: main?.getBoundingClientRect().left,
          paddingTop: main ? getComputedStyle(main).paddingTop : 'not found',
          marginTop: main ? getComputedStyle(main).marginTop : 'not found',
        });
      };

      logLayoutInfo();
      const interval = setInterval(logLayoutInfo, 2000);
      return () => clearInterval(interval);
    }
  }, [layoutDebug]);

  return {
    debugMode,
    layoutDebug,
    toggleDebugMode,
    toggleLayoutDebug,
    setDebugMode
  };
};
