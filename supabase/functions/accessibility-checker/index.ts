import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AccessibilityRequest {
  action: 'check' | 'color_contrast' | 'auto_fix' | 'generate_captions';
  contentUrl?: string;
  contentType?: string;
  targetLevel?: string;
  checkCaptions?: boolean;
  checkAudioDescription?: boolean;
  checkColorContrast?: boolean;
  foreground?: string;
  background?: string;
  issueId?: string;
  fixAction?: string;
  videoUrl?: string;
  language?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: AccessibilityRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    console.log(`♿ Accessibility Check:`, {
      action: request.action,
      contentType: request.contentType,
      targetLevel: request.targetLevel,
    });

    let result;

    switch (request.action) {
      case 'check':
        result = await runAccessibilityCheck(LOVABLE_API_KEY, request);
        break;

      case 'color_contrast':
        result = await checkColorContrast(request);
        break;

      case 'auto_fix':
        result = await autoFixIssue(request);
        break;

      case 'generate_captions':
        result = await generateCaptions(LOVABLE_API_KEY, request);
        break;

      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Accessibility check error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function runAccessibilityCheck(apiKey: string | undefined, request: AccessibilityRequest) {
  // Generate comprehensive accessibility report
  const issues = [];
  let overallScore = 100;

  // Simulate WCAG checks based on content type
  if (request.contentType === 'video') {
    if (request.checkCaptions) {
      // Check for captions
      const hasCaptions = Math.random() > 0.3; // Simulated check
      if (!hasCaptions) {
        issues.push({
          id: `issue-${Date.now()}-1`,
          category: 'audio',
          severity: 'critical',
          wcagCriteria: '1.2.2',
          wcagLevel: 'A',
          title: 'Missing Captions',
          description: 'Video content must have synchronized captions for deaf and hard-of-hearing users.',
          suggestion: 'Add closed captions or subtitles to the video.',
          autoFixAvailable: true,
          autoFixAction: 'generate_captions',
        });
        overallScore -= 25;
      }
    }

    if (request.checkAudioDescription) {
      const hasAudioDescription = Math.random() > 0.5;
      if (!hasAudioDescription) {
        issues.push({
          id: `issue-${Date.now()}-2`,
          category: 'visual',
          severity: 'serious',
          wcagCriteria: '1.2.5',
          wcagLevel: 'AA',
          title: 'Missing Audio Description',
          description: 'Video with important visual content should have audio descriptions.',
          suggestion: 'Add audio descriptions for visual-only content.',
          autoFixAvailable: false,
        });
        overallScore -= 15;
      }
    }
  }

  if (request.checkColorContrast) {
    // Simulate color contrast issues
    const hasContrastIssues = Math.random() > 0.6;
    if (hasContrastIssues) {
      issues.push({
        id: `issue-${Date.now()}-3`,
        category: 'visual',
        severity: 'moderate',
        wcagCriteria: '1.4.3',
        wcagLevel: 'AA',
        title: 'Insufficient Color Contrast',
        description: 'Some text elements do not meet minimum contrast ratio of 4.5:1.',
        location: { element: 'subtitle-text' },
        suggestion: 'Increase contrast by using darker text or lighter background.',
        autoFixAvailable: true,
        autoFixAction: 'adjust_contrast',
      });
      overallScore -= 10;
    }
  }

  // Check for cognitive accessibility
  const hasCognitiveIssues = Math.random() > 0.7;
  if (hasCognitiveIssues) {
    issues.push({
      id: `issue-${Date.now()}-4`,
      category: 'cognitive',
      severity: 'minor',
      wcagCriteria: '2.2.2',
      wcagLevel: 'A',
      title: 'Rapid Content Changes',
      description: 'Content changes rapidly which may cause issues for users with cognitive disabilities.',
      location: { timestamp: 15 },
      suggestion: 'Reduce animation speed or provide pause controls.',
      autoFixAvailable: false,
    });
    overallScore -= 5;
  }

  // Ensure minimum score
  overallScore = Math.max(0, overallScore);

  const summary = {
    critical: issues.filter(i => i.severity === 'critical').length,
    serious: issues.filter(i => i.severity === 'serious').length,
    moderate: issues.filter(i => i.severity === 'moderate').length,
    minor: issues.filter(i => i.severity === 'minor').length,
    total: issues.length,
  };

  const recommendations = [];
  if (summary.critical > 0) recommendations.push('Address critical accessibility issues immediately');
  if (!request.checkCaptions) recommendations.push('Consider adding captions for broader accessibility');
  if (overallScore >= 80) recommendations.push('Content meets basic accessibility requirements');
  recommendations.push('Run regular accessibility audits');

  const report = {
    id: `report-${Date.now()}`,
    contentId: request.contentUrl,
    contentType: request.contentType || 'video',
    checkedAt: new Date().toISOString(),
    overallScore,
    wcagLevel: request.targetLevel || 'AA',
    issues,
    summary,
    recommendations,
    hasCaptions: issues.filter(i => i.title === 'Missing Captions').length === 0,
    hasAudioDescription: issues.filter(i => i.title === 'Missing Audio Description').length === 0,
    hasTranscript: Math.random() > 0.5,
    colorContrastIssues: [],
  };

  return { report };
}

function checkColorContrast(request: AccessibilityRequest) {
  const fg = request.foreground || '#000000';
  const bg = request.background || '#FFFFFF';

  // Calculate relative luminance
  const getLuminance = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    
    const sRGB = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  const result = {
    foreground: fg,
    background: bg,
    ratio: Math.round(ratio * 100) / 100,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7,
    passesAALargeText: ratio >= 3,
    suggestion: ratio < 4.5 ? {
      adjustedForeground: '#000000',
      adjustedBackground: '#FFFFFF',
      newRatio: 21,
    } : undefined,
  };

  return { result };
}

async function autoFixIssue(request: AccessibilityRequest) {
  // Simulate auto-fix actions
  console.log(`Auto-fixing issue ${request.issueId} with action ${request.fixAction}`);
  
  // In production, this would apply actual fixes
  return {
    fixed: true,
    issueId: request.issueId,
    action: request.fixAction,
  };
}

async function generateCaptions(apiKey: string | undefined, request: AccessibilityRequest) {
  // In production, this would use a transcription service
  console.log(`Generating captions for ${request.videoUrl} in ${request.language}`);
  
  return {
    captionsUrl: `https://storage.example.com/captions/${Date.now()}.vtt`,
    language: request.language || 'en',
    format: 'vtt',
  };
}
