
-- Fix cleanup_orphaned_role_assignments function - wrong column name 'description' -> 'activity_description'
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_role_assignments()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Remove role assignments for non-existent users
    DELETE FROM public.user_roles 
    WHERE user_id NOT IN (
        SELECT id FROM auth.users
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup activity with correct column name
    INSERT INTO public.user_activity_logs (
        user_id, 
        activity_type, 
        activity_description,
        metadata
    ) VALUES (
        auth.uid(),
        'role_cleanup',
        'Cleaned up orphaned role assignments',
        jsonb_build_object('deleted_count', deleted_count)
    );
    
    RETURN deleted_count;
END;
$$;

-- Fix audit_role_changes function - wrong column name 'description' -> 'activity_description'
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Log role assignment changes
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.user_activity_logs (
            user_id,
            activity_type,
            activity_description,
            metadata
        ) VALUES (
            NEW.user_id,
            'role_assigned',
            'Role assigned to user',
            jsonb_build_object(
                'role_id', NEW.role_id,
                'assigned_by', NEW.assigned_by,
                'timestamp', now()
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.user_activity_logs (
            user_id,
            activity_type,
            activity_description,
            metadata
        ) VALUES (
            OLD.user_id,
            'role_removed',
            'Role removed from user',
            jsonb_build_object(
                'role_id', OLD.role_id,
                'removed_by', auth.uid(),
                'timestamp', now()
            )
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$;
