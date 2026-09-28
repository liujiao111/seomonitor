import type { EnumValues } from './Enum';
import type { PLAN_NAME } from '@/utils/PricingPlans';

type PlanName = EnumValues<typeof PLAN_NAME>;

// Keys of the `PricingFeatures` i18n namespace (see src/locales/en.json) — kept explicit so
// `useTranslations('PricingFeatures')` calls stay type-checked against a known plan's feature list.
export type PricingFeatureKey
  = | 'feature_monthly_scans'
    | 'feature_full_report'
    | 'feature_unlimited_scans'
    | 'feature_batch_scans'
    | 'feature_pdf_download'
    | 'feature_email_support';

export type PricingPlan = {
  name: PlanName;
  price: {
    month: number;
    year: number;
  };
  features: PricingFeatureKey[];
};
