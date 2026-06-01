import { Users, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MatchProfile } from '@/services/api';

interface MatchStatusCardProps {
  status: 'unmatched' | 'pending' | 'matched';
  match?: MatchProfile;
  onFindMatch: () => void;
}

function MatchStatusCard({ status, match, onFindMatch }: MatchStatusCardProps) {
  if (status === 'unmatched') {
    return (
      <div className="rounded-sm border border-primary/10 bg-background p-5">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-2 rounded-sm"><Users className="h-5 w-5 text-primary" /></div>
          <div className="flex-1">
            <h3 className="font-display text-sm font-medium text-foreground mb-1">Find a Match</h3>
            <p className="font-body text-xs text-muted-foreground mb-3">Not yet matched. Find a co-founder who complements your skills.</p>
            <Button size="sm" onClick={onFindMatch}>Find Potential Matches</Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="rounded-sm border border-primary/10 bg-background p-5">
        <div className="flex items-start gap-4">
          <div className="bg-yellow-500/10 p-2 rounded-sm"><Clock className="h-5 w-5 text-yellow-500" /></div>
          <div>
            <h3 className="font-display text-sm font-medium text-foreground mb-1">Match Pending</h3>
            <p className="font-body text-xs text-muted-foreground">Your match request has been sent. Waiting for response.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-primary/10 bg-background p-5">
      <div className="flex items-start gap-4">
        <div className="bg-green-500/10 p-2 rounded-sm"><CheckCircle className="h-5 w-5 text-green-500" /></div>
        <div>
          <h3 className="font-display text-sm font-medium text-foreground mb-1">Matched with {match?.firstName} {match?.lastName}</h3>
          <p className="font-body text-xs text-muted-foreground">You're connected as {match?.role === 'doer' ? 'Doer' : 'Thinker'}.</p>
        </div>
      </div>
    </div>
  );
}

export default MatchStatusCard;
