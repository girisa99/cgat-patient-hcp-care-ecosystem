#!/usr/bin/env ts-node
import { supabase } from '../integrations/supabase/client';

(async () => {
  console.log('🔌 Testing Supabase client connection...');
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Supabase client connection successful!');
    console.log(`   Found ${data?.length || 0} profiles in database`);
    
    // Test edge function connectivity
    console.log('🧪 Testing edge function connectivity...');
    const { data: funcData, error: funcError } = await supabase.functions.invoke('check-ai-provider', {
      body: { provider: 'gemini' }
    });
    
    if (funcError) {
      console.warn('⚠️  Edge function test failed:', funcError.message);
    } else {
      console.log('✅ Edge functions accessible!');
      console.log('   Gemini API status:', funcData?.available ? 'Available' : 'Not configured');
    }
    
  } catch (err) {
    console.error('❌ Supabase test failed:', err);
    process.exit(1);
  }
})();