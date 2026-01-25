/**
 * GENIE WEBSITE ROUTES
 * Central routing configuration for the Genie Studio public website
 * Separate from internal app routes for clarity
 */
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PageLoading } from '@/components/ui/LoadingStates';

// Direct imports for critical pages
import GenieStudioLanding from '@/pages/GenieStudioLanding';
import GenieStudioAuth from '@/pages/GenieStudioAuth';
import GenieStudioPricing from '@/pages/GenieStudioPricing';
import GenieSupportPage from '@/pages/GenieSupportPage';
import GenieAdminPage from '@/pages/GenieAdminPage';

// Lazy imports for less critical pages
const GenieExplorePage = React.lazy(() => import('@/pages/GenieExplorePage'));
const GenieProductsPage = React.lazy(() => import('@/pages/GenieProductsPage'));

// Product page placeholder (will be expanded)
const ProductPagePlaceholder: React.FC<{ product: string }> = ({ product }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-2">Genie {product}</h1>
      <p className="text-muted-foreground">Product page coming soon</p>
    </div>
  </div>
);

/**
 * Genie Website Routes Component
 * To be integrated into main App.tsx
 */
export const GenieWebsiteRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoading message="Loading..." />}>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<GenieStudioLanding />} />
        
        {/* Explore Journey */}
        <Route path="/explore" element={<GenieExplorePage />} />
        <Route path="/explore/demo" element={<GenieExplorePage />} />
        <Route path="/explore/recommendation" element={<GenieExplorePage />} />
        
        {/* Products */}
        <Route path="/products" element={<GenieProductsPage />} />
        <Route path="/products/mind" element={<ProductPagePlaceholder product="Mind" />} />
        <Route path="/products/spark" element={<ProductPagePlaceholder product="Spark" />} />
        <Route path="/products/vibe" element={<ProductPagePlaceholder product="Vibe" />} />
        <Route path="/products/deck" element={<ProductPagePlaceholder product="Deck" />} />
        <Route path="/products/arc" element={<ProductPagePlaceholder product="Arc" />} />
        <Route path="/products/studio" element={<ProductPagePlaceholder product="Studio" />} />
        
        {/* Pricing & Auth */}
        <Route path="/pricing" element={<GenieStudioPricing />} />
        <Route path="/auth" element={<GenieStudioAuth />} />
        
        {/* Support */}
        <Route path="/support" element={<GenieSupportPage />} />
        
        {/* Admin (internal only) */}
        <Route path="/internal/users" element={<GenieAdminPage />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

/**
 * Route paths for navigation components
 */
export const GENIE_ROUTES = {
  home: '/',
  explore: '/explore',
  exploreDemo: '/explore/demo',
  exploreRecommendation: '/explore/recommendation',
  products: '/products',
  productMind: '/products/mind',
  productSpark: '/products/spark',
  productVibe: '/products/vibe',
  productDeck: '/products/deck',
  productArc: '/products/arc',
  productStudio: '/products/studio',
  pricing: '/pricing',
  auth: '/auth',
  support: '/support',
  internalUsers: '/internal/users',
  internalDogfooding: '/internal/dogfooding',
} as const;

export default GenieWebsiteRoutes;
