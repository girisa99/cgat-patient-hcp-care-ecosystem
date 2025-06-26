
import { useState } from 'react';

export const useDebugMode = () => {
  const [debugMode, setDebugMode] = useState(false);

  const handleToggleDebug = () => {
    setDebugMode(!debugMode);
  };

  return {
    debugMode,
    handleToggleDebug
  };
};
