import type { PricingPlan } from '@/types/Subscription';
import { useTranslations } from 'next-intl';
import { PricingFeatureItem } from './PricingFeatureItem';

export const PricingFeatureList = (props: Pick<PricingPlan, 'features'>) => {
  const t = useTranslations('PricingFeatures');

  return (
    <>
      {props.features.map(feature => (
        <PricingFeatureItem key={feature}>{t(feature)}</PricingFeatureItem>
      ))}
    </>
  );
};
