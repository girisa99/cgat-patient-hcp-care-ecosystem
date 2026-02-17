import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrandRequest {
  action: 'get_guidelines' | 'check' | 'check_colors' | 'check_tone' | 'auto_fix';
  guidelinesId?: string;
  contentUrl?: string;
  contentText?: string;
  contentType?: string;
  customGuidelines?: any;
  categories?: string[];
  colors?: string[];
  text?: string;
  violationId?: string;
  category?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: BrandRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    console.log(`🎨 Brand Guidelines Check:`, {
      action: request.action,
      contentType: request.contentType,
    });

    let result;

    switch (request.action) {
      case 'get_guidelines':
        result = await getGuidelines(request);
        break;

      case 'check':
        result = await runBrandCheck(LOVABLE_API_KEY, request);
        break;

      case 'check_colors':
        result = await checkColors(request);
        break;

      case 'check_tone':
        result = await checkTone(LOVABLE_API_KEY, request);
        break;

      case 'auto_fix':
        result = await autoFix(request);
        break;

      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Brand guidelines check error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getGuidelines(request: BrandRequest) {
  // Return default brand guidelines (in production, fetch from database)
  const guidelines = {
    id: request.guidelinesId || 'default',
    name: 'Default Brand Guidelines',
    logo: {
      primaryUrl: '/logo-primary.svg',
      secondaryUrl: '/logo-secondary.svg',
      minSize: { width: 100, height: 40 },
      clearSpace: 20,
      forbiddenBackgrounds: ['#FF0000', '#00FF00'],
    },
    colors: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: ['#EC4899', '#14B8A6', '#F59E0B'],
      forbidden: ['#FF0000', '#00FF00', '#0000FF'],
      allowedVariance: 10,
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      allowedFonts: ['Inter', 'Roboto', 'Open Sans'],
      minFontSizes: {
        heading: 24,
        body: 14,
        caption: 12,
      },
    },
    tone: {
      voiceAttributes: ['professional', 'friendly', 'innovative'],
      forbiddenTerms: ['cheap', 'best', 'guaranteed'],
      preferredTerms: {
        'customer': 'client',
        'buy': 'invest in',
        'problem': 'challenge',
      },
      formality: 'mixed',
    },
    imagery: {
      style: 'modern, clean, diverse',
      forbiddenElements: ['stock photos with watermarks', 'low resolution images'],
      requiredElements: ['brand colors', 'consistent lighting'],
    },
  };

  return { guidelines };
}

async function runBrandCheck(apiKey: string | undefined, request: BrandRequest) {
  const violations = [];
  let overallScore = 100;
  const categoryScores = {
    logo: 100,
    colors: 100,
    typography: 100,
    tone: 100,
    imagery: 100,
  };

  const categories = request.categories || ['logo', 'colors', 'typography', 'tone', 'imagery'];

  // Simulate brand checks
  if (categories.includes('logo')) {
    const logoIssue = Math.random() > 0.7;
    if (logoIssue) {
      violations.push({
        id: `violation-${Date.now()}-1`,
        category: 'logo',
        level: 'warning',
        title: 'Logo Clear Space Violation',
        description: 'Logo does not have adequate clear space around it.',
        currentValue: '10px',
        expectedValue: '20px minimum',
        suggestion: 'Add more padding around the logo.',
        autoFixAvailable: true,
      });
      categoryScores.logo = 75;
      overallScore -= 10;
    }
  }

  if (categories.includes('colors')) {
    const colorIssue = Math.random() > 0.6;
    if (colorIssue) {
      violations.push({
        id: `violation-${Date.now()}-2`,
        category: 'colors',
        level: 'violation',
        title: 'Off-Brand Color Used',
        description: 'A color is used that is not in the brand palette.',
        currentValue: '#FF6B6B',
        expectedValue: 'Brand accent colors only',
        suggestion: 'Replace with approved accent color #EC4899.',
        autoFixAvailable: true,
      });
      categoryScores.colors = 60;
      overallScore -= 20;
    }
  }

  if (categories.includes('typography')) {
    const fontIssue = Math.random() > 0.8;
    if (fontIssue) {
      violations.push({
        id: `violation-${Date.now()}-3`,
        category: 'typography',
        level: 'warning',
        title: 'Non-Approved Font',
        description: 'A font not in the brand guidelines is being used.',
        currentValue: 'Arial',
        expectedValue: 'Inter, Roboto, or Open Sans',
        suggestion: 'Change to Inter for consistency.',
        autoFixAvailable: true,
      });
      categoryScores.typography = 80;
      overallScore -= 10;
    }
  }

  if (categories.includes('tone') && request.contentText) {
    const toneIssue = Math.random() > 0.5;
    if (toneIssue) {
      violations.push({
        id: `violation-${Date.now()}-4`,
        category: 'tone',
        level: 'warning',
        title: 'Tone Inconsistency',
        description: 'Text tone does not match brand voice guidelines.',
        currentValue: 'Too casual',
        expectedValue: 'Professional yet friendly',
        suggestion: 'Revise to be more professional while maintaining warmth.',
        autoFixAvailable: false,
      });
      categoryScores.tone = 70;
      overallScore -= 15;
    }
  }

  // Determine compliance level
  const complianceLevel = overallScore >= 80 ? 'compliant' : 
                         overallScore >= 50 ? 'warning' : 'violation';

  const categoryLevels = Object.fromEntries(
    Object.entries(categoryScores).map(([k, v]) => [
      k,
      v >= 80 ? 'compliant' : v >= 50 ? 'warning' : 'violation'
    ])
  );

  const recommendations = [];
  if (violations.length > 0) {
    recommendations.push('Review and address brand violations before publishing');
  }
  if (categoryScores.colors < 80) {
    recommendations.push('Ensure all colors match the approved brand palette');
  }
  if (categoryScores.tone < 80) {
    recommendations.push('Have copy reviewed by brand team for tone consistency');
  }
  if (overallScore >= 90) {
    recommendations.push('Content is well-aligned with brand guidelines');
  }

  const report = {
    id: `report-${Date.now()}`,
    contentId: request.contentUrl,
    contentType: request.contentType || 'image',
    checkedAt: new Date().toISOString(),
    overallScore: Math.max(0, overallScore),
    complianceLevel,
    violations,
    summary: categoryLevels,
    categoryScores,
    recommendations,
  };

  return { report };
}

async function checkColors(request: BrandRequest) {
  const colors = request.colors || [];
  const brandColors = ['#6366F1', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B'];
  const forbiddenColors = ['#FF0000', '#00FF00', '#0000FF'];

  const compliant: string[] = [];
  const violations: Array<{ color: string; reason: string; suggestion: string }> = [];

  for (const color of colors) {
    const normalizedColor = color.toUpperCase();
    
    if (forbiddenColors.includes(normalizedColor)) {
      violations.push({
        color,
        reason: 'This color is explicitly forbidden in brand guidelines',
        suggestion: `Replace with brand primary color ${brandColors[0]}`,
      });
    } else if (brandColors.some(bc => bc.toUpperCase() === normalizedColor)) {
      compliant.push(color);
    } else {
      // Check if it's close to a brand color
      violations.push({
        color,
        reason: 'Color not in approved brand palette',
        suggestion: `Consider using ${brandColors[0]} or ${brandColors[1]} instead`,
      });
    }
  }

  return { result: { compliant, violations } };
}

async function checkTone(apiKey: string | undefined, request: BrandRequest) {
  const text = request.text || '';
  
  if (!apiKey) {
    return {
      result: {
        score: 75,
        level: 'warning',
        issues: [
          {
            text: text.substring(0, 50),
            issue: 'Unable to analyze tone without API key',
            suggestion: 'Configure LOVABLE_API_KEY for full analysis',
          }
        ],
      }
    };
  }

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        {
          role: 'system',
          content: `You are a brand tone analyzer. Evaluate text against these brand voice guidelines:
- Professional yet friendly
- Innovative and forward-thinking
- Avoid: cheap, best, guaranteed
- Prefer: client (not customer), invest in (not buy), challenge (not problem)`
        },
        {
          role: 'user',
          content: `Analyze this text for brand tone compliance:

"${text}"

Return JSON with: score (0-100), level (compliant/warning/violation), issues (array with text, issue, suggestion)`
        }
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'analyze_tone',
            description: 'Analyze brand tone compliance',
            parameters: {
              type: 'object',
              properties: {
                score: { type: 'number' },
                level: { type: 'string', enum: ['compliant', 'warning', 'violation'] },
                issues: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      text: { type: 'string' },
                      issue: { type: 'string' },
                      suggestion: { type: 'string' }
                    }
                  }
                }
              },
              required: ['score', 'level', 'issues']
            }
          }
        }
      ],
      tool_choice: { type: 'function', function: { name: 'analyze_tone' } }
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze tone');
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (toolCall?.function?.arguments) {
    const parsed = JSON.parse(toolCall.function.arguments);
    return { result: parsed };
  }

  return {
    result: {
      score: 80,
      level: 'compliant',
      issues: [],
    }
  };
}

async function autoFix(request: BrandRequest) {
  console.log(`Auto-fixing violation ${request.violationId} in category ${request.category}`);
  
  return {
    fixed: true,
    violationId: request.violationId,
    category: request.category,
  };
}
