/**
 * EP04 Part 2 Launcher
 *
 * Thin launcher page that:
 * 1. Finds or creates the EP04 Part 2 project via useEP04ProjectLookup
 * 2. Seeds it from template if not already seeded
 * 3. Redirects to the generic CastProductionPage
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const STYLE_INTENT = 'ep04-part2-the-production';

export default function EP04Part2Launcher() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get('projectId');

  const [status, setStatus] = useState<'loading' | 'seeding' | 'done' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const initiated = useRef(false);

  useEffect(() => {
    if (initiated.current) return;
    initiated.current = true;

    (async () => {
      try {
        // Dynamic imports to keep this chunk minimal
        const { supabase } = await import('@/integrations/supabase/client');
        const { lookupOrCreateProject } = await import('@/services/castProjectQueries');
        const { isProjectSeeded, seedProjectFromTemplate } = await import('@/utils/seedProjectFromTemplate');
        const { getEP04Part2Template } = await import('@/templates/ep04-part2-documentary.template');

        // Get auth user
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) {
          setErrorMsg('Not authenticated — please sign in and refresh');
          setStatus('error');
          return;
        }

        // Look up or create project
        const result = await lookupOrCreateProject(userId, STYLE_INTENT);
        if (result.error || !result.projectId) {
          setErrorMsg(result.error || 'Failed to create project');
          setStatus('error');
          return;
        }

        const projectId = result.projectId;

        // Seed if needed
        const seeded = await isProjectSeeded(projectId);
        if (!seeded) {
          setStatus('seeding');
          const seedResult = await seedProjectFromTemplate(projectId, getEP04Part2Template());
          if (!seedResult.success) {
            setErrorMsg(seedResult.error || 'Seeding failed');
            setStatus('error');
            return;
          }
        }

        setStatus('done');
        navigate(`/cast/production/${projectId}`, { replace: true });
      } catch (err: any) {
        console.error('[EP04Part2Launcher] Error:', err);
        setErrorMsg(err?.message || 'Unknown error');
        setStatus('error');
      }
    })();
  }, [navigate]);

  if (status === 'error') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <p style={{ color: '#f87171', fontSize: '14px' }}>Failed to load EP04 Part 2: {errorMsg}</p>
        <button
          style={{ padding: '8px 16px', background: '#6366f1', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px' }}
          onClick={() => { initiated.current = false; setStatus('loading'); setErrorMsg(null); }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
      <Loader2 className="w-8 h-8 animate-spin text-primary" style={{ width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#888', fontSize: '14px' }}>
        {status === 'seeding' ? 'Seeding EP04 Part 2...' : 'Preparing EP04 Part 2...'}
      </p>
    </div>
  );
}
