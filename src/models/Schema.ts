import { jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// It automatically run the command `db-server:file`, which apply the migration before Next.js starts in development mode,
// Alternatively, if your database is running, you can run `npm run db:migrate` and there is no need to restart the server.

// Need a database for production? Check out https://get.neon.com/BMFYNtx
// Tested and compatible with SaaS Boilerplate

export const todoSchema = pgTable('todo', {
  id: serial('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Tracks each user's Stripe subscription. One row per Clerk user (billing is per-user, not per-organization).
export const subscriptionSchema = pgTable('subscription', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripePriceId: text('stripe_price_id'),
  plan: text('plan').notNull().default('free'), // 'free' | 'pro'
  status: text('status').notNull().default('active'), // mirrors Stripe subscription status
  interval: text('interval'), // 'month' | 'year'
  currentPeriodEnd: timestamp('current_period_end', { mode: 'date' }),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// One row per SEO scan. Free-plan monthly quota is derived by counting rows per user per calendar month.
export const seoReportSchema = pgTable('seo_report', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  domain: text('domain').notNull(),
  reportData: jsonb('report_data').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
