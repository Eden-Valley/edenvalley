import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import ParticleField from '@/components/ParticleField';

const Auth = () => {
  const { t } = useLanguage();

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
