import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestRunRequest {
  agentId: string;
  testDatasetId: string;
  modelConfigId: string;
  testName: string;
  sampleLimit?: number;
  parallelProcessing?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: TestRunRequest = await req.json();
    console.log('Starting agent test run:', requestData);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get test dataset and model configuration
    const [datasetResult, modelResult] = await Promise.all([
      supabase.from('test_datasets').select('*').eq('id', requestData.testDatasetId).single(),
      supabase.from('ai_model_configs').select('*').eq('id', requestData.modelConfigId).single()
    ]);

    if (datasetResult.error) throw new Error(`Dataset not found: ${datasetResult.error.message}`);
    if (modelResult.error) throw new Error(`Model config not found: ${modelResult.error.message}`);

    const dataset = datasetResult.data;
    const modelConfig = modelResult.data;

    // Create test run record
    const { data: testRun, error: testRunError } = await supabase
      .from('agent_test_runs')
      .insert({
        agent_id: requestData.agentId,
        test_dataset_id: requestData.testDatasetId,
        model_config_id: requestData.modelConfigId,
        test_name: requestData.testName,
        status: 'running',
        total_samples: Math.min(requestData.sampleLimit || dataset.sample_count, dataset.sample_count)
      })
      .select()
      .single();

    if (testRunError) throw new Error(`Failed to create test run: ${testRunError.message}`);

    console.log('Created test run:', testRun.id);

    // Generate and process test samples
    const testSamples = generateTestSamples(dataset, requestData.sampleLimit || dataset.sample_count);
    
    let results: any[] = [];
    let successCount = 0;
    let totalProcessingTime = 0;

    if (requestData.parallelProcessing && testSamples.length <= 10) {
      // Process samples in parallel for small batches
      const promises = testSamples.map((sample, index) => 
        processSample(sample, index, modelConfig, testRun.id)
      );
      
      results = await Promise.allSettled(promises);
      successCount = results.filter(r => r.status === 'fulfilled').length;
      totalProcessingTime = results.reduce((sum, r) => 
        sum + (r.status === 'fulfilled' ? r.value.processingTime : 0), 0
      );
    } else {
      // Process samples sequentially
      for (let i = 0; i < testSamples.length; i++) {
        try {
          const result = await processSample(testSamples[i], i, modelConfig, testRun.id);
          results.push(result);
          successCount++;
          totalProcessingTime += result.processingTime;
          
          // Update progress every 10 samples
          if ((i + 1) % 10 === 0) {
            await updateTestRunProgress(supabase, testRun.id, i + 1, successCount);
          }
        } catch (error) {
          console.error(`Sample ${i} failed:`, error);
          results.push({ error: error.message, processingTime: 0 });
        }
      }
    }

    // Calculate final metrics
    const successRate = (successCount / testSamples.length) * 100;
    const avgResponseTime = totalProcessingTime / testSamples.length;
    const avgAccuracy = calculateAverageAccuracy(results);

    // Update test run with final results
    await supabase
      .from('agent_test_runs')
      .update({
        status: 'completed',
        end_time: new Date().toISOString(),
        processed_samples: testSamples.length,
        success_rate: successRate,
        avg_response_time_ms: Math.round(avgResponseTime),
        avg_accuracy: avgAccuracy,
        results: {
          total_samples: testSamples.length,
          successful_samples: successCount,
          failed_samples: testSamples.length - successCount,
          sample_results: results.slice(0, 10) // Store first 10 for preview
        },
        performance_metrics: {
          throughput_per_minute: (testSamples.length / (totalProcessingTime / 60000)),
          model_type: modelConfig.model_type,
          performance_tier: modelConfig.performance_tier,
          resource_efficiency: calculateResourceEfficiency(modelConfig.performance_tier, avgResponseTime)
        }
      })
      .eq('id', testRun.id);

    return new Response(JSON.stringify({
      testRunId: testRun.id,
      status: 'completed',
      summary: {
        totalSamples: testSamples.length,
        successfulSamples: successCount,
        successRate,
        avgResponseTime: Math.round(avgResponseTime),
        avgAccuracy,
        modelType: modelConfig.model_type,
        performanceTier: modelConfig.performance_tier
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Test run error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateTestSamples(dataset: any, sampleLimit: number) {
  const samples = [];
  const labels = dataset.labels || [];
  
  for (let i = 0; i < Math.min(sampleLimit, dataset.sample_count); i++) {
    let sample: any = {};
    
    switch (dataset.dataset_type) {
      case 'vision':
        sample = {
          imageUrl: `https://picsum.photos/224/224?random=${i}`, // Sample images
          prompt: 'What do you see in this image?',
          expectedLabel: labels[i % labels.length] || 'unknown'
        };
        break;
        
      case 'text':
        const sampleTexts = [
          'This product is amazing! I love it.',
          'Terrible service, would not recommend.',
          'The weather today is quite nice.',
          'How do I reset my password?',
          'Please cancel my subscription immediately.'
        ];
        sample = {
          text: sampleTexts[i % sampleTexts.length],
          expectedLabel: labels[i % labels.length] || 'neutral'
        };
        break;
        
      case 'speech':
        sample = {
          audio: generateMockAudioData(), // Mock base64 audio
          expectedText: `Sample speech text number ${i + 1}`,
          audioLength: Math.floor(Math.random() * 5000) + 1000 // 1-6 seconds
        };
        break;
        
      case 'multimodal':
        sample = {
          imageUrl: `https://picsum.photos/224/224?random=${i}`,
          text: 'What is happening in this image?',
          expectedResponse: `Description of image ${i + 1}`
        };
        break;
    }
    
    samples.push(sample);
  }
  
  return samples;
}

async function processSample(sample: any, index: number, modelConfig: any, testRunId: string) {
  const startTime = Date.now();
  
  try {
    // Call the AI model processor
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-model-processor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify({
        modelType: modelConfig.model_type,
        provider: modelConfig.provider,
        modelId: modelConfig.model_id,
        inputData: sample,
        configuration: modelConfig.configuration,
        testRunId,
        sampleIndex: index
      })
    });

    const result = await response.json();
    const processingTime = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(result.error || 'Processing failed');
    }

    // Calculate accuracy based on expected vs actual output
    const accuracy = calculateSampleAccuracy(sample, result.result, modelConfig.model_type);

    return {
      success: true,
      result: result.result,
      processingTime,
      accuracy,
      sampleIndex: index
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`Sample ${index} processing error:`, error);
    
    return {
      success: false,
      error: error.message,
      processingTime,
      accuracy: 0,
      sampleIndex: index
    };
  }
}

function calculateSampleAccuracy(sample: any, result: any, modelType: string): number {
  try {
    switch (modelType) {
      case 'vision':
        // Simple keyword matching for vision classification
        if (result.text && sample.expectedLabel) {
          return result.text.toLowerCase().includes(sample.expectedLabel.toLowerCase()) ? 100 : 0;
        }
        return 50; // Default accuracy for vision tasks
        
      case 'text':
        // Sentiment/intent matching
        if (result.text && sample.expectedLabel) {
          return result.text.toLowerCase().includes(sample.expectedLabel.toLowerCase()) ? 100 : 0;
        }
        return 50;
        
      case 'speech_to_text':
        // Text similarity for speech recognition
        if (result.text && sample.expectedText) {
          const similarity = calculateTextSimilarity(result.text, sample.expectedText);
          return similarity * 100;
        }
        return 50;
        
      case 'text_to_speech':
        // For TTS, we assume success if audio is generated
        return result.audioContent ? 100 : 0;
        
      default:
        return 50; // Default accuracy
    }
  } catch (error) {
    console.error('Error calculating accuracy:', error);
    return 0;
  }
}

function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];
  
  return intersection.length / union.length;
}

