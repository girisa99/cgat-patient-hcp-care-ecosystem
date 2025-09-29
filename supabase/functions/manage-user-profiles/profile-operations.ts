
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import type { ProfileRequest } from './types.ts';
import { getAuthUserById, validateDataArchitectureCompliance } from '../_shared/user-data-utils.ts';

export async function updateProfile(supabase: any, targetUserId: string, profileData: any) {
  validateDataArchitectureCompliance('manage-user-profiles/updateProfile');
  
  console.log('🔄 [MANAGE-USER-PROFILES] Updating profile for user:', targetUserId, profileData);

  // Validate user exists in auth.users (PRIMARY SOURCE)
  try {
    const authUser = await getAuthUserById(supabase, targetUserId);
    console.log('✅ [MANAGE-USER-PROFILES] User validated in auth.users:', authUser.email);
  } catch (error) {
    console.error('❌ [MANAGE-USER-PROFILES] User validation failed:', error);
    throw new Error(`User not found in auth.users: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Check if profile exists in supplementary table
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', targetUserId)
    .single();

  if (existingProfile) {
    // Update existing supplementary profile
    console.log('✅ [MANAGE-USER-PROFILES] Profile exists in supplementary table, updating...');
    const result = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId)
      .select();

    console.log('✅ [MANAGE-USER-PROFILES] Supplementary profile update result:', result);
    return result;
  } else {
    // Create new supplementary profile
    console.log('⚠️ [MANAGE-USER-PROFILES] Creating new supplementary profile...');
    const authUser = await getAuthUserById(supabase, targetUserId);
    
    const result = await supabase
      .from('profiles')
      .insert({
        id: targetUserId,
        email: authUser.email, // Use email from auth.users (primary source)
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    console.log('✅ [MANAGE-USER-PROFILES] Supplementary profile create result:', result);
    return result;
  }
}

export async function getProfile(supabase: any, getUserId: string) {
  validateDataArchitectureCompliance('manage-user-profiles/getProfile');
  
  console.log('🔍 [MANAGE-USER-PROFILES] Getting profile with auth.users validation');
  
  // Validate user exists in auth.users first (PRIMARY SOURCE)
  try {
    await getAuthUserById(supabase, getUserId);
  } catch (error) {
    console.error('❌ [MANAGE-USER-PROFILES] User not found in auth.users:', error);
    throw new Error('User not found in primary data source (auth.users)');
  }

  // Get supplementary profile data
  return await supabase
    .from('profiles')
    .select(`
      *,
      facilities (
        id,
        name,
        facility_type
      )
    `)
    .eq('id', getUserId)
    .single();
}
