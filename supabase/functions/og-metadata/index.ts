import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    
    if (!slug) {
      return new Response('Missing slug parameter', { status: 400 });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let title = 'AI Document Processing Platform';
    let description = 'Multi-model AI for intelligent document extraction with 95%+ accuracy';
    let imageUrl = `${url.origin}/og-document-processing.png`;
    let pageUrl = `${url.origin}/public/presentation/${slug}`;

    // Handle legacy slug
    if (slug !== 'document-processing') {
      const { data: presentation } = await supabase
        .from('presentations')
        .select('name, description, og_image_url, meta_title, meta_description, slug')
        .eq('slug', slug)
        .eq('is_public', true)
        .single();

      if (presentation) {
        title = presentation.meta_title || presentation.name;
        description = presentation.meta_description || presentation.description || '';
        imageUrl = presentation.og_image_url || imageUrl;
      }
    }

    // Return HTML with proper OG meta tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(pageUrl)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Lovable AI">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${escapeHtml(pageUrl)}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
  
  <!-- LinkedIn specific -->
  <meta property="article:author" content="Lovable AI">
  
  <!-- Redirect to actual page after meta tags are read -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(pageUrl)}">
  <script>window.location.href = "${escapeHtml(pageUrl)}";</script>
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(pageUrl)}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('Error generating OG metadata:', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}