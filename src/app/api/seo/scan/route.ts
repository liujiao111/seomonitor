import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { db } from '@/libs/DB';
import { scanDomain } from '@/libs/SeoBackend';
import { seoReportSchema } from '@/models/Schema';
import { canCreateScan } from '@/utils/Subscription';

const scanRequestSchema = z.object({
  domain: z.string().min(1).max(253),
});

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = scanRequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid domain' }, { status: 400 });
  }

  const quota = await canCreateScan(userId);

  if (!quota.allowed) {
    return NextResponse.json(
      { error: 'Monthly free scan limit reached', quota },
      { status: 402 },
    );
  }

  const reportData = await scanDomain(parsed.data.domain);

  const [report] = await db
    .insert(seoReportSchema)
    .values({ userId, domain: parsed.data.domain, reportData })
    .returning();

  return NextResponse.json({ reportId: report!.id });
}
