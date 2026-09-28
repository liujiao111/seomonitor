import { auth } from '@clerk/nextjs/server';
import { desc, eq } from 'drizzle-orm';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ScanForm } from '@/features/dashboard/ScanForm';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { db } from '@/libs/DB';
import { Link } from '@/libs/I18nNavigation';
import { seoReportSchema } from '@/models/Schema';
import { canCreateScan } from '@/utils/Subscription';

export default async function DashboardIndexPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'DashboardIndexPage',
  });

  const { userId } = await auth();
  const quota = await canCreateScan(userId!);

  const recentReports = await db.query.seoReportSchema.findMany({
    where: eq(seoReportSchema.userId, userId!),
    orderBy: [desc(seoReportSchema.createdAt)],
    limit: 5,
  });

  return (
    <>
      <TitleBar
        title={t('title_bar')}
        description={t('title_bar_description')}
      />

      <div className="rounded-xl border border-border p-6">
        <ScanForm
          allowed={quota.allowed}
          upgradeHref="/dashboard/billing"
          labels={{
            placeholder: t('domain_placeholder'),
            submit: t('submit_button'),
            quotaReached: t('quota_reached'),
            upgradeCta: t('upgrade_cta'),
          }}
        />

        {quota.limit !== null && (
          <p className="mt-3 text-sm text-muted-foreground">
            {t('usage_used', { used: quota.used, limit: quota.limit })}
          </p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">{t('recent_reports_title')}</h2>

        {recentReports.length === 0
          ? (
              <p className="text-sm text-muted-foreground">{t('no_reports_yet')}</p>
            )
          : (
              <ul className="space-y-2">
                {recentReports.map(report => (
                  <li key={report.id}>
                    <Link
                      href={`/dashboard/reports/${report.id}`}
                      className="
                        block rounded-md border border-border px-4 py-3 text-sm
                        hover:bg-muted
                      "
                    >
                      {report.domain}
                      {' '}
                      ·
                      {' '}
                      {report.createdAt.toLocaleDateString(locale)}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
      </div>
    </>
  );
};
