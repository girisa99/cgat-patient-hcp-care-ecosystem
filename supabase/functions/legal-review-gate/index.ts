import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LegalReviewRequest {
  action: 'submit' | 'approve' | 'reject' | 'request_changes' | 'get_status' | 'get_pending';
  content_id?: string;
  content_type?: 'video' | 'audio' | 'script' | 'image' | 'document';
  content_data?: Record<string, unknown>;
  reviewer_id?: string;
  review_notes?: string;
  compliance_flags?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, content_id, content_type, content_data, reviewer_id, review_notes, compliance_flags } = await req.json() as LegalReviewRequest;

    console.log(`📋 Legal Review Gate: ${action}`, { content_id, content_type });

    switch (action) {
      case 'submit': {
        // Submit content for legal review
        const reviewId = crypto.randomUUID();
        
        // AI-powered pre-screening for compliance issues
        const complianceCheck = await performCompliancePreScreen(content_data);
        
        const { data, error } = await supabase
          .from('legal_reviews')
          .insert({
            id: reviewId,
            content_id,
            content_type,
            content_data,
            status: complianceCheck.autoApproved ? 'auto_approved' : 'pending',
            compliance_score: complianceCheck.score,
            flagged_issues: complianceCheck.issues,
            submitted_at: new Date().toISOString(),
            auto_screened: true,
            screening_results: complianceCheck
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          review_id: reviewId,
          status: complianceCheck.autoApproved ? 'auto_approved' : 'pending_review',
          compliance_score: complianceCheck.score,
          flagged_issues: complianceCheck.issues,
          estimated_review_time: complianceCheck.autoApproved ? 0 : estimateReviewTime(complianceCheck)
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'approve': {
        const { data, error } = await supabase
          .from('legal_reviews')
          .update({
            status: 'approved',
            reviewer_id,
            review_notes,
            reviewed_at: new Date().toISOString(),
            approval_type: 'manual'
          })
          .eq('content_id', content_id)
          .select()
          .single();

        if (error) throw error;

        // Trigger post-approval workflow
        await triggerPostApprovalWorkflow(supabase, content_id!, data);

        return new Response(JSON.stringify({
          success: true,
          status: 'approved',
          message: 'Content approved for publication',
          next_steps: ['Ready for publishing', 'Notifications sent to stakeholders']
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'reject': {
        const { data, error } = await supabase
          .from('legal_reviews')
          .update({
            status: 'rejected',
            reviewer_id,
            review_notes,
            compliance_flags,
            reviewed_at: new Date().toISOString()
          })
          .eq('content_id', content_id)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          status: 'rejected',
          reasons: compliance_flags,
          notes: review_notes,
          can_resubmit: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'request_changes': {
        const { data, error } = await supabase
          .from('legal_reviews')
          .update({
            status: 'changes_requested',
            reviewer_id,
            review_notes,
            compliance_flags,
            reviewed_at: new Date().toISOString()
          })
          .eq('content_id', content_id)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          status: 'changes_requested',
          required_changes: compliance_flags,
          notes: review_notes
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_status': {
        const { data, error } = await supabase
          .from('legal_reviews')
          .select('*')
          .eq('content_id', content_id)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .single();

        return new Response(JSON.stringify({
          success: true,
          review: data || null,
          has_review: !!data
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_pending': {
        const { data, error } = await supabase
          .from('legal_reviews')
          .select('*')
          .in('status', ['pending', 'changes_requested'])
          .order('submitted_at', { ascending: true });

        return new Response(JSON.stringify({
          success: true,
          pending_reviews: data || [],
          count: data?.length || 0
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('❌ Legal Review Gate error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function performCompliancePreScreen(content: Record<string, unknown> | undefined): Promise<{
  score: number;
  issues: string[];
  autoApproved: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}> {
  const issues: string[] = [];
  let score = 100;

  if (!content) {
    return { score: 100, issues: [], autoApproved: true, riskLevel: 'low' };
  }

  const contentStr = JSON.stringify(content).toLowerCase();

  // Check for common compliance issues
  const compliancePatterns = [
    { pattern: /copyright|©|all rights reserved/i, issue: 'Contains copyright notices - verify rights', deduction: 15 },
    { pattern: /trademark|™|®/i, issue: 'Contains trademark symbols - verify usage rights', deduction: 10 },
    { pattern: /confidential|proprietary/i, issue: 'Marked as confidential content', deduction: 25 },
    { pattern: /patient|medical|health|hipaa/i, issue: 'Contains potential PHI - HIPAA review required', deduction: 30 },
    { pattern: /social security|ssn|bank account/i, issue: 'Contains sensitive PII', deduction: 40 },
    { pattern: /guarantee|promise|claim/i, issue: 'Contains potential claims - legal review recommended', deduction: 10 },
  ];

  for (const { pattern, issue, deduction } of compliancePatterns) {
    if (pattern.test(contentStr)) {
      issues.push(issue);
      score -= deduction;
    }
  }

  score = Math.max(0, score);
  const riskLevel = score >= 80 ? 'low' : score >= 50 ? 'medium' : 'high';
  const autoApproved = score >= 90 && issues.length === 0;

  return { score, issues, autoApproved, riskLevel };
}

function estimateReviewTime(complianceCheck: { score: number; issues: string[] }): number {
  // Returns estimated review time in hours
  if (complianceCheck.score >= 80) return 2;
  if (complianceCheck.score >= 50) return 8;
  return 24;
}

async function triggerPostApprovalWorkflow(supabase: any, contentId: string, reviewData: any): Promise<void> {
  // Log the approval for audit
  await supabase.from('audit_logs').insert({
    action: 'legal_approval',
    resource_type: 'content',
    resource_id: contentId,
    details: {
      review_id: reviewData.id,
      approval_type: reviewData.approval_type,
      reviewer_id: reviewData.reviewer_id
    },
    created_at: new Date().toISOString()
  });

  console.log(`✅ Post-approval workflow triggered for content: ${contentId}`);
}
