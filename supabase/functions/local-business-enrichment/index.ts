/**
 * local-business-enrichment — Google Places API + Firecrawl review scraping
 * 
 * Accepts: { businessName, city, state, zipcode, country, vertical }
 * Returns: { place, reviews, competitors }
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnrichmentRequest {
  businessName: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
  vertical?: string;
}

interface PlaceResult {
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: EnrichmentRequest = await req.json();
    const { businessName, city, state, zipcode, country, vertical } = body;

    if (!businessName) {
      return new Response(
        JSON.stringify({ success: false, error: 'businessName is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!googleApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'GOOGLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build location query
    const locationParts = [city, state, zipcode, country].filter(Boolean);
    const locationQuery = locationParts.length > 0 ? locationParts.join(', ') : '';
    const searchQuery = `${businessName} ${locationQuery}`.trim();

    console.log(`🔍 Enriching: "${searchQuery}" (vertical: ${vertical || 'none'})`);

    // ── Step 1: Google Places Text Search ────────────────────────────────
    const placesUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    placesUrl.searchParams.set('query', searchQuery);
    placesUrl.searchParams.set('key', googleApiKey);
    if (vertical) placesUrl.searchParams.set('type', mapVerticalToPlaceType(vertical));

    const placesRes = await fetch(placesUrl.toString());
    const placesData = await placesRes.json();

    let place: PlaceResult | null = null;
    let placeDetails: Record<string, unknown> | null = null;

    if (placesData.status === 'OK' && placesData.results?.length > 0) {
      const top = placesData.results[0];
      place = {
        name: top.name,
        address: top.formatted_address,
        rating: top.rating ?? null,
        totalRatings: top.user_ratings_total ?? 0,
        placeId: top.place_id,
        types: top.types ?? [],
        businessStatus: top.business_status ?? null,
        priceLevel: top.price_level ?? null,
        website: null,
        phoneNumber: null,
        openingHours: null,
      };

      // ── Step 2: Place Details (reviews, website, phone) ──────────────
      const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
      detailsUrl.searchParams.set('place_id', top.place_id);
      detailsUrl.searchParams.set('fields', 'name,rating,reviews,website,formatted_phone_number,opening_hours,url,editorial_summary');
      detailsUrl.searchParams.set('key', googleApiKey);

      const detailsRes = await fetch(detailsUrl.toString());
      const detailsData = await detailsRes.json();

      if (detailsData.status === 'OK' && detailsData.result) {
        const d = detailsData.result;
        place.website = d.website ?? null;
        place.phoneNumber = d.formatted_phone_number ?? null;
        place.openingHours = d.opening_hours?.weekday_text ?? null;

        placeDetails = {
          reviews: (d.reviews ?? []).slice(0, 5).map((r: any) => ({
            author: r.author_name,
            rating: r.rating,
            text: r.text,
            time: r.relative_time_description,
          })),
          editorialSummary: d.editorial_summary?.overview ?? null,
          mapsUrl: d.url ?? null,
        };
      }
    }

    // ── Step 3: Firecrawl competitor scraping (optional) ─────────────────
    let competitorInsights: unknown[] = [];
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (firecrawlKey && city && vertical) {
      try {
        const competitorQuery = `best ${mapVerticalToSearchTerm(vertical)} in ${city}${state ? ', ' + state : ''}`;
        console.log(`🔎 Firecrawl competitor search: "${competitorQuery}"`);

        const fcRes = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: competitorQuery,
            limit: 5,
            scrapeOptions: { formats: ['markdown'] },
          }),
        });

        const fcData = await fcRes.json();
        if (fcData.success && fcData.data) {
          competitorInsights = fcData.data.slice(0, 5).map((r: any) => ({
            title: r.title,
            url: r.url,
            snippet: r.description || r.markdown?.slice(0, 200),
          }));
        }
      } catch (e) {
        console.warn('Firecrawl competitor search failed:', e);
      }
    }

    console.log(`✅ Enrichment complete: place=${place ? 'found' : 'not found'}, reviews=${placeDetails ? (placeDetails.reviews as any[])?.length : 0}, competitors=${competitorInsights.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          place,
          details: placeDetails,
          competitors: competitorInsights,
          query: searchQuery,
          vertical,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Enrichment error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────

function mapVerticalToPlaceType(vertical: string): string {
  const map: Record<string, string> = {
    food_beverage: 'restaurant',
    healthcare: 'health',
    finance: 'finance',
    education: 'school',
    retail: 'store',
    real_estate: 'real_estate_agency',
    automotive: 'car_dealer',
    legal: 'lawyer',
    travel: 'travel_agency',
    entertainment: 'movie_theater',
    technology: 'electronics_store',
    insurance: 'insurance_agency',
  };
  return map[vertical] || 'establishment';
}

function mapVerticalToSearchTerm(vertical: string): string {
  const map: Record<string, string> = {
    food_beverage: 'restaurants and cafes',
    healthcare: 'healthcare providers',
    finance: 'financial services',
    education: 'education centers',
    retail: 'retail stores',
    real_estate: 'real estate agencies',
    automotive: 'auto dealers',
    legal: 'law firms',
    travel: 'travel agencies',
    entertainment: 'entertainment venues',
    technology: 'tech companies',
    manufacturing: 'manufacturers',
    logistics: 'logistics companies',
    insurance: 'insurance companies',
    telecom: 'telecom providers',
    professional_services: 'professional service firms',
  };
  return map[vertical] || 'businesses';
}
