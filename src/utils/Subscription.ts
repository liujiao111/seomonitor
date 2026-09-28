import { and, eq, gte } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { seoReportSchema, subscriptionSchema } from '@/models/Schema';

export const FREE_MONTHLY_SCAN_LIMIT = 3;

const ACTIVE_STATUSES = new Set(['active', 'trialing']);

export const getSubscription = async (userId: string) => {
  return db.query.subscriptionSchema.findFirst({
    where: eq(subscriptionSchema.userId, userId),
  });
};

export const getUserPlan = async (userId: string): Promise<'free' | 'pro'> => {
  const subscription = await getSubscription(userId);

  if (subscription?.plan === 'pro' && ACTIVE_STATUSES.has(subscription.status)) {
    return 'pro';
  }

  return 'free';
};

export const getMonthlyScanCount = async (userId: string) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const reports = await db.query.seoReportSchema.findMany({
    where: and(
      eq(seoReportSchema.userId, userId),
      gte(seoReportSchema.createdAt, startOfMonth),
    ),
  });

  return reports.length;
};

// Pure decision logic, kept separate from the DB reads above so it can be unit tested without a database.
export const evaluateScanQuota = (plan: 'free' | 'pro', used: number) => {
  if (plan === 'pro') {
    return { allowed: true, plan, used: 0, limit: null } as const;
  }

  return {
    allowed: used < FREE_MONTHLY_SCAN_LIMIT,
    plan,
    used,
    limit: FREE_MONTHLY_SCAN_LIMIT,
  } as const;
};

export const canCreateScan = async (userId: string) => {
  const plan = await getUserPlan(userId);
  const used = plan === 'pro' ? 0 : await getMonthlyScanCount(userId);

  return evaluateScanQuota(plan, used);
};
