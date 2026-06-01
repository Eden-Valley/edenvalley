import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import TeamMemberCard from '@/components/TeamMemberCard';
import InviteMemberForm from '@/components/InviteMemberForm';
import { fetchTeam, inviteTeamMember, removeTeamMember, updateTeamMemberRole, type TeamMember, type InviteRequest } from '@/services/api';

function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTeam();
      setMembers(data);
    } catch (err) {
      console.error('Failed to load team:', err);
      setError('Something went wrong loading your team.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTeam(); }, [loadTeam]);

  const handleInvite = async (data: InviteRequest) => {
    setError(null);
    try {
      const newMember = await inviteTeamMember(data);
      setMembers((prev) => [...prev, newMember]);
      setShowInviteForm(false);
    } catch (err) {
      console.error('Failed to invite member:', err);
      setError('Failed to send invitation. Please try again.');
    }
  };

  const handleRemove = async (memberId: string) => {
    setError(null);
    try {
      await removeTeamMember(memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      console.error('Failed to remove member:', err);
      setError('Failed to remove member. Please try again.');
    }
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    setError(null);
    try {
      const updated = await updateTeamMemberRole(memberId, role);
      setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
    } catch (err) {
      console.error('Failed to update role:', err);
      setError('Failed to update role. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-label="Loading" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">My Team</h1>
        <div className="rounded-sm border border-destructive/20 bg-destructive/5 p-4">
          <p className="font-body text-sm text-destructive">{error}</p>
          <button onClick={loadTeam} className="mt-2 text-xs text-primary hover:underline">Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">My Team</h1>
        <Button size="sm" onClick={() => setShowInviteForm(true)}>
          <UserPlus className="h-4 w-4 mr-1" /> Invite Member
        </Button>
      </div>

      {showInviteForm && (
        <div className="rounded-sm border border-primary/10 bg-background p-4">
          <h2 className="font-display text-sm font-medium text-foreground mb-3">Invite a Team Member</h2>
          <InviteMemberForm onSubmit={handleInvite} onCancel={() => setShowInviteForm(false)} />
        </div>
      )}

      {members.length === 0 ? (
        <div className="rounded-sm border border-primary/10 bg-background p-5 text-center">
          <p className="font-body text-xs text-muted-foreground">No team members yet. Invite your co-founder and build your team.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <TeamMemberCard key={m.id} member={m} onRemove={handleRemove} onRoleChange={handleRoleChange} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Team;
