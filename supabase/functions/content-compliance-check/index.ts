import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * CONTENT COMPLIANCE CHECK EDGE FUNCTION
 * 
 * P3 Compliance Scenarios:
 * 1. Copyright Detection - Check for copyrighted content
 * 2. HIPAA Compliance - Detect PHI/PII in healthcare content
 * 3. GDPR Compliance - Check for EU data privacy violations
 * 4. WCAG 2.1 AA - Accessibility compliance
 * 5. Auto-Disclaimer Injection - Add required legal disclaimers
 */

interface ComplianceRequest {
  content: string;
  contentType: 'text' | 'audio' | 'video' | 'image';
  checkTypes: ('copyright' | 'hipaa' | 'gdpr' | 'wcag' | 'disclaimer')[];
  industry?: string;
  region?: string;
  language?: string;
}

interface ComplianceResult {
  passed: boolean;
  score: number;
  checks: ComplianceCheck[];
  suggestedDisclaimers: string[];
  requiredActions: string[];
}

interface ComplianceCheck {
  type: string;
  passed: boolean;
  score: number;
  issues: ComplianceIssue[];
  recommendations: string[];
}

interface ComplianceIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location?: string;
  remediation: string;
}

// PHI/PII patterns for HIPAA detection
const HIPAA_PATTERNS = {
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  mrn: /\b(MRN|medical record|patient id)[\s:#]*\d+/gi,
  dob: /\b(DOB|date of birth|born)[\s:]+\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/gi,
  phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  address: /\b\d{1,5}\s+[A-Za-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct)\b/gi,
  diagnosis: /(diagnosed with|diagnosis:|ICD-10:|condition:)/gi,
  medication: /(prescribed|medication:|taking|dosage:)/gi,
};

// GDPR-sensitive data patterns
const GDPR_PATTERNS = {
  nationalId: /\b[A-Z]{2}\d{6,12}\b/g,
  passport: /\b[A-Z]{1,2}\d{6,9}\b/g,
  iban: /\b[A-Z]{2}\d{2}[A-Z0-9]{4,}\b/g,
  ipAddress: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
  geneticData: /(DNA|genetic|genome|hereditary)/gi,
  biometric: /(fingerprint|retina|facial recognition|voice print)/gi,
  healthData: /(medical|health|diagnosis|treatment|prescription)/gi,
};

// Copyright indicators
const COPYRIGHT_PATTERNS = {
  explicit: /©|copyright|all rights reserved|\(c\)/gi,
  trademark: /™|®|trademarked/gi,
  license: /(licensed|proprietary|patented)/gi,
  brand: /(disney|marvel|nintendo|sony|universal|warner|coca-cola|apple inc|microsoft|google llc)/gi,
};

// WCAG 2.1 AA text requirements
function checkWCAGCompliance(content: string): ComplianceCheck {
  const issues: ComplianceIssue[] = [];
  const recommendations: string[] = [];
  
  // Check text length for captions (max 42 chars per line)
  const lines = content.split('\n');
  const longLines = lines.filter(line => line.length > 42);
  if (longLines.length > 0) {
    issues.push({
      severity: 'medium',
      description: `${longLines.length} lines exceed 42 characters (recommended for captions)`,
      remediation: 'Break long lines into shorter segments for better readability'
    });
  }
  
  // Check for ALL CAPS text (harder to read)
  const capsMatch = content.match(/[A-Z]{10,}/g);
  if (capsMatch && capsMatch.length > 0) {
    issues.push({
      severity: 'low',
      description: 'Extended ALL CAPS text detected (reduces readability)',
      remediation: 'Use sentence case for better accessibility'
    });
  }
  
  // Check for proper contrast guidance
  if (content.includes('color:') || content.includes('background:')) {
    recommendations.push('Ensure text contrast ratio meets WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text)');
  }
  
  // Check for timing in captions (if time codes present)
  const timeCodes = content.match(/\d{2}:\d{2}:\d{2}/g);
  if (timeCodes) {
    recommendations.push('Ensure captions appear for minimum 1 second and maximum 7 seconds');
    recommendations.push('Reading speed should not exceed 3 lines per 5 seconds');
  }
  
  const passed = issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0;
  const score = Math.max(0, 100 - (issues.length * 10));
  
  return {
    type: 'wcag',
    passed,
    score,
    issues,
    recommendations
  };
}

// HIPAA compliance check
function checkHIPAACompliance(content: string): ComplianceCheck {
  const issues: ComplianceIssue[] = [];
  const recommendations: string[] = [];
  
  for (const [patternName, pattern] of Object.entries(HIPAA_PATTERNS)) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      const severity = ['ssn', 'mrn', 'diagnosis', 'medication'].includes(patternName) ? 'critical' : 'high';
      issues.push({
        severity,
        description: `Potential ${patternName.toUpperCase()} detected (${matches.length} instance(s))`,
        location: matches.slice(0, 3).join(', '),
        remediation: `Redact or de-identify ${patternName} before publishing`
      });
    }
  }
  
  if (issues.length > 0) {
    recommendations.push('Consider using the HIPAA redaction service before publishing');
    recommendations.push('Ensure proper patient consent is documented');
    recommendations.push('Review BAA agreements for any third-party services');
  }
  
  const passed = issues.filter(i => i.severity === 'critical').length === 0;
  const score = Math.max(0, 100 - (issues.length * 15));
  
  return {
    type: 'hipaa',
    passed,
    score,
    issues,
    recommendations
  };
}

