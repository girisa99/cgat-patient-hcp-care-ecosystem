import React from 'react';
import { UnifiedPageWrapper } from '@/components/layout/UnifiedPageWrapper';
import { TestingModule } from '@/components/admin/Testing/TestingModule';

const Testing: React.FC = () => {
  console.log('🧪 Testing Page: Rendering with comprehensive TestingModule');

  return (
    <UnifiedPageWrapper
      title="Testing Services Suite"
      subtitle="Comprehensive testing and quality assurance tools with unified architecture"
      fluid
    >
      <TestingModule />
    </UnifiedPageWrapper>
  );
};

export default Testing;
