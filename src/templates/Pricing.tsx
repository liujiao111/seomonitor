'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { PricingCard } from '@/features/billing/PricingCard';
import { Section } from '@/features/landing/Section';
import { Link } from '@/libs/I18nNavigation';
import { AllPlans } from '@/utils/PricingPlans';

export const Pricing = () => {
  const t = useTranslations('Pricing');
  const [interval, setInterval] = useState<'month' | 'year'>('month');

  return (
    <Section
      subtitle={t('section_subtitle')}
      title={t('section_title')}
      description={t('section_description')}
    >
      <div className="mb-8 flex items-center justify-center gap-3">
        <Button
          variant={interval === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setInterval('month')}
        >
          {t('interval_monthly')}
        </Button>

        <Button
          variant={interval === 'year' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setInterval('year')}
        >
          {t('interval_yearly')}
        </Button>
      </div>

      <div className="
        grid grid-cols-1 gap-x-6 gap-y-8
        @xl:grid-cols-2
      "
      >
        {AllPlans.map(plan => (
          <PricingCard
            key={plan.name}
            plan={plan}
            interval={interval}
            button={(
              <Link
                className={buttonVariants({
                  size: 'sm',
                  className: 'w-full',
                })}
                href="/sign-up"
              >
                {t('button_text')}
              </Link>
            )}
          />
        ))}
      </div>
    </Section>
  );
};