// GDPR compliance check
function checkGDPRCompliance(content: string, region?: string): ComplianceCheck {
  const issues: ComplianceIssue[] = [];
  const recommendations: string[] = [];
  
  // Check for GDPR-sensitive data
  for (const [patternName, pattern] of Object.entries(GDPR_PATTERNS)) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      const severity = ['nationalId', 'passport', 'geneticData', 'biometric'].includes(patternName) ? 'critical' : 'high';
      issues.push({
        severity,
        description: `Potential ${patternName} data detected (${matches.length} instance(s))`,
        remediation: `Ensure explicit consent or remove ${patternName} data for GDPR compliance`
      });
    }
  }
  
  // EU-specific requirements
  const euRegions = ['EU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'GR', 'PL', 'SE', 'DK', 'FI', 'IE'];
  if (region && euRegions.includes(region.toUpperCase())) {
    recommendations.push('Ensure data processing consent is documented');
    recommendations.push('Include right-to-erasure mechanism');
    recommendations.push('Document legal basis for data processing');
  }
  
  const passed = issues.filter(i => i.severity === 'critical').length === 0;
  const score = Math.max(0, 100 - (issues.length * 15));
  
  return {
    type: 'gdpr',
    passed,
    score,
    issues,
    recommendations
  };
}

// Copyright detection
function checkCopyrightCompliance(content: string): ComplianceCheck {
  const issues: ComplianceIssue[] = [];
  const recommendations: string[] = [];
  
  for (const [patternName, pattern] of Object.entries(COPYRIGHT_PATTERNS)) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      const severity = patternName === 'brand' ? 'high' : 'medium';
      issues.push({
        severity,
        description: `Potential ${patternName} content detected: ${matches.slice(0, 3).join(', ')}`,
        remediation: `Verify licensing or remove ${patternName} references`
      });
    }
  }
  
  recommendations.push('Consider running content through a plagiarism checker');
  recommendations.push('Maintain documentation of content sources and licenses');
  
  const passed = issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0;
  const score = Math.max(0, 100 - (issues.length * 12));
  
  return {
    type: 'copyright',
    passed,
    score,
    issues,
    recommendations
  };
}

// Auto-disclaimer injection
function generateDisclaimers(industry?: string, region?: string, contentType?: string): string[] {
  const disclaimers: string[] = [];
  
  // Industry-specific disclaimers
  if (industry === 'healthcare' || industry === 'medical') {
    disclaimers.push('This content is for informational purposes only and does not constitute medical advice. Consult a healthcare professional for medical concerns.');
  }
  
  if (industry === 'finance' || industry === 'investment') {
    disclaimers.push('This content is for informational purposes only and does not constitute financial advice. Past performance is not indicative of future results.');
  }
  
  if (industry === 'legal') {
    disclaimers.push('This content is for informational purposes only and does not constitute legal advice. Consult a licensed attorney for legal matters.');
  }
  
  // Region-specific disclaimers
  const euRegions = ['EU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'GR', 'PL', 'SE', 'DK', 'FI', 'IE'];
  if (region && euRegions.includes(region.toUpperCase())) {
    disclaimers.push('This content complies with EU GDPR regulations. For data privacy inquiries, contact our Data Protection Officer.');
  }
  
  if (region === 'US') {
    disclaimers.push('© ' + new Date().getFullYear() + ' All rights reserved.');
  }
  
  // Content-type specific
  if (contentType === 'video' || contentType === 'audio') {
    disclaimers.push('Views expressed are those of the creator and do not necessarily reflect official positions.');
  }
  
  return disclaimers;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { content, contentType, checkTypes, industry, region, language }: ComplianceRequest = await req.json();

    if (!content || !checkTypes || checkTypes.length === 0) {
      return new Response(
        JSON.stringify({ error: 'content and checkTypes are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const checks: ComplianceCheck[] = [];
    let overallPassed = true;
    let totalScore = 0;

    // Run requested compliance checks
    for (const checkType of checkTypes) {
      let check: ComplianceCheck;
      
      switch (checkType) {
        case 'hipaa':
          check = checkHIPAACompliance(content);
          break;
        case 'gdpr':
          check = checkGDPRCompliance(content, region);
          break;
        case 'copyright':
          check = checkCopyrightCompliance(content);
          break;
        case 'wcag':
          check = checkWCAGCompliance(content);
          break;
        case 'disclaimer':
          check = {
            type: 'disclaimer',
            passed: true,
            score: 100,
            issues: [],
            recommendations: ['Review auto-generated disclaimers for accuracy']
          };
          break;
        default:
          continue;
      }
      
      checks.push(check);
      if (!check.passed) overallPassed = false;
      totalScore += check.score;
    }

    // Generate appropriate disclaimers
    const suggestedDisclaimers = generateDisclaimers(industry, region, contentType);

    // Compile required actions
    const requiredActions: string[] = [];
    checks.forEach(check => {
      check.issues
        .filter(i => i.severity === 'critical' || i.severity === 'high')
        .forEach(issue => {
          requiredActions.push(issue.remediation);
        });
    });

    const result: ComplianceResult = {
      passed: overallPassed,
      score: Math.round(totalScore / checks.length),
      checks,
      suggestedDisclaimers,
      requiredActions
    };

    // Log compliance check for analytics
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from('pipeline_feedback').insert({
        pipeline_id: 'compliance-check',
        confidence_score: result.score / 100,
        provider_used: 'internal',
        input_hash: content.substring(0, 50),
        quality_issues: { checks: result.checks },
        feedback_type: 'auto'
      });
    } catch (err) {
      console.error('Failed to log compliance check:', err);
    }

    console.log(`[COMPLIANCE] Check completed - Score: ${result.score}%, Passed: ${result.passed}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[COMPLIANCE] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});