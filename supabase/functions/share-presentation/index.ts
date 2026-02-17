import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type MediaType = 'image' | 'video' | 'gif';

interface MediaAsset {
  type: MediaType;
  url: string;
  thumbnail?: string;
  alt?: string;
  width?: number;
  height?: number;
  duration?: number;
}

interface PresentationConfig {
  title: string;
  description: string;
  ogImage: string;
  ogVideo?: string;
  presentationPath: string;
  media?: MediaAsset;
  stats: { value: string; label: string }[];
  ctaText: string;
  tags?: string[];
  category?: string;
}

// Presentation configurations - keep in sync with src/config/presentationShareConfig.ts
const PRESENTATIONS: Record<string, PresentationConfig> = {
  'document-processing': {
    title: 'AI Document Processing Platform | Genie AI',
    description: 'Revolutionize your document processing with multi-model AI. 95%+ accuracy, 75x faster processing, 99% cost reduction.',
    ogImage: 'og-document-processing.png',
    presentationPath: '/public/presentation/document-processing',
    media: {
      type: 'image',
      url: 'og-document-processing.png',
      alt: 'AI Document Processing - Multi-model AI for healthcare automation',
      width: 1200,
      height: 640
    },
    stats: [
      { value: '95%+', label: 'Accuracy' },
      { value: '75x', label: 'Faster' },
      { value: '99%', label: 'Cost Reduction' }
    ],
    ctaText: 'View Interactive Presentation →',
    tags: ['AI', 'Healthcare', 'Automation', 'DocumentProcessing'],
    category: 'Healthcare AI'
  },
  // Add more presentations here - duplicate from presentationShareConfig.ts
};

