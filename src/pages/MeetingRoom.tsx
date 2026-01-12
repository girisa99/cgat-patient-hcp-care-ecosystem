/**
 * MeetingRoom - Routes meeting URLs to Genie Vibe Recording Studio
 * 
 * When users click meeting URLs (e.g., genieaiexperimentationhub.tech/meeting/abc-123)
 * they are redirected to Genie Vibe with the session context loaded
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Video, Calendar, Clock, Users, ExternalLink, FileText, Download, Play } from 'lucide-react';
import { format, differenceInMinutes, isBefore, isAfter, addMinutes } from 'date-fns';
import { toast } from 'sonner';
import genieVibeLogo from '@/assets/logos/genie-vibe-combined.png';

interface MeetingDetails {
  id: string;
  title: string;
  description?: string;
  scheduled_date: string;
  meeting_url: string;
  show_type: string;
  host_name?: string;
  script_content?: string;
  topics?: string;
  duration_minutes?: number;
}

export default function MeetingRoom() {
  const { meetingCode } = useParams<{ meetingCode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<MeetingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeStatus, setTimeStatus] = useState<'early' | 'active' | 'ended'>('early');
  const [minutesUntilStart, setMinutesUntilStart] = useState<number>(0);

  useEffect(() => {
    const fetchMeetingDetails = async () => {
      if (!meetingCode) {
        setError('Invalid meeting code');
        setLoading(false);
        return;
      }

      try {
        // Look up meeting by URL containing this code (meeting_link column)
        const { data: shows, error: fetchError } = await supabase
          .from('shows')
          .select('*')
          .ilike('meeting_link', `%${meetingCode}%`)
          .limit(1);

        if (fetchError) throw fetchError;

        if (!shows || shows.length === 0) {
          // Meeting not found - could be a direct Vibe session
          // Redirect to Vibe with the meeting code as session ID
          toast.info('Joining Genie Vibe studio...');
          navigate(`/genie-vibe?session=${meetingCode}`);
          return;
        }

        const show = shows[0];
        
        // Extract topics and script from metadata if available
        const metadata = show.metadata as Record<string, any> || {};
        
        setMeeting({
          id: show.id,
          title: show.title,
          description: show.description,
          scheduled_date: show.scheduled_date,
          meeting_url: show.meeting_link || '',
          show_type: show.show_type,
          host_name: show.host_name,
          script_content: metadata?.script_content || metadata?.script || '',
          topics: metadata?.topics || show.agenda || '',
          duration_minutes: show.duration_minutes || 60,
        });

        // Check time status
        const scheduledTime = new Date(show.scheduled_date);
        const now = new Date();
        const activationTime = addMinutes(scheduledTime, -30); // 30 min before
        const endTime = addMinutes(scheduledTime, show.duration_minutes || 60);

        if (isBefore(now, activationTime)) {
          setTimeStatus('early');
          setMinutesUntilStart(differenceInMinutes(activationTime, now));
        } else if (isAfter(now, endTime)) {
          setTimeStatus('ended');
        } else {
          setTimeStatus('active');
        }

      } catch (err) {
        console.error('Error fetching meeting:', err);
        setError('Unable to load meeting details');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingDetails();
  }, [meetingCode, navigate]);

  // Update countdown timer
  useEffect(() => {
    if (timeStatus !== 'early' || !meeting) return;

    const interval = setInterval(() => {
      const scheduledTime = new Date(meeting.scheduled_date);
      const activationTime = addMinutes(scheduledTime, -30);
      const now = new Date();
      
      if (isBefore(now, activationTime)) {
        setMinutesUntilStart(differenceInMinutes(activationTime, now));
      } else {
        setTimeStatus('active');
        clearInterval(interval);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [timeStatus, meeting]);

  const handleJoinVibe = () => {
    // Navigate to Genie Vibe with meeting context
    const vibeUrl = `/genie-vibe?session=${meetingCode}&showId=${meeting?.id || ''}&title=${encodeURIComponent(meeting?.title || 'Recording Session')}`;
    navigate(vibeUrl);
  };

  const handleDownloadScript = () => {
    if (!meeting?.script_content) return;
    
    const blob = new Blob([meeting.script_content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${meeting.title.replace(/[^a-z0-9]/gi, '_')}_script.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Script downloaded!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800/50 border-purple-500/30">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-purple-400 mb-4" />
            <p className="text-white/70">Loading meeting room...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/50 border-red-500/30">
          <CardHeader className="text-center">
            <img src={genieVibeLogo} alt="Genie Vibe" className="h-12 mx-auto mb-4" />
            <CardTitle className="text-red-400">Meeting Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-white/70">{error}</p>
            <Button onClick={() => navigate('/genie-vibe')} className="bg-purple-600 hover:bg-purple-700">
              Go to Genie Vibe Studio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const showTypeEmoji: Record<string, string> = {
    podcast: '🎙️',
    webcast: '📺',
    broadcast: '📡',
    interview: '🎤',
    panel: '👥',
    tutorial: '📚',
    webinar: '🖥️',
    workshop: '🔧',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-slate-800/80 backdrop-blur-xl border-purple-500/30 shadow-2xl">
        <CardHeader className="text-center border-b border-purple-500/20 pb-6">
          <img src={genieVibeLogo} alt="Genie Vibe" className="h-14 mx-auto mb-4" />
          
          <Badge 
            variant="outline" 
            className={`mb-3 ${
              timeStatus === 'active' 
                ? 'border-green-500 text-green-400 bg-green-500/10' 
                : timeStatus === 'ended'
                  ? 'border-gray-500 text-gray-400'
                  : 'border-amber-500 text-amber-400 bg-amber-500/10'
            }`}
          >
            {timeStatus === 'active' && '🟢 Session Active'}
            {timeStatus === 'early' && `⏰ Starts in ${minutesUntilStart} min`}
            {timeStatus === 'ended' && '⚪ Session Ended'}
          </Badge>
          
          <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <span>{showTypeEmoji[meeting?.show_type || 'podcast'] || '🎬'}</span>
            {meeting?.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          {/* Meeting Details */}
          <div className="grid gap-3">
            <div className="flex items-center gap-3 text-white/80">
              <Calendar className="h-5 w-5 text-purple-400" />
              <span>{meeting?.scheduled_date ? format(new Date(meeting.scheduled_date), 'EEEE, MMMM d, yyyy') : 'TBD'}</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <Clock className="h-5 w-5 text-purple-400" />
              <span>
                {meeting?.scheduled_date ? format(new Date(meeting.scheduled_date), 'h:mm a') : 'TBD'}
                {meeting?.duration_minutes && ` (${meeting.duration_minutes} min)`}
              </span>
            </div>
            {meeting?.host_name && (
              <div className="flex items-center gap-3 text-white/80">
                <Users className="h-5 w-5 text-purple-400" />
                <span>Host: {meeting.host_name}</span>
              </div>
            )}
          </div>
          
          {/* Description */}
          {meeting?.description && (
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-white/70 text-sm">{meeting.description}</p>
            </div>
          )}
          
          {/* Topics */}
          {meeting?.topics && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <p className="text-purple-300 text-sm font-medium mb-2">📋 Topics</p>
              <p className="text-white/80 text-sm">{meeting.topics}</p>
            </div>
          )}
          
          {/* Script Download */}
          {meeting?.script_content && (
            <Button 
              variant="outline" 
              className="w-full border-green-500/50 text-green-400 hover:bg-green-500/10"
              onClick={handleDownloadScript}
            >
              <FileText className="h-4 w-4 mr-2" />
              Download Script
              <Download className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {/* Join Button */}
          <div className="pt-4">
            {timeStatus === 'active' ? (
              <Button 
                size="lg" 
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={handleJoinVibe}
              >
                <Play className="h-5 w-5 mr-2" />
                Join Genie Vibe Studio
              </Button>
            ) : timeStatus === 'early' ? (
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600"
                  onClick={handleJoinVibe}
                >
                  <Video className="h-5 w-5 mr-2" />
                  Enter Waiting Room
                </Button>
                <p className="text-center text-white/50 text-sm">
                  Session will activate in {minutesUntilStart} minutes
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full h-14 text-lg border-gray-500/50"
                  onClick={handleJoinVibe}
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  View Recording (if available)
                </Button>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="text-center pt-4 border-t border-purple-500/20">
            <p className="text-white/40 text-xs">
              Powered by Genie Studio • genieaiexperimentationhub.tech
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
