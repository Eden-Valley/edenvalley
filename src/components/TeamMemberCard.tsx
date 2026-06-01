import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { TeamMember } from '@/services/api';

interface TeamMemberCardProps {
  member: TeamMember;
  onRemove: (memberId: string) => void;
  onRoleChange: (memberId: string, role: string) => void;
}

const ROLES = ['CEO', 'CTO', 'COO', 'CFO', 'CMO', 'Advisor', 'Team Member'];

function TeamMemberCard({ member, onRemove, onRoleChange }: TeamMemberCardProps) {
  const initials = (member.firstName[0] ?? '') + (member.lastName[0] ?? '');
  return (
    <div className="rounded-sm border border-primary/10 bg-background p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-sm font-medium text-foreground">{member.firstName} {member.lastName}</h3>
          <p className="font-body text-xs text-muted-foreground">{member.role}</p>
        </div>
        <select
          className="bg-background border border-primary/10 rounded-sm text-xs px-2 py-1 text-foreground"
          value={member.role}
          aria-label="Role"
          onChange={(e) => onRoleChange(member.id, e.target.value)}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => onRemove(member.id)}>
          Remove
        </Button>
      </div>
    </div>
  );
}

export default TeamMemberCard;
