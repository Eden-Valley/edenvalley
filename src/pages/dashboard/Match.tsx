import { useState, useEffect } from 'react';
import MatchStatusCard from '@/components/MatchStatusCard';
import MatchProfileCard from '@/components/MatchProfileCard';
import { fetchMatchStatus, fetchMatchSuggestions, requestMatch, type MatchProfile } from '@/services/api';

function Match() {
  const [status, setStatus] = useState<'unmatched' | 'pending' | 'matched'>('unmatched');
  const [matchedProfile, setMatchedProfile] = useState<MatchProfile | undefined>();
  const [suggestions, setSuggestions] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchMatchStatus(), fetchMatchSuggestions()])
      .then(([statusData, suggestionsData]) => {
        setStatus(statusData.status);
        setMatchedProfile(statusData.match);
        setSuggestions(suggestionsData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRequest = async (targetUserId: string) => {
    try {
      const result = await requestMatch(targetUserId);
      setStatus(result.status);
      setMatchedProfile(result.match);
      setSuggestions([]);
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Find a Match</h1>
      <MatchStatusCard status={status} match={matchedProfile} onFindMatch={() => {}} />
      {status === 'unmatched' && suggestions.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-sm font-medium text-foreground">Suggested Matches</h2>
          {suggestions.map((p) => (
            <MatchProfileCard key={p.id} profile={p} onRequest={handleRequest} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Match;
