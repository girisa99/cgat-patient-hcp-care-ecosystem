/* Generate Playwright storage state using Supabase auth (no UI) */
// Usage (CI): node tests/create-storage-state.js

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE,
  E2E_ADMIN_EMAIL,
  E2E_ADMIN_PASSWORD,
} = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE || !E2E_ADMIN_EMAIL || !E2E_ADMIN_PASSWORD) {
  console.error('Missing required env vars for storage state.');
  process.exit(1);
}

// Lovable project ref (from context)
const PROJECT_REF = 'ithspbabhmdntioslfqe';

async function ensureAdminAndLogin() {
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Ensure user exists (or create)
  let userId = null;
  try {
    const { data: listRes } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = listRes?.users?.find(u => u.email?.toLowerCase() === E2E_ADMIN_EMAIL.toLowerCase());
    if (!existing) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: E2E_ADMIN_EMAIL,
        password: E2E_ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { firstName: 'E2E', lastName: 'Admin' },
      });
      if (createErr) throw createErr;
      userId = created.user?.id || null;
    } else {
      userId = existing.id;
    }
  } catch (e) {
    console.error('Admin ensure user error:', e);
  }

  if (!userId) {
    console.error('Failed to get or create admin user');
    process.exit(1);
  }

  // Assign superAdmin role via RPC (idempotent)
  try {
    const { error: roleErr } = await admin.rpc('assign_user_role', { p_user_id: userId, p_role_name: 'superAdmin' });
    if (roleErr) console.warn('assign_user_role warning:', roleErr.message);
  } catch (e) {
    console.warn('assign_user_role exception:', e?.message || e);
  }

  // Sign in with anon client
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: signInData, error: signInErr } = await client.auth.signInWithPassword({
    email: E2E_ADMIN_EMAIL,
    password: E2E_ADMIN_PASSWORD,
  });
  if (signInErr || !signInData?.session) {
    console.error('Sign-in failed:', signInErr?.message);
    process.exit(1);
  }

  const session = signInData.session;
  const expiresAtSec = Math.ceil(new Date(session.expires_at || Date.now() + 60 * 60 * 1000).getTime() / 1000);

  const storageState = {
    cookies: [],
    origins: [
      {
        origin: 'http://localhost:5173',
        localStorage: [
          {
            name: `sb-${PROJECT_REF}-auth-token`,
            value: JSON.stringify({ currentSession: session, expiresAt: expiresAtSec }),
          },
        ],
      },
    ],
  };

  const out = path.resolve(__dirname, 'storageState.json');
  fs.writeFileSync(out, JSON.stringify(storageState, null, 2));
  console.log('Storage state written to', out);
}

ensureAdminAndLogin().catch((e) => {
  console.error('Unexpected error creating storage state:', e);
  process.exit(1);
});
