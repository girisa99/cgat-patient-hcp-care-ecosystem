/**
 * Genie Deck Page
 * AI-Powered Presentation Generator
 * Tagline: "Ideas to Impact"
 */

import React from 'react';
import { PresentationWizard } from '@/components/genie-studio/presentation-generator/PresentationWizard';
import { GENIE_PRODUCTS } from '@/constants/genie-products';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import genieDeckLogo from '@/assets/logos/genie-deck-combined.png';

export default function GenieDeck() {
  const product = GENIE_PRODUCTS.deck;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 flex-shrink-0">
        <div className="px-6 py-3">
          <div className="flex items-center gap-4">
            <Link to="/genie-studio">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Genie Studio
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <img 
              src={genieDeckLogo} 
              alt="Genie Deck" 
              className="h-14 w-auto"
            />
          </div>
        </div>
      </div>

      {/* Main Content - Full Height */}
      <div className="flex-1 overflow-hidden">
        <PresentationWizard className="h-full" />
      </div>
    </div>
  );
}
