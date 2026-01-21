/**
 * DeepSeek Vision Edge Function
 * 
 * Vision/OCR capabilities using DeepSeek-VL model.
 * Optimized for Chinese document understanding and multilingual content.
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VisionRequest {
  image: string;              // URL or base64
  inputType: 'url' | 'base64';
  operation: 'analyze' | 'ocr' | 'describe' | 'extract';
  prompt?: string;
  language?: string;
  documentType?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: VisionRequest = await req.json();
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');

    if (!DEEPSEEK_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'DEEPSEEK_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!request.image) {
      return new Response(
        JSON.stringify({ error: 'Image is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`👁️ DeepSeek Vision: operation=${request.operation}, type=${request.inputType}`);

    // Build the prompt based on operation
    let systemPrompt = '';
    let userPrompt = request.prompt || '';

    switch (request.operation) {
      case 'ocr':
        systemPrompt = `You are an expert OCR system. Extract ALL text from the image with high accuracy. 
        Preserve the original structure and formatting. 
        For tables, format them clearly.
        For multilingual content, accurately transcribe each language.
        ${request.documentType ? `This is a ${request.documentType} document.` : ''}
        ${request.language ? `Primary language: ${request.language}` : ''}`;
        userPrompt = userPrompt || 'Extract all text from this image. Preserve structure and formatting.';
        break;
        
      case 'describe':
        systemPrompt = 'You are an expert at describing images in detail. Provide comprehensive descriptions.';
        userPrompt = userPrompt || 'Describe this image in detail.';
        break;
        
      case 'extract':
        systemPrompt = `You are an expert at extracting structured information from documents.
        Extract key-value pairs, tables, and important data.
        Return results in a structured JSON format when possible.`;
        userPrompt = userPrompt || 'Extract all structured information from this document.';
        break;
        
      case 'analyze':
      default:
        systemPrompt = 'You are an expert image analyst. Analyze the image and provide insights.';
        userPrompt = userPrompt || 'Analyze this image and provide your observations.';
        break;
    }

    // Prepare image URL for DeepSeek
    let imageUrl = request.image;
    if (request.inputType === 'base64') {
      // Check if it already has the data URL prefix
      if (!request.image.startsWith('data:')) {
        imageUrl = `data:image/jpeg;base64,${request.image}`;
      }
    }

    // Call DeepSeek Vision API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-vl', // DeepSeek Vision Language model
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
              {
                type: 'text',
                text: userPrompt,
              },
            ],
          },
        ],
        max_tokens: 4096,
        temperature: 0.1, // Low temperature for accurate extraction
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek Vision error:', errorText);
      
      // Fallback for vision model not available
      if (response.status === 404 || errorText.includes('model')) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'DeepSeek-VL model not available. Using text-only fallback.',
            fallback: true,
            content: null,
            provider: 'deepseek'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '';

    console.log(`✅ DeepSeek Vision completed: ${content.length} chars extracted`);

    // Try to parse structured data if extraction operation
    let structure: any = undefined;
    if (request.operation === 'extract') {
      try {
        // Try to find JSON in the response
        const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                          content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          structure = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        }
      } catch {
        // Not valid JSON, that's fine
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        content,
        structure,
        confidence: 0.9, // DeepSeek-VL is generally high accuracy
        provider: 'deepseek',
        model: 'deepseek-vl',
        metadata: {
          operation: request.operation,
          documentType: request.documentType,
          language: request.language,
          tokenUsage: result.usage,
          estimatedCost: 0.001 * (result.usage?.total_tokens || 1000) / 1000,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('DeepSeek Vision error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
