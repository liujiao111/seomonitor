import type { PricingPlan } from '@/types/Subscription';

/** Pricing plans */
export const PLAN_NAME = {
  FREE: 'free',
  PRO: 'pro',
} as const;

/** Configuration for the Free subscription plan. */
const FreePlan: PricingPlan = {
  name: PLAN_NAME.FREE,
  price: { month: 0, year: 0 },
  features: [
    'feature_monthly_scans',
    'feature_full_report',
    'feature_email_support',
  ],
};

/** Configuration for the Pro subscription plan. */
const ProPlan: PricingPlan = {
  name: PLAN_NAME.PRO,
  price: { month: 29, year: 290 }, // Due to bugs in Alchemy.run, use a new `lookupKey` when changing price
  features: [
    'feature_unlimited_scans',
    'feature_full_report',
    'feature_batch_scans',
    'feature_pdf_download',
    'feature_email_support',
  ],
};

export const AllPlans = [FreePlan, ProPlan];
