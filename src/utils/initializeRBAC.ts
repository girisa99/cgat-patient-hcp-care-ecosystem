/**
 * INITIALIZE RBAC SCHEMA AND ASSIGN SUPERADMIN ROLE
 * This utility sets up the database schema and assigns roles
 */
import { supabase } from '@/integrations/supabase/client';

export const initializeRBACSchema = async () => {
  console.log('🔧 Initializing RBAC schema...');
  
  try {
    // Step 1: Create profiles table if it doesn't exist
    const { error: profilesError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          first_name TEXT,
          last_name TEXT,
          email TEXT,
          phone TEXT,
          avatar_url TEXT,
          is_active BOOLEAN DEFAULT true
        );
        
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      `
    });
    
    if (profilesError) {
      console.log('⚠️ Profiles table might already exist:', profilesError);
    }
    
    // Step 2: Create healthcare roles enum
    const { error: enumError } = await supabase.rpc('sql', {
      query: `
        DO $$ BEGIN
          CREATE TYPE public.healthcare_role AS ENUM (
            'superAdmin',
            'admin', 
            'provider',
            'nurse',
            'onboardingTeam',
            'technicalServices',
            'billing',
            'compliance',
            'caregiver',
            'patient'
          );
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `
    });
    
    if (enumError) {
      console.log('⚠️ Healthcare role enum might already exist:', enumError);
    }
    
    // Step 3: Create roles table
    const { error: rolesError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.roles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name public.healthcare_role UNIQUE NOT NULL,
          description TEXT,
          hierarchy_level INTEGER NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
      `
    });
    
    if (rolesError) {
      console.log('⚠️ Roles table error:', rolesError);
    }
    
    // Step 4: Create user_roles table
    const { error: userRolesError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.user_roles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
          role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
          role public.healthcare_role,
          granted_by UUID REFERENCES public.profiles(id),
          granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE,
          is_active BOOLEAN DEFAULT true,
          facility_id UUID,
          UNIQUE(user_id, role_id, facility_id)
        );
        
        ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
      `
    });
    
    if (userRolesError) {
      console.log('⚠️ User roles table error:', userRolesError);
    }
    
    console.log('✅ RBAC schema initialization completed');
    return true;
    
  } catch (error) {
    console.error('💥 Error initializing RBAC schema:', error);
    return false;
  }
};

export const insertDefaultRoles = async () => {
  console.log('📊 Inserting default healthcare roles...');
  
  try {
    const defaultRoles = [
      { name: 'superAdmin', description: 'System Super Administrator - Full Access', hierarchy_level: 1 },
      { name: 'admin', description: 'Facility Administrator', hierarchy_level: 2 },
      { name: 'provider', description: 'Healthcare Provider', hierarchy_level: 3 },
      { name: 'nurse', description: 'Nursing Staff', hierarchy_level: 4 },
      { name: 'onboardingTeam', description: 'Onboarding Team Member', hierarchy_level: 5 },
      { name: 'technicalServices', description: 'Technical Services', hierarchy_level: 6 },
      { name: 'billing', description: 'Billing Department', hierarchy_level: 7 },
      { name: 'compliance', description: 'Compliance Officer', hierarchy_level: 8 },
      { name: 'caregiver', description: 'Patient Caregiver', hierarchy_level: 9 },
      { name: 'patient', description: 'Patient', hierarchy_level: 10 }
    ];
    
    for (const role of defaultRoles) {
      const { error } = await supabase
        .from('roles')
        .upsert(role, { onConflict: 'name' });
      
      if (error) {
        console.log(`⚠️ Error inserting role ${role.name}:`, error);
      } else {
        console.log(`✅ Role ${role.name} inserted/updated`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('💥 Error inserting default roles:', error);
    return false;
  }
};

export const createUserProfile = async (userEmail: string, firstName: string = 'Super', lastName: string = 'Admin') => {
  console.log(`👤 Creating/updating profile for ${userEmail}...`);
  
  try {
    // Get the user ID from auth.users
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser.user) {
      console.error('❌ Could not get current user:', authError);
      return null;
    }
    
    if (authUser.user.email !== userEmail) {
      console.log(`⚠️ Current user ${authUser.user.email} is not ${userEmail}`);
      return null;
    }
    
    // Create/update profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authUser.user.id,
        email: userEmail,
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    
    if (profileError) {
      console.error('❌ Error creating profile:', profileError);
      return null;
    }
    
    console.log(`✅ Profile created/updated for ${userEmail}`);
    return authUser.user.id;
    
  } catch (error) {
    console.error('💥 Error creating user profile:', error);
    return null;
  }
};

export const assignSuperAdminRole = async (userEmail: string) => {
  console.log(`👑 Assigning superAdmin role to ${userEmail}...`);
  
  try {
    // First ensure user profile exists
    const userId = await createUserProfile(userEmail);
    if (!userId) {
      console.error('❌ Could not create user profile');
      return false;
    }
    
    // Get superAdmin role ID
    const { data: superAdminRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'superAdmin')
      .single();
    
    if (roleError || !superAdminRole) {
      console.error('❌ Could not find superAdmin role:', roleError);
      return false;
    }
    
    // Assign the role
    const { error: assignError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role_id: superAdminRole.id,
        role: 'superAdmin',
        is_active: true,
        granted_at: new Date().toISOString()
      }, { onConflict: 'user_id,role_id,facility_id' });
    
    if (assignError) {
      console.error('❌ Error assigning superAdmin role:', assignError);
      return false;
    }
    
    console.log(`✅ SuperAdmin role assigned to ${userEmail}`);
    return true;
    
  } catch (error) {
    console.error('💥 Error assigning superAdmin role:', error);
    return false;
  }
};

export const setupRBACForSuperAdmin = async (userEmail: string = 'superadmintest@geniecellgene.com') => {
  console.log('🚀 Setting up complete RBAC system...');
  
  try {
    // Step 1: Initialize schema
    const schemaResult = await initializeRBACSchema();
    if (!schemaResult) {
      console.error('❌ Schema initialization failed');
      return false;
    }
    
    // Step 2: Insert default roles
    const rolesResult = await insertDefaultRoles();
    if (!rolesResult) {
      console.error('❌ Default roles insertion failed');
      return false;
    }
    
    // Step 3: Assign superAdmin role to the user
    const roleAssignResult = await assignSuperAdminRole(userEmail);
    if (!roleAssignResult) {
      console.error('❌ SuperAdmin role assignment failed');
      return false;
    }
    
    console.log('🎉 RBAC system setup completed successfully!');
    return true;
    
  } catch (error) {
    console.error('💥 Error setting up RBAC system:', error);
    return false;
  }
};