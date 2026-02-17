-- Enable realtime updates for agent_sessions table
ALTER TABLE public.agent_sessions REPLICA IDENTITY FULL;

-- Add agent_sessions to realtime publication for live updates in /agents
SELECT pg_notify('realtime:agent_sessions', 'enabled');