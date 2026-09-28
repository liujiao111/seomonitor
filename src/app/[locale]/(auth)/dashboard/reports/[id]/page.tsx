import type { SeoReportResult } from '@/types/SeoReport';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { db } from '@/libs/DB';
import { Link } from '@/libs/I18nNavigation';
import { seoReportSchema } from '@/models/Schema';
import { getUserPlan } from '@/utils/Subscription';

export default async function SeoReportPage(props: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'SeoReportPage',
  });

  const { userId } = await auth();

  const report = await db.query.seoReportSchema.findFirst({
    where: eq(seoReportSchema.id, Number(id)),
  });

  if (!report || report.userId !== userId) {
    notFound();
  }

  const plan = await getUserPlan(userId!);
  const data = report.reportData as SeoReportResult;

  return (
    <>
      <TitleBar title={data.domain} description={t('title_bar_description')} />

      <div className="rounded-xl border border-border p-6">
        <div className="text-4xl font-bold">
          {data.score}
          {' '}
          / 100
        </div>
        <p className="text-sm text-muted-foreground">{t('overall_score')}</p>
      </div>

      <div className="mt-6 space-y-6">
        {data.categories.map(category => (
          <div
            key={category.name}
            className="rounded-xl border border-border p-6"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{category.name}</h2>
              <span className="text-sm text-muted-foreground">
                {category.score}
                /100
              </span>
            </div>

            <ul className="space-y-3">
              {category.issues.map(issue => (
                <li key={issue.id} className="border-l-2 border-border pl-3">
                  <div className="text-sm font-medium">
                    {issue.severity}
                    {' '}
                    ·
                    {' '}
                    {issue.title}
                  </div>
                  <p className="text-sm text-muted-foreground">{issue.description}</p>
                  <p className="text-sm text-muted-foreground">{issue.recommendation}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6">
        {plan === 'pro'
          ? (
              <a
                href={`/api/seo/reports/${report.id}/pdf`}
                className="
                  inline-flex h-9 items-center justify-center rounded-md
                  bg-primary px-4 text-sm font-medium text-primary-foreground
                  hover:bg-primary/90
                "
              >
                {t('download_pdf')}
              </a>
            )
          : (
              <Link
                href="/dashboard/billing"
                className="
                  inline-flex h-9 items-center justify-center rounded-md
                  bg-primary px-4 text-sm font-medium text-primary-foreground
                  hover:bg-primary/90
                "
              >
                {t('upgrade_to_download')}
              </Link>
            )}
      </div>
    </>
  );
};
