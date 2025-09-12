import React from 'react';
import { Helmet } from 'react-helmet-async';
import { AIModelDemo } from '@/components/ai/AIModelDemo';

const AIModels: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>AI Model Categories - Healthcare Platform</title>
        <meta name="description" content="Test and explore different AI model categories including LLM, Small Language, and Vision Language models" />
      </Helmet>
      <div className="container mx-auto p-6">
        <AIModelDemo />
      </div>
    </>
  );
};

export default AIModels;