function calculateAverageAccuracy(results: any[]): number {
  const accuracyScores = results
    .filter(r => r.accuracy !== undefined)
    .map(r => r.accuracy);
    
  return accuracyScores.length > 0 
    ? accuracyScores.reduce((sum, acc) => sum + acc, 0) / accuracyScores.length 
    : 0;
}

function calculateResourceEfficiency(performanceTier: string, avgResponseTime: number): string {
  const thresholds = {
    lightweight: 500,
    standard: 2000,
    premium: 5000,
    gpu_intensive: 10000
  };
  
  const threshold = thresholds[performanceTier as keyof typeof thresholds] || 2000;
  
  if (avgResponseTime < threshold * 0.5) return 'excellent';
  if (avgResponseTime < threshold) return 'good';
  if (avgResponseTime < threshold * 2) return 'fair';
  return 'poor';
}

async function updateTestRunProgress(supabase: any, testRunId: string, processedSamples: number, successCount: number) {
  await supabase
    .from('agent_test_runs')
    .update({
      processed_samples: processedSamples,
      success_rate: (successCount / processedSamples) * 100
    })
    .eq('id', testRunId);
}

function generateMockAudioData(): string {
  // Generate a small mock WAV file in base64
  const sampleRate = 16000;
  const duration = 2; // 2 seconds
  const samples = sampleRate * duration;
  
  // Create a simple sine wave
  const audioData = new Int16Array(samples);
  for (let i = 0; i < samples; i++) {
    audioData[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0x7FFF;
  }
  
  // Convert to base64 (simplified - in reality you'd create proper WAV headers)
  const uint8Array = new Uint8Array(audioData.buffer);
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  
  return btoa(binary);
}