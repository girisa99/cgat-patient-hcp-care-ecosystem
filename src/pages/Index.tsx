
import { useEffect } from 'react';
import { useIntelligentRouting } from '@/hooks/useIntelligentRouting';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const Index = () => {
  const { performIntelligentRouting, isRouting } = useIntelligentRouting();

  useEffect(() => {
    // Trigger intelligent routing when the component mounts
    performIntelligentRouting();
  }, [performIntelligentRouting]);

  if (isRouting) {
    return <LoadingSpinner />;
  }

  // This should rarely be seen as intelligent routing should redirect
  return <LoadingSpinner />;
};

export default Index;
