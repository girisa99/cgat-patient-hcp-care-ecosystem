/**
 * WORKSPACE MANAGEMENT
 * Create and manage workspaces (teams) with invite member functionality
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Building2, Users, Settings, Crown, UserPlus, Mail, Loader2 } from 'lucide-react';
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

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user?: { display_name: string; email: string };
}

const TIER_LIMITS = {
  free: { maxWorkspaces: 1, maxSeats: 2 },
  starter: { maxWorkspaces: 1, maxSeats: 3 },
  creator: { maxWorkspaces: 1, maxSeats: 5 },
  pro: { maxWorkspaces: 3, maxSeats: 10 },
  business: { maxWorkspaces: 5, maxSeats: 25 },
  enterprise: { maxWorkspaces: -1, maxSeats: -1 },
};

export const WorkspaceManagement: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const queryClient = useQueryClient();

  // Get current user's genie studio profile
  const { data: currentUser, isLoading: isUserLoading } = useQuery({
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

  // Fetch members for active workspace
  const { data: members } = useQuery({
    queryKey: ['workspace-members', activeWorkspaceId],
    queryFn: async () => {
      if (!activeWorkspaceId) return [];
      const { data } = await supabase
        .from('genie_studio_team_members')
        .select('*')
        .eq('team_id', activeWorkspaceId);
      
      if (!data?.length) return [];

      // Fetch user details for each member
      const userIds = data.map((m: any) => m.user_id);
      const { data: users } = await supabase
        .from('genie_studio_users')
        .select('id, display_name, email')
        .in('id', userIds);

      const userMap = new Map((users || []).map((u: any) => [u.id, u]));
      return data.map((m: any) => ({
        ...m,
        user: userMap.get(m.user_id) || { display_name: 'Unknown', email: '' },
      })) as TeamMember[];
    },
    enabled: !!activeWorkspaceId,
  });

  // Create workspace mutation
  const createWorkspace = useMutation({
    mutationFn: async (name: string) => {
      if (!currentUser) throw new Error('Not authenticated');
      
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

  // Invite member mutation
  const inviteMember = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      if (!activeWorkspaceId || !currentUser) throw new Error('Missing context');

      // Find user by email in genie_studio_users
      const { data: invitee } = await supabase
        .from('genie_studio_users')
        .select('id, email, display_name')
        .eq('email', email)
        .maybeSingle();

      if (!invitee) {
        throw new Error(`No user found with email "${email}". They need to sign up first.`);
      }

      // Check if already a member
      const { data: existing } = await supabase
        .from('genie_studio_team_members')
        .select('id')
        .eq('team_id', activeWorkspaceId)
        .eq('user_id', invitee.id)
        .maybeSingle();

      if (existing) {
        throw new Error('This user is already a member of this workspace');
      }

      // Check seat limit
      const workspace = workspaces?.find((w: Workspace) => w.id === activeWorkspaceId);
      if (workspace && workspace.max_seats !== -1 && workspace.current_seat_count >= workspace.max_seats) {
        throw new Error(`Workspace has reached its seat limit (${workspace.max_seats}). Upgrade to add more members.`);
      }

      // Add member
      const { error: addError } = await supabase
        .from('genie_studio_team_members')
        .insert([{
          team_id: activeWorkspaceId,
          user_id: invitee.id,
          role: role as 'admin' | 'member' | 'owner' | 'viewer',
        }]);

      if (addError) throw addError;

      // Increment seat count
      if (workspace) {
        await supabase
          .from('genie_studio_teams')
          .update({ current_seat_count: workspace.current_seat_count + 1 })
          .eq('id', activeWorkspaceId);
      }

      return invitee;
    },
    onSuccess: (invitee: any) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members', activeWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ['genie-studio-teams'] });
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteRole('member');
      toast({ title: `${invitee.display_name || invitee.email} added to workspace` });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to invite member', description: error.message, variant: 'destructive' });
    },
  });

  const tier = currentUser?.current_subscription_tier || 'free';
  const tierConfig = TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free;
  const canCreateWorkspace = tierConfig.maxWorkspaces === -1 || (workspaces?.length || 0) < tierConfig.maxWorkspaces;

  const getTierBadgeColor = (t: string) => {
    switch (t) {
      case 'enterprise': return 'bg-purple-500/20 text-purple-500';
      case 'business': return 'bg-blue-500/20 text-blue-500';
      case 'pro': return 'bg-green-500/20 text-green-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-amber-500/20 text-amber-600';
      case 'admin': return 'bg-blue-500/20 text-blue-600';
      case 'editor': return 'bg-green-500/20 text-green-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const openManage = (workspaceId: string) => {
    setActiveWorkspaceId(workspaceId);
    setIsMembersOpen(true);
  };

  const openInvite = (workspaceId: string) => {
    setActiveWorkspaceId(workspaceId);
    setIsInviteOpen(true);
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
            Manage your team workspaces and invite members
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button disabled={isUserLoading || !canCreateWorkspace} className="gap-2">
              {isUserLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Workspace
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Workspace</DialogTitle>
              <DialogDescription>
                A workspace allows you to collaborate with team members on content generation
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
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
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

      {/* Tier Info — only show if truly restricted */}
      {!canCreateWorkspace && !isUserLoading && tier !== 'enterprise' && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-amber-500" />
                <span className="text-sm">
                  You've reached your workspace limit for the <strong>{tier}</strong> plan. Upgrade to create more.
                </span>
              </div>
              <Button variant="outline" size="sm">Upgrade Plan</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workspaces Grid */}
      {isLoading || isUserLoading ? (
        <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading workspaces...
        </div>
      ) : workspaces?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No workspaces yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first workspace to start collaborating with your team
            </p>
            {canCreateWorkspace && (
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Workspace
              </Button>
            )}
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
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>
                      {workspace.current_seat_count} / {workspace.max_seats === -1 ? '∞' : workspace.max_seats} seats
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="gap-1.5 flex-1"
                    onClick={() => openInvite(workspace.id)}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Invite Member
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => openManage(workspace.id)}
                  >
                    <Settings className="w-3 h-3" />
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Invite Member Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Invite Team Member
            </DialogTitle>
            <DialogDescription>
              Add a member to your workspace. They must have an existing account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member — Can generate & view content</SelectItem>
                  <SelectItem value="editor">Editor — Can edit & publish content</SelectItem>
                  <SelectItem value="admin">Admin — Full workspace management</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
            <Button
              onClick={() => inviteMember.mutate({ email: inviteEmail, role: inviteRole })}
              disabled={!inviteEmail.trim() || inviteMember.isPending}
              className="gap-2"
            >
              {inviteMember.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {inviteMember.isPending ? 'Inviting...' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Members Dialog */}
      <Dialog open={isMembersOpen} onOpenChange={setIsMembersOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Workspace Members
            </DialogTitle>
            <DialogDescription>
              {workspaces?.find((w: Workspace) => w.id === activeWorkspaceId)?.name} — Manage team access
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2 max-h-[400px] overflow-y-auto">
            {members?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No members found</p>
            ) : (
              members?.map((member: TeamMember) => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {(member.user?.display_name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.user?.display_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{member.user?.email || ''}</p>
                    </div>
                  </div>
                  <Badge className={getRoleBadgeColor(member.role)}>{member.role}</Badge>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMembersOpen(false)}>Close</Button>
            <Button onClick={() => { setIsMembersOpen(false); openInvite(activeWorkspaceId!); }} className="gap-2">
              <UserPlus className="w-4 h-4" />
              Invite Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkspaceManagement;
