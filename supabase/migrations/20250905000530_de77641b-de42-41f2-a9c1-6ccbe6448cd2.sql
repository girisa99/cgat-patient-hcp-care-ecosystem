-- Seed default deployment environments
INSERT INTO public.deployment_environments (
  name,
  environment_type,
  cloud_provider,
  region,
  infrastructure_config,
  deployment_config,
  environment_variables,
  status,
  created_by
) VALUES 
(
  'Development',
  'development',
  'aws',
  'us-east-1',
  '{"instance_type": "t3.micro", "auto_scaling": false}',
  '{"replicas": 1, "cpu_limit": "0.5", "memory_limit": "512Mi"}',
  '{"NODE_ENV": "development", "LOG_LEVEL": "debug"}',
  'active',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Staging',
  'staging', 
  'aws',
  'us-east-1',
  '{"instance_type": "t3.small", "auto_scaling": true, "min_instances": 1, "max_instances": 3}',
  '{"replicas": 2, "cpu_limit": "1", "memory_limit": "1Gi"}',
  '{"NODE_ENV": "staging", "LOG_LEVEL": "info"}',
  'active',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Production',
  'production',
  'aws', 
  'us-east-1',
  '{"instance_type": "t3.medium", "auto_scaling": true, "min_instances": 2, "max_instances": 10}',
  '{"replicas": 3, "cpu_limit": "2", "memory_limit": "2Gi", "health_checks": true}',
  '{"NODE_ENV": "production", "LOG_LEVEL": "warn"}',
  'active',
  (SELECT id FROM auth.users LIMIT 1)
)
ON CONFLICT (name) DO UPDATE SET
  updated_at = now(),
  status = 'active';