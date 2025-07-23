import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 [GENERATE-KNOWLEDGE] Function invoked:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ [GENERATE-KNOWLEDGE] Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      console.error('❌ [GENERATE-KNOWLEDGE] OpenAI API key not found');
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured. Please configure OPENAI_API_KEY in Edge Function secrets.' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      topic, 
      agentType, 
      agentPurpose, 
      contentType = 'comprehensive_guide' 
    } = await req.json();

    console.log('📝 [GENERATE-KNOWLEDGE] Generating content for:', { topic, agentType, agentPurpose, contentType });

    // Create the prompt based on the parameters
    const systemPrompt = `You are a healthcare knowledge expert. Generate comprehensive, accurate, and well-structured content for healthcare professionals and systems.`;
    
    const userPrompt = `Generate ${contentType} content about "${topic}" for a ${agentType} agent with purpose: ${agentPurpose}.

Please provide:
1. A comprehensive overview
2. Key concepts and definitions
3. Best practices and guidelines
4. Common use cases and scenarios
5. Implementation considerations
6. Relevant standards and compliance requirements

Format the response as structured markdown with clear headings and sections.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ [GENERATE-KNOWLEDGE] OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('✅ [GENERATE-KNOWLEDGE] Content generated successfully');

    // Store the generated content in the knowledge base
    const { data: knowledgeEntry, error: insertError } = await supabase
      .from('knowledge_base')
      .insert({
        name: `${topic} - ${agentType} Guide`,
        description: `AI-generated comprehensive guide for ${topic}`,
        category: 'ai_generated',
        source_type: 'ai_generated', 
        raw_content: generatedContent,
        processed_content: generatedContent,
        content_type: contentType,
        healthcare_tags: [topic, agentType, agentPurpose],
        modality_type: agentType,
        metadata: {
          generated_by: 'ai',
          agent_type: agentType,
          agent_purpose: agentPurpose,
          generation_date: new Date().toISOString()
        },
        created_by: null // System generated
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ [GENERATE-KNOWLEDGE] Error storing knowledge:', insertError);
      // Continue anyway, return the generated content
    } else {
      console.log('✅ [GENERATE-KNOWLEDGE] Knowledge stored successfully');
    }

    return new Response(
      JSON.stringify({
        success: true,
        content: generatedContent,
        knowledgeEntry: knowledgeEntry || null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ [GENERATE-KNOWLEDGE] Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate knowledge content' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});