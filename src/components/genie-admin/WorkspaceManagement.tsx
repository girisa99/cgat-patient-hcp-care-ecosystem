/**
 * WORKSPACE MANAGEMENT
 * Create and manage workspaces (teams) with subscription-tiered features
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Building2, Users, Settings, Crown, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Workspace {
  id: string;
  name: string;
  owner_user_id: string;
  subscription_tier: string;
  max_seats: number;
  current_seat_count: number;
  is_active: boolean;
  created_at: string;
}

const TIER_LIMITS = {
  free: { maxWorkspaces: 0, maxSeats: 1 },
  starter: { maxWorkspaces: 0, maxSeats: 1 },
  creator: { maxWorkspaces: 0, maxSeats: 1 },
  pro: { maxWorkspaces: 1, maxSeats: 5 },
  business: { maxWorkspaces: 3, maxSeats: 15 },
  enterprise: { maxWorkspaces: -1, maxSeats: -1 }, // Unlimited
};

export const WorkspaceManagement: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const queryClient = useQueryClient();

  // Get current user's genie studio profile
  const { data: currentUser } = useQuery({
    queryKey: ['genie-studio-user'],
    queryFn: async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return null;
      
      const { data } = await supabase
        .from('genie_studio_users')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .maybeSingle();
      return data;
    },
  });

  // Fetch workspaces the user belongs to
  const { data: workspaces, isLoading } = useQuery({
    queryKey: ['genie-studio-teams'],
    queryFn: async () => {
      if (!currentUser) return [];
      
      // Get teams where user is a member
      const { data: memberships } = await supabase
        .from('genie_studio_team_members')
        .select('team_id')
        .eq('user_id', currentUser.id);
      
      if (!memberships?.length) return [];
      
      const teamIds = memberships.map(m => m.team_id);
      const { data: teams } = await supabase
        .from('genie_studio_teams')
        .select('*')
        .in('id', teamIds);
      
      return teams || [];
    },
    enabled: !!currentUser,
  });

  // Create workspace mutation
  const createWorkspace = useMutation({
    mutationFn: async (name: string) => {
      if (!currentUser) throw new Error('Not authenticated');
      
      // Create the team
      const { data: team, error: teamError } = await supabase
        .from('genie_studio_teams')
        .insert({
          name,
          owner_user_id: currentUser.id,
          subscription_tier: currentUser.current_subscription_tier || 'pro',
          max_seats: TIER_LIMITS[currentUser.current_subscription_tier as keyof typeof TIER_LIMITS]?.maxSeats || 5,
          current_seat_count: 1,
        })
        .select()
        .single();
      
      if (teamError) throw teamError;
      
      // Add owner as member
      const { error: memberError } = await supabase
        .from('genie_studio_team_members')
        .insert({
          team_id: team.id,
          user_id: currentUser.id,
          role: 'owner',
        });
      
      if (memberError) throw memberError;
      
      return team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genie-studio-teams'] });
      setIsCreateOpen(false);
      setNewWorkspaceName('');
      toast({ title: 'Workspace created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to create workspace', description: error.message, variant: 'destructive' });
    },
  });

  const tier = currentUser?.current_subscription_tier || 'free';
  const tierConfig = TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free;
  const canCreateWorkspace = tierConfig.maxWorkspaces === -1 || (workspaces?.length || 0) < tierConfig.maxWorkspaces;

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-500/20 text-purple-500';
      case 'business': return 'bg-blue-500/20 text-blue-500';
      case 'pro': return 'bg-green-500/20 text-green-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Workspaces
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your team workspaces and collaboration settings
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canCreateWorkspace} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Workspace
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Workspace</DialogTitle>
              <DialogDescription>
                A workspace allows you to collaborate with team members
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  placeholder="e.g., Marketing Team"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => createWorkspace.mutate(newWorkspaceName)}
                disabled={!newWorkspaceName.trim() || createWorkspace.isPending}
              >
                {createWorkspace.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tier Info */}
      {!canCreateWorkspace && tier !== 'enterprise' && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-amber-500" />
                <span className="text-sm">
                  Upgrade to <strong>Pro</strong> or higher to create workspaces
                </span>
              </div>
              <Button variant="outline" size="sm">
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workspaces Grid */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading workspaces...</div>
      ) : workspaces?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No workspaces yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {canCreateWorkspace 
                ? 'Create your first workspace to start collaborating with your team'
                : 'Upgrade your plan to create workspaces'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces?.map((workspace: Workspace) => (
            <Card key={workspace.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{workspace.name}</CardTitle>
                  <Badge className={getTierBadgeColor(workspace.subscription_tier)}>
                    {workspace.subscription_tier}
                  </Badge>
                </div>
                <CardDescription>
                  Created {new Date(workspace.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>
                      {workspace.current_seat_count} / {workspace.max_seats === -1 ? '∞' : workspace.max_seats} seats
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Settings className="w-3 h-3" />
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspaceManagement;
