/**
 * Azure Form Recognizer (Document Intelligence) Edge Function
 * 
 * Best-in-class OCR for forms, invoices, receipts, and structured documents.
 * Uses Azure AI Document Intelligence for enterprise-grade document processing.
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supported document models
const DOCUMENT_MODELS = {
  'general': 'prebuilt-read',              // General OCR
  'document': 'prebuilt-document',         // General documents with key-value pairs
  'invoice': 'prebuilt-invoice',           // Invoices
  'receipt': 'prebuilt-receipt',           // Receipts
  'id-document': 'prebuilt-idDocument',    // ID cards, passports
  'business-card': 'prebuilt-businessCard', // Business cards
  'tax-us-w2': 'prebuilt-tax.us.w2',       // US W-2 tax forms
  'health-insurance': 'prebuilt-healthInsuranceCard.us', // Health insurance cards
  'layout': 'prebuilt-layout',             // Layout analysis with tables
} as const;

interface FormRecognizerRequest {
  document: string;           // URL or base64
  inputType: 'url' | 'base64';
  documentType?: keyof typeof DOCUMENT_MODELS;
  language?: string;
  extractTables?: boolean;
  extractKeyValuePairs?: boolean;
  pages?: string;             // e.g., "1-3,5" to process specific pages
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: FormRecognizerRequest = await req.json();
    const FORM_RECOGNIZER_KEY = Deno.env.get('AZURE_FORM_RECOGNIZER_KEY');
    const FORM_RECOGNIZER_ENDPOINT = Deno.env.get('AZURE_FORM_RECOGNIZER_ENDPOINT');

    if (!FORM_RECOGNIZER_KEY || !FORM_RECOGNIZER_ENDPOINT) {
      return new Response(
        JSON.stringify({ error: 'Azure Form Recognizer not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!request.document) {
      return new Response(
        JSON.stringify({ error: 'Document is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const modelId = DOCUMENT_MODELS[request.documentType || 'general'];
    console.log(`📄 Azure Form Recognizer: model=${modelId}, type=${request.inputType}`);

    // Prepare request body
    let requestBody: any;
    if (request.inputType === 'url') {
      requestBody = { urlSource: request.document };
    } else {
      requestBody = { base64Source: request.document };
    }

    // Add optional parameters
    const queryParams = new URLSearchParams();
    if (request.language) queryParams.set('locale', request.language);
    if (request.pages) queryParams.set('pages', request.pages);

    // Start document analysis
    const analyzeUrl = `${FORM_RECOGNIZER_ENDPOINT}/formrecognizer/documentModels/${modelId}:analyze?api-version=2023-07-31${queryParams.toString() ? '&' + queryParams.toString() : ''}`;
    
    const analyzeResponse = await fetch(analyzeUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': FORM_RECOGNIZER_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!analyzeResponse.ok) {
      const errorText = await analyzeResponse.text();
      console.error('Azure Form Recognizer error:', errorText);
      throw new Error(`Azure Form Recognizer error: ${analyzeResponse.status}`);
    }

    // Get operation location for polling
    const operationLocation = analyzeResponse.headers.get('Operation-Location');
    if (!operationLocation) {
      throw new Error('No operation location returned');
    }

    // Poll for results (max 60 seconds)
    let result: any = null;
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const statusResponse = await fetch(operationLocation, {
        headers: {
          'Ocp-Apim-Subscription-Key': FORM_RECOGNIZER_KEY,
        },
      });

      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();
      
      if (statusData.status === 'succeeded') {
        result = statusData.analyzeResult;
        break;
      } else if (statusData.status === 'failed') {
        throw new Error(`Analysis failed: ${statusData.error?.message || 'Unknown error'}`);
      }
      // Continue polling if still running
    }

    if (!result) {
      throw new Error('Analysis timed out');
    }

    console.log(`✅ Azure Form Recognizer completed: ${result.pages?.length || 0} pages processed`);

    // Extract and format results
    const response = {
      success: true,
      content: result.content || '',
      pages: result.pages?.map((page: any) => ({
        pageNumber: page.pageNumber,
        width: page.width,
        height: page.height,
        unit: page.unit,
        lines: page.lines?.map((line: any) => ({
          content: line.content,
          boundingBox: line.polygon,
        })),
        words: page.words?.map((word: any) => ({
          content: word.content,
          confidence: word.confidence,
          boundingBox: word.polygon,
        })),
      })),
      tables: result.tables?.map((table: any) => ({
        rowCount: table.rowCount,
        columnCount: table.columnCount,
        cells: table.cells?.map((cell: any) => ({
          rowIndex: cell.rowIndex,
          columnIndex: cell.columnIndex,
          content: cell.content,
          rowSpan: cell.rowSpan,
          columnSpan: cell.columnSpan,
        })),
      })),
      keyValuePairs: result.keyValuePairs?.map((kv: any) => ({
        key: kv.key?.content,
        value: kv.value?.content,
        confidence: kv.confidence,
      })),
      documents: result.documents?.map((doc: any) => ({
        docType: doc.docType,
        confidence: doc.confidence,
        fields: doc.fields,
      })),
      confidence: result.pages?.[0]?.words?.reduce((sum: number, w: any) => sum + (w.confidence || 0), 0) / (result.pages?.[0]?.words?.length || 1) || 0.9,
      provider: 'azure',
      model: modelId,
      metadata: {
        pageCount: result.pages?.length || 0,
        documentType: request.documentType || 'general',
        language: result.languages?.[0] || request.language,
        estimatedCost: 0.01 * (result.pages?.length || 1), // ~$0.01 per page
      },
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Azure Form Recognizer error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
