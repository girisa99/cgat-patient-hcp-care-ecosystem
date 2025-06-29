
import type { ProfileRequest } from './types.ts';
import { updateProfile, getProfile } from './profile-operations.ts';
import { listAllUsers, deactivateUser } from './user-list-operations.ts';
import { checkPermissions, checkListPermissions } from './auth.ts';

export async function handleProfileRequest(
  supabase: any,
  user: any,
  request: ProfileRequest
) {
  const { action, user_id, profile_data, deactivation_reason } = request;

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

    case 'deactivate':
      if (!user_id) {
        throw new Error('User ID is required for deactivation');
      }

      // Check if user has permission to deactivate users
      const { hasPermission: canDeactivate, error: deactivateError } = await checkListPermissions(
        supabase, 
        user.id
      );
      
      if (!canDeactivate) {
        throw new Error(deactivateError || 'Insufficient permissions to deactivate users');
      }

      result = await deactivateUser(supabase, user_id, deactivation_reason || '', user.id);
      break;

    default:
      throw new Error('Invalid action');
  }

  return result;
}
