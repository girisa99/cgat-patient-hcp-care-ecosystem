/**
 * Genie Suite - AI-Powered Creative Suite
 * "Mind to Media" - Complete production suite for content creation
 * 
 * 4-Quadrant Architecture:
 * - CREATE: Spark, Mind, Deck (Ideation & Scripts)
 * - PRODUCE: Vibe (Audio/Video Production)
 * - MANAGE: Hub (Scheduling & Assets)
 * - PUBLISH: Cast (Distribution & Analytics)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuadrantLayout, QuadrantDashboard } from '@/components/navigation';
import { MobileRecordingView } from '@/components/document-processing/RecordingStudio/components/MobileRecordingView';
import { useGenieStudioAuth } from '@/hooks/useGenieStudioAuth';

export default function GenieStudio() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [forceDesktopView, setForceDesktopView] = useState(false);
  const { isInternalUser } = useGenieStudioAuth();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile-first: Show mobile recording view on small screens
  if (isMobile && !forceDesktopView) {
    return (
      <MobileRecordingView
        onSwitchToDesktop={() => setForceDesktopView(true)}
        onRecordingComplete={(result) => {
          console.log('Mobile recording complete:', result);
        }}
      />
    );
  }

  // Desktop: Clean quadrant-based dashboard
  return (
    <QuadrantLayout showNav={true}>
      <div className="py-8">
        <QuadrantDashboard />
      </div>
    </QuadrantLayout>
  );
}
