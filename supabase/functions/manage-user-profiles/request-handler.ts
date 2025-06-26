
import type { ProfileRequest } from './types.ts';
import { updateProfile, getProfile } from './profile-operations.ts';
import { listAllUsers } from './user-list-operations.ts';
import { checkPermissions, checkListPermissions } from './auth.ts';

export async function handleProfileRequest(
  supabase: any,
  user: any,
  request: ProfileRequest
) {
  const { action, user_id, profile_data } = request;

  let result;
  switch (action) {
    case 'update':
      const targetUserId = user_id || user.id;
      
      // Check if user can update this profile
      const { hasPermission, error: permError } = await checkPermissions(
        supabase, 
        user.id, 
        targetUserId
      );
      
      if (!hasPermission) {
        throw new Error(permError || 'Insufficient permissions');
      }

      result = await updateProfile(supabase, targetUserId, profile_data);
      break;

    case 'get':
      const getUserId = user_id || user.id;
      result = await getProfile(supabase, getUserId);
      break;

    case 'list':
      // Check if user has permission to list profiles
      const { hasPermission: canList, error: listError } = await checkListPermissions(
        supabase, 
        user.id
      );
      
      if (!canList) {
        throw new Error(listError || 'Insufficient permissions');
      }

      result = await listAllUsers(supabase);
      break;

    default:
      throw new Error('Invalid action');
  }

  return result;
}
