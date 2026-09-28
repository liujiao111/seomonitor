import type { PricingPlan } from '@/types/Subscription';
import { useTranslations } from 'next-intl';
import { PricingFeatureList } from './PricingFeatureList';

export const PricingCard = (props: {
  plan: PricingPlan;
  interval: 'month' | 'year';
  button: React.ReactNode;
}) => {
  const tPlans = useTranslations('PricingPlans');
  const t = useTranslations('PricingCard');

  return (
    <div className="rounded-xl border border-border px-6 py-8 text-center">
      <div className="text-lg font-semibold">
        {tPlans(`${props.plan.name}_plan_name`)}
      </div>

      <div className="mt-3 flex items-center justify-center">
        <div className="text-5xl font-bold">
          {t('plan_price', { price: props.plan.price[props.interval] })}
        </div>

        <div className="ml-1 text-muted-foreground">
          {t(`plan_interval_${props.interval}`)}
        </div>
      </div>

      <div className="mt-2 mb-5 text-sm text-muted-foreground">
        {t(`${props.plan.name}_plan_description`)}
      </div>

      {props.button}

      <ul className="mt-8 space-y-3">
        <PricingFeatureList features={props.plan.features} />
      </ul>
    </div>
  );
};
