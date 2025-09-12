import { corsHeaders } from '../_shared/cors.ts';

// Utility: Safe XML text extraction
function extractTag(xml: string, tag: string): string | null {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return m ? m[1] : null;
}

function extractAttr(xml: string, tag: string, attr: string): string | null {
  const m = xml.match(new RegExp(`<${tag}[^>]*${attr}=\"([^\"]+)\"`));
  return m ? m[1] : null;
}

// Parse YouTube RSS entries into a common VisualContentSource
function parseYouTubeRSS(xml: string, sourceName: string, query: string) {
  const entries = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)).map((m) => m[0]);
  const q = query.toLowerCase();
  const qTokens = q.split(/\s+/).filter(Boolean);

  return entries.map((entry) => {
    const title = extractTag(entry, 'title') || 'Untitled';
    const published = extractTag(entry, 'published') || undefined;
    const videoId = extractTag(entry, 'yt:videoId') || '';
    const link = extractAttr(entry, 'link', 'href') || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined);
    let thumbnail = extractAttr(entry, 'media:thumbnail', 'url') || '';
    if (!thumbnail && videoId) thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    // Simple relevance: proportion of tokens contained in title
    const t = title.toLowerCase();
    const matches = qTokens.length ? qTokens.filter((tok) => t.includes(tok)).length : 1;
    const relevance = qTokens.length ? matches / qTokens.length : 0.6; // default medium relevance

    return {
      id: videoId || link || `${sourceName}-${Math.random().toString(36).slice(2)}`,
      title,
      description: '',
      imageUrl: undefined,
      videoUrl: link,
      thumbnailUrl: thumbnail || undefined,
      sourceType: 'youtube' as const,
      sourceName,
      publishedDate: published,
      tags: qTokens,
      relevanceScore: Math.min(1, Math.max(0.1, relevance)),
    };
  });
}

async function fetchYouTubeFeedByUser(user: string): Promise<string | null> {
  try {
    const url = `https://www.youtube.com/feeds/videos.xml?user=${encodeURIComponent(user)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/rss+xml, application/xml' } });
    if (!res.ok) return null;
    return await res.text();
  } catch (_) {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query = '', limit = 10 } = await req.json();

    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'query is required', sources: [], totalFound: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Target sources (YouTube channels first — public RSS, no keys needed)
    const channels = [
      { name: 'Nature Video', user: 'NatureVideo' },
      { name: 'STAT News', user: 'statnews' },
      { name: 'Science Magazine', user: 'ScienceMagazine' },
    ];

    const results: any[] = [];

    // Fetch in parallel
    const feeds = await Promise.all(
      channels.map(async (ch) => ({ ch, xml: await fetchYouTubeFeedByUser(ch.user) }))
    );

    for (const { ch, xml } of feeds) {
      if (!xml) continue;
      const parsed = parseYouTubeRSS(xml, ch.name, query);
      results.push(...parsed);
    }

    // Sort by relevance and recency (simple heuristic)
    results.sort((a, b) => {
      const ra = a.relevanceScore || 0;
      const rb = b.relevanceScore || 0;
      const da = a.publishedDate ? Date.parse(a.publishedDate) : 0;
      const db = b.publishedDate ? Date.parse(b.publishedDate) : 0;
      // Relevance first, then date
      if (rb !== ra) return rb - ra;
      return db - da;
    });

    const limited = results.slice(0, Math.max(1, Math.min(limit, 24)));

    return new Response(
      JSON.stringify({
        sources: limited,
        query,
        totalFound: results.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('visual-content-search error', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unexpected error', sources: [], totalFound: 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
