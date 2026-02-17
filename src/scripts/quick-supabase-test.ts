#!/usr/bin/env ts-node
import { supabase } from '../integrations/supabase/client';

(async () => {
  console.log('🔌 Quick Supabase connectivity test...');
  
  try {
    // Test 1: Basic connection
    const { data: authData } = await supabase.auth.getUser();
    console.log('🔐 Auth status:', authData.user ? 'Logged in' : 'Not logged in');
    
    // Test 2: Database read (should work even without auth)
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Database query failed:', error.message);
    } else {
      console.log('✅ Database connection: Working');
    }
    
    // Test 3: Edge function call
    const { data: providerData, error: providerError } = await supabase.functions.invoke('check-ai-provider', {
      body: { provider: 'gemini' }
    });
    
    if (providerError) {
      console.error('❌ Edge function failed:', providerError.message);
    } else {
      console.log('✅ Edge functions: Working');
      console.log('📡 Gemini API:', providerData?.available ? 'Available' : 'Not configured');
    }
    
  } catch (err) {
    console.error('💥 Connection test failed:', err);
  }
})();