const BASE_URL = 'https://genieaiexpermentationhub.com';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const presentationId = pathParts[pathParts.length - 1] || url.searchParams.get('id') || 'document-processing';
    
    console.log(`[share-presentation] Requested: ${presentationId}`);
    
    const config = PRESENTATIONS[presentationId];
    
    if (!config) {
      console.log(`[share-presentation] Not found: ${presentationId}`);
      return new Response(generateNotFoundHTML(presentationId), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' } 
      });
    }

    const html = generateShareHTML(presentationId, config);
    console.log(`[share-presentation] Serving: ${config.title}`);
    
    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('[share-presentation] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateShareHTML(id: string, config: PresentationConfig): string {
  const ogImageUrl = `${BASE_URL}/${config.ogImage}`;
  const shareUrl = `${BASE_URL}/api/share/${id}`;
  const presentationUrl = `${BASE_URL}${config.presentationPath}`;
  
  // Determine media URL and type
  const mediaUrl = config.media?.url 
    ? (config.media.url.startsWith('http') ? config.media.url : `${BASE_URL}/${config.media.url}`)
    : ogImageUrl;
  const thumbnailUrl = config.media?.thumbnail
    ? (config.media.thumbnail.startsWith('http') ? config.media.thumbnail : `${BASE_URL}/${config.media.thumbnail}`)
    : ogImageUrl;
  const videoUrl = config.ogVideo ? `${BASE_URL}/${config.ogVideo}` : null;
  
  // Generate video meta tags if available
  const videoMetaTags = videoUrl ? `
  <!-- Video OG Tags -->
  <meta property="og:video" content="${videoUrl}">
  <meta property="og:video:secure_url" content="${videoUrl}">
  <meta property="og:video:type" content="video/mp4">
  <meta property="og:video:width" content="1920">
  <meta property="og:video:height" content="1080">
  ` : '';
  
  const statsHtml = config.stats.map(stat => `
    <div class="stat">
      <div class="stat-value">${stat.value}</div>
      <div class="stat-label">${stat.label}</div>
    </div>
  `).join('');
  
  // Generate media preview HTML based on type
  const mediaPreviewHtml = config.media?.type === 'video' 
    ? `<div class="media-preview">
        <video autoplay muted loop playsinline poster="${thumbnailUrl}" style="max-width: 100%; border-radius: 12px; margin-bottom: 1.5rem;">
          <source src="${mediaUrl}" type="video/mp4">
        </video>
      </div>`
    : config.media?.type === 'gif'
    ? `<div class="media-preview">
        <img src="${mediaUrl}" alt="${config.media.alt || config.title}" style="max-width: 100%; border-radius: 12px; margin-bottom: 1.5rem;" />
      </div>`
    : `<div class="media-preview">
        <img src="${ogImageUrl}" alt="${config.media?.alt || config.title}" style="max-width: 100%; border-radius: 12px; margin-bottom: 1.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.3);" />
      </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title}</title>
  <meta name="description" content="${config.description}">
  
  <!-- Open Graph / Facebook / LinkedIn -->
  <meta property="og:type" content="${videoUrl ? 'video.other' : 'website'}">
  <meta property="og:url" content="${shareUrl}">
  <meta property="og:title" content="${config.title}">
  <meta property="og:description" content="${config.description}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:image:secure_url" content="${ogImageUrl}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="${config.media?.width || 1200}">
  <meta property="og:image:height" content="${config.media?.height || 640}">
  <meta property="og:image:alt" content="${config.media?.alt || config.title}">
  <meta property="og:site_name" content="Genie AI">
  ${videoMetaTags}
  
  <!-- Twitter -->
  <meta name="twitter:card" content="${videoUrl ? 'player' : 'summary_large_image'}">
  <meta name="twitter:url" content="${shareUrl}">
  <meta name="twitter:title" content="${config.title}">
  <meta name="twitter:description" content="${config.description}">
  <meta name="twitter:image" content="${ogImageUrl}">
  ${videoUrl ? `<meta name="twitter:player" content="${videoUrl}">` : ''}
  
  <!-- LinkedIn specific -->
  <meta property="article:author" content="Genie AI">
  ${config.category ? `<meta property="article:section" content="${config.category}">` : ''}
  ${config.tags ? config.tags.map(tag => `<meta property="article:tag" content="${tag}">`).join('\n  ') : ''}
  
  <link rel="canonical" href="${shareUrl}">
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 2rem;
    }
    .container { max-width: 900px; width: 100%; }
    .media-preview { margin-bottom: 1rem; }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      background: linear-gradient(to right, #a78bfa, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .subtitle {
      font-size: 1.25rem;
      color: #94a3b8;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    .stats {
      display: flex;
      gap: 2rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 2rem;
    }
    .stat {
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.3);
      padding: 1rem 1.5rem;
      border-radius: 12px;
      min-width: 120px;
    }
    .stat-value {
      font-size: 1.75rem;
      font-weight: bold;
      color: #22c55e;
    }
    .stat-label {
      font-size: 0.875rem;
      color: #94a3b8;
    }
    .cta {
      display: inline-block;
      background: linear-gradient(to right, #8b5cf6, #6366f1);
      color: white;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
    }
    .tags {
      margin-top: 1.5rem;
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    .tag {
      background: rgba(139, 92, 246, 0.2);
      color: #a78bfa;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
    }
    .footer {
      margin-top: 2rem;
      font-size: 0.875rem;
      color: #64748b;
    }
    @media (max-width: 640px) {
      h1 { font-size: 1.75rem; }
      .stats { gap: 1rem; }
      .stat { min-width: 100px; padding: 0.75rem 1rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    ${mediaPreviewHtml}
    
    <h1>🚀 ${config.title.replace(' | Genie AI', '')}</h1>
    <p class="subtitle">${config.description}</p>
    
    <div class="stats">${statsHtml}</div>
    
    <a href="${presentationUrl}" class="cta">${config.ctaText}</a>
    
    ${config.tags ? `<div class="tags">${config.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}</div>` : ''}
    
    <p class="footer">Powered by Genie AI & Lovable</p>
  </div>
  
  <script>
    const isBot = /bot|crawler|spider|crawling|facebookexternalhit|linkedinbot|twitterbot|slackbot|whatsapp|telegram/i.test(navigator.userAgent);
    if (!isBot) {
      setTimeout(function() {
        window.location.href = '${presentationUrl}';
      }, 5000);
    }
  </script>
</body>
</html>`;
}

function generateNotFoundHTML(id: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Presentation Not Found | Genie AI</title>
  <meta property="og:title" content="Presentation Not Found">
  <meta property="og:description" content="The requested presentation could not be found.">
  <style>
    body {
      font-family: system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0f172a;
      color: white;
      text-align: center;
    }
    h1 { color: #ef4444; }
    a { color: #8b5cf6; }
  </style>
</head>
<body>
  <div>
    <h1>404 - Presentation Not Found</h1>
    <p>The presentation "${id}" could not be found.</p>
    <p><a href="/">← Return to Home</a></p>
  </div>
</body>
</html>`;
}
