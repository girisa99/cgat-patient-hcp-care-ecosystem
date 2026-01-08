import React, { Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { PageLoading } from '@/components/ui/LoadingStates';
import { DocumentProcessingPresentation } from '@/components/document-processing/DocumentProcessingPresentation';

interface Presentation {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  thumbnail_url: string | null;
  og_image_url: string | null;
  presentation_type: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_public: boolean;
}

const PublicPresentationPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPresentation = async () => {
      if (!slug) {
        setError('Presentation not found');
        setIsLoading(false);
        return;
      }

      // Handle legacy slug
      if (slug === 'document-processing') {
        setPresentation({
          id: 'legacy-doc-processing',
          name: 'AI Document Processing Platform',
          description: 'Multi-model AI for intelligent document extraction with 95%+ accuracy',
          slug: 'document-processing',
          thumbnail_url: null,
          og_image_url: '/og-document-processing.png',
          presentation_type: 'document-processing',
          meta_title: 'AI Document Processing Platform | Lovable',
          meta_description: 'Revolutionize your document processing with multi-model AI. 95%+ accuracy, 75x faster processing, 99% cost reduction.',
          is_public: true
        });
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('presentations')
          .select('*')
          .eq('slug', slug)
          .eq('is_public', true)
          .single();

        if (fetchError || !data) {
          setError('Presentation not found or not public');
          setIsLoading(false);
          return;
        }

        setPresentation(data);

        // Increment view count
        await supabase
          .from('presentations')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', data.id);

      } catch (err) {
        console.error('Error fetching presentation:', err);
        setError('Failed to load presentation');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPresentation();
  }, [slug]);

  if (isLoading) {
    return <PageLoading message="Loading presentation..." />;
  }

  if (error || !presentation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Presentation Not Found</h1>
          <p className="text-white/70">{error || 'The requested presentation does not exist or is not public.'}</p>
        </div>
      </div>
    );
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const ogImageUrl = presentation.og_image_url || `${baseUrl}/og-document-processing.png`;

  // Render based on presentation type
  const renderPresentation = () => {
    switch (presentation.presentation_type) {
      case 'document-processing':
        return <DocumentProcessingPresentation isPublicView={true} />;
      // Add more presentation types here
      default:
        return <DocumentProcessingPresentation isPublicView={true} />;
    }
  };

  return (
    <>
      <Helmet>
        <title>{presentation.meta_title || presentation.name}</title>
        <meta name="description" content={presentation.meta_description || presentation.description || ''} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${baseUrl}/public/presentation/${presentation.slug}`} />
        <meta property="og:title" content={presentation.meta_title || presentation.name} />
        <meta property="og:description" content={presentation.meta_description || presentation.description || ''} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`${baseUrl}/public/presentation/${presentation.slug}`} />
        <meta name="twitter:title" content={presentation.meta_title || presentation.name} />
        <meta name="twitter:description" content={presentation.meta_description || presentation.description || ''} />
        <meta name="twitter:image" content={ogImageUrl} />
        
        {/* LinkedIn specific */}
        <meta property="og:image:secure_url" content={ogImageUrl} />
        <meta property="og:site_name" content="Lovable AI" />
        <meta property="article:author" content="Lovable AI" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-7xl">
          {renderPresentation()}
        </div>
      </div>
    </>
  );
};

export default PublicPresentationPage;
