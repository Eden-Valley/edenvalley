import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import MinimalNav from '@/components/MinimalNav';

const FundBridge = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MinimalNav />

      {/* Main content wrapper - centers everything vertically */}
      <div className="flex-1 flex flex-col justify-center">
      
      {/* Hero Section */}
      <section className="flex items-center justify-center px-4 md:px-6 py-4 md:py-6">
        <div className="max-w-3xl text-center">
          <h1 className="font-display text-foreground text-2xl md:text-4xl lg:text-5xl leading-tight mb-3 md:mb-4" style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}>
            {t('fund.bridge.headline')}
          </h1>
          <p className="font-display text-muted-foreground text-lg md:text-xl lg:text-2xl mb-4 md:mb-6" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)' }}>
            {t('fund.bridge.subheadline')}
          </p>
          <p className="font-body text-muted-foreground text-sm md:text-base leading-relaxed px-2 md:px-0" style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)' }}>
            {t('fund.bridge.body')}
          </p>
        </div>
      </section>

      {/* Two Options */}
      <section className="flex items-center justify-center px-4 md:px-6 py-3 md:py-5 bg-secondary/5">
        <div className="max-w-5xl w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            {/* Crowd Option */}
            <div className="p-4 md:p-6 lg:p-8 border border-primary/20 rounded-sm flex flex-col">
              <h2 className="font-display text-foreground text-xl md:text-2xl mb-2 md:mb-4">
                {t('fund.crowd.title')}
              </h2>
              <p className="font-body text-muted-foreground text-sm md:text-base leading-relaxed mb-4 md:mb-6 lg:mb-8 flex-grow">
                {t('fund.crowd.desc')}
              </p>
              <Link
                to="/fund/crowd"
                className="eden-btn text-center py-2.5 md:py-3 lg:py-4 text-xs md:text-sm lg:text-base"
              >
                {t('fund.crowd.cta')}
              </Link>
            </div>

            {/* Pro Option */}
            <div className="p-4 md:p-6 lg:p-8 border border-primary/20 rounded-sm flex flex-col">
              <h2 className="font-display text-foreground text-xl md:text-2xl mb-2 md:mb-4">
                {t('fund.pro.title')}
              </h2>
              <p className="font-body text-muted-foreground text-sm md:text-base leading-relaxed mb-4 md:mb-6 lg:mb-8 flex-grow">
                {t('fund.pro.desc')}
              </p>
              <Link
                to="/fund/pro"
                className="eden-btn text-center py-2.5 md:py-3 lg:py-4 text-xs md:text-sm lg:text-base"
              >
                {t('fund.pro.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
};

export default FundBridge;
