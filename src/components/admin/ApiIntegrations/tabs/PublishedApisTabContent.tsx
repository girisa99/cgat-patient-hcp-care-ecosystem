
import React from 'react';
import PublishedApisSection from '../PublishedApisSection';
import ExternalApiPublisher from '../ExternalApiPublisher';

export const PublishedApisTabContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <PublishedApisSection />
      <ExternalApiPublisher />
    </div>
  );
};
