
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import type { ProfileRequest } from './types.ts';

export async function updateProfile(supabase: any, targetUserId: string, profileData: any) {
  console.log('🔄 Updating profile for user:', targetUserId, profileData);

  // First, check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', targetUserId)
    .single();

  if (existingProfile) {
    // Update existing profile
    console.log('✅ Profile exists, updating...');
    const result = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId)
      .select();

    console.log('✅ Profile update result:', result);
    return result;
  } else {
    // Create new profile - get user email first
    console.log('⚠️ Profile does not exist, creating new one...');
    const { data: authUser } = await supabase.auth.admin.getUserById(targetUserId);
    
    if (!authUser.user) {
      throw new Error('User not found');
    }

    const result = await supabase
      .from('profiles')
      .insert({
        id: targetUserId,
        email: authUser.user.email,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    console.log('✅ Profile create result:', result);
    return result;
  }
}

export async function getProfile(supabase: any, getUserId: string) {
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
