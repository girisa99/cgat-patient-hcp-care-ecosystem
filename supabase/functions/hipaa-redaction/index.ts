import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HIPAARedactionRequest {
  action: 'scan' | 'redact' | 'audit';
  content: string;
  contentType: 'text' | 'transcript' | 'document' | 'video_metadata';
  redactionLevel: 'standard' | 'strict' | 'maximum';
  returnOriginal?: boolean;
  auditLog?: boolean;
}

interface PHIMatch {
  type: string;
  value: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
  redactedWith: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: HIPAARedactionRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    console.log(`🏥 HIPAA Redaction Request:`, {
      action: request.action,
      contentType: request.contentType,
      redactionLevel: request.redactionLevel,
      contentLength: request.content?.length
    });

    if (!request.content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;

    switch (request.action) {
      case 'scan':
        result = await scanForPHI(request.content, request.redactionLevel);
        break;

      case 'redact':
        result = await redactPHI(request.content, request.redactionLevel, LOVABLE_API_KEY);
        break;

      case 'audit':
        result = await generateAuditReport(request.content, request.redactionLevel);
        break;

      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        ...result,
        timestamp: new Date().toISOString(),
        redactionLevel: request.redactionLevel
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('HIPAA redaction error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// PHI Pattern Definitions (HIPAA 18 Identifiers)
const PHI_PATTERNS = {
  // Names
  name: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g,
  
  // Dates (except year)
  date: /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})\b/gi,
  
  // Phone numbers
  phone: /\b(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})\b/g,
  
  // Email addresses
  email: /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
  
  // Social Security Numbers
  ssn: /\b(\d{3}[-\s]?\d{2}[-\s]?\d{4})\b/g,
  
  // Medical Record Numbers (various formats)
  mrn: /\b(MRN[:\s]?\d{6,10}|#?\d{6,10})\b/gi,
  
  // Health Plan Beneficiary Numbers
  healthPlan: /\b([A-Z]{3}\d{9}|[A-Z]\d{9})\b/g,
  
  // Account Numbers
  account: /\b(ACCT[:\s]?\d{6,12}|\d{10,16})\b/gi,
  
  // License/Certificate Numbers
  license: /\b(LIC[:\s]?[A-Z0-9]{6,12}|DL[:\s]?[A-Z0-9]{6,12})\b/gi,
  
  // Vehicle Identifiers
  vin: /\b([A-HJ-NPR-Z0-9]{17})\b/g,
  
  // Device Identifiers
  deviceId: /\b(DEV[:\s]?[A-Z0-9]{8,16}|SERIAL[:\s]?[A-Z0-9]{8,16})\b/gi,
  
  // URLs (web addresses)
  url: /\b(https?:\/\/[^\s]+)\b/g,
  
  // IP Addresses
  ip: /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/g,
  
  // Biometric identifiers
  biometric: /\b(fingerprint|retina|voice\s*print|dna|facial\s*recognition)[:\s]+[^\s]+\b/gi,
  
  // Photographs/Images references
  photo: /\b(photo[:\s]?[^\s]+|image[:\s]?[^\s]+|picture[:\s]?[^\s]+)\b/gi,
  
  // Geographic data smaller than state
  address: /\b(\d{1,5}\s+[A-Za-z0-9\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way|Circle|Cir)\.?(?:\s+(?:Apt|Suite|Unit|#)\s*\d+)?)\b/gi,
  zipCode: /\b(\d{5}(?:-\d{4})?)\b/g,
};

async function scanForPHI(content: string, level: string): Promise<{
  phiFound: boolean;
  matches: PHIMatch[];
  riskScore: number;
  summary: Record<string, number>;
}> {
  const matches: PHIMatch[] = [];
  const summary: Record<string, number> = {};

  // Apply patterns based on redaction level
  const patternsToUse = level === 'maximum' 
    ? Object.entries(PHI_PATTERNS)
    : level === 'strict'
      ? Object.entries(PHI_PATTERNS).filter(([key]) => 
          ['name', 'ssn', 'mrn', 'phone', 'email', 'address', 'date'].includes(key))
      : Object.entries(PHI_PATTERNS).filter(([key]) => 
          ['ssn', 'mrn', 'phone', 'email'].includes(key));

  for (const [type, pattern] of patternsToUse) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      matches.push({
        type,
        value: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        confidence: calculateConfidence(type, match[0]),
        redactedWith: getRedactionPlaceholder(type)
      });
      
      summary[type] = (summary[type] || 0) + 1;
    }
  }

  // Calculate risk score (0-100)
  const riskScore = Math.min(100, matches.length * 5 + 
    (summary['ssn'] || 0) * 20 + 
    (summary['mrn'] || 0) * 15 + 
    (summary['name'] || 0) * 10);

  return {
    phiFound: matches.length > 0,
    matches,
    riskScore,
    summary
  };
}

async function redactPHI(content: string, level: string, apiKey?: string): Promise<{
  redactedContent: string;
  redactionCount: number;
  phiTypes: string[];
  originalLength: number;
  redactedLength: number;
}> {
  const scanResult = await scanForPHI(content, level);
  let redactedContent = content;
  const phiTypes = new Set<string>();

  // Sort matches by start index in reverse to preserve positions
  const sortedMatches = [...scanResult.matches].sort((a, b) => b.startIndex - a.startIndex);

  for (const match of sortedMatches) {
    redactedContent = 
      redactedContent.substring(0, match.startIndex) + 
      match.redactedWith + 
      redactedContent.substring(match.endIndex);
    phiTypes.add(match.type);
  }

  return {
    redactedContent,
    redactionCount: scanResult.matches.length,
    phiTypes: Array.from(phiTypes),
    originalLength: content.length,
    redactedLength: redactedContent.length
  };
}

async function generateAuditReport(content: string, level: string): Promise<{
  auditId: string;
  scanTimestamp: string;
  contentHash: string;
  findings: {
    totalPHI: number;
    byCategory: Record<string, number>;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
  };
  compliance: {
    hipaaCompliant: boolean;
    issues: string[];
  };
}> {
  const scanResult = await scanForPHI(content, level);
  
  // Generate content hash for audit trail
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (scanResult.riskScore < 20) riskLevel = 'low';
  else if (scanResult.riskScore < 50) riskLevel = 'medium';
  else if (scanResult.riskScore < 80) riskLevel = 'high';
  else riskLevel = 'critical';

  // Generate recommendations
  const recommendations: string[] = [];
  if (scanResult.summary['ssn']) recommendations.push('Remove or encrypt Social Security Numbers');
  if (scanResult.summary['mrn']) recommendations.push('Ensure Medical Record Numbers are properly de-identified');
  if (scanResult.summary['name']) recommendations.push('Replace patient names with pseudonyms or codes');
  if (scanResult.summary['address']) recommendations.push('Remove geographic identifiers smaller than state');
  if (scanResult.summary['date']) recommendations.push('Consider date generalization (year only or date ranges)');

  // Compliance assessment
  const issues: string[] = [];
  if (scanResult.matches.length > 0) {
    issues.push(`Found ${scanResult.matches.length} potential PHI elements`);
  }
  if (scanResult.summary['ssn']) {
    issues.push('SSN detected - high-risk identifier');
  }

  return {
    auditId: `HIPAA_AUDIT_${Date.now()}`,
    scanTimestamp: new Date().toISOString(),
    contentHash: contentHash.substring(0, 16),
    findings: {
      totalPHI: scanResult.matches.length,
      byCategory: scanResult.summary,
      riskLevel,
      recommendations
    },
    compliance: {
      hipaaCompliant: scanResult.matches.length === 0,
      issues
    }
  };
}

function calculateConfidence(type: string, value: string): number {
  // Higher confidence for specific patterns
  const highConfidence = ['ssn', 'email', 'phone', 'mrn'];
  const mediumConfidence = ['date', 'address', 'zipCode'];
  
  if (highConfidence.includes(type)) return 0.95;
  if (mediumConfidence.includes(type)) return 0.85;
  return 0.70;
}

function getRedactionPlaceholder(type: string): string {
  const placeholders: Record<string, string> = {
    name: '[REDACTED NAME]',
    date: '[REDACTED DATE]',
    phone: '[REDACTED PHONE]',
    email: '[REDACTED EMAIL]',
    ssn: '[REDACTED SSN]',
    mrn: '[REDACTED MRN]',
    healthPlan: '[REDACTED HEALTH PLAN]',
    account: '[REDACTED ACCOUNT]',
    license: '[REDACTED LICENSE]',
    vin: '[REDACTED VIN]',
    deviceId: '[REDACTED DEVICE]',
    url: '[REDACTED URL]',
    ip: '[REDACTED IP]',
    biometric: '[REDACTED BIOMETRIC]',
    photo: '[REDACTED PHOTO REF]',
    address: '[REDACTED ADDRESS]',
    zipCode: '[REDACTED ZIP]',
  };
  
  return placeholders[type] || '[REDACTED]';
}
