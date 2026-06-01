import { useState, useEffect, useCallback } from 'react';
import MatchStatusCard from '@/components/MatchStatusCard';
import MatchProfileCard from '@/components/MatchProfileCard';
import { fetchMatchStatus, fetchMatchSuggestions, requestMatch, type MatchProfile } from '@/services/api';

function Match() {
  const [status, setStatus] = useState<'unmatched' | 'pending' | 'matched'>('unmatched');
  const [matchedProfile, setMatchedProfile] = useState<MatchProfile | undefined>();
  const [suggestions, setSuggestions] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusData, suggestionsData] = await Promise.all([
        fetchMatchStatus(),
        fetchMatchSuggestions(),
      ]);
      setStatus(statusData.status);
      setMatchedProfile(statusData.match);
      setSuggestions(suggestionsData);
    } catch (err) {
      console.error('Failed to load match data:', err);
      setError('Something went wrong loading your matches.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRequest = async (targetUserId: string) => {
    try {
      const result = await requestMatch(targetUserId);
      setStatus(result.status);
      setMatchedProfile(result.match);
      setSuggestions([]);
    } catch (err) {
      console.error('Failed to request match:', err);
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
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Find a Match</h1>
        <div className="rounded-sm border border-destructive/20 bg-destructive/5 p-4">
          <p className="font-body text-sm text-destructive">{error}</p>
          <button
            onClick={loadData}
            className="mt-2 text-xs text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Find a Match</h1>
      <MatchStatusCard status={status} match={matchedProfile} onFindMatch={loadData} />
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
