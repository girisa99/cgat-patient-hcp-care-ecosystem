/**
 * CastProjectsList — Lists all cast_projects from the database
 * Shows project title, status, stage, and creation date.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderOpen, Clock, Film, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const untypedSupabase = supabase as any;

interface CastProjectRow {
  id: string;
  title: string;
  status: string;
  production_stage: string | null;
  created_at: string;
  updated_at: string;
  estimated_cost_usd: number;
  actual_tokens_used: number;
}

const STAGE_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  scripting: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  producing: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  reviewing: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  published: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
};

export const CastProjectsList: React.FC = () => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['cast-projects-list'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await untypedSupabase
        .from('cast_projects')
        .select('id, title, status, production_stage, created_at, updated_at, estimated_cost_usd, actual_tokens_used')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data || []) as CastProjectRow[];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!projects?.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FolderOpen className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No projects yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Start creating content in the Create tab to see projects here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="group hover:shadow-md transition-all cursor-pointer border-border/30 hover:border-primary/20"
        >
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Film className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground truncate">{project.title}</h3>
              </div>
              <Badge
                variant="secondary"
                className={cn('text-[10px] shrink-0', STAGE_COLORS[project.status] || STAGE_COLORS.draft)}
              >
                {project.status}
              </Badge>
            </div>

            {project.production_stage && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Zap className="w-3 h-3" />
                <span>Stage: {project.production_stage.replace(/_/g, ' ')}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground/70">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}</span>
              </div>
              {project.actual_tokens_used > 0 && (
                <span>{project.actual_tokens_used.toLocaleString()} tokens</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CastProjectsList;
