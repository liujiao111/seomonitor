import type { SeoReportResult } from '@/types/SeoReport';
import { auth } from '@clerk/nextjs/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { SeoReportPdf } from '@/features/reports/SeoReportPdf';
import { db } from '@/libs/DB';
import { seoReportSchema } from '@/models/Schema';
import { getUserPlan } from '@/utils/Subscription';

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const plan = await getUserPlan(userId);

  if (plan !== 'pro') {
    return NextResponse.json({ error: 'PDF download requires a Pro subscription' }, { status: 403 });
  }

  const { id } = await props.params;

  const report = await db.query.seoReportSchema.findFirst({
    where: eq(seoReportSchema.id, Number(id)),
  });

  if (!report || report.userId !== userId) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  const buffer = await renderToBuffer(
    SeoReportPdf({ report: report.reportData as SeoReportResult }),
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="seo-report-${report.domain}.pdf"`,
    },
  });
}
