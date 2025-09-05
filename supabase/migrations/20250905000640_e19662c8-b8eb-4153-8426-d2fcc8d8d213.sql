-- Create a simple function to seed environments if they don't exist
DO $$
DECLARE
    user_uuid uuid;
BEGIN
    -- Get the first user ID
    SELECT id INTO user_uuid FROM auth.users LIMIT 1;
    
    -- Only proceed if we have a user
    IF user_uuid IS NOT NULL THEN
        -- Insert Development environment
        INSERT INTO public.deployment_environments (
            name, environment_type, cloud_provider, region,
            infrastructure_config, deployment_config, environment_variables,
            status, created_by
        )
        SELECT 
            'Development', 'development', 'aws', 'us-east-1',
            '{"instance_type": "t3.micro", "auto_scaling": false}',
            '{"replicas": 1, "cpu_limit": "0.5", "memory_limit": "512Mi"}',
            '{"NODE_ENV": "development", "LOG_LEVEL": "debug"}',
            'active', user_uuid
        WHERE NOT EXISTS (
            SELECT 1 FROM public.deployment_environments WHERE name = 'Development'
        );
        
        -- Insert Staging environment
        INSERT INTO public.deployment_environments (
            name, environment_type, cloud_provider, region,
            infrastructure_config, deployment_config, environment_variables,
            status, created_by
        )
        SELECT 
            'Staging', 'staging', 'aws', 'us-east-1',
            '{"instance_type": "t3.small", "auto_scaling": true}',
            '{"replicas": 2, "cpu_limit": "1", "memory_limit": "1Gi"}',
            '{"NODE_ENV": "staging", "LOG_LEVEL": "info"}',
            'active', user_uuid
        WHERE NOT EXISTS (
            SELECT 1 FROM public.deployment_environments WHERE name = 'Staging'
        );
        
        -- Insert Production environment
        INSERT INTO public.deployment_environments (
            name, environment_type, cloud_provider, region,
            infrastructure_config, deployment_config, environment_variables,
            status, created_by
        )
        SELECT 
            'Production', 'production', 'aws', 'us-east-1',
            '{"instance_type": "t3.medium", "auto_scaling": true}',
            '{"replicas": 3, "cpu_limit": "2", "memory_limit": "2Gi"}',
            '{"NODE_ENV": "production", "LOG_LEVEL": "warn"}',
            'active', user_uuid
        WHERE NOT EXISTS (
            SELECT 1 FROM public.deployment_environments WHERE name = 'Production'
        );
    END IF;
END $$;