/**
 * Mobile Recording Page - Redirect to Genie Vibe
 * This page now redirects to /genie-vibe which has integrated mobile/desktop views
 * 
 * CONSOLIDATED NAVIGATION:
 * - /genie-studio → Main hub
 * - /genie-vibe → Unified recording studio (auto-detects mobile/desktop)
 * - /genie-vibe/mobile → Redirects to /genie-vibe (legacy support)
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const MobileRecordingPage: React.FC = () => {
  const navigate = useNavigate();

  // Redirect to unified Genie Vibe which handles mobile/desktop internally
  useEffect(() => {
    navigate('/genie-vibe', { replace: true });
  }, [navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">Loading Genie Vibe...</p>
      </div>
    </div>
  );
};

export default MobileRecordingPage;
