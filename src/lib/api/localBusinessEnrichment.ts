/**
 * Local Business Enrichment API client
 * Calls the local-business-enrichment edge function
 */

import { supabase } from '@/integrations/supabase/client';

export interface LocalEnrichmentRequest {
  businessName: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
  vertical?: string;
}

export interface PlaceResult {
  name: string;
  address: string;
  rating: number | null;
  totalRatings: number;
  placeId: string;
  types: string[];
  businessStatus: string | null;
  priceLevel: number | null;
  website: string | null;
  phoneNumber: string | null;
  openingHours: string[] | null;
}

export interface ReviewSnippet {
  author: string;
  rating: number;
  text: string;
  time: string;
}

export interface CompetitorInsight {
  title: string;
  url: string;
  snippet: string;
}

export interface LocalEnrichmentResult {
  place: PlaceResult | null;
  details: {
    reviews: ReviewSnippet[];
    editorialSummary: string | null;
    mapsUrl: string | null;
  } | null;
  competitors: CompetitorInsight[];
  query: string;
  vertical: string | null;
}

export async function fetchLocalBusinessEnrichment(
  request: LocalEnrichmentRequest
): Promise<{ success: boolean; data?: LocalEnrichmentResult; error?: string }> {
  const { data, error } = await supabase.functions.invoke('local-business-enrichment', {
    body: request,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data;
}
