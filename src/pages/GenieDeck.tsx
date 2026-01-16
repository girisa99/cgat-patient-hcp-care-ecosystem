/**
 * Genie Deck Page
 * AI-Powered Presentation Generator
 * Tagline: "Ideas to Impact"
 */

import React from 'react';
import { PresentationWizard } from '@/components/genie-studio/presentation-generator/PresentationWizard';
import { GENIE_PRODUCTS } from '@/constants/genie-products';
import genieDeckLogo from '@/assets/logos/genie-deck-combined.png';

export default function GenieDeck() {
  const product = GENIE_PRODUCTS.deck;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <img 
              src={genieDeckLogo} 
              alt="Genie Deck" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                {product.name}
              </h1>
              <p className="text-sm text-muted-foreground">{product.tagline}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <PresentationWizard />
      </div>
    </div>
  );
}
