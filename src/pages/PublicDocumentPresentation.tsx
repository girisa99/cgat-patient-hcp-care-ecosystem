/**
 * PUBLIC DOCUMENT PROCESSING PRESENTATION
 * Publicly accessible presentation page for sharing on LinkedIn, social media, etc.
 * No authentication required - designed for external viewers
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { DocumentProcessingPresentation } from '@/components/document-processing/DocumentProcessingPresentation';

const PublicDocumentPresentation: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>AI Document Processing Platform | Multi-Model Intelligent Routing</title>
        <meta name="description" content="Revolutionary AI-powered document processing with multi-model routing achieving 95%+ accuracy. Transform healthcare document workflows with zero-configuration auto-detection." />
        <meta property="og:title" content="AI Document Processing Platform" />
        <meta property="og:description" content="Multi-Model AI achieves 95%+ accuracy with 99% cost reduction. See the future of document processing." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://genieaiexpermentationhub.tech/og-document-processing.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Document Processing Platform" />
        <meta name="twitter:description" content="Multi-Model AI achieves 95%+ accuracy with 99% cost reduction." />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-7xl">
          <DocumentProcessingPresentation 
            isPublicView={true}
          />
        </div>
      </div>
    </>
  );
};

export default PublicDocumentPresentation;
