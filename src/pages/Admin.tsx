import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import CustomCursor from '@/components/CustomCursor';
import { X, Check, Clock, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Eye } from 'lucide-react';

interface Profile {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  type: string;
  vision: string | null;
  proof_of_work: string | null;
  proof_of_identity: string | null;
  investor_type: string | null;
  preferred_stage: string | null;
  sectors: string | null;
  ticket_size: string | null;
  status: string;
  payment_status: string;
  priority_deadline_at: string | null;
  referral_code: string;
  created_at: string;
}

const API_URL = typeof window !== 'undefined' ? `${window.location.origin}/api` : '';

const Admin = () => {
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'priority' | 'pending' | 'under_review'>('all');
  const [expandedProfile, setExpandedProfile] = useState<number | null>(null);

  const fetchProfiles = useCallback(async (authToken: string) => {
    setLoading(true);
    setError(null);
    const storedEmail = sessionStorage.getItem('eden-admin-email') || '';
    try {
      const res = await fetch(`${API_URL}/admin/profiles`, {
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'X-Admin-Email': storedEmail
        }
      });
      if (!res.ok) {
        if (res.status === 401) {
          setIsAuthenticated(false);
          setError('Session expired. Please login again.');
        } else {
          throw new Error('Failed to fetch profiles');
        }
        return;
      }
      const data = await res.json();
      setProfiles(data.profiles || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profiles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('eden-admin-token');
    const storedEmail = sessionStorage.getItem('eden-admin-email');
    if (storedToken && storedEmail) {
      setToken(storedToken);
      setAdminEmail(storedEmail);
      setIsAuthenticated(true);
      fetchProfiles(storedToken);
    }
  }, [fetchProfiles]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || !adminEmail.trim()) return;
    
    setToken(password);
    setIsAuthenticated(true);
    sessionStorage.setItem('eden-admin-token', password);
    sessionStorage.setItem('eden-admin-email', adminEmail);
    await fetchProfiles(password);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken('');
    setPassword('');
    setAdminEmail('');
    setProfiles([]);
    sessionStorage.removeItem('eden-admin-token');
    sessionStorage.removeItem('eden-admin-email');
  };

  const handleAction = async (userId: number, action: 'accept' | 'reject' | 'start_review') => {
    setActionLoading(userId);
    setError(null);
    const storedEmail = sessionStorage.getItem('eden-admin-email') || '';
    try {
      const res = await fetch(`${API_URL}/admin/review`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Admin-Email': storedEmail
        },
        body: JSON.stringify({ userId, action })
      });
      if (!res.ok) {
        throw new Error('Action failed');
      }
      await fetchProfiles(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProfiles = profiles.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const statusCounts = {
    all: profiles.length,
    priority: profiles.filter(p => p.status === 'priority').length,
    pending: profiles.filter(p => p.status === 'pending').length,
    under_review: profiles.filter(p => p.status === 'under_review').length,
  };

  const getTimeRemaining = (deadline: string | null) => {
    if (!deadline) return null;
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return 'OVERDUE';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center p-4">
        <CustomCursor />
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl text-foreground mb-2">EDEN VALLEY</h1>
            <p className="text-muted-foreground text-sm">Admin Dashboard</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-3">
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="Admin email"
                className="w-full px-4 py-3 bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm rounded focus:outline-none focus:border-primary transition-colors"
                autoFocus
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin token"
                className="w-full px-4 py-3 bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm rounded focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}
            <button 
              type="submit" 
              disabled={!password.trim() || !adminEmail.trim()}
              className="w-full py-3 bg-primary text-background text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              ACCESS
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <CustomCursor />
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-lg text-foreground">EDEN VALLEY</h1>
            <span className="text-muted-foreground text-xs">ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => fetchProfiles(token)}
              disabled={loading}
              className="p-2 hover:bg-accent transition-colors rounded"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded flex items-center justify-between">
            <p className="text-destructive text-sm">{error}</p>
            <button onClick={() => setError(null)} className="text-destructive hover:text-destructive/80">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {(['all', 'priority', 'under_review', 'pending'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs rounded transition-colors ${
                  filter === f 
                    ? 'bg-primary text-background' 
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {f === 'all' ? 'All' : f === 'under_review' ? 'Review' : f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="ml-1.5 opacity-70">({statusCounts[f]})</span>
              </button>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">
            {filteredProfiles.length} profile{filteredProfiles.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading && profiles.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No profiles to review.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProfiles.map((profile) => (
              <div 
                key={profile.user_id} 
                className={`bg-card border rounded-lg overflow-hidden transition-colors ${
                  profile.status === 'priority' ? 'border-primary/50' : 'border-border'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">
                          {profile.first_name} {profile.last_name}
                        </h3>
                        <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wide rounded ${
                          profile.status === 'priority' 
                            ? 'bg-primary/20 text-primary' 
                            : profile.status === 'under_review'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {profile.status}
                        </span>
                        {profile.payment_status === 'paid' && (
                          <span className="px-2 py-0.5 text-[10px] uppercase tracking-wide rounded bg-green-500/20 text-green-500">
                            Paid
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm truncate">{profile.email}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="uppercase">{profile.role}</span>
                        {profile.type && profile.type !== 'funder' && (
                          <span>· {profile.type}</span>
                        )}
                        <span>· {new Date(profile.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {profile.status === 'priority' && profile.priority_deadline_at && (
                        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                          getTimeRemaining(profile.priority_deadline_at) === 'OVERDUE'
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          <Clock size={12} />
                          {getTimeRemaining(profile.priority_deadline_at)}
                        </div>
                      )}
                      <button
                        onClick={() => setExpandedProfile(expandedProfile === profile.user_id ? null : profile.user_id)}
                        className="p-2 hover:bg-accent transition-colors rounded"
                      >
                        {expandedProfile === profile.user_id ? <ChevronUp size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {expandedProfile === profile.user_id && (
                    <div className="mt-4 pt-4 border-t border-border">
                      {profile.vision && (
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Vision</p>
                          <p className="text-sm text-foreground">{profile.vision}</p>
                        </div>
                      )}
                      
                      {profile.proof_of_work && (
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Proof of Work</p>
                          <a 
                            href={profile.proof_of_work} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline break-all"
                          >
                            {profile.proof_of_work}
                          </a>
                        </div>
                      )}

                      {profile.proof_of_identity && (
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Proof of Identity</p>
                          <a 
                            href={profile.proof_of_identity} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline break-all"
                          >
                            {profile.proof_of_identity}
                          </a>
                        </div>
                      )}

                      {profile.investor_type && (
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Investor Type</p>
                          <p className="text-sm text-foreground">{profile.investor_type}</p>
                        </div>
                      )}

                      {profile.sectors && (
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Sectors</p>
                          <p className="text-sm text-foreground">{profile.sectors}</p>
                        </div>
                      )}

                      {profile.ticket_size && (
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Ticket Size</p>
                          <p className="text-sm text-foreground">{profile.ticket_size}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        {profile.status !== 'under_review' && profile.status !== 'accepted' && (
                          <button
                            onClick={() => handleAction(profile.user_id, 'start_review')}
                            disabled={actionLoading === profile.user_id}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 transition-colors rounded"
                          >
                            <Eye size={12} />
                            Start Review
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(profile.user_id, 'accept')}
                          disabled={actionLoading === profile.user_id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-500/20 text-green-500 hover:bg-green-500/30 transition-colors rounded disabled:opacity-50"
                        >
                          <Check size={12} />
                          Accept
                        </button>
                        <button
                          onClick={() => handleAction(profile.user_id, 'reject')}
                          disabled={actionLoading === profile.user_id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors rounded disabled:opacity-50"
                        >
                          <X size={12} />
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
