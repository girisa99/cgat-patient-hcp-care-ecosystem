import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 [CRAWL-CONTENT] Function invoked:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ [CRAWL-CONTENT] Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      urls, 
      topic, 
      agentType, 
      agentPurpose,
      maxPages = 5 
    } = await req.json();

    console.log('🔍 [CRAWL-CONTENT] Crawling content for:', { urls, topic, agentType, agentPurpose });

    if (!urls || urls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No URLs provided for crawling' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const crawledContent = [];

    // If Firecrawl API key is available, use it for better crawling
    if (firecrawlApiKey) {
      console.log('🔥 [CRAWL-CONTENT] Using Firecrawl API for enhanced crawling');
      
      for (const url of urls.slice(0, maxPages)) {
        try {
          const firecrawlResponse = await fetch('https://api.firecrawl.dev/v0/scrape', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${firecrawlApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: url,
              pageOptions: {
                onlyMainContent: true,
                includeHtml: false,
                waitFor: 1000
              },
              extractorOptions: {
                mode: 'markdown'
              }
            }),
          });

          if (firecrawlResponse.ok) {
            const firecrawlData = await firecrawlResponse.json();
            crawledContent.push({
              url: url,
              title: firecrawlData.data?.metadata?.title || 'Untitled',
              content: firecrawlData.data?.markdown || firecrawlData.data?.content || '',
              source: 'firecrawl'
            });
          } else {
            console.warn(`⚠️ [CRAWL-CONTENT] Firecrawl failed for ${url}, falling back to basic fetch`);
            await basicFetch(url, crawledContent);
          }
        } catch (error) {
          console.warn(`⚠️ [CRAWL-CONTENT] Error with Firecrawl for ${url}:`, error.message);
          await basicFetch(url, crawledContent);
        }
      }
    } else {
      console.log('🌐 [CRAWL-CONTENT] Using basic fetch for crawling');
      
      // Basic web crawling without Firecrawl
      for (const url of urls.slice(0, maxPages)) {
        await basicFetch(url, crawledContent);
      }
    }

    // Process and store the crawled content
    const processedContent = [];
    
    for (const content of crawledContent) {
      if (content.content && content.content.trim().length > 100) {
        // Store in knowledge base
        const { data: knowledgeEntry, error: insertError } = await supabase
          .from('knowledge_base')
          .insert({
            title: `${content.title} - Crawled Content`,
            content: content.content,
            content_type: 'crawled_content',
            source_url: content.url,
            tags: [topic, agentType, 'crawled'],
            metadata: {
              crawled_date: new Date().toISOString(),
              agent_type: agentType,
              agent_purpose: agentPurpose,
              crawl_source: content.source || 'basic_fetch'
            }
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ [CRAWL-CONTENT] Error storing crawled content:', insertError);
        } else {
          console.log('✅ [CRAWL-CONTENT] Crawled content stored successfully');
          processedContent.push(knowledgeEntry);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        crawledCount: crawledContent.length,
        storedCount: processedContent.length,
        content: processedContent
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ [CRAWL-CONTENT] Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to crawl content' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Basic fetch function for fallback crawling
async function basicFetch(url: string, crawledContent: any[]) {
  try {
    console.log(`🌐 [CRAWL-CONTENT] Basic fetch for: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Healthcare-Agent-Crawler/1.0)',
      },
    });

    if (response.ok) {
      const html = await response.text();
      
      // Basic content extraction (remove HTML tags)
      const textContent = html
        .replace(/<script[^>]*>.*?<\/script>/gis, '')
        .replace(/<style[^>]*>.*?<\/style>/gis, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'Untitled Page';

      if (textContent.length > 100) {
        crawledContent.push({
          url: url,
          title: title,
          content: textContent.substring(0, 5000), // Limit content length
          source: 'basic_fetch'
        });
      }
    }
  } catch (error) {
    console.warn(`⚠️ [CRAWL-CONTENT] Basic fetch failed for ${url}:`, error.message);
  }
}