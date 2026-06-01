import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { MatchProfile } from '@/services/api';

interface MatchProfileCardProps {
  profile: MatchProfile;
  onRequest: (userId: string) => void;
}

function MatchProfileCard({ profile, onRequest }: MatchProfileCardProps) {
  const initials = (profile.firstName[0] ?? '') + (profile.lastName[0] ?? '');
  return (
    <div className="rounded-sm border border-primary/10 bg-background p-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display text-sm font-medium text-foreground">{profile.firstName} {profile.lastName}</h3>
            <Badge variant="outline" className="text-[10px]">{profile.role}</Badge>
            {profile.matchScore && (
              <span className="text-xs text-primary font-mono ml-auto">{profile.matchScore}%</span>
            )}
          </div>
          <p className="font-body text-xs text-muted-foreground line-clamp-2 mb-2">{profile.vision}</p>
          <div className="flex flex-wrap gap-1">
            {profile.skills.map((s) => (
              <span key={s} className="px-2 py-0.5 bg-primary/5 text-xs text-muted-foreground rounded-sm">{s}</span>
            ))}
          </div>
        </div>
        <Button size="sm" variant="outline" className="shrink-0" onClick={() => onRequest(profile.id)}>
          Request Match
        </Button>
      </div>
    </div>
  );
}

export default MatchProfileCard;
