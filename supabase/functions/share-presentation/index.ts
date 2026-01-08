import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Presentation configurations - keep in sync with src/config/presentationShareConfig.ts
const PRESENTATIONS: Record<string, {
  title: string;
  description: string;
  ogImage: string;
  presentationPath: string;
  stats: { value: string; label: string }[];
  ctaText: string;
}> = {
  'document-processing': {
    title: 'AI Document Processing Platform | Genie AI',
    description: 'Revolutionize your document processing with multi-model AI. 95%+ accuracy, 75x faster processing, 99% cost reduction.',
    ogImage: 'og-document-processing.png',
    presentationPath: '/public/presentation/document-processing',
    stats: [
      { value: '95%+', label: 'Accuracy' },
      { value: '75x', label: 'Faster' },
      { value: '99%', label: 'Cost Reduction' }
    ],
    ctaText: 'View Interactive Presentation →'
  },
  'prescription-processing': {
    title: 'AI Prescription Processing | Genie AI',
    description: 'Intelligent prescription extraction and validation with multi-model AI for healthcare automation.',
    ogImage: 'og-prescription-processing.png',
    presentationPath: '/public/presentation/prescription-processing',
    stats: [
      { value: '98%', label: 'Accuracy' },
      { value: '50x', label: 'Faster' },
      { value: '85%', label: 'Cost Savings' }
    ],
    ctaText: 'View Prescription Demo →'
  },
  'insurance-card': {
    title: 'AI Insurance Card Processing | Genie AI',
    description: 'Automated insurance card data extraction with OCR and AI validation for seamless patient intake.',
    ogImage: 'og-insurance-card.png',
    presentationPath: '/public/presentation/insurance-card',
    stats: [
      { value: '99%', label: 'Accuracy' },
      { value: '60x', label: 'Faster' },
      { value: '90%', label: 'Cost Reduction' }
    ],
    ctaText: 'View Insurance Demo →'
  },
  'medical-imaging': {
    title: 'AI Medical Imaging Pipeline | Genie AI',
    description: 'Advanced medical imaging AI pipeline for diagnostics, analysis, and clinical decision support.',
    ogImage: 'og-medical-imaging.png',
    presentationPath: '/public/presentation/medical-imaging',
    stats: [
      { value: '97%', label: 'Accuracy' },
      { value: '100x', label: 'Faster' },
      { value: '95%', label: 'Efficiency' }
    ],
    ctaText: 'View Imaging Demo →'
  },
  'invoice-rcm': {
    title: 'AI Invoice & RCM Processing | Genie AI',
    description: 'Automated invoice processing and revenue cycle management with AI for healthcare billing.',
    ogImage: 'og-invoice-rcm.png',
    presentationPath: '/public/presentation/invoice-rcm',
    stats: [
      { value: '96%', label: 'Accuracy' },
      { value: '80x', label: 'Faster' },
      { value: '92%', label: 'Cost Savings' }
    ],
    ctaText: 'View RCM Demo →'
  }
};

const BASE_URL = 'https://genieaiexpermentationhub.com';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Extract presentation ID from path: /share-presentation/document-processing
    const presentationId = pathParts[pathParts.length - 1] || url.searchParams.get('id') || 'document-processing';
    
    console.log(`[share-presentation] Requested presentation: ${presentationId}`);
    
    const config = PRESENTATIONS[presentationId];
    
    if (!config) {
      console.log(`[share-presentation] Presentation not found: ${presentationId}`);
      return new Response(
        generateNotFoundHTML(presentationId),
        { 
          status: 404,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'text/html; charset=utf-8' 
          } 
        }
      );
    }

    const html = generateShareHTML(presentationId, config);
    
    console.log(`[share-presentation] Serving share page for: ${config.title}`);
    
    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
    
  } catch (error) {
    console.error('[share-presentation] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateShareHTML(id: string, config: typeof PRESENTATIONS[string]): string {
  const ogImageUrl = `${BASE_URL}/${config.ogImage}`;
  const shareUrl = `${BASE_URL}/api/share/${id}`;
  const presentationUrl = `${BASE_URL}${config.presentationPath}`;
  
  const statsHtml = config.stats.map(stat => `
    <div class="stat">
      <div class="stat-value">${stat.value}</div>
      <div class="stat-label">${stat.label}</div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title}</title>
  <meta name="description" content="${config.description}">
  
  <!-- Open Graph / Facebook / LinkedIn -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${shareUrl}">
  <meta property="og:title" content="${config.title}">
  <meta property="og:description" content="${config.description}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:image:secure_url" content="${ogImageUrl}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="640">
  <meta property="og:site_name" content="Genie AI">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${shareUrl}">
  <meta name="twitter:title" content="${config.title}">
  <meta name="twitter:description" content="${config.description}">
  <meta name="twitter:image" content="${ogImageUrl}">
  
  <!-- LinkedIn specific -->
  <meta property="og:image:alt" content="${config.title}">
  <meta property="article:author" content="Genie AI">
  
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
    .container { max-width: 800px; }
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
    <h1>🚀 ${config.title.replace(' | Genie AI', '')}</h1>
    <p class="subtitle">${config.description}</p>
    
    <div class="stats">${statsHtml}</div>
    
    <a href="${presentationUrl}" class="cta">${config.ctaText}</a>
    
    <p class="footer">Powered by Genie AI & Lovable</p>
  </div>
  
  <script>
    // Only redirect real browsers (not crawlers) after viewing
    const isBot = /bot|crawler|spider|crawling|facebookexternalhit|linkedinbot|twitterbot|slackbot|whatsapp|telegram/i.test(navigator.userAgent);
    if (!isBot) {
      setTimeout(function() {
        window.location.href = '${presentationUrl}';
      }, 4000);
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
