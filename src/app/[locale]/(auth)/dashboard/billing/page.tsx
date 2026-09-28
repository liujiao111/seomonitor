import { auth } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BillingActions } from '@/features/dashboard/BillingActions';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { getSubscription } from '@/utils/Subscription';

export default async function BillingPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'BillingPage',
  });

  const { userId } = await auth();
  const subscription = await getSubscription(userId!);
  const hasActiveSubscription = subscription?.plan === 'pro'
    && (subscription.status === 'active' || subscription.status === 'trialing');

  return (
    <>
      <TitleBar
        title={t('title_bar')}
        description={t('title_bar_description')}
      />

      <div className="rounded-xl border border-border p-6">
        <div className="mb-4">
          <div className="text-sm text-muted-foreground">{t('current_plan')}</div>
          <div className="text-2xl font-semibold">
            {hasActiveSubscription ? t('plan_pro') : t('plan_free')}
          </div>

          {hasActiveSubscription && subscription?.currentPeriodEnd && (
            <div className="text-sm text-muted-foreground">
              {t('renews_on', { date: subscription.currentPeriodEnd.toLocaleDateString(locale) })}
            </div>
          )}
        </div>

        <BillingActions
          hasActiveSubscription={Boolean(hasActiveSubscription)}
          labels={{
            upgradeMonthly: t('upgrade_monthly'),
            upgradeYearly: t('upgrade_yearly'),
            manageSubscription: t('manage_subscription'),
          }}
        />
      </div>
    </>
  );
};
