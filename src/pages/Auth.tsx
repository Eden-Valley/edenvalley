import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { authClient } from '@/auth';
import ParticleField from '@/components/ParticleField';

const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api');

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notAccepted, setNotAccepted] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    authClient.getSession().then((result) => {
      if (result.data?.session && result.data?.user) {
        navigate('/');
      }
    });
  }, [navigate]);

  const checkUserValidation = async (email: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/validate-user?email=${encodeURIComponent(email)}`);
      if (!res.ok) return false;
      const data = await res.json();
      return data.isValidated === true;
    } catch {
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotAccepted(false);

    try {
      const result = await authClient.signIn.email({ email, password });

      if (result.error) {
        setError(result.error.message.includes('401') ? 'Invalid email or password.' : result.error.message);
        setLoading(false);
        return;
      }

      const isValidated = await checkUserValidation(email);

      if (!isValidated) {
        setNotAccepted(true);
        await authClient.signOut();
        setLoading(false);
        return;
      }

      setLoading(false);
      navigate('/');
    } catch {
      setError('Unable to connect. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background overflow-hidden flex items-center justify-center">
      <ParticleField scrollVelocity={0.5} isScrolling={false} activeFrame={0} />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-10">
          <p className="font-display text-foreground tracking-[0.3em] text-2xl mb-2">
            {t('auth.edenValley')}
          </p>
          <div className="w-[60px] h-[1px] bg-primary/40 mx-auto my-4" />
        </div>

        {notAccepted ? (
          <div className="text-center space-y-6">
            <p className="font-display text-foreground text-xl tracking-wide">
              {t('auth.notAccepted')}
            </p>
            <p className="font-body text-muted-foreground text-sm leading-relaxed">
              {t('auth.notAcceptedDesc')}
            </p>
            <Link to="/" className="eden-btn inline-block px-10 py-3 text-sm tracking-[0.2em]">
              {t('auth.joinValley')}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-6 mb-8">
              <button
                onClick={() => { setIsSignUp(true); setError(null); }}
                className={`font-mono text-xs tracking-[0.3em] uppercase transition-colors duration-300 ${
                  isSignUp ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('auth.signUp')}
              </button>
              <span className="w-[1px] h-4 bg-muted-foreground/20" />
              <button
                onClick={() => { setIsSignUp(false); setError(null); }}
                className={`font-mono text-xs tracking-[0.3em] uppercase transition-colors duration-300 ${
                  !isSignUp ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('auth.signIn')}
              </button>
            </div>

            {isSignUp ? (
              <div className="text-center space-y-6">
                <p className="font-body text-muted-foreground text-sm leading-relaxed">
                  {t('auth.signUpDesc')}
                </p>
                <Link
                  to="/role"
                  className="eden-btn inline-block px-10 py-3 text-sm tracking-[0.2em]"
                >
                  {t('auth.discoverNature')}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSignIn} className="space-y-5">
                <div>
                  <input
                    type="email"
                    placeholder={t('auth.email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent border border-muted-foreground/20 px-4 py-3 text-foreground text-sm font-body placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors duration-300"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder={t('auth.password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-transparent border border-muted-foreground/20 px-4 py-3 text-foreground text-sm font-body placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors duration-300"
                  />
                </div>

                {error && (
                  <p className="text-eden-crimson text-xs font-mono tracking-wide text-center">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full eden-btn px-8 py-3 text-sm tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('auth.loading') : t('auth.signIn')}
                </button>
              </form>
            )}
          </>
        )}

        <div className="mt-10 text-center">
          <Link to="/" className="text-muted-foreground/30 text-xs tracking-widest hover:text-primary/60 transition-colors duration-300">
            ← {t('auth.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
