/**
 * FIX EXISTING RBAC RELATIONSHIPS AND ASSIGN SUPERADMIN ROLE
 * This utility fixes the existing database relationships and assigns roles
 */
import { supabase } from '@/integrations/supabase/client';

// Check current database schema
export const checkDatabaseSchema = async () => {
  console.log('🔍 Checking current database schema...');
  
  try {
    // Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['profiles', 'user_roles', 'roles', 'facilities', 'modules']);
    
    if (tablesError) {
      console.log('⚠️ Error checking tables:', tablesError);
    } else {
      console.log('📋 Existing tables:', tables?.map(t => t.table_name));
    }
    
    // Check if roles exist
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*');
    
    if (rolesError) {
      console.log('⚠️ Error checking roles:', rolesError);
    } else {
      console.log('👑 Existing roles:', roles?.map(r => r.name));
    }
    
    // Check if superAdmin role exists
    const { data: superAdminRole, error: superAdminError } = await supabase
      .from('roles')
      .select('*')
      .eq('name', 'superAdmin')
      .single();
    
    if (superAdminError) {
      console.log('⚠️ SuperAdmin role not found:', superAdminError);
      return { needsSuperAdminRole: true, superAdminRoleId: null };
    } else {
      console.log('✅ SuperAdmin role exists:', superAdminRole);
      return { needsSuperAdminRole: false, superAdminRoleId: superAdminRole.id };
    }
    
  } catch (error) {
    console.error('💥 Error checking database schema:', error);
    return { needsSuperAdminRole: true, superAdminRoleId: null };
  }
};

// Add missing roles if needed
export const addMissingSuperAdminRole = async () => {
  console.log('👑 Adding missing superAdmin role...');
  
  try {
    const { data, error } = await supabase
      .from('roles')
      .upsert({
        name: 'superAdmin',
        description: 'System Super Administrator - Full Access'
      }, { onConflict: 'name' })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error adding superAdmin role:', error);
      return null;
    }
    
    console.log('✅ SuperAdmin role added:', data);
    return data.id;
  } catch (error) {
    console.error('💥 Error adding superAdmin role:', error);
    return null;
  }
};

// Get current user info
export const getCurrentUserInfo = async () => {
  console.log('👤 Getting current user info...');
  
  try {
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser.user) {
      console.error('❌ Could not get current user:', authError);
      return null;
    }
    
    console.log('✅ Current user:', authUser.user.email, authUser.user.id);
    
    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.user.id)
      .single();
    
    if (profileError) {
      console.log('⚠️ Profile not found, will create:', profileError);
      return { user: authUser.user, profile: null };
    }
    
    console.log('✅ Profile exists:', profile);
    return { user: authUser.user, profile };
    
  } catch (error) {
    console.error('💥 Error getting current user info:', error);
    return null;
  }
};

// Create user profile if missing
export const createUserProfile = async (user: any) => {
  console.log('📝 Creating user profile...');
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        first_name: user.user_metadata?.firstName || user.user_metadata?.first_name || 'Super',
        last_name: user.user_metadata?.lastName || user.user_metadata?.last_name || 'Admin',
        email: user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating profile:', error);
      return null;
    }
    
    console.log('✅ Profile created:', data);
    return data;
  } catch (error) {
    console.error('💥 Error creating profile:', error);
    return null;
  }
};

// Assign superAdmin role to user
export const assignSuperAdminRole = async (userId: string, roleId: string) => {
  console.log('🎯 Assigning superAdmin role to user...');
  
  try {
    // First check if already assigned
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .single();
    
    if (!checkError && existingRole) {
      console.log('✅ SuperAdmin role already assigned');
      return existingRole;
    }
    
    // Assign the role
    const { data, error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role_id: roleId,
        assigned_by: userId, // Self-assigned for now
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id,role_id' })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error assigning superAdmin role:', error);
      return null;
    }
    
    console.log('✅ SuperAdmin role assigned:', data);
    return data;
  } catch (error) {
    console.error('💥 Error assigning superAdmin role:', error);
    return null;
  }
};

// Complete RBAC fix
export const fixRBACForCurrentUser = async () => {
  console.log('🚀 Starting complete RBAC fix...');
  
  try {
    // Step 1: Check database schema
    const schemaCheck = await checkDatabaseSchema();
    
    // Step 2: Add superAdmin role if needed
    let superAdminRoleId = schemaCheck.superAdminRoleId;
    if (schemaCheck.needsSuperAdminRole) {
      superAdminRoleId = await addMissingSuperAdminRole();
      if (!superAdminRoleId) {
        console.error('❌ Failed to create superAdmin role');
        return false;
      }
    }
    
    // Step 3: Get current user info
    const userInfo = await getCurrentUserInfo();
    if (!userInfo) {
      console.error('❌ Could not get user info');
      return false;
    }
    
    // Step 4: Create profile if missing
    let profile = userInfo.profile;
    if (!profile) {
      profile = await createUserProfile(userInfo.user);
      if (!profile) {
        console.error('❌ Failed to create user profile');
        return false;
      }
    }
    
    // Step 5: Assign superAdmin role
    const roleAssignment = await assignSuperAdminRole(userInfo.user.id, superAdminRoleId);
    if (!roleAssignment) {
      console.error('❌ Failed to assign superAdmin role');
      return false;
    }
    
    console.log('🎉 RBAC fix completed successfully!');
    console.log('👤 User:', userInfo.user.email);
    console.log('📋 Profile:', profile.first_name, profile.last_name);
    console.log('👑 Role: SuperAdmin');
    
    return true;
    
  } catch (error) {
    console.error('💥 Error during RBAC fix:', error);
    return false;
  }
};

// Test the relationships
export const testUserRoleRelationship = async () => {
  console.log('🧪 Testing user-role relationship...');
  
  try {
    const { data: userInfo, error: authError } = await supabase.auth.getUser();
    
    if (authError || !userInfo.user) {
      console.error('❌ Could not get current user for testing');
      return false;
    }
    
    // Test the query that was failing
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(
          role:roles(name, description)
        )
      `)
      .eq('id', userInfo.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile query still failing:', profileError);
      return false;
    }
    
    console.log('✅ Profile query successful:', profileData);
    console.log('👑 User roles:', profileData.user_roles);
    
    return true;
    
  } catch (error) {
    console.error('💥 Error testing relationship:', error);
    return false;
  }
};