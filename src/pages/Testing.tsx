
import React from 'react';
import { UnifiedPageWrapper } from '@/components/layout/UnifiedPageWrapper';
import { SimpleTestingModule } from '@/components/admin/Testing/SimpleTestingModule';

const Testing: React.FC = () => {
  console.log('🧪 Testing Page: Rendering with simplified module');

  return (
    <UnifiedPageWrapper
      title="Testing Services Suite"
      subtitle="Comprehensive testing and quality assurance tools (Simplified for debugging)"
      fluid
    >
      <SimpleTestingModule />
    </UnifiedPageWrapper>
  );
};

export default Testing;
