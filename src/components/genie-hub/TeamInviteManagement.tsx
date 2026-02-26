/**
 * TEAM INVITE MANAGEMENT
 * Send and manage team invitations with role-based access
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Mail, Clock, CheckCircle, XCircle, Trash2, RefreshCw, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user?: {
    email: string;
    display_name: string;
  } | null;
}

interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  status?: string;
  expires_at: string;
  created_at: string;
}

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin', description: 'Full access to team settings' },
  { value: 'editor', label: 'Editor', description: 'Can create and edit content' },
  { value: 'viewer', label: 'Viewer', description: 'View-only access' },
  { value: 'member', label: 'Member', description: 'Standard team access' },
];

export const TeamInviteManagement: React.FC = () => {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get current user
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

  // Fetch teams
  const { data: teams } = useQuery({
    queryKey: ['genie-studio-teams-for-invites'],
    queryFn: async () => {
      if (!currentUser) return [];
      
      const { data: memberships } = await supabase
        .from('genie_studio_team_members')
        .select('team_id, role')
        .eq('user_id', currentUser.id)
        .in('role', ['owner', 'admin']);
      
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

  // Fetch team members for selected team
  const { data: teamMembers, isLoading: loadingMembers } = useQuery({
    queryKey: ['team-members', selectedTeamId],
    queryFn: async () => {
      if (!selectedTeamId) return [];
      
      // Get team members
      const { data: members } = await supabase
        .from('genie_studio_team_members')
        .select('*')
        .eq('team_id', selectedTeamId);
      
      if (!members?.length) return [];
      
      // Get user details for each member
      const userIds = members.map(m => m.user_id);
      const { data: users } = await supabase
        .from('genie_studio_users')
        .select('id, email, display_name')
        .in('id', userIds);
      
      // Combine data
      return members.map(member => ({
        ...member,
        user: users?.find(u => u.id === member.user_id) || null,
      }));
    },
    enabled: !!selectedTeamId,
  });

  // Fetch pending invitations
  const { data: invitations, isLoading: loadingInvites } = useQuery({
    queryKey: ['team-invitations', selectedTeamId],
    queryFn: async () => {
      if (!selectedTeamId) return [];
      
      const { data } = await supabase
        .from('genie_studio_team_invitations')
        .select('*')
        .eq('team_id', selectedTeamId)
        .order('created_at', { ascending: false });
      
      return data || [];
    },
    enabled: !!selectedTeamId,
  });

  // Send invitation mutation
  const sendInvite = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      if (!selectedTeamId || !currentUser) throw new Error('No team selected');
      
      const { data, error } = await supabase
        .from('genie_studio_team_invitations')
        .insert([{
          team_id: selectedTeamId,
          email,
          role: role as 'admin' | 'member' | 'owner' | 'viewer',
          invited_by: currentUser.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations', selectedTeamId] });
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteRole('member');
      toast({ title: 'Invitation sent successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to send invitation', description: error.message, variant: 'destructive' });
    },
  });

  // Revoke invitation
  const revokeInvite = useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase
        .from('genie_studio_team_invitations')
        .delete()
        .eq('id', inviteId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations', selectedTeamId] });
      toast({ title: 'Invitation revoked' });
    },
  });

  // Remove member
  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('genie_studio_team_members')
        .delete()
        .eq('id', memberId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', selectedTeamId] });
      toast({ title: 'Member removed' });
    },
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-500/20 text-purple-500';
      case 'admin': return 'bg-blue-500/20 text-blue-500';
      case 'editor': return 'bg-green-500/20 text-green-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusBadge = (invite: TeamInvitation) => {
    const isExpired = new Date(invite.expires_at) < new Date();
    if (isExpired) return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Expired</Badge>;
    if (invite.status === 'accepted') return <Badge className="bg-green-500/20 text-green-500 gap-1"><CheckCircle className="w-3 h-3" />Accepted</Badge>;
    return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
  };

  // Auto-select first team if available
  React.useEffect(() => {
    if (teams?.length && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Team Members & Invitations
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage team members and send invitations
          </p>
        </div>
        
        <div className="flex gap-2">
          {teams && teams.length > 0 && (
            <Select value={selectedTeamId || ''} onValueChange={setSelectedTeamId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select workspace" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team: any) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedTeamId} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your workspace
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div>
                            <span className="font-medium">{role.label}</span>
                            <span className="text-muted-foreground ml-2 text-xs">{role.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => sendInvite.mutate({ email: inviteEmail, role: inviteRole })}
                  disabled={!inviteEmail.trim() || sendInvite.isPending}
                >
                  {sendInvite.isPending ? 'Sending...' : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!selectedTeamId ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No workspace selected</h3>
            <p className="text-sm text-muted-foreground">
              Create a workspace first to manage team members
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Current Members */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Members</CardTitle>
              <CardDescription>
                {teamMembers?.length || 0} members in this workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMembers ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers?.map((member: TeamMember) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.user?.display_name || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground">{member.user?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(member.role)}>
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.role !== 'owner' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeMember.mutate(member.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Pending Invitations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Invitations</CardTitle>
              <CardDescription>
                {invitations?.filter((i: TeamInvitation) => !i.status || i.status === 'pending').length || 0} pending invites
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingInvites ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : invitations?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pending invitations</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations?.map((invite: TeamInvitation) => (
                      <TableRow key={invite.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{invite.email}</div>
                            <div className="text-xs text-muted-foreground">{invite.role}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(invite)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => revokeInvite.mutate(invite.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TeamInviteManagement;
